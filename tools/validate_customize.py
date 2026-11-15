#!/usr/bin/env python3
# /// script
# requires-python = ">=3.11"
# ///
"""Contract validator for BMAD v7 `customize.toml` files and `_bmad/custom/` overrides.

Story 36.4 (FR303, FR290, FR291; Decisions P5-11.3, P5-11.4). Standard library only, one
file, so Story 37.1 can copy it into the extension repository's `tools/` unchanged and
Story 38.3's generator can spawn it.

Everything about upstream is read from the pinned tree at run time: slot names come from
each target's `customize.toml`, retired names from every `bmod-*/retired.toml`, the
placeholder set from `render_skill.py` / `resolve_config.py`. No slot name is typed here.
Upstream scripts are run as `uv run --no-cache <script> ...` with an argv array.

Modes (combine freely):
  --skills-root DIR   every `customize.toml` under DIR (module members): table shape per
                      kind, explicit `persistent_facts`, resolution through the pinned
                      resolver, placeholders, `{diff_output}`. `--render` also renders each
                      member with the pinned `render_skill.py` and requires exit 0.
  --custom-dir DIR    every file in a project's `_bmad/custom/`: parse, marker pairs, slot
                      classification, undeclared keys, resolution through the pinned
                      resolver, placeholders, `{diff_output}`.
  --classify SKILL TABLE KEY
                      print `defined` / `undefined` / `retired` for one slot.
  --print-placeholders
                      print the placeholder set extracted from the tree.
  --self-check        verify this file imports only the standard library.

Tree: `--tree`, else `BMAD_V7_TREE`, else `bundle/bmad-method/`.
Exit: 0 valid, 1 contract violations, 2 prerequisite missing (no uv, no tree, no resolver).
"""

from __future__ import annotations

import argparse
import ast
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
import tomllib
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

DEFAULT_TREE = "bundle/bmad-method"
MARKER_PREFIX = "ma-atlassian"
FORBIDDEN_PLACEHOLDER = "{diff_output}"
FACTS_KEY = "persistent_facts"
ACTIVATION_PREFIX = "activation_steps_"
# Files in `_bmad/custom/` that are not `<skill>.toml` overrides: the central config layers
# and Sofia's store file. They get parse and marker checks only.
NON_SKILL_FILES = ("config", "config.user", "ticketing-store-config")
# The skill that reads a non-skill file; its own placeholders are allowed there.
NON_SKILL_OWNERS = {"ticketing-store-config": "bmad-agent-po"}
JINJA_WORDS = {"and", "or", "not", "in", "is", "if", "else", "true", "false", "none", "True", "False", "None", "loop"}


class PrerequisiteError(RuntimeError):
    """The tree, the resolver or uv is missing: the run cannot judge anything."""


@dataclass
class Finding:
    code: str
    file: str
    line: int | None
    message: str
    table: str | None = None
    key: str | None = None

    def text(self) -> str:
        where = f"{self.file}:{self.line}" if self.line else self.file
        return f"{where}: [{self.code}] {self.message}"


@dataclass
class Report:
    findings: list[Finding] = field(default_factory=list)
    members: list[dict[str, Any]] = field(default_factory=list)
    overrides: list[dict[str, Any]] = field(default_factory=list)
    rendered: list[dict[str, Any]] = field(default_factory=list)
    resolver_calls: int = 0

    def add(self, code: str, file: Path | str, line: int | None, message: str, table=None, key=None) -> None:
        self.findings.append(Finding(code, Path(file).as_posix(), line, message, table, key))


# --------------------------------------------------------------------------- tree


