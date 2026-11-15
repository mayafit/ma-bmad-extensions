#!/usr/bin/env python3
# /// script
# requires-python = ">=3.11"
# dependencies = ["pyyaml>=6.0.2,<7"]
# ///
"""migrate_v6_backlog -- ma-agents 3.x tracking data into the BMAD v7 ticket tree (bmod-ma-ops/migration-1.toml).

Runs after `bmad migrate method`, which archives a 3.x `sprint-status.yaml` unchanged under an initiative's
`archive-v6/` folder and joins the story keys it could to `[[entry]]` tables through `v6_key`. This script reads that
archived copy and finishes the ma-agents part:

- `backlog:` items (the unified 3.x format) not yet in the tree, matched by `v6_key`, become tickets: an `[[entry]]`
  in their epic when the id names an epic the tree holds, else `backlog/<type>-<slug>.md`; `sprints:` is written to
  `archive-v6/sprints.yaml` as the tracker wrote it; an absent `backlog:` or `sprints:` section is valid input and
  reported;
- every `development_status:` story key (`<N>-<M>-<slug>`) is joined to exactly one entry: by `v6_key`, else by
  (N, M) when a story file with another slug holds that id (the tracking key becomes its `v6_key`), else a new entry
  with id M (a letter suffix such as `6a` kept), in `epic-<N>-untitled/` when the tree has no epic N (no `## Epic N:`
  heading in the 3.x epics file);
- a 3.x status `cancelled`, `wont-fix` or `optional` sets the plan `status` to `dropped`; `review` maps to
  `in-review`, `drafted` and `contexted` to `ready-for-dev`, `on-hold` to `blocked`; a plan or leaf status
  `tickets.py` rejects is mapped so `tickets.py status` exits 0;
- a `<N>-<M>-validation-report.md` (or its plan) in the live tree is a review record, moved to `archive-v6/`;
- `_bmad/ma-skills/` moves to the initiative's `archive-v6/ma-skills/`.

Every file it changes is copied first to `<project-root>/.mv6/<run>/` under a short hashed name (so the backup path
fits MAX_PATH on Windows whenever the source does), with `index.txt` mapping each copy to its source. It never
overwrites an existing file (a name collision gets a numeric suffix and a report line), and a re-run writes nothing
already present. The report goes to `<output folder>/migration-v6-v7/ma-ops-migration-1.md`.

Usage:
  uv run --no-cache migrate_v6_backlog.py --project-root P [--output-folder F] [--initiative NAME] [--dry-run] [--json]
Exit: 0 done (or nothing to do), 1 a tree or tracker could not be read, 2 no migrated initiative found.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import shutil
import subprocess
import sys
import tomllib
from datetime import datetime
from pathlib import Path

import yaml

sys.dont_write_bytecode = True

STATUSES = ("draft", "ready-for-dev", "in-progress", "in-review", "built", "done", "blocked", "dropped")
CONTAINER_STATUSES = ("in-progress", "done", "dropped")
DROP = ("cancelled", "wont-fix", "optional")
PLAN_STATUS = {
    "backlog": None,
    "ready-for-dev": "ready-for-dev",
    "drafted": "ready-for-dev",
    "contexted": "ready-for-dev",
    "in-progress": "in-progress",
    "review": "in-review",
    "in-review": "in-review",
    "built": "built",
    "done": "done",
    "blocked": "blocked",
    "on-hold": "blocked",
    "draft": "draft",
    "dropped": "dropped",
    **{s: "dropped" for s in DROP},
}
CONTAINER_STATUS = {"in-progress": "in-progress", "done": "done", "cancelled": "dropped", "dropped": "dropped"}
STORY_KEY = re.compile(r"^(\d+)-(\d+[a-z]?)-(.+)$")
EPIC_KEY = re.compile(r"^epic-(\d+)$")
RETRO_KEY = re.compile(r"^epic-(\d+)-retrospective$")
BUG_KEY = re.compile(r"^bug-(.+)$")
VALIDATION_FILE = re.compile(r"^(?:story-)?(\d+)-(\d+[a-z]?)-validation-report(?:-\d+)?(?:-plan)?\.md$")
VALIDATION_PLAN = re.compile(r"^story-validation-report(?:-\d+)?-plan\.md$")
VALIDATION_KEY = re.compile(r"^(\d+)-(\d+[a-z]?)-validation-report$")
FRONTMATTER = re.compile(r"\A---\r?\n(.*?)\r?\n---(?:\r?\n|\Z)", re.S)
LEAF = re.compile(r"^(story|spike|bug)-(.+)\.md$")
TOP_KEY = re.compile(r"^([A-Za-z_][A-Za-z0-9_-]*):\s*(?:#.*)?$")
SKILL_REPLACEMENTS = (
    ("my-next-issue", 'ask `bmad-agent-po` "what\'s next"'),
    ("create-bug-story", 'ask `bmad-agent-po` to "file a bug"'),
    ("sprint-status-view", "`bmad-agent-po`'s board, or `tickets.py status`"),
    ("story-status-lookup", "`tickets.py find <ref>` and the plan's `status`"),
    ("generate-backlog", "`bmad-agent-po` writes and orders entries in `tickets.toml` and `backlog/`"),
    ("prioritize-backlog", "`bmad-agent-po` reorders `tickets.toml` (build order) with the user"),
    ("add-sprint", "none: work is ordered by `tickets.toml` build order and `after`"),
    ("modify-sprint", "none: work is ordered by `tickets.toml` build order and `after`"),
    ("add-to-sprint", "none: `bmad-agent-po` starts the next ready ticket"),
    ("remove-from-sprint", "none: `bmad-agent-po` drops or reorders the entry"),
    ("close-sprint", "none: done tickets stay in the tree and their plans hold status"),
    ("cleanup-done", "none: done tickets stay in the tree and their plans hold status"),
    ("bmad-sprint-planning", "`bmad-agent-po` (slice an initiative into epics and stories)"),
    ("bmad-sprint-status", "`bmad-agent-po`'s board; `tickets.py status`"),
    ("bmad-dev-story", "`bmad-build` / `bmad-build-auto`"),
)


class MigrationError(RuntimeError):
    pass


# ---------------------------------------------------------------- small file helpers


def read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def frontmatter(text: str) -> dict:
    m = FRONTMATTER.match(text)
    if not m:
        return {}
    try:
        data = yaml.safe_load(m.group(1))
    except yaml.YAMLError:
        return {}
    return data if isinstance(data, dict) else {}


def newline_of(text: str) -> str:
    return "\r\n" if "\r\n" in text else "\n"


def title_from_slug(slug: str) -> str:
    words = slug.replace("_", "-").split("-")
    words = [w for w in words if w]
    return (" ".join(words)).capitalize() if words else slug


def quoted(value: str) -> str:
    return "'" + value.replace("'", "''") + "'"


def toml_str(value: str) -> str:
    return '"' + value.replace("\\", "\\\\").replace('"', '\\"') + '"'


def toml_id(ticket_id: str) -> str:
    return ticket_id if ticket_id.isdigit() else toml_str(ticket_id)


def unique_path(path: Path) -> Path:
    """The path itself when free, else the first `<stem>-<n><suffix>` that is."""
    if not path.exists():
        return path
    n = 1
    while True:
        candidate = path.with_name(f"{path.stem}-{n}{path.suffix}")
        if not candidate.exists():
            return candidate
        n += 1


# ---------------------------------------------------------------- the run


class Run:
    def __init__(self, root: Path, output: Path, dry_run: bool) -> None:
        self.root = root
        self.output = output
        self.dry_run = dry_run
        self.stamp = datetime.now().strftime("%Y%m%d-%H%M%S")
        self.backup_dir = root / ".mv6" / self.stamp
        self.backups: list[tuple[Path, Path]] = []
        self.created: set[Path] = set()  # files this run wrote from scratch: a later change needs no backup
        self.lines: list[str] = []  # the report body
        self.counts = {"written": 0, "changed": 0, "archived": 0, "joined": 0, "dropped": 0, "mapped": 0, "present": 0, "skipped": 0, "unmapped": 0}

    # -- reporting
    def say(self, kind: str, text: str) -> None:
        self.lines.append(f"- {kind}: {text}")
        if kind in self.counts:
            self.counts[kind] += 1

    def rel(self, path: Path) -> str:
        try:
            return path.relative_to(self.root).as_posix()
        except ValueError:
            return path.as_posix()

    # -- writes, all through here
    def backup(self, path: Path) -> None:
        """Copy a file that is about to change to `.mv6/<run>/<hash><suffix>`; the index maps it back."""
        if self.dry_run or not path.exists() or path in self.created:
            return
        digest = hashlib.sha256(str(path.relative_to(self.root)).encode("utf-8")).hexdigest()[:10]
        copy = self.backup_dir / f"{digest}{path.suffix}"
        if copy.exists():
            return
        self.backup_dir.mkdir(parents=True, exist_ok=True)
        if not (self.backup_dir / ".gitignore").exists():
            (self.backup_dir / ".gitignore").write_text("*\n", encoding="utf-8")
        shutil.copy2(path, copy)
        with (self.backup_dir / "index.txt").open("a", encoding="utf-8") as index:
            index.write(f"{copy.name}\t{self.rel(path)}\n")
        self.backups.append((path, copy))

    def write_new(self, path: Path, text: str, what: str) -> Path:
        """Create a file that must not exist; a taken name gets a numeric suffix and a report line."""
        target = unique_path(path)
        if target != path:
            self.say("collision", f"`{self.rel(path)}` exists; {what} written as `{self.rel(target)}`")
        self.say("written", f"`{self.rel(target)}` ({what})")
        self.created.add(target)
        if not self.dry_run:
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_text(text, encoding="utf-8", newline="")
        return target

    def change(self, path: Path, text: str, what: str) -> None:
        current = read_text(path)
        if current == text:
            return
        self.say("changed", f"`{self.rel(path)}` ({what})")
        self.backup(path)
        if not self.dry_run:
            path.write_text(text, encoding="utf-8", newline="")

    def move(self, src: Path, dst: Path, what: str) -> None:
        target = unique_path(dst)
        if target != dst:
            self.say("collision", f"`{self.rel(dst)}` exists; {what} moved as `{self.rel(target)}`")
        self.say("archived", f"`{self.rel(src)}` -> `{self.rel(target)}` ({what})")
        self.backup(src) if src.is_file() else None
        if not self.dry_run:
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.move(str(src), str(target))


# ---------------------------------------------------------------- the tree


class Tree:
    """The initiative's epics, entries, leaf files and plans, as this script needs them."""

    def __init__(self, initiative: Path, backlog: Path) -> None:
        self.initiative = initiative
        self.backlog = backlog
        self.epics: dict[int, Path] = {}  # epic id -> epic folder
        self.entries: dict[tuple[int, str], dict] = {}  # (epic id, entry id) -> {"folder", "v6_key", "title", "type"}
        self.by_v6: dict[str, str] = {}  # v6_key -> where
        self.plans: dict[tuple[str, str], Path] = {}  # (folder name, ticket) -> plan path
        self.leaves: dict[tuple[str, str], Path] = {}  # (folder name, stem) -> leaf path
        self.load()

    def tickets_dir(self, folder: Path) -> Path:
        """Where a folder's `tickets.toml`, leaf files and plans are: the folder itself for `backlog/` (no file of
        its own), `<folder>/tickets/` for an initiative or an epic, existing or about to be created."""
        return folder if folder == self.backlog else folder / "tickets"

    def load(self) -> None:
        breakdown = self.tickets_dir(self.initiative) / "tickets.toml"
        if breakdown.is_file():
            try:
                data = tomllib.loads(read_text(breakdown))
            except tomllib.TOMLDecodeError as e:
                raise MigrationError(f"{breakdown}: {e}") from e
            for epic in data.get("epic", []):
                if isinstance(epic.get("id"), int) and isinstance(epic.get("slug"), str):
                    folder = self.tickets_dir(self.initiative) / epic["slug"]
                    self.epics[epic["id"]] = folder
        for epic_id, folder in self.epics.items():
            self.load_folder(folder, epic_id)
        if self.backlog.is_dir():
            self.load_folder(self.backlog, None)

    def load_folder(self, folder: Path, epic_id: int | None) -> None:
        tickets = self.tickets_dir(folder)
        breakdown = tickets / "tickets.toml"
        if breakdown.is_file():
            try:
                data = tomllib.loads(read_text(breakdown))
            except tomllib.TOMLDecodeError as e:
                raise MigrationError(f"{breakdown}: {e}") from e
            for entry in data.get("entry", []):
                eid = str(entry.get("id", ""))
                if not eid or epic_id is None:
                    continue
                row = {"folder": folder, "v6_key": entry.get("v6_key"), "title": entry.get("title", ""), "type": entry.get("type", "story")}
                self.entries[(epic_id, eid)] = row
                if isinstance(entry.get("v6_key"), str):
                    self.by_v6[entry["v6_key"]] = f"entry {eid} in {folder.name}"
        if not tickets.is_dir():
            return
        for path in sorted(tickets.glob("*.md")):
            fm = frontmatter(read_text(path))
            if "ticket" in fm and fm.get("type") not in ("story", "spike", "bug"):
                self.plans[(folder.name, str(fm["ticket"]))] = path
                if isinstance(fm.get("v6_key"), str):
                    self.by_v6[fm["v6_key"]] = f"plan {path.name} in {folder.name}"
            elif LEAF.match(path.name):
                self.leaves[(folder.name, path.stem)] = path
                if isinstance(fm.get("v6_key"), str):
                    self.by_v6[fm["v6_key"]] = f"{path.name} in {folder.name}"
                if epic_id is not None and fm.get("id") is not None:
                    self.entries.setdefault((epic_id, str(fm["id"])), {"folder": folder, "v6_key": fm.get("v6_key"), "title": fm.get("title", ""), "type": fm.get("type")})

    def plan_for(self, folder: Path, ticket: str) -> Path | None:
        return self.plans.get((folder.name, ticket))


