#!/usr/bin/env python3
# /// script
# requires-python = ">=3.11"
# ///
"""Cross-module sweep of the owned skills (Story 37.5; FR287, FR288, FR296; Decision P5-11.3).

Five checks over every folder under `skills/` (module records and members alike):

  config-reads   (FR288)    every configuration key a skill names (`core.<k>`, `modules.<code>.<k>`, the
                            `--key` arguments of a `resolve_config.py` call) is defined at the pinned BMAD
                            commit (`core.output_folder`, `core.active_initiative`, `core.project_name`, and
                            every `[[bmod.config_questions]]` key of a module record in the pinned tree) or by
                            one of this repository's module records (`modules.<code>.<key>`); no skill names a
                            BMad configuration file directly (`_bmad/config.toml`, `_bmad/custom/config.toml`,
                            `config.user.toml` -- those are `resolve_config.py`'s) or a 3.x configuration file
                            (`_bmad/bmm/config.yaml`, any `config.yaml`, `project-layout.yaml`, `.ma-agents.json`,
                            `MANIFEST.yaml`, `module.yaml`, `bmad-skill-manifest.yaml`, `skill.json`).
  names          (FR287)    no owned skill is named `bmad-*` (the rule of `tools/check_names.py`, run here too).
  cross-module   (P5-11.3)  every reference from a skill of module A to a skill of module B (by name, in any
                            text file of the skill) is declared in A's record: in `required_skills`, or in
                            `recommended_skills` with a `source`. References inside one module, to upstream
                            skills of the pinned tree, and to a name retired by the module's own `retired.toml`
                            are allowed. A `bmad-*` name that the pinned tree does not ship is a finding.
  sprint-skills  (FR296)    none of the twelve 3.x sprint skills, nor the three 3.x skills with no 4.x
                            counterpart (`bmad-sprint-planning`, `bmad-sprint-status`, `bmad-dev-story`), is named
                            outside a migration.
  v6-files       (patterns) 3.x project files (`sprint-status.yaml`, `development_status`, the 3.x override
                            markers `MA-AGENTS-START` / `MA-AGENTS-END`, `knowledge-graph.json`, `_bmad/ma-skills`)
                            are named only inside migrations (architecture implementation-patterns, module rules).

Exemptions (the only ones; each is reported in the summary line):
  - migrations: `skills/bmod-*/migration-<n>.toml` and `skills/*/scripts/migrate_*.py` are the files that carry
    3.x data over, so the `sprint-skills` and `v6-files` checks and the 3.x-file half of `config-reads` skip
    them. The key check and the cross-module check still apply to them.
  - opaque assets: a file that is not UTF-8 text (a `.pptx` deck, an image) or a bundled engine under
    `assets/` (`assets/*.cjs`, `assets/*.js`, `assets/*.mjs`, 37.4's Atlas engine) is skipped by every text
    check; such a file is run by a script, never read as guidance.

Usage: uv run --no-cache tools/sweep.py [--repo DIR] [--tree BMAD_TREE]
  `--tree` is the BMAD-METHOD checkout at the pinned commit; with it the upstream skill names and the upstream
  config questions are read from the tree. Without it every `bmad-*` name is accepted as upstream and the
  core keys are the three the pin defines.
Exit: 0 no finding, 1 findings (one line each: `<check>: <file>:<line>: <message>`).
"""

from __future__ import annotations

import argparse
import re
import sys
import tomllib
from dataclasses import dataclass, field
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
import check_names  # noqa: E402  (tools/check_names.py, the FR287 rule)

RECORD_PREFIX = "bmod-"
UPSTREAM_PREFIX = "bmad-"
# `bmad-*` tokens that are not skill names: the upstream GitHub organisation in every `source`.
NOT_SKILL_NAMES = frozenset({"bmad-code-org"})

# Keys the pinned BMAD commit defines under [core] (setup.py writes output_folder; bmad/references/initiative.md
# and help.md document active_initiative and project_name). Module keys come from [[bmod.config_questions]].
CORE_KEYS = frozenset({"output_folder", "active_initiative", "project_name"})

