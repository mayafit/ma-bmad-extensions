#!/usr/bin/env python3
# /// script
# requires-python = ">=3.11"
# ///
"""Every skill activates offline with the 4.x runtime (NFR84, FR282; Story 37.6; ma-agents Story 36.2).

With no network, each module is installed alone from this folder (the Skills CLI from the packed folder,
BMAD v7 from the pinned tree), set up with `setup.py --module-answers`, and then every member is rendered
with `render_skill.py` and every `[skill] scripts` entry is started (`--help`), all through
`uv run --no-cache` with the runtime of ma-agents `docs/on-prem-runtime.md`:

  <runtime>/bin/uv                      uv (0.13.8)
  <runtime>/python/cpython-3.11.*       the managed interpreter (`uv python install 3.11 --no-bin`)
  <runtime>/wheelhouse/<platform>/      the wheels `scripts/build-wheelhouse.py` of ma-agents resolved for
  <runtime>/wheelhouse/wheelhouse-manifest.json   the pinned tree plus this repository (`--extra-skills`)

Activations select the runtime the way an installed project does (FR282): a `uv.toml` written here with
`python-preference = "only-managed"`, `python-downloads = "never"`, `find-links`, `offline = true` and
`no-cache = true`, named by `UV_CONFIG_FILE`, plus `UV_PYTHON_INSTALL_DIR` in the environment (uv has no
configuration key for it). Nothing else of the host's uv configuration is read: `UV_*` variables are
dropped from the activation environment. Before anything runs, the wheelhouse manifest must cover every
PEP 723 dependency an owned `[skill] scripts` entry declares.

`--require-no-network` (Linux) fails unless the only network interface is `lo`, and asserts that
`setup.py --status` reports every module's update state `could-not-check` (the anonymous read of the public
repository cannot happen). `--control` adds ma-agents 36.2 AC5(a): with `find-links` removed, a render fails
with uv's "No solution found" -- proof that the wheelhouse, not a cache or the network, fed the runs.

Usage:
  uv run --no-cache tools/offline_activation.py --tree BMAD_TREE --skills-cli CLI_DIR --runtime RT --work DIR
      [--platform linux-x64|win-x64] [--module CODE ...] [--require-no-network] [--control] [--repo DIR]
  (run the script itself with UV_PYTHON_INSTALL_DIR, UV_PYTHON_PREFERENCE=only-managed,
   UV_PYTHON_DOWNLOADS=never, UV_OFFLINE=1 and UV_NO_CACHE=1 set, so that uv finds the managed interpreter)
Exit: 0 every module, member and script activated, 1 a failure, 2 a prerequisite is missing.
"""

from __future__ import annotations

import argparse
import json
import os
import platform as platform_module
import re
import shutil
import subprocess
import sys
import tomllib
from pathlib import Path

HERE = Path(__file__).resolve().parent
AGENT = "claude-code"
AGENT_DIR = Path(".claude") / "skills"
CORE_RECORDS = ("bmod-core-tools", "bmod-method")
HEADER_RE = re.compile(r"^# /// script\s*$(?P<body>.*?)^# ///\s*$", re.MULTILINE | re.DOTALL)
NAME_RE = re.compile(r"^\s*([A-Za-z0-9](?:[A-Za-z0-9._-]*[A-Za-z0-9])?)")
NO_SOLUTION = "No solution found when resolving script dependencies"


class Prerequisite(RuntimeError):
    pass


class Failure(RuntimeError):
    pass


def normalize(name: str) -> str:
    return re.sub(r"[-_.]+", "-", name).lower()


def default_platform() -> str:
    system = platform_module.system()
    if system == "Linux":
        return "linux-x64"
    if system == "Windows":
        return "win-x64"
    raise Prerequisite(f"no wheelhouse platform for {system}; pass --platform")


def read_toml(path: Path) -> dict:
    return tomllib.loads(path.read_text(encoding="utf-8"))