# ---------------------------------------------------------------- the tracker


def read_tracker(path: Path) -> tuple[dict, str]:
    text = read_text(path)
    try:
        data = yaml.safe_load(text)
    except yaml.YAMLError as e:
        raise MigrationError(f"{path}: not valid YAML: {e}") from e
    if not isinstance(data, dict):
        raise MigrationError(f"{path}: the tracker is not a mapping")
    return data, text


def section_text(text: str, key: str) -> str | None:
    """The raw lines of a top-level `key:` section, comments included, so the archive keeps what the tracker wrote."""
    lines = text.splitlines(keepends=True)
    start = None
    for i, line in enumerate(lines):
        m = TOP_KEY.match(line)
        if m and m.group(1) == key and start is None:
            start = i
        elif m and start is not None:
            return "".join(lines[start:i])
    return "".join(lines[start:]) if start is not None else None


def tracking_items(data: dict) -> list[dict]:
    """Every tracked item: `development_status` keys, `backlog` items and `sprints[*].items`, as {key, status, ...}."""
    items: list[dict] = []
    status = data.get("development_status")
    if isinstance(status, dict):
        for key, value in status.items():
            items.append({"key": str(key), "status": str(value or "backlog"), "section": "development_status"})
    backlog = data.get("backlog")
    if isinstance(backlog, list):
        for item in backlog:
            if isinstance(item, dict) and item.get("id"):
                items.append({**item, "key": str(item["id"]), "status": str(item.get("status") or "backlog"), "section": "backlog"})
    sprints = data.get("sprints")
    if isinstance(sprints, dict):
        for name, sprint in sprints.items():
            for item in (sprint or {}).get("items", []) if isinstance(sprint, dict) else []:
                if isinstance(item, dict) and item.get("id"):
                    items.append({**item, "key": str(item["id"]), "status": str(item.get("status") or "backlog"), "section": f"sprints.{name}"})
    return items


