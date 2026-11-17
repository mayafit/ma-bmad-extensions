#!/usr/bin/env python3
# /// script
# requires-python = ">=3.11"
# ///
"""Tests of `skills/ma-atlassian-bind/scripts/migrate_binding.js` (Story 38.5; FR294, FR290, FR291, FR300).

A scratch project gets the pinned `core-tools` and `method` skills (copied from the tree's records, not installed
through the Skills CLI) and is set up with `setup.py`; then this repository's `ma-atlassian` record and members are
copied beside them, so the module's nine questions are pending, as on a 3.x project upgraded to 4.x. Each case runs
on a fresh copy of that project's `_bmad/` with a 3.x binding written in: `_bmad-output/project-layout.yaml` in the
3.x installer's schema 2, and `_bmad/custom/<skill>.toml` files holding the 3.x publish block exactly as the 3.x
installer wrote it (`# BEGIN:ma-agents-confluence-publish` .. `# END:ma-agents-confluence-publish` at the top of the
file, user content below it). The script runs as `node migrate_binding.js` with `--skills-root` (setup, the resolver
and bind run through `uv run --no-cache`, as in a real run).

Cases: fresh migration (answers mapped and asked, blocks deleted byte for byte in LF, CRLF, no-final-newline and
non-ASCII files, bind bound, backups, the report, `project-layout.yaml` unchanged); idempotent second run (no file
changed, mtimes kept, "already migrated"); a required answer missing (exit 3, nothing written); two different
Confluence stores (exit 3 until `--planning-store`, then planning and tickets destinations); damaged 3.x markers
(begin without end, two begins, end without begin: refused and unchanged, the rest migrated, exit 1); a partial
binding (file-system stores, no Jira, an unreadable layout, blocks without a layout); answers already given (kept,
setup not asked); dry run (nothing written); markers inside a multi-line string or with trailing text are not
markers; the command line (`--help`, exit 2 without `_bmad/`, an unknown `--answer` key).

`--mutants` applies one source mutation per copy of the script and requires the case named for it to fail.

Usage: uv run --no-cache tools/test_migrate_binding.py --tree BMAD_TREE [--mutants] [--case NAME ...] [--keep]
Exit: 0 every case passed (and every mutant red), 1 otherwise, 2 a prerequisite is missing.
"""

from __future__ import annotations

import argparse
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
import time
import tomllib
import traceback
from pathlib import Path

sys.dont_write_bytecode = True
HERE = Path(__file__).resolve().parent
REPO = HERE.parent
SCRIPT = REPO / "skills" / "ma-atlassian-bind" / "scripts" / "migrate_binding.js"
CORE_RECORDS = ("bmod-core-tools", "bmod-method")
MODULE_FOLDERS = ("bmod-ma-atlassian", "ma-atlassian-bind", "ma-atlassian-confluence-plan", "ma-atlassian-confluence-record-root-page")
KEYS = ("jira_site", "jira_project_key", "jira_mcp_server", "confluence_site", "confluence_mcp_server",
        "planning_space", "planning_root_page", "tickets_space", "tickets_root_page")
MARKERS = ("# BEGIN:ma-agents-confluence-publish", "# END:ma-agents-confluence-publish", "MA-AGENTS-START", "MA-AGENTS-END")
SITE = "https://wiki.example.test"
OLD = 978307200  # an mtime no write can produce


class Prerequisite(RuntimeError):
    pass


def tool(name: str) -> str:
    found = shutil.which(name)
    if not found:
        raise Prerequisite(f"{name} not on PATH")
    return found


def run(argv: list[str], cwd: Path | None = None) -> subprocess.CompletedProcess:
    env = {**os.environ, "PYTHONIOENCODING": "utf-8"}
    return subprocess.run(argv, cwd=cwd, capture_output=True, text=True, encoding="utf-8", errors="replace",
                          stdin=subprocess.DEVNULL, env=env, check=False)


# ----------------------------------------------------------------------------- 3.x fixtures


