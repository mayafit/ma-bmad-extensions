# SQA Audit Workflow

**Goal:** Comprehensive project quality audit by Gadi: code-to-story traceability, story-to-architecture alignment, process compliance, delivery flow health and release state, with a saved report.

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

### Step 4: Resolve the project

Read the output folder once: `uv run --no-cache {project-root}/_bmad/scripts/resolve_config.py --project-root {project-root} --key core.output_folder`; `<output folder>` below is that value. Epics and stories are read from the ticket tree with `uv run --no-cache {project-root}/_bmad/method/scripts/tickets.py --project-root {project-root} status <initiative>` (the `epics` list and every ticket row, each with its `state`); planning documents sit in `<output folder>/initiative-*/` (`prd-*/`, `architecture-*/`, `ux-*/`, each folder holding a main file named after it).

Activation is complete after all activation steps have run.

## Purpose
Perform a structured quality audit of the project, reporting findings per dimension with severity levels (PASS / WARNING / FAIL). The audit produces a written report saved to the output folder.

---

## Step 1 — Scope Selection

Ask the user:

> "Welcome to the SQA Audit. Would you like to run a **full audit** (all dimensions) or a **partial audit** (select specific areas)?
>
> Available audit dimensions:
> 1. **Code ↔ Stories**: Verify that implemented code corresponds to active/done stories
> 2. **Stories ↔ Architecture & PRD**: Verify that epics and stories align with the architecture and product requirements
> 3. **Process Compliance**: Verify adherence to the defined development process (branching, commits, testing, reviews)
> 4. **Delivery Flow Health**: Analyze the flow of tickets through the tree: what is in progress, blocked, waiting, and how long the remaining chain is
> 5. **Release State**: Review the status of releases, deployments, and delivery readiness
>
> Type **'full'** to run all dimensions, or list the numbers of the dimensions you want (e.g., '1,3,5')."

Wait for user response. Store the selected dimensions as <audit scope>.

---

## Step 2 — Data Collection

Before running any audit dimension, collect the following project artifacts:

### Required reads
- `<output folder>/initiative-*/prd-*/*.md` — product requirements (if exists).
  If this file is an INDEX for a sharded PRD, also read `<output folder>/initiative-*/prd-*/**/*.md`
  (capability shards) — the index alone carries no requirement text.
- `<output folder>/initiative-*/architecture-*/*.md` — architecture doc (if exists).
  If this file is an INDEX for a sharded architecture, also read
  `<output folder>/initiative-*/architecture-*/**/*.md`.
- the ticket tree's epics (`tickets.py status <initiative>` lists them; each is `<initiative>/tickets/epic-*/epic-*.md`) — epics (if exists)
- the ticket tree: `uv run --no-cache {project-root}/_bmad/method/scripts/tickets.py --project-root {project-root}` `status <initiative>` and `status backlog` — every epic, story and bug with its `state`

### Optional reads (load if they exist)
- `{project-root}/AGENTS.md` (the `bmad:context` block) — project context summary
- The plan (`*-plan.md`) and leaf file of every ticket whose row is `in-progress`, `review` or `done`, from the `plan` and `story_file` paths `tickets.py find` returns

Inform the user which artifacts were found and which were missing before proceeding. Missing artifacts for a dimension will result in a SKIPPED status for that dimension.

---

## Step 3 — Run Selected Audit Dimensions

**Scope guard:** For each dimension below, only execute if that dimension's number is in <audit scope>. Skip silently — do not mention skipped dimensions until the report.

Run each selected dimension in order. For each dimension, produce a findings block (see format below).

### Dimension 1 — Code ↔ Stories Traceability

**Goal:** Verify that code in the repository corresponds to stories marked as done or in-progress, and that no significant code exists without a backing story.

