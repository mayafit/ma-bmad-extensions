#!/usr/bin/env python3
# /// script
# requires-python = ">=3.11"
# ///
"""Tests of the ma-atlassian Confluence engine (Story 38.4; FR290, FR300; Decision P5-11.9).

The three `node` scripts of `skills/ma-atlassian-bind/scripts/` -- `confluence_page_tree.cjs` (page tree and the
preview of `ma-atlassian-confluence-plan`), `confluence_collision_check.cjs` and `confluence_publish.cjs`
(publish engine; `resolve` for `ma-atlassian-confluence-record-root-page`) -- run as installed: a scratch project
gets the pinned `core-tools` and `method` skills and this repository's `ma-atlassian` record and members, and
`setup.py --module-answers` writes the nine answers and installs the module's scripts to
`_bmad/ma-atlassian/scripts/`. Each case runs on a fresh copy of that project's `_bmad/`, with an initiative
store fixture under `_bmad-output/`, team answers in `_bmad/custom/config.toml`, and `tools/confluence_dc_mock.py`
(a Confluence Data Center REST mock that validates the storage XHTML) as `confluence_site`. Answers reach the
scripts only through `resolve_config.py`.

Cases: the page tree of both destinations (index rule, `tickets/` collapsed, run-prefixed titles, every left-out
file with its reason); the preview (no request, no file written, `tickets_space` fallback, root page named for
the project); REST publish of both destinations (parents, bodies, links); idempotent re-run (no write); one
changed document (one update); a shared space and root page (one shared page, no duplicate); local collisions
(two runs with one title, the root page, two destinations in one space with different roots); a foreign page
(refused before any write); token handling (missing, wrong, plain http to a remote host; the token never in
the output); `--path` (only that document and its parents; a file outside the output folder refused); the MCP
form (no request, no token, the tool calls); `resolve` (title, id, URL, not found, another space); the
collision check's command line; a failed write mid-run (reported with the pages written before it, never as
published); `--help` of each script.

`--mutants` applies one source mutation per copy of the scripts and requires the case named for it to fail.

Usage: uv run --no-cache tools/test_confluence_engine.py --tree BMAD_TREE [--mutants] [--case NAME ...]
Exit: 0 every case passed (and every mutant red), 1 otherwise, 2 a prerequisite is missing.
"""

from __future__ import annotations

import argparse
import hashlib
import importlib.util
import json
import os
import shutil
import subprocess
import sys
import tempfile
import threading
import time
import traceback
from pathlib import Path

sys.dont_write_bytecode = True
HERE = Path(__file__).resolve().parent
REPO = HERE.parent
SOURCE_SCRIPTS = REPO / "skills" / "ma-atlassian-bind" / "scripts"
SCRIPTS = ("confluence_page_tree.cjs", "confluence_collision_check.cjs", "confluence_publish.cjs")
TOKEN = "mock-pat-7f3a9c"
PROJECT_NAME = "Shop Project"
ANSWERS = {
    "jira_site": "https://jira.example.test",
    "jira_project_key": "SHOP",
    "jira_mcp_server": "",
    "confluence_site": "https://wiki.example.test",
    "confluence_mcp_server": "",
    "planning_space": "PLAN",
    "planning_root_page": "",
    "tickets_space": "",
    "tickets_root_page": "",
}

PRD = """---
title: Checkout PRD
status: final
---
# Checkout & payments <v2>

Totals must be **exact** and *fast*; see [the brief](https://wiki.example.test/x?a=1&b=2) and `a < b`.

| Requirement | Priority |
|---|---|
| FR1 totals & tax | must |
| FR2 codes | should |

- one
  - nested & deep
- two

1. first
2. second

```python
if a < b and b > c:
    print("]]> inside a code block")
```

> A quote with <angle> brackets and a \x01 control character.

A [script link](javascript:alert(1)) is text only.

---
"""

