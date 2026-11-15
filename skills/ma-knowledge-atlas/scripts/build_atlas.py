#!/usr/bin/env python3
# /// script
# requires-python = ">=3.11"
# ///
"""Build the Knowledge Atlas of a BMAD v7 initiative store (ma-agents Story 37.4; FR305).

Reads, under the output folder, every `initiative-*/` envelope, every `tickets/**/tickets.toml` and the
`status` of every `*-plan.md`, plus the `backlog/` folder of standalone leaves, and nothing from a v6
tracker: no YAML, JSON or TOML file is copied to the engine, the `archive-v6/` folder a migration leaves
is skipped, and the engine runs on a staged copy of the store, never on the project itself, so it cannot
open a configuration file of the project. The staged copy holds the store's Markdown and diagram files
unchanged and, per initiative, a ticket board page plus one page per ticket carrying its plan status,
all written from the breakdown tables and the plans. The engine (`assets/atlas.cjs`, the Epic 29
Knowledge Atlas engine, run with `node`) renders the staged copy to a self-contained HTML site, which
replaces the output folder named with `--out`.

Usage:
  uv run --no-cache build_atlas.py --project-root DIR --output-folder DIR --out DIR [--engine FILE]
      [--stage DIR] [--node PATH]
The configuration values (`core.output_folder`, `modules.ma-knowledge.atlas_output`) are resolved by the
workflow through resolve_config.py and passed here as printed (`{project-root}` is expanded here, a relative
path is relative to the project root); this script opens no configuration file.
Exit: 0 the Atlas was written (its index.html path is the first stdout line), 1 the engine or the store
failed, 2 a prerequisite is missing or `--out` is refused.
"""

from __future__ import annotations

import argparse
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

# The ticket vocabulary of `tickets.py` at the pinned BMAD-METHOD commit (ma-agents `bmadRef.core`), restated
# here so the Atlas labels a ticket as the board does; a plan status outside it is shown verbatim and listed as a
# problem, as `tickets.py status` lists it.
STATUSES = ("draft", "ready-for-dev", "in-progress", "in-review", "built", "done", "blocked", "dropped")
STATES = ("backlog", "in-progress", "review", "done", "dropped")
CONTAINER_STATUSES = ("in-progress", "done", "dropped")
STATE_OF = {
    "": "backlog",
    "draft": "backlog",
    "ready-for-dev": "backlog",
    "in-progress": "in-progress",
    "blocked": "in-progress",
    "in-review": "review",
    "built": "review",
    "done": "done",
    "dropped": "dropped",
}
LEAF_TYPES = ("story", "spike", "bug")
NO_PLAN = "no plan"

BREAKDOWN = "tickets.toml"
TICKETS = "tickets"
BACKLOG = "backlog"
ARCHIVE = "archive-v6"
BOARD = "ticket-board.md"
STAGE_STORE = "_bmad-output"  # the folder the engine scans when it is given no configuration
STAGE_SITE = "atlas"
NAME_RE = re.compile(r"^(story|spike|bug)-(.+)\.md$")
PLAN_RE = re.compile(r"^(.+)-plan\.md$")
EPIC_RE = re.compile(r"^epic-[^/]+$")
INITIATIVE_RE = re.compile(r"^initiative-[^/]+$")
FRONTMATTER_RE = re.compile(r"\A---\r?\n(.*?)\r?\n---(?:\r?\n|\Z)", re.S)
ID_RE = re.compile(r"^[0-9A-Za-z]+$")
SKIPPED_SUFFIXES = {".yaml", ".yml", ".json", ".toml"}  # tracker and configuration formats; never shown


class Prerequisite(RuntimeError):
    pass


class StoreError(RuntimeError):
    pass


# ---------------------------------------------------------------- reading


def read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8-sig")


