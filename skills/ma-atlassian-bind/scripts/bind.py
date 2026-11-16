#!/usr/bin/env python3
# /// script
# requires-python = ">=3.11"
# ///
"""ma-atlassian-bind: bind, unbind or report the Jira and Confluence binding of the upstream skills.

The bind target table is `references/bind-targets.toml` (ma-agents F29, FR289-FR291, FR300; P5-11.4).

bind    For every slot (skill, table, key) of the table whose skill is installed in the skills folder, writes
        the key into `_bmad/custom/<skill>.toml`: inside its existing `[workflow]` / `[agent]` table (the header
        is created only when absent, marked `# ma-atlassian:created`), bracketed by the exact comment lines
        `# ma-atlassian:start <table>.<key>` and `# ma-atlassian:end`.
          - A key the user set (outside a marker pair, or as a scalar in `<skill>.user.toml`) is a collision:
            the whole file is left unchanged and the collision reported.
          - A key the installed `customize.toml` does not declare (or declares with another shape) is a missing
            slot: never written, reported; an earlier pair of ours for it is removed.
          - A file that does not parse, or holds malformed, nested, duplicated or unbalanced ma-atlassian
            markers, is reported and left unchanged.
          - Bind validates its own output on every target, with or without a `workflow.md`: the new text must
            parse and keep every other value, and after the write `resolve_customization.py` (the project's
            `_bmad/scripts/`) must return each written value; otherwise the file is restored and reported.
          - Then the store starter goes into `_bmad/custom/ticketing-store-config.toml`, key by key, only keys
            the file does not yet define, the same marker pairs around each.
        Idempotent; every byte outside its own lines is kept, line endings included.
unbind  Removes every marker pair (and every `# ma-atlassian:created` header left empty) from `_bmad/custom/*.toml`;
        a bind then unbind restores each file byte for byte, and a file bind created is deleted.
status  The two destinations, every empty required answer ("unbound: missing answer <key>"), and per slot:
        bound / outdated / unbound / collision / slot missing / not installed / refused; then the store file.

Module answers are read only through `_bmad/scripts/resolve_config.py` (`modules.ma-atlassian.*`).

Usage (from `{skill-root}/scripts/bind.py`):
  uv run --no-cache bind.py {bind|unbind|status} --project-root DIR [--skills-root DIR] [--starter FILE] [--targets FILE]
Exit: 0 done; 1 a target was left unbound by a collision, an unparsable file, refused markers, a failed
validation or a missing starter (unbind: a refused file); 2 a prerequisite is missing (no BMad setup, uv,
table, or an empty required answer for bind).
"""

from __future__ import annotations

import argparse
import json
import re
import shutil
import subprocess
import sys
import tomllib
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

sys.dont_write_bytecode = True

MODULE = "ma-atlassian"
ANSWER_PREFIX = "modules." + MODULE + "."
ANSWER_KEYS = (
    "jira_site", "jira_project_key", "jira_mcp_server", "confluence_site", "confluence_mcp_server",
    "planning_space", "planning_root_page", "tickets_space", "tickets_root_page",
)
REQUIRED = ("jira_site", "jira_project_key", "confluence_site", "planning_space")
START = "# ma-atlassian:start "
END = "# ma-atlassian:end"
CREATED = "  # ma-atlassian:created"
MARKER_WORD = "ma-atlassian:"
SKILL_NAME = "ma-atlassian-bind"
BARE = re.compile(r"^[A-Za-z0-9_-]+$")
PLACEHOLDER = re.compile(r"\{([a-z][a-z0-9_]*)\}")


class Prerequisite(RuntimeError):
    pass


class Refused(RuntimeError):
    """A file is left unchanged: it does not parse, or its ma-atlassian markers are ambiguous."""


class DataError(Prerequisite):
    pass


# ------------------------------------------------------------------ text model (byte-preserving)


def split_lines(text: str) -> list[list[str]]:
    """Lines as [text, eol]; eol is '\\r\\n', '\\n' or '' (last line only)."""
    lines: list[list[str]] = []
    pos = 0
    for match in re.finditer(r"\r?\n", text):
        lines.append([text[pos:match.start()], match.group(0)])
        pos = match.end()
    if pos < len(text):
        lines.append([text[pos:], ""])
    return lines


def join_lines(lines: list[list[str]]) -> str:
    return "".join(t + e for t, e in lines)


def first_eol(lines: list[list[str]]) -> str:
    for _, eol in lines:
        if eol:
            return eol
    return "\n"


def insert_after(lines: list[list[str]], index: int, texts: list[str], eol: str) -> None:
    """Insert whole lines after line `index` (-1: at the start). A last line without a line ending gets one,
    and the last inserted line goes without, so the file keeps its 'no final newline' shape."""
    if not texts:
        return
    items = [[t, eol] for t in texts]
    if 0 <= index == len(lines) - 1 and lines[index][1] == "":
        lines[index][1] = eol
        items[-1][1] = ""
    lines[index + 1:index + 1] = items


