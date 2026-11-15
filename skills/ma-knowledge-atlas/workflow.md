# Knowledge Atlas Workflow

**Goal:** Render the initiative store under `core.output_folder` into the Knowledge Atlas, a self-contained HTML site, in the folder `modules.ma-knowledge.atlas_output` names.

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

## What the Atlas is

A static site, offline by construction (no network at generation or view time), with one page per document of the initiative store, a ticket board per initiative, one page per ticket with its plan status, the entity graph (requirements, epics, stories, bugs, decisions), diagrams and full-text search. Its inputs are the `initiative-*/` envelopes, every `tickets/**/tickets.toml` and the `status` of every `*-plan.md` under the output folder, plus the Markdown and diagram files kept in those folders and under `backlog/` (FR305). It reads no sprint tracker and no configuration file of an earlier BMad: tracker and configuration formats (YAML, JSON, TOML) are never shown, the `archive-v6/` folder a migration leaves is skipped, and the engine runs on a staged copy of the store, never on the project itself.

## Ticket store check

Before anything else, check whether `{project-root}/_bmad/method/scripts/tickets.py` exists.

- **Present:** the `method` module keeps the initiative store this skill renders; continue.
- **Absent:** tell the user once: "No ticket store is available (`_bmad/method/scripts/tickets.py` is not installed): the `method` module that keeps the initiative store is not set up here, so the Atlas renders whatever `initiative-*/` folders the output folder already holds." Continue; the engine needs no `tickets.py`.

## Flow

### Step 1: Resolve the folders

Read both settings with one call:

`uv run --no-cache {project-root}/_bmad/scripts/resolve_config.py --project-root {project-root} --key core.output_folder --key modules.ma-knowledge.atlas_output`

- `core.output_folder` is the initiative store, printed as setup wrote it (usually `{project-root}/_bmad-output`; the script expands `{project-root}`, and a relative value is relative to `{project-root}`). When the call fails or the key is absent, BMad is not set up in this project: say so, offer `bmad setup`, and stop.
- `modules.ma-knowledge.atlas_output` is the Atlas folder, in the same forms. Empty or absent means `<output_folder>/knowledge-atlas`. The folder is replaced whole on every run, so it must be a folder of its own: not the project root, not the output folder, not a folder that holds the store.

Tell the user the two resolved paths in one line.

### Step 2: Build the Atlas

Run exactly one command from `{project-root}`:

`uv run --no-cache {skill-root}/scripts/build_atlas.py --project-root {project-root} --output-folder <output_folder> --out <atlas_output> --engine {skill-root}/assets/atlas.cjs`

The script stages the store, runs the engine (`{skill-root}/assets/atlas.cjs`, with `node`; Node.js 18 or newer is required) and replaces `<atlas_output>` with the site. Its first stdout line is the path of `index.html`; the next lines count initiatives, epics and tickets and list every problem the store has (a plan naming no ticket, a status the ticket tree does not know, an epic folder a breakdown names that does not exist). Show those lines verbatim.

- Exit 2 (`prerequisite: ...`): show the message and stop. The usual causes are `node` missing from PATH, the output folder not existing yet, or `<atlas_output>` being refused because it is not a folder of its own or holds something that is not a previous Atlas; in that last case ask the user for another folder, or to set `atlas_output` through `bmad setup ma-knowledge`, and change nothing.
- Exit 1 (`error: ...`): the engine failed; show its output and stop.

### Step 3: Report

Tell the user where `index.html` is and that the site opens from the file system in any browser. Open it only when asked, with the platform opener (`start "" <path>` on Windows, `open <path>` on macOS, `xdg-open <path>` on Linux); in a headless or remote session give the path instead. Suggest adding the Atlas folder to `.gitignore` when it is not ignored yet and sits under the repository.

The skill changes nothing but the Atlas folder.

{{ workflow.on_complete }}
