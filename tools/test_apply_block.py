#!/usr/bin/env python3
# /// script
# requires-python = ">=3.11"
# ///
"""Tests of `skills/ma-standards-apply/scripts/apply_block.py` (Story 37.2; FR301).

The instruction-file coexistence cases of ma-agents Story 36.5 (`test/fixtures/instruction-file-coexistence/
case-table.json`, copied verbatim to `tools/fixtures/coexistence-case-table.json`) run against the real
block writer: the `ma-standards` block through `apply()` / `remove()`, the installer's `ma-agents` block
through the same splice with its own marker pair, and upstream's `bmad:context` block through a simulated
splice whose markers and block template are READ AT RUN TIME from the pinned tree
(`<tree>/skills/bmad-project-context/references/template.md`); no upstream marker or template text is typed
here (self-checked). The 36.5 reference model is ported below and must reproduce the committed table; with
the 36.5 carried-forward rule (a `CLAUDE.md` that is only an `@AGENTS.md` import gets no block) it gives the
AC10 expectations.

Also covered: the writer contract (exact-line markers, every byte outside the block preserved, append never
rewrites, unchanged writes nothing, ambiguous markers refused), CRLF and mixed line endings, removal
restoring the file, the CLAUDE.md import rule, the default target set, `.roomodes` as JSON, the block body
derived from the installed record, and the command line through `uv run --no-cache`.

Usage: uv run --no-cache tools/test_apply_block.py --tree BMAD_TREE   (or BMAD_V7_TREE in the environment)
Exit: 0 every test passed, 1 a test failed, 2 a prerequisite is missing.
"""

from __future__ import annotations

import argparse
import hashlib
import importlib.util
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
import traceback
from itertools import permutations
from pathlib import Path

HERE = Path(__file__).resolve().parent
REPO = HERE.parent
SCRIPT = REPO / "skills" / "ma-standards-apply" / "scripts" / "apply_block.py"
CASE_TABLE = HERE / "fixtures" / "coexistence-case-table.json"
UPSTREAM_REL = Path("skills") / "bmad-project-context" / "references" / "template.md"
MA_AGENTS = ("<!-- ma-agents:start -->", "<!-- ma-agents:end -->")
IMPORT_LINE = "@AGENTS.md"

passed = 0
failed = 0
tmp_roots: list[Path] = []


def load_script():
    spec = importlib.util.spec_from_file_location("apply_block", SCRIPT)
    module = importlib.util.module_from_spec(spec)
    assert spec.loader is not None
    spec.loader.exec_module(module)
    return module


ab = load_script()
MA_STANDARDS = ab.MA_STANDARDS_MARKERS


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
    d = Path(tempfile.mkdtemp(prefix="ma-standards-apply-"))
    tmp_roots.append(d)
    return d


def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def u8(s: str) -> bytes:
    return s.encode("utf-8")


# ----------------------------------------------------------------------------- upstream, read at run time


def load_upstream(file: Path) -> dict:
    if not file.is_file():
        raise FileNotFoundError(f"pinned upstream template not found: {file} (no fallback)")
    lines = file.read_text(encoding="utf-8").split("\n")
    lines = [l[:-1] if l.endswith("\r") else l for l in lines]
    open_ = next((i for i, l in enumerate(lines) if re.match(r"^(`{3,}|~{3,})\S*\s*$", l) and re.search(r"\S", re.sub(r"^[`~]+", "", l))), -1)
    assert open_ >= 0, f"{file}: no fenced worked example"
    fence = re.match(r"^([`~]+)", lines[open_]).group(1)
    close = next((i for i, l in enumerate(lines) if i > open_ and l == fence), -1)
    assert close > open_, f"{file}: fenced example not closed"
    s = open_ + 1
    while s < close and lines[s].strip() == "":
        s += 1
    e = close - 1
    while e > s and lines[e].strip() == "":
        e -= 1
    start, end = lines[s], lines[e]
    for m in (start, end):
        assert m and re.match(r"^<!--.*-->$", m), f"{file}: marker is not one HTML comment line: {m}"
    assert start != end
    body = lines[s + 1:e]
    assert body, f"{file}: empty block template"
    assert re.match(r"^<!--.*-->$", body[0]) and re.search(r"\d{4}-\d{2}-\d{2}", body[0]) and re.search(r"\b[0-9a-f]{7,40}\b", body[0])
    assert all(l != start and l != end for l in body)
    normalized = "\n".join(lines).encode("utf-8")
    blob = hashlib.sha1(b"blob %d\0" % len(normalized) + normalized).hexdigest()
    return {"file": file, "markers": (start, end), "start_line": s + 1, "end_line": e + 1, "fence_line": open_ + 1, "body": body, "blob": blob}


