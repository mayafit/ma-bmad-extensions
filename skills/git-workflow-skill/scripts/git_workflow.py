#!/usr/bin/env python3
# /// script
# requires-python = ">=3.11"
# ///
"""git-workflow-skill: worktree-based feature workflow (start, finish, validate, install-hooks).

Standard library only; run through uv:

  uv run --no-cache git_workflow.py start <feature|bugfix|hotfix|chore> <description> [--base BRANCH]
  uv run --no-cache git_workflow.py finish [WORKTREE] [--base BRANCH] [--force]
  uv run --no-cache git_workflow.py validate [--list] [--base BRANCH]
  uv run --no-cache git_workflow.py install-hooks

The base branch is --base, else the first of origin/dev, origin/main, origin/master that exists.
`finish` is non-interactive: a branch name or a commit subject outside the convention stops it
unless --force is given. The three git hooks (pre-commit, commit-msg, prepare-commit-msg) are
embedded below and written by `install-hooks`.
Exit: 0 done, 1 a check failed, 2 git or the base branch is missing.
"""

from __future__ import annotations

import argparse
import os
import re
import shutil
import stat
import subprocess
import sys
from pathlib import Path

BRANCH_TYPES = ("feature", "bugfix", "hotfix", "chore")
PROTECTED = ("dev", "main", "master")
BASE_CANDIDATES = ("dev", "main", "master")
COMMIT_RE = re.compile(r"^(feat|fix|chore|docs|refactor|test|ci)(\([^)]+\))?!?: .+")
BRANCH_RE = re.compile(r"^(feature|bugfix|hotfix|chore)/[a-z0-9-]+$")
WORKTREES = ".worktrees"

HOOKS = {
    "pre-commit": r"""#!/bin/sh
# pre-commit hook (git-workflow-skill): block commits on protected branches.
branch=$(git rev-parse --abbrev-ref HEAD)
for protected in dev main master; do
  if [ "$branch" = "$protected" ]; then
    echo "ERROR: direct commits to '$branch' are not allowed." >&2
    echo "Create an isolated worktree: uv run --no-cache <skill-root>/scripts/git_workflow.py start feature <description>" >&2
    exit 1
  fi
done
case "$branch" in
  feature/*|bugfix/*|hotfix/*|chore/*) ;;
  *) echo "WARNING: branch '$branch' does not follow feature|bugfix|hotfix|chore/<description>" >&2 ;;
esac
exit 0
""",
    "commit-msg": r"""#!/bin/sh
# commit-msg hook (git-workflow-skill): validate the Conventional Commits format.
first=$(head -n 1 "$1")
case "$first" in
  "Merge "*|"fixup! "*|"squash! "*) exit 0 ;;
esac
if ! printf '%s\n' "$first" | grep -qE '^(feat|fix|chore|docs|refactor|test|ci)(\([a-zA-Z0-9_./-]+\))?!?: .+'; then
  echo "ERROR: commit message does not follow <type>(<scope>): <description>" >&2
  echo "Types: feat, fix, chore, docs, refactor, test, ci" >&2
  echo "Your message: $first" >&2
  exit 1
fi
if [ ${#first} -gt 72 ]; then
  echo "WARNING: first line is ${#first} characters (recommended: 72 max)" >&2
fi
exit 0
""",
    "prepare-commit-msg": r"""#!/bin/sh
# prepare-commit-msg hook (git-workflow-skill): seed a Conventional Commits template.
file="$1"
source="$2"
[ -n "$source" ] && exit 0
branch=$(git rev-parse --abbrev-ref HEAD 2>/dev/null)
case "$branch" in
  feature/*) type=feat ;;
  bugfix/*|hotfix/*) type=fix ;;
  chore/*) type=chore ;;
  *) type=type ;;
esac
if [ ! -s "$file" ] || ! grep -qv '^#' "$file" 2>/dev/null; then
  {
    echo "$type(scope): "
    echo ""
    echo "# <type>(<scope>): <description>   types: feat fix chore docs refactor test ci"
  } > "$file"
fi
exit 0
""",
}