# ---------------------------------------------------------------- text edits


def add_v6_key(breakdown_text: str, entry_id: str, v6_key: str) -> str:
    """Append `v6_key = "..."` to the `[[entry]]` table whose `id` is `entry_id`."""
    nl = newline_of(breakdown_text)
    lines = breakdown_text.split(nl)
    out, in_table, done = [], False, False
    i = 0
    while i < len(lines):
        line = lines[i]
        if line.strip() == "[[entry]]":
            in_table = True
            out.append(line)
            i += 1
            continue
        if in_table and not done and re.match(r"^\s*id\s*=", line):
            value = line.split("=", 1)[1].split("#", 1)[0].strip().strip('"')
            out.append(line)
            if value == entry_id:
                out.append(f"v6_key = {toml_str(v6_key)}")
                done = True
                in_table = False
            i += 1
            continue
        out.append(line)
        i += 1
    if not done:
        raise MigrationError(f"entry {entry_id} not found in tickets.toml")
    return nl.join(out)


def entry_table(entry_id: str, kind: str, title: str, v6_key: str, status: str) -> str:
    return (
        "\n[[entry]]\n"
        f"id = {toml_id(entry_id)}\n"
        f'type = "{kind}"\n'
        f"title = {toml_str(title)}\n"
        f"description = {toml_str('Carried over from the ma-agents 3.x tracking key ' + v6_key + ' (3.x status ' + status + ') by the ma-ops migration; its criteria were not in the tracker.')}\n"
        'verify = ""\n'
        "covers = []\n"
        "after = []\n"
        "hitl = false\n"
        'risk = "low"\n'
        f"v6_key = {toml_str(v6_key)}\n"
    )


