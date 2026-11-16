#!/usr/bin/env python3
# /// script
# requires-python = ">=3.11"
# ///
"""Tests of `skills/ma-atlassian-bind/scripts/bind.py` (Story 38.3; FR289, FR290, FR291, FR300, FR301, FR303).

A scratch project gets the pinned `core-tools` and `method` skills (the member lists read from the tree's
records, copied, not installed through the Skills CLI) and this repository's `ma-atlassian` record and members,
then `setup.py --module-answers` writes the nine answers. Each case runs on a fresh copy of that project's
`_bmad/` against the copied skills, and calls `bind.main()` in process (the resolver and `resolve_config.py`
still run as `uv run --no-cache` subprocesses, as in a real run). The store starter is the shipped one,
`skills/ma-atlassian-bind/config/jira-onprem-ticketing.toml` (Story 38.2), unless `--starter FILE` names
another; the expected key counts are read from it.

Cases: fresh bind (every slot, the store file, Sofia's `read_store.py`, the six targets without `workflow.md`
through the resolver); idempotent re-bind (no write); user-key collision (file unchanged) and a scalar in the
personal layer; undeclared key (slot missing, never written, an earlier pair removed); unparsable file and
damaged markers (unchanged); existing header reused, CRLF and no-final-newline bytes kept; unbind restoring
every file byte for byte (created files deleted, user store keys kept); status (destinations, missing answers,
`tickets_space` fallback, outdated after an answer change); not installed; starter missing; a personal layer
that does not parse on a target without `workflow.md` (the resolver check restores the file); `render_skill.py`
on the bound targets that have a `workflow.md`; the output through `tools/validate_customize.py`; the command
line through `uv run --no-cache`.

`--mutants` applies one source mutation per copy of `bind.py` and requires the case named for it to fail.

Usage: uv run --no-cache tools/test_bind.py --tree BMAD_TREE [--mutants] [--case NAME ...] [--starter FILE]
Exit: 0 every case passed (and every mutant red), 1 otherwise, 2 a prerequisite is missing.
"""

from __future__ import annotations

import argparse
import importlib.util
import io
import json
import os
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
SKILL = REPO / "skills" / "ma-atlassian-bind"
SCRIPT = SKILL / "scripts" / "bind.py"
TARGETS = SKILL / "references" / "bind-targets.toml"
STARTER = SKILL / "config" / "jira-onprem-ticketing.toml"
VALIDATOR = HERE / "validate_customize.py"
CORE_RECORDS = ("bmod-core-tools", "bmod-method")
MODULE_FOLDERS = ("bmod-ma-atlassian", "ma-atlassian-bind", "ma-atlassian-confluence-plan", "ma-atlassian-confluence-record-root-page")
NO_WORKFLOW = ("bmad-prd", "bmad-architecture", "bmad-facilitate", "bmad-ux", "bmad-product-brief", "bmad-prfaq")
ANSWERS = {
    "jira_site": "https://jira.example.test",
    "jira_project_key": "SHOP",
    "jira_mcp_server": "",
    "confluence_site": "https://wiki.example.test",
    "confluence_mcp_server": "corp-confluence",
    "planning_space": "PLAN",
    "planning_root_page": "",
    "tickets_space": "",
    "tickets_root_page": "",
}
OLD = 978307200  # an mtime no write can produce


class Prerequisite(RuntimeError):
    pass


def leaf_paths(table: dict, prefix: str = "") -> list[str]:
    out: list[str] = []
    for key, value in table.items():
        out += leaf_paths(value, f"{prefix}{key}.") if isinstance(value, dict) else [f"{prefix}{key}"]
    return out


def uv() -> str:
    found = shutil.which("uv")
    if not found:
        raise Prerequisite("uv not on PATH")
    return found


def run(argv: list[str], cwd: Path | None = None) -> subprocess.CompletedProcess:
    env = {**os.environ, "PYTHONIOENCODING": "utf-8"}
    return subprocess.run(argv, cwd=cwd, capture_output=True, text=True, encoding="utf-8", errors="replace",
                          stdin=subprocess.DEVNULL, env=env, check=False)