class Stop(RuntimeError):
    def __init__(self, message: str, code: int = 1) -> None:
        super().__init__(message)
        self.code = code


def git(*args: str, cwd: Path | None = None, check: bool = True) -> str:
    exe = shutil.which("git")
    if not exe:
        raise Stop("git not found on PATH", 2)
    result = subprocess.run([exe, *args], cwd=cwd, capture_output=True, text=True, encoding="utf-8", errors="replace", check=False)
    if check and result.returncode != 0:
        raise Stop(f"git {' '.join(args)} failed: {(result.stderr or result.stdout).strip()}")
    return result.stdout.strip()


def git_ok(*args: str, cwd: Path | None = None) -> bool:
    exe = shutil.which("git")
    if not exe:
        raise Stop("git not found on PATH", 2)
    return subprocess.run([exe, *args], cwd=cwd, capture_output=True, check=False).returncode == 0


def repo_context(cwd: Path) -> tuple[Path, Path, bool]:
    """(main repository root, current worktree root, is_worktree)."""
    if not git_ok("rev-parse", "--git-dir", cwd=cwd):
        raise Stop("not in a git repository", 2)
    common = Path(git("rev-parse", "--git-common-dir", cwd=cwd))
    git_dir = Path(git("rev-parse", "--git-dir", cwd=cwd))
    top = Path(git("rev-parse", "--show-toplevel", cwd=cwd))
    if not common.is_absolute():
        common = (cwd / common).resolve()
    if not git_dir.is_absolute():
        git_dir = (cwd / git_dir).resolve()
    is_worktree = common.resolve() != git_dir.resolve()
    main_repo = common.resolve().parent if is_worktree else top
    return main_repo, top, is_worktree


def base_branch(cwd: Path, requested: str | None, fetch: bool = True) -> str:
    if fetch:
        git_ok("fetch", "origin", "--quiet", cwd=cwd)
    remote = git("branch", "-r", "--format=%(refname:short)", cwd=cwd).splitlines()
    remote = {line.strip() for line in remote}
    if requested:
        if f"origin/{requested}" not in remote:
            raise Stop(f"base branch origin/{requested} does not exist on the remote", 2)
        return requested
    for name in BASE_CANDIDATES:
        if f"origin/{name}" in remote:
            return name
    raise Stop("none of origin/dev, origin/main, origin/master exists; pass --base <branch>", 2)


def ensure_gitignore(main_repo: Path) -> None:
    ignore = main_repo / ".gitignore"
    text = ignore.read_text(encoding="utf-8") if ignore.is_file() else ""
    if not re.search(r"(?m)^\.worktrees/?\s*$", text):
        sep = "" if text == "" or text.endswith("\n") else "\n"
        ignore.write_text(text + sep + ".worktrees/\n", encoding="utf-8")
        print(f"Added {WORKTREES}/ to .gitignore")


def cmd_start(args: argparse.Namespace) -> int:
    if args.type not in BRANCH_TYPES:
        raise Stop(f"invalid branch type {args.type!r}; use one of {', '.join(BRANCH_TYPES)}")
    description = re.sub(r"[^a-z0-9-]", "", args.description.lower().replace(" ", "-")).strip("-")
    if not description:
        raise Stop("the description must hold letters, digits or dashes")
    branch = f"{args.type}/{description}"
    cwd = Path.cwd()
    main_repo, _, _ = repo_context(cwd)
    base = base_branch(cwd, args.base)
    for ref in (f"refs/heads/{branch}", f"refs/remotes/origin/{branch}"):
        if git_ok("show-ref", "--verify", "--quiet", ref, cwd=cwd):
            raise Stop(f"branch {branch!r} already exists; choose another description or clean up the old branch")
    worktree = main_repo / WORKTREES / description
    if worktree.exists():
        raise Stop(f"worktree directory already exists: {worktree}\n  to remove it: git worktree remove {worktree}")
    (main_repo / WORKTREES).mkdir(exist_ok=True)
    ensure_gitignore(main_repo)
    print(f"Creating worktree for {branch!r} from origin/{base}...")
    git("worktree", "add", "-b", branch, str(worktree), f"origin/{base}", cwd=cwd)
    print(f"Worktree created\n  Branch:    {branch}\n  Directory: {worktree}\n")
    print("Next steps:")
    print(f"  1. cd {worktree}")
    print("  2. Make your changes in this isolated directory")
    print("  3. Commit: git commit -m 'type(scope): description'")
    print("  4. Finish: run git_workflow.py finish from inside the worktree\n")
    print("Active worktrees:")
    print(git("worktree", "list", cwd=cwd))
    return 0