class Tree:
    """The pinned upstream snapshot plus optional extra skills roots (our module members)."""

    def __init__(self, root: Path, extra_roots: tuple[Path, ...] = ()) -> None:
        self.root = root
        skills = root / "skills"
        if not skills.is_dir():
            raise PrerequisiteError(
                f"prerequisite: BMAD v7 tree not found at {root} (no skills/ folder); "
                "pass --tree or set BMAD_V7_TREE to a checkout of the pinned bmadRef.core commit"
            )
        self.skills = skills
        self._dirs: dict[str, Path] = {}
        for base in (skills, *extra_roots):
            for skill_md in sorted(base.rglob("SKILL.md"), key=lambda p: len(p.parts)):
                if "scripts" in skill_md.relative_to(base).parts:
                    continue
                self._dirs.setdefault(skill_md.parent.name, skill_md.parent)
        bmad = self._dirs.get("bmad")
        self.resolver = bmad / "scripts" / "resolve_customization.py" if bmad else None
        if self.resolver is None or not self.resolver.is_file():
            raise PrerequisiteError(
                f"prerequisite: skills/**/bmad/scripts/resolve_customization.py not found under {skills}"
            )
        self.renderer = self.resolver.with_name("render_skill.py")
        self.config_script = self.resolver.with_name("resolve_config.py")
        self._defaults: dict[str, dict[str, Any] | None] = {}
        self._retired: set[str] | None = None

    def skill_dir(self, name: str) -> Path | None:
        return self._dirs.get(name)

    def defaults(self, name: str) -> dict[str, Any] | None:
        if name not in self._defaults:
            directory = self._dirs.get(name)
            path = directory / "customize.toml" if directory else None
            self._defaults[name] = tomllib.loads(path.read_text(encoding="utf-8")) if path and path.is_file() else None
        return self._defaults[name]

    def retired(self) -> set[str]:
        if self._retired is None:
            names: set[str] = set()
            for record in sorted(self.skills.rglob("retired.toml")):
                if not record.parent.name.startswith("bmod-"):
                    continue
                data = tomllib.loads(record.read_text(encoding="utf-8"))
                names.update(str(item) for item in data.get("removed", []))
                names.update(str(item["from"]) for item in data.get("renamed", []) if "from" in item)
            self._retired = names
        return self._retired


def locate_tree(arg: str | None) -> Path:
    return Path(arg or os.environ.get("BMAD_V7_TREE") or DEFAULT_TREE).resolve()


def find_uv() -> str:
    uv = shutil.which("uv")
    if not uv:
        raise PrerequisiteError("prerequisite: uv not found on PATH (uv 0.13+ runs the pinned BMAD scripts)")
    return uv


def run_upstream(script: Path, args: list[str], report: Report | None = None) -> subprocess.CompletedProcess:
    """Run a pinned upstream script exactly as v7 skills do: uv run --no-cache, argv array."""
    argv = [find_uv(), "run", "--no-cache", str(script), *args]
    if report is not None:
        report.resolver_calls += 1
    return subprocess.run(argv, capture_output=True, text=True, encoding="utf-8", errors="replace", check=False)


# ------------------------------------------------------------------- classifier


def declares(defaults: dict[str, Any], dotted: str) -> bool:
    node: Any = defaults
    for part in dotted.split("."):
        if not isinstance(node, dict) or part not in node:
            return False
        node = node[part]
    return True


def classify(tree: Tree, skill: str, table: str, key: str) -> str:
    """`retired` if any bmod record retires the skill; `defined` if the skill's own
    customize.toml declares `<table>.<key>`; otherwise `undefined`."""
    if skill in tree.retired():
        return "retired"
    defaults = tree.defaults(skill)
    if defaults is None:
        return "undefined"
    return "defined" if declares(defaults, f"{table}.{key}" if table else key) else "undefined"


def leaf_paths(table: dict[str, Any], prefix: str = "") -> list[str]:
    """Same walk as render_skill.py's persistent-layer check: tables recurse, anything else is a leaf."""
    leaves: list[str] = []
    for key, value in table.items():
        path = f"{prefix}{key}"
        if isinstance(value, dict):
            leaves.extend(leaf_paths(value, f"{path}."))
        else:
            leaves.append(path)
    return leaves


def split_path(dotted: str) -> tuple[str, str]:
    table, _, key = dotted.rpartition(".")
    return table, key


# ----------------------------------------------------------------- TOML scanner

_BARE = r"[A-Za-z0-9_-]+"
_KEYPART = rf'(?:{_BARE}|"[^"\n]*"|\'[^\'\n]*\')'
_KEY_RE = re.compile(rf"^\s*({_KEYPART}(?:\s*\.\s*{_KEYPART})*)\s*=")
_HEADER_RE = re.compile(rf"^\s*(\[\[?)\s*({_KEYPART}(?:\s*\.\s*{_KEYPART})*)\s*(\]\]?)\s*(?:#.*)?$")
_MARKER_RE = re.compile(rf"^\s*#\s*{MARKER_PREFIX}:(\S*)(?:\s+(\S+))?\s*$")


