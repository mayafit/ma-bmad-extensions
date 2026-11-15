#!/usr/bin/env python3
# /// script
# requires-python = ">=3.11"
# ///
"""Tests of `ma-knowledge-atlas` over the fixture initiative (Story 37.4; FR305).

A v7 project is composed in a scratch folder from `tools/fixtures/initiative-atlas/` (copied under an output
folder that is NOT named `_bmad-output`), a parent initiative listing it, a `backlog/` leaf with its plan, and the
v6 inputs the Atlas must never read, each carrying a sentinel: the fixture's own `archive-v6/` tracker and epics
file, a tracker at the output folder's root, a tracker and a `knowledge-graph.json` inside an initiative folder,
and a `_bmad/bmm/config.yaml` whose `planning_artifacts` points at a folder with a sentinel document. `scripts/build_atlas.py` then builds the Atlas and the tests assert that every
epic and every ticket of the fixture renders with its status (read here from the fixture independently of the
script), that no sentinel reaches the output, that the staged copy holds no tracker format, that the store's
problems are reported, that `--out` is refused where it would destroy something, that a re-run replaces a stale
site, that the output is byte-identical across runs under SOURCE_DATE_EPOCH, that the member names no v6 file,
and that the command line of the workflow runs through `uv run --no-cache`.

Usage: uv run --no-cache tools/test_atlas.py [--skip-cli] [--keep]
Exit: 0 every test passed, 1 a test failed, 2 a prerequisite is missing (node).
"""

from __future__ import annotations

import argparse
import contextlib
import html
import importlib.util
import io
import os
import re
import shutil
import subprocess
import sys
import tempfile
import tomllib
import traceback
from pathlib import Path

sys.dont_write_bytecode = True  # the script is loaded in process; no __pycache__ beside a shipped skill file

HERE = Path(__file__).resolve().parent
REPO = HERE.parent
SKILL = REPO / "skills" / "ma-knowledge-atlas"
SCRIPT = SKILL / "scripts" / "build_atlas.py"
ENGINE = SKILL / "assets" / "atlas.cjs"
RECORD = REPO / "skills" / "bmod-ma-knowledge"
FIXTURE = HERE / "fixtures" / "initiative-atlas"
SENTINEL = "V6SENTINEL"
OUTPUT_FOLDER = "docs"
EPOCH = "1700000000"
# The files of an earlier BMad line that a module names only inside a migration (architecture, module rules).
V6_NAMES = ("sprint-status", "development_status", "bmm/config", "project-layout", "config.yaml")

passed = 0
failed = 0
tmp_roots: list[Path] = []
last_output: list[str] = []


def load_script():
    spec = importlib.util.spec_from_file_location("build_atlas", SCRIPT)
    module = importlib.util.module_from_spec(spec)
    assert spec.loader is not None
    spec.loader.exec_module(module)
    return module


def test(name, fn) -> None:
    global passed, failed
    try:
        fn()
        passed += 1
        print(f"  ok   {name}")
    except Exception as error:  # noqa: BLE001 - a test reports any failure
        failed += 1
        print(f"  FAIL {name}: {error}")
        if last_output and last_output[0].strip():
            print("       last script output: " + last_output[0].strip().replace("\n", "\n       "))
        if not isinstance(error, AssertionError):
            traceback.print_exc()


def mktemp() -> Path:
    root = Path(tempfile.mkdtemp(prefix="atlas-test-"))
    tmp_roots.append(root)
    return root


def write(path: Path, text: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text, encoding="utf-8", newline="\n")