STORE = {
    "initiative-checkout/initiative-checkout.md": "---\ntype: initiative\ntitle: Checkout\n---\n# Checkout\n\nThe initiative.\n",
    "initiative-checkout/.memlog.md": "memlog\n",
    "initiative-checkout/glossary.md": "# Glossary\n",
    "initiative-checkout/prd-checkout/prd-checkout.md": PRD,
    "initiative-checkout/prd-checkout/.memlog.md": "memlog\n",
    "initiative-checkout/ux-checkout/ux-checkout.md": "# UX\n\nSee DESIGN and EXPERIENCE.\n",
    "initiative-checkout/ux-checkout/DESIGN.md": "# Design\n",
    "initiative-checkout/ux-checkout/EXPERIENCE.md": "# Experience\n",
    "initiative-checkout/ux-checkout/.working/draft.md": "draft\n",
    "initiative-checkout/tickets/tickets.toml": "[[epic]]\n",
    "initiative-checkout/tickets/epic-cart-rules/epic-cart-rules.md": "# Cart rules\n",
    "initiative-checkout/tickets/epic-cart-rules/tickets/tickets.toml": "[[story]]\n",
    "initiative-checkout/tickets/epic-cart-rules/tickets/story-cart-service-scaffold.md": "# Scaffold\n\n- [ ] task\n",
    "initiative-checkout/tickets/epic-cart-rules/tickets/story-cart-service-scaffold-plan.md": "# Plan\n\nstatus: ready\n",
    "initiative-checkout/tickets/epic-cart-rules/tickets/story-apply-discount-codes-plan.md": "# Plan\n",
    "initiative-checkout/tickets/epic-cart-rules/tickets/spike-discount-engine-latency.md": "# Spike\n",
    "initiative-checkout/tickets/epic-cart-rules/architecture-cart-rules/architecture-cart-rules.md": "# Architecture\n",
    "backlog/bug-checkout-total-ignores-discount-codes.md": "# Bug\n",
}

# key -> (title, parent key, role) per destination, for the fixture with planning_root_page = "Planning".
PLANNING_TREE = {
    "": ("Planning", None, "root"),
    "initiative-checkout": ("initiative-checkout", "", "folder"),
    "initiative-checkout/epic-cart-rules": ("epic-cart-rules", "initiative-checkout", "folder"),
    "initiative-checkout/prd-checkout": ("prd-checkout", "initiative-checkout", "document"),
    "initiative-checkout/ux-checkout": ("ux-checkout", "initiative-checkout", "document"),
    "initiative-checkout/epic-cart-rules/architecture-cart-rules": ("architecture-cart-rules", "initiative-checkout/epic-cart-rules", "document"),
    "initiative-checkout/ux-checkout/DESIGN": ("ux-checkout - DESIGN", "initiative-checkout/ux-checkout", "document"),
    "initiative-checkout/ux-checkout/EXPERIENCE": ("ux-checkout - EXPERIENCE", "initiative-checkout/ux-checkout", "document"),
}
EPIC = "initiative-checkout/epic-cart-rules"
TICKETS_TREE = {
    "": (PROJECT_NAME, None, "root"),
    "backlog": ("backlog", "", "folder"),
    "initiative-checkout": ("initiative-checkout", "", "document"),
    "backlog/bug-checkout-total-ignores-discount-codes": ("bug-checkout-total-ignores-discount-codes", "backlog", "document"),
    EPIC: ("epic-cart-rules", "initiative-checkout", "document"),
    f"{EPIC}/spike-discount-engine-latency": ("spike-discount-engine-latency", EPIC, "document"),
    f"{EPIC}/story-apply-discount-codes-plan": ("story-apply-discount-codes-plan", EPIC, "document"),
    f"{EPIC}/story-cart-service-scaffold": ("story-cart-service-scaffold", EPIC, "document"),
    f"{EPIC}/story-cart-service-scaffold-plan": ("story-cart-service-scaffold-plan", EPIC, "document"),
}
EXCLUDED = {
    "initiative-checkout/.memlog.md": "hidden path",
    "initiative-checkout/glossary.md": "neither a ticket nor a planning document",
    "initiative-checkout/prd-checkout/.memlog.md": "hidden path",
    "initiative-checkout/ux-checkout/.working/": "hidden path",
    "initiative-checkout/tickets/tickets.toml": "not Markdown",
    "initiative-checkout/tickets/epic-cart-rules/tickets/tickets.toml": "not Markdown",
}


class Prerequisite(RuntimeError):
    pass


def load(path: Path, name: str):
    spec = importlib.util.spec_from_file_location(name, path)
    module = importlib.util.module_from_spec(spec)
    assert spec.loader is not None
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return module


mock = load(HERE / "confluence_dc_mock.py", "confluence_dc_mock_for_tests")


def tree_digest(root: Path) -> str:
    h = hashlib.sha256()
    for p in sorted(root.rglob("*")):
        if p.is_file():
            h.update(p.relative_to(root).as_posix().encode())
            h.update(p.read_bytes())
    return h.hexdigest()


class Mock:
    """One Confluence DC mock on a free port, in a thread."""

    def __init__(self, pages: tuple[str, ...] = ()) -> None:
        self.server = mock.serve(0, TOKEN, ("PLAN", "TICK", "OTHER"), pages, quiet=True)
        self.state = self.server.state
        self.url = f"http://127.0.0.1:{self.server.server_address[1]}"
        self.thread = threading.Thread(target=self.server.serve_forever, daemon=True)
        self.thread.start()

    def close(self) -> None:
        self.server.shutdown()
        self.server.server_close()

    def writes(self) -> list[tuple[str, str]]:
        return [entry for entry in self.state.log if entry[0] in ("POST", "PUT")]

    def page(self, space: str, title: str) -> dict | None:
        return self.state.by_title(space, title)

    def parent_title(self, page: dict) -> str | None:
        return self.state.pages[page["parent"]]["title"] if page["parent"] else None