def plan_text(title: str, ticket: str, status: str, kind: str, note: str) -> str:
    return (
        "---\n"
        f"title: {quoted(title)}\n"
        f"type: '{kind}'\n"
        f"ticket: {quoted(ticket)}\n"
        f"status: '{status}'\n"
        "---\n\n"
        f"# {title}\n\n"
        f"{note}\n"
    )


def leaf_text(kind: str, title: str, v6_key: str, severity: str | None, note: str) -> str:
    lines = ["---", f"type: {kind}", f"title: {quoted(title)}", "covers: []", "after: []", "refined: false", "hitl: false", "risk: low"]
    if kind == "bug":
        lines.append(f"severity: {severity or 'P2'}")
    lines += [f"v6_key: {quoted(v6_key)}", "---", "", f"# {title}", "", "## Description", "", note, ""]
    return "\n".join(lines)


def set_frontmatter_value(text: str, key: str, value: str) -> str:
    m = FRONTMATTER.match(text)
    if not m:
        return text
    block = m.group(1)
    nl = newline_of(text)
    pattern = re.compile(rf"^{re.escape(key)}:.*$", re.M)
    if pattern.search(block):
        new_block = pattern.sub(f"{key}: {value}", block, count=1)
    else:
        new_block = block + nl + f"{key}: {value}"
    return text[: m.start(1)] + new_block + text[m.end(1):]


# ---------------------------------------------------------------- migration of one initiative