def load(path: Path):
    spec = importlib.util.spec_from_file_location(f"bind_{abs(hash(str(path)))}", path)
    module = importlib.util.module_from_spec(spec)
    assert spec.loader is not None
    sys.modules[spec.name] = module  # dataclasses look their module up there
    spec.loader.exec_module(module)
    return module


# ----------------------------------------------------------------------------- the scratch project


class World:
    """The base project (skills + `_bmad/` after setup) and per-case copies."""

    def __init__(self, tree: Path, work: Path, starter: Path) -> None:
        self.tree, self.work, self.starter = tree, work, starter
        self.base = work / "base"
        self.skills = self.base / ".claude" / "skills"
        self.counter = 0
        self.keys = len(leaf_paths(tomllib.loads(starter.read_text(encoding="utf-8"))))

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
        for name in MODULE_FOLDERS:
            shutil.copytree(REPO / "skills" / name, self.skills / name, ignore=shutil.ignore_patterns("__pycache__"))
        answers = self.work / "answers.toml"
        answers.write_text('[modules."ma-atlassian"]\n' + "".join(f"{k} = {json.dumps(v)}\n" for k, v in ANSWERS.items()),
                           encoding="utf-8")
        result = run([uv(), "run", "--no-cache", str(tree_skills / "bmad" / "scripts" / "setup.py"), "--project-root",
                      str(self.base), "--skill", str(self.skills / "bmad"), "--root", str(self.skills),
                      "--module-answers", str(answers)])
        answers.unlink()
        if result.returncode != 0:
            raise Prerequisite(f"setup.py --module-answers exited {result.returncode}: {result.stderr or result.stdout}")
        self.names = names

    def project(self) -> Path:
        self.counter += 1
        project = self.work / f"p{self.counter:02d}"
        shutil.copytree(self.base / "_bmad", project / "_bmad", ignore=shutil.ignore_patterns("render"))
        return project

    def skills_copy(self, drop: tuple[str, ...] = ()) -> Path:
        self.counter += 1
        root = self.work / f"s{self.counter:02d}"
        shutil.copytree(self.skills, root, ignore=lambda d, names: [n for n in names if Path(d) == self.skills and n in drop])
        return root


class Runner:
    def __init__(self, world: World, module) -> None:
        self.w, self.b = world, module

    def call(self, command: str, project: Path, skills: Path | None = None, starter: Path | None = None) -> tuple[int, list[str]]:
        lines: list[str] = []
        code = self.b.main([command, "--project-root", str(project), "--skills-root", str(skills or self.w.skills),
                            "--targets", str(TARGETS), "--starter", str(starter or self.w.starter)], out=lines.append)
        return code, lines


def custom(project: Path, name: str) -> Path:
    return project / "_bmad" / "custom" / name


def slot_lines(lines: list[str], state: str) -> list[str]:
    return [l for l in lines if l.split(": ", 1)[-1].startswith(state) and (" [workflow] " in l or " [agent] " in l)]


def table_slots() -> list[dict]:
    return tomllib.loads(TARGETS.read_text(encoding="utf-8"))["slot"]


def resolve(world: World, project: Path, skill: str, keys: list[str], skills: Path | None = None) -> dict:
    argv = [uv(), "run", "--no-cache", str(project / "_bmad" / "scripts" / "resolve_customization.py"),
            "--skill", str((skills or world.skills) / skill), "--project-root", str(project)]
    for key in keys:
        argv += ["--key", key]
    result = run(argv)
    assert result.returncode == 0, result.stderr
    return json.loads(result.stdout)


def validator(world: World, project: Path) -> subprocess.CompletedProcess:
    return run([uv(), "run", "--no-cache", str(VALIDATOR), "--tree", str(world.tree), "--custom-dir", str(project / "_bmad" / "custom")])


def set_team_answers(project: Path, **values: str) -> None:
    custom(project, "config.toml").write_text(
        "[modules.ma-atlassian]\n" + "".join(f"{k} = {json.dumps(v)}\n" for k, v in values.items()), encoding="utf-8")