def _scalar(raw: str):
    """A frontmatter value as `tickets.py` reads it: quotes removed, a trailing comment dropped, `[a, b]` a list."""
    raw = raw.strip()
    if raw[:1] in ("'", '"'):
        quote = raw[0]
        end = raw.find(quote, 1)
        while quote == "'" and end != -1 and raw[end + 1 : end + 2] == "'":
            end = raw.find(quote, end + 2)
        return raw[1:end].replace("''", "'") if end != -1 else raw[1:]
    if raw.startswith("["):
        end = raw.find("]")
        inner = raw[1:end] if end != -1 else raw[1:]
        return [_scalar(item) for item in inner.split(",") if item.strip()]
    cut = raw.find(" #")
    if cut != -1:
        raw = raw[:cut].rstrip()
    return raw


def parse_frontmatter(text: str) -> dict:
    """The `key: value` lines of a leading `---` block; nested YAML is not needed by any file read here."""
    m = FRONTMATTER_RE.match(text)
    if not m:
        return {}
    data: dict = {}
    for line in m.group(1).splitlines():
        if not line.strip() or line.lstrip().startswith("#") or line[:1] in (" ", "\t", "-"):
            continue
        key, sep, rest = line.partition(":")
        if not sep or not key.strip():
            continue
        data[key.strip()] = _scalar(rest) if rest.strip() else ""
    return data


def _id(value):
    if isinstance(value, bool):
        return None
    if isinstance(value, int):
        return value
    if isinstance(value, str) and ID_RE.match(value) and value not in ("true", "false"):
        return int(value) if value.isdigit() else value
    return None


def tickets_dir(folder: Path) -> Path:
    """`<folder>/tickets/` for an initiative or an epic, the folder itself for a backlog."""
    if not (folder / f"{folder.name}.md").is_file() and not (folder / TICKETS).is_dir():
        return folder
    return folder / TICKETS


def load_breakdown(folder: Path, problems: list[str]) -> dict:
    path = tickets_dir(folder) / BREAKDOWN
    if not path.is_file():
        return {}
    try:
        data = tomllib.loads(read_text(path))
    except tomllib.TOMLDecodeError as e:
        problems.append(f"{folder.name}/{TICKETS}/{BREAKDOWN}: {e}; its tables are skipped")
        return {}
    for table in ("initiative", "epic", "entry"):
        rows = data.get(table)
        if rows is not None and not (isinstance(rows, list) and all(isinstance(r, dict) for r in rows)):
            problems.append(f"{folder.name}/{TICKETS}/{BREAKDOWN}: `[[{table}]]` is not a list of tables; skipped")
            data[table] = []
    return data


def load_container(folder: Path, problems: list[str]) -> dict:
    """An initiative's or an epic's own file: its title and status."""
    path = folder / f"{folder.name}.md"
    fm = parse_frontmatter(read_text(path)) if path.is_file() else {}
    status = str(fm.get("status", "") or "")
    if status and status not in CONTAINER_STATUSES:
        problems.append(f"{folder.name}/{path.name}: status {status!r} is not one of {', '.join(CONTAINER_STATUSES)}")
    return {
        "slug": folder.name,
        "file": path.name if path.is_file() else "",
        "title": str(fm.get("title", "") or folder.name),
        "type": str(fm.get("type", "") or ""),
        "status": status,
    }


def _listed(value) -> list[str]:
    return [str(v) for v in value] if isinstance(value, list) else []


