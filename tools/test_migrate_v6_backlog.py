#!/usr/bin/env python3
# /// script
# requires-python = ">=3.11"
# dependencies = ["pyyaml>=6.0.2,<7"]
# ///
"""Tests of `skills/ma-ops-dev-epic/scripts/migrate_v6_backlog.py` (Story 37.3; FR294, FR296, F29 "Migration from
3.x: tracking data").

The fixture `tools/fixtures/migrate-v6/project/` is a BMAD v7 project after `bmad migrate method`: an initiative whose
`archive-v6/sprint-status.yaml` is the ma-agents 3.x flat tracker holding the collision cases of ma-agents
`epic-runs/epic-36/36-1-gate-findings.md` AC9 (a validation report beside its story on one (epic, id), a tracking key
whose slug differs from the story file's, epics with no `## Epic N:` heading, lettered story numbers `30-6a` /
`30-6b`), cancelled / wont-fix / optional work, 3.x bug files in `backlog/` with statuses `tickets.py` rejects, a
standalone key, and `_bmad/ma-skills/`. `tools/fixtures/migrate-v6/trackers/` holds the unified tracker
(`backlog:` + `sprints:`) and a tracker with neither section.

Checks: every rule of F29 and the epic brief, idempotence (a second run writes nothing and changes no byte), the
backup rule (a short-named folder at the project root; every backup path no longer than its source path), the
report, `--dry-run`, the command line through `uv run --no-cache`, the `[skill] scripts` declaration, and, with
`--tree`, `tickets.py status` exiting 0 on the migrated initiative and on `backlog/` (CI asserts both).

Usage: uv run --no-cache tools/test_migrate_v6_backlog.py [--tree BMAD_TREE] [--skip-cli]
Exit: 0 every test passed, 1 a test failed, 2 a prerequisite is missing.
"""

from __future__ import annotations

import argparse
import hashlib
import importlib.util
import io
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
import tomllib
import traceback
from contextlib import redirect_stdout
from pathlib import Path

HERE = Path(__file__).resolve().parent
REPO = HERE.parent
SCRIPT = REPO / "skills" / "ma-ops-dev-epic" / "scripts" / "migrate_v6_backlog.py"
FIXTURE = HERE / "fixtures" / "migrate-v6"
PROJECT = FIXTURE / "project"
TRACKERS = FIXTURE / "trackers"
OUT = Path("_bmad-output")
INI = OUT / "initiative-demo"

passed = 0
failed = 0
tmp_roots: list[Path] = []


def load_script():
    spec = importlib.util.spec_from_file_location("migrate_v6_backlog", SCRIPT)
    module = importlib.util.module_from_spec(spec)
    assert spec.loader is not None
    spec.loader.exec_module(module)
    return module


mv = load_script()


def test(name, fn) -> None:
    global passed, failed
    try:
        fn()
    except Exception:  # noqa: BLE001 - report every failure, keep running
        failed += 1
        print(f"  x {name}")
        print("    " + traceback.format_exc().replace("\n", "\n    "))
        return
    passed += 1
    print(f"  + {name}")


def mktemp() -> Path:
    root = Path(tempfile.mkdtemp(prefix="mv6-"))
    tmp_roots.append(root)
    return root


def project(tracker: str | None = None) -> Path:
    """A fresh copy of the fixture project; `tracker` swaps the archived sprint-status.yaml."""
    root = mktemp() / "p"
    shutil.copytree(PROJECT, root)
    if tracker:
        shutil.copy(TRACKERS / tracker, root / INI / "archive-v6" / "sprint-status.yaml")
    return root


last_stdout = ""


def run(root: Path, *extra: str) -> int:
    """The script in this process, its output captured (it is the report's text; `last_stdout` keeps it)."""
    global last_stdout
    buf = io.StringIO()
    with redirect_stdout(buf):
        code = mv.main(["--project-root", str(root), "--output-folder", "_bmad-output", *extra])
    last_stdout = buf.getvalue()
    return code


def snapshot(root: Path) -> dict[str, str]:
    out = {}
    for folder in (root / OUT, root / "_bmad"):
        for path in sorted(p for p in folder.rglob("*") if p.is_file()):
            out[path.relative_to(root).as_posix()] = hashlib.sha256(path.read_bytes()).hexdigest()
    return out


