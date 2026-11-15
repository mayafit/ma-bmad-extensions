#!/usr/bin/env python3
# /// script
# requires-python = ">=3.11"
# ///
"""Every REST form of `skills/ma-atlassian-bind/references/jira-onprem-verbs.md` runs against the Jira Data
Center mock (Story 38.1; FR289).

The reference file carries each REST form as a `curl` command in a fenced `bash` block whose first line is
`# expect: HTTP <code>[; body keys: a, b][; body: array|empty]`. This test starts `tools/jira_dc_mock.py`
on a free port, fills the placeholders (`<site>`, `<PAT>`, `<KEY>`, `<ISSUE>`, `<EPIC>`, `<BLOCKER>`,
`<TRANSITION>`, `<USER>`) with the mock's values, runs every block with the host's `curl` in file order and
asserts the status line (`curl -i`: the first line printed) and the body shape. A block that prints another status, lacks a key, or
whose `curl` exits non-zero fails, naming the block.

`--mutants` copies the reference file and applies one mutation per copy -- a wrong API version in the
`setup` form, a wrong method on assign, a wrong body key on transition, a create form without
`Content-Type` -- and requires each copy to fail; the untouched file must pass.

Usage: uv run --no-cache tools/test_jira_verbs.py [--reference FILE] [--mutants] [--keep]
Exit: 0 every form (and every mutant) as expected, 1 otherwise, 2 when curl is missing.
"""

from __future__ import annotations

import argparse
import json
import re
import shlex
import shutil
import subprocess
import sys
import tempfile
import threading
from dataclasses import dataclass
from pathlib import Path

sys.dont_write_bytecode = True
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
import jira_dc_mock  # noqa: E402

REFERENCE = HERE.parent / "skills" / "ma-atlassian-bind" / "references" / "jira-onprem-verbs.md"
FENCE = re.compile(r"^```bash\n(.*?)^```", re.M | re.S)
EXPECT = re.compile(r"^# expect:\s*HTTP (\d{3})(?:;\s*body keys:\s*([^;\n]+))?(?:;\s*body:\s*(array|empty))?\s*$", re.M)
TOKEN = "mock-pat"
PROJECT = "MOCK"
USER = "jdoe"


@dataclass
class Form:
    number: int
    line: int
    status: int
    keys: list[str]
    shape: str | None
    command: str

    def label(self) -> str:
        """`form N (line L): METHOD <path>` -- the method from `-X` (GET without one) and the quoted URL."""
        flat = self.command.replace("\\\n", " ")
        method = re.search(r"-X\s+(\w+)", flat)
        url = re.search(r"\"(<site>[^\"]*)\"", flat)
        return f"form {self.number} (line {self.line}): {method.group(1) if method else 'GET'} {url.group(1) if url else '?'}"


def parse(text: str) -> list[Form]:
    forms: list[Form] = []
    for match in FENCE.finditer(text):
        block = match.group(1)
        expect = EXPECT.search(block)
        if expect is None:
            continue  # a bash block that is not a REST form (the mock-run commands)
        command = "\n".join(line for line in block.splitlines() if not line.startswith("#")).strip()
        if not command.startswith("curl"):
            raise ValueError(f"line {text[:match.start()].count(chr(10)) + 1}: an `# expect:` block must hold a curl command")
        keys = [k.strip() for k in (expect.group(2) or "").split(",") if k.strip()]
        forms.append(Form(len(forms) + 1, text[:match.start()].count("\n") + 2, int(expect.group(1)), keys, expect.group(3), command))
    return forms


def fill(command: str, site: str) -> str:
    values = {
        "<site>": site, "<PAT>": TOKEN, "<KEY>": PROJECT, "<ISSUE>": f"{PROJECT}-1", "<EPIC>": f"{PROJECT}-2",
        "<BLOCKER>": f"{PROJECT}-2", "<TRANSITION>": "21", "<USER>": USER,
    }
    for placeholder, value in values.items():
        command = command.replace(placeholder, value)
    left = re.findall(r"<[A-Za-z][A-Za-z-]*>", command)
    if left:
        raise ValueError(f"unknown placeholder(s) {sorted(set(left))}")
    return command