def _parts(text: str) -> list[str]:
    return [p.strip().strip("\"'") for p in re.findall(rf"{_KEYPART}", text)]


@dataclass
class Statement:
    kind: str  # key | header | start | end | bad-marker
    line: int
    table: str
    path: str = ""  # full dotted path for key/header; marker argument for start
    end_line: int = 0


class _ValueState:
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


def _escaped(text: str, index: int) -> bool:
    count, j = 0, index - 1
    while j >= 0 and text[j] == "\\":
        count += 1
        j -= 1
    return count % 2 == 1


def scan(text: str) -> list[Statement]:
    """Statements of a TOML file with their 1-based lines; continuation lines of a
    multi-line value belong to the key statement that opened it."""
    out: list[Statement] = []
    table = ""
    lines = text.splitlines()
    i = 0
    while i < len(lines):
        raw = lines[i]
        stripped = raw.strip()
        lineno = i + 1
        i += 1
        if not stripped:
            continue
        if stripped.startswith("#"):
            marker = _MARKER_RE.match(raw)
            if marker:
                verb, arg = marker.group(1), marker.group(2)
                if verb == "start" and arg:
                    out.append(Statement("start", lineno, table, arg))
                elif verb == "end" and not arg:
                    out.append(Statement("end", lineno, table))
                else:
                    out.append(Statement("bad-marker", lineno, table, stripped))
            elif MARKER_PREFIX + ":" in stripped:
                out.append(Statement("bad-marker", lineno, table, stripped))
            continue
        header = _HEADER_RE.match(raw)
        if header:
            table = ".".join(_parts(header.group(2)))
            out.append(Statement("header", lineno, table, table, lineno))
            continue
        key = _KEY_RE.match(raw)
        if not key:
            continue  # tomllib reports the syntax error
        path = ".".join(([table] if table else []) + _parts(key.group(1)))
        state = _ValueState()
        state.feed(raw[key.end():])
        end = lineno
        while state.open and i < len(lines):
            state.feed(lines[i])
            i += 1
            end = i
        out.append(Statement("key", lineno, table, path, end))
    return out


def line_of(statements: list[Statement], dotted: str) -> int | None:
    for st in statements:
        if st.kind == "key" and st.path == dotted:
            return st.line
    for st in statements:  # a leaf set through a sub-table header
        if st.kind == "header" and dotted.startswith(st.path + "."):
            return st.line
    return None


def parse_toml(path: Path, report: Report) -> tuple[dict[str, Any] | None, str]:
    try:
        text = path.read_text(encoding="utf-8")
    except (OSError, UnicodeError) as error:
        report.add("read", path, None, f"cannot read: {error}")
        return None, ""
    try:
        return tomllib.loads(text), text
    except tomllib.TOMLDecodeError as error:
        match = re.search(r"at line (\d+)", str(error))
        report.add("parse", path, int(match.group(1)) if match else None, f"does not parse as TOML: {error}")
        return None, text


# ------------------------------------------------------------- placeholders


class Placeholders:
    """Names the pinned renderer defines, extracted from its source at run time."""

    def __init__(self, tree: Tree) -> None:
        self.jinja: set[str] = set()
        self.single: set[str] = set()
        for script in (tree.renderer, tree.config_script):
            if not script.is_file():
                raise PrerequisiteError(f"prerequisite: {script.name} not found beside {tree.resolver}")
            module = ast.parse(script.read_text(encoding="utf-8"))
            for node in ast.walk(module):
                if isinstance(node, ast.Constant) and isinstance(node.value, str):
                    self.single.update(re.findall(r"\{([a-z][a-z0-9-]*)\}", node.value))
                if (
                    script == tree.renderer
                    and isinstance(node, ast.Assign)
                    and any(isinstance(t, ast.Attribute) and t.attr == "variables" for t in node.targets)
                    and isinstance(node.value, ast.Dict)
                ):
                    self.jinja.update(k.value for k in node.value.keys if isinstance(k, ast.Constant))
        if not self.jinja or not self.single:
            raise PrerequisiteError(f"prerequisite: no placeholder set found in {tree.renderer}")


_JINJA_RE = re.compile(r"\{\{(.*?)\}\}", re.S)
_SINGLE_RE = re.compile(r"(?<![{\w$])\{([A-Za-z][\w-]*(?:\.[\w-]+)*)\}(?!\})")
_DEFINE_RE = re.compile(
    r"(?:\b(?:bind|set)\s+`\{([\w.-]+)\}`\s+(?:to|=))|(?:`\{([\w.-]+)\}`\s+(?:is|=)\s)", re.I
)