# ----------------------------------------------------------------------------- cases


def c_fresh(r: Runner) -> None:
    p = r.w.project()
    code, out = r.call("bind", p)
    assert code == 0, out
    slots = table_slots()
    assert len(slot_lines(out, "written")) == len(slots) == 16, out
    for skill in {s["skill"] for s in slots}:
        text = custom(p, f"{skill}.toml").read_text(encoding="utf-8")
        for s in (s for s in slots if s["skill"] == skill):
            assert f"# ma-atlassian:start {s['table']}.{s['key']}\n" in text, (skill, s["key"])
        assert text.count("# ma-atlassian:end") == text.count("# ma-atlassian:start ")
    store = custom(p, "ticketing-store-config.toml")
    data = tomllib.loads(store.read_text(encoding="utf-8"))
    assert data["tickets"]["store"] == "jira-onprem" and data["tickets"]["site"] == ANSWERS["jira_site"]
    assert data["tickets"]["key"] == ANSWERS["jira_project_key"] and data["tickets"]["mcp_server"] == ANSWERS["jira_mcp_server"]
    starter = tomllib.loads(r.w.starter.read_text(encoding="utf-8"))
    for path, value in r.b.leaves(starter):
        if path not in ("tickets.site", "tickets.key", "tickets.mcp_server"):
            assert r.b.lookup(data, path) == (True, value), path
    rs = run([uv(), "run", "--no-cache", str(r.w.skills / "bmad-agent-po" / "scripts" / "read_store.py"),
              "--project-root", str(p), "-k", "tickets.store", "-k", "tickets.site", "-k", "verbs.write"])
    got = json.loads(rs.stdout)
    assert rs.returncode == 0 and got["tickets.store"] == "jira-onprem" and got["tickets.site"] == ANSWERS["jira_site"], rs.stdout + rs.stderr
    # the six targets without workflow.md: present, bound, and the resolver returns our value
    for skill in NO_WORKFLOW:
        assert not (r.w.skills / skill / "workflow.md").exists(), f"{skill} has a workflow.md at the pin"
        mine = [s for s in slots if s["skill"] == skill]
        assert mine, skill
        resolved = resolve(r.w, p, skill, [f"{s['table']}.{s['key']}" for s in mine])
        own = tomllib.loads(custom(p, f"{skill}.toml").read_text(encoding="utf-8"))
        for s in mine:
            path = f"{s['table']}.{s['key']}"
            assert r.b.contains(resolved[path], r.b.lookup(own, path)[1]), (skill, path)
    # values: answers substituted, MCP server name never embedded, {project-root} left for the agent
    po = custom(p, "bmad-agent-po.toml").read_text(encoding="utf-8")
    # Sofia's facts point at the store's identity rule (the starter's [tickets] access) instead of copying it
    assert "-k tickets.access" in po and "currentUser()" not in po and "currentUser()" in data["tickets"]["access"], po
    assert ANSWERS["jira_project_key"] in po and ANSWERS["confluence_mcp_server"] not in po
    assert "{project-root}" in po and "{planning_root}" not in po and "{tickets_space}" not in po


def c_idempotent(r: Runner) -> None:
    p = r.w.project()
    assert r.call("bind", p)[0] == 0
    files = sorted(custom(p, "").glob("*.toml"))
    before = {f: f.read_bytes() for f in files}
    for f in files:
        os.utime(f, (OLD, OLD))
    code, out = r.call("bind", p)
    assert code == 0, out
    assert len(slot_lines(out, "unchanged")) == 16 and not slot_lines(out, "written") and not slot_lines(out, "updated"), out
    assert any(f"0 key(s) written, 0 updated, {r.w.keys} unchanged" in l for l in out), out
    for f in files:
        assert f.read_bytes() == before[f] and int(f.stat().st_mtime) == OLD, f"{f.name} rewritten by an idempotent bind"


