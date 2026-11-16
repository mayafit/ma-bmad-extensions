# `jira-onprem` store verbs: REST and MCP forms, verified (Story 38.1)

This file is the verification record of the verb forms the `jira-onprem` store starter (`config/jira-onprem-ticketing.toml`, Story 38.2) gives `bmad-agent-po`. Sofia reads the starter through `uv run --no-cache {skill-root}/scripts/read_store.py --project-root {project-root} -k verbs.<name>` and follows the text; the verb set is hers, `setup`, `write` and `query`, and `write` covers create, edit, transition, assign and link (ma-agents PRD F29 "Jira store"; Decision P5-11.4). Each verb has a REST form, used when the `mcp_server` answer is empty, and an MCP form, used when it names an MCP server.

Every REST form below is a `curl` command with placeholders. `tools/test_jira_verbs.py` runs each one, placeholders filled, against `tools/jira_dc_mock.py`, a local mock of the Jira Data Center 9.17.0 endpoints, and checks the `HTTP` line and the body keys the `# expect:` comment names. No Jira Data Center is reachable from CI; the section "Live run" is the same command set for the PO to run against a real instance, with what each must print.

## Sources

| What | Where | Version |
|---|---|---|
| Jira Data Center platform REST API reference | `https://docs.atlassian.com/software/jira/docs/api/REST/9.17.0/` | Jira 9.17.0 (the last 9.x line documented at that address) |
| Personal access tokens on Data Center | `https://confluence.atlassian.com/enterprise/using-personal-access-tokens-1026032365.html` | Jira 8.14+, Confluence 7.9+ |
| MCP server for Server/Data Center | `https://github.com/sooperset/mcp-atlassian` (`docs/tools-reference.mdx`, `docs/tools/jira-*.mdx`, `docs/authentication.mdx`, `src/mcp_atlassian/servers/jira.py`) | `mcp-atlassian` v0.24.4, released 2026-11-13 (MIT; not an Atlassian product) |
| Upstream Jira Cloud starter | `bmad-agent-po/config/jira-ticketing.toml` at the pinned BMAD commit | `e734d3a` |
| Upstream store reading | `bmad-agent-po/scripts/read_store.py`, `references/store-setup.md`, `references/board.md`; ma-agents 36.1 gate findings AC8 (GO-38) | `e734d3a` |
| ma-agents 3.x | the 3.x "what's next" skill (the JQL and the shared-account rule); `lib/store-backends.js` | 3.18.x |

What the 3.x line is evidence of: ma-agents 3.x never called the Jira REST API itself. Its store backends are `file-system` and `confluence` only; its one Jira skill, the 3.x "what's next" skill that Sofia's board replaces (FR296), handed the JQL `project = <KEY> AND assignee = currentUser() AND statusCategory != Done ORDER BY priority DESC, rank ASC` to "whatever Jira-capable tool is available" and stopped when the tool was authenticated as a shared account. So the 3.x evidence is the JQL and the identity rule, both kept below; every endpoint form is checked against the 9.17.0 reference, not against 3.x.

## Placeholders and conventions

| Placeholder | Meaning | Value the mock test uses |
|---|---|---|
| `<site>` | `jira_site`, the Jira base URL without a trailing slash (`https://jira.example.com` or `https://host/jira` when Jira runs under a context path) | the mock's `http://127.0.0.1:<port>` |
| `<PAT>` | the user's personal access token (Jira profile, Personal Access Tokens); never written to any file of the project | `mock-pat` |
| `<KEY>` | `jira_project_key` | `MOCK` |
| `<ISSUE>` | an existing work item key | `MOCK-1` (a Story) |
| `<EPIC>` | an existing Epic key | `MOCK-2` |
| `<BLOCKER>` | the key of the work item that blocks `<ISSUE>` | `MOCK-2` |
| `<TRANSITION>` | a transition id read from `GET .../transitions` | `21` (to In Progress) |
| `<USER>` | a Jira username (`name`, not the display name) | `jdoe` |

