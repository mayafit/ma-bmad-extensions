#!/usr/bin/env python3
# /// script
# requires-python = ">=3.11"
# ///
"""Complete module assignment (FR295, Decision P5-11.1).

Every skill folder under `skills/` (a folder that is not a `bmod-*` record) is listed by exactly one
module record's `skills`, every entry of a record's `skills` is a folder under `skills/`, every record's
code is a module of the package map (`tools/package-map.toml`), and every skill sits in the module the
package map names for it. A skill the map lists under `[no_module]` is never shipped. `--complete`
also requires every skill of the package map to be shipped (the release gate).

Usage: uv run --no-cache tools/check_assignment.py [--repo DIR] [--map FILE] [--complete]
Exit: 0 assignment complete, 1 violations.
"""

from __future__ import annotations

import argparse
import sys
import tomllib
from pathlib import Path

RECORD_PREFIX = "bmod-"
HERE = Path(__file__).resolve().parent


def load_map(path: Path) -> tuple[dict[str, str], dict[str, set[str]], set[str], list[str]]:
    data = tomllib.loads(path.read_text(encoding="utf-8"))
    owner: dict[str, str] = {}
    members: dict[str, set[str]] = {}
    problems: list[str] = []
    for code, table in sorted(data.get("modules", {}).items()):
        members[code] = set(table.get("skills", []))
        for skill in table.get("skills", []):
            if skill in owner:
                problems.append(f"{path.name}: {skill!r} is mapped to both {owner[skill]!r} and {code!r}")
            owner.setdefault(skill, code)
    excluded = set(data.get("no_module", {}).get("skills", []))
    for skill in sorted(excluded & set(owner)):
        problems.append(f"{path.name}: {skill!r} is both in module {owner[skill]!r} and under [no_module]")
    return owner, members, excluded, problems


def check(repo: Path, map_path: Path, complete: bool) -> tuple[list[str], str]:
    owner, map_members, excluded, problems = load_map(map_path)
    skills_dir = repo / "skills"
    folders = sorted(p.name for p in skills_dir.iterdir() if p.is_dir()) if skills_dir.is_dir() else []
    if not folders:
        return [f"no folders under {skills_dir}"], ""
    records: dict[str, tuple[str, list[str]]] = {}
    for name in folders:
        if not name.startswith(RECORD_PREFIX):
            continue
        manifest = skills_dir / name / "bmod.toml"
        try:
            bmod = tomllib.loads(manifest.read_text(encoding="utf-8"))["bmod"]
            records[name] = (str(bmod["code"]), [str(s) for s in bmod.get("skills", [])])
        except (OSError, KeyError, tomllib.TOMLDecodeError) as error:
            problems.append(f"skills/{name}/bmod.toml: cannot read [bmod] code and skills: {error}")
    skills = [name for name in folders if not name.startswith(RECORD_PREFIX)]
    listed_by: dict[str, list[str]] = {}
    for record, (code, listed) in sorted(records.items()):
        if code not in map_members:
            problems.append(f"skills/{record}: module {code!r} is not a module of the package map")
        for skill in listed:
            listed_by.setdefault(skill, []).append(record)
            if skill not in skills:
                problems.append(f"skills/{record}: lists {skill!r}, which is not a folder under skills/")
    for skill in skills:
        holders = listed_by.get(skill, [])
        if not holders:
            problems.append(f"skills/{skill}: listed by no module record")
        elif len(holders) > 1:
            problems.append(f"skills/{skill}: listed by {len(holders)} module records: {', '.join(holders)}")
        if skill in excluded:
            problems.append(f"skills/{skill}: the package map gives this skill no 4.x module; it is never shipped")
        elif skill not in owner:
            problems.append(f"skills/{skill}: not in the package map")
        else:
            for record in holders:
                code = records[record][0]
                if code != owner[skill]:
                    problems.append(
                        f"skills/{skill}: listed by {record} (module {code!r}); the package map puts it in {owner[skill]!r}"
                    )
    shipped = set(skills)
    if complete:
        for skill in sorted(set(owner) - shipped):
            problems.append(f"package map: {skill!r} (module {owner[skill]!r}) is not shipped")
    summary = (
        f"complete assignment: {len(skills)} skill(s) in {len(records)} module record(s); "
        f"{len(shipped & set(owner))} of {len(owner)} package-map skills shipped"
    )
    return problems, summary


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--repo", type=Path, default=HERE.parent, help="repository root (default: this repository)")
    parser.add_argument("--map", type=Path, default=HERE / "package-map.toml")
    parser.add_argument("--complete", action="store_true", help="also require every package-map skill to be shipped")
    args = parser.parse_args(argv)
    problems, summary = check(args.repo.resolve(), args.map.resolve(), args.complete)
    if problems:
        print(f"module assignment failed ({len(problems)}):", file=sys.stderr)
        for problem in problems:
            print(f"  {problem}", file=sys.stderr)
        return 1
    print(f"OK: {summary}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