def block_3x(skill: str, store: str, eol: str = "\n") -> str:
    """The 3.x publish block (`lib/confluence-publish-hook.js` buildPublishHookBlock), followed by one line ending."""
    instruction = (f"Publish the artifact you just finished to Confluence: run `ma-agents confluence-plan --store {store}` "
                   "and perform exactly the operations it prints. If no Confluence MCP server is reachable, STOP.")
    lines = [
        "# BEGIN:ma-agents-confluence-publish",
        "#",
        "# GENERATED AND OWNED BY ma-agents. This region is regenerated from",
        "# _bmad-output/project-layout.yaml on every `ma-agents install` and every",
        "# `ma-agents bind`. Anything you put BETWEEN the two markers is replaced.",
        "# Anything OUTSIDE them is yours and is kept exactly as you left it.",
        "#",
        "# TO ADD YOUR OWN on_complete, put it in",
        f"#     _bmad/custom/{skill}.user.toml",
        "#",
        "workflow.on_complete = [",
        "  " + json.dumps(instruction) + ",",
        "]",
        "# END:ma-agents-confluence-publish",
    ]
    return eol.join(lines) + eol


def layout_3x(system: dict | None, software: dict | None, sprint: dict | None) -> str:
    def store(name: str, s: dict | None) -> str:
        if s is None:
            return f"{name}:\n  backend: file-system\n  mode: same\n  path: \".\"\n"
        out = f"{name}:\n  backend: confluence\n  space_key: \"{s['space']}\"\n  root_page:\n"
        out += f"    title: {json.dumps(s['title']) if s.get('title') else 'null'}\n"
        out += f"    id: {json.dumps(s['id']) if s.get('id') else 'null'}\n"
        return out

    text = ("# Generated by ma-agents — do not edit manually\n"
            "# The authoritative, committed record of where this project's knowledge\n"
            "schema_version: 2\n"
            "generated: \"2026-10-01\"\n")
    text += store("system_requirements_store", system) + store("software_requirements_store", software)
    if sprint:
        text += f"sprint_management:\n  mode: jira\n  jira_url: \"{sprint['url']}\"\n  jira_project_key: \"{sprint['key']}\"\n"
    else:
        text += "sprint_management:\n  mode: same\n  path: \".\"\n"
    return text


SHOP = {"space": "SHOP", "title": "Shop requirements", "id": "123456"}
JIRA = {"url": "https://jira.example.test", "key": "SHOP"}
# user content kept below each block: CRLF with a table and non-ASCII text, LF comment only, no final newline
USER_PRD = "# our own PRD settings, café\r\n[workflow]\r\npersistent_facts = [\"file:docs/house-style.md\"]\r\n"
USER_EPICS = "# kept by the team\n"
USER_UX = "[workflow]\npersistent_facts = [\"ux house rules\"]"


def write_3x(project: Path, layout: str | None, files: dict[str, bytes]) -> None:
    if layout is not None:
        (project / "_bmad-output").mkdir(parents=True, exist_ok=True)
        (project / "_bmad-output" / "project-layout.yaml").write_bytes(layout.encode("utf-8"))
    for name, data in files.items():
        (project / "_bmad" / "custom" / name).write_bytes(data)


def standard_files() -> dict[str, bytes]:
    return {
        "bmad-prd.toml": (block_3x("bmad-prd", "system", "\r\n") + USER_PRD).encode("utf-8"),
        "bmad-architecture.toml": block_3x("bmad-architecture", "software").encode("utf-8"),
        "bmad-create-epics-and-stories.toml": (block_3x("bmad-create-epics-and-stories", "software") + USER_EPICS).encode("utf-8"),
        "bmad-ux.toml": (block_3x("bmad-ux", "software") + USER_UX).encode("utf-8"),
    }


def snapshot(project: Path) -> dict[str, tuple[bytes, int]]:
    out = {}
    for p in sorted(project.rglob("*")):
        if p.is_file() and "__pycache__" not in p.parts:
            out[p.relative_to(project).as_posix()] = (p.read_bytes(), p.stat().st_mtime_ns)
    return out