- Base path: `<site>/rest/api/2/`. Data Center has no `/rest/api/3/` (that is Jira Cloud); `/rest/api/latest/` is an alias of `2` and is not used here so the forms stay version-pinned.
- Authentication: `Authorization: Bearer <PAT>` on every call (PAT, Jira 8.14+). Basic authentication (`curl -u <USER>:<password>`) is the fallback on an instance where PATs are disabled (`atlassian.pats.enabled=false`). The 3.x rule stands: credentials stay in the user's environment; no answer of this module holds one.
- Bodies are JSON with `Content-Type: application/json`; Data Center answers 415 without it.
- Pagination: `startAt`, `maxResults` (default 50), `total` in the response.
- Failure shapes: `401` `{"message": "Client must be authenticated to access this resource.", "status-code": 401}` (bad or missing token); `400` `{"errorMessages": [...], "errors": {"<field>": "..."}}` (a bad body or JQL; `errors` is keyed by field); `404` `{"errorMessages": ["Issue Does Not Exist"], "errors": {}}` (a key the user cannot see, or a path that does not exist); `403` on a permission the user lacks (browse, create, transition, assign, link).
- Every command runs with `-i`: the first line printed is the status (`HTTP/1.1 200 OK`), then the response headers (`X-AUSERNAME` is the authenticated username Data Center echoes), a blank line, and the body.

## MCP form: the server and its tools

The MCP form targets `mcp-atlassian` v0.24.4 by sooperset, the one MCP server that documents Jira Server/Data Center (8.14+) with a personal access token; Atlassian's own Rovo MCP server reaches Cloud only. The server is configured in the coding tool under the name the `jira_mcp_server` answer carries, with `JIRA_URL=<site>` and `JIRA_PERSONAL_TOKEN=<PAT>` in its environment (`JIRA_SSL_VERIFY=false` only for a self-signed certificate the OS does not trust). Tool names are `jira_<function>`; the ones the verbs use, with their documented arguments:

| Verb part | Tool | Arguments |
|---|---|---|
| setup: who am I | `jira_get_user_profile` | `user_identifier: "me"` (the server reads `/rest/api/2/myself`) |
| setup: project and types | `jira_get_project_issue_types` | `project_key` |
| setup: link types | `jira_get_link_types` | (none; `name_filter` optional) |
| write: create | `jira_create_issue` | `project_key`, `summary`, `issue_type`, `description`, `additional_fields` (JSON string: `labels`, `parent`) |
| write: edit | `jira_update_issue` | `issue_key`, `fields` (JSON string), `additional_fields` |
| write: transitions | `jira_get_transitions` | `issue_key` |
| write: transition | `jira_transition_issue` | `issue_key`, `transition_id` (id or name), `fields` (JSON string, e.g. the resolution) |
| write: assign | `jira_assign_issue` | `issue_key`, `assignee` (username; empty unassigns) |
| write: link | `jira_create_issue_link` | `link_type`, `inward_issue_key`, `outward_issue_key` |
| write: link to epic | `jira_link_to_epic` | `issue_key`, `epic_key` |
| write: comment | `jira_add_comment` | `issue_key`, `body` (Markdown; `comment` is accepted as an alias), `visibility` |
| query: one item | `jira_get_issue` | `issue_key`, `fields`, `include` |
| query: search | `jira_search` | `jql`, `fields`, `limit` (1-50), `start_at` |