def fm(path: Path) -> dict:
    return mv.frontmatter(path.read_text(encoding="utf-8"))


def entries(root: Path, epic: str) -> dict[str, dict]:
    data = tomllib.loads((root / INI / "tickets" / epic / "tickets" / "tickets.toml").read_text(encoding="utf-8"))
    return {str(e["id"]): e for e in data.get("entry", [])}


def plan(root: Path, epic: str, stem: str) -> Path:
    return root / INI / "tickets" / epic / "tickets" / f"{stem}-plan.md"


# ---------------------------------------------------------------- the flat tracker (development_status only)


def t_flat():
    root = project()
    assert run(root) == 0
    archive = root / INI / "archive-v6"
    report = (root / OUT / "migration-v6-v7" / "ma-ops-migration-1.md").read_text(encoding="utf-8")
    # absent sections reported, tracker unchanged
    assert "has no `backlog:` section" in report and "has no `sprints:` section" in report
    assert (archive / "sprint-status.yaml").read_bytes() == (PROJECT / INI / "archive-v6" / "sprint-status.yaml").read_bytes()
    assert not (archive / "sprints.yaml").exists()
    # validation reports archived, never a story or a plan; the taken name gets a suffix and a report line
    assert (archive / "15-8-validation-report.md").is_file()
    assert not (root / INI / "tickets" / "epic-agents" / "tickets" / "15-8-validation-report.md").exists()
    assert (archive / "16-4-validation-report-1.md").read_text(encoding="utf-8").startswith("# 16.4 validation report (live copy)")
    assert (archive / "16-4-validation-report.md").read_text(encoding="utf-8").startswith("# 16.4 validation report (the done/ copy")
    assert "16-4-validation-report-1.md" in report and "collision" in report
    assert "`15-8-validation-report` (development_status): a validation report key" in report
    # tracking slug != file slug: joined by (N, M), v6_key = the tracking key
    layout = entries(root, "epic-layout")
    assert layout["1"]["v6_key"] == "16-1-repository-layout-wizard-jira-enhancement" and layout["1"]["title"] == "Repository layout wizard"
    assert "joined by (epic 16, id 1)" in report
    # a key with no entry: added with its id, a plan with the mapped status
    assert layout["9"]["v6_key"] == "16-9-new-layout-item" and layout["9"]["type"] == "story"
    assert fm(plan(root, "epic-layout", "story-new-layout-item"))["status"] == "ready-for-dev"
    # a plan status tickets.py rejects is mapped
    assert fm(plan(root, "epic-layout", "story-validate-cross-repo-path-resolution"))["status"] == "in-review"
    # lettered ids keep their suffix; on-hold -> blocked
    custom = entries(root, "epic-custom-source")
    assert set(custom) == {"3", "6a", "6b", "7"}, set(custom)
    assert custom["6a"]["v6_key"] == "30-6a-custom-source-prompt-enumerate-multiselect"
    assert fm(plan(root, "epic-custom-source", "story-custom-source-stage-install-subset"))["status"] == "done"
    assert fm(plan(root, "epic-custom-source", "story-persist-reenumerate-marketplace-source"))["status"] == "blocked"
    # epics with no heading: created, ids from the tracking keys, container status mapped
    ini = tomllib.loads((root / INI / "tickets" / "tickets.toml").read_text(encoding="utf-8"))
    slugs = {e["id"]: e["slug"] for e in ini["epic"]}
    assert slugs[24] == "epic-24-untitled" and slugs[32] == "epic-32-untitled"
    assert fm(root / INI / "tickets" / "epic-24-untitled" / "epic-24-untitled.md")["status"] == "done"
    assert fm(root / INI / "tickets" / "epic-32-untitled" / "epic-32-untitled.md")["status"] == "dropped"
    assert entries(root, "epic-24-untitled")["6"]["v6_key"] == "24-6-add-bmad-customize-skill-to-extension-plugin"
    assert fm(plan(root, "epic-24-untitled", "story-add-bmad-customize-skill-to-extension-plugin"))["status"] == "done"
    assert fm(plan(root, "epic-24-untitled", "story-wire-on-complete-hooks"))["status"] == "dropped"  # optional
    # cancelled: an existing plan becomes dropped, a missing entry is added dropped
    assert fm(plan(root, "epic-vs-agents", "story-vs-agent-registry-entry"))["status"] == "dropped"
    assert fm(plan(root, "epic-vs-agents", "story-vs-skill-template-format"))["status"] == "dropped"
    assert fm(plan(root, "epic-32-untitled", "story-design-studio-module"))["status"] == "dropped"
    # present entries untouched
    assert entries(root, "epic-agents")["8"]["v6_key"] == "15-8-validate-migrated-agents-and-workflows"
    assert fm(plan(root, "epic-agents", "story-validate-migrated-agents-and-workflows"))["status"] == "done"
    assert "`15-8-validate-migrated-agents-and-workflows` is entry 8 in epic-agents" in report
    # bugs: v6_key joined, rejected statuses mapped, wont-fix dropped, a key with no file gets a leaf and a plan
    backlog = root / OUT / "backlog"
    assert fm(backlog / "bug-docs-dir-created-empty.md")["v6_key"] == "bug-docs-dir-created-empty"
    assert fm(backlog / "bug-docs-dir-created-empty.md")["status"] == "dropped"
    assert fm(backlog / "bug-docs-dir-created-empty-plan.md")["status"] == "dropped"
    assert fm(backlog / "bug-jira-backend-ignored-on-first-run.md")["status"] == "in-review"
    assert fm(backlog / "bug-jira-backend-ignored-on-first-run-plan.md")["status"] == "in-review"
    assert fm(backlog / "bug-marker-merge-orphan.md")["v6_key"] == "bug-marker-merge-orphan"
    assert not (backlog / "bug-marker-merge-orphan-plan.md").exists()  # backlog status: no plan
    assert fm(backlog / "bug-stale-copilot-skills-dir.md")["type"] == "bug"
    assert fm(backlog / "bug-stale-copilot-skills-dir-plan.md")["status"] == "done"
    # retrospective keys and standalone keys reported, not mapped
    assert "`epic-30-retrospective` (development_status): retrospective keys" in report
    assert "`rename-sqa-persona-gad-to-gadi` (development_status, 3.x status `done`): not an epic, story or bug key" in report
    # ma-skills archived
    assert not (root / "_bmad" / "ma-skills").exists() and (archive / "ma-skills" / "config.yaml").is_file()
    # the FR296 table
    for skill in ("my-next-issue", "create-bug-story", "sprint-status-view", "story-status-lookup", "generate-backlog",
                  "prioritize-backlog", "add-sprint", "add-to-sprint", "remove-from-sprint", "modify-sprint",
                  "close-sprint", "cleanup-done", "bmad-sprint-planning", "bmad-sprint-status", "bmad-dev-story"):
        assert f"| `{skill}` |" in report, skill
    assert "`bmad-agent-po`" in report and "- input: `_bmad-output/initiative-demo/archive-v6/sprint-status.yaml`" in report
    return root