def delete_range(lines: list[list[str]], first: int, last: int) -> None:
    """Delete lines first..last; the inverse of insert_after (a final line without ending passes its shape up)."""
    at_end = last == len(lines) - 1 and lines[last][1] == ""
    del lines[first:last + 1]
    if at_end and first > 0:
        lines[first - 1][1] = ""


# ------------------------------------------------------------------ TOML statement scanner

_KEYPART = r'(?:[A-Za-z0-9_-]+|"[^"\n]*"|\'[^\'\n]*\')'
_KEY_RE = re.compile(rf"^\s*({_KEYPART}(?:\s*\.\s*{_KEYPART})*)\s*=")
_HEADER_RE = re.compile(rf"^\s*(\[\[?)\s*({_KEYPART}(?:\s*\.\s*{_KEYPART})*)\s*(\]\]?)\s*(?:#.*)?$")


def _parts(text: str) -> list[str]:
    return [p.strip().strip("\"'") for p in re.findall(_KEYPART, text)]


def _escaped(text: str, index: int) -> bool:
    count, j = 0, index - 1
    while j >= 0 and text[j] == "\\":
        count += 1
        j -= 1
    return count % 2 == 1


class _ValueState:
    """Tracks open brackets and multi-line strings of a value across lines (comments end a line)."""

    def __init__(self) -> None:
        self.depth = 0
        self.multiline: str | None = None

    def feed(self, text: str) -> None:
        i, n = 0, len(text)
        while i < n:
            if self.multiline:
                close = text.find(self.multiline, i)
                while close != -1 and self.multiline == '"""' and _escaped(text, close):
                    close = text.find(self.multiline, close + 1)
                if close == -1:
                    return
                i = close + 3
                while i < n and text[i] == self.multiline[0]:
                    i += 1
                self.multiline = None
                continue
            ch = text[i]
            if ch == "#":
                return
            if ch in "\"'":
                if text.startswith(ch * 3, i):
                    self.multiline = ch * 3
                    i += 3
                    continue
                j = i + 1
                while j < n and not (text[j] == ch and (ch == "'" or not _escaped(text, j))):
                    j += 1
                i = j + 1
                continue
            if ch in "[{":
                self.depth += 1
            elif ch in "]}":
                self.depth -= 1
            i += 1

    @property
    def open(self) -> bool:
        return self.depth > 0 or self.multiline is not None


@dataclass
class Stmt:
    kind: str  # key | header | start | end | comment
    first: int
    last: int
    table: str = ""
    path: str = ""
    array: bool = False


def scan(lines: list[list[str]]) -> list[Stmt]:
    out: list[Stmt] = []
    table = ""
    i = 0
    while i < len(lines):
        raw = lines[i][0]
        stripped = raw.strip()
        index = i
        i += 1
        if not stripped:
            continue
        if stripped.startswith("#"):
            if raw == END:
                out.append(Stmt("end", index, index, table))
            elif raw.startswith(START) and BARE_PATH.match(raw[len(START):]):
                out.append(Stmt("start", index, index, table, raw[len(START):]))
            elif MARKER_WORD in stripped:
                raise Refused(f"line {index + 1} is not an exact ma-atlassian marker line: {stripped}")
            else:
                out.append(Stmt("comment", index, index, table))
            continue
        header = _HEADER_RE.match(raw)
        if header:
            table = ".".join(_parts(header.group(2)))
            out.append(Stmt("header", index, index, table, table, header.group(1) == "[["))
            continue
        key = _KEY_RE.match(raw)
        if not key:
            continue
        path = ".".join(([table] if table else []) + _parts(key.group(1)))
        state = _ValueState()
        state.feed(raw[key.end():])
        last = index
        while state.open and i < len(lines):
            state.feed(lines[i][0])
            last = i
            i += 1
        out.append(Stmt("key", index, last, table, path))
    return out


BARE_PATH = re.compile(r"^[A-Za-z0-9_-]+(?:\.[A-Za-z0-9_-]+)*$")


@dataclass
class Pair:
    path: str
    first: int  # start marker line
    last: int  # end marker line