def c_collision(r: Runner) -> None:
    p = r.w.project()
    user = b'# our team\n[workflow]\nexternal_handoffs = ["Mirror the PRD to our wiki."]\n'
    prd = custom(p, "bmad-prd.toml")
    prd.write_bytes(user)
    ux_user = custom(p, "bmad-ux.user.toml")
    ux_user.write_bytes(b'[workflow]\non_complete = "Tell me when done."\n')
    code, out = r.call("bind", p)
    assert code == 1, out
    assert any(l.startswith("bmad-prd [workflow] external_handoffs: collision (user value in _bmad/custom/bmad-prd.toml; file unchanged)") for l in out), out
    assert any(l.startswith("bmad-prd [workflow] external_sources: not written (the file has a collision)") for l in out), out
    assert prd.read_bytes() == user, "a file with a collision was changed"
    assert any(l.startswith("bmad-ux [workflow] on_complete: collision (user layer)") for l in out), out
    assert not custom(p, "bmad-ux.toml").exists(), "bmad-ux.toml written although the personal layer sets on_complete"
    assert any(l.startswith("bmad-architecture [workflow] external_handoffs: written") for l in out), "other targets must still bind"
    code, out = r.call("status", p)
    assert any("bmad-prd [workflow] external_handoffs: collision (user value in _bmad/custom/bmad-prd.toml)" in l for l in out), out
    assert any("bmad-ux [workflow] on_complete: collision (user value in bmad-ux.user.toml)" in l for l in out), out


def c_undeclared(r: Runner) -> None:
    p = r.w.project()
    assert r.call("bind", p)[0] == 0
    skills = r.w.skills_copy()
    cfg = skills / "bmad-facilitate" / "customize.toml"
    text = cfg.read_text(encoding="utf-8")
    assert "\nexternal_sources = []" in text
    cfg.write_text(text.replace("\nexternal_sources = []", "\n"), encoding="utf-8")
    po = skills / "bmad-agent-po" / "customize.toml"
    po.write_text(po.read_text(encoding="utf-8").replace('\nstore_after = ""', '\nstore_after = []'), encoding="utf-8")
    code, out = r.call("bind", p, skills=skills)
    assert code == 0, out
    assert any(l.startswith("bmad-facilitate [workflow] external_sources: slot missing") and "stale pair removed" in l for l in out), out
    assert any(l.startswith("bmad-agent-po [workflow] store_after: slot missing") for l in out), out
    fac = tomllib.loads(custom(p, "bmad-facilitate.toml").read_text(encoding="utf-8"))
    assert "external_sources" not in fac["workflow"] and "external_handoffs" in fac["workflow"], fac
    assert "store_after" not in tomllib.loads(custom(p, "bmad-agent-po.toml").read_text(encoding="utf-8"))["workflow"]
    q = r.w.project()
    code, out = r.call("bind", q, skills=skills)
    assert not r.b.lookup(tomllib.loads(custom(q, "bmad-facilitate.toml").read_text(encoding="utf-8")), "workflow.external_sources")[0]
    code, out = r.call("status", q, skills=skills)
    assert any(l.startswith("bmad-facilitate [workflow] external_sources: slot missing") for l in out), out
    # render_skill.py would halt bmad-agent-po on an undeclared key; the output must render against the changed skill
    result = run([uv(), "run", "--no-cache", str(q / "_bmad" / "scripts" / "render_skill.py"), "--project-root", str(q),
                  "--skill", str(skills / "bmad-agent-po")])
    assert result.returncode == 0, result.stdout[-500:]


def c_unparsable(r: Runner) -> None:
    p = r.w.project()
    bad = b"[workflow\non_complete = \n"
    ux = custom(p, "bmad-ux.toml")
    ux.write_bytes(bad)
    damaged = b"[workflow]\n# ma-atlassian:start workflow.activation_steps_prepend\nactivation_steps_prepend = []\n"
    build = custom(p, "bmad-build.toml")
    build.write_bytes(damaged)
    code, out = r.call("bind", p)
    assert code == 1, out
    assert any(l.startswith("bmad-ux [workflow] on_complete: refused") and "does not parse as TOML" in l for l in out), out
    assert any(l.startswith("bmad-build [workflow] activation_steps_prepend: refused") and "no end marker" in l for l in out), out
    assert ux.read_bytes() == bad and build.read_bytes() == damaged, "a refused file was changed"
    code, out = r.call("unbind", p)
    assert code == 1 and ux.read_bytes() == bad and build.read_bytes() == damaged, out