class World:
    def __init__(self, tree: Path, work: Path, uv: str, node: str) -> None:
        self.tree, self.work, self.uv, self.node = tree, work, uv, node
        self.counter = 0

    def build(self) -> None:
        tb = load(HERE / "test_bind.py", "test_bind_for_confluence")
        tb.ANSWERS.clear()
        tb.ANSWERS.update(ANSWERS)
        self.base_world = tb.World(self.tree, self.work, REPO / "skills" / "ma-atlassian-bind" / "config" / "jira-onprem-ticketing.toml")
        self.base_world.build()
        self.base = self.base_world.base
        installed = self.base / "_bmad" / "ma-atlassian" / "scripts"
        missing = [s for s in SCRIPTS if not (installed / s).is_file()]
        if missing:
            raise Prerequisite(f"setup.py did not install {missing} to {installed}")
        self.installed = installed

    def project(self, store: dict[str, str] | None = None, **answers: str) -> Path:
        self.counter += 1
        project = self.work / f"p{self.counter:02d}"
        shutil.copytree(self.base / "_bmad", project / "_bmad", ignore=shutil.ignore_patterns("render"))
        team = {k: v for k, v in {**ANSWERS, **answers}.items() if k != "confluence_mcp_server"}
        (project / "_bmad" / "custom" / "config.toml").write_text(
            f'[core]\nproject_name = {json.dumps(PROJECT_NAME)}\n\n[modules.ma-atlassian]\n'
            + "".join(f"{k} = {json.dumps(v)}\n" for k, v in team.items()), encoding="utf-8")
        user = project / "_bmad" / "custom" / "config.user.toml"
        user.write_text(f'[modules.ma-atlassian]\nconfluence_mcp_server = {json.dumps(answers.get("confluence_mcp_server", ""))}\n', encoding="utf-8")
        for rel, text in (STORE if store is None else store).items():
            path = project / "_bmad-output" / rel
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(text, encoding="utf-8", newline="\n")
        return project


class Runner:
    def __init__(self, world: World, scripts: Path) -> None:
        self.w, self.scripts = world, scripts

    def run(self, script: str, args: list[str], token: str | None = TOKEN, cwd: Path | None = None) -> subprocess.CompletedProcess:
        env = {k: v for k, v in os.environ.items() if k != "CONFLUENCE_PERSONAL_TOKEN"}
        env["PATH"] = str(Path(self.w.uv).parent) + os.pathsep + env.get("PATH", "")
        env["PYTHONIOENCODING"] = "utf-8"
        if token is not None:
            env["CONFLUENCE_PERSONAL_TOKEN"] = token
        return subprocess.run([self.w.node, str(self.scripts / script), *args], capture_output=True, text=True,
                              encoding="utf-8", errors="replace", stdin=subprocess.DEVNULL, env=env, cwd=cwd, check=False)

    def tree_json(self, project: Path, *extra: str) -> tuple[int, dict]:
        result = self.run("confluence_page_tree.cjs", ["--project-root", str(project), "--json", *extra])
        assert result.returncode in (0, 1), result.stdout + result.stderr
        return result.returncode, json.loads(result.stdout)

    def publish(self, project: Path, *extra: str, token: str | None = TOKEN, cwd: Path | None = None) -> subprocess.CompletedProcess:
        return self.run("confluence_publish.cjs", ["publish", "--project-root", str(project), *extra], token=token, cwd=cwd)


def plan_map(plan: dict) -> dict:
    return {n["key"]: (n["title"], n["parentKey"], n["role"]) for n in plan["nodes"]}


def show(result: subprocess.CompletedProcess) -> str:
    return f"exit {result.returncode}\n{result.stdout}\n{result.stderr}"


# ----------------------------------------------------------------------------- cases


def c_tree(r: Runner) -> None:
    p = r.w.project(planning_root_page="Planning", tickets_space="TICK")
    code, data = r.tree_json(p)
    assert code == 0, data["collisions"]
    plans = {pl["destination"]: pl for pl in data["plans"]}
    assert plan_map(plans["planning"]) == PLANNING_TREE, plan_map(plans["planning"])
    assert plan_map(plans["tickets"]) == TICKETS_TREE, plan_map(plans["tickets"])
    assert plans["planning"]["space"] == "PLAN" and plans["tickets"]["space"] == "TICK"
    assert {e["path"]: e["reason"] for e in data["excluded"]} == EXCLUDED, data["excluded"]
    sources = {n["key"]: n["sourcePath"] for n in plans["tickets"]["nodes"]}
    assert sources[EPIC] == f"{EPIC.replace('epic-cart-rules', 'tickets/epic-cart-rules')}/epic-cart-rules.md", sources[EPIC]