def t_idempotent():
    root = project()
    assert run(root) == 0
    before = snapshot(root)
    assert run(root, "--json") == 0
    after = snapshot(root)
    changed = sorted(k for k in set(before) | set(after) if before.get(k) != after.get(k))
    assert changed == [], changed
    backups = sorted((root / ".mv6").iterdir())
    assert len(backups) == 1, [b.name for b in backups]  # the second run backed up nothing


def t_second_run_counts():
    root = project()
    assert run(root) == 0
    assert run(root, "--json") == 0
    last = json.loads(last_stdout.strip().splitlines()[-1])
    assert last["written"] == 0 and last["changed"] == 0 and last["archived"] == 0, last
    assert last["backup_dir"] is None


def t_backups():
    root = project()
    before = snapshot(root)
    assert run(root) == 0
    runs = sorted((root / ".mv6").iterdir())
    assert len(runs) == 1 and re.fullmatch(r"\d{8}-\d{6}", runs[0].name), runs
    index = (runs[0] / "index.txt").read_text(encoding="utf-8").splitlines()
    assert index and (runs[0] / ".gitignore").read_text(encoding="utf-8") == "*\n"
    changed_sources = set()
    for line in index:
        copy, source = line.split("\t")
        copy_path, source_path = runs[0] / copy, root / source
        # the backup holds the bytes the source had before the run
        assert hashlib.sha256(copy_path.read_bytes()).hexdigest() == before[source], source
        assert len(str(copy_path)) <= len(str(source_path)), (copy_path, source_path)
        changed_sources.add(source)
    # every changed-in-place file was backed up (moved files are backed up too; created ones are not)
    after = snapshot(root)
    changed_in_place = {k for k in before if k in after and before[k] != after[k]}
    assert changed_in_place <= changed_sources, changed_in_place - changed_sources
    assert "_bmad-output/initiative-demo/tickets/epic-layout/tickets/tickets.toml" in changed_sources