def c_bytes(r: Runner) -> None:
    p = r.w.project()
    prd = custom(p, "bmad-prd.toml")
    prd_user = b"# team PRD rules\r\n[workflow]\r\npersistent_facts = [\r\n  \"Money is integer cents.\",\r\n]\r\n\r\n# keep this comment\r\n[[workflow.extra]]\r\nid = \"x\"\r\n"
    prd.write_bytes(prd_user)
    ux = custom(p, "bmad-ux.toml")
    ux_user = b"[workflow]\nactivation_steps_append = []"  # no final newline
    ux.write_bytes(ux_user)
    code, out = r.call("bind", p)
    # [[workflow.extra]] is not declared by bmad-prd: not ours to judge; bind validates only its own keys
    text = prd.read_bytes()
    assert code == 0, out
    assert text.startswith(b"# team PRD rules\r\n[workflow]\r\npersistent_facts = [\r\n  \"Money is integer cents.\",\r\n]\r\n# ma-atlassian:start workflow.external_handoffs\r\n"), text[:300]
    assert text.count(b"[workflow]") == 1, "the existing [workflow] header was not reused"
    assert b"ma-atlassian:created" not in text
    assert not any(line.endswith(b"\n") and not line.endswith(b"\r\n") for line in text.splitlines(keepends=True)), "an LF line in a CRLF file"
    assert text.endswith(b"\r\n\r\n# keep this comment\r\n[[workflow.extra]]\r\nid = \"x\"\r\n"), text[-120:]
    data = tomllib.loads(text.decode("utf-8"))
    assert data["workflow"]["persistent_facts"] == ["Money is integer cents."] and data["workflow"]["extra"] == [{"id": "x"}]
    u = ux.read_bytes()
    assert u.startswith(ux_user + b"\n# ma-atlassian:start workflow.on_complete\n") and u.endswith(b"# ma-atlassian:end"), u


def c_unbind(r: Runner) -> None:
    p = r.w.project()
    originals = {
        "bmad-prd.toml": b"# team PRD rules\r\n[workflow]\r\npersistent_facts = [\"x\"]\r\n\r\n# keep\r\n",
        "bmad-ux.toml": b"[workflow]\nactivation_steps_append = []",
        "bmad-agent-po.toml": b"# Sofia team rules\n[workflow]\npublication = \"on_start\"\n",
        "bmad-build.toml": b"[workflow]\n",
        "ticketing-store-config.toml": b"# our store\n[tickets]\nkey = \"OPS\"\n",
    }
    for name, data in originals.items():
        custom(p, name).write_bytes(data)
    code, out = r.call("bind", p)
    assert code == 0, out
    assert any("1 kept (user value): tickets.key" in l for l in out), out
    store = tomllib.loads(custom(p, "ticketing-store-config.toml").read_text(encoding="utf-8"))
    assert store["tickets"]["key"] == "OPS" and store["tickets"]["store"] == "jira-onprem"
    code, out = r.call("status", p)
    assert any(f"ticketing-store-config.toml: bound ({r.w.keys - 1} of {r.w.keys} starter key(s) written by bind, 1 kept from the user)" in l for l in out), out
    code, out = r.call("unbind", p)
    assert code == 0, out
    for name, data in originals.items():
        assert custom(p, name).read_bytes() == data, f"{name} not restored: {custom(p, name).read_bytes()!r}"
    created = {f"{s['skill']}.toml" for s in table_slots()} - set(originals)
    for name in created:
        assert not custom(p, name).exists(), f"{name}, created by bind, not deleted by unbind"
    assert custom(p, "config.user.toml").exists(), "unbind touched a file it never wrote"
    code, out = r.call("unbind", p)
    assert code == 0 and out[-1].endswith("nothing was bound"), out


