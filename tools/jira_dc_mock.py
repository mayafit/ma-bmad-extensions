#!/usr/bin/env python3
# /// script
# requires-python = ">=3.11"
# ///
"""Local mock of the Jira Data Center 9.x REST endpoints the `jira-onprem` store verbs use (Story 38.1).

No Jira Data Center is reachable from CI, so this server answers the documented shape of each endpoint of
the Jira 9.17.0 platform REST API (https://docs.atlassian.com/software/jira/docs/api/REST/9.17.0/) that
`skills/ma-atlassian-bind/references/jira-onprem-verbs.md` names, and `tools/test_jira_verbs.py` runs every
REST form of that file against it with curl. It proves the forms are well-formed (method, path, headers,
body, the success and the failure shape); it does not replace the run against a real instance, which the
reference file lists for the PO.

What it checks, as a Data Center instance does:
  - every request carries `Authorization: Bearer <PAT>` (the personal access token of Jira 8.14+) or
    `Authorization: Basic <user:password>`; anything else is 401 with Jira's
    `{"message": "Client must be authenticated to access this resource.", "status-code": 401}`;
  - a request with a body carries `Content-Type: application/json`, else 415;
  - the issue, project, transition, user and link type named in a request exist, else the documented
    400 / 404 with `{"errorMessages": [...], "errors": {...}}`;
  - a path outside the served `/rest/api/2/` set is 404 (there is no `/rest/api/3/` on Data Center).

State is in memory: one project (`--project KEY`), the issue types Epic, Story, Task, Bug, the workflow
To Do (11) -> In Progress (21) -> In Review (31) -> Done (41), the link types Blocks, Relates, Duplicate,
one user (`--user`, the token's owner) and two seed issues `KEY-1` (Story, To Do) and `KEY-2` (Epic).
Created issues continue the numbering.

Usage: uv run --no-cache tools/jira_dc_mock.py [--port 0] [--token PAT] [--basic USER:PASSWORD]
                                              [--project KEY] [--user NAME] [--version 9.17.0]
Prints `listening on http://127.0.0.1:<port>` once bound and logs one line per request to stderr.
"""

from __future__ import annotations

import argparse
import base64
import json
import re
import sys
import threading
from dataclasses import dataclass, field
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qs, urlsplit

sys.dont_write_bytecode = True

API = "/rest/api/2"
UNAUTHENTICATED = {"message": "Client must be authenticated to access this resource.", "status-code": 401}

ISSUE_TYPES = [
    {"id": "10000", "name": "Epic", "subtask": False},
    {"id": "10001", "name": "Story", "subtask": False},
    {"id": "10002", "name": "Task", "subtask": False},
    {"id": "10003", "name": "Bug", "subtask": False},
]
STATUSES = {
    "To Do": {"id": "10000", "category": ("2", "new", "To Do")},
    "In Progress": {"id": "3", "category": ("4", "indeterminate", "In Progress")},
    "In Review": {"id": "10001", "category": ("4", "indeterminate", "In Progress")},
    "Done": {"id": "10002", "category": ("3", "done", "Done")},
}
TRANSITIONS = [("11", "To Do"), ("21", "In Progress"), ("31", "In Review"), ("41", "Done")]
LINK_TYPES = [
    {"id": "10000", "name": "Blocks", "inward": "is blocked by", "outward": "blocks"},
    {"id": "10001", "name": "Relates", "inward": "relates to", "outward": "relates to"},
    {"id": "10002", "name": "Duplicate", "inward": "is duplicated by", "outward": "duplicates"},
]
RESOLUTIONS = {"Done": "10000", "Won't Do": "10001", "Duplicate": "10002"}


