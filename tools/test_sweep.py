#!/usr/bin/env python3
# /// script
# requires-python = ">=3.11"
# ///
"""Mutation test of `tools/sweep.py` (Story 37.5 AC): every check goes red on the mutant it exists for, every
exemption keeps a control mutant green, and the untouched repository is green.

Each mutant is applied to a fresh scratch copy of `skills/` (the repository itself is never changed). The sweep
runs in process. With `--tree` the upstream names come from the pinned BMAD-METHOD checkout, which enables the
"name the pinned commit does not ship" case; without it that case is skipped.

Usage: uv run --no-cache tools/test_sweep.py [--repo DIR] [--tree BMAD_TREE] [--keep]
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
import sweep  # noqa: E402


def run(copy: Path, tree: Path | None) -> list[str]:
    repo = sweep.load_repo(copy)
    upstream, keys = sweep.load_tree(tree)
    findings, _ = sweep.sweep(repo, upstream, keys)
    return findings


def append(path: Path, text: str) -> None:
    path.write_text(path.read_text(encoding="utf-8") + text, encoding="utf-8")


# (name, mutate(copy), expected check or None for "stays green", needs_tree)
def cases() -> list[tuple[str, Callable[[Path], None], str | None, bool]]:
    skills = lambda copy: copy / "skills"  # noqa: E731

    def m_cross(copy: Path) -> None:
        append(skills(copy) / "sre-day-2-ops" / "workflow.md", "\nRun `cpp-best-practices` on the result.\n")

    def m_record_ref(copy: Path) -> None:
        append(skills(copy) / "ma-knowledge-atlas" / "workflow.md", "\nInstall `bmod-ma-ops` first.\n")

    def m_bmad_folder(copy: Path) -> None:
        src = skills(copy) / "sre-day-2-ops"
        dst = skills(copy) / "bmad-foo"
        shutil.copytree(src, dst)
        text = (dst / "SKILL.md").read_text(encoding="utf-8").replace("name: sre-day-2-ops", "name: bmad-foo", 1)
        (dst / "SKILL.md").write_text(text, encoding="utf-8")

    def m_v6_config(copy: Path) -> None:
        append(skills(copy) / "sqa-audit" / "workflow.md", "\nRead `_bmad/bmm/config.yaml` for the output folder.\n")

    def m_bmad_config(copy: Path) -> None:
        append(skills(copy) / "sqa-audit" / "workflow.md", "\nRead `{project-root}/_bmad/config.toml` directly.\n")

    def m_undefined_module_key(copy: Path) -> None:
        append(
            skills(copy) / "sre-day-2-ops" / "workflow.md",
            "\n`uv run --no-cache {project-root}/_bmad/scripts/resolve_config.py --project-root {project-root} --key modules.ma-ops.nope`\n",
        )

    def m_undefined_core_key(copy: Path) -> None:
        append(skills(copy) / "sre-day-2-ops" / "workflow.md", "\nRead `core.user_name` first.\n")

    def m_sprint_skill(copy: Path) -> None:
        append(skills(copy) / "ma-agent-sqa" / "workflow.md", "\nFor the next story run `my-next-issue`.\n")

    def m_tracker(copy: Path) -> None:
        append(skills(copy) / "sqa-audit" / "workflow.md", "\nFall back to `sprint-status.yaml` when the tree is empty.\n")

    def m_tracker_in_migration(copy: Path) -> None:
        append(skills(copy) / "bmod-ma-ops" / "migration-1.toml", "\n# also reads sprint-status.yaml and my-next-issue data\n")

    def m_layout_in_js_migration(copy: Path) -> None:
        append(skills(copy) / "ma-atlassian-bind" / "scripts" / "migrate_binding.js", "\n// reads project-layout.yaml and MA-AGENTS-START blocks\n")

    def m_layout_in_js_script(copy: Path) -> None:
        (skills(copy) / "ma-atlassian-bind" / "scripts" / "helper.js").write_text("// reads project-layout.yaml\n", encoding="utf-8")

    def m_tracker_in_engine(copy: Path) -> None:
        assets = skills(copy) / "sre-day-2-ops" / "assets"
        assets.mkdir()
        (assets / "engine.cjs").write_text('const t = "sprint-status.yaml"; // my-next-issue\n', encoding="utf-8")

    def m_recommended_without_source(copy: Path) -> None:
        manifest = skills(copy) / "bmod-ma-ops" / "bmod.toml"
        text = manifest.read_text(encoding="utf-8").replace(
            '{ skill = "code-review", source = "github:mayafit/ma-bmad-extensions/skills" }', '{ skill = "code-review" }', 1
        )
        manifest.write_text(text, encoding="utf-8")

    def m_not_at_pin(copy: Path) -> None:
        append(skills(copy) / "ma-ops-dev-epic" / "workflow.md", "\nNever run `bmad-loop`.\n")

    def m_retired_elsewhere(copy: Path) -> None:
        append(skills(copy) / "sre-day-2-ops" / "workflow.md", "\nFormerly `bmad-knowledge`.\n")

    return [
        ("an undeclared cross-module reference (ma-ops -> ma-standards)", m_cross, "cross-module", False),
        ("a reference to another module's record with no skill of it declared", m_record_ref, "cross-module", False),
        ("an owned skill folder named bmad-foo", m_bmad_folder, "names", False),
        ("a `_bmad/bmm/config.yaml` read", m_v6_config, "config-reads", False),
        ("a direct `_bmad/config.toml` read", m_bmad_config, "config-reads", False),
        ("an undefined key `modules.ma-ops.nope` passed to resolve_config.py", m_undefined_module_key, "config-reads", False),
        ("an undefined key `core.user_name`", m_undefined_core_key, "config-reads", False),
        ("a `my-next-issue` mention", m_sprint_skill, "sprint-skills", False),
        ("a `sprint-status.yaml` mention outside a migration", m_tracker, "v6-files", False),
        ("control: `sprint-status.yaml` and a sprint skill inside migration-1.toml stay allowed", m_tracker_in_migration, None, False),
        ("control: `sprint-status.yaml` inside an opaque assets/*.cjs stays allowed", m_tracker_in_engine, None, False),
        ("control: `project-layout.yaml` inside scripts/migrate_*.js stays allowed", m_layout_in_js_migration, None, False),
        ("a `project-layout.yaml` mention in a script that is not a migration", m_layout_in_js_script, "config-reads", False),
        ("a recommended_skills entry for our skill without a source", m_recommended_without_source, "cross-module", False),
        ("a `bmad-loop` reference (not shipped at the pin)", m_not_at_pin, "cross-module", True),
        ("a name retired by another module", m_retired_elsewhere, "cross-module", False),
    ]


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--repo", type=Path, default=HERE.parent)
    parser.add_argument("--tree", type=Path, default=None, help="BMAD-METHOD checkout at the pinned commit")
    parser.add_argument("--keep", action="store_true", help="keep the scratch folder")
    args = parser.parse_args(argv)
    repo = args.repo.resolve()
    tree = args.tree.resolve() if args.tree else None
    scratch = Path(tempfile.mkdtemp(prefix="sweep-mutants-"))
    passed = failed = skipped = 0
    try:
        base = scratch / "base"
        base.mkdir()
        shutil.copytree(repo / "skills", base / "skills")
        clean = run(base, tree)
        if clean:
            print(f"FAIL the untouched repository is not green: {clean[:3]}")
            failed += 1
        else:
            print("ok   the untouched repository is green")
            passed += 1
        for number, (name, mutate, expected, needs_tree) in enumerate(cases(), start=1):
            if needs_tree and tree is None:
                print(f"skip m{number:02d} {name} (needs --tree)")
                skipped += 1
                continue
            copy = scratch / f"m{number:02d}"
            shutil.copytree(base, copy)
            mutate(copy)
            findings = run(copy, tree)
            if expected is None:
                ok = not findings
                detail = findings[:2]
            else:
                ok = any(f.startswith(expected + ":") for f in findings) and all(f.split(":", 1)[0] == expected for f in findings)
                detail = findings[:2] if findings else ["(green)"]
            print(f"{'ok  ' if ok else 'FAIL'} m{number:02d} {name}: {detail[0] if detail else 'green'}")
            passed += ok
            failed += not ok
    finally:
        if args.keep:
            print(f"scratch kept: {scratch}")
        else:
            shutil.rmtree(scratch, ignore_errors=True)
    print(f"{passed} passed, {failed} failed, {skipped} skipped")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
