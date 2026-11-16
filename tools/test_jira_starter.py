#!/usr/bin/env python3
# /// script
# requires-python = ">=3.11"
# ///
"""The `jira-onprem` store starter `skills/ma-atlassian-bind/config/jira-onprem-ticketing.toml` (Story 38.2;
FR289, ma-agents PRD F29 "Jira store", Decision P5-11.4).

Static checks: the starter parses; its keys are exactly F29's store-file keys (`[tickets]` `store`, `site`,
`key`, `mcp_server`, `[tickets.types]`, `[tickets.status]`, `[verbs]` `setup` / `write` / `query`) plus the
keys every upstream tracker starter carries (`description`, `[tickets]` `access` / `fields` / `reference`);
`store` is `jira-onprem` and the three answers are empty for bind to fill; the type and status maps are
F29's, covering every type and state the pinned `tickets.py` knows, `dropped` = Done + resolution Won't Do;
the identity clause; each verb carries a REST form and an MCP form, `write` covering create, edit,
transition, assign, link and comment; every REST call (`METHOD <site>/rest/api/N/...`) is one of the
success forms of `references/jira-onprem-verbs.md` (Story 38.1, run against `tools/jira_dc_mock.py` by
`test_jira_verbs.py`), and every MCP tool is one of that file's tool table.

With `--tree` (the BMAD-METHOD checkout at the pin): a scratch project gets `bmad-agent-po` from the tree
under `.claude/skills/` and the starter, answers filled as bind fills them, as
`_bmad/custom/ticketing-store-config.toml`; `read_store.py -k tickets.store` prints `jira-onprem`,
`-k verbs.setup|write|query` print non-empty text naming `/rest/api/2/`, the whole read equals the file
(no upstream starter merges in), `--starters` does not list `jira-onprem`; `tickets.py next backlog` exits
2 asking for `--synced` and exits 0 with it.

`--mutants`: a missing state mapping, a `/rest/api/3` path, a missing verb, an MCP tool the reference does
not record, a missing `mcp_server` key; each copy must be red (the missing verb also through `read_store.py`
with `--tree`).

Usage: uv run --no-cache tools/test_jira_starter.py [--tree BMAD_TREE] [--mutants]
Exit: 0 every check (and every mutant) as expected, 1 otherwise, 2 a prerequisite is missing.
"""

from __future__ import annotations

import argparse
import ast
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
import tomllib
from pathlib import Path

sys.dont_write_bytecode = True
HERE = Path(__file__).resolve().parent
REPO = HERE.parent
sys.path.insert(0, str(HERE))
import test_jira_verbs  # noqa: E402  (the reference parser of Story 38.1)

SKILL = REPO / "skills" / "ma-atlassian-bind"
STARTER = SKILL / "config" / "jira-onprem-ticketing.toml"
REFERENCE = SKILL / "references" / "jira-onprem-verbs.md"