@dataclass
class State:
    base: str
    project: str
    user: str
    version: str
    issues: dict[str, dict] = field(default_factory=dict)
    links: list[dict] = field(default_factory=list)
    next_number: int = 1
    next_id: int = 10100
    lock: threading.Lock = field(default_factory=threading.Lock)

    def __post_init__(self) -> None:
        self.create("Story", "Seed story", "A story the mock starts with.")
        self.create("Epic", "Seed epic", "An epic the mock starts with.")

    def user_json(self, name: str) -> dict:
        return {
            "self": f"{self.base}{API}/user?username={name}",
            "key": f"JIRAUSER{10000 + sum(map(ord, name)) % 1000}",
            "name": name,
            "emailAddress": f"{name}@example.invalid",
            "displayName": name.capitalize(),
            "active": True,
            "timeZone": "UTC",
        }

    def status_json(self, name: str) -> dict:
        meta = STATUSES[name]
        cat_id, cat_key, cat_name = meta["category"]
        return {
            "self": f"{self.base}{API}/status/{meta['id']}",
            "id": meta["id"],
            "name": name,
            "statusCategory": {
                "self": f"{self.base}{API}/statuscategory/{cat_id}",
                "id": int(cat_id),
                "key": cat_key,
                "name": cat_name,
            },
        }

    def type_json(self, name: str) -> dict:
        meta = next(t for t in ISSUE_TYPES if t["name"] == name)
        return {"self": f"{self.base}{API}/issuetype/{meta['id']}", **meta}

    def project_json(self) -> dict:
        return {
            "self": f"{self.base}{API}/project/{self.project}",
            "id": "10000",
            "key": self.project,
            "name": f"{self.project} project",
            "projectTypeKey": "software",
            "lead": self.user_json(self.user),
            "issueTypes": [self.type_json(t["name"]) for t in ISSUE_TYPES],
        }

    def create(self, issue_type: str, summary: str, description: str | None, **fields) -> dict:
        key = f"{self.project}-{self.next_number}"
        self.next_number += 1
        issue_id = str(self.next_id)
        self.next_id += 1
        issue = {
            "id": issue_id,
            "key": key,
            "self": f"{self.base}{API}/issue/{issue_id}",
            "fields": {
                "summary": summary,
                "description": description,
                "issuetype": self.type_json(issue_type),
                "project": {"self": f"{self.base}{API}/project/{self.project}", "id": "10000", "key": self.project},
                "status": self.status_json("To Do"),
                "assignee": None,
                "resolution": None,
                "labels": list(fields.get("labels", [])),
                "parent": fields.get("parent"),
                "issuelinks": [],
            },
        }
        self.issues[key] = issue
        return issue

    def find(self, ref: str) -> dict | None:
        if ref in self.issues:
            return self.issues[ref]
        return next((i for i in self.issues.values() if i["id"] == ref), None)


def error(messages: list[str] | None = None, errors: dict | None = None) -> dict:
    return {"errorMessages": messages or [], "errors": errors or {}}


def parse_jql(jql: str) -> list[tuple[str, str, str]]:
    """`field op value [AND ...] [ORDER BY ...]` -> clauses; a ValueError names the first bad token."""
    body = re.split(r"\s+ORDER\s+BY\s+", jql.strip(), flags=re.I)[0]
    if not body:
        return []
    clauses = []
    for part in re.split(r"\s+AND\s+", body, flags=re.I):
        m = re.match(r"^\s*(\w+)\s*(=|!=|~|!~|in|not in)\s*(.+?)\s*$", part, flags=re.I)
        if not m:
            raise ValueError(f"Error in the JQL Query: Expecting operator but got '{part.strip()[:40]}'.")
        field_name, op, value = m.group(1), m.group(2).lower(), m.group(3).strip()
        if field_name.lower() not in {"project", "key", "parent", "issuetype", "status", "statuscategory", "assignee", "text", "labels", "summary", "resolution", "type"}:
            raise ValueError(f"Field '{field_name}' does not exist or you do not have permission to view it.")
        clauses.append((field_name.lower(), op, value.strip("\"'")))
    return clauses


def matches(state: State, issue: dict, clauses: list[tuple[str, str, str]]) -> bool:
    f = issue["fields"]
    for field_name, op, value in clauses:
        if field_name == "project":
            actual = f["project"]["key"]
        elif field_name == "key":
            actual = issue["key"]
        elif field_name == "parent":
            actual = (f.get("parent") or {}).get("key", "")
        elif field_name in ("issuetype", "type"):
            actual = f["issuetype"]["name"]
        elif field_name == "status":
            actual = f["status"]["name"]
        elif field_name == "statuscategory":
            actual = f["status"]["statusCategory"]["name"]
        elif field_name == "assignee":
            actual = (f.get("assignee") or {}).get("name", "")
            if value.lower() == "currentuser()":
                value = state.user
        elif field_name == "resolution":
            actual = (f.get("resolution") or {}).get("name", "")
        elif field_name == "labels":
            actual = " ".join(f["labels"])
        else:  # text, summary
            actual = f"{f['summary']} {f.get('description') or ''}"
        a, v = actual.lower(), value.lower()
        if op == "=" and a != v or op == "!=" and a == v or op == "~" and v not in a or op == "!~" and v in a:
            return False
        if op in ("in", "not in"):
            options = [x.strip().strip("\"'").lower() for x in value.strip("()").split(",")]
            if (a in options) != (op == "in"):
                return False
    return True