def find_pairs(stmts: list[Stmt]) -> dict[str, Pair]:
    pairs: dict[str, Pair] = {}
    open_start: Stmt | None = None
    inside: list[Stmt] = []
    for st in stmts:
        if st.kind == "start":
            if open_start is not None:
                raise Refused(f"marker for {st.path} at line {st.first + 1} opens inside the pair of line {open_start.first + 1}")
            open_start, inside = st, []
        elif st.kind == "end":
            if open_start is None:
                raise Refused(f"end marker at line {st.first + 1} has no start marker")
            keys = [s for s in inside if s.kind == "key"]
            if any(s.kind == "header" for s in inside) or len(keys) != 1 or keys[0].path != open_start.path:
                raise Refused(f"the pair for {open_start.path} at line {open_start.first + 1} does not bracket exactly that one key")
            if open_start.path in pairs:
                raise Refused(f"{open_start.path} is bracketed twice")
            pairs[open_start.path] = Pair(open_start.path, open_start.first, st.first)
            open_start = None
        elif open_start is not None:
            inside.append(st)
    if open_start is not None:
        raise Refused(f"start marker for {open_start.path} at line {open_start.first + 1} has no end marker")
    return pairs


# ------------------------------------------------------------------ values


def _escape(text: str, multiline: bool) -> str:
    out = []
    for ch in text:
        code = ord(ch)
        if ch == "\\":
            out.append("\\\\")
        elif ch == '"':
            out.append('\\"')
        elif ch == "\n":
            out.append("\n" if multiline else "\\n")
        elif ch == "\t":
            out.append("\\t")
        elif ch == "\r":
            out.append("\\r")
        elif code < 0x20 or code == 0x7F:
            out.append(f"\\u{code:04X}")
        else:
            out.append(ch)
    return "".join(out)


def toml_value(value: Any) -> str:
    """TOML text of a value; may span lines (joined with '\\n'; the caller splits)."""
    if isinstance(value, bool):
        return "true" if value else "false"
    if isinstance(value, (int, float)):
        return repr(value)
    if isinstance(value, str):
        if "\n" in value:
            return '"""\n' + _escape(value, True) + '"""'
        return '"' + _escape(value, False) + '"'
    if isinstance(value, list):
        if not value:
            return "[]"
        return "[\n" + "".join(f"  {toml_value(item)},\n" for item in value) + "]"
    raise DataError(f"cannot write a value of type {type(value).__name__}")


def key_lines(key: str, value: Any) -> list[str]:
    return f"{key} = {toml_value(value)}".split("\n")


def lookup(data: Any, path: str) -> tuple[bool, Any]:
    node = data
    for part in path.split("."):
        if not isinstance(node, dict) or part not in node:
            return False, None
        node = node[part]
    return True, node


def leaves(table: dict[str, Any], prefix: str = "") -> list[tuple[str, Any]]:
    out: list[tuple[str, Any]] = []
    for key, value in table.items():
        path = f"{prefix}{key}"
        if isinstance(value, dict):
            out.extend(leaves(value, f"{path}."))
        else:
            out.append((path, value))
    return out


def split_path(path: str) -> tuple[str, str]:
    table, _, key = path.rpartition(".")
    return table, key


def contains(resolved: Any, ours: Any) -> bool:
    if isinstance(ours, list):
        return isinstance(resolved, list) and all(item in resolved for item in ours)
    return resolved == ours


# ------------------------------------------------------------------ one file: plan a bind or an unbind


@dataclass
class Want:
    path: str
    value: Any


@dataclass
class Plan:
    text: str | None  # new text; None = no file
    actions: dict[str, str] = field(default_factory=dict)  # path -> written | updated | unchanged | collision | kept | removed
    changed: bool = False


def parse(text: str | None, what: str) -> dict[str, Any]:
    if text is None:
        return {}
    try:
        return tomllib.loads(text)
    except tomllib.TOMLDecodeError as error:
        raise Refused(f"{what} does not parse as TOML: {error}") from None


def section_end(stmts: list[Stmt], header_line: int) -> int | None:
    """Line after which a key of the table that `header_line` opens is inserted (-1 for the root table)."""
    last = header_line
    for st in stmts:
        if st.first <= header_line:
            continue
        if st.kind == "header":
            break
        if st.kind in ("key", "end"):
            last = max(last, st.last)
    return last


def insert_key(lines: list[list[str]], path: str, value: Any, eol: str) -> None:
    table, key = split_path(path)
    block = [START + path, *key_lines(key, value), END]
    stmts = scan(lines)
    if table == "":
        root = [st for st in stmts if st.kind in ("key", "end") and st.table == "" and
                not any(h.kind == "header" and h.first < st.first for h in stmts)]
        first_header = next((st.first for st in stmts if st.kind == "header"), None)
        if root:
            insert_after(lines, max(st.last for st in root), block, eol)
        elif first_header is not None:
            insert_after(lines, first_header - 1, block, eol)
        else:
            insert_after(lines, len(lines) - 1, block, eol)
        return
    header = next((st for st in stmts if st.kind == "header" and not st.array and st.path == table), None)
    if header is not None:
        insert_after(lines, section_end(stmts, header.first), block, eol)
        return
    created = ([""] if lines else []) + [f"[{table}]{CREATED}"] + block
    insert_after(lines, len(lines) - 1, created, eol)