def c_status(r: Runner) -> None:
    p = r.w.project()
    code, out = r.call("status", p)
    assert code == 0, out
    assert out[0] == f"destination planning: site {ANSWERS['confluence_site']}, space PLAN, root page (empty: a page named for the project)", out[0]
    assert out[1].startswith("destination tickets: site https://wiki.example.test, space PLAN (empty: the planning space)"), out[1]
    assert len(slot_lines(out, "unbound")) == 16 and out[-1].startswith("status: unbound"), out
    set_team_answers(p, planning_space="", jira_site="")
    code, out = r.call("status", p)
    assert "unbound: missing answer jira_site" in out and "unbound: missing answer planning_space" in out, out
    code, out = r.call("bind", p)
    assert code == 2 and "unbound: missing answer planning_space" in out, out
    assert not custom(p, "bmad-prd.toml").exists(), "bind wrote with a required answer empty"
    set_team_answers(p, tickets_space="TIX", tickets_root_page="Tickets home")
    assert r.call("bind", p)[0] == 0
    code, out = r.call("status", p)
    assert out[1] == "destination tickets: site https://wiki.example.test, space TIX, root page Tickets home", out[1]
    assert out[-1] == "status: bound", out
    build = custom(p, "bmad-build.toml").read_text(encoding="utf-8")
    assert "space TIX, under the page \\\"Tickets home\\\"" in build and "space PLAN" not in build, build
    set_team_answers(p, tickets_space="TIX", tickets_root_page="Tickets home", confluence_site="https://wiki2.example.test")
    code, out = r.call("status", p)
    # every slot that names the Confluence site; Sofia's facts name only Jira
    assert len(slot_lines(out, "outdated")) == 15 and any(l.startswith("bmad-agent-po [agent] persistent_facts: bound") for l in out), out
    code, out = r.call("bind", p)
    assert code == 0 and len(slot_lines(out, "updated")) == 15 and len(slot_lines(out, "unchanged")) == 1, out
    assert r.call("status", p)[1][-1] == "status: bound"
    q = r.w.project()
    assert r.call("bind", q)[0] == 0
    assert "space PLAN, under the page named for the project" in custom(q, "bmad-build.toml").read_text(encoding="utf-8")


def c_not_installed(r: Runner) -> None:
    p = r.w.project()
    skills = r.w.skills_copy(drop=("bmad-prfaq",))
    code, out = r.call("bind", p, skills=skills)
    assert code == 0, out
    assert "bmad-prfaq [workflow] on_complete: not installed" in out and not custom(p, "bmad-prfaq.toml").exists(), out
    assert "bmad-prfaq [workflow] on_complete: not installed  -- publish to the planning destination" in r.call("status", p, skills=skills)[1]


def c_starter_missing(r: Runner) -> None:
    p = r.w.project()
    code, out = r.call("bind", p, starter=r.w.work / "no-such-starter.toml")
    assert code == 1, out
    assert any(l.startswith("ticketing-store-config.toml: starter missing") for l in out), out
    assert len(slot_lines(out, "written")) == 16 and not custom(p, "ticketing-store-config.toml").exists(), out


def c_resolver_check(r: Runner) -> None:
    p = r.w.project()
    custom(p, "bmad-prd.user.toml").write_bytes(b"[workflow\n")
    code, out = r.call("bind", p)
    assert code == 1, out
    assert any(l.startswith("bmad-prd [workflow] external_handoffs: refused (resolve_customization.py exited") and "file restored" in l for l in out), out
    assert not custom(p, "bmad-prd.toml").exists(), "a file whose values the resolver does not return was kept"
    assert any(l.startswith("bmad-ux [workflow] on_complete: written") for l in out)