def load_folder(folder: Path, problems: list[str]) -> list[dict]:
    """One row per ticket of an epic or backlog folder: every breakdown entry joined to its leaf file, then the
    leaf files the breakdown does not list; each plan then sets the status of the one row its `ticket` names."""
    where = folder.name
    rows: dict = {}
    for e in load_breakdown(folder, problems).get("entry", []):
        n = _id(e.get("id"))
        if n is None:
            problems.append(f"{where}/{TICKETS}/{BREAKDOWN}: an entry without an id; skipped")
            continue
        if n in rows:
            problems.append(f"{where}/{TICKETS}/{BREAKDOWN}: two entries with id {n}; the second is skipped")
            continue
        rows[n] = {
            "epic": where,
            "id": n,
            "type": str(e.get("type", "") or ""),
            "title": str(e.get("title", "") or ""),
            "description": str(e.get("description", "") or ""),
            "verify": str(e.get("verify", "") or ""),
            "covers": _listed(e.get("covers")),
            "after": [str(a) for a in e.get("after", [])] if isinstance(e.get("after"), list) else [],
            "risk": str(e.get("risk", "") or ""),
            "hitl": str(e.get("hitl", "")).lower() == "true",
            "unknown": str(e.get("unknown", "") or ""),
            "file": "",
            "plan": "",
            "status": "",
            "tracker_status": "",
            "state": "planned",  # an entry with no leaf file and no plan, as `tickets.py status` reports it
        }
    unlisted: list[dict] = []
    plans: list[tuple[str, dict]] = []
    for path in sorted(tickets_dir(folder).glob("*.md")):
        fm = parse_frontmatter(read_text(path))
        if fm.get("type") not in LEAF_TYPES:
            if "ticket" in fm:
                plans.append((path.name, fm))
            continue
        n = _id(fm.get("id"))
        row = rows.get(n) if n is not None else None
        if row is None:
            row = {
                "epic": where, "id": n, "type": str(fm.get("type")), "title": "", "description": "", "verify": "",
                "covers": [], "after": [], "risk": "", "hitl": False, "unknown": "", "plan": "", "tracker_status": "",
                "state": "",
            }
            unlisted.append(row)
        row.update(
            {
                "file": path.name,
                "title": str(fm.get("title", "") or row["title"] or path.stem),
                "status": str(fm.get("status", "") or ""),
                "tracker_status": str(fm.get("tracker_status", "") or ""),
                "covers": _listed(fm.get("covers")) or row["covers"],
                "risk": str(fm.get("risk", "") or row["risk"]),
                "hitl": str(fm.get("hitl", "")).lower() == "true",
            }
        )
    out = list(rows.values()) + unlisted
    for name, fm in plans:
        ticket = fm.get("ticket", "")
        row = None
        if _id(ticket) is not None:
            row = next((r for r in out if r["id"] == _id(ticket)), None)
        if row is None and isinstance(ticket, str) and ticket:
            row = next((r for r in out if r["file"] == f"{ticket}.md"), None)
        if row is None:
            problems.append(f"{where}/{name}: ticket {ticket!r} names no entry or leaf file in {where}; skipped")
            continue
        if row["plan"]:
            problems.append(f"{where}/{row['plan']} and {name} are both plans for ticket {ticket!r}; {name} is ignored")
            continue
        status = str(fm.get("status", "") or "")
        if status not in STATUSES:
            problems.append(f"{where}/{name}: status {status!r} is not one of {', '.join(STATUSES)}; the ticket reads as blocked")
        row.update({"plan": name, "status": status})
    for row in out:
        if row["file"] or row["plan"]:
            row["state"] = row["tracker_status"] or STATE_OF.get(row["status"], "blocked" if row["status"] else "backlog")
        if not row["title"]:
            row["title"] = f"ticket {row['id']}" if row["id"] is not None else row["file"]
    return out


def load_initiative(folder: Path) -> dict:
    problems: list[str] = []
    container = load_container(folder, problems)
    breakdown = load_breakdown(folder, problems)
    epics: list[dict] = []
    listed = {str(e.get("slug", "")): e for e in breakdown.get("epic", []) if isinstance(e.get("slug"), str)}
    folders = {d.name: d for d in tickets_dir(folder).glob("epic-*") if d.is_dir()}
    for slug, e in listed.items():
        if slug not in folders:
            problems.append(f"{folder.name}/{TICKETS}/{BREAKDOWN}: epic {e.get('id')} names folder {slug!r}, which does not exist")
    order = list(listed) + sorted(s for s in folders if s not in listed)
    for slug in order:
        e = listed.get(slug, {})
        epic_folder = folders.get(slug)
        epic = {
            "slug": slug,
            "id": _id(e.get("id")),
            "title": str(e.get("title", "") or ""),
            "description": str(e.get("description", "") or ""),
            "covers": _listed(e.get("covers")),
            "status": "",
            "file": "",
            "rows": [],
        }
        if epic_folder is not None:
            own = load_container(epic_folder, problems)
            epic.update(status=own["status"], file=own["file"], title=epic["title"] or own["title"])
            epic["rows"] = load_folder(epic_folder, problems)
        epic["title"] = epic["title"] or slug
        epics.append(epic)
    children = [
        {"slug": str(c.get("slug", "")), "id": _id(c.get("id")), "title": str(c.get("title", "") or ""),
         "description": str(c.get("description", "") or "")}
        for c in breakdown.get("initiative", [])
    ]
    own_rows = load_folder(folder, problems) if "entry" in breakdown or not epics else []
    return {**container, "epics": epics, "children": children, "rows": own_rows, "problems": problems}


