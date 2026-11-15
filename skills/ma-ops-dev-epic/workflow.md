{% if workflow.parallelism_strategy not in ("waves", "sequential", "full") %}{{ halt("workflow.parallelism_strategy must be waves, sequential or full, not " ~ workflow.parallelism_strategy) }}{% endif %}
{% if workflow.build_skill not in ("bmad-build", "bmad-build-auto") %}{{ halt("workflow.build_skill must be bmad-build or bmad-build-auto, not " ~ workflow.build_skill) }}{% endif %}
# Epic Orchestration Workflow

**Goal:** Drive one epic of the ticket tree from its planned stories to a reviewed, integrated result, story by story, with Sofia (`bmad-agent-po`) moving each story's card and the upstream build and review skills doing the work.

**Your role:** You are the epic orchestrator. You do not write story code yourself. You read the epic through `tickets.py`, order its stories into waves, ask Sofia to start each story, run the build and review skills on it, ask Sofia to mark it done, and end with an epic-level review gate. You never edit a plan's `status` line, never write a ticket file, and publish nothing unless `on_epic_complete` says so.

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

### Step 4: Check the tools this run needs

1. The ticket tree. `{project-root}/_bmad/method/scripts/tickets.py` must exist (it is installed by `bmad-agent-po`, a required skill of this module). Absent: tell the user "`bmad-agent-po` is not installed, so there is no ticket tree to orchestrate; install it with `npx skills add bmad-code-org/BMAD-METHOD --skill bmad-agent-po` and run `bmad setup method`", and stop. From here, `tickets.py` means `uv run --no-cache {project-root}/_bmad/method/scripts/tickets.py --project-root {project-root}`.
2. The build and review skills: `bmad-build`, `bmad-build-auto`, `bmad-code-review`, `bmad-review` and `bmad-walkthrough`, each a folder beside this skill's folder (`{skill-root}/../<name>/`). `bmad-build` is required by this module; for each other one that is absent, say so once and skip the step that uses it (an absent `bmad-build-auto` means every story runs through `bmad-build`).
3. The recommended `ma-standards` skills, checked the same way: `git-workflow-skill` (worktree per story, conventional commits, hooks) and `code-review` (self-review of the epic diff). For each one that is absent, tell the user once: "`<name>` is not installed; this run proceeds without <the worktree steps | the self-review step>. Install it with `npx skills add mayafit/ma-bmad-extensions --skill <name>` (listed under `recommended_skills` in `{skill-root}/../bmod-ma-ops/bmod.toml`)." Record the degraded mode in the run ledger. Never stop for a missing recommendation.
4. The output folder: `uv run --no-cache {project-root}/_bmad/scripts/resolve_config.py --project-root {project-root} --key core.output_folder`; `<output folder>` below is that value.

Activation is complete after all activation steps have run.

## Conventions

- Every read of an epic or a story goes through `tickets.py` (`status`, `next`, `find`), never through a tracker file: this skill reads no sprint tracker file and writes none.
- Every change of a story's status is a request to Sofia: "start story `<ref>`" before the build, "mark story `<ref>` done" after the reviews. Sofia moves the card in the configured store (the plan on the repo store, the tracker item on a tracker store). You never run `tickets.py mark` and never edit a `*-plan.md`.
- Subagents, when the host offers them, run the per-story pipeline (`{{ rendered("references/story-pipeline.md") }}`); launch a wave's subagents in one message and wait for all of them. Without subagents, run the pipeline for one story at a time in this session and say that parallelism is off.
- Paths: `{skill-root}` is this skill's folder; `<epic folder>` is the epic's folder under the initiative's `tickets/`; the run ledger is `<epic folder>/ma-ops-dev-epic-run.md`, beside the epic file and its retrospective, never inside `tickets/`.

## Step 1: Intake

1. Locate the epic. `tickets.py status` on the active initiative (or the initiative the user names) lists `epics`; select the one the user named by `id`, `slug` or title. None named: list the candidates whose `status` is not `done` or `dropped` and stop for the user to choose. An epic whose rows are all `done` or `dropped`: say so and stop.
2. Read the epic file (`<epic folder>/epic-<slug>.md`) in full, then `tickets.py status <epic folder>`: every row with `id`, `title`, `state`, `after`, `hitl`, `plan_checkpoint`, `done_checkpoint`, `unknown`, `blocked_reason`. Rows already `done` or `dropped` are skipped (satisfied prerequisites); tell the user which.
3. Readiness: run `tickets.py next <epic folder>`.
   - Exit 2 with `sync ticket status from the tracker first` means the store is a tracker (Jira, GitHub, ...): ask Sofia to **sync the board** for this epic (her Tracker sync), then run `tickets.py next <epic folder> --synced`. Pass `--synced` on every later `next` in this run.
   - Exit 1: show the error, let Sofia fix the tree with the user (`problems`, `drift`, `unpinned_after`), and stop.
   - An entry with an `unknown` question: Sofia settles it with the user before the run; until then that entry and its dependents are out of this run.
4. Ask the run questions as one grouped set, defaults from the customization: the model each tier maps to (`{{ workflow.review_tier_model }}` for review, `{{ workflow.exec_tier_model }}` for build; one model for both when only one exists), the build skill (`{{ workflow.build_skill }}`), the parallelism strategy (`{{ workflow.parallelism_strategy }}`), stories per wave (`{{ workflow.max_parallel_stories }}`), the fix-loop cap (`{{ workflow.fix_loop_cap }}`), and the project's verification command for the epic gate (propose what the repository's `AGENTS.md` or CI names). Accept "use defaults".
5. Write the run ledger: epic, the stories in scope with their ids, the skipped rows, the resolved configuration, the degraded modes, the store kind. Present it in one block and stop for a single go / no-go. After "go", the run proceeds unattended to the end; it stops only on a blocker, on a row's `plan_checkpoint` / `done_checkpoint`, and on a story whose `hitl` is set (that story runs through `bmad-build` with the user).