def c_preview(r: Runner) -> None:
    m = Mock()
    try:
        p = r.w.project(confluence_site=m.url)
        before = tree_digest(p)
        result = r.run("confluence_page_tree.cjs", ["--project-root", str(p)])
        assert result.returncode == 0, show(result)
        out = result.stdout
        assert f'destination planning: site {m.url}, space PLAN, root page "{PROJECT_NAME}"' in out, out
        assert f'destination tickets: site {m.url}, space PLAN, root page "{PROJECT_NAME}"' in out, out
        assert "ux-checkout - DESIGN  (initiative-checkout/ux-checkout/DESIGN.md)" in out, out
        assert "initiative-checkout/glossary.md: neither a ticket nor a planning document" in out, out
        assert out.strip().endswith("preview: no collision; nothing was written"), out
        assert tree_digest(p) == before, "the preview changed a file"
        assert m.state.log == [], m.state.log
    finally:
        m.close()


def c_publish(r: Runner) -> None:
    m = Mock()
    try:
        p = r.w.project(confluence_site=m.url, planning_root_page="Planning", tickets_space="TICK")
        result = r.publish(p)
        assert result.returncode == 0, show(result)
        assert "published: yes (" in result.stdout, result.stdout
        for space, expected in (("PLAN", PLANNING_TREE), ("TICK", TICKETS_TREE)):
            titles = {k: v[0] for k, v in expected.items()}
            for key, (title, parent, role) in expected.items():
                page = m.page(space, title)
                assert page is not None, (space, title)
                assert m.parent_title(page) == (titles[parent] if parent is not None else None), (title, m.parent_title(page))
                assert bool(page["body"]) == (role == "document"), (title, page["body"][:80])
                assert (page["message"].startswith("ma-atlassian sha256:")) == (role == "document"), (title, page["message"])
        prd = m.page("PLAN", "prd-checkout")["body"]
        for fragment in ("<h1>Checkout &amp; payments &lt;v2&gt;</h1>", "<strong>exact</strong>", "<th>Requirement</th>",
                         "<td>FR1 totals &amp; tax</td>", '<a href="https://wiki.example.test/x?a=1&amp;b=2">the brief</a>',
                         "<code>a &lt; b</code>", "<ol><li>first</li><li>second</li></ol>", "]]]]><![CDATA[>",
                         '<ac:parameter ac:name="language">python</ac:parameter>', "<blockquote>"):
            assert fragment in prd, (fragment, prd)
        assert 'href="javascript' not in prd and "script link" in prd, prd
        page = m.page("TICK", "story-cart-service-scaffold")
        assert f'tickets: created "story-cart-service-scaffold" (id {page["id"]}) {m.url}/pages/viewpage.action?pageId={page["id"]}' in result.stdout, result.stdout
        assert f'note: created the tickets root page "{PROJECT_NAME}"; record it with ma-atlassian-confluence-record-root-page' in result.stdout
        assert "note: created the planning root page" not in result.stdout, "the planning root page is answered"
        assert TOKEN not in result.stdout + result.stderr, "the token was printed"
    finally:
        m.close()


def c_idempotent(r: Runner) -> None:
    m = Mock()
    try:
        p = r.w.project(confluence_site=m.url, tickets_space="TICK")
        first = r.publish(p)
        assert first.returncode == 0, show(first)
        count = len(m.state.pages)
        writes = len(m.writes())
        second = r.publish(p)
        assert second.returncode == 0, show(second)
        assert len(m.writes()) == writes, m.writes()[writes:]
        assert len(m.state.pages) == count
        assert "0 created, 0 updated" in second.stdout, second.stdout
    finally:
        m.close()


def c_update(r: Runner) -> None:
    m = Mock()
    try:
        p = r.w.project(confluence_site=m.url, tickets_space="TICK")
        assert r.publish(p).returncode == 0
        writes = len(m.writes())
        story = p / "_bmad-output" / "initiative-checkout" / "tickets" / "epic-cart-rules" / "tickets" / "story-cart-service-scaffold.md"
        story.write_text("# Scaffold\n\nChanged & more.\n", encoding="utf-8")
        result = r.publish(p)
        assert result.returncode == 0, show(result)
        new = m.writes()[writes:]
        page = m.page("TICK", "story-cart-service-scaffold")
        assert [w[0] for w in new] == ["PUT"] and page["id"] in new[0][1], new
        assert page["version"] == 2 and "Changed &amp; more." in page["body"], page
        assert "1 updated" in result.stdout, result.stdout
    finally:
        m.close()