# F29 "Jira store" key table, and the keys every upstream tracker starter (`bmad-agent-po/config/*-ticketing.toml`) carries.
F29_TICKETS = {"store", "site", "key", "mcp_server", "types", "status"}
UPSTREAM_TICKETS = {"access", "fields", "reference"}
TOP = {"description", "tickets", "verbs"}
VERBS = {"setup", "write", "query"}
ANSWERS = {"site": "jira_site", "key": "jira_project_key", "mcp_server": "jira_mcp_server"}
F29_TYPES = {"initiative": "", "epic": "Epic", "story": "Story", "spike": "Task", "bug": "Bug"}
F29_STATUS = {"backlog": "To Do", "in-progress": "In Progress", "review": "In Review", "done": "Done", "dropped": "Done"}
# What each verb must do, as (method, path) of the reference's forms and MCP tools (F29: write covers
# create, transition, assign and link; Story 38.1 D8 adds edit and comment).
NEEDS: dict[str, tuple[set[tuple[str, str]], set[str]]] = {
    "setup": ({("GET", "/myself"), ("GET", "/serverInfo"), ("GET", "/project/*"), ("GET", "/project/*/statuses"),
               ("GET", "/issue/createmeta/*/issuetypes"), ("GET", "/issueLinkType")},
              {"jira_get_user_profile", "jira_get_project_issue_types", "jira_get_link_types"}),
    "write": ({("POST", "/issue"), ("PUT", "/issue/*"), ("GET", "/issue/*/transitions"), ("POST", "/issue/*/transitions"),
               ("PUT", "/issue/*/assignee"), ("POST", "/issueLink"), ("POST", "/issue/*/comment")},
              {"jira_create_issue", "jira_update_issue", "jira_get_transitions", "jira_transition_issue",
               "jira_assign_issue", "jira_create_issue_link", "jira_add_comment"}),
    "query": ({("GET", "/issue/*"), ("GET", "/search")}, {"jira_get_issue", "jira_search"}),
}
CALL = re.compile(r"\b(GET|POST|PUT|DELETE|PATCH)\s+`?<site>/rest/api/(\d+)(/[^\s`?\"']*)")
ANY_API = re.compile(r"/rest/api/(\w+)")
PATHED = re.compile(r"/rest/api/\w+/[A-Za-z]")  # a path under the base, not the base `<site>/rest/api/2/` itself
TOOL = re.compile(r"`(jira_[a-z_]+)\b")  # a tool is written in backticks; toolset names (jira_links) are not
TABLE_TOOL = re.compile(r"^\|\s*(?:setup|write|query)\b[^|]*\|\s*`(jira_[a-z_]+)`\s*\|", re.M)  # the "Verb part | Tool" rows


def norm(path: str) -> str:
    """`/issue/<ISSUE>/transitions` and `/issue/<item>/transitions` -> `/issue/*/transitions`."""
    return re.sub(r"<[^>]+>", "*", path.split("?", 1)[0]).rstrip("/") or "/"


def reference_forms(reference: Path) -> tuple[set[tuple[str, str]], set[str]]:
    """The success forms (2xx) of the reference as (method, normalised path under /rest/api/2), and its MCP tool table."""
    text = reference.read_text(encoding="utf-8")
    forms: set[tuple[str, str]] = set()
    for form in test_jira_verbs.parse(text):
        if not 200 <= form.status < 300:
            continue  # the failure-shape forms (401, 404 on /rest/api/3, 400, 415) are not verb forms
        flat = form.command.replace("\\\n", " ")
        method = re.search(r"-X\s+(\w+)", flat)
        url = re.search(r"\"<site>/rest/api/2(/[^\"]*)\"", flat)
        if url:
            forms.add((method.group(1) if method else "GET", norm(url.group(1))))
    return forms, set(TABLE_TOOL.findall(text))


def strings(value, where: str = ""):
    """Every string value of the TOML with its dotted key."""
    if isinstance(value, dict):
        for key, item in value.items():
            yield from strings(item, f"{where}.{key}" if where else key)
    elif isinstance(value, str):
        yield where, value


def tickets_vocabulary(tree: Path | None) -> tuple[tuple[str, ...], tuple[str, ...], str]:
    """STATES and the leaf and container types of the pinned tickets.py (read, not imported); the F29 sets without a tree."""
    if tree is None:
        return tuple(F29_STATUS), tuple(F29_TYPES), "F29 (no --tree)"
    path = tree / "skills" / "bmad-agent-po" / "scripts" / "tickets.py"
    values: dict[str, tuple[str, ...]] = {}
    for node in ast.parse(path.read_text(encoding="utf-8")).body:
        if isinstance(node, ast.Assign) and len(node.targets) == 1 and isinstance(node.targets[0], ast.Name):
            if node.targets[0].id in ("STATES", "LEAF_TYPES", "CONTAINER_TYPES"):
                values[node.targets[0].id] = tuple(ast.literal_eval(node.value))
    missing = {"STATES", "LEAF_TYPES", "CONTAINER_TYPES"} - set(values)
    if missing:
        raise ValueError(f"{path}: no {sorted(missing)}")
    return values["STATES"], values["CONTAINER_TYPES"] + values["LEAF_TYPES"], f"tickets.py at {tree.name}"


