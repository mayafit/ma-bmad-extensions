#!/usr/bin/env python3
# /// script
# requires-python = ">=3.11"
# ///
"""js-ts-security-skill: OWASP Top 10 2025 security audit of a JavaScript / TypeScript project.

Five phases, each mapped to OWASP 2025 categories: lockfile and registry hygiene (A03), the package
manager's vulnerability audit (A03), dangerous code patterns (A01, A04, A05, A07, A08), empty catch
blocks (A10) and hard-coded secrets (A01, A07). Standard library only; run through uv from the
project root (or pass --root):

  uv run --no-cache verify_security.py [--root DIR] [--skip-audit]
Exit: 0 SECURE, 1 VULNERABLE, 2 the root is not a JS/TS project.
"""

from __future__ import annotations

import argparse
import json
import os
import re
import shutil
import subprocess
import sys
from pathlib import Path

SOURCE_SUFFIXES = {".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs"}
SKIP_DIRS = {"node_modules", ".git", "dist", "build", ".next", "coverage"}
LOCKFILES = ("package-lock.json", "yarn.lock", "pnpm-lock.yaml")
PATTERNS = {
    "A01: SSRF / access control": re.compile(r"fetch\(`|axios\.get\(`|http\.get\(`"),
    "A05: injection": re.compile(r"\beval\(|new Function\(|child_process\.exec\(|require\('child_process'\)\.exec"),
    "A04: cryptographic failures": re.compile(r"crypto\.createHash\('(?:md5|sha1)'\)|Math\.random\(\)"),
    "A08: software / data integrity": re.compile(r"\bunserialize\(|JSON\.parse\("),
    "A07: authentication failures": re.compile(r"res\.cookie\(.*(?:httpOnly|secure):\s*false"),
}
EMPTY_CATCH = re.compile(r"catch\s*(?:\(\s*\w*\s*\))?\s*\{\s*\}")
SECRETS = (
    re.compile(r"AIza[0-9A-Za-z_-]{35}"),
    re.compile(r"sk_live_[0-9a-zA-Z]{24}"),
    re.compile(r"xox[pb]-[0-9]{12}-[0-9]{12}-[0-9]{12}-[a-z0-9]{32}"),
    re.compile(r"-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----"),
)


def source_files(root: Path, extra_suffixes: set[str] = frozenset()) -> list[Path]:
    out: list[Path] = []
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS]
        for name in filenames:
            path = Path(dirpath) / name
            if path.suffix in SOURCE_SUFFIXES or path.suffix in extra_suffixes or name == ".env":
                out.append(path)
    return sorted(out)


def grep(files: list[Path], pattern: re.Pattern, root: Path) -> list[str]:
    hits: list[str] = []
    for path in files:
        try:
            lines = path.read_text(encoding="utf-8", errors="replace").splitlines()
        except OSError:
            continue
        for number, line in enumerate(lines, start=1):
            if pattern.search(line):
                hits.append(f"{path.relative_to(root).as_posix()}:{number}: {line.strip()[:160]}")
    return hits


def phase(title: str) -> None:
    print(f"\n[{title}]")


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--root", type=Path, default=Path.cwd(), help="project root (default: current directory)")
    parser.add_argument("--skip-audit", action="store_true", help="skip the npm/yarn/pnpm vulnerability audit")
    args = parser.parse_args(argv)
    root = args.root.resolve()
    package_json = root / "package.json"
    if not package_json.is_file():
        print(f"not a JS/TS project: {package_json} not found", file=sys.stderr)
        return 2
    print("====================================================")
    print("   JS/TS Security Audit - OWASP Top 10 2025")
    print("====================================================")
    results: dict[str, bool] = {}

    phase("1/5 A03:2025 - Software supply chain failures")
    issues = 0
    lockfile = next((root / name for name in LOCKFILES if (root / name).is_file()), None)
    if lockfile is None:
        print("x CRITICAL: no lockfile found (package-lock.json, yarn.lock or pnpm-lock.yaml); builds are not reproducible")
        issues += 1
    text = package_json.read_text(encoding="utf-8", errors="replace")
    if "http://" in text:
        print("x WARNING: insecure registry or dependency URL in package.json (http:// instead of https://)")
        issues += 1
    print("+ no immediate supply-chain issue" if issues == 0 else f"x supply-chain issues: {issues}")
    results["A03: supply chain"] = issues == 0

    phase("2/5 A03:2025 - Vulnerable components (audit)")
    audit_ok = True
    if args.skip_audit:
        print("  skipped (--skip-audit)")
    elif lockfile is None:
        print("  skipped: no lockfile")
    else:
        if lockfile.name == "yarn.lock":
            command = ["yarn", "audit", "--level", "high"]
        elif lockfile.name == "pnpm-lock.yaml":
            command = ["pnpm", "audit", "--audit-level", "high"]
        else:
            command = ["npm", "audit", "--audit-level=high"]
        exe = shutil.which(command[0])
        if exe is None:
            print(f"  skipped: {command[0]} not found on PATH")
        else:
            result = subprocess.run([exe, *command[1:]], cwd=root, capture_output=True, text=True, encoding="utf-8", errors="replace", check=False)
            output = (result.stdout or "") + (result.stderr or "")
            print("  " + "\n  ".join(output.strip().splitlines()[-15:]))
            audit_ok = result.returncode == 0
            print("+ no high-severity vulnerability in dependencies" if audit_ok else f"x vulnerabilities found; run `{command[0]} audit fix`")
    results["A03: vulnerabilities"] = audit_ok

    files = source_files(root)
    phase("3/5 Static analysis (OWASP A01, A04, A05, A07, A08)")
    found = 0
    for category, pattern in PATTERNS.items():
        hits = grep(files, pattern, root)
        if hits:
            found += 1
            print(f"x risk: [{category}]")
            for hit in hits[:50]:
                print(f"    {hit}")
    print("+ no dangerous pattern detected" if found == 0 else f"x dangerous pattern categories: {found}")
    results["A01/04/05/07/08: code patterns"] = found == 0

    phase("4/5 A10:2025 - Mishandling of exceptional conditions")
    hits = grep(files, EMPTY_CATCH, root)
    if hits:
        print("x risk: empty catch blocks (swallowed exceptions)")
        for hit in hits[:50]:
            print(f"    {hit}")
    print("+ exception handling patterns look sound" if not hits else f"x empty catch blocks: {len(hits)}")
    results["A10: exception handling"] = not hits

    phase("5/5 A01/A07 - Hard-coded secrets")
    secret_hits: list[str] = []
    for pattern in SECRETS:
        secret_hits += grep(source_files(root, {".env"}), pattern, root)
    for hit in secret_hits[:50]:
        print(f"    {hit}")
    print("+ no hard-coded secret detected" if not secret_hits else f"x potential secrets: {len(secret_hits)}")
    results["A01/A07: secrets"] = not secret_hits

    print("\n----------------------------------------------------")
    print("   OWASP 2025 audit summary")
    print("----------------------------------------------------")
    for name, ok in results.items():
        print(f"{name:<34} {'PASS' if ok else 'FAIL'}")
    print("----------------------------------------------------")
    secure = all(results.values())
    print(json.dumps({"secure": secure, "results": results}))
    print("Final result: SECURE" if secure else "Final result: VULNERABLE")
    return 0 if secure else 1


if __name__ == "__main__":
    sys.exit(main())
