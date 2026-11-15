#!/usr/bin/env python3
# /// script
# requires-python = ">=3.11"
# ///
"""Per-module install test (FR297, NFR84; Decision P5-11.2).

For each module record `skills/bmod-<code>/` of this repository, into a fresh scratch project:
  1. the BMAD v7 `core-tools` and `method` modules from the pinned tree, every record and member named with
     its own `--skill` (the lists are read from the tree's records, never typed here);
  2. this module from SOURCE: `node <skills-cli> add SOURCE --skill bmod-<code> --skill <each member> -y
     --agent claude-code`, stdin closed, telemetry off; the project then holds exactly the core skills, the
     record and its members (no sibling module);
  3. `uv run --no-cache <bmad>/scripts/setup.py --list-config-questions` lists exactly the record's
     `[[bmod.config_questions]]` as pending for this module; every pending question is answered with its
     declared default through `--module-answers` (`[modules."<code>"]` tables), which exits 0;
  4. `setup.py --status` reports the module with the record's version and no problem, unmet requirement or
     pending question.
`setup.py` runs as the project's installed `bmad` (`--skill <project>/.claude/skills/bmad --root
<project>/.claude/skills`); a `--skill` outside the project is counted as a global skills folder.

SOURCE is this repository's folder (default) or, with `--from-tag OWNER/REPO`, `OWNER/REPO#v<version>`
where `<version>` is the records' shared version (or `--tag`). When that tag does not exist on the remote
the run prints SKIP and exits 0.

Usage:
  uv run --no-cache tools/install_test.py --tree BMAD_TREE --skills-cli CLI_DIR --work DIR
      [--module CODE ...] [--from-tag OWNER/REPO [--tag TAG]]
Exit: 0 every module passes (or the tag is absent), 1 a module fails, 2 a prerequisite is missing.
"""

from __future__ import annotations

import argparse
import json
import os
import shutil
import subprocess
import sys
import tomllib
from pathlib import Path

HERE = Path(__file__).resolve().parent
REPO = HERE.parent
AGENT = "claude-code"
AGENT_DIR = Path(".claude") / "skills"
CORE_RECORDS = ("bmod-core-tools", "bmod-method")


class Prerequisite(RuntimeError):
    pass


class Failure(RuntimeError):
    pass


def tool(name: str) -> str:
    found = shutil.which(name)
    if not found:
        raise Prerequisite(f"{name} not found on PATH")
    return found


def run(argv: list[str], cwd: Path, env: dict[str, str] | None = None) -> subprocess.CompletedProcess:
    return subprocess.run(
        argv, cwd=cwd, env=env, stdin=subprocess.DEVNULL, capture_output=True,
        text=True, encoding="utf-8", errors="replace", check=False,
    )


def record(path: Path) -> dict:
    return tomllib.loads((path / "bmod.toml").read_text(encoding="utf-8"))["bmod"]


def record_skills(skills_dir: Path, folder: str) -> list[str]:
    """The record folder and every member it lists, each to be named with its own --skill."""
    return [folder, *[str(s) for s in record(skills_dir / folder).get("skills", [])]]


def skills_cli(cli_dir: Path) -> list[str]:
    pkg = json.loads((cli_dir / "package.json").read_text(encoding="utf-8"))
    bin_entry = pkg["bin"] if isinstance(pkg["bin"], str) else pkg["bin"][pkg["name"]]
    entry = cli_dir / bin_entry.removeprefix("./")
    if not entry.is_file():
        raise Prerequisite(f"Skills CLI bin entry {entry} not found")
    if not (cli_dir / "node_modules").is_dir():
        raise Prerequisite(f"{cli_dir} has no node_modules: pack it with tools/pack-skills-cli.mjs")
    return [tool("node"), str(entry)]


def add(cli: list[str], project: Path, source: str, names: list[str]) -> None:
    env = {**os.environ, "DISABLE_TELEMETRY": "1", "DO_NOT_TRACK": "1"}
    argv = [*cli, "add", source]
    for name in names:
        argv += ["--skill", name]
    argv += ["-y", "--agent", AGENT]
    result = run(argv, project, env)
    if result.returncode != 0:
        raise Failure(f"skills add {source} exited {result.returncode}: {(result.stderr or result.stdout).strip()[-2000:]}")


def setup(project: Path, tree: Path, *args: str) -> subprocess.CompletedProcess:
    script = tree / "skills" / "bmad" / "scripts" / "setup.py"
    argv = [
        tool("uv"), "run", "--no-cache", str(script), "--project-root", str(project),
        "--skill", str(project / AGENT_DIR / "bmad"), "--root", str(project / AGENT_DIR), *args,
    ]
    return run(argv, project)


def setup_json(project: Path, tree: Path, *args: str):
    result = setup(project, tree, *args)
    if result.returncode != 0:
        raise Failure(f"setup.py {' '.join(args)} exited {result.returncode}: {(result.stderr or result.stdout).strip()}")
    return json.loads(result.stdout)


def toml_string(value: str) -> str:
    return json.dumps(value, ensure_ascii=False)