# FR296: the twelve 3.x sprint skills, plus FR287's three 3.x skills with no 4.x counterpart.
SPRINT_SKILLS = (
    "add-sprint",
    "add-to-sprint",
    "close-sprint",
    "cleanup-done",
    "modify-sprint",
    "remove-from-sprint",
    "prioritize-backlog",
    "generate-backlog",
    "sprint-status-view",
    "story-status-lookup",
    "my-next-issue",
    "create-bug-story",
    "bmad-sprint-planning",
    "bmad-sprint-status",
    "bmad-dev-story",
)

# BMad's own configuration files: read through resolve_config.py only (FR288).
BMAD_CONFIG_FILES = (
    (re.compile(r"_bmad/config\.toml"), "_bmad/config.toml"),
    (re.compile(r"_bmad/custom/config\.toml"), "_bmad/custom/config.toml"),
    (re.compile(r"config\.user\.toml"), "config.user.toml"),
)

# 3.x configuration and binding files: the pinned commit defines none of them (FR288).
V6_CONFIG_FILES = (
    (re.compile(r"_bmad/bmm\b"), "_bmad/bmm"),
    (re.compile(r"(?<![\w-])config\.ya?ml\b"), "config.yaml"),
    (re.compile(r"project-layout\.ya?ml"), "project-layout.yaml"),
    (re.compile(r"\.ma-agents\.json"), ".ma-agents.json"),
    (re.compile(r"\bMANIFEST\.ya?ml\b"), "MANIFEST.yaml"),
    (re.compile(r"(?<![\w-])module\.ya?ml\b"), "module.yaml"),
    (re.compile(r"bmad-skill-manifest\.ya?ml"), "bmad-skill-manifest.yaml"),
    (re.compile(r"(?<![\w-])skill\.json\b"), "skill.json"),
)

# 3.x project files named only inside migrations (implementation-patterns, "Inputs from 3.x projects").
V6_PROJECT_FILES = (
    (re.compile(r"sprint-status\.ya?ml"), "sprint-status.yaml"),
    (re.compile(r"\bdevelopment_status\b"), "development_status"),
    (re.compile(r"MA-AGENTS-(?:START|END)"), "the 3.x override markers"),
    (re.compile(r"knowledge-graph\.json"), "knowledge-graph.json"),
    (re.compile(r"_bmad/ma-skills\b"), "_bmad/ma-skills"),
)

# a dotted key in prose, a backtick, a quoted string (a script's "core.output_folder") or a JSON example;
# not a path segment (`src/core.cpp`) and not a TOML table header (`[core]` has no dot)
KEY_TOKEN = re.compile(r"(?<![\w/.\-\[])(core|modules)\.([A-Za-z0-9_-]+)(?:\.([A-Za-z0-9_-]+))?(?![\w/-])")
KEY_ARG = re.compile(r"--key\s+([^\s\"'`]+)")
TEXT_SUFFIXES = {".md", ".toml", ".py", ".sh", ".ps1", ".json", ".txt", ".yaml", ".yml", ".csv", ".js", ".mjs", ".cjs"}
OPAQUE_ASSET_SUFFIXES = {".cjs", ".js", ".mjs"}
MIGRATION_TOML = re.compile(r"^migration-\d+\.toml$")
MIGRATION_SCRIPT = re.compile(r"^migrate_.*\.py$")


@dataclass
class Record:
    folder: str
    code: str
    skills: list[str]
    required: dict[str, dict]
    recommended: dict[str, dict]
    retired: set[str] = field(default_factory=set)
    questions: list[str] = field(default_factory=list)


@dataclass
class Repo:
    root: Path
    records: dict[str, Record]  # by code
    module_of: dict[str, str]  # folder -> code
    folders: list[str]
    problems: list[str]


def read_toml(path: Path) -> dict:
    return tomllib.loads(path.read_text(encoding="utf-8"))