def commit_subjects(base: str, cwd: Path) -> list[str]:
    out = git("log", f"origin/{base}..HEAD", "--pretty=format:%s", cwd=cwd, check=False)
    return [line for line in out.splitlines() if line.strip()]


def cmd_finish(args: argparse.Namespace) -> int:
    cwd = Path(args.worktree).resolve() if args.worktree else Path.cwd()
    main_repo, top, is_worktree = repo_context(cwd)
    print(f"Working in {'worktree' if is_worktree else 'main repository (not a worktree)'}: {top}")
    branch = git("rev-parse", "--abbrev-ref", "HEAD", cwd=cwd)
    if branch in PROTECTED:
        raise Stop(f"you are on {branch!r}; switch to a feature branch first")
    problems: list[str] = []
    if not BRANCH_RE.match(branch):
        problems.append(f"branch {branch!r} does not follow (feature|bugfix|hotfix|chore)/<description>")
    if not git_ok("diff-index", "--quiet", "HEAD", "--", cwd=cwd):
        raise Stop("you have uncommitted changes; commit them first")
    base = base_branch(cwd, args.base)
    subjects = commit_subjects(base, cwd)
    if not subjects:
        raise Stop(f"no commits ahead of origin/{base}; make some changes first")
    print(f"Found {len(subjects)} commit(s) to push\n\nValidating commit messages...")
    for subject in subjects:
        ok = bool(COMMIT_RE.match(subject))
        print(f"  {'+ Valid' if ok else 'x Invalid'}: {subject}")
        if not ok:
            problems.append(f"commit {subject!r} does not follow the Conventional Commits format")
    if problems and not args.force:
        for problem in problems:
            print(f"ERROR: {problem}", file=sys.stderr)
        raise Stop("fix the problems above or re-run with --force")
    for problem in problems:
        print(f"WARNING (--force): {problem}", file=sys.stderr)
    print(f"\nRebasing on origin/{base}...")
    git("fetch", "origin", base, cwd=cwd)
    if not git_ok("rebase", f"origin/{base}", cwd=cwd):
        git_ok("rebase", "--abort", cwd=cwd)
        raise Stop(f"rebase on origin/{base} failed; rebase by hand, resolve the conflicts, then run finish again")
    print(f"Rebased on {base}\n\nPushing branch to origin...")
    git("push", "-u", "origin", branch, "--force-with-lease", cwd=cwd)
    print(f"Branch {branch!r} pushed\n")
    pr_created = False
    gh = shutil.which("gh")
    if not gh:
        print("GitHub CLI (gh) not installed: skipping PR creation. Install it from https://cli.github.com/")
    elif subprocess.run([gh, "auth", "status"], capture_output=True, check=False).returncode != 0:
        print("GitHub CLI not authenticated (gh auth login): skipping PR creation.")
    else:
        title = branch.split("/", 1)[1].replace("-", " ").capitalize()
        body = "## Changes\n\n" + subjects[-1] + "\n\n## Commits\n" + "\n".join(f"- {s}" for s in subjects) + "\n"
        result = subprocess.run(
            [gh, "pr", "create", "--base", base, "--head", branch, "--title", title, "--body", body],
            cwd=cwd, capture_output=True, text=True, encoding="utf-8", errors="replace", check=False,
        )
        if result.returncode == 0:
            print("Pull request created")
            print((result.stdout or "").strip())
            pr_created = True
        else:
            print(f"Failed to create the PR: {(result.stderr or result.stdout).strip()}")
    if is_worktree:
        print("\nCleaning up worktree...")
        os.chdir(main_repo)  # a process inside the worktree would keep Windows from deleting it
        if git_ok("worktree", "remove", str(top), cwd=main_repo):
            print(f"Worktree removed: {top}")
        else:
            print(f"Could not remove the worktree automatically; run: git -C {main_repo} worktree remove {top}")
    git_ok("worktree", "prune", cwd=main_repo)
    print("\nDone.\nNext steps:")
    if pr_created:
        print("  1. Request a code review on the PR\n  2. Merge after approval")
    else:
        print(f"  1. Open a pull request: gh pr create --base {base} --head {branch}\n  2. Request a code review\n  3. Merge after approval")
    print("\nActive worktrees:")
    print(git("worktree", "list", cwd=main_repo))
    return 0