def test_module(code: str, source: str, tree: Path, cli: list[str], work: Path, log) -> None:
    folder = f"bmod-{code}"
    rec = record(REPO / "skills" / folder)
    module_skills = record_skills(REPO / "skills", folder)
    core_skills = [name for core in CORE_RECORDS for name in record_skills(tree / "skills", core)]
    project = work / code
    if project.exists():
        shutil.rmtree(project)
    project.mkdir(parents=True)
    git = run([tool("git"), "init", "-q"], project)
    if git.returncode != 0:
        raise Failure(f"git init: {git.stderr.strip()}")

    add(cli, project, str(tree), core_skills)
    add(cli, project, source, module_skills)
    installed = sorted(p.name for p in (project / AGENT_DIR).iterdir() if p.is_dir())
    expected = sorted(set(core_skills) | set(module_skills))
    if installed != expected:
        extra = sorted(set(installed) - set(expected))
        missing = sorted(set(expected) - set(installed))
        raise Failure(f"installed skills differ: extra {extra}, missing {missing}")
    log(f"  add: {len(core_skills)} core skills + {module_skills} -> {len(installed)} folders in {AGENT_DIR.as_posix()}")

    pending = setup_json(project, tree, "--list-config-questions")
    own = sorted(q["key"] for q in pending if q["module"] == code)
    declared = sorted(q["key"] for q in rec.get("config_questions", []))
    if own != declared:
        raise Failure(f"pending questions for {code}: {own}, record declares {declared}")
    answers = project.parent / f"{code}-answers.toml"
    tables: dict[str, list[dict]] = {}
    for question in pending:
        tables.setdefault(question["module"], []).append(question)
    answers.write_text(
        "".join(
            f'[modules."{module}"]\n' + "".join(f"{toml_string(q['key'])} = {toml_string(q['default'])}\n" for q in qs) + "\n"
            for module, qs in sorted(tables.items())
        ),
        encoding="utf-8",
    )
    try:
        report = setup_json(project, tree, "--module-answers", str(answers))
    finally:
        answers.unlink(missing_ok=True)
    log(f"  setup --module-answers: {len(pending)} pending answered with defaults ({own or 'none for ' + code}); status {report.get('status')!r}")

    status = setup_json(project, tree, "--status")
    entry = next((m for m in status.get("modules", []) if m.get("module") == code), None)
    if entry is None:
        raise Failure(f"setup.py --status does not report module {code!r}")
    if entry.get("version") != rec["version"]:
        raise Failure(f"--status reports {code} version {entry.get('version')!r}, record has {rec['version']!r}")
    if sorted(entry.get("skills", [])) != sorted(module_skills[1:]):
        raise Failure(f"--status lists {code} skills {entry.get('skills')}, record lists {module_skills[1:]}")
    for key in ("problems", "unmet_requirements", "pending_questions", "missing_module_records"):
        if status.get(key):
            raise Failure(f"--status {key}: {status[key]}")
    if entry.get("absent_skills"):
        raise Failure(f"--status absent_skills for {code}: {entry['absent_skills']}")
    log(f"  status: {code} {entry['version']} scope {entry.get('scope')} update {entry.get('update', {}).get('state')}")


def tag_exists(owner_repo: str, tag: str) -> bool:
    result = run(
        [tool("git"), "ls-remote", "--tags", f"https://github.com/{owner_repo}.git", f"refs/tags/{tag}"], REPO
    )
    if result.returncode != 0:
        raise Prerequisite(f"git ls-remote {owner_repo}: {result.stderr.strip()}")
    return bool(result.stdout.strip())


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--tree", type=Path, required=True, help="BMAD-METHOD checkout at the pinned commit")
    parser.add_argument("--skills-cli", type=Path, required=True, help="Skills CLI folder from tools/pack-skills-cli.mjs")
    parser.add_argument("--work", type=Path, required=True, help="scratch folder for the projects")
    parser.add_argument("--module", action="append", default=[], help="module code (default: every record)")
    parser.add_argument("--from-tag", metavar="OWNER/REPO", help="install from OWNER/REPO#<tag> instead of this folder")
    parser.add_argument("--tag", help="tag for --from-tag (default: v<records' version>)")
    args = parser.parse_args(argv)

    skills_dir = REPO / "skills"
    codes_all = sorted(record(p)["code"] for p in skills_dir.glob("bmod-*") if (p / "bmod.toml").is_file())
    codes = args.module or codes_all
    unknown = sorted(set(codes) - set(codes_all))
    try:
        if unknown:
            raise Prerequisite(f"no module record for {unknown}")
        tree = args.tree.resolve()
        if not (tree / "skills" / "bmad" / "scripts" / "setup.py").is_file():
            raise Prerequisite(f"{tree} is not a BMAD v7 tree (no skills/bmad/scripts/setup.py)")
        cli = skills_cli(args.skills_cli.resolve())
        if args.from_tag:
            versions = {record(skills_dir / f"bmod-{c}")["version"] for c in codes_all}
            if len(versions) != 1:
                raise Prerequisite(f"records carry more than one version: {sorted(versions)}")
            tag = args.tag or f"v{versions.pop()}"
            if not tag_exists(args.from_tag, tag):
                print(f"SKIP: tag {tag} does not exist on github.com/{args.from_tag}; the install from a tag runs once it does")
                return 0
            source = f"{args.from_tag}#{tag}"
        else:
            source = str(REPO)
    except Prerequisite as error:
        print(f"prerequisite: {error}", file=sys.stderr)
        return 2

    work = args.work.resolve()
    work.mkdir(parents=True, exist_ok=True)
    failed: list[str] = []
    for code in codes:
        print(f"module {code} from {source}")
        try:
            test_module(code, source, tree, cli, work, print)
            print(f"  PASS {code}")
        except (Failure, Prerequisite, json.JSONDecodeError, KeyError) as error:
            print(f"  FAIL {code}: {error}", file=sys.stderr)
            failed.append(code)
    if failed:
        print(f"install test failed for {failed}", file=sys.stderr)
        return 1
    print(f"OK: {len(codes)} module(s) installed alone from {source} and reported by setup.py --status")
    return 0


if __name__ == "__main__":
    sys.exit(main())