def load_repo(root: Path) -> Repo:
    skills_dir = root / "skills"
    folders = sorted(p.name for p in skills_dir.iterdir() if p.is_dir())
    records: dict[str, Record] = {}
    problems: list[str] = []
    record_by_folder: dict[str, str] = {}
    for name in folders:
        if not name.startswith(RECORD_PREFIX):
            continue
        try:
            bmod = read_toml(skills_dir / name / "bmod.toml")["bmod"]
        except (OSError, KeyError, tomllib.TOMLDecodeError) as error:
            problems.append(f"skills/{name}/bmod.toml: cannot read [bmod]: {error}")
            continue
        code = str(bmod["code"])
        record = Record(
            folder=name,
            code=code,
            skills=[str(s) for s in bmod.get("skills", [])],
            required={str(e.get("skill")): e for e in bmod.get("required_skills", []) if isinstance(e, dict)},
            recommended={str(e.get("skill")): e for e in bmod.get("recommended_skills", []) if isinstance(e, dict)},
            questions=[str(q.get("key")) for q in bmod.get("config_questions", []) if isinstance(q, dict)],
        )
        retired = skills_dir / name / "retired.toml"
        if retired.is_file():
            data = read_toml(retired)
            record.retired = {str(e.get("from")) for e in data.get("renamed", []) if isinstance(e, dict)}
            record.retired |= {str(e.get("skill", e.get("name"))) for e in data.get("removed", []) if isinstance(e, dict)}
        records[code] = record
        record_by_folder[name] = code
    module_of: dict[str, str] = dict(record_by_folder)
    for name in folders:
        if name.startswith(RECORD_PREFIX):
            continue
        manifest = skills_dir / name / "bmod.toml"
        try:
            owner = str(read_toml(manifest)["skill"]["bmod"])
        except (OSError, KeyError, tomllib.TOMLDecodeError) as error:
            problems.append(f"skills/{name}/bmod.toml: cannot read [skill] bmod: {error}")
            continue
        if owner not in record_by_folder:
            problems.append(f"skills/{name}/bmod.toml: [skill] bmod = {owner!r} is not a record of this repository")
            continue
        module_of[name] = record_by_folder[owner]
    return Repo(root=root, records=records, module_of=module_of, folders=folders, problems=problems)


def load_tree(tree: Path | None) -> tuple[set[str] | None, set[tuple[str, str]]]:
    """Upstream skill names (None = accept every bmad-* name) and upstream module config keys."""
    if tree is None:
        return None, set()
    skills_dir = tree / "skills"
    if not skills_dir.is_dir():
        raise SystemExit(f"error: {tree} holds no skills/ folder; pass the BMAD-METHOD checkout as --tree")
    names: set[str] = set()
    keys: set[tuple[str, str]] = set()
    for folder in sorted(p for p in skills_dir.iterdir() if p.is_dir()):
        names.add(folder.name)
        manifest = folder / "bmod.toml"
        if folder.name.startswith(RECORD_PREFIX) and manifest.is_file():
            bmod = read_toml(manifest).get("bmod", {})
            code = str(bmod.get("code", folder.name[len(RECORD_PREFIX):]))
            for question in bmod.get("config_questions", []):
                if isinstance(question, dict) and "key" in question:
                    keys.add((code, str(question["key"])))
    return names, keys


def is_opaque(path: Path) -> bool:
    if path.parent.name == "assets" and path.suffix in OPAQUE_ASSET_SUFFIXES:
        return True
    if path.suffix not in TEXT_SUFFIXES:
        return True
    try:
        path.read_text(encoding="utf-8")
    except (UnicodeDecodeError, OSError):
        return True
    return False


def is_migration(rel: Path) -> bool:
    # rel is relative to skills/: <folder>/migration-<n>.toml or <folder>/scripts/migrate_*.py
    parts = rel.parts
    if len(parts) == 2 and parts[0].startswith(RECORD_PREFIX) and MIGRATION_TOML.match(parts[1]):
        return True
    return len(parts) == 3 and parts[1] == "scripts" and bool(MIGRATION_SCRIPT.match(parts[2]))


