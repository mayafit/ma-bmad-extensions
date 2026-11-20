#!/usr/bin/env python3
# /// script
# requires-python = ">=3.11"
# ///
"""Local mock of the Confluence Data Center REST endpoints the ma-atlassian publish engine uses (Story 38.4).

No Confluence Data Center is reachable from CI, so this server answers the documented shape of each endpoint of
the Confluence Server/Data Center REST API (`/rest/api/`, https://docs.atlassian.com/ConfluenceServer/rest/latest/)
that `skills/ma-atlassian-bind/references/confluence-verbs.md` names. `tools/test_confluence_engine.py` runs the
engine's scripts (`confluence_publish.cjs`, `confluence_collision_check.cjs`) against it, and Story 38.6's
release gate names it as the Confluence fixture when no live on-prem Confluence is reachable from CI. It proves
the calls are well-formed (method, path, headers, body, the success and the failure shape) and that the engine
handles Confluence's refusals; it does not replace the run against a real instance.

What it checks, as a Data Center instance does:
  - every request carries `Authorization: Bearer <PAT>` (a personal access token, Confluence 7.9+), else 401;
  - a request with a body carries `Content-Type: application/json`, else 415;
  - a page title is unique within its space: a create, or an update that renames, onto a taken title is 400;
  - an update carries `version.number` = the current number + 1, else 409;
  - a storage body is well-formed XHTML (the `ac:`/`ri:` namespaces declared), else 400 "Error parsing xhtml";
  - the space and the parent page (`ancestors[0].id`, in the same space) of a create exist, else 404 / 400;
  - a path outside the served `/rest/api/` set is 404.

Served: GET /rest/api/space/{key}; GET /rest/api/content (spaceKey, title, type, expand, start, limit);
GET /rest/api/content/{id}; GET /rest/api/content/{id}/property (always empty); GET /rest/api/content/{id}/history; POST /rest/api/content; PUT /rest/api/content/{id}; GET /rest/api/content/search and
GET /rest/api/search (CQL: `AND`-joined `type =`, `space =`, `title =`, `ancestor =` clauses); `expand` of
`space`, `version`, `ancestors`, `body.storage`, `history`, `children.attachment`. Pages are in memory; a page
created without `ancestors` sits at the top of its space. `version.message` is stored as sent. In process,
`serve()` returns the server with its `state` (`pages`, `spaces`, `log`; `fail_writes_after` makes every later
POST or PUT answer 500, the test hook for a failure mid-run).

Usage: uv run --no-cache tools/confluence_dc_mock.py [--port 0] [--token PAT] [--space KEY ...] [--page KEY:TITLE ...]
Prints `listening on http://127.0.0.1:<port>` once bound and logs one line per request to stderr.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
import threading
import xml.etree.ElementTree as ET
from dataclasses import dataclass, field
from datetime import datetime, timezone
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qs, urlsplit

sys.dont_write_bytecode = True

API = "/rest/api"
NAMESPACES = 'xmlns:ac="http://atlassian.com/content" xmlns:ri="http://atlassian.com/resource/identifier"'
USER = {"type": "known", "username": "jdoe", "userKey": "8a7f80866d0e5b5e016d0e5c9e8a0000", "displayName": "Jdoe"}


def error(status: int, message: str, reason: str) -> dict:
    return {
        "statusCode": status,
        "data": {"authorized": status != 401, "valid": True, "errors": [], "successful": False},
        "message": message,
        "reason": reason,
    }


@dataclass
class State:
    base: str
    spaces: dict[str, dict] = field(default_factory=dict)
    pages: dict[str, dict] = field(default_factory=dict)
    log: list[tuple[str, str]] = field(default_factory=list)
    next_id: int = 98000
    writes: int = 0
    fail_writes_after: int | None = None  # test hook: a write after this many answers 500
    lock: threading.Lock = field(default_factory=threading.Lock)

    def add_space(self, key: str) -> None:
        self.spaces[key] = {"id": 1000 + len(self.spaces), "key": key, "name": f"{key} space", "type": "global"}

    def by_title(self, space: str, title: str) -> dict | None:
        return next((p for p in self.pages.values() if p["space"] == space and p["title"] == title), None)

    def ancestors(self, page: dict) -> list[dict]:
        chain = []
        parent = page["parent"]
        while parent is not None:
            node = self.pages[parent]
            chain.append(node)
            parent = node["parent"]
        return list(reversed(chain))

    def create(self, space: str, title: str, parent: str | None, body: str, message: str = "") -> dict:
        self.next_id += 1
        now = datetime.now(timezone.utc).isoformat(timespec="milliseconds")
        page = {"id": str(self.next_id), "space": space, "title": title, "parent": parent, "body": body,
                "version": 1, "message": message, "created": now, "when": now}
        self.pages[page["id"]] = page
        return page

    def page_json(self, page: dict, expand: set[str]) -> dict:
        out = {
            "id": page["id"],
            "type": "page",
            "status": "current",
            "title": page["title"],
            "_links": {
                "webui": f"/pages/viewpage.action?pageId={page['id']}",
                "tinyui": f"/x/{page['id']}",
                "self": f"{self.base}{API}/content/{page['id']}",
            },
            "_expandable": {},
        }
        if "space" in expand:
            out["space"] = {**self.spaces[page["space"]], "_links": {"self": f"{self.base}{API}/space/{page['space']}"}}
        else:
            out["_expandable"]["space"] = f"{API}/space/{page['space']}"
        if "version" in expand:
            out["version"] = {"by": USER, "when": page["when"], "message": page["message"], "number": page["version"],
                              "minorEdit": False}
        else:
            out["_expandable"]["version"] = ""
        if "ancestors" in expand:
            out["ancestors"] = [{"id": a["id"], "type": "page", "status": "current", "title": a["title"]}
                                for a in self.ancestors(page)]
        else:
            out["_expandable"]["ancestors"] = ""
        if "body.storage" in expand:
            out["body"] = {"storage": {"value": page["body"], "representation": "storage"}}
        else:
            out["_expandable"]["body"] = ""
        if "history" in expand:
            out["history"] = {"latest": True, "createdBy": USER, "createdDate": page["created"]}
        if "children.attachment" in expand:
            out["children"] = {"attachment": {"results": [], "start": 0, "limit": 25, "size": 0}}
        return out


def storage_problem(value: str) -> str | None:
    try:
        ET.fromstring(f"<root {NAMESPACES}>{value}</root>")
    except ET.ParseError as problem:
        return str(problem)
    return None


CQL_CLAUSE = re.compile(r'^\s*(type|space|title|ancestor)\s*=\s*(?:"((?:[^"\\]|\\.)*)"|(\S+))\s*$', re.IGNORECASE)


def parse_cql(cql: str) -> list[tuple[str, str]] | None:
    clauses = []
    for part in re.split(r"\s+AND\s+", cql.strip(), flags=re.IGNORECASE):
        m = CQL_CLAUSE.match(part)
        if not m:
            return None
        value = m.group(2) if m.group(2) is not None else m.group(3)
        clauses.append((m.group(1).lower(), value.replace('\\"', '"')))
    return clauses


class Handler(BaseHTTPRequestHandler):
    server_version = "confluence-dc-mock/1.0"
    state: State
    token: str
    quiet = False

    def log_message(self, fmt, *args):
        if not self.quiet:
            sys.stderr.write(f"mock: {fmt % args}\n")

    def reply(self, status: int, body=None) -> None:
        payload = b"" if body is None else json.dumps(body).encode("utf-8")
        self.send_response(status)
        if body is not None:
            self.send_header("Content-Type", "application/json;charset=UTF-8")
        self.send_header("Content-Length", str(len(payload)))
        self.end_headers()
        if payload:
            self.wfile.write(payload)

    def authenticate(self) -> bool:
        scheme, _, credential = self.headers.get("Authorization", "").partition(" ")
        if scheme == "Bearer" and credential == self.token:
            return True
        self.reply(401, error(401, "This request requires authentication.", "Unauthorized"))
        return False

    def body(self) -> dict | None:
        length = int(self.headers.get("Content-Length") or 0)
        raw = self.rfile.read(length) if length else b""
        if not self.headers.get("Content-Type", "").lower().startswith("application/json"):
            self.reply(415, error(415, "Unsupported Media Type: a JSON body needs Content-Type: application/json", "Unsupported Media Type"))
            return None
        try:
            data = json.loads(raw.decode("utf-8")) if raw else {}
        except ValueError:
            self.reply(400, error(400, "Can not parse the request body as JSON.", "Bad Request"))
            return None
        if not isinstance(data, dict):
            self.reply(400, error(400, "The request body must be a JSON object.", "Bad Request"))
            return None
        return data

    def do_GET(self):
        self.dispatch("GET")

    def do_POST(self):
        self.dispatch("POST")

    def do_PUT(self):
        self.dispatch("PUT")

    def do_DELETE(self):
        self.dispatch("DELETE")

    def dispatch(self, method: str) -> None:
        url = urlsplit(self.path)
        path = url.path.rstrip("/")
        with self.state.lock:
            self.state.log.append((method, self.path))
        if not self.authenticate():
            return
        query = {k: v[-1] for k, v in parse_qs(url.query).items()}
        allowed = []
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
            self.reply(405, error(405, f"{method} is not allowed on {path}", "Method Not Allowed"))
        else:
            self.reply(404, error(404, f"null for uri: {self.state.base}{path}", "Not Found"))

    def expand(self, query: dict) -> set[str]:
        return {e.strip() for e in query.get("expand", "").split(",") if e.strip()}

    def get_space(self, query, key):
        space = self.state.spaces.get(key)
        if space is None:
            self.reply(404, error(404, f"No space with key : {key}", "Not Found"))
            return
        self.reply(200, {**space, "_links": {"self": f"{self.state.base}{API}/space/{key}"}})

    def listing(self, pages: list[dict], query: dict, wrap: bool = False) -> None:
        start = int(query.get("start", "0") or 0)
        limit = max(1, min(int(query.get("limit", "25") or 25), 200))
        chosen = pages[start:start + limit]
        expand = self.expand(query)
        results = [self.state.page_json(p, expand) for p in chosen]
        if wrap:
            results = [{"content": r, "title": r["title"], "excerpt": "", "url": r["_links"]["webui"],
                        "entityType": "content"} for r in results]
        body = {"results": results, "start": start, "limit": limit, "size": len(results),
                "_links": {"base": self.state.base, "context": ""}}
        if wrap:
            body["totalSize"] = len(pages)
        self.reply(200, body)

    def get_content(self, query):
        if query.get("type", "page") != "page":
            self.listing([], query)
            return
        pages = sorted(self.state.pages.values(), key=lambda p: int(p["id"]))
        if "spaceKey" in query:
            pages = [p for p in pages if p["space"] == query["spaceKey"]]
        if "title" in query:
            pages = [p for p in pages if p["title"] == query["title"]]
        self.listing(pages, query)

    def cql(self, query, wrap: bool) -> None:
        clauses = parse_cql(query.get("cql", ""))
        if clauses is None:
            self.reply(400, error(400, f"Could not parse cql : {query.get('cql', '')}", "Bad Request"))
            return
        pages = sorted(self.state.pages.values(), key=lambda p: int(p["id"]))
        for name, value in clauses:
            if name == "type" and value != "page":
                pages = []
            elif name == "space":
                pages = [p for p in pages if p["space"] == value]
            elif name == "title":
                pages = [p for p in pages if p["title"] == value]
            elif name == "ancestor":
                pages = [p for p in pages if any(a["id"] == value for a in self.state.ancestors(p))]
        self.listing(pages, query, wrap=wrap)

    def get_content_search(self, query):
        self.cql(query, wrap=False)

    def get_search(self, query):
        self.cql(query, wrap=True)

    def page_or_404(self, page_id: str) -> dict | None:
        page = self.state.pages.get(page_id)
        if page is None:
            self.reply(404, error(404, f"No content found with id: ContentId{{id={page_id}}}", "Not Found"))
        return page

    def get_page(self, query, page_id):
        page = self.page_or_404(page_id)
        if page is not None:
            self.reply(200, self.state.page_json(page, self.expand(query) | {"space", "version"}))

    def get_properties(self, query, page_id):
        if self.page_or_404(page_id) is not None:
            self.reply(200, {"results": [], "start": 0, "limit": 10, "size": 0, "_links": {"base": self.state.base}})

    def get_history(self, query, page_id):
        page = self.page_or_404(page_id)
        if page is not None:
            self.reply(200, {"latest": True, "createdBy": USER, "createdDate": page["created"],
                             "lastUpdated": {"by": USER, "when": page["when"], "message": page["message"],
                                             "number": page["version"], "minorEdit": False}})

    def storage_of(self, data: dict) -> str | None:
        storage = ((data.get("body") or {}).get("storage") or {})
        value = storage.get("value", "")
        if storage and storage.get("representation", "storage") != "storage":
            self.reply(400, error(400, "Only the storage representation is accepted by this mock.", "Bad Request"))
            return None
        if not isinstance(value, str):
            self.reply(400, error(400, "body.storage.value must be a string", "Bad Request"))
            return None
        problem = storage_problem(value)
        if problem:
            self.reply(400, error(400, f"Error parsing xhtml: {problem}", "Bad Request"))
            return None
        return value

    def parent_of(self, data: dict, space: str) -> tuple[bool, str | None]:
        ancestors = data.get("ancestors") or []
        if not ancestors:
            return True, None
        parent_id = str(ancestors[-1].get("id", ""))
        parent = self.state.pages.get(parent_id)
        if parent is None or parent["space"] != space:
            self.reply(400, error(400, f"Could not find parent page with id {parent_id} in space {space}", "Bad Request"))
            return False, None
        return True, parent_id

    def write_allowed(self) -> bool:
        self.state.writes += 1
        if self.state.fail_writes_after is not None and self.state.writes > self.state.fail_writes_after:
            self.reply(500, error(500, "The mock was told to fail this write.", "Internal Server Error"))
            return False
        return True

    def post_content(self, query):
        if not self.write_allowed():
            return
        data = self.body()
        if data is None:
            return
        title = str(data.get("title") or "").strip()
        space = ((data.get("space") or {}).get("key")) or ""
        if data.get("type") != "page" or not title:
            self.reply(400, error(400, "A page needs type 'page' and a title.", "Bad Request"))
            return
        if space not in self.state.spaces:
            self.reply(404, error(404, f"No space with key : {space}", "Not Found"))
            return
        if self.state.by_title(space, title):
            self.reply(400, error(400, "A page with this title already exists: A page already exists with the same TITLE in this space", "Bad Request"))
            return
        ok, parent = self.parent_of(data, space)
        if not ok:
            return
        value = self.storage_of(data)
        if value is None:
            return
        message = str(((data.get("version") or {}).get("message")) or "")
        page = self.state.create(space, title, parent, value, message)
        self.reply(200, self.state.page_json(page, {"space", "version", "ancestors", "body.storage"}))

    def put_content(self, query, page_id):
        page = self.page_or_404(page_id)
        if page is None or not self.write_allowed():
            return
        data = self.body()
        if data is None:
            return
        number = (data.get("version") or {}).get("number")
        if number != page["version"] + 1:
            self.reply(409, error(409, f"Version must be incremented on update. Current version is: {page['version']}", "Conflict"))
            return
        title = str(data.get("title") or "").strip()
        if not title:
            self.reply(400, error(400, "A page needs a title.", "Bad Request"))
            return
        other = self.state.by_title(page["space"], title)
        if other is not None and other["id"] != page_id:
            self.reply(400, error(400, "A page with this title already exists: A page already exists with the same TITLE in this space", "Bad Request"))
            return
        ok, parent = self.parent_of(data, page["space"])
        if not ok:
            return
        if parent is not None and (parent == page_id or any(a["id"] == page_id for a in self.state.ancestors(self.state.pages[parent]))):
            self.reply(400, error(400, "A page cannot become its own ancestor.", "Bad Request"))
            return
        value = self.storage_of(data) if "body" in data else page["body"]
        if value is None:
            return
        page.update(title=title, body=value, version=number,
                    message=str((data.get("version") or {}).get("message") or ""),
                    when=datetime.now(timezone.utc).isoformat(timespec="milliseconds"))
        if data.get("ancestors"):
            page["parent"] = parent
        self.reply(200, self.state.page_json(page, {"space", "version", "ancestors", "body.storage"}))


ROUTES = [
    ("GET", re.compile(rf"{API}/space/([^/]+)"), Handler.get_space),
    ("GET", re.compile(rf"{API}/content/search"), Handler.get_content_search),
    ("GET", re.compile(rf"{API}/search"), Handler.get_search),
    ("GET", re.compile(rf"{API}/content"), Handler.get_content),
    ("POST", re.compile(rf"{API}/content"), Handler.post_content),
    ("GET", re.compile(rf"{API}/content/(\d+)"), Handler.get_page),
    ("PUT", re.compile(rf"{API}/content/(\d+)"), Handler.put_content),
    ("GET", re.compile(rf"{API}/content/(\d+)/property"), Handler.get_properties),
    ("GET", re.compile(rf"{API}/content/(\d+)/history"), Handler.get_history),
]


def serve(port: int = 0, token: str = "mock-pat", spaces: tuple[str, ...] = ("PLAN", "TICK", "OTHER"),
          pages: tuple[str, ...] = (), quiet: bool = False) -> ThreadingHTTPServer:
    """Bind a mock on 127.0.0.1:`port` (0 = any free port) and return the server; the caller runs it.

    Each server has its own state, `server.state` (`pages`, `spaces`, `log` of (method, path)).

    Args:
        port: TCP port, 0 for any free port (read it back from `server.server_address`).
        token: the personal access token accepted as `Authorization: Bearer`.
        spaces: the space keys the mock serves.
        pages: `KEY:TITLE` pages created at the top of their space before the first request.
        quiet: True silences the per-request log (the test harness).
    """
    handler = type("BoundHandler", (Handler,), {})
    server = ThreadingHTTPServer(("127.0.0.1", port), handler)
    state = State(base=f"http://127.0.0.1:{server.server_address[1]}")
    for key in spaces:
        state.add_space(key)
    for seed in pages:
        key, _, title = seed.partition(":")
        if key not in state.spaces or not title:
            raise ValueError(f"--page {seed!r}: expected KEY:TITLE with a served space")
        state.create(key, title, None, "<p>seeded</p>")
    handler.state = state
    handler.token = token
    handler.quiet = quiet
    server.state = state  # type: ignore[attr-defined]
    return server


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--port", type=int, default=0)
    parser.add_argument("--token", default="mock-pat", help="the personal access token the mock accepts")
    parser.add_argument("--space", action="append", default=[], help="a space key to serve (default: PLAN, TICK, OTHER)")
    parser.add_argument("--page", action="append", default=[], help="KEY:TITLE, a page at the top of a space")
    args = parser.parse_args(argv)
    server = serve(args.port, args.token, tuple(args.space) or ("PLAN", "TICK", "OTHER"), tuple(args.page))
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