def upstream_body(rev: int) -> str:
    p = TABLE["upstreamProvenance"][rev]
    prov = re.sub(r"\d{4}-\d{2}-\d{2}", p["date"], UP["body"][0], count=1)
    prov = re.sub(r"\b[0-9a-f]{7,40}\b", p["commit"], prov, count=1)
    assert p["date"] in prov and p["commit"] in prov
    return "\n".join([prov, *UP["body"][1:]])


OWNERS = ("ma-agents", "ma-standards", "upstream")


def markers_of(owner: str) -> tuple[str, str]:
    return {"ma-agents": MA_AGENTS, "ma-standards": MA_STANDARDS, "upstream": UP["markers"]}[owner]


def body_of(owner: str, rev: int) -> str:
    if owner == "upstream":
        return upstream_body(rev)
    return TABLE["bodies"][owner][rev]


def render_block_text(owner: str, rev: int, eol: str) -> str:
    start, end = markers_of(owner)
    return eol.join([start, *body_of(owner, rev).split("\n"), end])


# ----------------------------------------------------------------------------- reference model (36.5 port)


def merge_texts(segs: list[dict]) -> list[dict]:
    out: list[dict] = []
    for s in segs:
        if "text" in s and s["text"] == "":
            continue
        if "text" in s and out and "text" in out[-1]:
            out[-1]["text"] += s["text"]
        else:
            out.append(dict(s))
    return out


def model_apply(state, step: dict, import_rule: bool, flags: dict):
    if state is None and step["op"] == "remove":
        return None
    segs = None if state is None else [dict(s) for s in state]
    op = step["op"]
    if op == "write":
        if segs is None:
            return [{"block": step["owner"], "rev": step["rev"]}, {"text": "\n"}]
        if import_rule and step["owner"] == "ma-standards" and segs == [{"text": IMPORT_LINE + "\n"}]:
            flags["redirected"] = True
            return segs
        i = next((k for k, s in enumerate(segs) if s.get("block") == step["owner"]), -1)
        if i >= 0:
            segs[i]["rev"] = step["rev"]
            return segs
        is_empty = len(segs) == 0 or (len(segs) == 1 and segs[0].get("text") == "")
        if is_empty:
            return [{"block": step["owner"], "rev": step["rev"]}, {"text": "\n"}]
        last = segs[-1]
        assert "text" in last and last["text"].endswith("\n"), "model: fixture must end with a newline"
        segs += [{"text": "\n"}, {"block": step["owner"], "rev": step["rev"]}, {"text": "\n"}]
        return merge_texts(segs)
    if op == "remove":
        i = next((k for k, s in enumerate(segs) if s.get("block") == step["owner"]), -1)
        if i < 0:
            return segs
        before = segs[i - 1]["text"] if i > 0 and "text" in segs[i - 1] else None
        after = segs[i + 1]["text"] if i + 1 < len(segs) and "text" in segs[i + 1] else None
        assert after is not None and after.startswith("\n"), "model: block must end with a line ending"
        a = after[1:]
        b = "" if before is None else before
        prev_blank = b == "\n" or b.endswith("\n\n")
        next_blank_or_absent = (a == "" and not segs[i + 2:]) or a.startswith("\n")
        if prev_blank and next_blank_or_absent:
            b = b[:-1]
        out = merge_texts([*segs[: i if before is None else i - 1], {"text": b}, {"text": a}, *segs[i + 2:]])
        only_ws = all("text" in s and s["text"].strip() == "" for s in out)
        return None if only_ws else out
    if op == "reduce":
        return [{"text": IMPORT_LINE + "\n"}]
    if op == "edit":
        i = next((k for k, s in enumerate(segs) if s.get("block") == step["after"]), -1)
        assert i >= 0 and i + 1 < len(segs) and segs[i + 1]["text"].startswith("\n"), "model: edit target"
        segs[i + 1]["text"] = "\n" + step["text"] + segs[i + 1]["text"][1:]
        return segs
    raise AssertionError(f"model: unknown op {op}")


def model_expected(case: dict, import_rule: bool) -> tuple[dict | list | None, dict]:
    state = None if case["initial"] is None else [dict(s) for s in case["initial"]]
    flags: dict = {}
    for step in case["steps"]:
        state = model_apply(state, step, import_rule, flags)
    return ({"deleted": True} if state is None else state), flags


# ----------------------------------------------------------------------------- real writers on disk


def detect_eol(text: str, start_marker: str) -> str:
    lines = re.findall(r"[^\n]*\n|[^\n]+$", text)
    s = next((l for l in lines if re.sub(r"\r?\n$", "", l) == start_marker), None)
    if s is not None:
        return "\r\n" if s.endswith("\r\n") else "\n"
    first = next((l for l in lines if l.endswith("\n")), None)
    return "\r\n" if first and first.endswith("\r\n") else "\n"