def check_starter(text: str, reference: Path, tree: Path | None, log) -> list[str]:
    """The static checks; one finding per failure."""
    try:
        data = tomllib.loads(text)
    except tomllib.TOMLDecodeError as error:
        return [f"parse: {error}"]
    findings: list[str] = []
    tickets = data.get("tickets") if isinstance(data.get("tickets"), dict) else {}
    verbs = data.get("verbs") if isinstance(data.get("verbs"), dict) else {}

    # keys
    expected_tickets = F29_TICKETS | UPSTREAM_TICKETS
    for label, have, want in (("top level", set(data), TOP), ("[tickets]", set(tickets), expected_tickets), ("[verbs]", set(verbs), VERBS)):
        if have != want:
            findings.append(f"keys: {label} has {sorted(have)}, expected {sorted(want)}"
                            + (f" (missing {sorted(want - have)})" if want - have else "")
                            + (f" (extra {sorted(have - want)})" if have - want else ""))
    if tickets.get("store") != "jira-onprem":
        findings.append(f"keys: [tickets] store is {tickets.get('store')!r}, expected 'jira-onprem'")
    for key, answer in ANSWERS.items():
        if key in tickets and tickets[key] != "":
            findings.append(f"keys: [tickets] {key} is {tickets[key]!r}; the starter leaves it empty for bind to fill from {answer}")
    for key in ("access", "fields", "reference"):
        if key in tickets and not (isinstance(tickets[key], str) and tickets[key].strip()):
            findings.append(f"keys: [tickets] {key} is empty")
    if not (isinstance(data.get("description"), str) and data["description"].strip()):
        findings.append("keys: description is empty")
    log(f"  keys: top {sorted(data)}; [tickets] {sorted(tickets)}; [verbs] {sorted(verbs)}")

    # maps
    states, types, source = tickets_vocabulary(tree)
    type_map = tickets.get("types") if isinstance(tickets.get("types"), dict) else {}
    status_map = tickets.get("status") if isinstance(tickets.get("status"), dict) else {}
    for state in states:
        if state not in status_map:
            findings.append(f"maps: BMad state {state!r} ({source}) has no Jira status in [tickets.status]")
        elif not (isinstance(status_map[state], str) and status_map[state]):
            findings.append(f"maps: [tickets.status] {state} is empty")
    for kind in types:
        if kind not in type_map:
            findings.append(f"maps: BMad type {kind!r} ({source}) has no Jira work type in [tickets.types]")
    for label, have, want in (("[tickets.types]", type_map, F29_TYPES), ("[tickets.status]", status_map, F29_STATUS)):
        for key, value in want.items():
            if key in have and have[key] != value:
                findings.append(f"maps: {label} {key} = {have[key]!r}, F29 says {value!r}")
        for key in set(have) - set(want):
            findings.append(f"maps: {label} {key} is not a BMad {'type' if 'types' in label else 'state'} of F29")
    for verb in ("write", "query"):
        if "Won't Do" not in str(verbs.get(verb, "")):
            findings.append(f"maps: verbs.{verb} does not name the resolution Won't Do that tells dropped from done")
    log(f"  maps: {len(states)} state(s) and {len(types)} type(s) of {source}")

    # identity clause
    access = str(tickets.get("access", ""))
    for needle in ("assignee = currentUser()", "<site>/rest/api/2/myself", "jira_get_user_profile", "shared or service account", "stop"):
        if needle not in access:
            findings.append(f"identity: [tickets] access lacks {needle!r}")

    # REST and MCP forms
    allowed, tools = reference_forms(reference)
    if not allowed or not tools:
        findings.append(f"reference: {reference.name} yields no success form or no MCP tool table")
    calls = 0
    for where, value in strings(data):
        for match in ANY_API.finditer(value):
            if match.group(1) != "2":
                findings.append(f"rest: {where}: `/rest/api/{match.group(1)}/` is not the Data Center API (only /rest/api/2/)")
        bare = len(PATHED.findall(value)) - len(CALL.findall(value))
        if bare:
            findings.append(f"rest: {where}: {bare} `/rest/api/` path(s) not written as `METHOD <site>/rest/api/2/...`")
        for method, version, path in CALL.findall(value):
            calls += 1
            if version == "2" and (method, norm(path)) not in allowed:
                findings.append(f"rest: {where}: {method} <site>/rest/api/2{path} is not a form of {reference.name}")
        for tool in TOOL.findall(value):
            if tool not in tools:
                findings.append(f"mcp: {where}: {tool} is not in the MCP tool table of {reference.name}")
    for verb, (rest_needed, tools_needed) in NEEDS.items():
        text_v = str(verbs.get(verb, ""))
        if not text_v.strip():
            findings.append(f"verbs: {verb} is missing or empty")
            continue
        have = {(m, norm(p)) for m, v, p in CALL.findall(text_v) if v == "2"}
        for method, path in sorted(rest_needed - have):
            findings.append(f"verbs: {verb} lacks the REST form {method} <site>/rest/api/2{path}")
        for tool in sorted(tools_needed - set(TOOL.findall(text_v))):
            findings.append(f"verbs: {verb} lacks the MCP form {tool}")
        if "REST" not in text_v or "MCP" not in text_v:
            findings.append(f"verbs: {verb} does not label its REST and MCP forms")
    log(f"  forms: {calls} REST call(s) in the starter, each one of {len(allowed)} success form(s) of {reference.name}; "
        f"MCP tools named against its table of {len(tools)}")
    return findings


