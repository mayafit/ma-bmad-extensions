# Confluence publish engine: REST and MCP forms (Story 38.4)

This file is the record of the calls the `ma-atlassian` Confluence engine makes, in its two forms: the REST form, which `scripts/confluence_publish.cjs` (and the collision check `scripts/confluence_collision_check.cjs`) runs itself with `node` when the user's answer `confluence_mcp_server` is empty, and the MCP form, which the same script prints as an ordered list of tool calls for the agent when that answer names an MCP server (ma-agents PRD F29 "Destinations"; FR290, FR300; Decision P5-11.9). The page tree itself (`scripts/confluence_page_tree.cjs`) makes no call.

`tools/test_confluence_engine.py` runs the three scripts, as `setup.py` installs them to `_bmad/ma-atlassian/scripts/`, against `tools/confluence_dc_mock.py`, a local mock of the Confluence Data Center REST endpoints below that also refuses a storage body that is not well-formed XHTML. No Confluence Data Center is reachable from CI; Story 38.6 names the same mock as its Confluence fixture, and the section "Live run" is the command set for the PO to run against a real instance.

## Sources

| What | Where | Version |
|---|---|---|
| Confluence Server/Data Center REST API | `https://docs.atlassian.com/ConfluenceServer/rest/latest/` (`/rest/api/content`, `/rest/api/space`, `/rest/api/search`) and `https://developer.atlassian.com/server/confluence/confluence-rest-api-examples/` | Confluence Data Center 7.x-9.x (the `/rest/api/` content API is unchanged across these lines) |
| Storage format | `https://confluence.atlassian.com/doc/confluence-storage-format-790796544.html` | Data Center |
| Personal access tokens on Data Center | `https://confluence.atlassian.com/enterprise/using-personal-access-tokens-1026032365.html` | Confluence 7.9+ |
| MCP server for Server/Data Center | `https://github.com/sooperset/mcp-atlassian` (`src/mcp_atlassian/servers/confluence.py`, `utils/io.py`, `utils/toolsets.py`) | `mcp-atlassian` v0.24.4 (MIT; not an Atlassian product), the version `references/jira-onprem-verbs.md` records |
| ma-agents 3.x engine | `lib/confluence-page-tree.js` (page tree, collision predicate, `executePlan`), `lib/confluence-publish-hook.js` (the 3.x override generator; replaced by `scripts/bind.py`) | 3.18.x (Epic 31) |

## Conventions

| Name | Meaning |
|---|---|
| `<site>` | the `confluence_site` answer without a trailing slash (`https://wiki.example.com`, or `https://host/confluence` under a context path); https only, plain http only to a loopback host |
| `<PAT>` | the user's personal access token (Confluence profile, Personal Access Tokens), read from the environment variable `CONFLUENCE_PERSONAL_TOKEN` (the variable `mcp-atlassian` reads too); never printed, logged or written to any file of the project; no module answer holds it |
| `<SPACE>` | the destination's space: `planning_space`, or for the tickets destination `tickets_space` (empty: `planning_space`) |
| `<ROOT>` | the destination's root page title: the `planning_root_page` / `tickets_root_page` answer, or `core.project_name` when that answer is empty |

- Every request carries `Authorization: Bearer <PAT>` and `Accept: application/json`; a request with a body carries `Content-Type: application/json` (Data Center answers 415 without it). Redirects are refused, so the token never follows one to another host. A call times out after 60 seconds. A certificate the host does not trust is added with Node's `NODE_EXTRA_CA_CERTS`; verification is never switched off.
- Failure shape: `{"statusCode": <n>, "message": "...", "reason": "..."}`; the engine reports `<METHOD> <path> answered <n>: <message>` and never the request headers.
- Page identity is (space, title): Confluence refuses a second page with a title the space already holds (`400 A page with this title already exists`). The parent is placement, not identity.

## REST form (the engine runs these)