def cmd_validate(args: argparse.Namespace) -> int:
    cwd = Path.cwd()
    if args.list:
        print("Active worktrees\n================")
        print(git("worktree", "list", cwd=cwd, check=False) or "Not in a git repository")
        return 0
    errors: list[str] = []
    warnings: list[str] = []
    ok = lambda m: print(f"+ {m}")  # noqa: E731
    main_repo, top, is_worktree = repo_context(cwd)
    print("Git workflow validation (worktree-aware)\n========================================")
    print(f"Context: {'inside worktree' if is_worktree else 'main repository'}\n  Worktree: {top}\n  Main repo: {main_repo}")
    branch = git("rev-parse", "--abbrev-ref", "HEAD", cwd=cwd)
    print(f"Branch: {branch}\n\nChecking branch...")
    if branch in PROTECTED:
        if is_worktree:
            errors.append(f"worktree is on protected branch {branch!r}; worktrees belong on feature branches")
        else:
            ok(f"main repo is on {branch!r} (expected)")
    else:
        ok(f"on feature branch {branch!r}")
        if BRANCH_RE.match(branch):
            ok("branch name follows the convention")
        else:
            warnings.append(f"branch name {branch!r} does not follow <type>/<description>")
    print("\nChecking repository setup...")
    try:
        base = base_branch(cwd, args.base)
        ok(f"remote base branch origin/{base} exists")
    except Stop as error:
        errors.append(str(error))
        base = None
    print("\nChecking sync status...")
    if base and branch not in PROTECTED:
        behind = git("rev-list", "--count", f"HEAD..origin/{base}", cwd=cwd, check=False) or "0"
        if behind == "0":
            ok(f"branch is up to date with {base}")
        else:
            warnings.append(f"branch is {behind} commit(s) behind {base}; consider rebasing (git fetch origin {base} && git rebase origin/{base})")
    else:
        ok("on the base branch; sync check not needed")
    print("\nChecking working directory...")
    if git_ok("diff-index", "--quiet", "HEAD", "--", cwd=cwd):
        ok("no uncommitted changes")
    else:
        warnings.append("uncommitted changes detected (git status)")
    untracked = [l for l in git("ls-files", "--others", "--exclude-standard", cwd=cwd, check=False).splitlines() if l]
    if untracked:
        warnings.append(f"{len(untracked)} untracked file(s) found (git status)")
    else:
        ok("no untracked files")
    print("\nChecking commit messages...")
    if base and branch not in PROTECTED:
        subjects = commit_subjects(base, cwd)
        if subjects:
            invalid = [s for s in subjects if not COMMIT_RE.match(s)]
            if invalid:
                warnings.append(f"{len(invalid)} of {len(subjects)} commit(s) do not follow <type>(<scope>): <description>")
            else:
                ok(f"all {len(subjects)} commit(s) follow the conventional format")
        else:
            print(f"  no commits ahead of {base} yet")
    else:
        print("  on the base branch; commit check not needed")
    print("\nChecking git hooks...")
    hooks_dir = Path(git("rev-parse", "--git-common-dir", cwd=cwd))
    if not hooks_dir.is_absolute():
        hooks_dir = (cwd / hooks_dir).resolve()
    hooks_dir = hooks_dir / "hooks"
    for hook in ("pre-commit", "commit-msg"):
        path = hooks_dir / hook
        if path.is_file() and (os.name == "nt" or os.access(path, os.X_OK)):
            ok(f"{hook} hook installed")
        else:
            warnings.append(f"{hook} hook not installed (run: git_workflow.py install-hooks)")
    print("\nChecking worktrees...")
    listing = git("worktree", "list", "--porcelain", cwd=cwd, check=False)
    count = sum(1 for l in listing.splitlines() if l.startswith("worktree "))
    stale = sum(1 for l in listing.splitlines() if l.startswith("prunable"))
    ok(f"{count} worktree(s) registered")
    if stale:
        warnings.append(f"{stale} stale worktree(s) found (git worktree prune)")
    else:
        ok("no stale worktrees")
    ignore = main_repo / ".gitignore"
    if ignore.is_file() and re.search(r"(?m)^\.worktrees/?\s*$", ignore.read_text(encoding="utf-8")):
        ok(f"{WORKTREES}/ is in .gitignore")
    else:
        warnings.append(f"{WORKTREES}/ is NOT in .gitignore")
    print("\nActive worktrees:")
    for line in git("worktree", "list", cwd=cwd, check=False).splitlines():
        print(f"  {line}")
    print("\n========================================")
    for message in errors:
        print(f"x ERROR: {message}")
    for message in warnings:
        print(f"! WARNING: {message}")
    if errors:
        print(f"Validation failed: {len(errors)} error(s), {len(warnings)} warning(s)")
        return 1
    print(f"Validation passed{' with ' + str(len(warnings)) + ' warning(s)' if warnings else ': all checks OK'}")
    return 0