def plan_bind(text: str | None, wants: list[Want], stale: list[str], store: bool, user_layer: dict | None = None) -> Plan:
    """Bind `wants` into `text`. Skill file (`store` False): one collision leaves the whole file unchanged.
    Store file: a key the file defines is kept. `stale`: paths whose pair of ours is removed."""
    data = parse(text, "the file")
    lines = split_lines(text or "")
    pairs = find_pairs(scan(lines))
    plan = Plan(text)
    for want in wants:
        if want.path in pairs:
            _, current = lookup(data, want.path)
            plan.actions[want.path] = "unchanged" if current == want.value else "updated"
            continue
        defined, _ = lookup(data, want.path)
        masked = False
        if user_layer is not None:
            in_user, user_value = lookup(user_layer, want.path)
            masked = in_user and not (isinstance(user_value, list) and isinstance(want.value, list))
        if defined or masked:
            plan.actions[want.path] = "kept" if store else ("collision" if defined else "collision (user layer)")
        else:
            plan.actions[want.path] = "written"
    if not store and any(a.startswith("collision") for a in plan.actions.values()):
        return plan
    eol = first_eol(lines)
    for path in stale:
        if path in pairs:
            plan.actions[path] = "removed"
    # removals and updates first, bottom-up, so line numbers above stay valid
    for path in sorted((p for p, a in plan.actions.items() if a in ("removed", "updated")),
                       key=lambda p: pairs[p].first, reverse=True):
        pair = pairs[path]
        if plan.actions[path] == "removed":
            delete_range(lines, pair.first, pair.last)
            continue
        want = next(w for w in wants if w.path == path)
        _, key = split_path(path)
        block = [START + path, *key_lines(key, want.value), END]
        line_eol, tail = lines[pair.first][1], lines[pair.last][1]
        items = [[t, line_eol] for t in block]
        items[-1][1] = tail
        lines[pair.first:pair.last + 1] = items
    for want in wants:
        if plan.actions[want.path] == "written":
            insert_key(lines, want.path, want.value, eol)
    removed_created(lines)
    new = join_lines(lines)
    if text is None and new == "":
        return plan
    if new != (text or ""):
        verify(data, new, {w.path: w.value for w in wants if plan.actions[w.path] in ("written", "updated", "unchanged")},
               [p for p, a in plan.actions.items() if a == "removed"])
        plan.text, plan.changed = new, True
    return plan


def verify(old: dict, new_text: str, ours: dict[str, Any], removed: list[str]) -> None:
    """Bind's own output: parses, holds each owned value, keeps every other value of the file."""
    try:
        new = tomllib.loads(new_text)
    except tomllib.TOMLDecodeError as error:
        raise Refused(f"the bound file would not parse ({error}); left unchanged") from None
    for path, value in ours.items():
        found, got = lookup(new, path)
        if not found or got != value:
            raise Refused(f"the bound file would not hold {path}; left unchanged")
    for path, value in leaves(old):
        if path in ours or path in removed:
            continue
        found, got = lookup(new, path)
        if not found or got != value:
            raise Refused(f"binding would change {path}; left unchanged")


def removed_created(lines: list[list[str]]) -> int:
    """Remove each `# ma-atlassian:created` header whose table holds nothing but blank lines, bottom-up, with
    the blank line bind put before it. Returns the number removed."""
    count = 0
    while True:
        stmts = scan(lines)
        headers = [st for st in stmts if st.kind == "header" and lines[st.first][0] == f"[{st.path}]{CREATED}"]
        target = None
        for header in reversed(headers):
            nxt = next((st.first for st in stmts if st.kind == "header" and st.first > header.first), len(lines))
            if all(not lines[i][0].strip() for i in range(header.first + 1, nxt)):
                target = header
                break
        if target is None:
            return count
        at = target.first
        delete_range(lines, at, at)
        before_blank = at > 0 and lines[at - 1][0] == ""
        after_blank_or_absent = at >= len(lines) or lines[at][0] == ""
        if before_blank and after_blank_or_absent:
            delete_range(lines, at - 1, at - 1)
        count += 1


def plan_unbind(text: str) -> Plan:
    parse(text, "the file")
    lines = split_lines(text)
    pairs = find_pairs(scan(lines))
    plan = Plan(text)
    for pair in sorted(pairs.values(), key=lambda p: p.first, reverse=True):
        delete_range(lines, pair.first, pair.last)
        plan.actions[pair.path] = "removed"
    headers = removed_created(lines)
    new = join_lines(lines)
    if new != text:
        try:
            tomllib.loads(new)
        except tomllib.TOMLDecodeError as error:
            raise Refused(f"unbinding would leave invalid TOML ({error}); left unchanged") from None
        plan.text, plan.changed = new, True
    if headers:
        plan.actions["(created headers)"] = str(headers)
    return plan