**Process:**
1. List the rows whose `state` is `done` or `in-progress` in `tickets.py status <initiative>` and `status backlog`
2. For each story/task, check whether the described changes can be traced to actual code (ask the user to confirm or provide relevant file paths if direct code scanning is not feasible)
3. Identify stories marked done but with no apparent code changes (ask user to verify)
4. Identify significant recent commits (from git log summary if available) not linked to any story
5. Report gaps

**Findings format:**
- List each story ID and its traceability status
- Flag any untraced code changes
- Flag any stories with no code evidence

---

### Dimension 2 — Stories ↔ Architecture & PRD Alignment

**Goal:** Verify that the epics and stories correctly implement the requirements in the PRD and are consistent with the architecture.

**Process:**
1. For each epic in epics.md, identify the corresponding PRD section(s)
2. Check that epic goals are derived from PRD requirements — flag any epic with no clear PRD backing
3. For each epic/story with technical decisions, check alignment with architecture.md:
   - Technology choices match the architecture
   - System boundaries and component assignments are respected
   - Non-functional requirements (NFRs) from the PRD are reflected in stories
4. Flag any stories that introduce architectural decisions not documented in architecture.md
5. Flag any PRD requirements with no corresponding epic/story

**Findings format:**
- PRD coverage table (requirement → epic/story mapping, with COVERED / MISSING / PARTIAL)
- Architecture compliance issues list

---

### Dimension 3 — Process Compliance

**Goal:** Verify that the team is following the defined development process.

**Process:**
1. Check for the presence of a git-workflow-skill or equivalent branching policy definition
2. Retrieve recent git log using available git tools (run `git log --oneline -20` directly). Fall back to asking the user to paste the output only if tool execution fails or is not permitted:
   - Are commit messages following conventional commit format?
   - Are changes going through feature branches and PRs (not committed directly to main)?
3. Check for test coverage evidence:
   - Are test files present alongside implementation files for new code?
   - Are there failing tests in the repository?
4. Check for code review evidence (PR descriptions, review comments) if accessible
5. Check that story files are being maintained (status updates, implementation notes)

**Findings format:**
- Process checklist with PASS / FAIL / UNKNOWN per item
- Specific violation examples with file/commit references where available

---

### Dimension 4 — Delivery Flow Health

**Goal:** Assess how work flows through the ticket tree: 4.x has no sprints; order comes from `tickets.toml` build order and `after`, and the board is `tickets.py`.

**Process:**
1. Run `uv run --no-cache {project-root}/_bmad/method/scripts/tickets.py --project-root {project-root}` `status <initiative>` and `status backlog`; keep `counts`, `epics`, every row's `state`, `after`, `waiting_on`, `blocked_reason`, and `longest_remaining_chain`
2. For each epic whose `status` is `in-progress`:
   - Calculate completion (rows `done` / rows total)
   - Flag rows `in-progress` or `review` whose plan has not changed for an unusually long time (git log on the plan file)
   - List `blocked` rows with their `blocked_reason` and `waiting_on`, and `unknown` questions that gate an entry
3. Report `problems`, `drift`, `unpinned_after`, `undeclared_after` and `order_conflict` as process findings (each is something Sofia, `bmad-agent-po`, fixes with the user)
4. Assess backlog health:
   - Are backlog tickets refined (criteria, `risk`, a `verify` line) and is build order deliberate?
   - Are there leaf files no entry lists (unlisted rows), or plans whose `ticket` names nothing?

**Findings format:**
- Per-epic summary table (epic, total rows, done, in-progress, review, backlog, blocked, completion %)
- Risk flags (stalled, blocked, unknowns, the longest remaining chain)
- Backlog health summary

---

### Dimension 5 — Release State

**Goal:** Assess the readiness and status of releases and deployments.

