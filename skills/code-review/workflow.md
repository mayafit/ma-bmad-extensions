# Code Review Workflow

**Goal:** Review the code at hand thoroughly and report strengths, issues with locations and fixes, suggestions and an overall assessment.

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

Perform comprehensive code reviews following industry best practices.

## What to Review

1. **Code Quality**: Readability, naming conventions, structure
2. **Best Practices**: Language-specific patterns, error handling, performance
3. **Security**: Common vulnerabilities (SQL injection, XSS, CSRF, etc.)
4. **Testing**: Coverage, edge cases, test quality
5. **Documentation**: Comments, API docs, clarity

## Review Process

- Analyze code for bugs and logical errors
- Check adherence to coding standards
- Identify security vulnerabilities
- Suggest refactoring opportunities
- Assess test coverage and documentation

## Bug Detection During Review

When reviewing code, also evaluate **delivered code** (code whose associated story is marked done) for
pre-existing defects — not just the changes under review.

### Scope Distinction

- **Review feedback** (style, suggestions, correctness of the diff) → applies to the **current story's changes**
- **Bug reports** (defects in delivered code) → applies to **pre-existing code**, tracked independently

Do NOT block the current story review because of pre-existing bugs. Log them separately and continue.

### Detection During Review

The `auto-bug-detection` skill (of this module) provides the full detection criteria. During code review,
apply those criteria to the delivered code you encounter while reviewing the diff context.

When you detect a bug in delivered code:

1. **Label it clearly** with severity (critical / high / medium / low) and mark it as `[BUG]` — distinct from review findings
2. **Do not conflate it** with the review outcome — a story can pass review even if pre-existing bugs are found nearby
3. **Recommend filing it**: ask `bmad-agent-po` to file a bug, as `auto-bug-detection` describes, so it is tracked in the ticket store

### Bug Finding Format (within review output)

```
### [BUG] <short title>
**Severity:** <critical|high|medium|low>
**Category:** <logic-error|unhandled-edge-case|missing-error-handling|broken-contract|regression|security-vulnerability>
**Affected Component:** <module or system area>
**Affected Files:** <file:line>
**Description:** <what the defect is — include expected vs actual behavior>
**Action:** Ask `bmad-agent-po` to file a bug with this report; it is tracked independently of this review.
```

### Note on Skill Interaction

The `auto-bug-detection` skill defines *what* to look for. This section defines *when* and *how* to
surface bug findings during a structured code review session.

## Output Format

```
## Code Review Summary

### Strengths
- [Positive aspects]

### Issues Found
- **[High/Medium/Low]** [Issue description]
  - Location: [file:line]
  - Fix: [recommendation]

### Suggestions
- [Improvements]

### Overall Assessment
[Summary and rating]
```

{{ workflow.on_complete }}