def c_shared(r: Runner) -> None:
    m = Mock()
    try:
        p = r.w.project(confluence_site=m.url)  # one space, both root pages named for the project
        result = r.publish(p)
        assert result.returncode == 0, show(result)
        titles = [pg["title"] for pg in m.state.pages.values()]
        assert len(titles) == len(set(titles)), sorted(titles)
        # one shared root; the initiative and epic pages are folder pages of planning and documents of tickets
        assert len(titles) == len(PLANNING_TREE) + len(TICKETS_TREE) - 3, sorted(titles)
        shared = m.page("PLAN", "initiative-checkout")
        assert shared["body"] and m.parent_title(shared) == PROJECT_NAME, shared
        assert m.parent_title(m.page("PLAN", "prd-checkout")) == "initiative-checkout"
        writes = len(m.writes())
        again = r.publish(p)
        assert again.returncode == 0 and len(m.writes()) == writes, show(again)
    finally:
        m.close()


def c_collision_local(r: Runner) -> None:
    m = Mock()
    try:
        # two destinations in one space with different root pages: the initiative page is two pages
        p = r.w.project(confluence_site=m.url, planning_root_page="Planning", tickets_root_page="Tickets")
        result = r.publish(p)
        assert result.returncode == 1, show(result)
        assert 'collision: "initiative-checkout": the planning folder page' not in result.stdout
        assert '"initiative-checkout"' in result.stdout and "shared space PLAN" in result.stdout, result.stdout
        assert "published: no (refused before any Confluence call)" in result.stdout, result.stdout
        # two planning runs with one name in two initiatives
        store = {**STORE, "initiative-other/prd-checkout/prd-checkout.md": "# Other\n"}
        q = r.w.project(store, confluence_site=m.url, tickets_space="TICK")
        result = r.publish(q)
        assert result.returncode == 1 and 'collision: "prd-checkout": planning initiative-checkout/prd-checkout/prd-checkout.md and planning initiative-other/prd-checkout/prd-checkout.md' in result.stdout, show(result)
        # a root page titled like a document
        s = r.w.project(confluence_site=m.url, tickets_space="TICK", tickets_root_page="story-cart-service-scaffold")
        result = r.publish(s)
        assert result.returncode == 1 and "the tickets root page and tickets" in result.stdout and "record another root page" in result.stdout, show(result)
        preview = r.run("confluence_page_tree.cjs", ["--project-root", str(s)])
        assert preview.returncode == 1 and "publishing would be refused" in preview.stdout, show(preview)
        assert m.state.log == [], m.state.log
    finally:
        m.close()


def c_collision_remote(r: Runner) -> None:
    m = Mock(pages=("TICK:story-cart-service-scaffold",))
    try:
        p = r.w.project(confluence_site=m.url, tickets_space="TICK")
        result = r.publish(p)
        assert result.returncode == 1, show(result)
        assert 'collision: "story-cart-service-scaffold": page' in result.stdout and "outside the tickets root page" in result.stdout, result.stdout
        assert "published: no (refused before any write)" in result.stdout, result.stdout
        assert m.writes() == [], m.writes()
        check = r.run("confluence_collision_check.cjs", ["--project-root", str(p)])
        assert check.returncode == 1 and "1 collision(s); Confluence checked over REST" in check.stdout, show(check)
        local = r.run("confluence_collision_check.cjs", ["--project-root", str(p), "--local"])
        assert local.returncode == 0 and "Confluence skipped (--local)" in local.stdout, show(local)
        clean = r.w.project(confluence_site=m.url, tickets_space="OTHER")
        check = r.run("confluence_collision_check.cjs", ["--project-root", str(clean)])
        assert check.returncode == 0 and "0 collision(s)" in check.stdout, show(check)
        assert m.writes() == []
    finally:
        m.close()


def c_auth(r: Runner) -> None:
    m = Mock()
    try:
        p = r.w.project(confluence_site=m.url, tickets_space="TICK")
        result = r.publish(p, token=None)
        assert result.returncode == 2 and "CONFLUENCE_PERSONAL_TOKEN is not set" in result.stdout, show(result)
        assert m.state.log == []
        wrong = "wrong-secret-91c2"
        result = r.publish(p, token=wrong)
        assert result.returncode == 1 and "answered 401" in result.stdout, show(result)
        assert wrong not in result.stdout + result.stderr, "the token was printed"
        assert "published: no (0 page(s) written" in result.stdout, result.stdout
        q = r.w.project(confluence_site="http://wiki.example.test", tickets_space="TICK")
        result = r.publish(q)
        assert result.returncode == 2 and "is not https" in result.stdout, show(result)
        assert TOKEN not in result.stdout + result.stderr
        assert m.writes() == []
    finally:
        m.close()