def compose_project(root: Path) -> Path:
    """The scratch project: the fixture under `docs/`, a parent initiative, a backlog leaf, the v6 sentinels."""
    project = root / "project"
    store = project / OUTPUT_FOLDER
    shutil.copytree(FIXTURE, store / FIXTURE.name)
    write(store / "initiative-portfolio" / "initiative-portfolio.md",
          "---\ntype: initiative\ntitle: Portfolio\nparent: none\nstatus: in-progress\n---\n\n# Portfolio\n")
    write(store / "initiative-portfolio" / "tickets" / "tickets.toml",
          '[[initiative]]\nid = 1\nslug = "initiative-atlas"\ntitle = "Shoppers buy online"\ndescription = "The shop."\n')
    # Tracker and graph files left inside an initiative folder, outside archive-v6/: a format rule, not a folder
    # rule, must keep them out of the Atlas.
    write(store / "initiative-portfolio" / "sprint-status.yaml", f"development_status:\n  epic-1: {SENTINEL}-INITIATIVE-TRACKER\n")
    write(store / "initiative-portfolio" / "knowledge-graph.json", f'{{"nodes": [{{"id": "{SENTINEL}-GRAPH"}}]}}\n')
    write(store / "backlog" / "story-logo-refresh.md",
          '---\nid: logo\ntype: story\ntitle: "Logo refresh"\n---\n\n# Logo refresh\n\nA new logo.\n')
    write(store / "backlog" / "story-logo-refresh-plan.md",
          "---\ntitle: 'Logo refresh'\nticket: 'story-logo-refresh'\nstatus: 'ready-for-dev'\n---\n\n## Intent\n")
    write(store / "sprint-status.yaml", f"development_status:\n  epic-1: {SENTINEL}-ROOT-TRACKER\n")
    write(project / "_bmad" / "bmm" / "config.yaml",
          f'output_folder: {OUTPUT_FOLDER}\nplanning_artifacts: "{{project-root}}/v6-planning"\nknowledgebase_path: "{{project-root}}/v6-planning"\n')
    write(project / "v6-planning" / "prd.md", f"# PRD\n\nFR1 {SENTINEL}-CONFIG-PLANNING\n")
    write(project / "package.json", '{"name": "atlas-fixture-project"}\n')
    return project


def fixture_expectations() -> dict:
    """What the fixture says, read here with tomllib and a regex, not with the script's reader."""
    epics = {}
    initiative = tomllib.loads((FIXTURE / "tickets" / "tickets.toml").read_text(encoding="utf-8"))
    for e in initiative["epic"]:
        folder = FIXTURE / "tickets" / e["slug"]
        own = (folder / f"{e['slug']}.md").read_text(encoding="utf-8")
        m = re.search(r"^status:\s*(\S+)", own, re.M)
        entries = tomllib.loads((folder / "tickets" / "tickets.toml").read_text(encoding="utf-8"))["entry"]
        plans = {}
        for plan in folder.glob("tickets/*-plan.md"):
            text = plan.read_text(encoding="utf-8")
            t = re.search(r"^ticket:\s*'([^']*)'", text, re.M)
            s = re.search(r"^status:\s*'([^']*)'", text, re.M)
            if t and s and t.group(1).isdigit():
                plans[int(t.group(1))] = (s.group(1), plan.name)
        epics[e["slug"]] = {
            "id": e["id"], "title": e["title"], "status": m.group(1) if m else "",
            "entries": [{"id": x["id"], "type": x["type"], "title": x["title"], "plan": plans.get(x["id"])} for x in entries],
        }
    return epics


def strip_tags(fragment: str) -> str:
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", fragment))).strip()


def rows_of(page: Path) -> list[str]:
    text = page.read_text(encoding="utf-8")
    return [strip_tags(tr) for tr in re.findall(r"<tr>.*?</tr>", text, re.S)]


def page_text(page: Path) -> str:
    text = page.read_text(encoding="utf-8")
    m = re.search(r"<article.*?</article>", text, re.S)
    return strip_tags(m.group(0) if m else text)