def scratch_project(tree: Path, starter_text: str, mcp_server: str = "") -> Path:
    """A project with the pinned bmad-agent-po installed and the starter written as bind writes it."""
    root = Path(tempfile.mkdtemp(prefix="jira-starter-"))
    (root / "_bmad" / "custom").mkdir(parents=True)
    (root / "_bmad" / "scripts").mkdir()
    (root / "_bmad-output" / "backlog").mkdir(parents=True)
    shutil.copytree(tree / "skills" / "bmad-agent-po", root / ".claude" / "skills" / "bmad-agent-po")
    shutil.copy(tree / "skills" / "bmad" / "scripts" / "config_utils.py", root / "_bmad" / "scripts" / "config_utils.py")
    (root / "_bmad" / "config.toml").write_text('[core]\noutput_folder = "_bmad-output"\n', encoding="utf-8")
    answers = {"site": "https://jira.example.invalid", "key": "MOCK", "mcp_server": mcp_server}
    for key, value in answers.items():
        starter_text = re.sub(rf'^{key} = ""', f'{key} = "{value}"', starter_text, count=1, flags=re.M)
    (root / "_bmad" / "custom" / "ticketing-store-config.toml").write_text(starter_text, encoding="utf-8")
    return root


def run(argv: list[str], cwd: Path) -> subprocess.CompletedProcess:
    env = {**os.environ, "DISABLE_TELEMETRY": "1", "DO_NOT_TRACK": "1"}
    return subprocess.run(argv, capture_output=True, text=True, encoding="utf-8", cwd=cwd, env=env, check=False)