def migrate_initiative(run: Run, initiative: Path, backlog: Path) -> None:
    archive = initiative / "archive-v6"
    tracker_path = archive / "sprint-status.yaml"
    run.lines.append(f"\n## {initiative.name}\n")
    run.lines.append(f"- input: `{run.rel(tracker_path)}`")
    data, text = read_tracker(tracker_path)
    tree = Tree(initiative, backlog)
    tickets_root = tree.tickets_dir(initiative)

    for section in ("development_status", "backlog", "sprints"):
        if section not in data:
            run.say("absent", f"the tracker has no `{section}:` section (valid input; nothing to carry from it)")

    # sprints: archived as written
    if "sprints" in data:
        target = archive / "sprints.yaml"
        if target.exists():
            run.say("present", f"`{run.rel(target)}` already holds the `sprints:` section")
        else:
            raw = section_text(text, "sprints") or yaml.safe_dump({"sprints": data["sprints"]}, sort_keys=False)
            run.write_new(target, raw, "the tracker's `sprints:` section")

    # validation reports in the live tree
    live_dirs = [tickets_root, *[tree.tickets_dir(f) for f in tree.epics.values()], backlog]
    for folder in live_dirs:
        if not folder.is_dir():
            continue
        for path in sorted(folder.glob("*.md")):
            if VALIDATION_FILE.match(path.name) or VALIDATION_PLAN.match(path.name):
                run.move(path, archive / path.name, "a review record, not a story or its plan")

    # the items
    seen_keys: set[str] = set()
    for item in tracking_items(data):
        key, status3 = item["key"], item["status"]
        if key in seen_keys:
            continue
        seen_keys.add(key)
        if VALIDATION_KEY.match(key):
            run.say("skipped", f"`{key}` ({item['section']}): a validation report key names a review record, not a story")
            continue
        if RETRO_KEY.match(key):
            run.say("skipped", f"`{key}` ({item['section']}): retrospective keys became `Retrospective:` lines in the method migration")
            continue
        if EPIC_KEY.match(key):
            continue  # epics are handled with their stories
        m = STORY_KEY.match(key)
        if m:
            epic_id, entry_id, slug = int(m.group(1)), m.group(2), m.group(3)
            if tree.epics.get(epic_id) is None and item["section"] != "development_status" and item.get("epic") is None:
                migrate_backlog_item(run, tree, backlog, key, item, status3)
            else:
                migrate_story(run, tree, data, tickets_root, epic_id, entry_id, slug, key, status3, item)
            continue
        b = BUG_KEY.match(key)
        if b or item.get("type") == "bug":
            migrate_bug(run, tree, backlog, key, item, status3)
            continue
        if item["section"] != "development_status":
            migrate_backlog_item(run, tree, backlog, key, item, status3)
            continue
        run.say("unmapped", f"`{key}` ({item['section']}, 3.x status `{status3}`): not an epic, story or bug key; left where the method migration put it")

    # 3.x bug files already in backlog/: statuses tickets.py rejects
    if backlog.is_dir():
        for path in sorted(backlog.glob("*.md")):
            fm = frontmatter(read_text(path))
            status = fm.get("status")
            if isinstance(status, str) and status and status not in STATUSES:
                mapped = PLAN_STATUS.get(status, "draft") or "draft"
                run.say("mapped", f"`{run.rel(path)}` status `{status}` -> `{mapped}` (a value tickets.py accepts)")
                run.change(path, set_frontmatter_value(read_text(path), "status", mapped), f"status {status} -> {mapped}")

    # _bmad/ma-skills
    ma_skills = run.root / "_bmad" / "ma-skills"
    if ma_skills.is_dir():
        run.move(ma_skills, archive / "ma-skills", "the 3.x ma-skills module folder")