# ------------------------------------------------------------------ file I/O


def read_text(path: Path) -> str | None:
    if not path.exists():
        return None
    try:
        return path.read_bytes().decode("utf-8")
    except UnicodeDecodeError as error:
        raise Refused(f"{path.name} is not UTF-8 ({error})") from None


def write_text(path: Path, text: str | None) -> None:
    if text is None or text == "":
        path.unlink(missing_ok=True)
        return
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(text.encode("utf-8"))


# ------------------------------------------------------------------ the table, the answers, the context


@dataclass
class Slot:
    skill: str
    table: str
    key: str
    role: str
    form: str
    texts: list[str]

    @property
    def path(self) -> str:
        return f"{self.table}.{self.key}"


@dataclass
class Table:
    slots: list[Slot]
    texts: dict[str, str]
    variables: dict[str, str]
    store_file: str
    store_starter: str
    store_answers: dict[str, str]


def load_table(path: Path) -> Table:
    if not path.is_file():
        raise Prerequisite(f"bind target table {path} not found; reinstall the {MODULE} module")
    try:
        data = tomllib.loads(path.read_text(encoding="utf-8"))
    except (OSError, tomllib.TOMLDecodeError) as error:
        raise DataError(f"bind target table {path}: {error}") from None
    texts = data.get("text", {})
    variables = data.get("vars", {})
    slots = []
    for row in data.get("slot", []):
        names = row.get("text")
        names = [names] if isinstance(names, str) else list(names or [])
        slot = Slot(row["skill"], row["table"], row["key"], row.get("role", ""), row.get("form", ""), names)
        if slot.table not in ("workflow", "agent") or not BARE.match(slot.key) or slot.form not in ("list", "string"):
            raise DataError(f"bind target table: bad slot {row}")
        if not names or any(n not in texts for n in names) or (slot.form == "string" and len(names) != 1):
            raise DataError(f"bind target table: slot {slot.skill} {slot.path} names unknown or too many texts {names}")
        slots.append(slot)
    store = data.get("store", {})
    return Table(slots, texts, variables, store.get("file", "ticketing-store-config.toml"),
                 store.get("starter", "config/jira-onprem-ticketing.toml"), dict(store.get("answers", {})))


def derived(answers: dict[str, str]) -> dict[str, str]:
    def root(page: str) -> str:
        return f'the page "{page}"' if page else "the page named for the project"

    return {
        "jira_site": answers["jira_site"],
        "jira_project_key": answers["jira_project_key"],
        "confluence_site": answers["confluence_site"],
        "planning_space": answers["planning_space"],
        "tickets_space": answers["tickets_space"] or answers["planning_space"],
        "planning_root": root(answers["planning_root_page"]),
        "tickets_root": root(answers["tickets_root_page"]),
    }


def expand(template: str, table: Table, values: dict[str, str]) -> str:
    def var(match: re.Match) -> str:
        name = match.group(1)
        return table.variables[name] if name in table.variables else match.group(0)

    text = PLACEHOLDER.sub(var, template)

    def answer(match: re.Match) -> str:
        name = match.group(1)
        if name not in values:
            raise DataError(f"bind target table: unknown placeholder {{{name}}}")
        return values[name]

    return PLACEHOLDER.sub(answer, text)


def slot_value(slot: Slot, table: Table, values: dict[str, str]) -> Any:
    items = [expand(table.texts[name], table, values) for name in slot.texts]
    return items if slot.form == "list" else items[0]


@dataclass
class Context:
    project: Path
    skills_root: Path
    starter: Path
    table: Table
    uv: str

    @property
    def custom(self) -> Path:
        return self.project / "_bmad" / "custom"

    @property
    def scripts(self) -> Path:
        return self.project / "_bmad" / "scripts"


def run_script(ctx: Context, script: str, args: list[str]) -> subprocess.CompletedProcess:
    path = ctx.scripts / script
    if not path.is_file():
        raise Prerequisite(f"{path} not found: BMad is not set up in this project; ask bmad to run setup")
    return subprocess.run([ctx.uv, "run", "--no-cache", str(path), *args], capture_output=True, text=True,
                          encoding="utf-8", errors="replace", stdin=subprocess.DEVNULL, check=False)


def read_answers(ctx: Context) -> dict[str, str]:
    args = ["--project-root", str(ctx.project)]
    for key in ANSWER_KEYS:
        args += ["--key", ANSWER_PREFIX + key]
    result = run_script(ctx, "resolve_config.py", args)
    if result.returncode != 0:
        raise Prerequisite(f"resolve_config.py exited {result.returncode}: {(result.stderr or result.stdout).strip()}")
    data = json.loads(result.stdout)
    answers = {}
    for key in ANSWER_KEYS:
        value = data.get(ANSWER_PREFIX + key, "")
        answers[key] = value.strip() if isinstance(value, str) else ""
    return answers