def build(module, project: Path, out: str, stage: Path | None = None, extra: list[str] | None = None) -> int:
    """The script's `main()` in process, its output captured (shown only when a test fails)."""
    argv = ["--project-root", str(project), "--output-folder", OUTPUT_FOLDER, "--out", out]
    if stage is not None:
        argv += ["--stage", str(stage)]
    captured = io.StringIO()
    with contextlib.redirect_stdout(captured), contextlib.redirect_stderr(captured):
        code = module.main(argv + (extra or []))
    last_output.clear()
    last_output.append(captured.getvalue())
    return code


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--skip-cli", action="store_true", help="do not run the script through uv (no uv on PATH)")
    parser.add_argument("--keep", action="store_true", help="keep the scratch folders")
    args = parser.parse_args(argv)
    if not shutil.which("node"):
        print("prerequisite: node not found on PATH", file=sys.stderr)
        return 2
    if not FIXTURE.is_dir():
        print(f"prerequisite: fixture {FIXTURE} missing", file=sys.stderr)
        return 2
    module = load_script()
    expected = fixture_expectations()
    os.environ["SOURCE_DATE_EPOCH"] = EPOCH

    root = mktemp()
    project = compose_project(root)
    stage = root / "stage"
    out = project / OUTPUT_FOLDER / "knowledge-atlas"
    docs = out / "docs"

    def page(suffix: str) -> Path:
        hits = sorted(p for p in docs.glob("*.html") if p.name.endswith(suffix))
        assert len(hits) == 1, f"{len(hits)} page(s) end with {suffix!r}: {[h.name for h in hits]}"
        return hits[0]

    # --- the member and the record -------------------------------------------------------------------
    def t_member():
        assert ENGINE.is_file() and ENGINE.stat().st_size > 500_000, "assets/atlas.cjs missing or truncated"
        head = ENGINE.read_bytes()[:4096]
        assert b"\r" not in head and b"ATLAS" in head, "engine is not the LF esbuild bundle"
        skill = tomllib.loads((SKILL / "bmod.toml").read_text(encoding="utf-8"))["skill"]
        assert skill["bmod"] == "bmod-ma-knowledge" and skill.get("scripts") == ["scripts/build_atlas.py"], skill
        rec = tomllib.loads((RECORD / "bmod.toml").read_text(encoding="utf-8"))["bmod"]
        assert rec["skills"] == ["ma-knowledge-atlas"], rec["skills"]
        assert [r["skill"] for r in rec["required_skills"]] == ["bmad"], rec["required_skills"]
        questions = rec.get("config_questions", [])
        assert [q["key"] for q in questions] == ["atlas_output"] and questions[0]["default"] == "" and questions[0]["scope"] == "team", questions
        retired = tomllib.loads((RECORD / "retired.toml").read_text(encoding="utf-8"))
        assert retired.get("renamed") == [{"from": "bmad-knowledge", "to": "ma-knowledge-atlas"}], retired
        assert "`ma-knowledge-atlas`" in (RECORD / "help" / "help.md").read_text(encoding="utf-8")
        fm = (SKILL / "SKILL.md").read_text(encoding="utf-8").split("---")[1]
        assert "name: ma-knowledge-atlas" in fm and "placeholder" not in fm, fm
        assert SCRIPT.read_text(encoding="utf-8").startswith("#!/usr/bin/env python3\n# /// script\n"), "PEP 723 header"

    def t_no_v6_names():
        files = [p for p in SKILL.rglob("*") if p.is_file() and p.suffix in {".md", ".toml", ".py"}]
        assert len(files) >= 5, files
        hits = [f"{p.relative_to(REPO).as_posix()}: {name}" for p in files for name in V6_NAMES
                if name in p.read_text(encoding="utf-8")]
        assert not hits, hits

    def t_workflow():
        text = (SKILL / "workflow.md").read_text(encoding="utf-8")
        assert "{project-root}/_bmad/method/scripts/tickets.py" in text, "no ticket-store check"
        call = re.search(r"`uv run --no-cache \{project-root\}/_bmad/scripts/resolve_config\.py[^`]*`", text)
        assert call and "--key core.output_folder" in call.group(0) and "--key modules.ma-knowledge.atlas_output" in call.group(0), call
        assert "<output_folder>/knowledge-atlas" in text, "no default for an empty atlas_output"
        run = re.search(r"`uv run --no-cache \{skill-root\}/scripts/build_atlas\.py[^`]*`", text)
        assert run, "no build_atlas.py call"
        for flag in ("--project-root {project-root}", "--output-folder <output_folder>", "--out <atlas_output>", "--engine {skill-root}/assets/atlas.cjs"):
            assert flag in run.group(0), f"{flag} missing from {run.group(0)}"
        assert text.count("uv run") == 2, "every script call is one of the two above"

    # --- the build ------------------------------------------------------------------------------------
    def t_build():
        code = build(module, project, str(out), stage)
        assert code == 0, f"exit {code}"
        lines = last_output[0].splitlines()
        assert lines[1].startswith("Knowledge Atlas: 2 initiative(s), 3 epic(s), 11 ticket(s),") and "2 problem(s)" in lines[1], lines[:2]
        for name in ("index.html", "manifest.json", "graph.html", "diagrams.html", "search.html"):
            assert (out / name).is_file(), f"{name} missing"
        assert docs.is_dir() and len(list(docs.glob("*.html"))) >= 30, "document pages missing"

    def t_every_epic_and_ticket():
        board = page("initiative-atlas-tickets-ticket-board.html")
        text = page_text(board)
        rows = rows_of(board)
        assert "Initiative `initiative-atlas` — status: `in-progress`" in text.replace("` ", "`") or "status: in-progress" in text, text[:300]
        count = 0
        for slug, epic in expected.items():
            head = f"Epic {epic['id']}: {epic['title']}"
            assert head in text, f"{head} not on the board"
            assert f"Epic {slug} — status: {epic['status'] or 'not started'}" in text, f"{slug} status {epic['status']!r} not on the board"
            for entry in epic["entries"]:
                ref = f"{'Story' if entry['type'] == 'story' else entry['type'].capitalize()} {epic['id']}.{entry['id']}"
                status = entry["plan"][0] if entry["plan"] else module.NO_PLAN
                row = [r for r in rows if r.startswith(ref + " ")]
                assert len(row) == 1, f"{ref}: {len(row)} board row(s)"
                assert f" {entry['title']} {status} " in row[0], f"{ref}: row {row[0]!r} lacks title {entry['title']!r} with status {status!r}"
                ticket = page(f"-{epic['id']}-{entry['id']}-{module._slug(entry['title'])}.html")
                ttext = page_text(ticket)
                assert f"{ref}: {entry['title']}" in ttext and f"Status: {status} (board state:" in ttext, ttext[:300]
                if entry["plan"]:
                    assert entry["plan"][1] in ttext, f"{ref}: plan {entry['plan'][1]} not linked"
                count += 1
        assert count == 10, count

    def t_statuses_spot():
        rows = rows_of(page("initiative-atlas-tickets-ticket-board.html"))
        for ref, title, status, state in (
            ("Story 1.1", "Pricing function", "done", "done"),
            ("Story 1.2", "Discount codes", "built", "review"),
            ("Spike 1.3", "Rounding rules", "dropped", "dropped"),
            ("Story 2.2", "Remove item", "blocked", "in-progress"),
            ("Bug 2.3", "Total drift", "in-review", "review"),
            ("Story 2.4", "Quantity limits", module.NO_PLAN, "planned"),
            ("Story 2.5", "Gift wrap", "shipped", "blocked"),
            ("Story 3.1", "Payment", "draft", "backlog"),
            ("Story 3.2", "Receipts", "ready-for-dev", "backlog"),
        ):
            row = next((r for r in rows if r.startswith(ref + " ")), None)
            assert row is not None and f"{ref} {title} {status} {state} " in row, f"{ref}: {row!r}"
        pills = re.findall(r'status-pill status-[a-z-]*">([a-z-]+)<', (out / "index.html").read_text(encoding="utf-8"))
        assert {"done", "in-progress", "ready-for-dev", "review", "backlog"} <= set(pills), set(pills)
        ticket = page_text(page("-2-4-quantity-limits.html"))
        assert f"Status: {module.NO_PLAN} (board state: planned )" in ticket.replace("planned)", "planned )") or "board state: planned" in ticket, ticket[:300]

    def t_parent_and_backlog():
        text = page_text(page("initiative-portfolio-tickets-ticket-board.html"))
        assert "Child initiatives" in text and "initiative-atlas Shoppers buy online in-progress" in text, text
        rows = rows_of(page("backlog-ticket-board.html"))
        assert any("Logo refresh ready-for-dev backlog story-logo-refresh-plan.md" in r for r in rows), rows
        assert page("backlog-ticket-logo-logo-refresh.html").is_file()

    def t_problems():
        text = page_text(page("initiative-atlas-tickets-ticket-board.html"))
        assert "Problems" in text, "no Problems section"
        assert "story-gift-wrap-plan.md: status 'shipped' is not one of" in text, text
        assert "story-orphan-plan.md: ticket '99' names no entry or leaf file" in text, text
        assert not any(p.name.endswith("-99-") for p in docs.glob("*.html"))

    def t_sentinels():
        hits = [p.name for p in out.rglob("*") if p.is_file() and SENTINEL in p.read_text(encoding="utf-8", errors="replace")]
        assert not hits, f"v6 input reached the Atlas: {hits}"
        assert not any(p.name.endswith("prd.html") and "v6-planning" in p.name for p in docs.glob("*.html"))

    def t_stage():
        staged = [p.relative_to(stage).as_posix() for p in stage.rglob("*") if p.is_file()]
        store = [p for p in staged if p.startswith("_bmad-output/")]
        assert store, "no staged store"
        assert not any(p.endswith((".yaml", ".yml", ".json", ".toml")) for p in store), [p for p in store if not p.endswith(".md")]
        assert not any("archive-v6" in p for p in store), "archive-v6 staged"
        assert not any("knowledge-atlas" in p for p in store), "the Atlas folder was staged"
        assert "_bmad-output/initiative-atlas/tickets/ticket-board.md" in store
        assert "_bmad-output/initiative-atlas/tickets/epic-pricing-rules/tickets/1-2-discount-codes.md" in store
        assert "_bmad-output/initiative-atlas/prd-atlas/prd-atlas.md" in store, "store documents are copied"
        assert (stage / "package.json").read_text(encoding="utf-8").strip() == '{"name": "atlas-fixture-project"}'

    def t_frontmatter():
        fm = module.parse_frontmatter("---\ntitle: 'It''s here'\nstatus: 'built' # a | b\nticket: '12'\ncovers: [R1, \"R2\"]\nempty:\nnested:\n  a: 1\n---\nbody")
        assert fm == {"title": "It's here", "status": "built", "ticket": "12", "covers": ["R1", "R2"], "empty": "", "nested": ""}, fm
        assert module.parse_frontmatter("no frontmatter\n---\nx: 1\n---\n") == {}
        assert module.parse_frontmatter("---\r\nstatus: done\r\n---\r\n") == {"status": "done"}

    def t_refused_out():
        for target, why in (
            (OUTPUT_FOLDER, "the output folder"), (".", "the project root"), ("..", "a parent of the store"),
            (f"{OUTPUT_FOLDER}/initiative-atlas", "a folder of the store"),
        ):
            assert build(module, project, target) == 2, f"--out {target} ({why}) not refused"
        other = root / "not-an-atlas"
        write(other / "keep.txt", "user data")
        assert build(module, project, str(other)) == 2, "a non-empty folder without a previous Atlas not refused"
        assert (other / "keep.txt").read_text(encoding="utf-8") == "user data"
        assert (out / "index.html").is_file(), "the refused runs changed the Atlas"
        assert (project / OUTPUT_FOLDER / "initiative-atlas" / "initiative-atlas.md").is_file()

    def t_rerun_replaces():
        stale = out / "docs" / "stale-page.html"
        write(stale, "<html>stale</html>")
        assert build(module, project, str(out)) == 0
        assert not stale.exists(), "a stale page survived the re-run"
        assert (out / "index.html").is_file()

    def t_deterministic():
        first = {p.relative_to(out).as_posix(): p.read_bytes() for p in out.rglob("*") if p.is_file()}
        again = root / "again"
        assert build(module, project, str(again)) == 0
        second = {p.relative_to(again).as_posix(): p.read_bytes() for p in again.rglob("*") if p.is_file()}
        assert first.keys() == second.keys(), set(first) ^ set(second)
        differ = [k for k in first if first[k] != second[k]]
        assert not differ, f"not byte-identical under SOURCE_DATE_EPOCH: {differ}"
        assert '"generatedAt": "2023-11-14T22:13:20Z"' in first["manifest.json"].decode("utf-8"), "SOURCE_DATE_EPOCH not honoured"

    def t_placeholder_and_long_paths():
        """`{project-root}` as resolve_config.py prints it, and a destination beyond the 260-character Windows limit."""
        # The folder itself stays under 260 characters (the test creates it the ordinary way); the page names of the
        # Atlas inside it then exceed the limit, which the script must survive on Windows.
        deep = root / ("deep-" + "x" * max(0, 236 - len(str(root)) - 6 - 15))
        deep.mkdir(parents=True)
        site = deep / "knowledge-atlas"
        assert len(str(site)) < 260, len(str(site))
        code = build(module, project, str(site), extra=["--output-folder", "{project-root}/" + OUTPUT_FOLDER])
        assert code == 0, f"exit {code}: {last_output[0][-600:]}"
        pages = [p for p in Path(module.long_path(site)).rglob("*") if p.is_file()]
        longest = max(len(str(p).replace("\\\\?\\", "")) for p in pages)
        assert longest > 260, f"the deepest page is only {longest} characters"
        assert (site / "index.html").is_file() and len(pages) > 30, len(pages)
        assert build(module, project, str(site), extra=["--output-folder", "{project-root}/" + OUTPUT_FOLDER]) == 0, "a re-run over the deep site"
        assert build(module, project, "{project-root}/" + OUTPUT_FOLDER + "/knowledge-atlas") == 0, "{project-root} in --out"
        assert build(module, project, "{project_root}/" + OUTPUT_FOLDER) == 2, "the placeholder form of the output folder not refused as --out"

    def t_empty_store():
        empty = root / "empty-project"
        write(empty / OUTPUT_FOLDER / "README.md", "nothing here\n")
        assert build(module, empty, "site") == 0
        assert (empty / "site" / "index.html").is_file()
        assert build(module, empty, "missing", extra=["--output-folder", "nope"]) == 2, "a missing output folder is a prerequisite"

    def t_cli():
        uv = shutil.which("uv")
        assert uv, "uv not on PATH (use --skip-cli)"
        target = root / "cli-out"
        result = subprocess.run(
            [uv, "run", "--no-cache", str(SCRIPT), "--project-root", str(project), "--output-folder", OUTPUT_FOLDER,
             "--out", str(target), "--engine", str(ENGINE)],
            cwd=project, capture_output=True, text=True, encoding="utf-8", errors="replace", check=False, stdin=subprocess.DEVNULL,
        )
        assert result.returncode == 0, f"exit {result.returncode}: {result.stderr[-1500:]}"
        lines = result.stdout.splitlines()
        assert Path(lines[0]).resolve() == (target / "index.html").resolve(), lines[:2]
        assert lines[1].startswith("Knowledge Atlas: 2 initiative(s), 3 epic(s), 11 ticket(s),") and "2 problem(s)" in lines[1], lines[1]
        assert sum(1 for line in lines if line.startswith("  problem: ")) == 2, lines

    tests = [
        ("member and record files", t_member),
        ("the member names no v6 file", t_no_v6_names),
        ("workflow: ticket-store check, resolve_config.py keys, default folder, build command", t_workflow),
        ("build from the composed project", t_build),
        ("every epic and ticket of the fixture renders with its status", t_every_epic_and_ticket),
        ("statuses: done, built, dropped, blocked, in-review, no plan, unknown, draft, ready-for-dev", t_statuses_spot),
        ("parent initiative children and backlog board", t_parent_and_backlog),
        ("store problems reported", t_problems),
        ("no v6 sentinel reaches the Atlas", t_sentinels),
        ("staged copy: no tracker format, no archive-v6, boards and ticket pages", t_stage),
        ("frontmatter reader", t_frontmatter),
        ("--out refused where it would destroy something", t_refused_out),
        ("a re-run replaces a stale site", t_rerun_replaces),
        ("byte-identical output under SOURCE_DATE_EPOCH", t_deterministic),
        ("{project-root} placeholder and a destination beyond the Windows path limit", t_placeholder_and_long_paths),
        ("empty store and missing output folder", t_empty_store),
    ]
    if not args.skip_cli:
        tests.append(("command line through uv run --no-cache", t_cli))

    print(f"ma-knowledge-atlas tests over {FIXTURE.relative_to(REPO).as_posix()}")
    for name, fn in tests:
        test(name, fn)
    if not args.keep:
        for path in tmp_roots:
            shutil.rmtree(path, ignore_errors=True)
    print(f"{passed} passed, {failed} failed")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
