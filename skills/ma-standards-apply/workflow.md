# Standards Block Workflow

**Goal:** Write the ma-standards block into the project's instruction files, or remove it, through the bundled script.

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
| sub-command | the user's request: "apply the standards" (the default) or "remove the standards block" | `apply` or `remove` |
| files | file names the user gives, else the default set | one `--file <name>` per file, or `--all` |

The block is the lines between `<!-- ma-standards:start -->` and `<!-- ma-standards:end -->`. Its content is one line per installed `ma-standards` skill, taken from the module's `help/help.md`, so an agent reading the instruction file knows which standard to activate for which work. This skill owns that block and nothing else (FR301): it never touches the installer's `<!-- ma-agents:start -->` block, upstream's `<!-- bmad:context -->` block, or the user's prose, and it never edits the block by hand.

Targets. `AGENTS.md` is always written (created when absent). `CLAUDE.md`, `.clinerules` and `.github/copilot-instructions.md` are written when they already exist, or when named with `--file` or `--all` (then created). A `CLAUDE.md` whose every non-blank line is an `@<file>` import (what v7 `bmad-project-context` adoption leaves behind) gets no block: the block lives in `AGENTS.md`, which that import loads, and the skip is reported. `.roomodes` is JSON or YAML, not Markdown: when it exists as JSON with a `customModes` list, the block is one entry of that list (slug `ma-standards`), set and removed structurally; a YAML `.roomodes` is reported and left untouched; `.roomodes` is never created.

## Flow

1. Decide the sub-command: `apply` unless the user asks to remove the block.
2. Run exactly one command from `{project-root}`:
   - apply: `uv run --no-cache {skill-root}/scripts/apply_block.py apply --project-root {project-root}` — add `--all` to create every Markdown instruction file, or `--file <name>` once per file to write only those.
   - remove: `uv run --no-cache {skill-root}/scripts/apply_block.py remove --project-root {project-root}`.
3. Show the output verbatim: one `<file>: <action>` line per target (`created`, `appended`, `replaced`, `unchanged`, `removed`, `deleted`, `absent`, or `skipped (<reason>)`). Add one sentence for a `skipped` line, using the reason it gives.
4. Exit 1 (`refused: ambiguous markers ...`): the file holds duplicated, unbalanced or out-of-order `ma-standards` markers; show the message, ask the user to repair the file, and change nothing. Exit 2 (`prerequisite: ...`): show the message and stop; the usual cause is the `bmod-ma-standards` record not being installed beside this skill.
5. Change no other file. Writing is idempotent and byte-preserving: every byte outside the block, line endings included, stays as it was; running `apply` twice writes nothing the second time; `remove` restores a file to its pre-apply bytes and deletes it only when nothing but whitespace remains.

{{ workflow.on_complete }}