def check_upstream(tree: Path, starter_text: str, uv: str, log) -> list[str]:
    findings: list[str] = []
    for mcp in ("", "jira-dc"):
        root = scratch_project(tree, starter_text, mcp)
        try:
            scripts = root / ".claude" / "skills" / "bmad-agent-po" / "scripts"
            rs = [uv, "run", "--no-cache", str(scripts / "read_store.py"), "--project-root", str(root)]
            r = run(rs + ["-k", "tickets.store"], root)
            if r.returncode != 0 or r.stdout.strip() != "jira-onprem":
                findings.append(f"read_store: -k tickets.store exit {r.returncode}, printed {r.stdout.strip()!r} {r.stderr.strip()[-200:]}")
            else:
                log(f"  [mcp_server = {mcp!r}] read_store.py -k tickets.store -> {r.stdout.strip()} (exit 0)")
            r = run(rs + ["-k", "tickets.mcp_server"], root)
            if r.returncode != 0 or r.stdout.strip() != mcp:
                findings.append(f"read_store: -k tickets.mcp_server exit {r.returncode}, printed {r.stdout.strip()!r}, expected {mcp!r}")
            else:
                log(f"  [mcp_server = {mcp!r}] read_store.py -k tickets.mcp_server -> {r.stdout.strip()!r} (exit 0)")
            if mcp:
                continue  # the MCP answer reads back; the rest is the same file
            for verb in sorted(VERBS):
                r = run(rs + ["-k", f"verbs.{verb}"], root)
                if r.returncode != 0 or not r.stdout.strip() or "/rest/api/2/" not in r.stdout:
                    findings.append(f"read_store: -k verbs.{verb} exit {r.returncode}, {len(r.stdout)} char(s), "
                                    f"names /rest/api/2/: {'/rest/api/2/' in r.stdout}; {r.stderr.strip()[-200:]}")
                else:
                    log(f"  read_store.py -k verbs.{verb} -> {len(r.stdout.splitlines())} line(s), names /rest/api/2/ (exit 0)")
            r = run(rs, root)
            project_file = tomllib.loads((root / "_bmad" / "custom" / "ticketing-store-config.toml").read_text(encoding="utf-8"))
            if r.returncode != 0 or json.loads(r.stdout or "null") != project_file:
                findings.append(f"read_store: the whole read (exit {r.returncode}) differs from the project file: an upstream starter merged in?")
            else:
                log("  read_store.py (whole config) == the project file: no upstream starter of this name merges in")
            r = run(rs[:4] + ["--starters"], root)
            starters = json.loads(r.stdout or "{}") if r.returncode == 0 else None
            if starters is None or "jira-onprem" in starters:
                findings.append(f"read_store: --starters exit {r.returncode}, lists {sorted(starters or {})}")
            else:
                log(f"  read_store.py --starters -> {sorted(starters)} (no jira-onprem: bind writes the whole file)")
            tp = [uv, "run", "--no-cache", str(scripts / "tickets.py"), "--project-root", str(root), "next", "backlog"]
            r = run(tp, root)
            if r.returncode != 2 or "--synced" not in r.stdout + r.stderr or "jira-onprem" not in r.stdout + r.stderr:
                findings.append(f"tickets.py next backlog: exit {r.returncode}, {(r.stdout + r.stderr).strip()[:200]!r}; expected 2 asking for --synced")
            else:
                log(f"  tickets.py next backlog -> exit 2 {(r.stdout + r.stderr).strip().splitlines()[-1]}")
            r = run(tp + ["--synced"], root)
            out = json.loads(r.stdout) if r.returncode == 0 and r.stdout.strip().startswith("{") else {}
            if r.returncode != 0 or out.get("store") != "jira-onprem":
                findings.append(f"tickets.py next backlog --synced: exit {r.returncode}, {(r.stdout + r.stderr).strip()[:200]!r}")
            else:
                log(f"  tickets.py next backlog --synced -> exit 0, store {out['store']}")
        finally:
            shutil.rmtree(root, ignore_errors=True)
    return findings