def simulate_upstream_splice(file: Path, body: str) -> None:
    """Model of the upstream agent's splice: replaces only the lines between its two markers, or appends
    the marked block, and touches nothing outside them. Independent of apply_block.py."""
    start, end = UP["markers"]
    old = file.read_bytes().decode("latin-1") if file.exists() else None
    body_l = body.encode("utf-8").decode("latin-1")
    if old is None:
        file.write_bytes(("\n".join([start, *body_l.split("\n"), end]) + "\n").encode("latin-1"))
        return
    eol = detect_eol(old, start)
    block = eol.join([start, *body_l.split("\n"), end])
    lines = re.findall(r"[^\n]*\n|[^\n]+$", old)
    strip = lambda l: re.sub(r"\r?\n$", "", l)  # noqa: E731
    s = next((i for i, l in enumerate(lines) if strip(l) == start), -1)
    e = next((i for i, l in enumerate(lines) if strip(l) == end), -1)
    if s >= 0 and e > s:
        term = lines[e][len(strip(lines[e])):]
        out = "".join(lines[:s]) + block + term + "".join(lines[e + 1:])
    elif s < 0 and e < 0:
        out = old + ("" if old == "" else ("" if old.endswith("\n") else eol) + eol) + block + eol
    else:
        raise AssertionError("simulated upstream splice: unbalanced markers")
    if out != old:
        file.write_bytes(out.encode("latin-1"))


def simulate_reduction(file: Path) -> None:
    old = file.read_bytes().decode("latin-1") if file.exists() else ""
    eol = detect_eol(old, "\0")
    file.write_bytes((IMPORT_LINE + eol).encode("latin-1"))


def render(segs: list[dict], eol: str) -> str:
    E = "\r\n" if eol == "crlf" else "\n"
    out = ""
    for s in segs:
        out += s["text"].replace("\n", E) if "text" in s else render_block_text(s["block"], s["rev"], E)
    return out


def run_step(root: Path, file: str, eol: str, step: dict):
    p = root / file
    op = step["op"]
    if op == "write":
        if step["owner"] == "ma-agents":
            return ab.splice_file(p, MA_AGENTS, body_of("ma-agents", step["rev"]))
        if step["owner"] == "ma-standards":
            return ab.apply(root, body_of("ma-standards", step["rev"]), files=[file])[file]
        return simulate_upstream_splice(p, upstream_body(step["rev"]))
    if op == "remove":
        if step["owner"] == "ma-agents":
            return ab.remove_file(p, MA_AGENTS)
        if step["owner"] == "ma-standards":
            return ab.remove(root, files=[file])[file]
        raise AssertionError("upstream removal is not modelled")
    if op == "reduce":
        return simulate_reduction(p)
    if op == "edit":
        E = "\r\n" if eol == "crlf" else "\n"
        text = p.read_bytes().decode("latin-1")
        end_marker = markers_of(step["after"])[1]
        idx = text.find(end_marker + E)
        assert idx >= 0, f"edit: end marker of {step['after']} not found"
        at = idx + len(end_marker) + len(E)
        ins = step["text"].replace("\n", E).encode("utf-8").decode("latin-1")
        p.write_bytes((text[:at] + ins + text[at:]).encode("latin-1"))
        return "edited"
    raise AssertionError(f"unknown op {op}")


def count_line(text: str, line: str) -> int:
    return sum(1 for l in re.split(r"\r?\n", text) if l == line)


def run_case(case: dict) -> tuple[Path, Path, bytes | None]:
    root = mktemp()
    p = root / case["file"]
    if case["initial"] is not None:
        p.write_bytes(u8(render(case["initial"], case["eol"])))
    for step in case["steps"]:
        run_step(root, case["file"], case["eol"], step)
    return root, p, (p.read_bytes() if p.exists() else None)


def assert_expected(case: dict, expected, got: bytes | None) -> None:
    if isinstance(expected, dict) and expected.get("deleted"):
        assert got is None, f"{case['id']}: file should be deleted"
        return
    assert got is not None, f"{case['id']}: file missing"
    want = u8(render(expected, case["eol"]))
    assert got == want, f"{case['id']}: bytes differ\n--- want\n{want.decode('utf-8')}\n--- got\n{got.decode('utf-8')}"


# ----------------------------------------------------------------------------- tests