def t_dry_run():
    root = project()
    before = snapshot(root)
    assert run(root, "--dry-run") == 0
    assert snapshot(root) == before and not (root / ".mv6").exists()
    assert not (root / OUT / "migration-v6-v7").exists()


def t_unified():
    root = project("unified.yaml")
    assert run(root) == 0
    archive = root / INI / "archive-v6"
    report = (root / OUT / "migration-v6-v7" / "ma-ops-migration-1.md").read_text(encoding="utf-8")
    assert "has no `development_status:` section" in report
    # sprints: archived as written, comments included
    sprints = (archive / "sprints.yaml").read_text(encoding="utf-8")
    assert sprints.startswith("sprints:          # sprint-1 is closed") and "capacity: 10" in sprints and "16-4-validate-cross-repo-path-resolution" in sprints
    # a backlog item whose epic the tree holds becomes an entry there
    layout = entries(root, "epic-layout")
    assert layout["9"]["v6_key"] == "16-9-new-layout-item" and layout["9"]["title"] == "New layout item"
    assert fm(plan(root, "epic-layout", "story-new-layout-item"))["status"] == "ready-for-dev"
    # a backlog bug becomes backlog/bug-<slug>.md with its severity; status backlog: no plan
    backlog = root / OUT / "backlog"
    leaf = fm(backlog / "bug-new-thing.md")
    assert leaf["v6_key"] == "bug-new-thing" and leaf["severity"] == "P1" and leaf["title"] == "A new thing is broken"
    assert not (backlog / "bug-new-thing-plan.md").exists()
    # a backlog story whose epic the tree lacks (epic 40 has no entries anywhere) becomes an untitled epic's entry
    assert entries(root, "epic-40-untitled")["1"]["v6_key"] == "40-1-first-story-of-epic-40"
    # a standalone item becomes backlog/story-<slug>.md; cancelled -> dropped plan
    assert fm(backlog / "story-standalone-task.md")["v6_key"] == "standalone-task"
    assert fm(backlog / "story-standalone-task-plan.md")["status"] == "dropped"
    # a sprint item already in the tree is present; its rejected plan status is mapped
    assert "`16-4-validate-cross-repo-path-resolution` is entry 4 in epic-layout" in report
    assert fm(plan(root, "epic-layout", "story-validate-cross-repo-path-resolution"))["status"] == "in-review"
    # idempotent on this shape too
    before = snapshot(root)
    assert run(root) == 0 and snapshot(root) == before


def t_no_sections():
    root = project("no-sections.yaml")
    assert run(root) == 0
    report = (root / OUT / "migration-v6-v7" / "ma-ops-migration-1.md").read_text(encoding="utf-8")
    assert "has no `backlog:` section" in report and "has no `sprints:` section" in report
    assert entries(root, "epic-layout")["1"]["v6_key"] == "16-1-repository-layout-wizard-jira-enhancement"
    # nothing else moved: the bug files still carry their 3.x status words only where no key named them... the
    # rejected statuses are still mapped so tickets.py accepts the folder
    assert fm(root / OUT / "backlog" / "bug-jira-backend-ignored-on-first-run.md")["status"] == "in-review"


