# Confluence Root Page Record Workflow

**Goal:** Record a Confluence page as the root page of the planning or the tickets destination: check that the page exists in the destination's space, then have `bmad` change the module answer.

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
| destination | the user's request: the planning destination (`planning`) or the tickets destination (`tickets`); ask when unclear | `--destination` |
| page | the page the user names: its exact title, its page id, or its page URL; ask when missing. For "the page named for the project", use the project's name, the title the first publish gave the root page | `--page` |

What the script reads, so you need not: the module answers and `core.project_name`, through `resolve_config.py`; the page's identity in Confluence (id, title, space, parent), never its content.

## Flow

1. Run exactly one command from `{project-root}`, quoting the page:
   - `node {project-root}/_bmad/ma-atlassian/scripts/confluence_publish.cjs resolve --project-root {project-root} --destination <destination> --page "<page>"`
2. Show the output verbatim, then act on it:
   - `found: ...` and `answer: modules.ma-atlassian.<destination>_root_page = "<title>"`: go to step 3 with that exact title.
   - `answer: ... already is "<title>"`: the page is already recorded; say so and stop.
   - `not found: ...` or `refused: ...` (the page is in another space): tell the user, ask for another page, and stop.
   - `resolve through the MCP server ...`: make the one read call it lists. When the page exists and its space is the destination's space, its exact title is the value; go to step 3. Otherwise tell the user and stop.
   - `prerequisite: ...` (exit 2) or `failed: ...`: show it and stop. A missing token means the user's personal access token is not in the environment variable `CONFLUENCE_PERSONAL_TOKEN`; never ask for the token itself.
3. Ask `bmad` to change the answer `modules.ma-atlassian.<destination>_root_page` of module `ma-atlassian` to the exact title (the Answers step of `bmad setup`, which keeps every other answer). Do not edit a configuration file yourself.
4. Tell the user to run `ma-atlassian-bind bind` again: the bound skills name the root page, and `ma-atlassian-bind status` reports them `outdated` until then. Pages published under another root page stay where they are; the next publish places new pages under the recorded one.

{{ workflow.on_complete }}