def migrate_story(run: Run, tree: Tree, data: dict, tickets_root: Path, epic_id: int, entry_id: str, slug: str, key: str, status3: str, item: dict) -> None:
    mapped = PLAN_STATUS.get(status3)
    if status3 not in PLAN_STATUS:
        run.say("unmapped", f"`{key}`: 3.x status `{status3}` has no mapping; treated as `draft`")
        mapped = "draft"
    where = tree.by_v6.get(key)
    folder = tree.epics.get(epic_id)
    if where is None:
        existing = tree.entries.get((epic_id, entry_id))
        if existing is not None and folder is not None:
            if existing.get("v6_key") and existing["v6_key"] != key:
                run.say("unmapped", f"`{key}`: entry {entry_id} in {folder.name} already carries `v6_key` `{existing['v6_key']}`; not joined")
                return
            breakdown = tree.tickets_dir(folder) / "tickets.toml"
            run.say("joined", f"`{key}` joined by (epic {epic_id}, id {entry_id}) to entry `{existing.get('title') or entry_id}` in {folder.name} (tracking slug `{slug}`, file slug differs); `v6_key` set")
            if breakdown.is_file():
                run.change(breakdown, add_v6_key(read_text(breakdown), entry_id, key), f"v6_key for entry {entry_id}")
            existing["v6_key"] = key
            tree.by_v6[key] = f"entry {entry_id} in {folder.name}"
            where = tree.by_v6[key]
        else:
            if folder is None:
                folder = create_untitled_epic(run, tree, data, tickets_root, epic_id)
            title = str(item.get("title") or title_from_slug(slug))
            kind = "bug" if item.get("type") == "bug" else "story"
            breakdown = tree.tickets_dir(folder) / "tickets.toml"
            run.say("written", f"entry {entry_id} `{title}` in {folder.name} from tracking key `{key}` (3.x status `{status3}`)")
            if status3 in DROP:
                run.say("dropped", f"`{key}`: 3.x status `{status3}` -> plan `status: dropped` (plan created with the entry)")
            table = entry_table(entry_id, kind, title, key, status3)
            if breakdown.is_file():
                run.change(breakdown, read_text(breakdown).rstrip("\n") + "\n" + table, f"entry {entry_id} from {key}")
            else:
                run.write_new(breakdown, "# Written by the ma-ops migration from the 3.x tracking keys.\n" + table, f"breakdown of {folder.name}")
            tree.entries[(epic_id, entry_id)] = {"folder": folder, "v6_key": key, "title": title, "type": kind}
            tree.by_v6[key] = f"entry {entry_id} in {folder.name}"
            if mapped is not None:
                plan = tree.tickets_dir(folder) / f"{kind}-{slug}-plan.md"
                note = f"Minimal plan written by the ma-ops migration: the 3.x tracker held `{key}: {status3}` and no build record was joined to it."
                plan = run.write_new(plan, plan_text(title, entry_id, mapped, "bugfix" if kind == "bug" else "feature", note), f"plan for {key}, status {mapped}")
                tree.plans[(folder.name, entry_id)] = plan
            return
    else:
        run.say("present", f"`{key}` is {where}")
    # drop mapping and rejected statuses on an entry that exists
    if folder is None:
        return
    plan = tree.plan_for(folder, entry_id)
    if status3 in DROP:
        if plan is None:
            title = str(tree.entries.get((epic_id, entry_id), {}).get("title") or title_from_slug(slug))
            plan_path = tree.tickets_dir(folder) / f"story-{slug}-plan.md"
            run.say("dropped", f"`{key}`: 3.x status `{status3}` -> plan `status: dropped` (plan created)")
            tree.plans[(folder.name, entry_id)] = run.write_new(plan_path, plan_text(title, entry_id, "dropped", "feature", f"Dropped by the ma-ops migration: the 3.x tracker held `{key}: {status3}`."), f"plan for {key}, status dropped")
        else:
            current = frontmatter(read_text(plan)).get("status")
            if current != "dropped":
                run.say("dropped", f"`{key}`: 3.x status `{status3}` -> `{run.rel(plan)}` status `{current}` -> `dropped`")
                run.change(plan, set_frontmatter_value(read_text(plan), "status", "'dropped'"), f"status {current} -> dropped")
    elif plan is not None:
        current = frontmatter(read_text(plan)).get("status")
        if isinstance(current, str) and current not in STATUSES:
            fixed = PLAN_STATUS.get(current, "draft") or "draft"
            run.say("mapped", f"`{run.rel(plan)}` status `{current}` -> `{fixed}` (a value tickets.py accepts)")
            run.change(plan, set_frontmatter_value(read_text(plan), "status", f"'{fixed}'"), f"status {current} -> {fixed}")


def create_untitled_epic(run: Run, tree: Tree, data: dict, tickets_root: Path, epic_id: int) -> Path:
    slug = f"epic-{epic_id}-untitled"
    folder = tickets_root / slug
    status3 = str((data.get("development_status") or {}).get(f"epic-{epic_id}", "") or "")
    status = CONTAINER_STATUS.get(status3)
    run.say("written", f"epic {epic_id} has no `[[epic]]` row (no `## Epic {epic_id}:` heading in the 3.x epics file): `{slug}/` created; its story ids come from the tracking keys")
    fm = ["---", "type: epic", f"title: 'Epic {epic_id} (untitled in 3.x)'", f"parent: {tree.initiative.name}", "covers: []", "after: []"]
    if status:
        fm.append(f"status: {status}")
    fm += ["risk: low", "---", "", f"# Epic {epic_id} (untitled in 3.x)", "", "## Description", "",
           f"Written by the ma-ops migration: the 3.x tracker tracked stories of epic {epic_id}, but the epics file had no `## Epic {epic_id}:` heading, so the method migration created no epic for it. Its entries carry their tracking keys as `v6_key`.", ""]
    if (folder / f"{slug}.md").is_file():
        run.say("present", f"`{run.rel(folder / f'{slug}.md')}` already exists; kept as the epic's file")
    else:
        run.write_new(folder / f"{slug}.md", "\n".join(fm), f"epic {epic_id} envelope")
    breakdown = tickets_root / "tickets.toml"
    row = f"\n[[epic]]\nid = {epic_id}\nslug = {toml_str(slug)}\ntitle = {toml_str(f'Epic {epic_id} (untitled in 3.x)')}\ncovers = []\n"
    if breakdown.is_file():
        run.change(breakdown, read_text(breakdown).rstrip("\n") + "\n" + row, f"[[epic]] row for {slug}")
    else:
        run.write_new(breakdown, "# Written by the ma-ops migration.\n" + row, "the initiative breakdown")
    if not run.dry_run:
        (folder / "tickets").mkdir(parents=True, exist_ok=True)
    tree.epics[epic_id] = folder
    return folder