```text
# The destination's space exists and the token's user sees it.
GET  <site>/rest/api/space/<SPACE>
# expect: 200 {key, name, type}; 404 "No space with key : <SPACE>" -> the engine stops before any write

# Identity of one page of the plan, root page first, then parents before children. Never its body.
GET  <site>/rest/api/content?type=page&spaceKey=<SPACE>&title=<title>&expand=version,ancestors&limit=2
# expect: 200 {results: [] | [{id, title, version: {number, message}, ancestors: [{id, title}, ...]}]}

# Create a page that does not exist: a document page with its body, a folder or root page with an empty body.
POST <site>/rest/api/content
     {"type": "page", "title": "<title>", "space": {"key": "<SPACE>"},
      "ancestors": [{"id": "<parent id>"}],                       # left out for the root page (top of the space)
      "body": {"storage": {"value": "<storage XHTML>", "representation": "storage"}},
      "version": {"number": 1, "message": "ma-atlassian sha256:<hash of the body>"}}   # document pages only
# expect: 200 {id, version: {number: 1}}

# Update a document page whose body or parent changed.
PUT  <site>/rest/api/content/<id>
     {"id": "<id>", "type": "page", "title": "<title>", "space": {"key": "<SPACE>"},
      "ancestors": [{"id": "<parent id>"}],
      "body": {"storage": {"value": "<storage XHTML>", "representation": "storage"}},
      "version": {"number": <current + 1>, "message": "ma-atlassian sha256:<hash of the body>"}}
# expect: 200 with the same id; 409 "Version must be incremented on update" when someone edited the page since the read
```

`resolve` (`ma-atlassian-confluence-record-root-page`) uses the identity call by title, or by id:

```text
GET  <site>/rest/api/content/<id>?expand=space,version,ancestors
# expect: 200 with id, title, space.key; 404 "No content found with id" -> not found
```

The same calls by hand, for the live run:

```bash
curl -sS -i -H "Authorization: Bearer $CONFLUENCE_PERSONAL_TOKEN" "<site>/rest/api/space/<SPACE>"
curl -sS -i -H "Authorization: Bearer $CONFLUENCE_PERSONAL_TOKEN" -G "<site>/rest/api/content" \
  --data-urlencode "type=page" --data-urlencode "spaceKey=<SPACE>" --data-urlencode "title=<ROOT>" \
  --data-urlencode "expand=version,ancestors"
```

What a publish does with the answers, in order: plan both trees; refuse on a local collision (no call made); read the space and every page's identity; refuse when a page of the plan exists in the space outside the destination's root page (a `foreign` collision: no write made); then write parents first. A root or folder page that exists is left as it is; a document page whose recorded hash and parent match is `unchanged`; the rest is created or updated. The first failed call stops the run, which reports `published: no` with the pages written before it. When the two destinations share a space and a root page, a folder page of one destination that is a document page of the other (`initiative-*`, `epic-*`) is one page, created once.

## Storage body

The engine converts each document's Markdown with no dependency: front matter becomes a `code` macro (language `yaml`); fenced code a `code` macro with the fence's language, the body in CDATA (`]]>` split); headings `h1`-`h6`; paragraphs; nested `ul`/`ol` lists; pipe tables (`th` row, `td` rows); block quotes; `hr`; inline `strong`, `em`, `code` and links. Everything else, raw HTML included, is escaped text. The mock parses every body as XHTML with the `ac:`/`ri:` namespaces and answers 400 "Error parsing xhtml" when it is not well-formed.

## MCP form (the agent makes these calls)

With `confluence_mcp_server` answered, `confluence_publish.cjs publish` (and `confluence_collision_check.cjs`, read calls only) makes no Confluence call and prints the calls below, per page, in plan order; `<id of "T">` is the id an earlier call returned for page `T`. The server is `mcp-atlassian` 0.24.4, configured in the coding tool under the answer's name with `CONFLUENCE_URL=<site>` and `CONFLUENCE_PERSONAL_TOKEN=<PAT>` in its environment; the four tools sit in its `confluence_pages` toolset.

