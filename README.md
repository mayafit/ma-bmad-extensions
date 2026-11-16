# ma-bmad-extensions

BMAD v7 modules of ma-agents 4.x: `ma-ops`, `ma-standards`, `ma-knowledge`, `ma-atlassian`.

Each module installs alone with the Skills CLI (`npx skills add mayafit/ma-bmad-extensions --skill <name> ...`) followed by `bmad setup <code>` on a BMAD v7 project that has the `method` module. See the ma-agents PRD capability F29 and Decision P5-11.

## Layout

- `skills/bmod-<code>/` — one module record per module: `bmod.toml`, `SKILL.md`, `help/help.md`, `retired.toml`, and `roster.toml` where the module has agents.
- `skills/<name>/` — every member skill, side by side: `SKILL.md`, `workflow.md`, `customize.toml`, and `bmod.toml` with a `[skill]` table; scripts under `scripts/` (declared in `[skill] scripts`, every one run as `uv run --no-cache`), bundled files under `assets/`, `examples/` and `references/`.
- `tools/` — the CI checks, each a script that runs the same way locally (`sweep.py` is the cross-module sweep: configuration keys and files, no `bmad-*` name, every cross-module reference declared in its record, no 3.x sprint skill or 3.x project file named outside a migration; its audit reports sit under `tools/reports/`); `tools/fixtures/` holds the instruction-file coexistence case table of ma-agents Story 36.5 that `ma-standards-apply` must pass, the 3.x tracking-data fixture (`migrate-v6/`, the collision cases of ma-agents Story 36.1 AC9) that `ma-ops-dev-epic/scripts/migrate_v6_backlog.py` must migrate idempotently, and the v7 initiative `initiative-atlas/` that `ma-knowledge-atlas` must render with every epic, ticket and status (FR305).
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
uv run --no-cache tools/check_assignment.py --complete
uv run --no-cache tools/check_names.py
uv run --no-cache tools/check_unique_names.py --tree <tree>
uv run --no-cache tools/test_gate_checks.py --tree <tree>
uv run --no-cache tools/sweep.py --tree <tree>
uv run --no-cache tools/test_sweep.py --tree <tree>
uv run --no-cache tools/test_apply_block.py --tree <tree>
uv run --no-cache tools/test_migrate_v6_backlog.py --tree <tree>
uv run --no-cache tools/test_atlas.py
uv run --no-cache tools/test_jira_verbs.py --mutants
node tools/pack-skills-cli.mjs 1.7.6 <cli>
uv run --no-cache tools/install_test.py --tree <tree> --skills-cli <cli> --work <scratch> --expect-update current
uv run --no-cache tools/install_test.py --tree <tree> --skills-cli <cli> --work <scratch> --from-tag mayafit/ma-bmad-extensions --expect-update current
```

`check_assignment.py --complete` is the release gate of FR295: every package-map skill ships, except in a module `tools/package-map.toml` marks `pending = "<epic>"` (listed, not failed; a marker on a fully shipped module fails). `test_jira_verbs.py` runs every REST form of `skills/ma-atlassian-bind/references/jira-onprem-verbs.md` with `curl` against `tools/jira_dc_mock.py`, a local mock of the Jira Data Center 9.17.0 endpoints the `jira-onprem` store verbs use (no Jira is reachable from CI; the reference file lists the same commands for a live run). `--expect-update current` asserts what `setup.py --status` reads anonymously from `main` of this repository (NFR84); on a branch that bumps the version pass `current,ahead`. `--from-tag` also takes a clone URL (`https://<host>/<repo>.git`) for the same tag install from a mirror; a tag install is judged by the tag's own records (fetched into `<scratch>/tag-source`), so a branch that adds a member the tag does not ship stays green.

### Offline activation (NFR84, FR282)

The second CI job (`offline`) proves that every skill activates with no network from the ma-agents 4.x runtime (`docs/on-prem-runtime.md` of ma-agents: uv 0.13.8, a managed CPython 3.11, the wheelhouse that `scripts/build-wheelhouse.py` resolves for the pinned tree plus this repository). Locally, with Docker and a Linux runtime folder `<rt>` (`bin/uv`, `python/`, `wheelhouse/linux-x64/` and `wheelhouse/wheelhouse-manifest.json`, prepared with network as the job's "Pre-fetch the runtime" step does):

```bash
docker run --rm --network none -v "$PWD:/ext:ro" -v <tree>:/tree:ro -v <cli>:/cli:ro -v <rt>:/rt:ro -v <scratch>:/work \
  -e UV_PYTHON_INSTALL_DIR=/rt/python -e UV_PYTHON_PREFERENCE=only-managed -e UV_PYTHON_DOWNLOADS=never -e UV_OFFLINE=1 -e UV_NO_CACHE=1 \
  node:22-bookworm /rt/bin/uv run --no-cache /ext/tools/offline_activation.py --tree /tree --skills-cli /cli --runtime /rt --work /work --require-no-network --control
```

`tools/offline_activation.py` also runs on a host with network (without `--require-no-network`; `--platform win-x64` with a Windows runtime folder), where it proves only that the runtime, not the host's uv configuration, feeds the activations.
