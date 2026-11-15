# ma-bmad-extensions

BMAD v7 modules of ma-agents 4.x: `ma-ops`, `ma-standards`, `ma-knowledge`, `ma-atlassian`.

Each module installs alone with the Skills CLI (`npx skills add mayafit/ma-bmad-extensions --skill <name> ...`) followed by `bmad setup <code>` on a BMAD v7 project that has the `method` module. See the ma-agents PRD capability F29 and Decision P5-11.

## Layout

- `skills/bmod-<code>/` — one module record per module: `bmod.toml`, `SKILL.md`, `help/help.md`, `retired.toml`, and `roster.toml` where the module has agents.
- `skills/<name>/` — every member skill, side by side: `SKILL.md`, `customize.toml`, and `bmod.toml` with a `[skill]` table.
- One version line: every record carries the same `version`; a change to any module bumps it, and a tag `v<version>` marks each release. `update_source` and every member `source` are `github:mayafit/ma-bmad-extensions/skills`.

Install one module, naming the record and every member (a record alone installs no member):

```bash
npx skills add mayafit/ma-bmad-extensions#v<version> --skill bmod-<code> --skill <member> ... -y --agent <tool>
```

then ask `bmad` to run `bmad setup <code>`.

## Checks

CI (`.github/workflows/ci.yml`) runs these against BMAD-METHOD at the pinned commit (`BMAD_CORE` in the workflow). Locally, with Node ≥ 22.20, git and uv:

```bash
git init <tree> && git -C <tree> fetch --depth 1 https://github.com/bmad-code-org/BMAD-METHOD.git <BMAD_CORE> && git -C <tree> checkout FETCH_HEAD
uv run --no-cache <tree>/skills/bmad/scripts/validate_manifests.py --project-root .
uv run --no-cache tools/validate_customize.py --skills-root skills --tree <tree> --render
uv run --no-cache tools/lint_uv_guidance.py
uv run --no-cache tools/check_assignment.py
uv run --no-cache tools/check_names.py
node tools/pack-skills-cli.mjs 1.7.6 <cli>
uv run --no-cache tools/install_test.py --tree <tree> --skills-cli <cli> --work <scratch>
uv run --no-cache tools/install_test.py --tree <tree> --skills-cli <cli> --work <scratch> --from-tag mayafit/ma-bmad-extensions
```