def age(project: Path) -> None:
    for p in project.rglob("*"):
        if p.is_file():
            os.utime(p, (OLD, OLD))


# ----------------------------------------------------------------------------- the scratch project


class World:
    def __init__(self, tree: Path, work: Path) -> None:
        self.tree, self.work = tree, work
        self.base = work / "base"
        self.skills = self.base / ".claude" / "skills"
        self.counter = 0

    def build(self) -> None:
        tree_skills = self.tree / "skills"
        names: list[str] = []
        for record in CORE_RECORDS:
            data = tomllib.loads((tree_skills / record / "bmod.toml").read_text(encoding="utf-8"))["bmod"]
            names += [record, *data["skills"]]
        self.skills.mkdir(parents=True)
        for name in names:
            source = tree_skills / name
            if not source.is_dir():
                source = next(tree_skills.rglob(f"{name}/SKILL.md")).parent
            shutil.copytree(source, self.skills / name)
        result = run([tool("uv"), "run", "--no-cache", str(self.skills / "bmad" / "scripts" / "setup.py"), "--project-root",
                      str(self.base), "--skill", str(self.skills / "bmad"), "--root", str(self.skills)])
        if result.returncode != 0:
            raise Prerequisite(f"setup.py exited {result.returncode}: {result.stderr or result.stdout}")
        # the module arrives after the core setup: its nine questions are pending, as on an upgraded 3.x project
        for name in MODULE_FOLDERS:
            shutil.copytree(REPO / "skills" / name, self.skills / name, ignore=shutil.ignore_patterns("__pycache__"))
        self.names = names

    def project(self) -> Path:
        self.counter += 1
        project = self.work / f"p{self.counter:02d}"
        shutil.copytree(self.base / "_bmad", project / "_bmad", ignore=shutil.ignore_patterns("render"))
        return project


class Runner:
    def __init__(self, world: World, script: Path) -> None:
        self.w, self.script = world, script

    def migrate(self, project: Path, *extra: str) -> tuple[int, str, dict]:
        result = run([tool("node"), str(self.script), "--project-root", str(project), "--skills-root", str(self.w.skills),
                      "--json", *extra])
        out = result.stdout + result.stderr
        last = [l for l in result.stdout.splitlines() if l.startswith("{")]
        return result.returncode, out, (json.loads(last[-1]) if last else {})

    def answers(self, project: Path) -> dict[str, str]:
        argv = [tool("uv"), "run", "--no-cache", str(project / "_bmad" / "scripts" / "resolve_config.py"), "--project-root", str(project)]
        for k in KEYS:
            argv += ["--key", f"modules.ma-atlassian.{k}"]
        result = run(argv)
        assert result.returncode == 0, result.stderr
        data = json.loads(result.stdout)
        return {k: data.get(f"modules.ma-atlassian.{k}") for k in KEYS}

    def bind(self, project: Path, command: str) -> tuple[int, str]:
        result = run([tool("uv"), "run", "--no-cache", str(self.w.skills / "ma-atlassian-bind" / "scripts" / "bind.py"), command,
                      "--project-root", str(project), "--skills-root", str(self.w.skills)])
        return result.returncode, result.stdout + result.stderr

    def answer_with_setup(self, project: Path, values: dict[str, str]) -> None:
        answers = project / "answers.toml"
        answers.write_text('[modules."ma-atlassian"]\n' + "".join(f"{k} = {json.dumps(v)}\n" for k, v in values.items()), encoding="utf-8")
        result = run([tool("uv"), "run", "--no-cache", str(self.w.skills / "bmad" / "scripts" / "setup.py"), "--project-root", str(project),
                      "--skill", str(self.w.skills / "bmad"), "--root", str(self.w.skills), "--module", "ma-atlassian",
                      "--module-answers", str(answers)])
        answers.unlink()
        assert result.returncode == 0, result.stderr or result.stdout


