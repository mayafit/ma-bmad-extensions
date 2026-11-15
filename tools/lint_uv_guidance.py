#!/usr/bin/env python3
# /// script
# requires-python = ">=3.11"
# ///
"""Skill-guidance lint: every script a skill tells the agent to run goes through `uv run --no-cache`.

Offline, a skill activates and its scripts run only from the bundled runtime and wheelhouse, and
`uv run --no-cache` is the only form that never treats a uv cache as a package source (FR282, FR304,
Decision P5-11.6). Every Markdown and TOML file under `skills/` is guidance. A line fails when it holds
  - `uv run` not followed directly by `--no-cache`;
  - `uvx` or `uv tool run` (an ad-hoc environment outside the wheelhouse);
  - `python`, `python3` or `py` running a `.py` file (bypasses uv and the PEP 723 header).

Usage: uv run --no-cache tools/lint_uv_guidance.py [--repo DIR]
Exit: 0 clean, 1 violations.
"""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
RULES = (
    (re.compile(r"\buv\s+run\b(?!\s+--no-cache\b)"), "`uv run` without `--no-cache`"),
    (re.compile(r"\buvx\b|\buv\s+tool\s+run\b"), "`uvx` / `uv tool run` runs outside the bundled wheelhouse"),
    (
        re.compile(r"(?<![\w./-])(?:python3?|py)(?:\.exe)?\s+(?:-\S+\s+)*[\"']?[^\s\"'`]*\.py\b"),
        "runs a Python script directly instead of `uv run --no-cache`",
    ),
)
SUFFIXES = {".md", ".toml"}


def lint(repo: Path) -> tuple[list[str], int]:
    problems: list[str] = []
    files = sorted(p for p in (repo / "skills").rglob("*") if p.is_file() and p.suffix in SUFFIXES)
    for path in files:
        rel = path.relative_to(repo).as_posix()
        for number, line in enumerate(path.read_text(encoding="utf-8").splitlines(), start=1):
            for pattern, message in RULES:
                if pattern.search(line):
                    problems.append(f"{rel}:{number}: {message}: {line.strip()}")
    return problems, len(files)


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--repo", type=Path, default=HERE.parent, help="repository root (default: this repository)")
    args = parser.parse_args(argv)
    problems, count = lint(args.repo.resolve())
    if problems:
        print(f"skill-guidance lint failed ({len(problems)}):", file=sys.stderr)
        for problem in problems:
            print(f"  {problem}", file=sys.stderr)
        return 1
    print(f"OK: {count} guidance file(s); every script runs through `uv run --no-cache`")
    return 0


if __name__ == "__main__":
    sys.exit(main())