def main(argv: list[str] | None = None) -> int:
    global TABLE, UP
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--tree", type=Path, default=os.environ.get("BMAD_V7_TREE"), help="BMAD-METHOD checkout at the pinned commit")
    parser.add_argument("--skip-cli", action="store_true", help="skip the uv run --no-cache command-line test")
    args = parser.parse_args(argv)
    if args.tree is None:
        print("prerequisite: --tree or BMAD_V7_TREE is required", file=sys.stderr)
        return 2
    template = Path(args.tree).resolve() / UPSTREAM_REL
    try:
        UP = load_upstream(template)
    except (FileNotFoundError, AssertionError) as error:
        print(f"FATAL: {error}", file=sys.stderr)
        return 2
    TABLE = json.loads(CASE_TABLE.read_text(encoding="utf-8"))
    CASES = TABLE["cases"]
    by_id = {c["id"]: c for c in CASES}
    print(f"\n ma-standards-apply block writer (Story 37.2, FR301; 36.5 cases)\n")
    print(f"  upstream template: {UP['file']}")
    print(f"  upstream markers at lines {UP['start_line']} / {UP['end_line']} (fence opens at {UP['fence_line']}); blob {UP['blob']}\n")

    def t_table():
        assert TABLE["story"] == "36.5" and len(CASES) == 32, "case table is not the 36.5 table of 32 cases"
        assert TABLE["markers"]["ma-standards"] == {"start": MA_STANDARDS[0], "end": MA_STANDARDS[1]}
        assert TABLE["markers"]["ma-agents"] == {"start": MA_AGENTS[0], "end": MA_AGENTS[1]}
        for c in CASES:
            expected, _ = model_expected(c, import_rule=False)
            assert expected == c["expected"], f"model port differs from the committed table at {c['id']}"
    test("case table: 32 cases of 36.5, markers as recorded, model port reproduces every expected value", t_table)

    def t_no_upstream_text():
        needles = [*UP["markers"], *[l for l in UP["body"] if len(l.strip()) > 12]]
        for f in (Path(__file__), SCRIPT, CASE_TABLE):
            src = f.read_text(encoding="utf-8")
            for n in needles:
                assert n not in src, f"{f.name} contains upstream text: {n}"
    test("no upstream marker or template text is typed into the test, the writer or the case table", t_no_upstream_text)

    # AC1 writer contract -----------------------------------------------------------------
    def t_exact():
        M = MA_AGENTS
        for t in [f"  {M[0]}\nx\n  {M[1]}\n", f"{M[0]} \nx\n{M[1]} \n", f"see `{M[0]}` and `{M[1]}`\n",
                  "<!-- ma-agents:start-x -->\nx\n<!-- ma-agents:end-x -->\n", "<!-- MA-AGENTS-START -->\nx\n<!-- MA-AGENTS-END -->\n"]:
            assert ab.locate(ab.split_lines(t), M) is None, repr(t)
        assert ab.locate(ab.split_lines(f"a\n{M[0]}\nx\n{M[1]}\n"), M) == (1, 3)
    test("AC1 exact line equality: indented, trailing-space, inline and prefix-extended markers do not match", t_exact)

    def t_bytes():
        root = mktemp()
        p = root / "AGENTS.md"
        M = MA_AGENTS
        pre = bytes([0xEF, 0xBB, 0xBF]) + u8("# T\r\nlf line\n") + bytes([0xFF, 0xFE, 0x0A])
        post = u8("\r\ntail\r\nno-final-newline") + bytes([0x80])
        p.write_bytes(pre + u8(f"{M[0]}\r\nold\r\n{M[1]}") + post)
        assert ab.splice_file(p, M, "new é\nline 2") == "replaced"
        got = p.read_bytes()
        assert got[: len(pre)] == pre, "prefix bytes changed"
        assert got[-len(post):] == post, "suffix bytes changed"
        assert got[len(pre): len(got) - len(post)] == u8(f"{M[0]}\r\nnew é\r\nline 2\r\n{M[1]}")
    test("AC1 preserves every byte outside the block (BOM, mixed EOL, invalid UTF-8, no final newline)", t_bytes)

    def t_append():
        root = mktemp()
        p = root / "AGENTS.md"
        for orig in (u8("# A\r\n\r\nprose\r\n"), u8("no newline at end"), u8("x\n") + bytes([0xFF])):
            p.write_bytes(orig)
            assert ab.splice_file(p, MA_AGENTS, "b") == "appended"
            got = p.read_bytes()
            assert got[: len(orig)] == orig
            assert count_line(got.decode("latin-1"), MA_AGENTS[0]) == 1
    test("AC1 block absent: existing bytes are a prefix of the result (append, never a whole rewrite)", t_append)

    def t_unchanged():
        root = mktemp()
        p = root / "AGENTS.md"
        p.write_bytes(b"prose\n")
        for M in (MA_AGENTS, MA_STANDARDS):
            ab.splice_file(p, M, "body")
        old = 978307200
        os.utime(p, (old, old))
        for M in (MA_AGENTS, MA_STANDARDS):
            assert ab.splice_file(p, M, "body") == "unchanged"
        assert int(p.stat().st_mtime) == old, "an unchanged re-run wrote the file"
    test("AC1 unchanged content writes nothing (mtime untouched); marker pair is a parameter", t_unchanged)

    def t_ambiguous():
        root = mktemp()
        p = root / "AGENTS.md"
        M = MA_AGENTS
        for t in (f"{M[0]}\n{M[1]}\n{M[0]}\n{M[1]}\n", f"{M[1]}\nx\n{M[0]}\n", f"{M[0]}\nx\n", f"x\n{M[1]}\n"):
            p.write_bytes(u8(t))
            for fn in (lambda: ab.splice_file(p, M, "b"), lambda: ab.remove_file(p, M)):
                try:
                    fn()
                    raise AssertionError("expected MarkerError")
                except ab.MarkerError:
                    pass
            assert p.read_bytes() == u8(t)
        p.write_bytes(b"x\n")
        try:
            ab.splice_file(p, M, f"a\n{M[1]}\nb")
            raise AssertionError("expected MarkerError")
        except ab.MarkerError:
            pass
        assert p.read_bytes() == b"x\n"
    test("AC1 ambiguous markers and marker lines in the body are refused; nothing written", t_ambiguous)

    # AC2 / AC3 / AC8 ----------------------------------------------------------------------
    for cid in ("ac2-order-a-lf", "ac3-order-b-lf", "ac2-order-a-crlf", "ac3-order-b-crlf"):
        def t_two(cid=cid):
            c = by_id[cid]
            root, p, got = run_case(c)
            assert_expected(c, c["expected"], got)
            E = "\r\n" if c["eol"] == "crlf" else "\n"
            text = got.decode("latin-1")
            first, second = c["steps"][0]["owner"], c["steps"][1]["owner"]
            first_block = render_block_text(first, 1, E).encode("utf-8").decode("latin-1")
            assert text.count(first_block) == 1, f"{first} block not byte-identical"
            assert count_line(text, markers_of(second)[0]) == 1, f"{second} block not present once"
            if c["initial"]:
                init = u8(render(c["initial"], c["eol"]))
                assert got[: len(init)] == init, "prose changed"
            if c["eol"] == "crlf":
                assert not re.search(r"[^\r]\n", text), "a line ending was converted to LF"
        test(f"{'AC2' if cid.startswith('ac2') else 'AC3'}{'/AC8' if cid.endswith('crlf') else ''} {cid}", t_two)

    # AC4 / AC5 / AC8 ----------------------------------------------------------------------
    PARA = [
        "User paragraph before the blocks: money is integer cents.\n",
        "User paragraph between the first and second block.\n",
        "User paragraph between the second and third block — keep me.\n",
        "User paragraph after the blocks.\n",
    ]
    for c in [x for x in CASES if x["id"].startswith("ac4-")]:
        def t_three(c=c):
            root, p, got = run_case(c)
            assert_expected(c, c["expected"], got)
            E = "\r\n" if c["eol"] == "crlf" else "\n"
            text = got.decode("utf-8")
            for o in OWNERS:
                assert count_line(text, markers_of(o)[0]) == 1, f"{o} start marker count"
                assert text.count(render_block_text(o, 3, E)) == 1, f"{o} not byte-identical to its last write"
            at = -1
            for s in [x.replace("\n", E) for x in PARA]:
                assert text.count(s) == 1, f"paragraph not present once: {s}"
                i = text.find(s)
                assert i > at, "paragraph out of place"
                at = i
            if c["eol"] == "crlf":
                assert not re.search(r"[^\r]\n", text), "a line ending was converted to LF"
            before = sha(p.read_bytes())
            old = 978307200
            os.utime(p, (old, old))
            assert run_step(root, c["file"], c["eol"], {"op": "write", "owner": "ma-agents", "rev": 3}) == "unchanged"
            assert run_step(root, c["file"], c["eol"], {"op": "write", "owner": "ma-standards", "rev": 3}) == "unchanged"
            assert int(p.stat().st_mtime) == old, "an unchanged re-run wrote the file"
            run_step(root, c["file"], c["eol"], {"op": "write", "owner": "upstream", "rev": 3})
            assert sha(p.read_bytes()) == before, "re-run changed bytes"
        test(f"{'AC4/AC8' if c['ac'] == 'AC8' else 'AC4'} {c['id']} (three passes) + AC5 idempotence", t_three)

    # AC6 ---------------------------------------------------------------------------------
    for c in [x for x in CASES if x["ac"] == "AC6"]:
        def t_remove(c=c):
            root, p, got = run_case(c)
            assert_expected(c, c["expected"], got)
            if got is not None:
                text = got.decode("utf-8")
                removed = {s["owner"] for s in c["steps"] if s["op"] == "remove"}
                for o in OWNERS:
                    if o in removed:
                        assert count_line(text, markers_of(o)[0]) == 0, f"{o} still present"
                if c["initial"] and len(c["initial"]) > 1:
                    E = "\r\n" if c["eol"] == "crlf" else "\n"
                    for s in PARA:
                        assert s.replace("\n", E) in text, "user prose lost"
                    assert render_block_text("upstream", 3, E) in text, "upstream block lost"
        test(f"AC6 {c['id']}", t_remove)

    def t_remove_idem():
        root = mktemp()
        p = root / "AGENTS.md"
        p.write_bytes(b"prose\n")
        ab.splice_file(p, MA_AGENTS, "b")
        assert ab.remove_file(p, MA_AGENTS) == "removed"
        assert p.read_bytes() == b"prose\n", "append-then-remove did not restore the file"
        assert ab.remove_file(p, MA_AGENTS) == "absent"
        assert ab.remove_file(root / "nope.md", MA_AGENTS) == "absent"
        p.write_bytes(u8(f" \n\t\n{MA_AGENTS[0]}\nx\n{MA_AGENTS[1]}\n\n"))
        assert ab.remove_file(p, MA_AGENTS) == "deleted"
        assert not p.exists()
    test("AC6 removal is idempotent; append-then-remove restores the file; whitespace-only remainder is deleted", t_remove_idem)

    # AC7 ---------------------------------------------------------------------------------
    def t_ac7():
        c = by_id["ac7-non-interference"]
        root, p, got = run_case(c)
        assert_expected(c, c["expected"], got)
        text = got.decode("utf-8")
        assert render_block_text("upstream", 1, "\n") in text
        assert render_block_text("ma-standards", 1, "\n") in text
        assert "<!-- MA-AGENTS-START -->\n3.x block body.\n<!-- MA-AGENTS-END -->" in text
        assert "<!-- ma-agents:start-x -->\nlook-alike body\n<!-- ma-agents:end-x -->" in text
    test("AC7 ac7-non-interference (table case): 3.x block, look-alikes, upstream and ma-standards blocks untouched", t_ac7)

    def t_matchers():
        blocks = {o: render_block_text(o, 1, "\n") for o in OWNERS}
        text = "p\n\n" + "\n\n".join(blocks[o] for o in OWNERS) + "\n"
        for M, own in ((MA_AGENTS, "ma-agents"), (MA_STANDARDS, "ma-standards"), (UP["markers"], "upstream")):
            lines = ab.split_lines(text)
            s, e = ab.locate(lines, M)
            found = ab.join_lines(lines[s:e]) + lines[e][0]
            assert found == blocks[own]
            for o in OWNERS:
                if o != own:
                    assert ab.locate(ab.split_lines(blocks[o] + "\n"), M) is None, f"{own} matcher matched {o}"
    test("AC7 each matcher sees only its own markers (upstream markers read at run time)", t_matchers)

    # AC8 mixed ---------------------------------------------------------------------------
    def t_mixed():
        for file_e, up_e in (("\n", "\r\n"), ("\r\n", "\n")):
            root = mktemp()
            p = root / "AGENTS.md"
            up = render_block_text("upstream", 1, up_e)
            content = f"# A{file_e}{file_e}prose{file_e}{file_e}{up}{file_e}{file_e}tail{file_e}"
            p.write_bytes(u8(content))
            for rev in (1, 2, 3):
                ab.splice_file(p, MA_AGENTS, body_of("ma-agents", rev))
                ab.apply(root, body_of("ma-standards", rev), files=["AGENTS.md"])
            got = p.read_bytes().decode("utf-8")
            assert got.startswith(content), "prose or upstream block bytes changed"
            assert file_e + render_block_text("ma-agents", 3, file_e) + file_e in got
            ab.remove_file(p, MA_AGENTS)
            ab.remove(root, files=["AGENTS.md"])
            assert p.read_bytes().decode("utf-8") == content, "removal did not restore the mixed-EOL file"
    test("AC8 mixed EOL: a CRLF upstream block in an LF file and an LF block in a CRLF file stay as written", t_mixed)

    # AC10: CLAUDE.md with the reduction, under the carried-forward import rule ----------------
    for c in [x for x in CASES if x["ac"] == "AC10"]:
        def t_claude(c=c):
            expected, flags = model_expected(c, import_rule=True)
            root, p, got = run_case(c)
            assert_expected(c, expected, got)
            text = got.decode("utf-8")
            assert count_line(text, IMPORT_LINE) == 1, "import line not present once"
            agents = root / "AGENTS.md"
            if flags.get("redirected"):
                assert agents.is_file(), "a skipped CLAUDE.md write must land in AGENTS.md"
                assert count_line(agents.read_text(encoding="utf-8"), MA_STANDARDS[0]) == 1
            else:
                assert not agents.exists(), "AGENTS.md written although no CLAUDE.md write was skipped"
            if c.get("order"):
                assert text.startswith(IMPORT_LINE + "\n"), "import line is not first"
                assert count_line(text, MA_AGENTS[0]) == 1
                assert "User paragraph in CLAUDE.md." not in text
        test(f"AC10 {c['id']} (import rule: a CLAUDE.md that is only @AGENTS.md gets no ma-standards block)", t_claude)

    def t_import_rule():
        root = mktemp()
        p = root / "CLAUDE.md"
        p.write_bytes(b"# CLAUDE.md\n\nprose\n")
        ab.splice_file(p, MA_AGENTS, body_of("ma-agents", 1))
        assert ab.apply(root, body_of("ma-standards", 1), files=["CLAUDE.md"])["CLAUDE.md"] == "appended"
        simulate_reduction(p)
        assert p.read_bytes() == b"@AGENTS.md\n"
        res = ab.apply(root, body_of("ma-standards", 1), files=["CLAUDE.md"])
        assert res["CLAUDE.md"].startswith("skipped (imports @AGENTS.md"), res
        assert res["AGENTS.md"] == "created"
        assert p.read_bytes() == b"@AGENTS.md\n", "CLAUDE.md changed"
        assert count_line((root / "AGENTS.md").read_text(encoding="utf-8"), MA_STANDARDS[0]) == 1
        for variant in (b"@AGENTS.md\r\n", b"\n@AGENTS.md\n\n@docs/rules.md\n", b"  @AGENTS.md  \n"):
            p.write_bytes(variant)
            assert ab.apply(root, "x", files=["CLAUDE.md"])["CLAUDE.md"].startswith("skipped"), variant
            assert p.read_bytes() == variant
        p.write_bytes(b"@AGENTS.md\nAlso: prefer small PRs.\n")
        assert ab.apply(root, "x", files=["CLAUDE.md"])["CLAUDE.md"] == "appended"
        assert ab.is_import_only("") is False and ab.is_import_only("\n") is False
    test("import rule: CLAUDE.md holding only @-imports is skipped and AGENTS.md written; prose beside the import is not", t_import_rule)

    # target set, .roomodes, block body, command line ----------------------------------------
    def t_targets():
        root = mktemp()
        res = ab.apply(root, "b")
        assert res == {"AGENTS.md": "created"}, res
        for f in (".clinerules", "CLAUDE.md"):
            (root / f).write_bytes(b"# x\n")
        (root / ".github").mkdir()
        (root / ".github" / "copilot-instructions.md").write_bytes(b"c\n")
        res = ab.apply(root, "b")
        assert res == {"AGENTS.md": "unchanged", "CLAUDE.md": "appended", ".clinerules": "appended",
                       ".github/copilot-instructions.md": "appended"}, res
        root2 = mktemp()
        res = ab.apply(root2, "b", all_files=True)
        assert res == {f: "created" for f in ab.MARKDOWN_FILES}, res
        assert ab.remove(root2) == {**{f: "deleted" for f in ab.MARKDOWN_FILES}, ".roomodes": "absent"}
        root3 = mktemp()
        (root3 / ".clinerules").mkdir()
        res = ab.apply(root3, "b")
        assert res[".clinerules"] == "skipped (is a folder)", res
        try:
            ab.apply(root3, "b", files=["README.md"])
            raise AssertionError("expected Prerequisite")
        except ab.Prerequisite:
            pass
    test("targets: AGENTS.md always; the others when present or with --all/--file; a .clinerules folder is skipped", t_targets)

    def t_roomodes():
        root = mktemp()
        res = ab.apply(root, "b")
        assert ".roomodes" not in res, "absent .roomodes must never be created"
        rm = root / ".roomodes"
        rm.write_bytes(b'{\r\n  "customModes": [\r\n    {"slug": "user", "name": "U", "roleDefinition": "r", "groups": ["read"]}\r\n  ]\r\n}\r\n')
        assert ab.apply(root, "line 1\nline 2")[".roomodes"] == "appended"
        data = json.loads(rm.read_text(encoding="utf-8"))
        assert [m["slug"] for m in data["customModes"]] == ["user", "ma-standards"]
        assert data["customModes"][1]["roleDefinition"] == "line 1\nline 2"
        assert b"\r\n" in rm.read_bytes(), "the file's CRLF line ending was not kept"
        assert ab.apply(root, "line 1\nline 2")[".roomodes"] == "unchanged"
        assert ab.apply(root, "other")[".roomodes"] == "replaced"
        assert ab.remove(root)[".roomodes"] == "removed"
        assert [m["slug"] for m in json.loads(rm.read_text(encoding="utf-8"))["customModes"]] == ["user"]
        assert ab.remove(root)[".roomodes"] == "absent"
        rm.write_bytes(b"customModes:\n  - slug: user\n")
        assert ab.apply(root, "b")[".roomodes"].startswith("skipped (not JSON"), "YAML .roomodes must be left alone"
        assert rm.read_bytes() == b"customModes:\n  - slug: user\n"
    test(".roomodes: JSON customModes entry set, replaced, removed; YAML left untouched; never created", t_roomodes)

    def t_body():
        body = ab.block_body(REPO / "skills")
        names = ab.installed_standards(REPO / "skills")
        assert "ma-standards-apply" in names and "git-workflow-skill" in names, names
        for name in names:
            assert f"- `{name}`:" in body, f"{name} missing from the block body"
        assert body.count("\n- `") == len(names), "one line per installed skill"
        assert MA_STANDARDS[0] not in body and MA_STANDARDS[1] not in body
        root = mktemp()
        (root / "bmod-ma-standards" / "help").mkdir(parents=True)
        (root / "bmod-ma-standards" / "help" / "help.md").write_text("- `code-review`: reviews.\n- `absent-skill`: not installed.\n", encoding="utf-8")
        (root / "code-review").mkdir()
        (root / "code-review" / "SKILL.md").write_text("---\nname: code-review\n---\n", encoding="utf-8")
        (root / "code-review" / "bmod.toml").write_text('[skill]\nbmod = "bmod-ma-standards"\n', encoding="utf-8")
        (root / "other").mkdir()
        (root / "other" / "SKILL.md").write_text("x", encoding="utf-8")
        (root / "other" / "bmod.toml").write_text('[skill]\nbmod = "bmod-method"\n', encoding="utf-8")
        body = ab.block_body(root)
        assert "- `code-review`: reviews." in body and "absent-skill" not in body and "other" not in body
    test("block body: one help.md line per ma-standards skill installed beside the record; no marker line inside", t_body)

    def t_cli():
        uv = shutil.which("uv")
        assert uv, "uv not on PATH"
        root = mktemp()
        (root / "AGENTS.md").write_bytes(b"# Project\r\n\r\nprose\r\n")
        (root / "CLAUDE.md").write_bytes(b"@AGENTS.md\n")
        env = {**os.environ, "PYTHONIOENCODING": "utf-8"}
        base = [uv, "run", "--no-cache", str(SCRIPT), "--project-root", str(root), "--skills-root", str(REPO / "skills")]
        r = subprocess.run([*base, "apply"], capture_output=True, text=True, encoding="utf-8", env=env, check=False)
        assert r.returncode == 0, r.stderr
        lines = r.stdout.splitlines()
        assert "AGENTS.md: appended" in lines and any(l.startswith("CLAUDE.md: skipped (imports @AGENTS.md") for l in lines), r.stdout
        text = (root / "AGENTS.md").read_bytes()
        assert text.startswith(b"# Project\r\n\r\nprose\r\n") and b"\r\n" + MA_STANDARDS[0].encode() + b"\r\n" in text
        assert not re.search(rb"[^\r]\n", text), "CRLF file got an LF"
        assert b"- `git-workflow-skill`:" in text
        r = subprocess.run(base, capture_output=True, text=True, encoding="utf-8", env=env, check=False)
        assert r.returncode == 0 and "AGENTS.md: unchanged" in r.stdout.splitlines(), r.stdout + r.stderr
        r = subprocess.run([*base, "remove"], capture_output=True, text=True, encoding="utf-8", env=env, check=False)
        assert r.returncode == 0 and "AGENTS.md: removed" in r.stdout.splitlines(), r.stdout + r.stderr
        assert (root / "AGENTS.md").read_bytes() == b"# Project\r\n\r\nprose\r\n"
        (root / "AGENTS.md").write_bytes(u8(f"{MA_STANDARDS[0]}\n{MA_STANDARDS[0]}\n{MA_STANDARDS[1]}\n"))
        r = subprocess.run([*base, "apply"], capture_output=True, text=True, encoding="utf-8", env=env, check=False)
        assert r.returncode == 1 and "refused: ambiguous markers" in r.stderr, (r.returncode, r.stderr)
        r = subprocess.run([*base[:-2], "apply", "--skills-root", str(root)], capture_output=True, text=True, encoding="utf-8", env=env, check=False)
        assert r.returncode == 2 and "prerequisite" in r.stderr, (r.returncode, r.stderr)
    if args.skip_cli:
        print("  - command line test skipped (--skip-cli)")
    else:
        test("command line: uv run --no-cache apply_block.py apply / remove; exit 1 on ambiguous markers, 2 without the record", t_cli)

    for d in tmp_roots:
        shutil.rmtree(d, ignore_errors=True)
    print(f"\n  {passed} passed, {failed} failed\n")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