def installed_defaults(ctx: Context, skill: str) -> dict | None:
    path = ctx.skills_root / skill / "customize.toml"
    if not path.is_file():
        return None
    try:
        return tomllib.loads(path.read_text(encoding="utf-8"))
    except (OSError, tomllib.TOMLDecodeError):
        return None


def slot_declared(defaults: dict, slot: Slot) -> bool:
    """The installed customize.toml declares the key, with the shape the table writes."""
    found, default = lookup(defaults, slot.path)
    if not found:
        return False
    return isinstance(default, list) if slot.form == "list" else isinstance(default, str)


def by_skill(slots: list[Slot]) -> dict[str, list[Slot]]:
    groups: dict[str, list[Slot]] = {}
    for slot in slots:
        groups.setdefault(slot.skill, []).append(slot)
    return groups


def user_layer(ctx: Context, skill: str) -> dict | None:
    path = ctx.custom / f"{skill}.user.toml"
    try:
        text = read_text(path)
        return tomllib.loads(text) if text is not None else None
    except (Refused, tomllib.TOMLDecodeError):
        return None  # the resolver reports it when bind validates its output


def resolver_holds(ctx: Context, skill: str, ours: dict[str, Any]) -> str | None:
    """None when resolve_customization.py returns every value of `ours`; else the reason."""
    args = ["--skill", str(ctx.skills_root / skill), "--project-root", str(ctx.project)]
    for path in ours:
        args += ["--key", path]
    result = run_script(ctx, "resolve_customization.py", args)
    if result.returncode != 0:
        return f"resolve_customization.py exited {result.returncode}: {(result.stderr or result.stdout).strip()}"
    try:
        resolved = json.loads(result.stdout)
    except json.JSONDecodeError:
        return "resolve_customization.py printed no JSON"
    lost = [p for p, v in ours.items() if p not in resolved or not contains(resolved[p], v)]
    return f"resolve_customization.py does not return {', '.join(lost)}" if lost else None


def rel(ctx: Context, path: Path) -> str:
    try:
        return path.relative_to(ctx.project).as_posix()
    except ValueError:
        return path.as_posix()


# ------------------------------------------------------------------ store starter


def starter_wants(ctx: Context, answers: dict[str, str]) -> list[Want]:
    if not ctx.starter.is_file():
        raise FileNotFoundError(str(ctx.starter))
    try:
        data = tomllib.loads(ctx.starter.read_text(encoding="utf-8"))
    except tomllib.TOMLDecodeError as error:
        raise DataError(f"store starter {ctx.starter} does not parse: {error}") from None
    wants = []
    for path, value in leaves(data):
        if not all(BARE.match(part) for part in path.split(".")):
            raise DataError(f"store starter key {path!r} is not a bare dotted key")
        if path in ctx.table.store_answers:
            value = answers[ctx.table.store_answers[path]]
        wants.append(Want(path, value))
    return wants


# ------------------------------------------------------------------ commands