def c_path(r: Runner) -> None:
    m = Mock()
    try:
        p = r.w.project(confluence_site=m.url, tickets_space="TICK")
        prd = p / "_bmad-output" / "initiative-checkout" / "prd-checkout" / "prd-checkout.md"
        result = r.publish(p, "--path", str(prd))
        assert result.returncode == 0, show(result)
        assert sorted(pg["title"] for pg in m.state.pages.values()) == sorted([PROJECT_NAME, "initiative-checkout", "prd-checkout"]), \
            sorted(pg["title"] for pg in m.state.pages.values())
        relative = r.publish(p, "--path", "_bmad-output/initiative-checkout/ux-checkout/DESIGN.md", cwd=p)
        assert relative.returncode == 0 and m.page("PLAN", "ux-checkout - DESIGN") is not None, show(relative)
        assert m.parent_title(m.page("PLAN", "ux-checkout - DESIGN")) == "ux-checkout"
        outside = p / "_bmad" / "custom" / "config.toml"
        before = len(m.state.log)
        result = r.publish(p, "--path", str(outside))
        assert result.returncode == 1 and "outside the output folder" in result.stdout and "nothing to publish" in result.stdout, show(result)
        result = r.publish(p, "--path", str(p / "_bmad-output" / ".." / "_bmad" / "custom" / "config.toml"))
        assert result.returncode == 1 and "outside the output folder" in result.stdout, show(result)
        assert len(m.state.log) == before
    finally:
        m.close()


def c_mcp(r: Runner) -> None:
    m = Mock()
    try:
        p = r.w.project(confluence_site=m.url, tickets_space="TICK", confluence_mcp_server="corp-confluence")
        result = r.publish(p, "--json", token=None)
        assert result.returncode == 0, show(result)
        data = json.loads(result.stdout)
        assert data["via"] == "mcp" and not data["published"], data
        steps = [s for d in data["steps"] for s in d["steps"]]
        tools = {s["tool"] for s in steps}
        assert tools == {"confluence_get_page", "confluence_search", "confluence_create_page", "confluence_update_page"}, tools
        story = [s for s in steps if s["page"] == "story-cart-service-scaffold" and s["tool"] == "confluence_create_page"][0]
        assert Path(story["args"]["content_file"]).is_file() and story["args"]["content_format"] == "markdown", story
        assert story["args"]["parent_id"] == '<id of "epic-cart-rules">', story
        search = [s for s in steps if s["tool"] == "confluence_search"][0]
        assert f'ancestor = <id of "{PROJECT_NAME}">' in search["args"]["query"], search
        text = r.publish(p, token=None)
        assert text.returncode == 0 and 'publish through the MCP server "corp-confluence"' in text.stdout, show(text)
        assert m.state.log == [], m.state.log
    finally:
        m.close()


def c_resolve(r: Runner) -> None:
    m = Mock(pages=("OTHER:Elsewhere",))
    try:
        p = r.w.project(confluence_site=m.url, tickets_space="TICK")
        assert r.publish(p).returncode == 0
        root = m.page("TICK", PROJECT_NAME)
        base = ["resolve", "--project-root", str(p), "--destination", "tickets"]
        result = r.run("confluence_publish.cjs", [*base, "--page", PROJECT_NAME])
        assert result.returncode == 0, show(result)
        assert f'found: page "{PROJECT_NAME}" (id {root["id"]}) in space TICK, at the top of the space' in result.stdout, result.stdout
        assert f'answer: modules.ma-atlassian.tickets_root_page = "{PROJECT_NAME}" (now "")' in result.stdout, result.stdout
        by_id = r.run("confluence_publish.cjs", [*base, "--page", root["id"], "--json"])
        assert by_id.returncode == 0 and json.loads(by_id.stdout)["value"] == PROJECT_NAME, show(by_id)
        by_url = r.run("confluence_publish.cjs", [*base, "--page", f"{m.url}/pages/viewpage.action?pageId={root['id']}", "--json"])
        assert by_url.returncode == 0 and json.loads(by_url.stdout)["id"] == root["id"], show(by_url)
        missing = r.run("confluence_publish.cjs", [*base, "--page", "No such page"])
        assert missing.returncode == 1 and 'not found: no page titled "No such page" in space TICK' in missing.stdout, show(missing)
        other = m.page("OTHER", "Elsewhere")
        elsewhere = r.run("confluence_publish.cjs", [*base, "--page", other["id"]])
        assert elsewhere.returncode == 1 and "is in space OTHER, not in the tickets space TICK" in elsewhere.stdout, show(elsewhere)
        assert m.writes() and all(w[1] == "/rest/api/content" or w[0] == "POST" for w in m.writes())
    finally:
        m.close()


