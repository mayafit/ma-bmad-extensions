# Atlassian Binding Workflow

**Goal:** Bind the upstream planning, build and product-owner skills to Jira and Confluence through their customization slots, remove that binding, or report it, with the bundled script.

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
| sub-command | the user's request: "bind atlassian" (`bind`), "unbind atlassian" (`unbind`), "atlassian status" (`status`, the default when unclear) | the script's first argument |

What the script reads, so you need not: the module answers (`jira_site`, `jira_project_key`, `confluence_site`, `planning_space` required; `tickets_space` empty means the planning space; the two MCP server names are the user's own), through `resolve_config.py`; the bind target table `{skill-root}/references/bind-targets.toml` (one slot per upstream skill, table and key); the store starter `{skill-root}/config/jira-onprem-ticketing.toml`; each target's installed `customize.toml`.

What it writes: each owned key into `{project-root}/_bmad/custom/<skill>.toml`, inside its table, between the lines `# ma-atlassian:start <table>.<key>` and `# ma-atlassian:end`; the starter's keys into `{project-root}/_bmad/custom/ticketing-store-config.toml`, only the keys that file does not yet define. It never writes a key the user set, never a key the target's `customize.toml` does not declare, never into a file that does not parse, and never touches another owner's lines.

## Flow

1. Decide the sub-command from the user's request.
2. Run exactly one command from `{project-root}`:
   - `uv run --no-cache {skill-root}/scripts/bind.py <sub-command> --project-root {project-root}`
3. Show the output verbatim. Each slot line reads `<skill> [<table>] <key>: <state>`. Then explain, one sentence each, only the lines that need the user:
   - `collision`: the user already set that key in the named file; bind left the whole file unchanged. Offer two ways: remove their own key and run bind again, or keep their value and leave that target unbound.
   - `slot missing`: the installed skill no longer declares that key; nothing was written. Say that the module and the installed BMad version disagree.
   - `refused`: the file does not parse, holds damaged `ma-atlassian` marker lines, or the written value did not resolve (the file was restored). Ask the user to repair the named file.
   - `not installed`: that upstream skill is not in the project; this is not an error.
   - `unbound: missing answer <key>`: a required answer is empty; offer to ask `bmad` to run `bmad setup ma-atlassian` to answer it, then run bind again.
   - `starter missing`: the store starter is not in this skill's folder; the store file was not written; ask the user to reinstall the module.
   - `outdated`: an answer changed since the last bind; offer to run bind again.
4. Exit 2 (`prerequisite: ...`): show the message and stop.
5. Change no file yourself. Re-running bind is safe: it writes nothing when everything is bound. Tell the user to run bind again after any module install or `bmad setup`.

{{ workflow.on_complete }}