def record(path: Path) -> dict:
    return read_toml(path / "bmod.toml")["bmod"]


def record_skills(skills_dir: Path, folder: str) -> list[str]:
    return [folder, *[str(s) for s in record(skills_dir / folder).get("skills", [])]]


def member_scripts(skills_dir: Path, member: str) -> list[str]:
    manifest = skills_dir / member / "bmod.toml"
    if not manifest.is_file():
        return []
    return [str(s) for s in read_toml(manifest).get("skill", {}).get("scripts", [])]


def script_dependencies(path: Path) -> list[str]:
    match = HEADER_RE.search(path.read_text(encoding="utf-8"))
    if not match:
        return []
    lines = [line[2:] if line.startswith("# ") else "" for line in match.group("body").splitlines()]
    data = tomllib.loads("\n".join(lines))
    return [str(d) for d in data.get("dependencies", [])]


class Runtime:
    def __init__(self, root: Path, platform: str, work: Path):
        self.root = root
        self.platform = platform
        self.bin = root / "bin"
        self.uv = self.bin / ("uv.exe" if platform == "win-x64" else "uv")
        self.python = root / "python"
        self.wheels = root / "wheelhouse" / platform
        self.manifest = root / "wheelhouse" / "wheelhouse-manifest.json"
        self.config = work / "uv.toml"
        if not self.uv.is_file():
            raise Prerequisite(f"{self.uv} not found")
        interpreters = sorted(p.name for p in self.python.iterdir() if p.is_dir()) if self.python.is_dir() else []
        if not any(name.startswith("cpython-3.11") for name in interpreters):
            raise Prerequisite(f"{self.python} holds no cpython-3.11 interpreter ({interpreters})")
        self.interpreters = interpreters
        self.wheel_files = sorted(p.name for p in self.wheels.glob("*.whl")) if self.wheels.is_dir() else []
        if not self.wheel_files:
            raise Prerequisite(f"{self.wheels} holds no wheel")
        if not self.manifest.is_file():
            raise Prerequisite(f"{self.manifest} not found")

    def write_config(self, find_links: bool) -> None:
        lines = ['python-preference = "only-managed"', 'python-downloads = "never"']
        if find_links:
            lines.append(f"find-links = [{json.dumps(self.wheels.as_posix())}]")
        lines += ["offline = true", "no-cache = true"]
        self.config.write_text("\n".join(lines) + "\n", encoding="utf-8")

    def env(self) -> dict[str, str]:
        base = {k: v for k, v in os.environ.items() if not k.startswith("UV_")}
        base["PATH"] = os.pathsep.join([str(self.bin), base.get("PATH", "")])
        base["UV_CONFIG_FILE"] = str(self.config)
        base["UV_PYTHON_INSTALL_DIR"] = str(self.python)
        base["DISABLE_TELEMETRY"] = "1"
        base["DO_NOT_TRACK"] = "1"
        return base

    def covers(self, requirements: dict[str, list[str]]) -> list[str]:
        """Requirements (by script) whose project is not in the wheelhouse manifest's dependency set."""
        data = json.loads(self.manifest.read_text(encoding="utf-8"))
        known = {normalize(str(name)) for name in data.get("dependency_union", data.get("dependencies", []))}
        pinned = {normalize(w.split("-")[0]) for w in self.wheel_files}
        missing = []
        for script, deps in sorted(requirements.items()):
            for dep in deps:
                match = NAME_RE.match(dep)
                name = normalize(match.group(1)) if match else dep
                if name not in known and name not in pinned:
                    missing.append(f"{script}: {dep!r} is not in {self.manifest.name} nor among the wheels")
        return missing


def run(argv: list[str], cwd: Path, env: dict[str, str]) -> subprocess.CompletedProcess:
    return subprocess.run(
        argv, cwd=cwd, env=env, stdin=subprocess.DEVNULL, capture_output=True,
        text=True, encoding="utf-8", errors="replace", check=False,
    )