def name_pattern(names: set[str], any_upstream: bool = False) -> re.Pattern[str] | None:
    if not names and not any_upstream:
        return None
    parts = [re.escape(n) for n in sorted(names, key=len, reverse=True)]
    if any_upstream:
        parts.append(r"bmad-[a-z0-9]+(?:-[a-z0-9]+)*")
    return re.compile(rf"(?<![\w-])({'|'.join(parts)})(?![\w-])")


def sweep(repo: Repo, upstream: set[str] | None, upstream_keys: set[tuple[str, str]]) -> tuple[list[str], dict]:
    findings: list[str] = list(repo.problems)
    skills_dir = repo.root / "skills"
    owned = set(repo.folders)
    defined_module_keys = set(upstream_keys)
    for record in repo.records.values():
        for key in record.questions:
            defined_module_keys.add((record.code, key))
    known_names = set(owned) | (upstream or set())
    all_retired = set().union(*(r.retired for r in repo.records.values())) if repo.records else set()
    # every bmad-* token is matched, so that a name the pinned tree does not ship is seen, not skipped
    pattern = name_pattern(known_names | all_retired, any_upstream=True)
    sprint_pattern = name_pattern(set(SPRINT_SKILLS))
    stats = {
        "folders": len(repo.folders),
        "text_files": 0,
        "opaque": [],
        "migrations": [],
        "keys": set(),
        "cross": {},  # (module, target module) -> set of names
        "upstream_refs": {},  # module -> set of names
    }

    # names (FR287)
    for problem in check_names.check(repo.root)[0]:
        findings.append(f"names: {problem}")

    # recommended_skills entries for our own skills must carry a source (P5-11.3)
    for record in repo.records.values():
        for name, entry in record.recommended.items():
            if name in owned and not entry.get("source"):
                findings.append(
                    f"cross-module: skills/{record.folder}/bmod.toml: recommended_skills entry {name!r} has no source"
                )

    for folder in repo.folders:
        module = repo.module_of.get(folder)
        record = repo.records.get(module) if module else None
        for path in sorted(p for p in (skills_dir / folder).rglob("*") if p.is_file()):
            rel = path.relative_to(skills_dir)
            if "__pycache__" in rel.parts:
                continue  # interpreter caches a test run left behind; never shipped (.gitignore)
            rel_repo = f"skills/{rel.as_posix()}"
            if is_opaque(path):
                stats["opaque"].append(rel_repo)
                continue
            migration = is_migration(rel)
            if migration:
                stats["migrations"].append(rel_repo)
            stats["text_files"] += 1
            for number, line in enumerate(path.read_text(encoding="utf-8").splitlines(), start=1):
                where = f"{rel_repo}:{number}"
                # config-reads: keys
                key_tokens = [(m.group(1), m.group(2), m.group(3)) for m in KEY_TOKEN.finditer(line)]
                # `--key` is resolve_config.py's argument; other tools (cosign, gpg) take a `--key <file>` too
                for arg in KEY_ARG.findall(line) if "resolve_config.py" in line else ():
                    parts = arg.split(".")
                    if parts[0] in ("core", "modules") and len(parts) in (2, 3):
                        key_tokens.append((parts[0], parts[1], parts[2] if len(parts) == 3 else None))
                    else:
                        findings.append(f"config-reads: {where}: `--key {arg}` is not a `core.<key>` or `modules.<code>.<key>` key")
                for table, first, second in key_tokens:
                    if table == "core":
                        if second is not None:
                            continue  # core.<x>.<y> is not a key form resolve_config.py defines; prose
                        stats["keys"].add(f"core.{first}")
                        if first not in CORE_KEYS:
                            findings.append(f"config-reads: {where}: `core.{first}` is not a key the pinned BMAD commit defines")
                    else:
                        if second is None:
                            continue  # `modules.<code>` names a table, not a key
                        stats["keys"].add(f"modules.{first}.{second}")
                        if (first, second) not in defined_module_keys:
                            findings.append(
                                f"config-reads: {where}: `modules.{first}.{second}` is defined by no module record "
                                "(pinned tree or this repository)"
                            )
                # config-reads: files
                for regex, label in BMAD_CONFIG_FILES:
                    if regex.search(line):
                        findings.append(f"config-reads: {where}: names {label}; configuration is read through resolve_config.py only")
                if not migration:
                    for regex, label in V6_CONFIG_FILES:
                        if regex.search(line):
                            findings.append(f"config-reads: {where}: names the 3.x configuration file {label}, which the pinned commit does not define")
                    for regex, label in V6_PROJECT_FILES:
                        if regex.search(line):
                            findings.append(f"v6-files: {where}: names {label}; 3.x project files are named only inside migrations")
                    if sprint_pattern is not None:
                        for match in sprint_pattern.finditer(line):
                            findings.append(f"sprint-skills: {where}: names {match.group(1)!r}, a 3.x sprint skill 4.x does not ship (FR296)")
                # cross-module
                if pattern is None:
                    continue
                for match in pattern.finditer(line):
                    name = match.group(1)
                    if name == folder or (record is not None and name == record.folder):
                        continue
                    if name in NOT_SKILL_NAMES or name in SPRINT_SKILLS:
                        continue  # the sprint-skills check owns the FR296 names (allowed inside migrations only)
                    if name in owned:
                        target = repo.module_of.get(name)
                        if target == module:
                            continue
                        if name.startswith(RECORD_PREFIX):
                            # a reference to another module's record: allowed when a skill of that module is declared
                            declared = {n for n in (record.required | record.recommended) if record} if record else set()
                            if any(repo.module_of.get(n) == target for n in declared):
                                continue
                            findings.append(
                                f"cross-module: {where}: names the {target!r} module record {name!r}; "
                                f"module {module!r} declares no skill of that module"
                            )
                            continue
                        if record is not None and (name in record.required or name in record.recommended):
                            stats["cross"].setdefault((module, target), set()).add(name)
                            continue
                        findings.append(
                            f"cross-module: {where}: names {name!r} (module {target!r}), which the "
                            f"{record.folder if record else module!r} record does not declare in required_skills or recommended_skills"
                        )
                    elif name in all_retired:
                        if record is None or name not in record.retired:
                            findings.append(f"cross-module: {where}: names {name!r}, a name retired by another module")
                    elif name.startswith(UPSTREAM_PREFIX):
                        if upstream is not None and name not in upstream:
                            findings.append(f"cross-module: {where}: names {name!r}, which the pinned BMAD commit does not ship")
                        else:
                            stats["upstream_refs"].setdefault(module, set()).add(name)
    return findings, stats


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--repo", type=Path, default=HERE.parent, help="repository root (default: this repository)")
    parser.add_argument("--tree", type=Path, default=None, help="BMAD-METHOD checkout at the pinned commit")
    args = parser.parse_args(argv)
    repo = load_repo(args.repo.resolve())
    upstream, upstream_keys = load_tree(args.tree.resolve() if args.tree else None)
    findings, stats = sweep(repo, upstream, upstream_keys)
    if findings:
        print(f"cross-module sweep failed ({len(findings)}):", file=sys.stderr)
        for finding in findings:
            print(f"  {finding}", file=sys.stderr)
        return 1
    cross = "; ".join(
        f"{a} -> {b}: {', '.join(sorted(names))}" for (a, b), names in sorted(stats["cross"].items())
    ) or "none"
    upstream_refs = ", ".join(f"{m} ({len(n)})" for m, n in sorted(stats["upstream_refs"].items())) or "none"
    print(
        f"OK: sweep: {stats['folders']} skill folder(s), {stats['text_files']} text file(s); "
        f"{len(stats['opaque'])} opaque asset(s) skipped; {len(stats['migrations'])} migration file(s) exempt "
        f"from the 3.x checks; config keys named: {', '.join(sorted(stats['keys']))}; "
        f"cross-module references, all declared: {cross}; "
        f"upstream references per module{' (every name shipped at the pin)' if upstream is not None else ''}: {upstream_refs}"
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