def cmd_bind(ctx: Context, out) -> int:
    answers = read_answers(ctx)
    missing = [k for k in REQUIRED if not answers[k]]
    if missing:
        for key in missing:
            out(f"unbound: missing answer {key}")
        out(f"bind: nothing written; answer {', '.join(missing)} (ask bmad to run setup {MODULE})")
        return 2
    values = derived(answers)
    problems = 0
    counts = {"bound": 0, "collision": 0, "missing": 0, "absent": 0, "refused": 0}
    for skill, slots in by_skill(ctx.table.slots).items():
        defaults = installed_defaults(ctx, skill)
        if defaults is None:
            for slot in slots:
                out(f"{skill} [{slot.table}] {slot.key}: not installed")
                counts["absent"] += 1
            continue
        wants, stale, missing_slots = [], [], []
        for slot in slots:
            if slot_declared(defaults, slot):
                wants.append(Want(slot.path, slot_value(slot, ctx.table, values)))
            else:
                stale.append(slot.path)
                missing_slots.append(slot)
        path = ctx.custom / f"{skill}.toml"
        try:
            text = read_text(path)
            plan = plan_bind(text, wants, stale, store=False, user_layer=user_layer(ctx, skill))
        except Refused as error:
            for slot in slots:
                out(f"{skill} [{slot.table}] {slot.key}: refused ({rel(ctx, path)}: {error})")
            counts["refused"] += 1
            problems += 1
            continue
        collided = any(a.startswith("collision") for a in plan.actions.values())
        invalid = None
        if plan.changed:
            write_text(path, plan.text)
            ours = {w.path: w.value for w in wants}
            invalid = resolver_holds(ctx, skill, ours) if ours else None
            if invalid:
                write_text(path, text)  # restore the file as it was (or remove the one bind created)
        for slot in slots:
            if slot in missing_slots:
                note = " (stale pair removed)" if plan.actions.get(slot.path) == "removed" and not invalid else ""
                out(f"{skill} [{slot.table}] {slot.key}: slot missing (the installed customize.toml does not declare it as a {slot.form}){note}")
                counts["missing"] += 1
                continue
            action = plan.actions[slot.path]
            if invalid:
                out(f"{skill} [{slot.table}] {slot.key}: refused ({invalid}; file restored)")
            elif collided:
                state = action if action.startswith("collision") else "not written (the file has a collision)"
                where = f"{skill}.user.toml" if action == "collision (user layer)" else rel(ctx, path)
                out(f"{skill} [{slot.table}] {slot.key}: {state}" + (f" (user value in {where}; file unchanged)" if action.startswith("collision") else ""))
            else:
                out(f"{skill} [{slot.table}] {slot.key}: {action}")
                counts["bound"] += 1
        if invalid:
            counts["refused"] += 1
            problems += 1
        elif collided:
            counts["collision"] += 1
            problems += 1
    store_path = ctx.custom / ctx.table.store_file
    try:
        wants = starter_wants(ctx, answers)
        text = read_text(store_path)
        plan = plan_bind(text, wants, [], store=True)
        if plan.changed:
            write_text(store_path, plan.text)
        acts = plan.actions
        written = [p for p, a in acts.items() if a == "written"]
        updated = [p for p, a in acts.items() if a == "updated"]
        kept = [p for p, a in acts.items() if a == "kept"]
        line = f"{ctx.table.store_file}: {len(written)} key(s) written, {len(updated)} updated, " \
               f"{sum(1 for a in acts.values() if a == 'unchanged')} unchanged, {len(kept)} kept (user value)"
        out(line + (f": {', '.join(kept)}" if kept else ""))
    except FileNotFoundError as error:
        out(f"{ctx.table.store_file}: starter missing ({error}); the store file is not written")
        problems += 1
    except Refused as error:
        out(f"{ctx.table.store_file}: refused ({error})")
        problems += 1
    out(f"bind: {counts['bound']} slot(s) bound, {counts['collision']} target(s) with a collision, "
        f"{counts['missing']} slot(s) missing, {counts['absent']} slot(s) not installed, {counts['refused']} target(s) refused")
    return 1 if problems else 0


def cmd_unbind(ctx: Context, out) -> int:
    problems = 0
    files = sorted(p for p in ctx.custom.glob("*.toml") if p.is_file()) if ctx.custom.is_dir() else []
    touched = 0
    for path in files:
        try:
            text = read_text(path)
        except Refused as error:
            out(f"{rel(ctx, path)}: refused ({error})")
            problems += 1
            continue
        if text is None or MARKER_WORD not in text:
            continue
        try:
            plan = plan_unbind(text)
        except Refused as error:
            out(f"{rel(ctx, path)}: refused ({error})")
            problems += 1
            continue
        removed = [p for p, a in plan.actions.items() if a == "removed"][::-1]  # file order
        if not plan.changed:
            continue
        touched += 1
        write_text(path, plan.text)
        state = "deleted (nothing else was in it)" if not plan.text else "removed"
        out(f"{rel(ctx, path)}: {state} {', '.join(removed) if removed else 'an empty created header'}")
    out(f"unbind: {touched} file(s) changed" + ("" if touched else "; nothing was bound"))
    return 1 if problems else 0