def network_interfaces() -> list[str] | None:
    try:
        lines = Path("/proc/net/dev").read_text(encoding="utf-8").splitlines()[2:]
    except OSError:
        return None
    return sorted(line.split(":", 1)[0].strip() for line in lines if ":" in line)


def skills_cli(cli_dir: Path, node: str) -> list[str]:
    pkg = json.loads((cli_dir / "package.json").read_text(encoding="utf-8"))
    bin_entry = pkg["bin"] if isinstance(pkg["bin"], str) else pkg["bin"][pkg["name"]]
    entry = cli_dir / bin_entry.removeprefix("./")
    if not entry.is_file() or not (cli_dir / "node_modules").is_dir():
        raise Prerequisite(f"{cli_dir} is not a packed Skills CLI (tools/pack-skills-cli.mjs)")
    return [node, str(entry)]


def add(cli: list[str], project: Path, source: str, names: list[str], env: dict[str, str]) -> None:
    argv = [*cli, "add", source]
    for name in names:
        argv += ["--skill", name]
    argv += ["-y", "--agent", AGENT]
    result = run(argv, project, env)
    if result.returncode != 0:
        raise Failure(f"skills add {source} exited {result.returncode}: {(result.stderr or result.stdout).strip()[-1500:]}")


def uv_run(rt: Runtime, project: Path, script: Path, *args: str) -> subprocess.CompletedProcess:
    return run([str(rt.uv), "run", "--no-cache", str(script), *args], project, rt.env())


def setup_json(rt: Runtime, project: Path, *args: str):
    bmad = project / AGENT_DIR / "bmad"
    result = uv_run(
        rt, project, bmad / "scripts" / "setup.py",
        "--project-root", str(project), "--skill", str(bmad), "--root", str(project / AGENT_DIR), *args,
    )
    if result.returncode != 0:
        raise Failure(f"setup.py {' '.join(args) or '(create)'} exited {result.returncode}: {(result.stderr or result.stdout).strip()[-1500:]}")
    return json.loads(result.stdout)


def activate_module(
    code: str, repo: Path, tree: Path, cli: list[str], rt: Runtime, work: Path, require_no_network: bool, log,
) -> tuple[int, int]:
    skills_dir = repo / "skills"
    folder = f"bmod-{code}"
    rec = record(skills_dir / folder)
    module_skills = record_skills(skills_dir, folder)
    core_skills = [name for core in CORE_RECORDS for name in record_skills(tree / "skills", core)]
    project = work / code
    if project.exists():
        shutil.rmtree(project)
    project.mkdir(parents=True)
    env = rt.env()
    git = run(["git", "init", "-q"], project, env)
    if git.returncode != 0:
        raise Failure(f"git init: {git.stderr.strip()}")
    add(cli, project, str(tree), core_skills, env)
    add(cli, project, str(repo), module_skills, env)
    installed = sorted(p.name for p in (project / AGENT_DIR).iterdir() if p.is_dir())
    expected = sorted(set(core_skills) | set(module_skills))
    if installed != expected:
        raise Failure(f"installed skills differ: extra {sorted(set(installed) - set(expected))}, missing {sorted(set(expected) - set(installed))}")

    created = setup_json(rt, project, "--list-config-questions")
    answers = work / f"{code}-answers.toml"
    tables: dict[str, list[dict]] = {}
    for question in created:
        tables.setdefault(question["module"], []).append(question)
    answers.write_text(
        "".join(
            f'[modules."{module}"]\n' + "".join(f"{json.dumps(q['key'])} = {json.dumps(q['default'])}\n" for q in qs) + "\n"
            for module, qs in sorted(tables.items())
        ),
        encoding="utf-8",
    )
    try:
        report = setup_json(rt, project, "--module-answers", str(answers))
    finally:
        answers.unlink(missing_ok=True)
    log(f"  add + setup: {len(installed)} skills, {len(created)} question(s) answered with defaults, status {report.get('status')!r}")

    status = setup_json(rt, project, "--status")
    entry = next((m for m in status.get("modules", []) if m.get("module") == code), None)
    if entry is None or entry.get("version") != rec["version"]:
        raise Failure(f"--status does not report {code} at {rec['version']!r}: {entry}")
    for key in ("problems", "unmet_requirements", "pending_questions", "missing_module_records"):
        if status.get(key):
            raise Failure(f"--status {key}: {status[key]}")
    update_state = (entry.get("update") or {}).get("state")
    log(f"  status: {code} {entry['version']}, update {update_state!r}")
    if require_no_network and update_state != "could-not-check":
        raise Failure(f"--status update state {update_state!r} with no network; expected 'could-not-check'")

    render = project / "_bmad" / "scripts" / "render_skill.py"
    rendered = 0
    for member in module_skills[1:]:
        result = uv_run(rt, project, render, "--project-root", str(project), "--skill", str(project / AGENT_DIR / member))
        if result.returncode != 0 or not result.stdout.strip():
            raise Failure(f"render_skill.py {member} exited {result.returncode}: {(result.stderr or result.stdout).strip()[-1500:]}")
        rendered += 1
    log(f"  render_skill.py: {rendered} member(s) rendered")

    started = 0
    for member in module_skills[1:]:
        for rel in member_scripts(skills_dir, member):
            script = project / "_bmad" / code / "scripts" / Path(rel).name
            if not script.is_file():
                raise Failure(f"{member}: setup did not install {rel} at {script}")
            log(f"  script: {member}/{rel}: {start_script(rt, project, script)}")
            started += 1
    return rendered, started