def custom(project: Path, name: str) -> Path:
    return project / "_bmad" / "custom" / name


def report(project: Path) -> Path:
    return project / "_bmad-output" / "migration-v6-v7" / "ma-atlassian-migration-1.md"


def no_markers(project: Path, skip: tuple[str, ...] = ()) -> None:
    for p in (project / "_bmad" / "custom").glob("*.toml"):
        if p.name in skip:
            continue
        text = p.read_bytes().decode("utf-8")
        for m in MARKERS:
            assert m not in text, f"{p.name} still holds {m}"


def unbound_bytes(r: Runner, project: Path) -> dict[str, bytes | None]:
    """The custom files with bind's own lines taken back out (on a copy), to compare with the user content."""
    copy = project.parent / (project.name + "-unbind")
    shutil.copytree(project, copy)
    code, out = r.bind(copy, "unbind")
    assert code == 0, out
    files = {}
    for name in standard_files():
        p = custom(copy, name)
        files[name] = p.read_bytes() if p.exists() else None
    shutil.rmtree(copy, ignore_errors=True)
    return files


# ----------------------------------------------------------------------------- cases


def fresh_project(r: Runner, layout: str | None = None, files: dict[str, bytes] | None = None) -> Path:
    project = r.w.project()
    write_3x(project, layout_3x(SHOP, SHOP, JIRA) if layout is None else layout, standard_files() if files is None else files)
    return project


def c_fresh(r: Runner) -> None:
    project = fresh_project(r)
    layout_before = (project / "_bmad-output" / "project-layout.yaml").read_bytes()
    originals = {n: custom(project, n).read_bytes() for n in standard_files()}
    code, out, summary = r.migrate(project, "--answer", f"confluence_site={SITE}")
    assert code == 0, out
    assert summary["answers_written"] == 9 and summary["blocks_deleted"] == 4 and summary["bind_exit"] == 0, summary
    a = r.answers(project)
    assert a == {"jira_site": JIRA["url"], "jira_project_key": "SHOP", "jira_mcp_server": "", "confluence_site": SITE,
                 "confluence_mcp_server": "", "planning_space": "SHOP", "planning_root_page": "123456", "tickets_space": "",
                 "tickets_root_page": ""}, a
    no_markers(project)
    # a file bind does not target keeps exactly the user's bytes
    assert custom(project, "bmad-create-epics-and-stories.toml").read_bytes() == USER_EPICS.encode("utf-8")
    # bind's own lines out again: every file is the user content, byte for byte (CRLF, non-ASCII, no final newline)
    back = unbound_bytes(r, project)
    assert back["bmad-prd.toml"] == USER_PRD.encode("utf-8"), back["bmad-prd.toml"]
    assert back["bmad-ux.toml"] == USER_UX.encode("utf-8"), back["bmad-ux.toml"]
    assert back["bmad-architecture.toml"] in (None, b""), back["bmad-architecture.toml"]
    assert back["bmad-create-epics-and-stories.toml"] == USER_EPICS.encode("utf-8")
    code, out = r.bind(project, "status")
    assert "status: bound" in out, out
    assert "bmad-prd [workflow] external_handoffs: bound" in out or "external_handoffs: bound" in out, out
    # backups: one copy per changed file, equal to the original bytes
    backup = Path(summary["backup_dir"])
    index = [l.split("\t") for l in (backup / "index.txt").read_text(encoding="utf-8").splitlines()]
    assert sorted(rel for _, rel in index) == sorted(f"_bmad/custom/{n}" for n in originals), index
    for copy, rel in index:
        assert (backup / copy).read_bytes() == originals[rel.rsplit("/", 1)[1]], rel
    assert backup.parent.name == ".mv6" and backup.parent.parent == project
    # the 3.x record is read, never changed
    assert (project / "_bmad-output" / "project-layout.yaml").read_bytes() == layout_before
    text = report(project).read_text(encoding="utf-8")
    assert "status: done" in text, text[:300]
    for k in KEYS:
        assert f"`{k}`" in text, k
    for needle in ("mapped: from `sprint_management.jira_url`", "asked: answered by the user", "default: not in the 3.x binding",
                   "_bmad-output/project-layout.yaml` is kept", "lines 1-14 (publish hook block) deleted", "bind: 16 slot(s) bound"):
        assert needle in text, needle