def load_store(output_folder: Path) -> dict:
    initiatives = [load_initiative(d) for d in sorted(output_folder.glob("initiative-*")) if d.is_dir()]
    by_slug = {i["slug"]: i for i in initiatives}
    for i in initiatives:
        for c in i["children"]:
            child = by_slug.get(c["slug"])
            c["status"] = child["status"] if child else ""
            c["title"] = c["title"] or (child["title"] if child else c["slug"])
            if child is None:
                i["problems"].append(f"{i['slug']}/{TICKETS}/{BREAKDOWN}: child initiative {c['slug']!r} is not a folder beside it")
    backlog = output_folder / BACKLOG
    backlog_problems: list[str] = []
    backlog_rows = load_folder(backlog, backlog_problems) if backlog.is_dir() else []
    return {"initiatives": initiatives, "backlog": backlog_rows, "backlog_problems": backlog_problems}


# ---------------------------------------------------------------- staging


def _rel(path: Path, base: Path) -> str:
    return path.relative_to(base).as_posix()


def copy_store(output_folder: Path, stage_store: Path, excluded: list[Path]) -> int:
    """The store's Markdown, diagram and image files, copied unchanged: every `initiative-*/` and the `backlog/`
    folder, without `archive-v6/`, hidden entries, tracker or configuration formats, and the Atlas folder itself."""
    count = 0
    roots = [d for d in sorted(output_folder.iterdir()) if d.is_dir() and (INITIATIVE_RE.match(d.name) or d.name == BACKLOG)]
    for root in roots:
        for dirpath, dirnames, filenames in os.walk(root):
            here = Path(dirpath)
            dirnames[:] = sorted(
                d for d in dirnames
                if d != ARCHIVE and not d.startswith(".") and not any((here / d).resolve() == x for x in excluded)
            )
            for name in sorted(filenames):
                if name.startswith(".") or Path(name).suffix.lower() in SKIPPED_SUFFIXES:
                    continue
                src = here / name
                dst = stage_store / src.relative_to(output_folder)
                dst.parent.mkdir(parents=True, exist_ok=True)
                shutil.copyfile(src, dst)
                count += 1
    return count


def _cell(text: str) -> str:
    return str(text).replace("|", "\\|").replace("\n", " ").strip()