def cmd_status(ctx: Context, out) -> int:
    answers = read_answers(ctx)
    values = derived(answers)
    planning_root = answers["planning_root_page"] or "(empty: a page named for the project)"
    tickets_root = answers["tickets_root_page"] or "(empty: a page named for the project)"
    tickets_space = answers["tickets_space"] or (f"{answers['planning_space']} (empty: the planning space)"
                                                 if answers["planning_space"] else "(empty: the planning space)")
    out(f"destination planning: site {answers['confluence_site'] or '(empty)'}, space {answers['planning_space'] or '(empty)'}, root page {planning_root}")
    out(f"destination tickets: site {answers['confluence_site'] or '(empty)'}, space {tickets_space}, root page {tickets_root}")
    missing = [k for k in REQUIRED if not answers[k]]
    for key in missing:
        out(f"unbound: missing answer {key}")
    unbound = len(missing)
    for skill, slots in by_skill(ctx.table.slots).items():
        defaults = installed_defaults(ctx, skill)
        path = ctx.custom / f"{skill}.toml"
        state_of: dict[str, str] = {}
        try:
            text = read_text(path)
            data = parse(text, rel(ctx, path))
            pairs = find_pairs(scan(split_lines(text or "")))
            user = user_layer(ctx, skill)
        except Refused as error:
            text, data, pairs, user = None, None, None, None
            refusal = str(error)
        for slot in slots:
            if defaults is None:
                state = "not installed"
            elif not slot_declared(defaults, slot):
                state = "slot missing"
            elif data is None:
                state = f"refused ({refusal})"
            elif slot.path in pairs:
                _, current = lookup(data, slot.path)
                state = "bound" if current == slot_value(slot, ctx.table, values) else "outdated (answers changed; re-run bind)"
            elif lookup(data, slot.path)[0]:
                state = f"collision (user value in {rel(ctx, path)})"
            elif user is not None and lookup(user, slot.path)[0] and not (slot.form == "list" and isinstance(lookup(user, slot.path)[1], list)):
                state = f"collision (user value in {skill}.user.toml)"
            else:
                state = "unbound"
            state_of[slot.path] = state
            if state not in ("bound", "not installed"):
                unbound += 1
            out(f"{skill} [{slot.table}] {slot.key}: {state}  -- {slot.role}")
    store_path = ctx.custom / ctx.table.store_file
    try:
        wants = starter_wants(ctx, answers)
        text = read_text(store_path)
        data = parse(text, ctx.table.store_file)
        pairs = find_pairs(scan(split_lines(text or "")))
        ours = [w for w in wants if w.path in pairs]
        stale = [w.path for w in ours if lookup(data, w.path)[1] != w.value]
        kept = [w.path for w in wants if w.path not in pairs and lookup(data, w.path)[0]]
        absent = [w.path for w in wants if w.path not in pairs and not lookup(data, w.path)[0]]
        if absent or stale:
            unbound += 1
            state = "unbound" if absent else "outdated (re-run bind)"
            detail = f"; not defined: {', '.join(absent)}" if absent else f"; outdated: {', '.join(stale)}"
        else:
            state, detail = "bound", ""
        store_line = f"{ctx.table.store_file}: {state} ({len(ours)} of {len(wants)} starter key(s) written by bind, {len(kept)} kept from the user{detail})"
        if text is not None and data.get("tickets", {}).get("store") != "jira-onprem":
            store_line += f"; [tickets] store is {data.get('tickets', {}).get('store')!r}, not 'jira-onprem'"
        out(store_line)
    except FileNotFoundError as error:
        out(f"{ctx.table.store_file}: starter missing ({error})")
        unbound += 1
    except Refused as error:
        out(f"{ctx.table.store_file}: refused ({error})")
        unbound += 1
    out("status: bound" if not unbound else f"status: unbound ({unbound} item(s) above are not bound)")
    return 0


# ------------------------------------------------------------------ main


def default_root() -> Path | None:
    here = Path(__file__).resolve()
    if here.parent.name == "scripts" and here.parents[1].name == SKILL_NAME:
        return here.parents[1]
    return None


def main(argv: list[str] | None = None, out=print) -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("command", choices=("bind", "unbind", "status"))
    parser.add_argument("--project-root", type=Path, required=True, help="the folder holding _bmad/")
    parser.add_argument("--skills-root", type=Path, help="folder of the installed skills (default: this skill's parent)")
    parser.add_argument("--starter", type=Path, help="store starter (default: the skill's config/jira-onprem-ticketing.toml)")
    parser.add_argument("--targets", type=Path, help="bind target table (default: the skill's references/bind-targets.toml)")
    args = parser.parse_args(argv)
    try:
        project = args.project_root.resolve()
        if not (project / "_bmad").is_dir():
            raise Prerequisite(f"{project} holds no _bmad/: BMad is not set up there; ask bmad to run setup")
        skill_root = default_root()
        if (args.skills_root is None or args.targets is None or args.starter is None) and skill_root is None:
            raise Prerequisite(f"run this script from {SKILL_NAME}/scripts/, or pass --skills-root, --targets and --starter")
        targets = (args.targets or skill_root / "references" / "bind-targets.toml").resolve()
        table = load_table(targets)
        starter = (args.starter or skill_root / table.store_starter).resolve()
        skills_root = (args.skills_root or skill_root.parent).resolve()
        uv = shutil.which("uv")
        if not uv:
            raise Prerequisite("uv not found on PATH (bind runs BMad's resolve_config.py and resolve_customization.py with it)")
        ctx = Context(project, skills_root, starter, table, uv)
        return {"bind": cmd_bind, "unbind": cmd_unbind, "status": cmd_status}[args.command](ctx, out)
    except Prerequisite as error:
        out(f"prerequisite: {error}")
        return 2


if __name__ == "__main__":
    if sys.platform == "win32":
        sys.stdout.reconfigure(encoding="utf-8")
    sys.exit(main())