def c_idempotent(r: Runner) -> None:
    project = fresh_project(r)
    code, out, _ = r.migrate(project, "--answer", f"confluence_site={SITE}")
    assert code == 0, out
    age(project)
    before = snapshot(project)
    code, out, summary = r.migrate(project, "--answer", f"confluence_site={SITE}")
    assert code == 0, out
    assert "nothing changed (already migrated)" in out, out
    assert summary["changed"] is False and summary["answers_written"] == 0 and summary["blocks_deleted"] == 0, summary
    after = snapshot(project)
    assert before.keys() == after.keys(), sorted(set(before) ^ set(after))
    changed = [k for k in before if before[k] != after[k]]
    assert not changed, f"rewritten by an idempotent run: {changed}"
    # and without the --answer the user gave the first time: still nothing to ask, nothing written
    code, out, _ = r.migrate(project)
    assert code == 0 and "already migrated" in out, out
    assert snapshot(project) == before


def c_asks(r: Runner) -> None:
    project = fresh_project(r)
    age(project)
    before = snapshot(project)
    code, out, summary = r.migrate(project)
    assert code == 3, out
    assert "ask: confluence_site:" in out and summary["asks"] == ["confluence_site"], out
    assert snapshot(project) == before, "a run that needs an answer wrote a file"
    assert not report(project).exists()


def c_two_stores(r: Runner) -> None:
    other = {"space": "SHOPDEV", "title": "Shop engineering", "id": None}
    project = fresh_project(r, layout_3x(SHOP, other, JIRA))
    code, out, summary = r.migrate(project, "--answer", f"confluence_site={SITE}")
    assert code == 3 and summary["asks"] == ["planning-store"], out
    assert "system (space SHOP" in out and "software (space SHOPDEV" in out, out
    code, out, _ = r.migrate(project, "--answer", f"confluence_site={SITE}", "--planning-store", "software")
    assert code == 0, out
    a = r.answers(project)
    assert (a["planning_space"], a["planning_root_page"], a["tickets_space"], a["tickets_root_page"]) == \
        ("SHOPDEV", "Shop engineering", "SHOP", "123456"), a
    assert "`software` became the planning destination" in report(project).read_text(encoding="utf-8")
    # a re-run without the choice: the destinations are answered, nothing is asked, nothing changes
    code, out, summary = r.migrate(project)
    assert code == 0 and "already migrated" in out and summary["changed"] is False, out


def c_damaged(r: Runner) -> None:
    files = standard_files()
    no_end = block_3x("bmad-prd", "system").replace("# END:ma-agents-confluence-publish\n", "").encode("utf-8") + b"x = 1\n"
    two_begins = (block_3x("bmad-architecture", "software").replace("#\n", "# BEGIN:ma-agents-confluence-publish\n", 1)).encode("utf-8")
    end_only = b"y = 2\n# END:ma-agents-confluence-publish\n"
    files.update({"bmad-prd.toml": no_end, "bmad-architecture.toml": two_begins, "team-notes.toml": end_only})
    project = fresh_project(r, files=files)
    code, out, summary = r.migrate(project, "--answer", f"confluence_site={SITE}")
    assert code == 1, out
    assert custom(project, "bmad-prd.toml").read_bytes() == no_end
    assert custom(project, "bmad-architecture.toml").read_bytes() == two_begins
    assert custom(project, "team-notes.toml").read_bytes() == end_only
    assert summary["blocks_deleted"] == 2, summary  # bmad-ux and bmad-create-epics-and-stories
    no_markers(project, skip=("bmad-prd.toml", "bmad-architecture.toml", "team-notes.toml"))
    text = report(project).read_text(encoding="utf-8")
    assert "status: incomplete" in text
    for needle in ("has no end marker", "a second 3.x begin marker", "with no begin marker", "refused, left unchanged"):
        assert needle in text, needle