def t_never_overwrites():
    root = project()
    taken = root / OUT / "backlog" / "bug-stale-copilot-skills-dir-plan.md"
    user_text = "---\ntitle: 'user plan'\ntype: 'chore'\nticket: 'something-else'\nstatus: 'draft'\n---\n\n# user plan\n"
    taken.write_text(user_text, encoding="utf-8")
    assert run(root) == 0
    assert taken.read_text(encoding="utf-8") == user_text
    assert fm(root / OUT / "backlog" / "bug-stale-copilot-skills-dir-plan-1.md")["status"] == "done"
    report = (root / OUT / "migration-v6-v7" / "ma-ops-migration-1.md").read_text(encoding="utf-8")
    assert "collision: `_bmad-output/backlog/bug-stale-copilot-skills-dir-plan.md` exists" in report and "bug-stale-copilot-skills-dir-plan-1.md" in report
    # a leaf the user already has for a tracked key is joined (v6_key set), never replaced
    root = project()
    leaf = root / OUT / "backlog" / "bug-stale-copilot-skills-dir.md"
    leaf.write_text("---\ntype: bug\ntitle: 'user file'\nseverity: P2\n---\n\n# user file\n", encoding="utf-8")
    assert run(root) == 0
    assert fm(leaf)["title"] == "user file" and fm(leaf)["v6_key"] == "bug-stale-copilot-skills-dir"
    assert not (root / OUT / "backlog" / "bug-stale-copilot-skills-dir-1.md").exists()


def t_nothing_to_do():
    root = mktemp() / "p"
    (root / "_bmad-output").mkdir(parents=True)
    assert run(root) == 2


def t_bad_tracker():
    root = project()
    (root / INI / "archive-v6" / "sprint-status.yaml").write_text("development_status: [\n", encoding="utf-8")
    assert run(root) == 1


def t_declared_script():
    data = tomllib.loads((REPO / "skills" / "ma-ops-dev-epic" / "bmod.toml").read_text(encoding="utf-8"))
    assert data["skill"]["scripts"] == ["scripts/migrate_v6_backlog.py"], data
    assert SCRIPT.is_file()
    head = SCRIPT.read_text(encoding="utf-8").splitlines()[:5]
    assert head[1] == "# /// script" and any("pyyaml" in line for line in head)
    migration = tomllib.loads((REPO / "skills" / "bmod-ma-ops" / "migration-1.toml").read_text(encoding="utf-8"))["migration"]
    assert "migrate_v6_backlog.py" in migration["guide"] and "archive-v6/sprint-status.yaml" in migration["detect"]
    for key in ("module", "from", "to", "title", "summary", "detect", "guide"):
        assert migration[key].strip()
    assert migration["module"] == "ma-ops" and len(migration["checklist"]) >= 8


def t_cli():
    uv = shutil.which("uv")
    assert uv, "uv not on PATH"
    root = project()
    env = {**os.environ, "DISABLE_TELEMETRY": "1", "DO_NOT_TRACK": "1"}
    base = [uv, "run", "--no-cache", str(SCRIPT), "--project-root", str(root), "--output-folder", "_bmad-output"]
    r = subprocess.run([*base, "--dry-run"], capture_output=True, text=True, encoding="utf-8", env=env, check=False)
    assert r.returncode == 0 and "dry run: nothing written" in r.stdout, r.stderr[-2000:]
    r = subprocess.run([*base, "--json"], capture_output=True, text=True, encoding="utf-8", env=env, check=False)
    assert r.returncode == 0, r.stderr[-2000:]
    counts = json.loads(r.stdout.strip().splitlines()[-1])
    assert counts["written"] > 0 and counts["archived"] == 3 and counts["joined"] == 4, counts
    r = subprocess.run([*base, "--json"], capture_output=True, text=True, encoding="utf-8", env=env, check=False)
    assert r.returncode == 0 and json.loads(r.stdout.strip().splitlines()[-1])["written"] == 0
    return root


