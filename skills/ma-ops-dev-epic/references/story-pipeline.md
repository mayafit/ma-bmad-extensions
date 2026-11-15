# Per-story pipeline

The self-contained instruction set the orchestrator hands to each story subagent (or follows itself when the host offers no subagents). The subagent owns exactly one story in exactly one worktree, never touches the epic branch, never changes a plan's `status` line, and never asks Sofia for anything: the orchestrator started the story before launching it and marks it done after it returns.

## Inputs (filled by the orchestrator)

```
PROJECT_ROOT    = <absolute path>
STORY_REF       = <ref as `tickets.py find` names it>
STORY_ID        = <id>            EPIC_FOLDER = <epic folder path>
PLAN            = <plan path from `tickets.py find`>   STORY_FILE = <story_file path, or none>
EPIC_BRANCH     = feature/epic-<epic id>               (none when worktrees are off)
STORY_BRANCH    = feature/epic-<epic id>-story-<id>    WORKTREE = <path>  (none when worktrees are off)
BUILD_SKILL     = bmad-build-auto | bmad-build
EXEC_MODEL      = <model>         REVIEW_MODEL = <model>
FIX_LOOP_CAP    = <n>
VERIFY_CMD      = <the project's verification command>
HITL            = true | false
```

## Setup

With a worktree: create it per `git-workflow-skill` (`start` with the base overridden to `EPIC_BRANCH`), work only inside it, commit with Conventional Commits messages scoped to the story, honor the hooks. Without one: work in the working tree on the current branch and commit after each step.

## Pipeline

1. **Build** — `BUILD_SKILL` [EXEC_MODEL]. Hand it the ticket (`STORY_REF`); it reads the entry or the story file and the epic, writes the plan `PLAN` with the ticket's criteria, implements, verifies and writes `draft` through `built` into the plan itself. A `HITL` story, or `BUILD_SKILL = bmad-build`, runs with the user in the loop. `bmad-build-auto` halting with `blocked` has already written the reason to the plan: return `blocked` with it, change nothing.
   **Size gate**: when the plan reveals more than one independent shippable goal, or more work than one pipeline run can finish and verify, build nothing and return `needs-split` with a proposal (the smallest set of single-goal stories, each with its criteria and prerequisites). The orchestrator hands it to Sofia.
2. **Code review** — `bmad-code-review` [REVIEW_MODEL] on the story diff, against the plan and the ticket.
3. **Review lenses** — `bmad-review` [REVIEW_MODEL] on the same diff: the adversarial and edge-case lenses at least.
4. **Fix loop** [EXEC_MODEL]. Triage the findings of 2 and 3: blocking (a criterion unmet, a broken rule of `AGENTS.md`, a bug, a security issue, a failed build) versus non-blocking. For blocking findings run `BUILD_SKILL` again on the finding, commit, and re-review only the changed surface; at most `FIX_LOOP_CAP` rounds. Findings still blocking after the cap: return `blocked` with them. Non-blocking findings go in the notes, unfixed by design.
5. **Verify** — run `VERIFY_CMD` on the story branch. A failure is a blocking finding (one more fix round within the cap).
6. **Walkthrough** — `bmad-walkthrough` on the story's commits, written for the user; attach its path or text to the result.

## Definition of ready

All must hold, else the story is `blocked`:

- every criterion of the ticket is implemented and the plan's own verification passed (the plan reads `built`);
- no blocking finding remains from the code review or the lenses;
- `VERIFY_CMD` passes on the story branch;
- every change is committed with a Conventional Commits message.

## Return value

```
{
  "story_ref":           "<STORY_REF>",
  "status":              "ready" | "blocked" | "needs-split",
  "branch":              "<STORY_BRANCH or none>",
  "worktree":            "<WORKTREE or none>",
  "commits":             [ "<sha> <subject>", ... ],
  "plan":                "<PLAN>",
  "unresolved_findings": [ "<blocking finding>", ... ],
  "split_proposal":      [ { "title": "...", "criteria": [ ... ], "after": [ ... ] }, ... ],
  "fix_rounds_used":     <n>,
  "walkthrough":         "<path or text>",
  "notes":               "<non-blocking findings, decisions, caveats>"
}
```

Do not merge into `EPIC_BRANCH`, do not run `tickets.py mark`, do not edit the plan's `status`, and do not ask Sofia for anything: the orchestrator integrates, and Sofia moves the card.
