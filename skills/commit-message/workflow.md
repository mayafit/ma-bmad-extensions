# Commit Message Workflow

**Goal:** Write a Conventional Commits message that describes the change at hand.

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

Generate meaningful commit messages following Conventional Commits specification.

## Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

## Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style/formatting
- `refactor`: Code refactoring
- `test`: Adding/updating tests
- `chore`: Maintenance tasks
- `perf`: Performance improvements
- `ci`: CI/CD changes
- `build`: Build system changes
- `revert`: Revert previous commit

## Guidelines

1. **Subject line** (max 50 chars):
   - Use imperative mood ("Add" not "Added")
   - Don't capitalize first letter
   - No period at the end

2. **Body** (optional):
   - Explain what and why, not how
   - Wrap at 72 characters

3. **Footer** (optional):
   - Breaking changes: `BREAKING CHANGE: description`
   - Issue references: `Fixes #123`

## Examples

```
feat(auth): add JWT token refresh mechanism

Implement automatic token refresh to improve user experience
and reduce re-authentication prompts.

Fixes #456
```

```
fix(api): resolve memory leak in user service

The user cache was not being cleared properly, causing
memory to grow over time.
```

```
docs: update installation instructions

Add steps for Windows users and clarify dependency requirements.
```

## Process

1. Analyze the code changes
2. Determine the type of change
3. Identify the scope (component/module affected)
4. Write clear, concise subject
5. Add body if changes need explanation
6. Add footer for breaking changes or issue refs

{{ workflow.on_complete }}