## Step 2: Waves

1. Dependencies come from each row's `after` (sibling ids, `<epic id>.<id>` cross-epic references, `epic-<slug>` gates), as `tickets.py` resolves them: a prerequisite is met when its row is `done` or in `review`; a `dropped` one still blocks. A cross-epic prerequisite that is not met puts the story outside this run; say which.
2. Strategy `waves`: wave k holds every story whose prerequisites are all in waves before k, in build order (table order of `tickets.toml`); a wave larger than the cap runs in batches. `sequential`: one story per wave, build order. `full`: one wave of everything (warn once that `after` is ignored).
3. A cycle (`tickets.py` reports it, or the sort finds one): stop and show it; Sofia resolves it with the user.
4. Record the wave plan in the ledger and show it in one block. Do not stop here unless the plan contradicts what the user expects (every story sequential when they asked for parallelism).

## Step 3: Integration branch

With `git-workflow-skill` installed: follow it to create the epic worktree and branch `feature/epic-<epic id>` from the trunk (its `start` with `--base <trunk>`; confirm the trunk name), install its hooks, and record the worktree path in the ledger. Each story then gets its own worktree and branch `feature/epic-<epic id>-story-<id>` cut from the epic branch, merged back with `--no-ff` by you, one at a time. The trunk is never committed to.

Without it: work on the current branch in the working tree, one story at a time regardless of the wave plan (there is no isolation for parallel builds), commit after each story with a Conventional Commits message, and record `degraded: no worktrees` in the ledger.

## Step 4: Run the waves

For each wave, in order:

1. **Start.** For each story of the wave: ask Sofia to **start story `<ref>`** (`<ref>` as `tickets.py find` names it). On the repo store she writes nothing and hands the ticket over; on a tracker she publishes it if needed, transitions it to in-progress and mirrors. When she reports the story assigned to someone else or not ready, leave it out of the wave and record why.
2. **Build and review.** Launch the per-story pipeline of `{{ rendered("references/story-pipeline.md") }}` for each started story: `{{ workflow.build_skill }}` (or `bmad-build` for a `hitl` story), then `bmad-code-review`, `bmad-review` on the story diff, and `bmad-walkthrough` prepared for the user; blocking findings loop through the build skill up to `{{ workflow.fix_loop_cap }}` times. The pipeline returns `ready`, `blocked` or `needs-split` with its evidence. Mark each story's state in the ledger as it returns.
3. **`plan_checkpoint` / `done_checkpoint`.** A row with `plan_checkpoint` stops after its plan is written for the user to approve it; a row with `done_checkpoint` stops after it is integrated until the user says continue.
4. **Integrate.** For each `ready` story, serialized: with worktrees, merge the story branch into the epic branch with `--no-ff` from the epic worktree and run the project's verification command there; a failure is a blocking finding against the story just merged (one fix round, else `blocked`). Then ask Sofia to **mark story `<ref>` done**: she sets `done` on the plan through `mark` (repo store) or transitions the tracker item (tracker store), and the store moves its card. Remove the story worktree per `git-workflow-skill`.
5. **Blocked.** A story that exhausts the fix cap, cannot pass verification, or returns `blocked` from `bmad-build-auto` stays as the builder left it (`bmad-build-auto` wrote `blocked` and the reason to its plan; you change nothing). Tell Sofia the story is blocked and why, so the board shows it. Its dependents are `blocked (upstream)` and leave the run. Never drop a blocked story silently.
6. **`needs-split`.** The pipeline found the story too large or multi-goal and built nothing: hand the proposal to Sofia (her REPLAN re-slices the entry with the user) and stop; the user re-runs this skill after the re-slice.
7. Persist the ledger after every integration and at the end of the wave. The next wave starts only when every story of this one is `done`, `blocked` or out of the run.

## Step 5: Epic gate

1. **Self-review** (with `code-review` installed): run it on the whole epic diff (`<trunk>...feature/epic-<epic id>`, or the commits of this run); fix what it finds through one more build round per finding, within the fix cap; otherwise record the finding for the report.
2. **Epic-level review**: run `bmad-review` on the whole epic diff with its adversarial lens, against the epic file's Requirements and Done when: coverage of every `covers` id, cross-story coherence (contradictions, duplicated abstractions, dead code from parallel builds), regressions in untouched areas. Blocking findings get a scoped fix round and a re-review; findings that cannot be cleared stop the run here with the list.
3. **Verification**: the project's verification command on the integrated result; a new failure blocks the gate.
4. Record the gate verdict in the ledger. On pass, run the user instruction below, if any; it is the only place this run publishes, pushes, tags or opens a pull request:

{{ workflow.on_epic_complete }}

When it is empty, nothing is pushed: say that the epic branch (or the commits) is ready for the user to push and open a pull request with `git-workflow-skill`'s `finish`, or by hand.

## Step 6: Report

Present, from the ledger: the epic and its stories with their final `tickets.py` states (`done`, `blocked` with the reason, out of the run with the reason), fix rounds per story, the review verdicts, the gate verdict, what `on_epic_complete` did, and every item that needs the user (blocked stories, findings left open, the push). Persist the ledger. Remove any story worktree left over and keep the epic worktree until the user has merged. Suggest `bmad-retrospective` on the epic once it is merged, and Sofia's REPLAN for the blocked stories.

{{ workflow.on_complete }}