def jinja_roots(expression: str) -> set[str]:
    expr = re.sub(r"\"[^\"]*\"|'[^']*'", "", expression)
    expr = re.sub(r"\|\s*\w+", "", expr)
    expr = re.sub(r"\bis\s+(?:not\s+)?\w+", "", expr)
    return {name for name in re.findall(r"(?<![.\w])([A-Za-z_]\w*)", expr) if name not in JINJA_WORDS}


def owner_definitions(texts: list[str]) -> set[str]:
    names: set[str] = set()
    for text in texts:
        for a, b in _DEFINE_RE.findall(text):
            names.add(a or b)
    return names


def check_placeholders(
    file: Path, text: str, allowed: set[str], ph: Placeholders, report: Report, owner: str, toml: bool = False
) -> None:
    """`{diff_output}` is refused on every line; the placeholder rules apply to Markdown
    lines and, in TOML, to value lines (comments are documentation, not values)."""
    for number, line in enumerate(text.splitlines(), start=1):
        if FORBIDDEN_PLACEHOLDER in line:
            report.add("diff-output", file, number, "uses {diff_output}; v7 review lenses read {diff_file}")
        if toml and line.lstrip().startswith("#"):
            continue
        for expression in _JINJA_RE.findall(line):
            for root in sorted(jinja_roots(expression) - ph.jinja):
                report.add(
                    "placeholder-undefined", file, number,
                    f"{{{{ {expression.strip()} }}}}: `{root}` is not a render_skill.py variable",
                )
        for name in _SINGLE_RE.findall(line):
            root = name.split(".")[0]
            if name in ph.single or name in allowed or ("." in name and root in ph.jinja):
                continue
            report.add("placeholder-undefined", file, number, f"{{{name}}} is defined neither by v7 nor by {owner}")


def skill_texts(directory: Path, all_toml: bool = False) -> list[tuple[Path, str]]:
    """customize.toml (or every TOML file) and every Markdown file; scripts/ is excluded by path
    (shell scripts carry Docker `--format` strings that BMAD never renders)."""
    out: list[tuple[Path, str]] = []
    for path in sorted(directory.rglob("*")):
        rel = path.relative_to(directory)
        if not path.is_file() or "scripts" in rel.parts:
            continue
        if path.suffix == ".md" or path.name == "customize.toml" or (all_toml and path.suffix == ".toml"):
            out.append((path, path.read_text(encoding="utf-8")))
    return out


def target_placeholders(skill_dir: Path | None) -> set[str]:
    """Placeholders a target skill uses in its own shipped files: its runtime binds them."""
    if skill_dir is None:
        return set()
    return {n for _, text in skill_texts(skill_dir, all_toml=True) for n in _SINGLE_RE.findall(text)}


# --------------------------------------------------------------- resolution


def contains(resolved: Any, ours: Any) -> bool:
    if isinstance(ours, dict):
        return isinstance(resolved, dict) and all(k in resolved and contains(resolved[k], v) for k, v in ours.items())
    if isinstance(ours, list):
        return isinstance(resolved, list) and all(any(contains(r, o) for r in resolved) for o in ours)
    return resolved == ours


def resolve(tree: Tree, skill_dir: Path, project_root: Path, keys: list[str], report: Report, file: Path):
    args = ["--skill", str(skill_dir), "--project-root", str(project_root)]
    for key in keys:
        args += ["--key", key]
    result = run_upstream(tree.resolver, args, report)
    if result.returncode != 0:
        report.add(
            "resolver-exit", file, None,
            f"resolve_customization.py exited {result.returncode}: {(result.stderr or result.stdout).strip()}",
        )
        return None
    try:
        return json.loads(result.stdout)
    except json.JSONDecodeError as error:
        report.add("resolver-output", file, None, f"resolve_customization.py printed no JSON: {error}")
        return None


def make_project(base: Path) -> Path:
    project = Path(tempfile.mkdtemp(prefix="customize-v7-", dir=base))
    (project / "_bmad" / "custom").mkdir(parents=True)
    (project / "_bmad" / "config.toml").write_text(
        f'[core]\noutput_folder = "{(project / "_bmad-output").as_posix()}"\n', encoding="utf-8"
    )
    return project