def migrate_bug(run: Run, tree: Tree, backlog: Path, key: str, item: dict, status3: str) -> None:
    slug = key[4:] if key.startswith("bug-") else key
    stem = f"bug-{slug}"
    mapped = PLAN_STATUS.get(status3)
    if status3 not in PLAN_STATUS:
        run.say("unmapped", f"`{key}`: 3.x status `{status3}` has no mapping; treated as `draft`")
        mapped = "draft"
    leaf = tree.leaves.get(("backlog", stem))
    if leaf is None:
        title = str(item.get("title") or title_from_slug(slug))
        severity = item.get("severity")
        sev = {"critical": "P0", "high": "P1", "medium": "P2", "low": "P3"}.get(str(severity).lower(), None) if severity else None
        note = f"Carried over from the ma-agents 3.x tracking key `{key}` (3.x status `{status3}`) by the ma-ops migration; the 3.x bug file was not found in `backlog/`."
        leaf = run.write_new(backlog / f"{stem}.md", leaf_text("bug", title, key, sev, note), f"bug from tracking key {key}")
        tree.leaves[("backlog", stem)] = leaf
        tree.by_v6[key] = f"{leaf.name} in backlog"
    else:
        text = read_text(leaf)
        fm = frontmatter(text)
        if fm.get("v6_key") != key:
            run.say("joined", f"`{key}` joined to `{run.rel(leaf)}`; `v6_key` set")
            run.change(leaf, set_frontmatter_value(text, "v6_key", quoted(key)), f"v6_key {key}")
        else:
            run.say("present", f"`{key}` is `{run.rel(leaf)}`")
        title = str(fm.get("title") or title_from_slug(slug))
    plan = tree.plan_for(backlog, stem)
    if status3 in DROP:
        if plan is None:
            run.say("dropped", f"`{key}`: 3.x status `{status3}` -> plan `status: dropped` (plan created)")
            tree.plans[("backlog", stem)] = run.write_new(backlog / f"{stem}-plan.md", plan_text(title, stem, "dropped", "bugfix", f"Dropped by the ma-ops migration: the 3.x tracker held `{key}: {status3}`."), f"plan for {key}, status dropped")
        else:
            current = frontmatter(read_text(plan)).get("status")
            if current != "dropped":
                run.say("dropped", f"`{key}`: 3.x status `{status3}` -> `{run.rel(plan)}` status `{current}` -> `dropped`")
                run.change(plan, set_frontmatter_value(read_text(plan), "status", "'dropped'"), f"status {current} -> dropped")
    elif plan is None and mapped is not None:
        leaf_status = frontmatter(read_text(leaf)).get("status") if leaf.exists() else None
        if leaf_status in STATUSES:
            return  # the leaf's own accepted status stands when no plan exists
        run.say("mapped", f"`{key}`: 3.x status `{status3}` -> plan `status: {mapped}` (plan created)")
        tree.plans[("backlog", stem)] = run.write_new(backlog / f"{stem}-plan.md", plan_text(title, stem, mapped, "bugfix", f"Minimal plan written by the ma-ops migration from the 3.x tracker (`{key}: {status3}`)."), f"plan for {key}, status {mapped}")


def migrate_backlog_item(run: Run, tree: Tree, backlog: Path, key: str, item: dict, status3: str) -> None:
    """A `backlog:` or sprint item whose epic the tree does not hold: a standalone leaf in backlog/."""
    kind = "bug" if item.get("type") == "bug" else ("spike" if item.get("type") == "spike" else "story")
    m = STORY_KEY.match(key)
    slug = m.group(3) if m else key
    stem = f"{kind}-{slug}"
    if key in tree.by_v6:
        run.say("present", f"`{key}` is {tree.by_v6[key]}")
        return
    mapped = PLAN_STATUS.get(status3)
    if status3 not in PLAN_STATUS:
        run.say("unmapped", f"`{key}`: 3.x status `{status3}` has no mapping; treated as `draft`")
        mapped = "draft"
    title = str(item.get("title") or title_from_slug(slug))
    note = f"Carried over from the ma-agents 3.x `{item['section']}` item `{key}` (3.x status `{status3}`) by the ma-ops migration."
    leaf = run.write_new(backlog / f"{stem}.md", leaf_text(kind, title, key, None, note), f"{kind} from {item['section']} item {key}")
    tree.leaves[("backlog", leaf.stem)] = leaf
    tree.by_v6[key] = f"{leaf.name} in backlog"
    if status3 in DROP:
        run.say("dropped", f"`{key}`: 3.x status `{status3}` -> plan `status: dropped` (plan created with the leaf)")
    if mapped is not None:
        tree.plans[("backlog", leaf.stem)] = run.write_new(backlog / f"{leaf.stem}-plan.md", plan_text(title, leaf.stem, mapped, "bugfix" if kind == "bug" else "feature", f"Minimal plan written by the ma-ops migration from the 3.x tracker (`{key}: {status3}`)."), f"plan for {key}, status {mapped}")