`READ_ONLY_MODE=true` on the server disables every write tool; `ENABLED_TOOLS` can restrict the set to the thirteen above. The server groups its tools in toolsets (`TOOLSETS`; source `utils/toolsets.py` at v0.24.4): the thirteen sit in `jira_issues`, `jira_transitions`, `jira_comments` (default on), `jira_links`, `jira_users` and `jira_projects` (default off); `TOOLSETS` unset or `all` enables every toolset, `TOOLSETS=default` leaves out link, user-profile and project-type tools (Story 38.2). The MCP forms are checked against the server's documentation and source at v0.24.4, and once by hand against the mock (Story 38.1 verification record): the PyPI package `mcp-atlassian==0.24.4` installed into a throwaway environment and started as `mcp-atlassian --transport stdio` with `JIRA_URL` set to the mock and `JIRA_PERSONAL_TOKEN=mock-pat` ran in Server/Data Center mode ("Using Jira Server/Data Center authentication (PAT or Basic Auth)"), listed 61 `jira_*` tools including the twelve of Story 38.1 (every row above but `jira_add_comment`) with the argument names in the table, and `jira_get_user_profile {"user_identifier": "me"}`, `jira_get_issue`, `jira_search`, `jira_get_transitions` and `jira_get_link_types` each hit the mock's `/rest/api/2/` endpoint of the matching REST form (`GET /myself`, `GET /issue/<ISSUE>?fields=…&updateHistory=true`, `GET /search?startAt=0&maxResults=10&fields=…&jql=…`, `GET /issue/<ISSUE>/transitions`, `GET /issueLinkType`) and returned the item; the server also reads `GET /rest/api/2/field` once for its field cache. CI does not run an MCP client; the five calls are the hand-run half of the record.

## Verb `setup`

Connect and check the instance: who the token belongs to (the identity clause: "my work" means `assignee = currentUser()`; a shared or service account stops the run and asks for a personal identity), the project, its types and statuses against `[tickets.types]` and `[tickets.status]`, and the link type the `after` relation uses.

### REST

```bash
# expect: HTTP 200; body keys: name, displayName, active
curl -sS -i -H "Authorization: Bearer <PAT>" "<site>/rest/api/2/myself"
```

Must print the token's user: `name` (the username the identity clause compares with `assignee`), `displayName`, `active: true`. A service account shows in `name`/`displayName`.

```bash
# expect: HTTP 200; body keys: version, versionNumbers, deploymentType
curl -sS -i -H "Authorization: Bearer <PAT>" "<site>/rest/api/2/serverInfo"
```

Must print `version` `9.x` (record it) and `deploymentType: "Server"` (Data Center reports `Server`).

```bash
# expect: HTTP 200; body keys: key, name, issueTypes
curl -sS -i -H "Authorization: Bearer <PAT>" "<site>/rest/api/2/project/<KEY>"
```

```bash
# expect: HTTP 200; body: array
curl -sS -i -H "Authorization: Bearer <PAT>" "<site>/rest/api/2/project/<KEY>/statuses"
```

Must print one object per issue type with its `statuses`: compare the type names with `[tickets.types]` (Epic, Story, Task, Bug) and the status names with `[tickets.status]` (To Do, In Progress, In Review, Done); tell the user what to add in Jira or which map entry to set.

```bash
# expect: HTTP 200; body keys: values, total
curl -sS -i -H "Authorization: Bearer <PAT>" "<site>/rest/api/2/issue/createmeta/<KEY>/issuetypes"
```

The types the user can create in the project (Jira 8.4+ form; the older `GET /rest/api/2/issue/createmeta` is not in the 9.x reference).

```bash
# expect: HTTP 200; body keys: issueLinkTypes
curl -sS -i -H "Authorization: Bearer <PAT>" "<site>/rest/api/2/issueLinkType"
```

Must list a type named `Blocks` (`outward: "blocks"`, `inward: "is blocked by"`), the one `after` publishes as.

### MCP

`jira_get_user_profile {"user_identifier": "me"}`; `jira_get_project_issue_types {"project_key": "<KEY>"}`; `jira_get_link_types {}`. The statuses per type have no tool of their own: read one existing item with `jira_get_issue {"issue_key": "<ISSUE>", "fields": "issuetype,status", "include": "transitions"}` and compare its `transitions` with the status map.