**Process:**
1. Ask the user: "Do you have a release tracking document, deployment pipeline, or version file? If so, please share the path or content."
2. Check for version files in the project (package.json, version.txt, CHANGELOG.md, etc.)
3. Identify which stories/epics are included in the current or upcoming release
4. Verify that all stories slated for the release are marked done
5. Check for open bugs or blockers tagged to the current release
6. Ask about deployment status: "Has the current release been deployed to any environment? If so, which ones?"
7. Identify any release-critical stories that are still in-progress or not started

**Findings format:**
- Release readiness summary (READY / AT RISK / NOT READY)
- List of blocking items preventing release
- Deployment status per environment (if available)

---

## Step 4 — Audit Report

After running all selected dimensions, compile a full audit report.

### Report format

```
# SQA Audit Report
**Date:** {today's date}
**Auditor:** Gadi (SQA Agent)
**Scope:** {list of audited dimensions}
**Overall Status:** PASS | WARNING | FAIL

---

## Executive Summary
{2-4 sentences summarizing the overall quality posture of the project}

---

## Findings by Dimension

### [Dimension Name]
**Status:** PASS | WARNING | FAIL | SKIPPED
**Summary:** {one-line summary}

#### Issues Found
| Severity | Item | Detail | Recommendation |
|----------|------|--------|----------------|
| FAIL     | ...  | ...    | ...            |
| WARNING  | ...  | ...    | ...            |

#### Observations
{Any noteworthy observations that are not blocking issues}

---

## Action Items
{Prioritized list of recommended corrective actions}

| Priority | Action | Owner (if known) | Related Dimension |
|----------|--------|------------------|-------------------|
| P1       | ...    | ...              | ...               |

---

## Skipped Dimensions
{List dimensions that were skipped due to missing artifacts, and what artifacts are needed to run them}
```

### Severity definitions
- **FAIL**: A clear gap or violation that should be resolved before continuing or releasing
- **WARNING**: A concern that should be addressed but is not immediately blocking
- **PASS**: The dimension meets quality expectations

### Overall status rule
- If any dimension is FAIL → overall is FAIL
- If no FAIL but any WARNING → overall is WARNING
- All PASS or SKIPPED → overall is PASS

---

## Step 5 — Save Report

Save the report to:
`<output folder>/sqa-audit-report-<YYYY-MM-DD>.md`

Inform the user of the saved path.

Then, for each FAIL finding in the report, present it one at a time and ask:
> "Would you like me to create a backlog story for this issue: [finding summary]? (yes/skip)"

Wait for the user's response before proceeding to the next FAIL. If yes, ask `bmad-agent-po` (Sofia) to **file a bug** for that item; she creates it in the configured ticket store, and this workflow never writes a ticket file. The user may accept or skip each item individually. Once all FAILs have been offered, ask:
> "Would you like me to generate a remediation plan for all findings? This will produce a prioritized corrective-action document saved alongside the audit report."

If yes, generate and save a remediation plan to:
`<output folder>/sqa-remediation-plan-<YYYY-MM-DD>.md`

### Remediation Plan Format

```
# SQA Remediation Plan
**Date:** {today's date}
**Auditor:** Gadi (SQA Agent)
**Source Report:** sqa-audit-report-<YYYY-MM-DD>.md
**Scope:** {audited dimensions}

---

## Summary

{1-2 sentences: number of findings, overall risk level, key themes}

---

## Corrective Actions

| Priority | Dimension | Finding | Corrective Action | Target State | Effort | Owner |
|----------|-----------|---------|-------------------|--------------|--------|-------|
| P1       | ...       | ...     | ...               | ...          | Low/Medium/High | ... |

**Priority definitions:**
- P1 — FAIL severity; must be resolved before the next release
- P2 — WARNING severity; should be resolved in the next tickets to start
- P3 — Observation; address when capacity allows

---

## Resolution Tracking

{Instructions to the team: update this table as items are resolved; re-run the audit after P1 items are addressed to verify closure}
```

Inform the user of the remediation plan path and ask if they want to review any finding in more detail.

{{ workflow.on_complete }}