def cmd_install_hooks(_args: argparse.Namespace) -> int:
    cwd = Path.cwd()
    repo_context(cwd)
    hooks_dir = Path(git("rev-parse", "--git-common-dir", cwd=cwd))
    if not hooks_dir.is_absolute():
        hooks_dir = (cwd / hooks_dir).resolve()
    hooks_dir = hooks_dir / "hooks"
    hooks_dir.mkdir(parents=True, exist_ok=True)
    print(f"Installing git hooks into {hooks_dir}")
    for name, content in HOOKS.items():
        target = hooks_dir / name
        if target.exists():
            backup = hooks_dir / f"{name}.backup"
            shutil.copyfile(target, backup)
            print(f"  hook {name!r} already exists; backed up to {backup.name}")
        target.write_text(content, encoding="utf-8", newline="\n")
        target.chmod(target.stat().st_mode | stat.S_IXUSR | stat.S_IXGRP | stat.S_IXOTH)
        print(f"  installed: {name}")
    print("Git hooks installed: pre-commit (blocks commits on dev/main/master), commit-msg (Conventional Commits), prepare-commit-msg (template)")
    return 0


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    sub = parser.add_subparsers(dest="command", required=True)
    p = sub.add_parser("start", help="create a worktree on a new feature branch")
    p.add_argument("type", help="feature | bugfix | hotfix | chore")
    p.add_argument("description")
    p.add_argument("--base", help="base branch (default: dev, main or master, whichever exists on origin)")
    p.set_defaults(fn=cmd_start)
    p = sub.add_parser("finish", help="validate, rebase, push, open a PR, remove the worktree")
    p.add_argument("worktree", nargs="?", help="worktree path (default: the current directory)")
    p.add_argument("--base")
    p.add_argument("--force", action="store_true", help="continue despite naming or commit-format problems")
    p.set_defaults(fn=cmd_finish)
    p = sub.add_parser("validate", help="check workflow compliance")
    p.add_argument("--list", action="store_true", help="list the registered worktrees")
    p.add_argument("--base")
    p.set_defaults(fn=cmd_validate)
    p = sub.add_parser("install-hooks", help="install the pre-commit, commit-msg and prepare-commit-msg hooks")
    p.set_defaults(fn=cmd_install_hooks)
    args = parser.parse_args(argv)
    try:
        return args.fn(args)
    except Stop as error:
        print(f"ERROR: {error}", file=sys.stderr)
        return error.code


if __name__ == "__main__":
    sys.exit(main())