## Verb `write`

The project is the ticket's own `key`, else that of the nearest container above it, else `[tickets] key`. `tracker_id` is the work item's key, `remote` is `<site>/browse/<key>`. Status never moves by edit: it moves by transition.

### Create (REST)

```bash
# expect: HTTP 201; body keys: id, key, self
curl -sS -i -H "Authorization: Bearer <PAT>" -H "Content-Type: application/json" \
  -X POST --data '{"fields": {"project": {"key": "<KEY>"}, "issuetype": {"name": "Story"}, "summary": "BMad setup test - safe to delete", "description": "Created by the jira-onprem setup test.", "labels": ["story"], "parent": {"key": "<EPIC>"}}}' \
  "<site>/rest/api/2/issue"
```

Must print the new item's `key` (the `tracker_id`). `issuetype.name` is the `[tickets.types]` value; `labels` carries the BMad type, `hitl` and `risk-<risk>` as the Cloud starter does; a spike is `Task` plus the label `spike`. `parent` names the epic: on Jira 8.x/9.x the parent of a Story under an Epic is the Epic (the "Epic Link" custom field of Jira 7 is not needed on 9.x when the project uses the parent relation; when an instance still requires it, set `customfield_<id>` through the same body). An epic sits loose while `[tickets.types].initiative` is empty: omit `parent`.

### Edit (REST)

```bash
# expect: HTTP 204; body: empty
curl -sS -i -H "Authorization: Bearer <PAT>" -H "Content-Type: application/json" \
  -X PUT --data '{"fields": {"description": "Refined body."}, "update": {"labels": [{"add": "hitl"}]}}' \
  "<site>/rest/api/2/issue/<ISSUE>"
```

Body and labels; `status` in `fields` is rejected with 400 (status moves by transition).

### Transition (REST)

```bash
# expect: HTTP 200; body keys: transitions
curl -sS -i -H "Authorization: Bearer <PAT>" "<site>/rest/api/2/issue/<ISSUE>/transitions"
```

Must print the transitions the user may run now; pick the one whose `to.name` equals `[tickets.status].<state>` and send its `id`:

```bash
# expect: HTTP 204; body: empty
curl -sS -i -H "Authorization: Bearer <PAT>" -H "Content-Type: application/json" \
  -X POST --data '{"transition": {"id": "<TRANSITION>"}}' \
  "<site>/rest/api/2/issue/<ISSUE>/transitions"
```

`dropped` shares the `Done` status with `done`; the resolution distinguishes them, set in the same call:

```bash
# expect: HTTP 204; body: empty
curl -sS -i -H "Authorization: Bearer <PAT>" -H "Content-Type: application/json" \
  -X POST --data '{"transition": {"id": "41"}, "fields": {"resolution": {"name": "Won'"'"'t Do"}}}' \
  "<site>/rest/api/2/issue/<ISSUE>/transitions"
```