def c_partial(r: Runner) -> None:
    # a file-system 3.x project with only the system store on Confluence, no root page, and no Jira
    project = fresh_project(r, layout_3x({"space": "SYS"}, None, None), files={})
    code, out, summary = r.migrate(project)
    assert code == 3 and summary["asks"] == ["jira_site", "jira_project_key", "confluence_site"], out
    code, out, _ = r.migrate(project, "--answer", "jira_site=https://jira.example.test", "--answer", "jira_project_key=OPS",
                             "--answer", f"confluence_site={SITE}")
    assert code == 0, out
    a = r.answers(project)
    assert (a["planning_space"], a["planning_root_page"], a["jira_project_key"]) == ("SYS", "", "OPS"), a
    text = report(project).read_text(encoding="utf-8")
    assert "`software_requirements_store` is a `file-system` store" in text and "not `jira`" in text, text
    # blocks without a layout: all four required answers asked, then migrated
    project = r.w.project()
    write_3x(project, None, standard_files())
    code, out, summary = r.migrate(project)
    assert code == 3 and summary["asks"] == ["jira_site", "jira_project_key", "confluence_site", "planning_space"], out
    # an unreadable layout: reported, nothing mapped from it
    project = fresh_project(r, layout="system_requirements_store:\n  - not a mapping\n", files={})
    code, out, summary = r.migrate(project)
    assert code == 3 and "planning_space" in summary["asks"], out
    code, out, _ = r.migrate(project, "--answer", "jira_site=j", "--answer", "jira_project_key=K",
                             "--answer", f"confluence_site={SITE}", "--answer", "planning_space=P")
    assert code == 0, out
    assert "could not be read" in report(project).read_text(encoding="utf-8")


def c_kept(r: Runner) -> None:
    project = fresh_project(r)
    r.answer_with_setup(project, {"jira_site": "https://jira.other.test", "jira_project_key": "SHOP", "jira_mcp_server": "",
                                  "confluence_site": SITE, "confluence_mcp_server": "", "planning_space": "SHOP",
                                  "planning_root_page": "", "tickets_space": "", "tickets_root_page": ""})
    team = project / "_bmad" / "config.toml"
    os.utime(team, (OLD, OLD))
    code, out, summary = r.migrate(project)
    assert code == 0, out
    assert summary["answers_written"] == 0 and summary["blocks_deleted"] == 4, summary
    assert team.stat().st_mtime == OLD, "setup rewrote the answers"
    assert r.answers(project)["jira_site"] == "https://jira.other.test"
    text = report(project).read_text(encoding="utf-8")
    assert "already answered; kept (the 3.x binding has `https://jira.example.test`" in text, text
    assert "No pending question" in text


def c_dry_run(r: Runner) -> None:
    project = fresh_project(r)
    age(project)
    before = snapshot(project)
    code, out, summary = r.migrate(project, "--answer", f"confluence_site={SITE}", "--dry-run")
    assert code == 0 and summary.get("dry_run") is True, out
    assert "dry run: nothing written" in out and "to delete" in out, out
    assert snapshot(project) == before


def c_strings(r: Runner) -> None:
    in_string = ('[workflow]\nnotes = """\n# BEGIN:ma-agents-confluence-publish\nkept\n# END:ma-agents-confluence-publish\n"""\n').encode("utf-8")
    trailing = b"# BEGIN:ma-agents-confluence-publish (copied from 3.x docs)\nz = 1\n"
    files = {"bmad-prd.toml": in_string, "bmad-product-brief.toml": trailing, "bmad-ux.toml": standard_files()["bmad-ux.toml"]}
    project = fresh_project(r, files=files)
    code, out, summary = r.migrate(project, "--answer", f"confluence_site={SITE}")
    assert code == 0, out
    assert summary["blocks_deleted"] == 1, summary
    back = unbound_bytes(r, project)
    assert back["bmad-prd.toml"] == in_string, back["bmad-prd.toml"]
    assert custom(project, "bmad-product-brief.toml").read_bytes().startswith(trailing)


