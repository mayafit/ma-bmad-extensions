# Confluence Page Tree Preview Workflow

**Goal:** Show the user the Confluence page tree the initiative store would publish to the planning and tickets destinations, and every collision that would make a publish refuse, without writing anything.

## On Activation

### Step 1: Execute Prepend Steps

Execute each of these steps in order before proceeding (`_None._` means skip):

{{ workflow.activation_steps_prepend }}

### Step 2: Load Persistent Facts

Treat every entry below as foundational context you carry for the rest of the workflow run. Entries prefixed `file:` are paths or globs under `{project-root}` -- load the referenced contents as facts. All other entries are facts verbatim (`_None._` means none):

{{ workflow.persistent_facts }}

### Step 3: Execute Append Steps

Execute each of these steps in order (`_None._` means skip):

{{ workflow.activation_steps_append }}

Activation is complete after all activation steps have run.

## Inputs

| Input | Where | Use |
|-------|-------|-----|
| destination | the user's request: the planning destination (`planning`), the tickets destination (`tickets`), or both (`both`, the default) | `--destination` |
| files | documents the user names, if any (default: the whole initiative store) | one `--path` per file |

What the script reads, so you need not: the module answers (`confluence_site`, `planning_space`, `planning_root_page`, `tickets_space`, `tickets_root_page`) and `core.output_folder` and `core.project_name`, through `resolve_config.py`; the file names under the output folder. It reaches no server and writes nothing.

## Flow

1. Run exactly one command from `{project-root}`:
   - `node {project-root}/_bmad/ma-atlassian/scripts/confluence_page_tree.cjs --project-root {project-root} --destination <destination>`, adding `--path "<file>"` for each named file.
2. Show the output verbatim. Then explain, one sentence each:
   - Each `destination` line: the site, the space (an empty `tickets_space` answer means the planning space) and the root page (an empty root-page answer means a page named for the project, created by the first publish).
   - The indented lines are the pages under that root page, one per Markdown file, nested as the store's folders are: a folder page carries no body, a file named after its folder is that folder's page, `tickets/` folders are not pages, and a page inside a planning run carries the run's name (`ux-checkout - DESIGN`).
   - `left out` lines: hidden files, files that are not Markdown, and files that are neither a ticket nor inside a planning run are not published.
   - `collision` lines: a publish would be refused before its first Confluence call; say which file to rename, or which answer to change (separate spaces, or one root page for both destinations).
3. Offer the check against Confluence, which reads page identities only: `node {project-root}/_bmad/ma-atlassian/scripts/confluence_collision_check.cjs --project-root {project-root} --destination <destination>`. Over REST it needs the user's personal access token in the environment variable `CONFLUENCE_PERSONAL_TOKEN` (never ask for the token itself); when the `confluence_mcp_server` answer names a server, it lists read calls instead: make them only when the user agrees, and never a create or update call. A `collision` line naming a page id means a page with that title already exists in the space outside the root page.
4. A line `prerequisite: ...` (exit 2): show it and stop. For `unbound: missing answer <key>`, offer to ask `bmad` to run `bmad setup ma-atlassian`. When `node` reports that the script cannot be found, the module's scripts are not installed in `_bmad/ma-atlassian/scripts/`: offer to ask `bmad` to run setup.
5. Change no file and publish nothing: the bound skills publish when they finish their documents (`ma-atlassian-bind`).

{{ workflow.on_complete }}