# ---------------------------------------------------------------- report and entry point


def report_text(run: Run, initiatives: list[Path]) -> str:
    head = [
        "---",
        "type: migration",
        "title: 'ma-ops migration 1: 3.x tracking data into the ticket tree'",
        "status: done",
        f"created: '{run.stamp[:8]}'",
        "---",
        "",
        "# ma-ops migration 1: 3.x tracking data into the ticket tree",
        "",
        f"Run `{run.stamp}` by `migrate_v6_backlog.py` on {', '.join(i.name for i in initiatives)}. "
        f"Backups of every changed file: `{run.rel(run.backup_dir)}/` (its `index.txt` maps each copy to its source); nothing was overwritten or deleted.",
        "",
        "Counts: " + ", ".join(f"{k} {v}" for k, v in run.counts.items()) + ".",
        "",
        "## Verification",
        "",
        "Filled in by `bmad migrate` from the `checklist` of `bmod-ma-ops/migration-1.toml`.",
        "",
        "## Removed 3.x skills",
        "",
        "| 3.x skill | 4.x replacement |",
        "|---|---|",
        *[f"| `{skill}` | {replacement} |" for skill, replacement in SKILL_REPLACEMENTS],
        "",
        "## Items",
    ]
    return "\n".join(head + run.lines) + "\n"


def resolve_output(root: Path, given: str | None) -> Path:
    if given:
        path = Path(given)
        return (root / path).resolve() if not path.is_absolute() else path
    script = root / "_bmad" / "scripts" / "resolve_config.py"
    if not script.is_file():
        raise MigrationError(f"{script} is missing; pass --output-folder")
    uv = shutil.which("uv")
    if uv is None:
        raise MigrationError("uv is not on PATH; pass --output-folder")
    result = subprocess.run([uv, "run", "--no-cache", str(script), "--project-root", str(root), "--key", "core.output_folder"],
                            capture_output=True, text=True, encoding="utf-8", check=False)
    if result.returncode != 0:
        raise MigrationError(f"resolve_config.py exited {result.returncode}: {result.stderr.strip()}")
    value = json.loads(result.stdout).get("core.output_folder", "_bmad-output")
    return (root / str(value).replace("{project-root}", str(root))).resolve()


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--project-root", required=True, type=Path)
    parser.add_argument("--output-folder", help="core.output_folder; default: resolve_config.py")
    parser.add_argument("--initiative", help="one initiative folder name; default: every initiative holding archive-v6/sprint-status.yaml")
    parser.add_argument("--dry-run", action="store_true", help="report what would change; write nothing")
    parser.add_argument("--json", action="store_true", help="print the counts as JSON on the last line")
    args = parser.parse_args(argv)
    root = args.project_root.resolve()
    try:
        output = resolve_output(root, args.output_folder)
        candidates = [output / args.initiative] if args.initiative else sorted(p for p in output.glob("initiative-*") if p.is_dir())
        initiatives = [p for p in candidates if (p / "archive-v6" / "sprint-status.yaml").is_file()]
        if not initiatives:
            print(f"nothing to migrate: no initiative under {output} holds archive-v6/sprint-status.yaml (run `bmad migrate method` first)")
            return 2
        run = Run(root, output, args.dry_run)
        backlog = output / "backlog"
        for initiative in initiatives:
            migrate_initiative(run, initiative, backlog)
    except MigrationError as e:
        print(f"error: {e}", file=sys.stderr)
        return 1
    changed = run.counts["written"] + run.counts["changed"] + run.counts["archived"] > 0
    report = output / "migration-v6-v7" / "ma-ops-migration-1.md"
    if args.dry_run:
        print("dry run: nothing written\n")
    elif changed or not report.exists():
        report.parent.mkdir(parents=True, exist_ok=True)
        report.write_text(report_text(run, initiatives), encoding="utf-8", newline="")
    for line in run.lines:
        print(line)
    print()
    print("counts: " + ", ".join(f"{k} {v}" for k, v in run.counts.items()))
    if not args.dry_run:
        print(f"report: {report}" + ("" if changed else " (unchanged: nothing to write this run)"))
        if run.backups:
            print(f"backups: {run.backup_dir} ({len(run.backups)} file(s))")
    if args.json:
        print(json.dumps({**run.counts, "dry_run": args.dry_run, "report": str(report), "backup_dir": str(run.backup_dir) if run.backups else None}))
    return 0


if __name__ == "__main__":
    if sys.platform == "win32":
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    raise SystemExit(main())