def pick_fields(issue: dict, names: str | None) -> dict:
    if not names or names.strip() in ("*all", "*navigable"):
        return issue
    wanted = [n.strip() for n in names.split(",") if n.strip()]
    return {**{k: v for k, v in issue.items() if k != "fields"}, "fields": {k: v for k, v in issue["fields"].items() if k in wanted}}


class Handler(BaseHTTPRequestHandler):
    server_version = "jira-dc-mock/1.0"
    state: State
    token: str
    basic: str | None

    quiet = False

    def log_message(self, fmt, *args):  # one line per request on stderr, unless a test silenced it
        if not self.quiet:
            sys.stderr.write(f"mock: {fmt % args}\n")

    # -- transport -------------------------------------------------------------------------------------
    def reply(self, status: int, body=None, headers: dict | None = None) -> None:
        payload = b"" if body is None else json.dumps(body).encode("utf-8")
        self.send_response(status)
        self.send_header("X-AUSERNAME", getattr(self, "who", "anonymous"))
        for k, v in (headers or {}).items():
            self.send_header(k, v)
        if body is not None:
            self.send_header("Content-Type", "application/json;charset=UTF-8")
        self.send_header("Content-Length", str(len(payload)))
        self.end_headers()
        if payload:
            self.wfile.write(payload)

    def authenticate(self) -> bool:
        header = self.headers.get("Authorization", "")
        scheme, _, credential = header.partition(" ")
        if scheme == "Bearer" and credential == self.token:
            self.who = self.state.user
            return True
        if scheme == "Basic" and self.basic:
            try:
                if base64.b64decode(credential).decode("utf-8") == self.basic:
                    self.who = self.basic.split(":", 1)[0]
                    return True
            except (ValueError, UnicodeDecodeError):
                pass
        self.who = "anonymous"
        self.reply(401, UNAUTHENTICATED, {"WWW-Authenticate": 'OAuth realm="https%3A%2F%2Fjira.example.invalid"'})
        return False

    def body(self) -> dict | None:
        length = int(self.headers.get("Content-Length") or 0)
        raw = self.rfile.read(length) if length else b""
        if not raw:
            return {}
        if not self.headers.get("Content-Type", "").lower().startswith("application/json"):
            self.reply(415, error(["Unsupported Media Type: a JSON body needs Content-Type: application/json"]))
            return None
        try:
            data = json.loads(raw.decode("utf-8"))
        except ValueError:
            self.reply(400, error(["Can not parse the request body as JSON."]))
            return None
        return data if isinstance(data, dict) else {}

    def do_GET(self):
        self.dispatch("GET")

    def do_POST(self):
        self.dispatch("POST")

    def do_PUT(self):
        self.dispatch("PUT")

    def do_DELETE(self):
        self.dispatch("DELETE")

    def dispatch(self, method: str) -> None:
        """Route by (method, path); a known path with another method is 405, an unknown path 404."""
        if not self.authenticate():
            return
        url = urlsplit(self.path)
        query = {k: v[-1] for k, v in parse_qs(url.query).items()}
        path = url.path.rstrip("/")
        allowed: list[str] = []
        with self.state.lock:
            for route_method, pattern, handler in ROUTES:
                m = pattern.fullmatch(path)
                if not m:
                    continue
                if route_method == method:
                    handler(self, query, *m.groups())
                    return
                allowed.append(route_method)
        if allowed:
            self.reply(405, error([f"{method} is not allowed on {path}; use {', '.join(allowed)}"]), {"Allow": ", ".join(allowed)})
        else:
            self.reply(404, error([f"null for uri: {self.state.base}{path}"]))

    # -- endpoints (name = <METHOD>_<what>) ------------------------------------------------------------
    def get_myself(self, query):
        self.reply(200, self.state.user_json(self.who))

    def get_serverinfo(self, query):
        major, minor, patch = (int(x) for x in self.state.version.split("."))
        self.reply(200, {
            "baseUrl": self.state.base,
            "version": self.state.version,
            "versionNumbers": [major, minor, patch],
            "deploymentType": "Server",
            "buildNumber": 917000,
            "buildDate": "2024-07-01T00:00:00.000+0000",
            "serverTime": "2026-11-15T12:00:00.000+0000",
            "scmInfo": "0000000000000000000000000000000000000000",
            "serverTitle": "Jira Data Center mock",
        })

    def project_or_404(self, key: str) -> bool:
        if key not in (self.state.project, "10000"):
            self.reply(404, error([f"No project could be found with key '{key}'."]))
            return False
        return True

    def get_project(self, query, key):
        if self.project_or_404(key):
            self.reply(200, self.state.project_json())

    def get_statuses(self, query, key):
        if not self.project_or_404(key):
            return
        self.reply(200, [
            {**self.state.type_json(t["name"]), "statuses": [self.state.status_json(s) for s in STATUSES]}
            for t in ISSUE_TYPES
        ])

    def get_createmeta(self, query, key):
        if self.project_or_404(key):
            types = [self.state.type_json(t["name"]) for t in ISSUE_TYPES]
            self.reply(200, {"maxResults": 50, "startAt": 0, "total": len(types), "isLast": True, "values": types})

    def get_field(self, query):
        """The field list an MCP server reads once for its field cache (mcp-atlassian: epic field discovery)."""
        system = ["summary", "description", "issuetype", "status", "assignee", "labels", "parent", "resolution", "priority", "project"]
        fields = [{"id": name, "name": name.capitalize(), "custom": False, "schema": {"type": "string" if name in ("summary", "description") else "any"}} for name in system]
        fields += [
            {"id": "customfield_10014", "name": "Epic Link", "custom": True, "schema": {"type": "any", "custom": "com.pyxis.greenhopper.jira:gh-epic-link", "customId": 10014}},
            {"id": "customfield_10011", "name": "Epic Name", "custom": True, "schema": {"type": "string", "custom": "com.pyxis.greenhopper.jira:gh-epic-label", "customId": 10011}},
        ]
        self.reply(200, fields)

    def get_linktypes(self, query):
        self.reply(200, {"issueLinkTypes": [{"self": f"{self.state.base}{API}/issueLinkType/{t['id']}", **t} for t in LINK_TYPES]})

    def search(self, jql: str, start_at: int, max_results: int, fields: str | None) -> None:
        try:
            clauses = parse_jql(jql)
        except ValueError as e:
            self.reply(400, error([str(e)]))
            return
        hits = [pick_fields(i, fields) for i in self.state.issues.values() if matches(self.state, i, clauses)]
        self.reply(200, {
            "expand": "names,schema",
            "startAt": start_at,
            "maxResults": max_results,
            "total": len(hits),
            "issues": hits[start_at:start_at + max_results],
        })

    def get_search(self, query):
        self.search(query.get("jql", ""), int(query.get("startAt", 0)), int(query.get("maxResults", 50)), query.get("fields"))

    def post_search(self, query):
        data = self.body()
        if data is None:
            return
        fields = data.get("fields")
        self.search(str(data.get("jql", "")), int(data.get("startAt", 0)), int(data.get("maxResults", 50)),
                    ",".join(fields) if isinstance(fields, list) else fields)

    def issue_or_404(self, ref: str) -> dict | None:
        issue = self.state.find(ref)
        if issue is None:
            self.reply(404, error(["Issue Does Not Exist"]))
        return issue

    def get_issue(self, query, ref):
        issue = self.issue_or_404(ref)
        if issue:
            self.reply(200, pick_fields(issue, query.get("fields")))

    def post_issue(self, query):
        data = self.body()
        if data is None:
            return
        f = data.get("fields") if isinstance(data.get("fields"), dict) else {}
        errors: dict[str, str] = {}
        project = (f.get("project") or {})
        if project.get("key", project.get("id")) not in (self.state.project, "10000"):
            errors["project"] = "project is required" if not project else f"Project '{project}' does not exist or you lack permission."
        if not str(f.get("summary") or "").strip():
            errors["summary"] = "You must specify a summary of the issue."
        type_name = (f.get("issuetype") or {}).get("name")
        if type_name not in {t["name"] for t in ISSUE_TYPES}:
            errors["issuetype"] = "The issue type selected is invalid."
        parent = None
        if isinstance(f.get("parent"), dict):
            parent_issue = self.state.find(str(f["parent"].get("key") or f["parent"].get("id")))
            if parent_issue is None:
                errors["parent"] = "Parent issue does not exist."
            else:
                parent = {"id": parent_issue["id"], "key": parent_issue["key"], "self": parent_issue["self"]}
        if errors:
            self.reply(400, error([], errors))
            return
        labels = f.get("labels") if isinstance(f.get("labels"), list) else []
        issue = self.state.create(type_name, f["summary"], f.get("description"), labels=labels, parent=parent)
        self.reply(201, {"id": issue["id"], "key": issue["key"], "self": issue["self"]})

    def put_issue(self, query, ref):
        issue = self.issue_or_404(ref)
        if issue is None:
            return
        data = self.body()
        if data is None:
            return
        f = data.get("fields") if isinstance(data.get("fields"), dict) else {}
        if "status" in f:
            self.reply(400, error([], {"status": "Field 'status' cannot be set. It is not on the appropriate screen, or unknown."}))
            return
        for k in ("summary", "description"):
            if k in f:
                issue["fields"][k] = f[k]
        if isinstance(f.get("labels"), list):
            issue["fields"]["labels"] = list(f["labels"])
        for op in (data.get("update") or {}).get("labels", []):
            if "add" in op and op["add"] not in issue["fields"]["labels"]:
                issue["fields"]["labels"].append(op["add"])
            if "remove" in op and op["remove"] in issue["fields"]["labels"]:
                issue["fields"]["labels"].remove(op["remove"])
        self.reply(204)

    def get_transitions(self, query, ref):
        issue = self.issue_or_404(ref)
        if issue:
            self.reply(200, {"expand": "transitions", "transitions": [
                {"id": tid, "name": name, "to": self.state.status_json(name)} for tid, name in TRANSITIONS
            ]})

    def post_transitions(self, query, ref):
        issue = self.issue_or_404(ref)
        if issue is None:
            return
        data = self.body()
        if data is None:
            return
        wanted = str((data.get("transition") or {}).get("id") or "")
        if not wanted:
            self.reply(400, error(["Missing 'transition' identifier"]))
            return
        target = next((name for tid, name in TRANSITIONS if tid == wanted), None)
        if target is None:
            self.reply(400, error([f"Transition id '{wanted}' is not valid for this issue."]))
            return
        resolution = ((data.get("fields") or {}).get("resolution") or {}).get("name")
        if resolution is not None and resolution not in RESOLUTIONS:
            self.reply(400, error([], {"resolution": f"Resolution name '{resolution}' is not valid"}))
            return
        issue["fields"]["status"] = self.state.status_json(target)
        issue["fields"]["resolution"] = (
            {"self": f"{self.state.base}{API}/resolution/{RESOLUTIONS[resolution]}", "id": RESOLUTIONS[resolution], "name": resolution}
            if resolution else (issue["fields"]["resolution"] if target == "Done" else None)
        )
        self.reply(204)

    def put_assignee(self, query, ref):
        issue = self.issue_or_404(ref)
        if issue is None:
            return
        data = self.body()
        if data is None:
            return
        if "name" not in data:
            self.reply(400, error(["expected a user representation with a 'name' key"]))
            return
        name = data["name"]
        if name is None:
            issue["fields"]["assignee"] = None
        elif name == "-1":
            issue["fields"]["assignee"] = self.state.user_json(self.state.user)  # automatic: the project lead
        elif name and name in {self.state.user, *([self.basic.split(":", 1)[0]] if self.basic else [])}:
            issue["fields"]["assignee"] = self.state.user_json(name)
        else:
            self.reply(400, error([], {"assignee": f"User '{name}' cannot be assigned issues."}))
            return
        self.reply(204)

    def post_comment(self, query, ref):
        issue = self.issue_or_404(ref)
        if issue is None:
            return
        data = self.body()
        if data is None:
            return
        if not str(data.get("body") or "").strip():
            self.reply(400, error(["Comment body can not be empty!"]))
            return
        comment_id = str(self.state.next_id)
        self.state.next_id += 1
        self.reply(201, {"self": f"{issue['self']}/comment/{comment_id}", "id": comment_id, "body": data["body"],
                         "author": self.state.user_json(self.who)})

    def post_issuelink(self, query):
        data = self.body()
        if data is None:
            return
        type_name = (data.get("type") or {}).get("name")
        link_type = next((t for t in LINK_TYPES if t["name"] == type_name), None)
        if link_type is None:
            self.reply(404, error([f"No issue link type with name '{type_name}' found."]))
            return
        inward = self.state.find(str((data.get("inwardIssue") or {}).get("key") or ""))
        outward = self.state.find(str((data.get("outwardIssue") or {}).get("key") or ""))
        if inward is None or outward is None:
            self.reply(404, error(["Issue Does Not Exist"]))
            return
        link_id = str(self.state.next_id)
        self.state.next_id += 1
        outward["fields"]["issuelinks"].append({"id": link_id, "type": link_type, "inwardIssue": {"id": inward["id"], "key": inward["key"]}})
        inward["fields"]["issuelinks"].append({"id": link_id, "type": link_type, "outwardIssue": {"id": outward["id"], "key": outward["key"]}})
        self.reply(201)