MUTANTS: list[tuple[str, str, str]] = [
    ("m1 state review unmapped", 'review = "In Review"', ""),
    ("m2 setup path /rest/api/3", "`GET <site>/rest/api/2/myself`: the token's user", "`GET <site>/rest/api/3/myself`: the token's user"),
    ("m3 verb query missing", '\nquery = """', '\nquery_removed = """'),
    ("m4 MCP tool not in the reference", "`jira_add_comment {", "`jira_comment_issue {"),
    ("m5 mcp_server key missing", '\nmcp_server = ""', '\nmcp_server_removed = ""'),
]


def run_mutants(text: str, reference: Path, tree: Path | None, uv: str | None, log) -> list[str]:
    findings: list[str] = []
    quiet = lambda _line: None  # noqa: E731
    for name, old, new in MUTANTS:
        if old not in text:
            findings.append(f"mutant {name}: {old[:50]!r} not found in {STARTER.name}")
            continue
        copy = text.replace(old, new, 1)
        red = check_starter(copy, reference, tree, quiet)
        extra = ""
        if name.startswith("m3") and tree is not None and uv:
            root = scratch_project(tree, copy)
            try:
                rs = root / ".claude" / "skills" / "bmad-agent-po" / "scripts" / "read_store.py"
                r = run([uv, "run", "--no-cache", str(rs), "--project-root", str(root), "-k", "verbs.query"], root)
                if r.returncode == 2 and "missing: verbs.query" in r.stderr:
                    extra = "; read_store.py -k verbs.query exit 2 `missing: verbs.query`"
                else:
                    red.append("")  # keeps it red, but the read_store half failed
                    findings.append(f"mutant {name}: read_store.py -k verbs.query exit {r.returncode}, expected 2 `missing: verbs.query`")
            finally:
                shutil.rmtree(root, ignore_errors=True)
        log(f"  {'ok  ' if red else 'FAIL'} mutant {name}: {(red[0][:150] if red else 'stayed green')}{extra}")
        if not red:
            findings.append(f"mutant {name} stayed green")
    return findings


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--starter", type=Path, default=STARTER)
    parser.add_argument("--reference", type=Path, default=REFERENCE)
    parser.add_argument("--tree", type=Path, default=os.environ.get("BMAD_TREE"), help="BMAD-METHOD checkout at the pinned commit")
    parser.add_argument("--mutants", action="store_true", help="also run the mutants of the starter")
    args = parser.parse_args(argv)
    if not args.starter.is_file() or not args.reference.is_file():
        print(f"prerequisite missing: {args.starter} or {args.reference}", file=sys.stderr)
        return 2
    tree = args.tree.resolve() if args.tree else None
    if tree is not None and not (tree / "skills" / "bmad-agent-po" / "scripts" / "read_store.py").is_file():
        print(f"prerequisite missing: {tree} holds no skills/bmad-agent-po (not a BMAD v7 tree)", file=sys.stderr)
        return 2
    uv = shutil.which("uv")
    if tree is not None and not uv:
        print("uv not on PATH", file=sys.stderr)
        return 2
    text = args.starter.read_text(encoding="utf-8")
    log = print
    print(f"{args.starter.name}")
    findings = check_starter(text, args.reference, tree, log)
    if tree is not None:
        findings += check_upstream(tree, text, uv, log)
    else:
        print("  - read_store.py / tickets.py checks skipped: no --tree / BMAD_TREE")
    if args.mutants:
        findings += run_mutants(text, args.reference, tree, uv, log)
    if findings:
        print(f"jira-onprem starter failed ({len(findings)}):", file=sys.stderr)
        for finding in findings:
            print(f"  {finding}", file=sys.stderr)
        return 1
    print(f"OK: {args.starter.name} has F29's keys and maps, a REST and an MCP form per verb, every REST form one of "
          f"{args.reference.name}" + ("; read_store.py and tickets.py read it" if tree else "")
          + ("; every mutant red" if args.mutants else ""))
    return 0


if __name__ == "__main__":
    if sys.platform == "win32":
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    sys.exit(main())