def t_tickets_py(tree: Path):
    """`tickets.py status` exits 0 on the migrated initiative and on backlog/, before and after the second run."""
    uv = shutil.which("uv")
    assert uv, "uv not on PATH"
    tickets = tree / "skills" / "bmad-agent-po" / "scripts" / "tickets.py"
    config_utils = tree / "skills" / "bmad" / "scripts" / "config_utils.py"
    assert tickets.is_file() and config_utils.is_file(), "not a BMAD v7 tree"
    env = {**os.environ, "DISABLE_TELEMETRY": "1", "DO_NOT_TRACK": "1"}
    for tracker in (None, "unified.yaml"):
        root = project(tracker)
        (root / "_bmad" / "scripts").mkdir(parents=True, exist_ok=True)
        shutil.copy(config_utils, root / "_bmad" / "scripts" / "config_utils.py")
        # before: the fixture's 3.x statuses make tickets.py report problems or fail on backlog/
        r0 = subprocess.run([uv, "run", "--no-cache", str(tickets), "--project-root", str(root), "status", "backlog"],
                            capture_output=True, text=True, encoding="utf-8", env=env, check=False)
        assert r0.returncode != 0 or "problems" in r0.stdout, "the fixture should not be clean before the migration"
        assert run(root) == 0
        for _ in range(2):
            for folder in ("initiative-demo", "backlog"):
                r = subprocess.run([uv, "run", "--no-cache", str(tickets), "--project-root", str(root), "status", folder],
                                   capture_output=True, text=True, encoding="utf-8", env=env, check=False)
                assert r.returncode == 0, f"{folder}: exit {r.returncode}: {r.stderr[-1500:]}"
                out = json.loads(r.stdout)
                assert not out.get("problems"), out.get("problems")
                if folder == "initiative-demo":
                    states = {f"{t['epic']}/{t['id']}": t["state"] for t in out["tickets"]}
                    epics = {e["slug"]: e for e in out["epics"]}
                    assert states["epic-layout/4"] == "review" and states["epic-layout/9"] == "backlog", states
                    if tracker is None:
                        assert states["epic-custom-source/6a"] == "done" and states["epic-custom-source/6b"] == "done", states
                        assert states["epic-custom-source/7"] == "in-progress" and states["epic-vs-agents/1"] == "dropped", states
                        assert out["counts"]["dropped"] == 4 and out["counts"]["total"] == 13, out["counts"]
                        assert epics["epic-24-untitled"]["status"] == "done" and epics["epic-32-untitled"]["status"] == "dropped"
                    else:
                        assert states["epic-40-untitled/1"] == "planned" and out["counts"]["total"] == 7, out["counts"]
                else:
                    assert out["counts"]["total"] >= 4 and out["counts"].get("dropped", 0) >= 1, out["counts"]
                    states = {t["file"]: t["state"] for t in out["tickets"]}
                    assert states["bug-docs-dir-created-empty.md"] == "dropped" and states["bug-jira-backend-ignored-on-first-run.md"] == "review", states
            assert run(root) == 0  # the second run, then the same checks again


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--tree", type=Path, default=os.environ.get("BMAD_V7_TREE"), help="BMAD-METHOD checkout at the pinned commit (runs tickets.py on the result)")
    parser.add_argument("--skip-cli", action="store_true", help="skip the uv run --no-cache command-line tests")
    args = parser.parse_args(argv)
    if not PROJECT.is_dir() or not SCRIPT.is_file():
        print("prerequisite missing: the fixture or the script", file=sys.stderr)
        return 2
    print("migrate_v6_backlog.py")
    try:
        test("flat tracker: every rule of F29 and the brief (collisions, drops, bugs, untitled epics, lettered ids, ma-skills, report)", t_flat)
        test("idempotence: a second run changes no byte and backs up nothing", t_idempotent)
        test("second run reports written 0, changed 0, archived 0", t_second_run_counts)
        test("backups: short-named folder at the project root, index maps copies to sources, each copy no longer than its source", t_backups)
        test("--dry-run writes nothing", t_dry_run)
        test("unified tracker: backlog items, sprints.yaml archived as written, bug severity, standalone item, untitled epic 40", t_unified)
        test("a tracker with neither backlog: nor sprints: is valid input and reported", t_no_sections)
        test("never overwrites: a taken name gets a numeric suffix and a report line", t_never_overwrites)
        test("no migrated initiative: exit 2", t_nothing_to_do)
        test("unreadable tracker: exit 1", t_bad_tracker)
        test("the script is declared in [skill] scripts and migration-1.toml calls it", t_declared_script)
        if not args.skip_cli:
            test("command line: uv run --no-cache migrate_v6_backlog.py --dry-run, run, re-run", t_cli)
        if args.tree:
            test("tickets.py status exits 0 on the migrated initiative and on backlog/, after the first and the second run", lambda: t_tickets_py(args.tree.resolve()))
        else:
            print("  - tickets.py check skipped: no --tree / BMAD_V7_TREE")
    finally:
        for root in tmp_roots:
            shutil.rmtree(root, ignore_errors=True)
    print(f"\n{passed} passed, {failed} failed")
    return 1 if failed else 0


if __name__ == "__main__":
    if sys.platform == "win32":
        sys.stdout.reconfigure(encoding="utf-8")
    raise SystemExit(main())