# (method, path pattern, handler) -- the endpoints of the Jira 9.17.0 reference the verbs use, and no other.
ROUTES = [
    ("GET", re.compile(rf"{API}/myself"), Handler.get_myself),
    ("GET", re.compile(rf"{API}/serverInfo"), Handler.get_serverinfo),
    ("GET", re.compile(rf"{API}/project/([^/]+)"), Handler.get_project),
    ("GET", re.compile(rf"{API}/project/([^/]+)/statuses"), Handler.get_statuses),
    ("GET", re.compile(rf"{API}/issue/createmeta/([^/]+)/issuetypes"), Handler.get_createmeta),
    ("GET", re.compile(rf"{API}/issueLinkType"), Handler.get_linktypes),
    ("GET", re.compile(rf"{API}/field"), Handler.get_field),
    ("GET", re.compile(rf"{API}/search"), Handler.get_search),
    ("POST", re.compile(rf"{API}/search"), Handler.post_search),
    ("POST", re.compile(rf"{API}/issue"), Handler.post_issue),
    ("GET", re.compile(rf"{API}/issue/(?!createmeta)([^/]+)"), Handler.get_issue),
    ("PUT", re.compile(rf"{API}/issue/(?!createmeta)([^/]+)"), Handler.put_issue),
    ("GET", re.compile(rf"{API}/issue/([^/]+)/transitions"), Handler.get_transitions),
    ("POST", re.compile(rf"{API}/issue/([^/]+)/transitions"), Handler.post_transitions),
    ("PUT", re.compile(rf"{API}/issue/([^/]+)/assignee"), Handler.put_assignee),
    ("POST", re.compile(rf"{API}/issue/([^/]+)/comment"), Handler.post_comment),
    ("POST", re.compile(rf"{API}/issueLink"), Handler.post_issuelink),
]