def c_failure(r: Runner) -> None:
    m = Mock()
    try:
        m.state.fail_writes_after = 2
        p = r.w.project(confluence_site=m.url, tickets_space="TICK")
        result = r.publish(p)
        assert result.returncode == 1, show(result)
        assert "answered 500" in result.stdout and "published: no (2 page(s) written before the failure" in result.stdout, result.stdout
        assert "published: yes" not in result.stdout
    finally:
        m.close()


def c_help(r: Runner) -> None:
    for script in SCRIPTS:
        result = r.run(script, ["--help"], token=None)
        assert result.returncode == 0 and result.stdout.startswith("usage: node "), show(result)
    result = r.run("confluence_page_tree.cjs", ["--project-root", str(r.w.work)])
    assert result.returncode == 2 and result.stdout.startswith("prerequisite:"), show(result)


CASES = {
    "tree": (c_tree, "page tree of both destinations: index rule, tickets/ collapsed, run-prefixed titles, left-out files"),
    "preview": (c_preview, "preview: no request, no file written, tickets_space fallback, root page named for the project"),
    "publish": (c_publish, "REST publish of both destinations: parents, storage bodies, links, root-page note"),
    "idempotent": (c_idempotent, "a re-run writes nothing"),
    "update": (c_update, "one changed document: one PUT, version 2"),
    "shared": (c_shared, "one space and one root page: the shared initiative page is created once"),
    "collision-local": (c_collision_local, "local collisions refused before any request"),
    "collision-remote": (c_collision_remote, "a foreign page with a planned title: refused before any write; the check's command line"),
    "auth": (c_auth, "token missing, wrong, or bound for plain http: refused; the token never printed"),
    "path": (c_path, "--path: that document and its parents only; a file outside the output folder refused"),
    "mcp": (c_mcp, "MCP form: no request, no token, the mcp-atlassian tool calls"),
    "resolve": (c_resolve, "resolve by title, id and URL; not found; another space refused"),
    "failure": (c_failure, "a failed write mid-run: reported with the pages written before it, never as published"),
    "help": (c_help, "--help of each script exits 0; no _bmad/ is a prerequisite"),
}

# (name, script, old, new, the case that must fail)
MUTANTS = (
    ("tickets/ folders kept as pages", "confluence_page_tree.cjs", "const folders = segs.filter((s) => s !== COLLAPSED_FOLDER);", "const folders = segs;", "tree"),
    ("index rule removed", "confluence_page_tree.cjs", "if (folders.length > 0 && folders[folders.length - 1] === stem) return folders;", "", "tree"),
    ("run titles not prefixed", "confluence_page_tree.cjs", "  return `${segs[run]} - ${seg}`;", "  return seg;", "tree"),
    ("hidden paths published", "confluence_page_tree.cjs", "  if (segs.some((s) => s.startsWith('.'))) return { excluded: EXCLUDED_HIDDEN };\n", "", "tree"),
    ("no tickets_space fallback", "confluence_page_tree.cjs", "space: answers.tickets_space || answers.planning_space,", "space: answers.tickets_space,", "preview"),
    ("in-destination check off", "confluence_collision_check.cjs", "      if (prior) {", "      if (false) {", "collision-local"),
    ("cross-destination check off", "confluence_collision_check.cjs", "      if (a.space !== b.space) continue;", "      continue;", "collision-local"),
    ("foreign check off", "confluence_collision_check.cjs", "    if (rootId && ancestors.includes(rootId)) continue;", "    continue;", "collision-remote"),
    ("unchanged never detected", "confluence_publish.cjs", "} else if (r.message === mark &&", "} else if (false &&", "idempotent"),
    ("token in an error message", "confluence_publish.cjs", "answered ${response.status}${said", "answered ${response.status} ${token}${said", "auth"),
    ("plain http allowed", "confluence_publish.cjs", "if (url.protocol !== 'https:' && !(", "if (false && !(", "auth"),
    ("path outside the output folder allowed", "confluence_page_tree.cjs", "      if (!inside(outputFolder, abs)) {", "      if (false) {", "path"),
    ("MCP answer ignored", "confluence_publish.cjs", "const via = args.via || (built.answers.confluence_mcp_server ? 'mcp' : 'rest');", "const via = args.via || 'rest';", "mcp"),
    ("no & escaping", "confluence_publish.cjs", ".replace(/&/g, '&amp;')", "", "publish"),
    ("CDATA end not split", "confluence_publish.cjs", "split(']]>').join(']]]]><![CDATA[>')", "split(']]>').join(']]>')", "publish"),
    ("shared page created twice", "confluence_publish.cjs", "    if (!r.found && runPages.has(runKey)) r = { found: true, ...runPages.get(runKey) };\n", "", "shared"),
    ("remote check skipped", "confluence_publish.cjs", "      report.collisions.push(...check.remoteCollisions(plan, resolved));\n", "", "collision-remote"),
    ("failure reported as published", "confluence_publish.cjs", "    return finish(1);\n  }\n  report.published = true;", "  }\n  report.published = true;", "failure"),
    ("resolve ignores the space", "confluence_publish.cjs", "  if (page.space && page.space !== dest.space) {", "  if (false) {", "resolve"),
)