def start_script(rt: Runtime, project: Path, script: Path) -> str:
    """Start an installed script through the runtime: `--help` exits 0 (argparse), or the script prints its own
    usage text when called with `--help` or with no argument (the `sys.argv` scripts of skill-creator). A uv
    failure (no interpreter, no wheel) or a traceback is a failure; so is any other non-zero exit."""
    attempts = (("--help",), ())
    for args in attempts:
        result = uv_run(rt, project, script, *args)
        output = result.stdout + result.stderr
        shown = " ".join(args) or "(no argument)"
        if "Traceback" in output or NO_SOLUTION in output or "No interpreter found" in output:
            raise Failure(f"{script.name} {shown} exited {result.returncode}: {output.strip()[-1500:]}")
        if result.returncode == 0:
            return f"{shown} exit 0"
        if "usage" in output.lower():
            return f"{shown} exit {result.returncode} (usage printed)"
    raise Failure(f"{script.name}: neither --help nor a bare start printed usage: exit {result.returncode}: {output.strip()[-1500:]}")


def control(rt: Runtime, repo: Path, work: Path, code: str, member: str) -> str:
    """36.2 AC5(a): without find-links the same render fails on dependency resolution."""
    project = work / code
    rt.write_config(find_links=False)
    try:
        result = uv_run(
            rt, project, project / "_bmad" / "scripts" / "render_skill.py",
            "--project-root", str(project), "--skill", str(project / AGENT_DIR / member),
        )
    finally:
        rt.write_config(find_links=True)
    output = result.stdout + result.stderr
    if result.returncode == 0 or NO_SOLUTION not in output:
        raise Failure(f"control: render of {member} without find-links exited {result.returncode}: {output.strip()[-800:]}")
    return f"control: render of {member} without find-links exits {result.returncode}: {NO_SOLUTION}"


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--repo", type=Path, default=HERE.parent, help="repository root (default: this repository)")
    parser.add_argument("--tree", type=Path, required=True, help="BMAD-METHOD checkout at the pinned commit")
    parser.add_argument("--skills-cli", type=Path, required=True, help="Skills CLI folder from tools/pack-skills-cli.mjs")
    parser.add_argument("--runtime", type=Path, required=True, help="runtime folder: bin/uv, python/, wheelhouse/")
    parser.add_argument("--work", type=Path, required=True, help="scratch folder for the projects")
    parser.add_argument("--platform", choices=("linux-x64", "win-x64"), help="wheelhouse platform (default: this host)")
    parser.add_argument("--module", action="append", default=[], help="module code (default: every record)")
    parser.add_argument("--require-no-network", action="store_true", help="fail unless the host has only `lo`")
    parser.add_argument("--control", action="store_true", help="also prove a render fails without find-links")
    args = parser.parse_args(argv)

    repo = args.repo.resolve()
    skills_dir = repo / "skills"
    try:
        codes_all = sorted(record(p)["code"] for p in skills_dir.glob("bmod-*") if (p / "bmod.toml").is_file())
        codes = args.module or codes_all
        if set(codes) - set(codes_all):
            raise Prerequisite(f"no module record for {sorted(set(codes) - set(codes_all))}")
        tree = args.tree.resolve()
        if not (tree / "skills" / "bmad" / "scripts" / "setup.py").is_file():
            raise Prerequisite(f"{tree} is not a BMAD v7 tree")
        node = shutil.which("node")
        if not node or not shutil.which("git"):
            raise Prerequisite("node and git must be on PATH")
        cli = skills_cli(args.skills_cli.resolve(), node)
        work = args.work.resolve()
        work.mkdir(parents=True, exist_ok=True)
        rt = Runtime(args.runtime.resolve(), args.platform or default_platform(), work)
        rt.write_config(find_links=True)
        requirements = {
            f"{member}/{rel}": script_dependencies(skills_dir / member / rel)
            for code in codes_all
            for member in record_skills(skills_dir, f"bmod-{code}")[1:]
            for rel in member_scripts(skills_dir, member)
        }
        uncovered = rt.covers(requirements)
        if uncovered:
            raise Prerequisite("wheelhouse does not cover every owned script: " + "; ".join(uncovered))
        interfaces = network_interfaces()
        if args.require_no_network:
            if interfaces is None:
                raise Prerequisite("--require-no-network needs /proc/net/dev (Linux)")
            if interfaces != ["lo"]:
                raise Prerequisite(f"network interfaces other than lo: {interfaces}")
    except Prerequisite as error:
        print(f"prerequisite: {error}", file=sys.stderr)
        return 2

    version = run([str(rt.uv), "--version"], work, rt.env()).stdout.strip()
    print(f"runtime: {version} at {rt.uv}; python {rt.interpreters}; {len(rt.wheel_files)} wheel(s) for {rt.platform}")
    print(f"wheelhouse covers {len(requirements)} owned script(s): {', '.join(sorted(requirements))}")
    print(f"network interfaces: {interfaces if interfaces is not None else 'not readable (not Linux)'}")
    print(f"uv.toml: {rt.config} (UV_CONFIG_FILE); UV_PYTHON_INSTALL_DIR={rt.python}")

    failed: list[str] = []
    rendered = started = 0
    for code in codes:
        print(f"module {code}")
        try:
            r, s = activate_module(code, repo, tree, cli, rt, work, args.require_no_network, print)
            rendered += r
            started += s
            print(f"  PASS {code}")
        except (Failure, Prerequisite, json.JSONDecodeError, KeyError, OSError) as error:
            print(f"  FAIL {code}: {error}", file=sys.stderr)
            failed.append(code)
    if args.control and not failed:
        code = codes[0]
        member = record_skills(skills_dir, f"bmod-{code}")[1]
        try:
            print(control(rt, repo, work, code, member))
        except Failure as error:
            print(f"  FAIL {error}", file=sys.stderr)
            failed.append("control")
    if failed:
        print(f"offline activation failed for {failed}", file=sys.stderr)
        return 1
    print(
        f"OK: offline activation: {len(codes)} module(s) installed alone, {rendered} member(s) rendered, "
        f"{started} script(s) started, every run through uv run --no-cache from the runtime"
        + (" with no network" if args.require_no_network else "")
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
