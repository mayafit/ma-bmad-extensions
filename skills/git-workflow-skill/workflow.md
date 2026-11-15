# Git Workflow Workflow

**Goal:** Run every change to tracked files through an isolated worktree, Conventional Commits and a pull request.

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

## Mandatory usage policy (CRITICAL)

**This skill is MANDATORY for every activity that modifies tracked files in the repository.**

1. **Before starting ANY work** that changes source code, configuration or documentation, create an isolated feature branch in its own worktree: `git_workflow.py start` below, or the equivalent `git worktree add`.
2. **During development**, do all file writing inside that worktree directory.
3. **After completing work**, run `git_workflow.py finish` (or the equivalent rebase, push, PR and cleanup sequence) to integrate the change and remove the worktree.

Failing to follow this workflow is a violation of repository standards.

## Bundled script

One script carries the whole workflow: `{skill-root}/scripts/git_workflow.py` (standard library only, run through uv). Every call is

```bash
uv run --no-cache {skill-root}/scripts/git_workflow.py <sub-command> [options]
```

| Sub-command | Purpose |
|-------------|---------|
| `start <type> <description>` | create `.worktrees/<description>/` on a new `<type>/<description>` branch from the base branch |
| `finish [worktree-path]` | validate the branch and its commits, rebase on the base branch, push, open a PR (`gh`), remove the worktree |
| `validate [--list]` | check workflow compliance of the current worktree, or list the registered worktrees |
| `install-hooks` | install the `pre-commit`, `commit-msg` and `prepare-commit-msg` hooks into the repository's hooks folder |

`<type>` is one of `feature`, `bugfix`, `hotfix`, `chore`. The base branch is `--base <branch>` when given, else the first of `origin/dev`, `origin/main`, `origin/master` that exists; `start` and `finish` stop with a message when none does. `finish` is non-interactive: a branch name or a commit message outside the convention stops it unless `--force` is given; without `gh` (or without `gh auth`), it pushes and prints the PR command instead. The hooks it installs: `pre-commit` blocks commits on the trunk branches (`dev`, `main`, `master`), `commit-msg` validates the Conventional Commits format, `prepare-commit-msg` seeds a template from the branch type.

Requirements: git 2.15+ (worktrees); GitHub CLI `gh`, authenticated, for automatic PR creation (`winget install --id GitHub.cli`, `brew install gh`, `apt install gh`, then `gh auth login`).

## Mandatory pre-change check

Before changing any repository file that is not git-ignored:

1. Check whether the file is tracked: `git check-ignore -v <file-path>`. Ignored: proceed without this workflow. Tracked: continue.
2. Verify the base branch exists: `git fetch origin` then `git branch -r`. None of `origin/dev`, `origin/main`, `origin/master`: **stop and ask the user** which branch to base on, and pass it with `--base`.

## Multi-agent development flow

```
Main repo (stays on the base branch) --- always clean, never modified directly
  |
  +-- .worktrees/auth-system/     <- Agent 1: feature/auth-system
  |     (isolated copy of the repo, own branch, own changes)
  |
  +-- .worktrees/api-refactor/    <- Agent 2: bugfix/api-refactor
  |
  +-- .worktrees/update-docs/     <- Agent 3: chore/update-docs

Each worktree has its own directory and branch, shares the git history, can commit, push and
open a PR independently, and is removed by `finish`.
```

### Starting work

Script (recommended):

```bash
uv run --no-cache {skill-root}/scripts/git_workflow.py start feature my-feature-name
cd .worktrees/my-feature-name/
```

Manual equivalent:

```bash
git worktree add .worktrees/<desc> -b feature/<desc> origin/dev
cd .worktrees/<desc>
```

### Branch naming

| Type | Use case |
|------|----------|
| `feature/<desc>` | new functionality |
| `bugfix/<desc>` | bug fixes |
| `hotfix/<desc>` | urgent production fixes |
| `chore/<desc>` | maintenance tasks |

### Completing work

Script (recommended), from inside the worktree:

```bash
uv run --no-cache {skill-root}/scripts/git_workflow.py finish
```

It validates that you are on a feature branch with Conventional Commits, rebases on the latest base branch, pushes the branch (`--force-with-lease`), creates the PR with `gh` when available, and removes the worktree.

Manual equivalent:

```bash
git fetch origin dev
git rebase origin/dev
git push -u origin <branch-name>
gh pr create --base dev --head <branch-name>
cd /path/to/main/repo
git worktree remove .worktrees/<desc>
```

### Managing worktrees

```bash
git worktree list                     # or: git_workflow.py validate --list
git worktree remove .worktrees/<desc>
git worktree prune                    # clean up stale references
uv run --no-cache {skill-root}/scripts/git_workflow.py validate
```

## Commit format (Conventional Commits)

```
<type>(<scope>): <description>

[optional body]
```

**Types:** `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `ci`.

- `feat(auth): add OAuth2 flow support`
- `fix(api): handle null response from endpoint`
- `chore(deps): update Helm chart dependencies`
- `docs(readme): add deployment instructions`

## Critical rules

- **NEVER** modify tracked files outside a worktree on a feature branch.
- **NEVER** commit directly to `dev`, `main` or `master`.
- **ALWAYS** check whether a file is git-ignored before applying this workflow.
- **ALWAYS** create the worktree **before** calling any file-writing tool.
- **ALWAYS** rebase on the base branch before pushing.
- **ALWAYS** use the Conventional Commits format.
- **ALWAYS** keep `.worktrees/` in `.gitignore` (`start` adds it).
- **ALWAYS** finish by opening a PR and removing the worktree once the work is verified; never merge a PR without explicit human approval.

{{ workflow.on_complete }}