def run_cases(runner: Runner, names: list[str], log) -> list[str]:
    failed = []
    for name in names:
        fn, label = CASES[name]
        start = time.monotonic()
        try:
            fn(runner)
        except Exception as exc:  # noqa: BLE001 -- a case failure of any kind is reported, then the next case runs
            failed.append(name)
            detail = traceback.format_exception_only(type(exc), exc)[-1].strip()
            log(f"  x {name}: {label}\n      {detail[:1500]}")
            continue
        log(f"  + {name}: {label} ({time.monotonic() - start:.1f}s)")
    return failed


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--tree", type=Path, default=os.environ.get("BMAD_V7_TREE"), help="BMAD-METHOD checkout at the pinned commit")
    parser.add_argument("--mutants", action="store_true", help="also run every mutant of the scripts")
    parser.add_argument("--case", action="append", default=[], choices=sorted(CASES))
    parser.add_argument("--keep", action="store_true", help="keep the scratch folder")
    args = parser.parse_args(argv)
    if sys.platform == "win32":
        sys.stdout.reconfigure(encoding="utf-8")
    log = lambda s: print(s, flush=True)  # noqa: E731
    work = Path(tempfile.mkdtemp(prefix="test-confluence-"))
    try:
        if args.tree is None or not (Path(args.tree) / "skills" / "bmad" / "scripts" / "setup.py").is_file():
            raise Prerequisite("--tree (or BMAD_V7_TREE) must be a BMAD-METHOD checkout at the pinned commit")
        uv, node = shutil.which("uv"), shutil.which("node")
        if not uv or not node:
            raise Prerequisite("uv and node must be on PATH")
        version = subprocess.run([node, "--version"], capture_output=True, text=True, check=False).stdout.strip()
        world = World(Path(args.tree).resolve(), work, uv, node)
        world.build()
    except Prerequisite as error:
        print(f"prerequisite: {error}", file=sys.stderr)
        shutil.rmtree(work, ignore_errors=True)
        return 2
    log("\n ma-atlassian Confluence engine: page tree, collision check, publish (Story 38.4)\n")
    log(f"  node {version}; scripts as installed by setup.py to _bmad/ma-atlassian/scripts/; tools/confluence_dc_mock.py per case\n")
    names = args.case or list(CASES)
    failed = run_cases(Runner(world, world.installed), names, log)
    green = []
    if args.mutants:
        log("\n  mutants of the scripts (each must turn its case red):")
        for index, (name, script, old, new, case) in enumerate(MUTANTS):
            source = (SOURCE_SCRIPTS / script).read_text(encoding="utf-8")
            if source.count(old) != 1:
                failed.append(f"mutant {name}")
                log(f"  x mutant {name}: the text to mutate occurs {source.count(old)} times in {script}")
                continue
            folder = work / f"mutant-{index:02d}"
            shutil.copytree(SOURCE_SCRIPTS, folder, ignore=shutil.ignore_patterns("*.py", "__pycache__"))
            (folder / script).write_text(source.replace(old, new), encoding="utf-8", newline="\n")
            sink: list[str] = []
            red = run_cases(Runner(world, folder), [case], sink.append)
            if red:
                log(f"  ok mutant {name}: {case} red ({sink[-1].strip().splitlines()[-1].strip()[:160]})")
            else:
                green.append(name)
                log(f"  x mutant {name}: {case} stayed green")
    if not args.keep:
        shutil.rmtree(work, ignore_errors=True)
    log(f"\n  {len(names) - len([f for f in failed if not f.startswith('mutant ')])} passed, {len(failed)} failed"
        + (f"; {len(MUTANTS) - len(green)} of {len(MUTANTS)} mutants red" if args.mutants else "") + "\n")
    return 1 if failed or green else 0


if __name__ == "__main__":
    sys.exit(main())