def c_render(r: Runner) -> None:
    p = r.w.project()
    assert r.call("bind", p)[0] == 0
    rendered = 0
    for skill in sorted({s["skill"] for s in table_slots()}):
        if not (r.w.skills / skill / "workflow.md").is_file():
            continue
        result = run([uv(), "run", "--no-cache", str(p / "_bmad" / "scripts" / "render_skill.py"), "--project-root", str(p),
                      "--skill", str(r.w.skills / skill)])
        assert result.returncode == 0 and not result.stdout.startswith("HALT"), f"{skill}: {result.stdout[-400:]}"
        rendered += 1
    assert rendered == 5, rendered  # bmad-agent-po, bmad-build, bmad-build-auto, bmad-code-review, bmad-retrospective


def c_validator(r: Runner) -> None:
    p = r.w.project()
    custom(p, "bmad-agent-po.toml").write_bytes(b"[workflow]\npublication = \"on_start\"\n")
    custom(p, "ticketing-store-config.toml").write_bytes(b"[tickets]\nkey = \"OPS\"\n")
    assert r.call("bind", p)[0] == 0
    result = validator(r.w, p)
    assert result.returncode == 0, result.stdout + result.stderr
    assert result.stdout.strip().splitlines()[-1] == "OK: 0 member file(s), 13 override file(s), 0 finding(s)", result.stdout


def c_cli(r: Runner) -> None:
    script = r.w.skills / "ma-atlassian-bind" / "scripts" / "bind.py"
    result = run([uv(), "run", "--no-cache", str(script), "--help"])
    assert result.returncode == 0 and "bind" in result.stdout, result.stderr
    p = r.w.project()
    result = run([uv(), "run", "--no-cache", str(script), "bind", "--project-root", str(p), "--starter", str(r.w.starter)])
    assert result.returncode == 0 and "bind: 16 slot(s) bound" in result.stdout, result.stdout + result.stderr
    result = run([uv(), "run", "--no-cache", str(script), "status", "--project-root", str(p), "--starter", str(r.w.starter)])
    assert result.returncode == 0 and result.stdout.strip().splitlines()[-1] == "status: bound", result.stdout
    result = run([uv(), "run", "--no-cache", str(script), "status", "--project-root", str(r.w.work)])
    assert result.returncode == 2 and "prerequisite:" in result.stdout, result.stdout


CASES = {
    "fresh": (c_fresh, "fresh bind: 16 slots, every starter key, read_store.py, the six targets without workflow.md through the resolver"),
    "idempotent": (c_idempotent, "re-bind writes nothing (bytes and mtime unchanged)"),
    "collision": (c_collision, "a user key: collision, file unchanged; a personal-layer scalar: collision, nothing written"),
    "undeclared": (c_undeclared, "undeclared or reshaped slot: reported missing, never written, earlier pair removed, render still exits 0"),
    "unparsable": (c_unparsable, "a file that does not parse and one with a damaged marker: refused, unchanged by bind and unbind"),
    "bytes": (c_bytes, "existing header reused; CRLF and no-final-newline bytes kept"),
    "unbind": (c_unbind, "unbind restores every file byte for byte, deletes created files, keeps user store keys"),
    "status": (c_status, "status: destinations, missing answers, tickets_space fallback, outdated after an answer change"),
    "not-installed": (c_not_installed, "a target absent on disk is reported, not failed"),
    "starter-missing": (c_starter_missing, "starter missing: reported, skill targets still bound, exit 1"),
    "resolver": (c_resolver_check, "a target without workflow.md whose values the resolver does not return: file restored"),
    "render": (c_render, "render_skill.py exits 0 on the five bound targets that have a workflow.md"),
    "validator": (c_validator, "bind's output passes tools/validate_customize.py (36.4 contract)"),
    "cli": (c_cli, "command line: uv run --no-cache bind.py --help / bind / status; exit 2 without _bmad"),
}