(`41` is the mock's Done transition; on a real instance read the id from the list first. A workflow whose Done transition has no resolution on its screen rejects `fields.resolution` with 400 `errors.resolution`; then the admin adds it to the transition screen, or `dropped` maps to a status of its own.)

### Assign (REST)

```bash
# expect: HTTP 204; body: empty
curl -sS -i -H "Authorization: Bearer <PAT>" -H "Content-Type: application/json" \
  -X PUT --data '{"name": "<USER>"}' \
  "<site>/rest/api/2/issue/<ISSUE>/assignee"
```

`{"name": "-1"}` assigns automatically (the project default), `{"name": null}` unassigns. Data Center takes the username in `name` (Cloud's `accountId` does not exist here). "Assign to me" uses the `name` that `GET /myself` printed.

### Link (REST)

```bash
# expect: HTTP 201; body: empty
curl -sS -i -H "Authorization: Bearer <PAT>" -H "Content-Type: application/json" \
  -X POST --data '{"type": {"name": "Blocks"}, "outwardIssue": {"key": "<BLOCKER>"}, "inwardIssue": {"key": "<ISSUE>"}}' \
  "<site>/rest/api/2/issueLink"
```

`after` (this ticket waits on `<BLOCKER>`): the blocker is the outward issue ("blocks"), the blocked ticket the inward one ("is blocked by"). The response has no body.

### Comment (REST)

```bash
# expect: HTTP 201; body keys: id, body
curl -sS -i -H "Authorization: Bearer <PAT>" -H "Content-Type: application/json" \
  -X POST --data '{"body": "Started by BMad."}' \
  "<site>/rest/api/2/issue/<ISSUE>/comment"
```

### MCP

- create: `jira_create_issue {"project_key": "<KEY>", "summary": "...", "issue_type": "Story", "description": "...", "additional_fields": "{\"labels\": [\"story\"], \"parent\": {\"key\": \"<EPIC>\"}}"}`
- edit: `jira_update_issue {"issue_key": "<ISSUE>", "fields": "{\"description\": \"...\"}", "additional_fields": "{\"labels\": [\"story\", \"hitl\"]}"}`
- transition: `jira_get_transitions {"issue_key": "<ISSUE>"}` then `jira_transition_issue {"issue_key": "<ISSUE>", "transition_id": "<TRANSITION>"}`; dropped: `..., "fields": "{\"resolution\": {\"name\": \"Won't Do\"}}"`
- assign: `jira_assign_issue {"issue_key": "<ISSUE>", "assignee": "<USER>"}` (empty `assignee` unassigns)
- link: `jira_create_issue_link {"link_type": "Blocks", "outward_issue_key": "<BLOCKER>", "inward_issue_key": "<ISSUE>"}`; a story under an epic on an instance that uses Epic Link: `jira_link_to_epic {"issue_key": "<ISSUE>", "epic_key": "<EPIC>"}`
- comment: `jira_add_comment {"issue_key": "<ISSUE>", "body": "Started by BMad."}` (added by Story 38.2 from `servers/jira.py` of the v0.24.4 package, `add_comment`; not among the five tools called by hand)

## Verb `query`

### REST

One work item:

```bash
# expect: HTTP 200; body keys: key, fields
curl -sS -i -H "Authorization: Bearer <PAT>" \
  "<site>/rest/api/2/issue/<ISSUE>?fields=key,issuetype,summary,status,assignee,parent,labels,issuelinks,resolution,description"
```

Must print `fields.status.name` (map it back through `[tickets.status]`; `Done` with `resolution.name` `Won't Do` is `dropped`), `fields.assignee.name`, `fields.issuelinks` (the `is blocked by` entries are `after`), `fields.parent.key`.

Children of an epic, words, and my work (JQL through `-G --data-urlencode`, so spaces and `=` are encoded):

```bash
# expect: HTTP 200; body keys: startAt, maxResults, total, issues
curl -sS -G -i -H "Authorization: Bearer <PAT>" \
  --data-urlencode "jql=parent = <EPIC> ORDER BY created ASC" \
  --data-urlencode "fields=key,issuetype,summary,status,assignee,labels" \
  --data-urlencode "maxResults=50" \
  "<site>/rest/api/2/search"
```

```bash
# expect: HTTP 200; body keys: startAt, maxResults, total, issues
curl -sS -G -i -H "Authorization: Bearer <PAT>" \
  --data-urlencode "jql=project = <KEY> AND text ~ \"setup test\" ORDER BY updated DESC" \
  --data-urlencode "fields=key,issuetype,summary,status" \
  "<site>/rest/api/2/search"
```

```bash
# expect: HTTP 200; body keys: startAt, maxResults, total, issues
curl -sS -G -i -H "Authorization: Bearer <PAT>" \
  --data-urlencode "jql=project = <KEY> AND assignee = currentUser() AND statusCategory != Done ORDER BY priority DESC, rank ASC" \
  --data-urlencode "fields=key,issuetype,summary,status,parent" \
  "<site>/rest/api/2/search"
```

The last is the 3.x "what's next" query, unchanged. `total` beyond `maxResults` means page with `startAt`. A JQL longer than a URL allows goes as `POST /rest/api/2/search` with the same keys in a JSON body.

### MCP

`jira_get_issue {"issue_key": "<ISSUE>", "fields": "key,issuetype,summary,status,assignee,parent,labels,issuelinks,resolution,description"}`; `jira_search {"jql": "parent = <EPIC> ORDER BY created ASC", "fields": "key,issuetype,summary,status,assignee,labels", "limit": 50}`; the words and my-work searches with the same JQL strings. `limit` is capped at 50 per call; page with `start_at`.

## Failure shapes (checked)

```bash
# expect: HTTP 401; body keys: message, status-code
curl -sS -i -H "Authorization: Bearer not-the-token" "<site>/rest/api/2/myself"
```

A bad token: stop and ask the user to check the PAT (expired tokens cannot be reactivated; the user creates a new one).

```bash
# expect: HTTP 404; body keys: errorMessages
curl -sS -i -H "Authorization: Bearer <PAT>" "<site>/rest/api/3/myself"
```

Data Center has no v3 API: a 404 on a path means the form is wrong, not the instance.

```bash
# expect: HTTP 400; body keys: errorMessages, errors
curl -sS -i -H "Authorization: Bearer <PAT>" -H "Content-Type: application/json" \
  -X POST --data '{"fields": {"project": {"key": "<KEY>"}, "issuetype": {"name": "Story"}}}' \
  "<site>/rest/api/2/issue"
```

A missing field: `errors.summary` names it; report it verbatim.

```bash
# expect: HTTP 404; body keys: errorMessages
curl -sS -i -H "Authorization: Bearer <PAT>" "<site>/rest/api/2/issue/<KEY>-999999"
```

A key the user cannot see or that does not exist.

```bash
# expect: HTTP 415; body keys: errorMessages
curl -sS -i -H "Authorization: Bearer <PAT>" \
  -X PUT --data '{"name": "<USER>"}' \
  "<site>/rest/api/2/issue/<ISSUE>/assignee"
```

A body without `Content-Type: application/json`.

## How the mock run is made

```bash
uv run --no-cache tools/test_jira_verbs.py            # every form above against the mock
uv run --no-cache tools/test_jira_verbs.py --mutants  # four mutants of this file, each red
```

The test starts `tools/jira_dc_mock.py` on a free port, fills the placeholders with the mock's values, runs each `curl` in file order and asserts the status line and the body keys the `# expect:` line names. `--mutants` copies this file and, one at a time, rewrites `/rest/api/2/myself` to `/rest/api/3/myself`, the assignee `PUT` to `POST`, the transition body's `transition` key to `transitionId`, and drops `Content-Type` from the create form; each copy must fail.

## Live run (for the PO; the one unverified item)

On a host that reaches the on-prem Jira, with `<site>`, `<PAT>`, `<KEY>` and a sandbox project: run the `setup` blocks first and record `version` from `serverInfo`; create the test item with the create block (it prints `<ISSUE>`); then edit, transitions, transition, assign, link (with `<BLOCKER>` any other item), comment, and the three queries; last, transition the item to Done with resolution `Won't Do` and confirm the query reads `Done` + `Won't Do` back (that is `dropped`). Each block must print the status its `# expect:` comment states on its first line; a `403` names a permission the user's role lacks (the project's Browse, Create, Transition, Assign or Link permission), a `400` on `parent` or `resolution` names a workflow difference to record in the project's store file. Paste the `serverInfo` body and the status lines into Story 38.6's gate record; the store starter's forms do not change unless a block prints something else.
