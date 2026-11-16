#!/usr/bin/env python3
# /// script
# requires-python = ">=3.11"
# ///
"""Mutation test of the Story 37.6 gate checks: `check_assignment.py --complete` with the `pending` marker and
`check_unique_names.py`. Every mutant is applied to a fresh scratch copy of `skills/` and `tools/` (the
repository itself is never changed) and must turn exactly that check red; the untouched copy is green.

Cases (every package-map skill ships since Story 38.1, so the `pending` mutants create their own marker):
  c0  untouched copy: `--complete` green, every package-map skill shipped
  c1  a member unshipped (`skills/ma-atlassian-confluence-plan/` removed and unlisted from its record) with no
      `pending` marker: red (not shipped)
  c2  a `pending` marker on `[modules.ma-ops]`, whose skills all ship: red (stale marker)
  c3  an empty `pending = ""` on `[modules.ma-atlassian]`: red (the marker must name the epic)
  c4  the member of c1 unshipped and `pending = "Epic 99"` on `[modules.ma-atlassian]`: green (listed, not failed)
  u0  untouched copy: unique names green
  u1  an owned folder named like an upstream record (`skills/bmod-method/`): red
  u2  an owned `SKILL.md` whose frontmatter `name` is an upstream skill (`bmad-agent-po`): red
  u3  an owned `SKILL.md` whose frontmatter `name` is another owned skill: red (differs from the folder)
  u4  two owned folders differing only by case (`SRE-Day-2-Ops`): red (on a case-sensitive file system;
      skipped where the copy cannot hold both)

Usage: uv run --no-cache tools/test_gate_checks.py --tree BMAD_TREE [--repo DIR] [--keep]
Exit: 0 every case passed, 1 otherwise.
"""

from __future__ import annotations

import argparse
import shutil
import sys
import tempfile
from collections.abc import Callable
from pathlib import Path

sys.dont_write_bytecode = True
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
import check_assignment  # noqa: E402
import check_unique_names  # noqa: E402

SKIP = "skip"


def replace(path: Path, old: str, new: str) -> None:
    text = path.read_text(encoding="utf-8")
    if old not in text:
        raise RuntimeError(f"{path}: {old!r} not found")
    path.write_text(text.replace(old, new, 1), encoding="utf-8")


def cases(tree: Path) -> list[tuple[str, str, Callable[[Path], None], str | None]]:
    """(name, check, mutate(copy), expected substring of a finding, or None for green)."""

    def nothing(copy: Path) -> None:
        pass

    def c1(copy: Path) -> None:
        # unship one member: its folder goes and its record no longer lists it (a listed folder that is
        # missing is another finding, `lists ... which is not a folder`)
        shutil.rmtree(copy / "skills" / "ma-atlassian-confluence-plan")
        replace(copy / "skills" / "bmod-ma-atlassian" / "bmod.toml", '  "ma-atlassian-confluence-plan",\n', "")

    def c2(copy: Path) -> None:
        replace(copy / "tools" / "package-map.toml", "[modules.ma-ops]\n", '[modules.ma-ops]\npending = "Epic 99"\n')

    def c3(copy: Path) -> None:
        replace(copy / "tools" / "package-map.toml", "[modules.ma-atlassian]\n", '[modules.ma-atlassian]\npending = ""\n')

    def c4(copy: Path) -> None:
        c1(copy)
        replace(copy / "tools" / "package-map.toml", "[modules.ma-atlassian]\n", '[modules.ma-atlassian]\npending = "Epic 99"\n')

    def u1(copy: Path) -> None:
        shutil.copytree(copy / "skills" / "bmod-ma-standards", copy / "skills" / "bmod-method")
        replace(copy / "skills" / "bmod-method" / "SKILL.md", "name: bmod-ma-standards", "name: bmod-method")

    def u2(copy: Path) -> None:
        replace(copy / "skills" / "sre-day-2-ops" / "SKILL.md", "name: sre-day-2-ops", "name: bmad-agent-po")

    def u3(copy: Path) -> None:
        replace(copy / "skills" / "sre-day-2-ops" / "SKILL.md", "name: sre-day-2-ops", "name: sre-check-secrets")

    def u4(copy: Path) -> None:
        src = copy / "skills" / "sre-day-2-ops"
        dst = copy / "skills" / "SRE-Day-2-Ops"
        if dst.exists():  # a case-folding file system (Windows, macOS default) cannot hold both
            raise LookupError(SKIP)
        shutil.copytree(src, dst)

    return [
        ("c0", "assignment", nothing, None),
        ("c1", "assignment", c1, "'ma-atlassian-confluence-plan' (module 'ma-atlassian') is not shipped"),
        ("c2", "assignment", c2, "[modules.ma-ops] pending = 'Epic 99' is stale"),
        ("c3", "assignment", c3, "pending must name the epic"),
        ("c4", "assignment", c4, None),
        ("u0", "unique", nothing, None),
        ("u1", "unique", u1, "name 'bmod-method' is also shipped by the pinned BMAD-METHOD snapshot"),
        ("u2", "unique", u2, "name 'bmad-agent-po' is also shipped by the pinned BMAD-METHOD snapshot"),
        ("u3", "unique", u3, "name 'sre-check-secrets' differs from the folder name"),
        ("u4", "unique", u4, "2 folders share the name 'sre-day-2-ops' ignoring case"),
    ]


def run_check(which: str, copy: Path, tree: Path) -> list[str]:
    if which == "assignment":
        problems, _ = check_assignment.check(copy, copy / "tools" / "package-map.toml", complete=True)
    else:
        problems, _ = check_unique_names.check(copy, tree)
    return problems


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--repo", type=Path, default=HERE.parent)
    parser.add_argument("--tree", type=Path, required=True, help="BMAD-METHOD checkout at the pinned commit")
    parser.add_argument("--keep", action="store_true", help="keep the scratch copies")
    args = parser.parse_args(argv)
    repo, tree = args.repo.resolve(), args.tree.resolve()
    scratch = Path(tempfile.mkdtemp(prefix="gate-checks-"))
    passed = failed = skipped = 0
    try:
        for name, which, mutate, expected in cases(tree):
            copy = scratch / name
            shutil.copytree(repo / "skills", copy / "skills", ignore=shutil.ignore_patterns("__pycache__"))
            shutil.copytree(repo / "tools", copy / "tools", ignore=shutil.ignore_patterns("__pycache__", "fixtures"))
            try:
                mutate(copy)
            except LookupError:
                print(f"skip {name}: the file system folds case")
                skipped += 1
                continue
            problems = run_check(which, copy, tree)
            if expected is None:
                ok = not problems
                shown = "green" if ok else "; ".join(problems)[:300]
            else:
                ok = any(expected in p for p in problems)
                shown = next((p for p in problems if expected in p), "green" if not problems else "; ".join(problems)[:300])
            print(f"{'ok  ' if ok else 'FAIL'} {name} ({which}): {shown}")
            passed += ok
            failed += not ok
    finally:
        if not args.keep:
            shutil.rmtree(scratch, ignore_errors=True)
    print(f"{passed} passed, {failed} failed, {skipped} skipped")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