def run_form(form: Form, site: str, curl: str) -> str | None:
    """None when the form prints what it expects, else the finding."""
    try:
        argv = shlex.split(fill(form.command.replace("\\\n", " "), site), posix=True)
    except ValueError as error:
        return f"{form.label()}: {error}"
    argv[0] = curl
    done = subprocess.run(argv, capture_output=True, text=True, encoding="utf-8", timeout=60)
    if done.returncode != 0:
        return f"{form.label()}: curl exited {done.returncode}: {done.stderr.strip()[:200]}"
    out = done.stdout
    m = re.match(r"HTTP/[\d.]+ (\d{3})", out)
    if m is None:
        return f"{form.label()}: no status line printed (`curl -i`), got {out[:60]!r}"
    if int(m.group(1)) != form.status:
        return f"{form.label()}: printed HTTP {m.group(1)}, expected HTTP {form.status}: {out.split(chr(10) * 2, 1)[-1].strip()[:200]}"
    parts = re.split(r"\r?\n\r?\n", out, maxsplit=1)  # headers, then the body after the first blank line
    body = parts[1].strip() if len(parts) == 2 else ""
    if form.shape == "empty":
        return None if not body else f"{form.label()}: expected an empty body, got {body[:100]!r}"
    try:
        data = json.loads(body) if body else None
    except ValueError:
        return f"{form.label()}: body is not JSON: {body[:100]!r}"
    if form.shape == "array":
        return None if isinstance(data, list) else f"{form.label()}: expected a JSON array"
    if form.keys:
        if not isinstance(data, dict):
            return f"{form.label()}: expected a JSON object with keys {form.keys}"
        missing = [k for k in form.keys if k not in data]
        if missing:
            return f"{form.label()}: body lacks {missing}: {body[:200]}"
    return None


def run_reference(path: Path, curl: str, log) -> list[str]:
    forms = parse(path.read_text(encoding="utf-8"))
    if not forms:
        return [f"{path}: no REST form found"]
    server = jira_dc_mock.serve(0, TOKEN, None, PROJECT, USER, "9.17.0", quiet=True)
    site = f"http://127.0.0.1:{server.server_address[1]}"
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    findings: list[str] = []
    try:
        for form in forms:
            finding = run_form(form, site, curl)
            log(f"  {'FAIL' if finding else 'ok  '} {form.label()} -> HTTP {form.status}")
            if finding:
                findings.append(finding)
    finally:
        server.shutdown()
        server.server_close()
    log(f"  {len(forms)} REST form(s) against the Jira Data Center mock at {site}")
    return findings


MUTANTS: list[tuple[str, str, str]] = [
    ("v1 setup path /rest/api/3", '"<site>/rest/api/2/myself"', '"<site>/rest/api/3/myself"'),
    ("v2 assign with POST", '-X PUT --data \'{"name": "<USER>"}\'', '-X POST --data \'{"name": "<USER>"}\''),
    ("v3 transition body key", '{"transition": {"id": "<TRANSITION>"}}', '{"transitionId": "<TRANSITION>"}'),
    ("v4 create without Content-Type", '-H "Content-Type: application/json" \\\n  -X POST --data \'{"fields": {"project": {"key": "<KEY>"}, "issuetype": {"name": "Story"}, "summary"',
     '\\\n  -X POST --data \'{"fields": {"project": {"key": "<KEY>"}, "issuetype": {"name": "Story"}, "summary"'),
]


def run_mutants(path: Path, curl: str, log, keep: bool) -> list[str]:
    text = path.read_text(encoding="utf-8")
    scratch = Path(tempfile.mkdtemp(prefix="jira-verbs-"))
    findings: list[str] = []
    try:
        for name, old, new in MUTANTS:
            if old not in text:
                findings.append(f"mutant {name}: {old[:50]!r} not found in {path.name}")
                continue
            copy = scratch / f"{name.split()[0]}.md"
            copy.write_text(text.replace(old, new, 1), encoding="utf-8")
            quiet = lambda _line: None  # noqa: E731
            red = run_reference(copy, curl, quiet)
            log(f"  {'ok  ' if red else 'FAIL'} mutant {name}: {red[0][:160] if red else 'stayed green'}")
            if not red:
                findings.append(f"mutant {name} stayed green")
    finally:
        if not keep:
            shutil.rmtree(scratch, ignore_errors=True)
    return findings


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--reference", type=Path, default=REFERENCE)
    parser.add_argument("--mutants", action="store_true", help="also run the mutants of the reference file")
    parser.add_argument("--keep", action="store_true", help="keep the mutant copies")
    args = parser.parse_args(argv)
    curl = shutil.which("curl")
    if not curl:
        print("curl not found on PATH", file=sys.stderr)
        return 2
    log = print
    findings = run_reference(args.reference.resolve(), curl, log)
    if args.mutants:
        findings += run_mutants(args.reference.resolve(), curl, log, args.keep)
    if findings:
        print(f"jira verb forms failed ({len(findings)}):", file=sys.stderr)
        for finding in findings:
            print(f"  {finding}", file=sys.stderr)
        return 1
    print(f"OK: every REST form of {args.reference.name} prints its expected status and body shape against the mock"
          + ("; every mutant red" if args.mutants else ""))
    return 0


if __name__ == "__main__":
    sys.exit(main())