def c_cli(r: Runner) -> None:
    result = run([tool("node"), str(r.script), "--help"])
    assert result.returncode == 0 and "--planning-store" in result.stdout, result.stdout + result.stderr
    empty = r.w.work / "no-bmad"
    empty.mkdir(exist_ok=True)
    result = run([tool("node"), str(r.script), "--project-root", str(empty)])
    assert result.returncode == 2 and "prerequisite:" in result.stdout, result.stdout
    project = fresh_project(r)
    result = run([tool("node"), str(r.script), "--project-root", str(project), "--answer", "jira_url=x"])
    assert result.returncode == 2 and "the key must be one of" in result.stdout, result.stdout
    result = run([tool("node"), str(r.script), "--project-root", str(project), "--planning-store", "both"])
    assert result.returncode == 2, result.stdout
    # nothing 3.x: nothing to migrate
    plain = r.w.project()
    result = run([tool("node"), str(r.script), "--project-root", str(plain), "--skills-root", str(r.w.skills)])
    assert result.returncode == 0 and "nothing to migrate" in result.stdout, result.stdout


CASES = {
    "fresh": (c_fresh, "fresh: answers mapped and asked through setup, 3.x blocks deleted byte for byte, bind bound, backups, report, layout unchanged"),
    "idempotent": (c_idempotent, "second run: no file written, mtimes kept, 'already migrated'"),
    "asks": (c_asks, "a required answer the 3.x binding lacks: exit 3, nothing written"),
    "two-stores": (c_two_stores, "two different Confluence stores: exit 3 until --planning-store; then planning and tickets destinations"),
    "damaged": (c_damaged, "damaged 3.x markers (no end, two begins, end only): refused and unchanged, the rest migrated, exit 1"),
    "partial": (c_partial, "partial binding: file-system stores and no Jira, blocks without a layout, an unreadable layout"),
    "kept": (c_kept, "answers already given: kept, setup not asked, a differing 3.x value reported"),
    "dry-run": (c_dry_run, "dry run writes nothing"),
    "strings": (c_strings, "a marker inside a multi-line string, or with trailing text, is not a marker"),
    "cli": (c_cli, "command line: --help, exit 2 without _bmad/ or with a bad argument, nothing to migrate"),
}

# (name, old, new, the case that must fail)
MUTANTS = (
    ("blocks not deleted", "      fs.writeFileSync(f.file, Buffer.from(withoutBlocks(f.lines, f.blocks), 'latin1'));\n", "\n", "fresh"),
    ("bytes re-encoded as UTF-8", "Buffer.from(withoutBlocks(f.lines, f.blocks), 'latin1')", "Buffer.from(withoutBlocks(f.lines, f.blocks), 'utf8')", "fresh"),
    ("line endings normalised", ".map((l) => l.text + l.eol).join('')", ".map((l) => l.text + '\\n').join('')", "fresh"),
    ("no backup", "      backup(ctx, f.file);\n", "\n", "fresh"),
    ("bind not run", "uvRun(ctx.bind, ['bind',", "uvRun(ctx.bind, ['status',", "fresh"),
    ("report rewritten on a re-run", "if (changed || !fs.existsSync(report)) {", "if (true) {", "idempotent"),
    ("asks ignored", "    if (allAsks.length) {\n", "    if (false) {\n", "asks"),
    ("two stores merged without asking", "if (a.space === b.space && a.root === b.root) {", "if (true) {", "two-stores"),
    ("unterminated block accepted", "  if (open) return { blocks, error: `the 3.x begin marker", "  if (false) return { blocks, error: `the 3.x begin marker", "damaged"),
    ("answered questions re-sent to setup", "    if (pendingKeys.has(key)) {\n", "    if (true) {\n", "kept"),
    ("markers matched inside strings", "        inString = delim;\n", "        inString = null;\n", "strings"),
)