# ------------------------------------------------------------ skills-root mode


def check_skills_root(tree: Tree, root: Path, ph: Placeholders, report: Report, render: bool) -> None:
    files = sorted(p for p in root.rglob("customize.toml") if "scripts" not in p.relative_to(root).parts)
    if not files:
        report.add("no-members", root, None, "no customize.toml found under --skills-root")
        return
    scratch = Path(tempfile.mkdtemp(prefix="validate-customize-"))
    try:
        for file in files:
            check_member(tree, file, ph, report, scratch, render)
    finally:
        shutil.rmtree(scratch, ignore_errors=True)


def check_member(tree: Tree, file: Path, ph: Placeholders, report: Report, scratch: Path, render: bool) -> None:
    skill_dir = file.parent
    data, text = parse_toml(file, report)
    entry: dict[str, Any] = {"file": file.as_posix(), "skill": skill_dir.name, "kind": None}
    report.members.append(entry)
    if data is None:
        return
    statements = scan(text)
    kind = "agent" if "agent" in data else "workflow"
    other = "workflow" if kind == "agent" else "agent"
    entry["kind"] = kind
    home = data.get(kind)
    if not isinstance(home, dict):
        report.add("shape", file, None, f"{kind} skill has no [{kind}] table", kind)
        home = {}
    # AC2: the activation keys live under the kind's own table, never under the other one.
    misplaced = data.get(other, {}) if isinstance(data.get(other), dict) else {}
    for key in sorted(misplaced):
        if key == FACTS_KEY or key.startswith(ACTIVATION_PREFIX):
            report.add(
                "wrong-table", file, line_of(statements, f"{other}.{key}"),
                f"{key} is under [{other}]; this {kind} skill must carry it under [{kind}]", other, key,
            )
    # AC3: explicit, non-empty persistent_facts in the right table.
    facts = home.get(FACTS_KEY)
    if facts is None:
        report.add("facts-missing", file, None, f"[{kind}] {FACTS_KEY} is not defined (upstream default is empty)", kind, FACTS_KEY)
    elif not isinstance(facts, list) or not facts or not all(isinstance(f, str) and f.strip() for f in facts):
        report.add("facts-empty", file, line_of(statements, f"{kind}.{FACTS_KEY}"),
                   f"[{kind}] {FACTS_KEY} must be a non-empty list of strings", kind, FACTS_KEY)
    # Resolution through the pinned resolver: every top-level key, value for value.
    project = make_project(scratch)
    resolved = resolve(tree, skill_dir, project, sorted(data), report, file)
    entry["resolved_keys"] = sorted(resolved) if resolved else []
    if resolved is not None:
        for key in sorted(data):
            if key not in resolved:
                report.add("resolver-missing", file, None, f"resolver output lacks top-level key `{key}`", key)
            elif resolved[key] != json.loads(json.dumps(data[key], default=str)):
                report.add("resolver-mismatch", file, None, f"resolver value for `{key}` differs from the file", key)
        if isinstance(facts, list) and facts:
            got = (resolved.get(kind) or {}).get(FACTS_KEY)
            if got != facts:
                report.add("facts-lost", file, None, f"resolver returns {FACTS_KEY} {got!r}, file has {facts!r}", kind, FACTS_KEY)
    # Placeholders and {diff_output}: TOML values and the Markdown v7 renders.
    sources = skill_texts(skill_dir)
    owned = owner_definitions([t for _, t in sources])
    for path, content in sources:
        if path.name == "customize.toml":
            check_placeholders(path, content, owned, ph, report, skill_dir.name, toml=True)
        elif path.name != "SKILL.md":  # render_skill.py renders every Markdown source but SKILL.md
            check_placeholders(path, content, owned, ph, report, skill_dir.name)
        else:
            for number, line in enumerate(content.splitlines(), start=1):
                if FORBIDDEN_PLACEHOLDER in line:
                    report.add("diff-output", path, number, "uses {diff_output}; v7 review lenses read {diff_file}")
    if render and (skill_dir / "workflow.md").is_file():
        result = run_upstream(tree.renderer, ["--project-root", str(project), "--skill", str(skill_dir)])
        halt = next((l for l in result.stdout.splitlines() if l.startswith("HALT:")), "")
        report.rendered.append({"skill": skill_dir.name, "exit": result.returncode, "halt": halt,
                                "output": result.stdout if result.returncode == 0 else ""})
        if result.returncode != 0:
            report.add("render-halt", skill_dir / "workflow.md", None,
                       f"render_skill.py exited {result.returncode}: {halt or result.stderr.strip()}")


