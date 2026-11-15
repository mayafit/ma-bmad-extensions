# Project Context Expansion Workflow

**Goal:** Turn the patterns a retrospective surfaced into approved standing rules for AI agents.

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

Post-retrospective companion workflow: turn the patterns and conventions a sprint or an epic surfaced into standing rules for AI agents. The agent proposes additions; the human decides what gets written. Run it at the end of `bmad-retrospective`, or standalone when the user says "expand project context".

## Where the rules live

Read the output folder once: `uv run --no-cache {project-root}/_bmad/scripts/resolve_config.py --project-root {project-root} --key core.output_folder`. The rules document is `<output_folder>/project-context.md`, and the section this skill maintains is `## Project-Specific Rules` in it. No other section is ever touched.

When that file does not exist, say so and stop; offer the v7 way instead: upstream `bmad-project-context` (when installed) keeps a managed `<!-- bmad:context -->` block in `AGENTS.md`, and its `record` intent adds a rule the moment an agent gets something wrong. Do not create `project-context.md` yourself.

## Flow

### Step 1: Read the current rules

Read `<output_folder>/project-context.md` in full. Extract the `## Project-Specific Rules` section: from that heading to the next `##` heading or the end of the file. Show it to the user under the heading "Current Project-Specific Rules" (say "empty" when it holds only a placeholder comment or nothing).

### Step 2: Gather the sprint's patterns

- When this session holds a retrospective (the workflow was invoked right after `bmad-retrospective` and its findings are in context), use that discussion as the source and go to Step 3.
- Otherwise ask: "Briefly describe the patterns or conventions you want to add to Project-Specific Rules — for example, 'agents kept omitting error handling in async functions' or 'all PRs need a test-plan section'. Say 'run retrospective first' to cancel." On cancel, say that `bmad-retrospective` gives the best input and stop; nothing is changed.

From the source, identify what should become a standing rule for agents:

- coding conventions agents got wrong or needed correcting on;
- patterns agents should apply consistently in this project;
- architectural decisions agents must respect that are not obvious from the code;
- testing or review conventions specific to this project;
- anti-patterns agents kept producing that should be explicitly prohibited;
- workflow or communication rules specific to the team.

Filter out what belongs elsewhere: technology-stack facts (the `## Technology Stack` section, maintained by its own generator), mandatory pre-task rules (`## AI Agent Mandatory Rules`, set at install time), and anything already stated in the current rules. When nothing remains, tell the user "No new rules to propose; the section is up to date", and stop.

### Step 3: Propose

Draft each addition as one clear, imperative rule: a single actionable statement ("Always use X when Y"), specific enough to change agent behaviour, distinct from every existing rule. Show the list under "Proposed Additions to Project-Specific Rules", and state that, once approved, the lines are appended to that section and govern every future agent session.

### Step 4: Human review gate

Ask the user to choose: **accept all**, **reject all**, or **edit** (describe which rules to keep, drop or reword). On reject, say "Expansion skipped; no changes made" and stop. On edit, apply the edits, show the revised list, and ask again; a second rejection stops with no change.

### Step 5: Write

Re-read the file (it may have changed), locate `## Project-Specific Rules`, and append the approved rules at the end of that section, before the next `##` heading, with one blank line as separator when the section is not empty. Preserve every existing line in place; do not reorder, reformat or touch any other section. Save the file and report: the file path, the number of rules added, and that the user should commit `project-context.md` so the rules are shared with the team.

{{ workflow.on_complete }}
