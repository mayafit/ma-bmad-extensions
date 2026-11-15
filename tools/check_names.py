#!/usr/bin/env python3
# /// script
# requires-python = ">=3.11"
# ///
"""No owned skill is named `bmad-*` (FR287; upstream reserves the prefix and its validator accepts it).

Checks every folder under `skills/`, every `name:` in a `SKILL.md` frontmatter, every entry of a module
record's `skills`, and every `skill` a `roster.toml` member names. The comparison ignores case.

Usage: uv run --no-cache tools/check_names.py [--repo DIR]
Exit: 0 no owned `bmad-*` name, 1 violations.
"""

from __future__ import annotations

import argparse
import re
import sys
import tomllib
from pathlib import Path

RESERVED = "bmad-"
HERE = Path(__file__).resolve().parent
FRONTMATTER_NAME = re.compile(r"^name:\s*['\"]?([^'\"\s]+)", re.M)


def reserved(name: str) -> bool:
    return name.casefold().startswith(RESERVED)


def check(repo: Path) -> tuple[list[str], int]:
    skills_dir = repo / "skills"
    problems: list[str] = []
    checked = 0
    for folder in sorted(p for p in skills_dir.iterdir() if p.is_dir()):
        checked += 1
        if reserved(folder.name):
            problems.append(f"skills/{folder.name}: owned skill folder carries the reserved prefix {RESERVED!r}")
        skill_md = folder / "SKILL.md"
        if skill_md.is_file():
            text = skill_md.read_text(encoding="utf-8")
            front = text.split("---", 2)[1] if text.startswith("---") and text.count("---") >= 2 else ""
            match = FRONTMATTER_NAME.search(front)
            if match and reserved(match.group(1)):
                problems.append(f"skills/{folder.name}/SKILL.md: name {match.group(1)!r} carries the reserved prefix")
        manifest = folder / "bmod.toml"
        if manifest.is_file():
            data = tomllib.loads(manifest.read_text(encoding="utf-8"))
            for skill in data.get("bmod", {}).get("skills", []):
                if reserved(str(skill)):
                    problems.append(f"skills/{folder.name}/bmod.toml: skills lists {skill!r}, a reserved name")
        roster = folder / "roster.toml"
        if roster.is_file():
            data = tomllib.loads(roster.read_text(encoding="utf-8"))
            for member in data.get("members", []):
                skill = member.get("skill") if isinstance(member, dict) else None
                if isinstance(skill, str) and reserved(skill):
                    problems.append(f"skills/{folder.name}/roster.toml: member {member.get('code')!r} names {skill!r}")
    return problems, checked


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--repo", type=Path, default=HERE.parent, help="repository root (default: this repository)")
    args = parser.parse_args(argv)
    problems, checked = check(args.repo.resolve())
    if problems:
        print(f"owned skill names failed ({len(problems)}):", file=sys.stderr)
        for problem in problems:
            print(f"  {problem}", file=sys.stderr)
        return 1
    print(f"OK: {checked} skill folder(s), none named {RESERVED}*")
    return 0


if __name__ == "__main__":
    sys.exit(main())