def run_cases(runner: Runner, names: list[str], log) -> list[str]:
    failed = []
    for name in names:
        fn, label = CASES[name]
        start = time.monotonic()
        try:
            fn(runner)
        except Exception:  # noqa: BLE001 - report every failure and keep going
            failed.append(name)
            log(f"  x {name}: {label}")
            log("    " + " | ".join(traceback.format_exc().strip().splitlines()[-3:])[-900:])
            continue
        log(f"  + {name}: {label} ({time.monotonic() - start:.1f}s)")
    return failed


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--tree", type=Path, default=os.environ.get("BMAD_V7_TREE"), help="BMAD-METHOD checkout at the pinned commit")
    parser.add_argument("--mutants", action="store_true", help="also run every mutant of migrate_binding.js")
    parser.add_argument("--case", action="append", default=[], choices=sorted(CASES))
    parser.add_argument("--keep", action="store_true", help="keep the scratch folder")
    args = parser.parse_args(argv)
    if sys.platform == "win32":
        sys.stdout.reconfigure(encoding="utf-8")
    log = lambda s: print(s, flush=True)  # noqa: E731
    work = Path(tempfile.mkdtemp(prefix="test-migrate-binding-"))
    try:
        if args.tree is None or not (Path(args.tree) / "skills" / "bmad" / "scripts" / "setup.py").is_file():
            raise Prerequisite("--tree (or BMAD_V7_TREE) must be a BMAD-METHOD checkout at the pinned commit")
        node_version = run([tool("node"), "--version"]).stdout.strip()
        if not re.match(r"v(\d+)\.(\d+)", node_version) or tuple(map(int, re.match(r"v(\d+)\.(\d+)", node_version).groups())) < (22, 20):
            raise Prerequisite(f"node {node_version}: the script needs Node >= 22.20")
        world = World(Path(args.tree).resolve(), work)
        world.build()
    except Prerequisite as error:
        print(f"prerequisite: {error}", file=sys.stderr)
        shutil.rmtree(work, ignore_errors=True)
        return 2
    log("\n ma-atlassian migration 1: migrate_binding.js (Story 38.5)\n")
    log(f"  scratch project: {len(world.names)} core skills set up, then {list(MODULE_FOLDERS)} copied (nine questions pending); node {node_version}\n")
    names = args.case or list(CASES)
    failed = run_cases(Runner(world, SCRIPT), names, log)
    green = []
    if args.mutants:
        log("\n  mutants of migrate_binding.js (each must turn its case red):")
        source = SCRIPT.read_text(encoding="utf-8")
        for i, (name, old, new, case) in enumerate(MUTANTS):
            if source.count(old) != 1:
                failed.append(f"mutant {name}")
                log(f"  x mutant {name}: the text to mutate occurs {source.count(old)} times")
                continue
            copy = work / f"mutant-{i:02d}" / "migrate_binding.js"
            copy.parent.mkdir()
            copy.write_text(source.replace(old, new), encoding="utf-8", newline="\n")
            sink: list[str] = []
            red = run_cases(Runner(world, copy), [case], sink.append)
            if red:
                log(f"  ok mutant {name}: {case} red ({sink[-1].strip()[:200]})")
            else:
                green.append(name)
                log(f"  x mutant {name}: {case} stayed green")
    if not args.keep:
        shutil.rmtree(work, ignore_errors=True)
    total = len(names)
    log(f"\n  {total - len(failed)} passed, {len(failed)} failed" + (f"; {len(MUTANTS) - len(green)} of {len(MUTANTS)} mutants red" if args.mutants else "") + "\n")
    return 1 if failed or green else 0


if __name__ == "__main__":
    sys.exit(main())