def serve(port: int, token: str, basic: str | None, project: str, user: str, version: str, quiet: bool = False) -> ThreadingHTTPServer:
    """Bind the mock on 127.0.0.1:`port` (0 = any free port) and return the server; the caller runs it.

    Args:
        port: TCP port, 0 for any free port (read it back from `server.server_address`).
        token: the personal access token accepted as `Authorization: Bearer`.
        basic: `USER:PASSWORD` accepted as basic authentication, or None.
        project: the one project key the mock serves.
        user: the token's owner, what `GET /myself` returns.
        version: the Jira version `GET /serverInfo` reports.
        quiet: True silences the per-request log (the test harness).
    """
    server = ThreadingHTTPServer(("127.0.0.1", port), Handler)
    base = f"http://127.0.0.1:{server.server_address[1]}"
    Handler.state = State(base=base, project=project, user=user, version=version)
    Handler.token = token
    Handler.basic = basic
    Handler.quiet = quiet
    return server


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--port", type=int, default=0)
    parser.add_argument("--token", default="mock-pat", help="the personal access token the mock accepts")
    parser.add_argument("--basic", default=None, help="USER:PASSWORD accepted as basic auth (default: none)")
    parser.add_argument("--project", default="MOCK")
    parser.add_argument("--user", default="jdoe", help="the token's owner (GET /myself)")
    parser.add_argument("--version", default="9.17.0", help="the Jira version serverInfo reports")
    args = parser.parse_args(argv)
    server = serve(args.port, args.token, args.basic, args.project, args.user, args.version)
    print(f"listening on http://127.0.0.1:{server.server_address[1]}", flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
    return 0


if __name__ == "__main__":
    sys.exit(main())