# ------------------------------------------------------------- custom-dir mode


def check_custom_dir(tree: Tree, custom: Path, ph: Placeholders, report: Report) -> None:
    if not custom.is_dir():
        report.add("no-custom-dir", custom, None, "--custom-dir is not a directory")
        return
    project = custom.parent.parent
    for file in sorted(custom.glob("*.toml")):
        check_override(tree, project, file, ph, report)


def check_markers(tree: Tree, file: Path, statements: list[Statement], skill: str | None, report: Report) -> list[dict]:
    owned: list[dict] = []
    seen: dict[str, int] = {}
    open_start: Statement | None = None
    inside: list[Statement] = []
    for st in statements:
        if st.kind == "bad-marker":
            report.add("marker-malformed", file, st.line, f"not a valid marker line: {st.path}")
        elif st.kind == "start":
            if open_start is not None:
                report.add("marker-nested", file, st.line,
                           f"start marker for {st.path} opens inside the pair started at line {open_start.line}")
                continue
            if st.path in seen:
                report.add("marker-duplicate-key", file, st.line,
                           f"{st.path} is already bracketed by the pair at line {seen[st.path]}; a key sits in one pair",
                           *split_path(st.path))
            seen.setdefault(st.path, st.line)
            open_start, inside = st, []
        elif st.kind == "end":
            if open_start is None:
                report.add("marker-unbalanced", file, st.line, "end marker without a start marker")
                continue
            owned.extend(close_pair(tree, file, open_start, inside, skill, report))
            open_start, inside = None, []
        elif open_start is not None:
            inside.append(st)
    if open_start is not None:
        report.add("marker-unbalanced", file, open_start.line, f"start marker for {open_start.path} has no end marker")
    return owned


def close_pair(tree: Tree, file: Path, start: Statement, inside: list[Statement], skill: str | None, report: Report):
    headers = [s for s in inside if s.kind == "header"]
    keys = [s for s in inside if s.kind == "key"]
    if headers:
        report.add("marker-pair-header", file, headers[0].line, f"pair for {start.path} contains a table header")
    if len(keys) != 1:
        report.add("marker-pair-keys", file, start.line,
                   f"pair for {start.path} brackets {len(keys)} keys; a pair brackets exactly one", *split_path(start.path))
        return []
    key = keys[0]
    if key.path != start.path:
        expected_table, expected_key = split_path(start.path)
        if split_path(key.path)[1] == expected_key:
            report.add("marker-wrong-table", file, key.line,
                       f"{expected_key} sits in [{key.table}] but its start marker names [{expected_table}]",
                       expected_table, expected_key)
        else:
            report.add("marker-key-mismatch", file, key.line,
                       f"start marker names {start.path} but the bracketed key is {key.path}", *split_path(start.path))
        return []
    table, name = split_path(key.path)
    entry = {"file": file.as_posix(), "line": key.line, "table": table, "key": name}
    if skill is not None:
        entry["classification"] = state = classify(tree, skill, table, name)
        if state != "defined":
            report.add(f"slot-{state}", file, key.line,
                       f"[{table}] {name} is {state} for {skill} at the pinned tree", table, name)
    return [entry]


