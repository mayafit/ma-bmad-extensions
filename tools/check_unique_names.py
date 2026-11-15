#!/usr/bin/env python3
# /// script
# requires-python = ">=3.11"
# ///
"""Skill names unique across this repository and the pinned BMAD-METHOD snapshot (NFR84; Story 37.6).

Every skill a project installs lands in one flat folder (`.claude/skills/<name>/`), so a name this
repository owns must not be a name the bundled upstream snapshot ships, and no two owned skills may share a
name. Checked, ignoring case: every folder under `skills/` (records and members alike) and every `name:` of
an owned `SKILL.md` frontmatter, against every folder under `<tree>/skills/` and every `name:` of an
upstream `SKILL.md` frontmatter. An owned frontmatter `name` must also equal its folder name, which is what
the Skills CLI installs it as.

`tools/check_names.py` (FR287) forbids the `bmad-` prefix; this check is the other half of NFR84's last
sentence and stays meaningful once upstream ships names without that prefix.

Usage: uv run --no-cache tools/check_unique_names.py --tree BMAD_TREE [--repo DIR]
Exit: 0 every name unique, 1 collisions.
"""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
FRONTMATTER_NAME = re.compile(r"^name:\s*['\"]?([^'\"\s]+)", re.M)


def frontmatter_name(skill_md: Path) -> str | None:
    text = skill_md.read_text(encoding="utf-8", errors="replace")
    if not text.startswith("---"):
        return None
    parts = text.split("---", 2)
    match = FRONTMATTER_NAME.search(parts[1]) if len(parts) >= 3 else None
    return match.group(1) if match else None


def names_of(skills_dir: Path) -> dict[str, list[str]]:
    """Every name (case-folded) -> where it is declared (`<folder>` or `<folder>/SKILL.md`)."""
    found: dict[str, list[str]] = {}
    for folder in sorted(p for p in skills_dir.iterdir() if p.is_dir()):
        found.setdefault(folder.name.casefold(), []).append(folder.name)
        skill_md = folder / "SKILL.md"
        if skill_md.is_file():
            name = frontmatter_name(skill_md)
            if name and name.casefold() != folder.name.casefold():
                found.setdefault(name.casefold(), []).append(f"{folder.name}/SKILL.md")
    return found


def check(repo: Path, tree: Path) -> tuple[list[str], str]:
    problems: list[str] = []
    owned_dir = repo / "skills"
    upstream_dir = tree / "skills"
    if not owned_dir.is_dir():
        return [f"no skills/ folder under {repo}"], ""
    if not upstream_dir.is_dir():
        return [f"{tree} is not a BMAD-METHOD tree (no skills/ folder)"], ""
    owned = names_of(owned_dir)
    upstream = names_of(upstream_dir)
    for folder in sorted(p for p in owned_dir.iterdir() if p.is_dir()):
        skill_md = folder / "SKILL.md"
        if skill_md.is_file():
            name = frontmatter_name(skill_md)
            if name is None:
                problems.append(f"skills/{folder.name}/SKILL.md: no `name:` in the frontmatter")
            elif name != folder.name:
                problems.append(f"skills/{folder.name}/SKILL.md: name {name!r} differs from the folder name")
    for key, places in sorted(owned.items()):
        folders = [p for p in places if "/" not in p]
        if len(folders) > 1:
            problems.append(f"skills/: {len(folders)} folders share the name {key!r} ignoring case: {', '.join(folders)}")
        if key in upstream:
            problems.append(
                f"skills/{places[0]}: name {key!r} is also shipped by the pinned BMAD-METHOD snapshot "
                f"({', '.join('skills/' + p for p in upstream[key])})"
            )
    summary = f"{len(owned)} owned name(s) unique against {len(upstream)} upstream name(s) at {tree}"
    return problems, summary


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--repo", type=Path, default=HERE.parent, help="repository root (default: this repository)")
    parser.add_argument("--tree", type=Path, required=True, help="BMAD-METHOD checkout at the pinned commit")
    args = parser.parse_args(argv)
    problems, summary = check(args.repo.resolve(), args.tree.resolve())
    if problems:
        print(f"skill name uniqueness failed ({len(problems)}):", file=sys.stderr)
        for problem in problems:
            print(f"  {problem}", file=sys.stderr)
        return 1
    print(f"OK: {summary}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
