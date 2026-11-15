#!/usr/bin/env python3
# /// script
# requires-python = ">=3.11"
# ///
"""ma-standards-apply: write or remove the `ma-standards` block in a project's instruction files.

The block sits between the exact marker lines `<!-- ma-standards:start -->` and
`<!-- ma-standards:end -->` (FR301). This script is the one writer of that block and touches
nothing else: not the installer's `ma-agents` block, not upstream's `bmad:context` block, not the
user's prose. Contract (the same one ma-agents `lib/inject/marker-block.js` keeps, Story 36.5):

  - A marker matches only a line whose text, without its line terminator, equals the marker
    exactly. No trimming, no prefix or substring match, no case folding.
  - Every byte outside the block is preserved, line endings included; the file is read and
    written as raw bytes (latin-1 code units). The block's own lines use the line ending of the
    existing start-marker line, else the first line ending in the file, else LF.
  - Block absent, file present: the block is appended; existing bytes are never rewritten.
  - Block content unchanged: nothing is written.
  - Removal deletes the block lines and, when the line before the block is blank and the line
    after it is blank or absent, that one blank line, so append-then-remove restores the file.
    The file is deleted only when nothing but whitespace remains.
  - Duplicate, unbalanced or out-of-order markers are refused and nothing is written.

Targets. `AGENTS.md` is always written (created when absent). `CLAUDE.md`, `.clinerules` and
`.github/copilot-instructions.md` are written when they already exist, or when named with
`--file` or `--all` (then created). A `CLAUDE.md` whose every non-blank line is an `@<file>`
import (the file v7 `bmad-project-context` adoption leaves behind) gets no block: the block is
written to `AGENTS.md`, which that import loads, and the skip is reported. `.roomodes` is not
Markdown: when it exists and is JSON with a `customModes` list, the block is one entry of that
list with the slug `ma-standards`, set or removed structurally; a YAML `.roomodes` is reported
and left untouched; it is never created.

Block content: one line per installed ma-standards skill, taken from the installed record's
`help/help.md` and filtered by the skill folders present beside this skill.

Usage (from the skill's own folder, `{skill-root}/scripts/apply_block.py`):
  uv run --no-cache apply_block.py [apply] --project-root DIR [--skills-root DIR] [--all] [--file F ...]
  uv run --no-cache apply_block.py remove  --project-root DIR [--file F ...]
Exit: 0 done, 1 a file refused (ambiguous markers), 2 a prerequisite is missing.
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
import tomllib
from pathlib import Path

START = "<!-- ma-standards:start -->"
END = "<!-- ma-standards:end -->"
MA_STANDARDS_MARKERS = (START, END)
RECORD = "bmod-ma-standards"
ROOMODES = ".roomodes"
ROOMODES_SLUG = "ma-standards"
MARKDOWN_FILES = ("AGENTS.md", "CLAUDE.md", ".clinerules", ".github/copilot-instructions.md")
INSTRUCTION_FILES = (*MARKDOWN_FILES, ROOMODES)
ALWAYS = "AGENTS.md"
IMPORT_LINE = re.compile(r"^@\S+$")
HELP_LINE = re.compile(r"^- `([a-z0-9-]+)`:\s*(.+?)\s*$")


class MarkerError(RuntimeError):
    """Markers in a file are duplicated, unbalanced or out of order: nothing is written."""


class Prerequisite(RuntimeError):
    pass


# ------------------------------------------------------------------ text model


def split_lines(text: str) -> list[tuple[str, str]]:
    """Lines as (text, eol); eol is '\\r\\n', '\\n' or '' (last line only)."""
    lines: list[tuple[str, str]] = []
    pos = 0
    for match in re.finditer(r"\r?\n", text):
        lines.append((text[pos:match.start()], match.group(0)))
        pos = match.end()
    if pos < len(text):
        lines.append((text[pos:], ""))
    return lines


def join_lines(lines: list[tuple[str, str]]) -> str:
    return "".join(text + eol for text, eol in lines)


def locate(lines: list[tuple[str, str]], markers: tuple[str, str]) -> tuple[int, int] | None:
    start, end = markers
    starts = [i for i, (text, _) in enumerate(lines) if text == start]
    ends = [i for i, (text, _) in enumerate(lines) if text == end]
    if not starts and not ends:
        return None
    if len(starts) != 1 or len(ends) != 1 or ends[0] < starts[0]:
        raise MarkerError(
            f"ambiguous markers {start} / {end}: {len(starts)} start line(s), {len(ends)} end line(s); refusing to write"
        )
    return starts[0], ends[0]


def body_lines(body: str, markers: tuple[str, str]) -> list[str]:
    if body == "":
        return []
    parts = re.split(r"\r?\n", body)
    if parts[-1] == "":
        parts.pop()
    for part in parts:
        if part in markers:
            raise MarkerError("block body must not contain its own marker lines")
    return parts


def render_block(markers: tuple[str, str], body: str, eol: str) -> str:
    return eol.join([markers[0], *body_lines(body, markers), markers[1]])


def first_eol(lines: list[tuple[str, str]]) -> str:
    for _, eol in lines:
        if eol:
            return eol
    return "\n"


def splice_text(text: str | None, markers: tuple[str, str], body: str) -> tuple[str, str, str]:
    """Pure splice. Returns (new text, action, appended tail); action is created | appended |
    replaced | unchanged."""
    if text is None:
        return render_block(markers, body, "\n") + "\n", "created", ""
    lines = split_lines(text)
    loc = locate(lines, markers)
    if loc:
        s, e = loc
        eol = lines[s][1]
        out = join_lines(lines[:s]) + render_block(markers, body, eol) + lines[e][1] + join_lines(lines[e + 1:])
        return (text, "unchanged", "") if out == text else (out, "replaced", "")
    eol = first_eol(lines)
    sep = ""
    if text:
        sep = ("" if text.endswith("\n") else eol) + eol
    appended = sep + render_block(markers, body, eol) + eol
    return text + appended, "appended", appended


def remove_text(text: str, markers: tuple[str, str]) -> tuple[str, str]:
    """Pure removal. Returns (new text, action); action is absent | removed | emptied."""
    lines = split_lines(text)
    loc = locate(lines, markers)
    if not loc:
        return text, "absent"
    s, e = loc
    before = lines[:s]
    after = lines[e + 1:]
    if before and before[-1][0] == "" and (not after or after[0][0] == ""):
        before.pop()
    out = join_lines(before) + join_lines(after)
    return out, ("emptied" if out.strip() == "" else "removed")


# ------------------------------------------------------------------ file I/O (byte-exact)


def _latin1(text: str) -> str:
    return text.encode("utf-8").decode("latin-1")


def _read(path: Path) -> str:
    return path.read_bytes().decode("latin-1")


def _write(path: Path, text: str) -> None:
    path.write_bytes(text.encode("latin-1"))


def splice_file(path: Path, markers: tuple[str, str], body: str) -> str:
    m = (_latin1(markers[0]), _latin1(markers[1]))
    b = _latin1(body)
    if not path.exists():
        text, action, _ = splice_text(None, m, b)
        path.parent.mkdir(parents=True, exist_ok=True)
        _write(path, text)
        return action
    text, action, appended = splice_text(_read(path), m, b)
    if action == "appended":
        with path.open("ab") as handle:
            handle.write(appended.encode("latin-1"))
    elif action == "replaced":
        _write(path, text)
    return action


def remove_file(path: Path, markers: tuple[str, str]) -> str:
    if not path.exists():
        return "absent"
    text, action = remove_text(_read(path), (_latin1(markers[0]), _latin1(markers[1])))
    if action == "absent":
        return "absent"
    if action == "emptied":
        path.unlink()
        return "deleted"
    _write(path, text)
    return "removed"


def is_import_only(text: str) -> bool:
    """A CLAUDE.md that holds nothing but `@<file>` import lines (and blank lines)."""
    lines = [line.strip() for line in re.split(r"\r?\n", text)]
    lines = [line for line in lines if line]
    return bool(lines) and all(IMPORT_LINE.match(line) for line in lines)


# ------------------------------------------------------------------ block content


def default_skills_root() -> Path | None:
    here = Path(__file__).resolve()
    if here.parent.name == "scripts" and here.parents[1].name == "ma-standards-apply":
        return here.parents[2]
    return None


def installed_standards(skills_root: Path) -> list[str]:
    names: list[str] = []
    for folder in sorted(p for p in skills_root.iterdir() if p.is_dir()):
        manifest = folder / "bmod.toml"
        if folder.name == RECORD or not manifest.is_file():
            continue
        try:
            table = tomllib.loads(manifest.read_text(encoding="utf-8")).get("skill", {})
        except (OSError, tomllib.TOMLDecodeError):
            continue
        if table.get("bmod") == RECORD and (folder / "SKILL.md").is_file():
            names.append(folder.name)
    return names


def block_body(skills_root: Path) -> str:
    help_md = skills_root / RECORD / "help" / "help.md"
    if not help_md.is_file():
        raise Prerequisite(f"{help_md} not found: install the {RECORD} record beside this skill")
    installed = set(installed_standards(skills_root))
    lines = []
    for raw in help_md.read_text(encoding="utf-8").splitlines():
        match = HELP_LINE.match(raw)
        if match and match.group(1) in installed:
            # help.md speaks to the `bmad` router ("Recommend it when ..."); the block speaks to the agent.
            text = match.group(2).replace(" Recommend it when ", " Use it when ")
            lines.append(f"- `{match.group(1)}`: {text}")
    if not lines:
        raise Prerequisite(f"no ma-standards skill is installed beside {skills_root / 'ma-standards-apply'}")
    head = [
        "## Engineering standards (ma-standards)",
        "",
        "Managed by the `ma-standards-apply` skill of the `ma-standards` module; edits inside this block are "
        "replaced on the next apply. The standards below are installed skills: activate the named skill, "
        "and follow it, before doing the work its line describes.",
        "",
    ]
    return "\n".join(head + lines)


# ------------------------------------------------------------------ .roomodes (JSON only)


def roomodes_load(path: Path) -> tuple[dict | None, str]:
    """(document, reason) — document is None when the file is not JSON with a customModes list."""
    raw = path.read_bytes()
    try:
        data = json.loads(raw.decode("utf-8-sig"))
    except (UnicodeDecodeError, json.JSONDecodeError):
        return None, "not JSON (a YAML .roomodes has no structural block form without a YAML parser)"
    if not isinstance(data, dict) or not isinstance(data.get("customModes"), list):
        return None, "JSON without a customModes list"
    return data, ""


def roomodes_write(path: Path, data: dict) -> None:
    raw = path.read_bytes()
    eol = b"\r\n" if b"\r\n" in raw else b"\n"
    text = json.dumps(data, indent=2, ensure_ascii=False).replace("\n", eol.decode()) + eol.decode()
    path.write_bytes(text.encode("utf-8"))


def roomodes_apply(path: Path, body: str) -> str:
    data, reason = roomodes_load(path)
    if data is None:
        return f"skipped ({reason})"
    entry = {
        "slug": ROOMODES_SLUG,
        "name": "ma-standards",
        "roleDefinition": body,
        "groups": ["read"],
    }
    modes = data["customModes"]
    for index, mode in enumerate(modes):
        if isinstance(mode, dict) and mode.get("slug") == ROOMODES_SLUG:
            if mode == entry:
                return "unchanged"
            modes[index] = entry
            roomodes_write(path, data)
            return "replaced"
    modes.append(entry)
    roomodes_write(path, data)
    return "appended"


def roomodes_remove(path: Path) -> str:
    data, reason = roomodes_load(path)
    if data is None:
        return f"skipped ({reason})"
    modes = data["customModes"]
    kept = [m for m in modes if not (isinstance(m, dict) and m.get("slug") == ROOMODES_SLUG)]
    if len(kept) == len(modes):
        return "absent"
    data["customModes"] = kept
    roomodes_write(path, data)
    return "removed"


# ------------------------------------------------------------------ commands


def select_targets(project_root: Path, files: list[str], all_files: bool) -> list[str]:
    if files:
        unknown = sorted(set(files) - set(INSTRUCTION_FILES))
        if unknown:
            raise Prerequisite(f"not an instruction file: {unknown}; choose from {list(INSTRUCTION_FILES)}")
        return list(dict.fromkeys(files))
    targets = [ALWAYS]
    for name in INSTRUCTION_FILES:
        if name == ALWAYS:
            continue
        if (all_files and name != ROOMODES) or (project_root / name).exists():
            targets.append(name)
    return targets


def apply(project_root: Path, body: str, files: list[str] | None = None, all_files: bool = False) -> dict[str, str]:
    """Write the block into each target. Returns file -> action."""
    targets = select_targets(project_root, files or [], all_files)
    result: dict[str, str] = {}
    redirect = False
    for name in targets:
        path = project_root / name
        if name == ROOMODES:
            result[name] = roomodes_apply(path, body) if path.is_file() else "skipped (absent; never created)"
            continue
        if path.is_dir():
            result[name] = "skipped (is a folder)"
            continue
        if name == "CLAUDE.md" and path.exists() and is_import_only(_read(path)):
            result[name] = "skipped (imports @AGENTS.md; the block is written to AGENTS.md)"
            redirect = True
            continue
        result[name] = splice_file(path, MA_STANDARDS_MARKERS, body)
    if redirect and ALWAYS not in result:
        result[ALWAYS] = splice_file(project_root / ALWAYS, MA_STANDARDS_MARKERS, body)
    return result


def remove(project_root: Path, files: list[str] | None = None) -> dict[str, str]:
    """Remove the block from each target (every instruction file by default). Returns file -> action."""
    targets = select_targets(project_root, files or [], True) if files else list(INSTRUCTION_FILES)
    result: dict[str, str] = {}
    for name in targets:
        path = project_root / name
        if name == ROOMODES:
            result[name] = roomodes_remove(path) if path.is_file() else "absent"
        elif path.is_dir():
            result[name] = "skipped (is a folder)"
        else:
            result[name] = remove_file(path, MA_STANDARDS_MARKERS)
    return result


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("command", nargs="?", default="apply", choices=("apply", "remove"))
    parser.add_argument("--project-root", type=Path, default=Path.cwd())
    parser.add_argument("--skills-root", type=Path, help="folder holding the installed skills (default: this skill's parent)")
    parser.add_argument("--file", action="append", default=[], help="instruction file to write (repeatable; created when absent)")
    parser.add_argument("--all", action="store_true", help="write every Markdown instruction file, creating absent ones")
    args = parser.parse_args(argv)
    project_root = args.project_root.resolve()
    try:
        if not project_root.is_dir():
            raise Prerequisite(f"project root is not a folder: {project_root}")
        if args.command == "apply":
            skills_root = (args.skills_root or default_skills_root())
            if skills_root is None:
                raise Prerequisite("cannot infer the skills folder from this script's location; pass --skills-root")
            body = block_body(skills_root.resolve())
            result = apply(project_root, body, args.file, args.all)
        else:
            result = remove(project_root, args.file)
    except Prerequisite as error:
        print(f"prerequisite: {error}", file=sys.stderr)
        return 2
    except MarkerError as error:
        print(f"refused: {error}", file=sys.stderr)
        return 1
    for name, action in result.items():
        print(f"{name}: {action}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