def check_override(tree: Tree, project: Path, file: Path, ph: Placeholders, report: Report) -> None:
    stem = file.name[: -len(".toml")]
    skill = None if stem in NON_SKILL_FILES else stem.removesuffix(".user")
    data, text = parse_toml(file, report)
    entry: dict[str, Any] = {"file": file.as_posix(), "skill": skill, "owned": [], "resolved": {}}
    report.overrides.append(entry)
    if data is None:
        return
    statements = scan(text)
    entry["owned"] = check_markers(tree, file, statements, skill, report)
    if skill is None:
        owner = NON_SKILL_OWNERS.get(stem)
        allowed = target_placeholders(tree.skill_dir(owner)) if owner else set()
        check_placeholders(file, text, allowed, ph, report, owner or file.name, toml=True)
        return
    if skill in tree.retired():
        report.add("target-retired", file, None, f"{skill} is retired at the pinned tree; nothing reads this file")
        return
    skill_dir = tree.skill_dir(skill)
    defaults = tree.defaults(skill)
    if skill_dir is None or defaults is None:
        report.add("target-unknown", file, None, f"{skill} has no customize.toml in the pinned tree or --skills-root")
        return
    # AC9: render_skill.py halts the target on any key its customize.toml does not declare.
    leaves = leaf_paths(data)
    for leaf in leaves:
        if not declares(defaults, leaf):
            table, key = split_path(leaf)
            report.add("undeclared-key", file, line_of(statements, leaf),
                       f"[{table}] {key} is not declared by {skill}/customize.toml (render_skill.py halts on it)",
                       table, key)
    resolved = resolve(tree, skill_dir, project, leaves, report, file)
    if resolved is not None:
        for leaf in leaves:
            value = data
            for part in leaf.split("."):
                value = value[part]
            ok = leaf in resolved and contains(resolved[leaf], json.loads(json.dumps(value, default=str)))
            entry["resolved"][leaf] = ok
            if not ok:
                report.add("resolver-lost", file, line_of(statements, leaf),
                           f"resolver does not return this file's value for {leaf}", *split_path(leaf))
    check_placeholders(file, text, target_placeholders(skill_dir), ph, report, skill, toml=True)


# ------------------------------------------------------------------- self-check


def self_check() -> list[str]:
    module = ast.parse(Path(__file__).read_text(encoding="utf-8"))
    names: set[str] = set()
    for node in ast.walk(module):
        if isinstance(node, ast.Import):
            names.update(alias.name.split(".")[0] for alias in node.names)
        elif isinstance(node, ast.ImportFrom) and node.module and node.level == 0:
            names.add(node.module.split(".")[0])
    return sorted(n for n in names if n not in sys.stdlib_module_names and n != "__future__")


# ------------------------------------------------------------------------- main


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--tree", help=f"pinned BMAD v7 checkout (default: $BMAD_V7_TREE or {DEFAULT_TREE})")
    parser.add_argument("--skills-root", type=Path, action="append", default=[])
    parser.add_argument("--custom-dir", type=Path, action="append", default=[])
    parser.add_argument("--classify", nargs=3, metavar=("SKILL", "TABLE", "KEY"))
    parser.add_argument("--render", action="store_true", help="also render each member with render_skill.py")
    parser.add_argument("--print-placeholders", action="store_true")
    parser.add_argument("--self-check", action="store_true")
    parser.add_argument("--json", action="store_true")
    args = parser.parse_args(argv)

    if args.self_check:
        foreign = self_check()
        print(json.dumps({"third_party_imports": foreign}))
        return 1 if foreign else 0
    try:
        find_uv()
        tree = Tree(locate_tree(args.tree), tuple(p.resolve() for p in args.skills_root))
        if args.classify:
            print(json.dumps({"classification": classify(tree, *args.classify)}))
            return 0
        placeholders = Placeholders(tree)
        if args.print_placeholders:
            print(json.dumps({"jinja": sorted(placeholders.jinja), "single": sorted(placeholders.single)}))
            return 0
        if not args.skills_root and not args.custom_dir:
            parser.error("give --skills-root, --custom-dir, --classify or --print-placeholders")
        report = Report()
        for root in args.skills_root:
            check_skills_root(tree, root.resolve(), placeholders, report, args.render)
        for custom in args.custom_dir:
            check_custom_dir(tree, custom.resolve(), placeholders, report)
    except PrerequisiteError as error:
        if args.json:
            print(json.dumps({"ok": False, "prerequisite": str(error)}))
        sys.stderr.write(f"{error}\n")
        return 2
    if args.json:
        print(json.dumps({
            "ok": not report.findings,
            "tree": tree.root.as_posix(),
            "findings": [f.__dict__ for f in report.findings],
            "members": report.members,
            "overrides": report.overrides,
            "rendered": report.rendered,
            "resolver_calls": report.resolver_calls,
        }, indent=2))
    else:
        for finding in report.findings:
            print(finding.text())
        print(f"{'FAIL' if report.findings else 'OK'}: {len(report.members)} member file(s), "
              f"{len(report.overrides)} override file(s), {len(report.findings)} finding(s)")
    return 1 if report.findings else 0


if __name__ == "__main__":
    if sys.platform == "win32":
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    raise SystemExit(main())