| Step | Tool | Arguments |
|---|---|---|
| read: identity | `confluence_get_page` | `title`, `space_key`, `include_metadata: true`, `convert_to_markdown: true` (the server reads `GET /rest/api/content?spaceKey&title&expand=body.storage,version`) |
| read: inside the root page (each found page but the root) | `confluence_search` | `query: type = page AND space = "<SPACE>" AND title = "<title>" AND ancestor = <id of "<ROOT>">`, `limit: 1`; no result: a `foreign` collision, stop before any write (the server reads `GET /rest/api/search?cql=...`) |
| write: create a document page | `confluence_create_page` | `space_key`, `title`, `content_file` (the document's absolute path), `content_format: markdown`, `parent_id` (left out for the root page) |
| write: update a document page | `confluence_update_page` | `page_id`, `title`, `content_file`, `content_format: markdown`, `parent_id`, `version_comment: ma-atlassian` |
| write: create a folder or root page | `confluence_create_page` | `space_key`, `title`, `content: <p></p>`, `content_format: storage`, `parent_id` |

- `content_file` is read by the MCP server, which confines it to `MCP_ATLASSIAN_FILES_DIR`, or, with no such variable and the stdio transport, to the server's working directory: start the server from the project root, or set `MCP_ATLASSIAN_FILES_DIR` to it. Otherwise the server answers "Path traversal detected".
- The server converts the Markdown itself, so a page published through MCP is not byte-identical to one published over REST, and the MCP form always updates a found document page (it has no recorded hash to compare).
- `READ_ONLY_MODE=true` on the server disables the two write tools.

## Verification record

- `tools/test_confluence_engine.py --tree <pinned tree> --mutants` (CI step of the `gates` job): 14 cases and 19 source mutants of the three scripts, every mutant red; Node 22.20 in CI.
- MCP forms, by hand against the mock (2026-11-16): the PyPI package `mcp-atlassian==0.24.4` in a throwaway environment, started as `mcp-atlassian --transport stdio` with `CONFLUENCE_URL` set to the mock, `CONFLUENCE_PERSONAL_TOKEN=mock-pat` and `MCP_ATLASSIAN_FILES_DIR` set to the folder of the Markdown file, listed 35 `confluence_*` tools including the four above; `confluence_get_page` by title (not found, then found), `confluence_create_page` with `content: <p></p>` / `content_format: storage` (the root page) and with `content_file` / `content_format: markdown` and `parent_id` (a child page whose body the mock accepted as storage XHTML), `confluence_search` with the `ancestor` CQL (one result) and `confluence_update_page` with `content_file`, `parent_id` and `version_comment` (version 2) each succeeded; the server called `GET /rest/api/content?...&spaceKey&title`, `POST /rest/api/content`, `GET /rest/api/content/<id>?expand=...`, `GET /rest/api/content/<id>/property`, `GET /rest/api/search?cql=...`, `GET /rest/api/content/<id>/history` and `PUT /rest/api/content/<id>?status=current`, all served by the mock. Without `MCP_ATLASSIAN_FILES_DIR` the `content_file` calls answered "Path traversal detected" (the confinement noted above). CI does not run an MCP client.

## Live run (for the PO; the unverified items)

On a host that reaches the on-prem Confluence, with a sandbox space, the module answers pointing at it, and `CONFLUENCE_PERSONAL_TOKEN` set: run `ma-atlassian-confluence-plan`; run `node _bmad/ma-atlassian/scripts/confluence_publish.cjs publish --project-root .` twice and confirm the second run reports `0 created, 0 updated`; edit one document and confirm one `updated`; create a page titled like a planned page elsewhere in the space and confirm the `foreign` collision; then the MCP form with the answer set. Record in Story 38.6's gate record: the Confluence version, whether `POST /rest/api/content` keeps `version.message` (if it does not, the second run updates each document page once and the third reports none), and whether Confluence accepts the empty body of a folder page.
