# Auto Bug Detection Workflow

**Goal:** Find and report defects in delivered code, and file confirmed ones in the ticket store.

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

Proactively identify and report defects found in already-delivered code during every session, and file confirmed defects in the ticket store. Do not silently ignore bugs in delivered code.

## Ticket store check

Before anything else, check whether `{project-root}/_bmad/method/scripts/tickets.py` exists.

- **Present:** the ticket store is available. Delivered-or-in-progress is decided from it (below), and a confirmed defect is filed through `bmad-agent-po` when that skill is installed (its folder sits beside this skill's folder).
- **Absent:** tell the user once: "No ticket store is available (`_bmad/method/scripts/tickets.py` is not installed); defects are reported in this conversation only." Classify from git history alone (below), report every defect in the conversation, and never write a ticket file yourself.

`tickets.py` is run as `uv run --no-cache {project-root}/_bmad/method/scripts/tickets.py --project-root {project-root} <verb>`; a non-zero exit prints an error: show it and fall back to git history.

## Detection scope

### Delivered code (MUST scan and report bugs)

- Code whose ticket is finished: in `tickets.py status`, the row's `state` is `done` or its `status` is `built`. Resolve a ticket named in a branch, commit or file with `tickets.py find <ref>`.
- Committed code on the trunk (`main`, `master`, `dev`) or a release branch.
- Committed code on a feature branch whose parent ticket is finished.

### Work in progress (DO NOT flag as bugs)

- Uncommitted changes in the working tree.
- Committed code on a branch whose ticket is still `backlog`, `in-progress` or `review`.
- `TODO` / `FIXME` markers in code added as part of the ticket under review.
- Incomplete implementations explicitly tied to an active ticket.

### Ambiguous boundary: feature branches

Committed code on a feature branch whose ticket cannot be resolved — no `tickets.py`, `find` returns nothing, or the branch names no ticket — is work in progress. When the status cannot be determined, **default to WIP and do NOT flag a bug**.

---

## Detection criteria

Scan delivered code for the following categories of defects. Each category includes examples of what qualifies.

### 1. Logic errors

Incorrect computational logic, wrong conditionals, or inverted boolean expressions that make the code produce incorrect results.

- Using `>` instead of `>=` in a boundary check, silently excluding a valid edge value.
- An accumulator initialized to `1` instead of `0`, skewing totals.
- A loop that iterates one too many or one too few times (off-by-one).

### 2. Unhandled edge cases

Inputs or states the code does not handle, leading to incorrect behavior or crashes.

- A function that accepts a list but does not handle an empty list, throwing an index error.
- A parser that crashes on a valid but empty string.
- Division without a zero check on the divisor.

### 3. Missing error handling

Absence of error handling for operations that can fail, causing unhandled exceptions or silent failures.

- File I/O with no error handling, crashing the process on a missing file.
- Network requests with no timeout or error callback.
- A database query whose rejection is swallowed without logging or recovery.

### 4. Broken contracts

Code that violates the API contract it published: wrong return types, missing required fields, or undocumented side effects.

- A function documented to return `string | null` that sometimes returns `undefined`.
- A REST endpoint returning HTTP 200 for a failed operation instead of the correct 4xx/5xx code.
- A method mutating shared state that is not documented as a side effect.

### 5. Regressions

Previously working behavior that is now broken, typically by a change in a related component.

- A utility refactored to take a new parameter, breaking callers that pass none.
- A config key renamed in one place but not in every consumer.
- A test that was green before a dependency upgrade and now fails on an incompatible API.

### 6. Security vulnerabilities

Code patterns that introduce exploitable weaknesses in delivered functionality.

- User input passed into a shell command without sanitization (command injection).
- Secrets or API keys hard-coded in committed source files.
- SQL built by string concatenation with unsanitized input (SQL injection).
- Passwords or tokens logged at INFO level in production code.

---

## Reporting format

When a defect is detected in delivered code, report it with this template:

```
## Bug Report

**Title:** [Short, descriptive title]
**Severity:** [critical | high | medium | low]
**Category:** [logic-error | unhandled-edge-case | missing-error-handling | broken-contract | regression | security-vulnerability]
**Affected Component:** [Module, file, or system area]
**Ticket:** [the finished ticket that delivered the code, or "unknown"]

**Reproduction Steps:**
1. [Step 1]
2. [Step 2]

**Expected Behavior:**
[What should happen]

**Actual Behavior:**
[What actually happens]

**Affected Files:**
- path/to/file.ext (line N)
```

**Severity guidelines:**
- `critical`: data loss, security breach, or a crash in normal usage.
- `high`: a core feature broken or a serious security risk; blocks users.
- `medium`: a feature partially broken or degraded; a workaround exists.
- `low`: minor issue, cosmetic defect, or an edge case with minimal impact.

---

## What NOT to flag

- **Work-in-progress code**: uncommitted changes, or a branch whose ticket is active.
- **TODO / FIXME comments** in code added as part of the ticket being reviewed.
- **Incomplete implementations** explicitly tied to an active or not-yet-started ticket.
- **Style preferences**: naming, formatting, or architectural opinions unrelated to correctness.
- **Speculative issues**: attack scenarios or failure modes with no demonstrable code path in the current codebase.

---

## Required action on detection

Filing goes through `bmad-agent-po` (Sofia), the owner of the ticket store: ask her to **file a bug** with the title, severity and the report above. She creates the bug in the configured store; this skill never writes a ticket file and never edits a plan's status line. When `bmad-agent-po` is not installed, or no ticket store is available, the report stays in the conversation and the user is told so.

### critical or high severity

File immediately, without waiting for confirmation, and tell the user as you act:

> "I found a **[severity]** bug in delivered code — asking `bmad-agent-po` to file a bug now so it is tracked."

Do not proceed with other tasks until the bug is filed (or, with no store, until the report is in the conversation).

### medium or low severity

Recommend filing, and act only on confirmation:

> "I found a **[severity]** bug in delivered code. Shall I ask `bmad-agent-po` to file a bug so it can be scheduled?"

If the user declines or does not answer, keep the finding in your response and continue. The report stays visible in the conversation and nothing is written.

{{ workflow.on_complete }}