def _slug(text: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", str(text).lower()).strip("-")[:60].rstrip("-") or "ticket"


def ticket_ref(epic: dict | None, row: dict) -> str:
    if epic is not None and epic["id"] is not None and row["id"] is not None:
        return f"Story {epic['id']}.{row['id']}" if row["type"] == "story" else f"{row['type'].capitalize()} {epic['id']}.{row['id']}"
    if row["id"] is not None:
        return f"{row['type'].capitalize()} {row['id']}"
    return row["file"][:-3] if row["file"] else row["title"]


def ticket_page_name(epic: dict | None, row: dict) -> str:
    """`<epic id>-<entry id>-<slug>.md`, the story-file form the engine classifies as a story; `<type>-<slug>.md`
    style names stay for the store's own leaf files."""
    prefix = f"{epic['id']}-" if epic is not None and epic["id"] is not None else "ticket-"
    ident = str(row["id"]) if row["id"] is not None else _slug(row["file"][:-3] if row["file"] else row["title"])
    return f"{prefix}{ident}-{_slug(row['title'])}.md"


def status_shown(row: dict) -> str:
    return row["status"] or NO_PLAN


def write_ticket_page(folder: Path, epic: dict | None, row: dict, parent_ref: str) -> str:
    name = ticket_page_name(epic, row)
    lines = [
        "---",
        f"title: {json.dumps(row['title'], ensure_ascii=False)}",
        f"type: {row['type'] or 'ticket'}",
        f"status: {row['status'] or ''}",
        f"state: {row['state']}",
        "---",
        "",
        f"# {ticket_ref(epic, row)}: {row['title']}",
        "",
        f"- **Status:** `{status_shown(row)}` (board state: `{row['state']}`)",
        f"- **Type:** {row['type'] or 'ticket'}",
        f"- **Parent:** {parent_ref}",
    ]
    if row["plan"]:
        lines.append(f"- **Plan:** [{row['plan']}]({row['plan']})")
    else:
        lines.append(f"- **Plan:** none yet (no `*-plan.md` names this ticket; the board state is `{row['state']}`)")
    if row["file"]:
        lines.append(f"- **Ticket file:** [{row['file']}]({row['file']})")
    if row["covers"]:
        lines.append(f"- **Covers:** {', '.join(row['covers'])}")
    if row["after"]:
        lines.append(f"- **After:** {', '.join(row['after'])}")
    if row["risk"]:
        lines.append(f"- **Risk:** {row['risk']}")
    lines.append(f"- **Human in the loop:** {'yes' if row['hitl'] else 'no'}")
    if row["unknown"]:
        lines.append(f"- **Unknown:** {row['unknown']}")
    if row["description"]:
        lines += ["", "## Description", "", row["description"]]
    if row["verify"]:
        lines += ["", "## Verify", "", row["verify"]]
    folder.mkdir(parents=True, exist_ok=True)
    (folder / name).write_text("\n".join(lines) + "\n", encoding="utf-8", newline="\n")
    return name


def rows_table(epic: dict | None, rows: list[dict], page_dir: str) -> list[str]:
    lines = ["| Ticket | Title | Status | State | Plan |", "|---|---|---|---|---|"]
    for row in rows:
        page = f"{page_dir}/{ticket_page_name(epic, row)}" if page_dir else ticket_page_name(epic, row)
        plan = f"[{row['plan']}]({page_dir}/{row['plan']})" if row["plan"] and page_dir else (f"[{row['plan']}]({row['plan']})" if row["plan"] else "—")
        lines.append(
            f"| [{_cell(ticket_ref(epic, row))}]({page}) | {_cell(row['title'])} | `{status_shown(row)}` | `{row['state']}` | {plan} |"
        )
    return lines


def write_boards(store: dict, stage_store: Path) -> dict:
    counts = {"initiatives": 0, "epics": 0, "tickets": 0, "problems": 0}
    for i in store["initiatives"]:
        counts["initiatives"] += 1
        tdir = stage_store / i["slug"] / TICKETS
        lines = [
            "---",
            f"title: {json.dumps('Ticket board of ' + i['title'], ensure_ascii=False)}",
            "---",
            "",
            f"# Ticket board: {i['title']}",
            "",
            f"Initiative `{i['slug']}` — status: `{i['status'] or 'not started'}`"
            + (f" — [{i['file']}](../{i['file']})" if i["file"] else ""),
            "",
            "Read from the initiative's `tickets/tickets.toml`, each epic's own file and breakdown, and the plan of each ticket.",
        ]
        if i["children"]:
            lines += ["", "## Child initiatives", "", "| Initiative | Title | Status |", "|---|---|---|"]
            for c in i["children"]:
                lines.append(f"| [{c['slug']}](../../{c['slug']}/{TICKETS}/{BOARD}) | {_cell(c['title'])} | `{c['status'] or 'not started'}` |")
        for epic in i["epics"]:
            counts["epics"] += 1
            head = f"Epic {epic['id']}: " if epic["id"] is not None else ""
            lines += ["", f"## {head}{epic['title']}", ""]
            lines.append(f"Epic `{epic['slug']}` — status: `{epic['status'] or 'not started'}`" + (f" — [{epic['file']}]({epic['slug']}/{epic['file']})" if epic["file"] else ""))
            if epic["description"]:
                lines += ["", epic["description"]]
            if epic["covers"]:
                lines += ["", f"Covers: {', '.join(epic['covers'])}"]
            if epic["rows"]:
                page_dir = f"{epic['slug']}/{TICKETS}"
                lines += [""] + rows_table(epic, epic["rows"], page_dir)
                for row in epic["rows"]:
                    counts["tickets"] += 1
                    write_ticket_page(tdir / epic["slug"] / TICKETS, epic, row, f"Epic {epic['id']} `{epic['slug']}`" if epic["id"] is not None else f"`{epic['slug']}`")
            else:
                lines += ["", "No tickets planned yet."]
        if i["rows"]:
            lines += ["", "## Tickets of the initiative", ""] + rows_table(None, i["rows"], "")
            for row in i["rows"]:
                counts["tickets"] += 1
                write_ticket_page(tdir, None, row, f"`{i['slug']}`")
        if i["problems"]:
            counts["problems"] += len(i["problems"])
            lines += ["", "## Problems", ""] + [f"- {p}" for p in i["problems"]]
        tdir.mkdir(parents=True, exist_ok=True)
        (tdir / BOARD).write_text("\n".join(lines) + "\n", encoding="utf-8", newline="\n")
    if store["backlog"] or store["backlog_problems"]:
        bdir = stage_store / BACKLOG
        lines = ["---", "title: Ticket board of the backlog", "---", "", "# Ticket board: backlog", "",
                 "Standalone stories, spikes and bugs under `backlog/`, each with its plan status.", ""]
        lines += rows_table(None, store["backlog"], "")
        for row in store["backlog"]:
            counts["tickets"] += 1
            write_ticket_page(bdir, None, row, "`backlog`")
        if store["backlog_problems"]:
            counts["problems"] += len(store["backlog_problems"])
            lines += ["", "## Problems", ""] + [f"- {p}" for p in store["backlog_problems"]]
        bdir.mkdir(parents=True, exist_ok=True)
        (bdir / BOARD).write_text("\n".join(lines) + "\n", encoding="utf-8", newline="\n")
    return counts


def project_title(project_root: Path) -> str:
    pkg = project_root / "package.json"
    try:
        name = json.loads(pkg.read_text(encoding="utf-8")).get("name") if pkg.is_file() else None
        if isinstance(name, str) and name.strip():
            return name.strip()
    except (OSError, ValueError):
        pass
    return project_root.name or "project"


# ---------------------------------------------------------------- publishing


def is_within(child: Path, parent: Path) -> bool:
    try:
        child.relative_to(parent)
        return True
    except ValueError:
        return False


def resolve_under(value: str, project_root: Path) -> Path:
    """A configuration path as resolve_config.py hands it out: `{project-root}` stands for the project root, and a
    relative path is relative to it."""
    expanded = re.sub(r"\{project[-_]root\}", lambda _: project_root.as_posix(), value.strip())
    return (project_root / expanded).resolve()


def long_path(path: Path) -> str:
    """Windows refuses paths beyond 260 characters unless they carry the extended-length prefix; a document page
    name of the Atlas is long, so the site is copied through it. Elsewhere the path is returned as is."""
    text = str(path)
    if sys.platform == "win32" and not text.startswith("\\\\?\\"):
        return "\\\\?\\" + text if not text.startswith("\\\\") else "\\\\?\\UNC\\" + text[2:]
    return text


def check_out(out: Path, project_root: Path, output_folder: Path) -> None:
    """`--out` is replaced whole, so it must be the Atlas folder and nothing else."""
    for name, other in (("the project root", project_root), ("the output folder", output_folder)):
        if out == other:
            raise Prerequisite(f"--out {out} is {name}; the Atlas replaces its folder, so name a folder of its own")
    if is_within(output_folder, out) or is_within(project_root, out):
        raise Prerequisite(f"--out {out} contains the initiative store; name a folder of its own")
    probe = Path(long_path(out))
    if probe.is_dir() and any(probe.iterdir()) and not ((probe / "index.html").is_file() and (probe / "manifest.json").is_file()):
        raise Prerequisite(f"--out {out} is not empty and holds no previous Atlas (index.html + manifest.json); refusing to replace it")
    if probe.exists() and not probe.is_dir():
        raise Prerequisite(f"--out {out} is a file")


def run_engine(node: str, engine: Path, stage: Path, site: Path) -> str:
    env = {k: v for k, v in os.environ.items()}
    result = subprocess.run(
        [node, str(engine), str(stage), "--out", str(site)], cwd=stage, env=env, stdin=subprocess.DEVNULL,
        capture_output=True, text=True, encoding="utf-8", errors="replace", check=False,
    )
    if result.returncode != 0:
        raise StoreError(f"the Atlas engine exited {result.returncode}:\n{(result.stderr or result.stdout).strip()}")
    return result.stderr.strip()


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--project-root", type=Path, required=True, help="folder that holds _bmad/")
    parser.add_argument("--output-folder", required=True, help="core.output_folder as resolve_config.py prints it (`{project-root}` expanded here; a relative path is relative to the project root)")
    parser.add_argument("--out", required=True, help="the Atlas folder, same forms; replaced whole")
    parser.add_argument("--engine", type=Path, default=Path(__file__).resolve().parent.parent / "assets" / "atlas.cjs",
                        help="the engine bundle (default: ../assets/atlas.cjs beside this script)")
    parser.add_argument("--stage", type=Path, help="keep the staged copy the engine reads in this folder (default: a temporary folder, deleted)")
    parser.add_argument("--node", default="node", help="the Node executable (default: node on PATH)")
    args = parser.parse_args(argv)

    project_root = args.project_root.resolve()
    output_folder = resolve_under(str(args.output_folder), project_root)
    out = resolve_under(str(args.out), project_root)
    engine = args.engine.resolve()
    try:
        if not project_root.is_dir():
            raise Prerequisite(f"project root {project_root} is not a folder")
        if not output_folder.is_dir():
            raise Prerequisite(f"output folder {output_folder} does not exist; nothing to render")
        if not engine.is_file():
            raise Prerequisite(f"engine {engine} not found; reinstall the ma-knowledge module")
        node = shutil.which(args.node)
        if not node:
            raise Prerequisite(f"{args.node} not found on PATH; the Atlas engine runs with Node.js")
        check_out(out, project_root, output_folder)
    except Prerequisite as error:
        print(f"prerequisite: {error}", file=sys.stderr)
        return 2

    temp = None
    if args.stage:
        stage = args.stage.resolve()
        if stage.exists():
            shutil.rmtree(stage)
        stage.mkdir(parents=True)
    else:
        temp = tempfile.mkdtemp(prefix="ma-knowledge-atlas-")
        stage = Path(temp)
    try:
        stage_store = stage / STAGE_STORE
        stage_store.mkdir()
        (stage / "package.json").write_text(json.dumps({"name": project_title(project_root)}) + "\n", encoding="utf-8")
        copied = copy_store(output_folder, stage_store, [out, stage])
        store = load_store(output_folder)
        counts = write_boards(store, stage_store)
        if counts["initiatives"] == 0 and not store["backlog"]:
            print(f"warning: no initiative-*/ folder and no backlog/ under {output_folder}; the Atlas holds no ticket", file=sys.stderr)
        site = stage / STAGE_SITE
        engine_log = run_engine(node, engine, stage, site)
        if not (site / "index.html").is_file():
            raise StoreError(f"the engine wrote no index.html under {site}")
        if Path(long_path(out)).exists():
            shutil.rmtree(long_path(out))
        shutil.copytree(long_path(site), long_path(out))
    except (StoreError, OSError) as error:
        print(f"error: {error}", file=sys.stderr)
        return 1
    finally:
        if temp is not None:
            shutil.rmtree(temp, ignore_errors=True)

    print(str(out / "index.html"))
    print(
        f"Knowledge Atlas: {counts['initiatives']} initiative(s), {counts['epics']} epic(s), {counts['tickets']} ticket(s), "
        f"{copied} store file(s) rendered, {counts['problems']} problem(s)"
    )
    for i in store["initiatives"]:
        for p in i["problems"]:
            print(f"  problem: {p}")
    for p in store["backlog_problems"]:
        print(f"  problem: {p}")
    if engine_log:
        print(engine_log.splitlines()[-1])
    return 0


if __name__ == "__main__":
    sys.exit(main())