# (name, old, new, the case that must fail)
MUTANTS = (
    ("collision ignored", "        if defined or masked:\n", "        if False:\n", "collision"),
    ("undeclared key written", "            if slot_declared(defaults, slot):\n", "            if True:\n", "undeclared"),
    ("parse error ignored", '        raise Refused(f"{what} does not parse as TOML: {error}") from None\n', "        return {}\n", "unparsable"),
    ("header always created", "    if header is not None:\n        insert_after", "    if False:\n        insert_after", "bytes"),
    ("re-bind reports updated", '"unchanged" if current == want.value else "updated"', '"updated"', "idempotent"),
    ("unbind keeps created headers", "    headers = removed_created(lines)\n", "    headers = 0\n", "unbind"),
    ("no final-newline shape on delete", '        lines[first - 1][1] = ""\n', "        pass\n", "unbind"),
    ("store overwrites user keys", '"kept" if store else', '"written" if store else', "unbind"),
    ("status hides missing answers", '    for key in missing:\n        out(f"unbound: missing answer {key}")\n    unbound = len(missing)\n', "    unbound = 0\n", "status"),
    ("no tickets_space fallback", '"tickets_space": answers["tickets_space"] or answers["planning_space"]', '"tickets_space": answers["tickets_space"]', "status"),
    ("resolver check skipped", "            invalid = resolver_holds(ctx, skill, ours) if ours else None\n", "            invalid = None\n", "resolver"),
    ("resolver check only with workflow.md", "            invalid = resolver_holds(ctx, skill, ours) if ours else None\n",
     '            invalid = resolver_holds(ctx, skill, ours) if ours and (ctx.skills_root / skill / "workflow.md").is_file() else None\n', "resolver"),
    ("LF written into CRLF files", "    eol = first_eol(lines)\n    for path in stale:", '    eol = "\\n"\n    for path in stale:', "bytes"),
    ("idempotent re-bind rewrites", "        if plan.changed:\n            write_text(path, plan.text)\n            ours",
     "        if True:\n            write_text(path, plan.text or text)\n            ours", "idempotent"),
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
    parser.add_argument("--mutants", action="store_true", help="also run every mutant of bind.py")
    parser.add_argument("--case", action="append", default=[], choices=sorted(CASES))
    parser.add_argument("--starter", type=Path, default=STARTER, help="store starter (default: the shipped config/jira-onprem-ticketing.toml)")
    parser.add_argument("--keep", action="store_true", help="keep the scratch folder")
    args = parser.parse_args(argv)
    if sys.platform == "win32":
        sys.stdout.reconfigure(encoding="utf-8")
    log = lambda s: print(s, flush=True)  # noqa: E731
    starter = args.starter.resolve()
    work = Path(tempfile.mkdtemp(prefix="test-bind-"))
    try:
        if args.tree is None or not (Path(args.tree) / "skills" / "bmad" / "scripts" / "setup.py").is_file():
            raise Prerequisite("--tree (or BMAD_V7_TREE) must be a BMAD-METHOD checkout at the pinned commit")
        if not starter.is_file():
            raise Prerequisite(f"store starter {starter} not found")
        world = World(Path(args.tree).resolve(), work, starter)
        world.build()
    except Prerequisite as error:
        print(f"prerequisite: {error}", file=sys.stderr)
        shutil.rmtree(work, ignore_errors=True)
        return 2
    log(f"\n ma-atlassian-bind bind / unbind / status (Story 38.3)\n")
    log(f"  scratch project: {len(world.names)} core skills + {list(MODULE_FOLDERS)}; answers through setup.py --module-answers; starter {starter.name} ({world.keys} keys)\n")
    names = args.case or list(CASES)
    failed = run_cases(Runner(world, load(SCRIPT)), names, log)
    green = []
    if args.mutants:
        log("\n  mutants of bind.py (each must turn its case red):")
        source = SCRIPT.read_text(encoding="utf-8")
        for name, old, new, case in MUTANTS:
            if source.count(old) != 1:
                failed.append(f"mutant {name}")
                log(f"  x mutant {name}: the text to mutate occurs {source.count(old)} times")
                continue
            copy = work / f"mutant-{len(green)}-{abs(hash(name))}.py"
            copy.write_text(source.replace(old, new), encoding="utf-8")
            sink: list[str] = []
            red = run_cases(Runner(world, load(copy)), [case], sink.append)
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
