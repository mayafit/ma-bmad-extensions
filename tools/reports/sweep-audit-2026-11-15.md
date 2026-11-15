# SQA Audit Report — Cross-module sweep of ma-bmad-extensions (Story 37.5)

**Date:** 2026-11-15
**Auditor:** Gadi (SQA Agent, `ma-agent-sqa`)
**Scope:** every owned skill folder at `main` `1a0a571` (71 members, 4 module records) against FR287, FR288, FR296 and Decision P5-11.3, with the "3.x files named only in migrations" rule of the architecture's module patterns; BMAD-METHOD pinned at `e734d3ac3c0f4ea31cc2c2bbbe79e86e54f2cae6`
**Method:** `tools/sweep.py --tree <pinned tree>` (the scripted part), then a read of every finding in context, a decision per finding (declare, reword, or exempt with a reason), and a re-run until the sweep is green; `tools/test_sweep.py` proves each check goes red on the mutant it exists for
**Overall Status:** PASS (after remediation; 3 FAIL findings resolved, 0 open)

---

## Executive Summary

The four modules are independent in the sense P5-11.3 asks for: the only configuration keys any skill names are `core.output_folder` and `modules.ma-knowledge.atlas_output`, both defined; no skill opens a BMad or 3.x configuration file; no owned skill is named `bmad-*`; no 3.x sprint skill and no 3.x project file is named outside the two migration files. The sweep found three real gaps, all cross-module references from `ma-ops` into `ma-standards` that `bmod-ma-ops` did not declare: `cyber-vulnerability-scan` delegates its language scans to `js-ts-security-skill` and `python-security-skill` (now declared as recommendations with a `source`, checked at activation, skipped when absent), and the seven MIL-STD-498 generators pointed at `document-revision-history` for a table format they already carry in full (pointer removed; the modules now share no reference text). Evidence matters more than opinions: every finding below carries its file and line.

---

## Findings by Dimension

### Dimension 1 — Configuration reads (FR288)
**Status:** PASS
**Summary:** 7 `resolve_config.py` calls name `core.output_folder`, 1 names `modules.ma-knowledge.atlas_output`; both keys exist (the pin writes `core.output_folder`; `bmod-ma-knowledge/bmod.toml` asks `atlas_output`). No file names `_bmad/config.toml`, `_bmad/custom/config.toml`, `config.user.toml`, `_bmad/bmm/config.yaml`, `config.yaml`, `project-layout.yaml`, `.ma-agents.json`, `MANIFEST.yaml`, `module.yaml`, `bmad-skill-manifest.yaml` or `skill.json` outside the two migration files.

#### Issues Found
| Severity | Item | Detail | Recommendation |
|----------|------|--------|----------------|
| — | none | | |

#### Observations
- `skills/cyber-verify-image-signature/workflow.md:33` carries `cosign verify --key <public key>`; the sweep's first draft read every `--key` as a `resolve_config.py` argument. The sweep now reads `--key` only on a line that names `resolve_config.py`. Not a skill defect.
- `skills/python-best-practices/workflow.md:264` shows `tomllib.load(f)` in a code sample about the user's own project; it opens no BMad file and is not a finding. The sweep looks for BMad's file names, not for the TOML API.
- `skills/project-context-expansion/workflow.md:31-39` reads and edits `<output_folder>/project-context.md`, which the pinned `bmad-project-context/workflow.md:105` calls a file "from the retired skills". The architecture's list of 3.x project files (`sprint-status.yaml`, `project-layout.yaml`, `_bmad/bmm/config.yaml`, the 3.x override markers) does not include it, and 37.2 D9 made it the skill's deliberate target with a hand-off to `bmad-project-context` when the file is absent. Not flagged; PO item below.

### Dimension 2 — Owned names (FR287)
**Status:** PASS
**Summary:** `tools/check_names.py` over 75 folders, every `SKILL.md` `name:`, every record `skills` entry and every roster `skill`: none `bmad-*`. The two retired names (`bmad-dev-epic`, `bmad-knowledge`) appear only in their own module's `retired.toml`.

#### Issues Found
| Severity | Item | Detail | Recommendation |
|----------|------|--------|----------------|
| — | none | | |

### Dimension 3 — Cross-module references (P5-11.3)
**Status:** PASS (3 FAIL resolved)
**Summary:** 394 text files scanned for the 75 owned names, the 35 upstream names at the pin and the 2 retired names. After remediation every reference across a module boundary is `ma-ops -> ma-standards` and declared in `bmod-ma-ops` `recommended_skills` with a `source`: `git-workflow-skill`, `code-review` (37.3), `js-ts-security-skill`, `python-security-skill` (this audit). No reference crosses in any other direction. Every upstream name referenced is shipped at the pin (`bmad-loop`, which P5-11.7 forbids, is not, and the sweep would report it).

#### Issues Found
| Severity | Item | Detail | Recommendation |
|----------|------|--------|----------------|
| FAIL (resolved) | `cyber-vulnerability-scan` → `js-ts-security-skill` | `skills/cyber-vulnerability-scan/workflow.md:31` ("**JS/TS**: `js-ts-security-skill`") delegates to a `ma-standards` member that `bmod-ma-ops` did not declare; the skill also said it orchestrates skills "from the `ma-agents` package" (3.x wording) | Declared in `skills/bmod-ma-ops/bmod.toml` `recommended_skills` with `source = "github:mayafit/ma-bmad-extensions/skills"`; the workflow gained Step 4, which checks `{skill-root}/../<name>/` for each of the two scanners, tells the user once when one is absent (with the install line) and continues with the audit tools only; the 3.x sentence now reads "the installed security-focused skills" |
| FAIL (resolved) | `cyber-vulnerability-scan` → `python-security-skill` | `skills/cyber-vulnerability-scan/workflow.md:32` ("**Python**: `python-security-skill`"), same gap | Same resolution |
| FAIL (resolved) | `mil498-*` → `document-revision-history` | `skills/mil498-{ocd,sdd,sdp,srs,sss,std}/references/03-generate-document.md:7` and `skills/mil498-ssdd/references/04-generate-document.md:7`: "See the `document-revision-history` skill for full formatting rules." The sentence that precedes it and the fenced table below it already state the whole rule (table after the title, version `1.0` for a new document, one new row per update); the pointer was the only thing the generators took from another module | Pointer removed; the line now ends "The table below is the whole format: one consolidated row per version, newest last." Chosen over a `recommended_skills` entry because the generators need no behaviour from the other skill, only a format they already carry (P5-11.3: "any reference text a module needs is authored in that module") |

#### Observations
- Upstream skills referenced but not listed in a record: `ma-standards` names `bmad-agent-po` (`auto-bug-detection`, "file a bug"), `bmad-project-context` and `bmad-retrospective` (`project-context-expansion`); `ma-ops` names `bmad-build-auto`, `bmad-code-review`, `bmad-review`, `bmad-walkthrough` (`ma-ops-dev-epic`, each checked at activation and skipped when absent), `bmad-party-mode` (a roster comment) and `bmad-retrospective`; `ma-atlassian` names only its two required skills. F29 fixes `required_skills` per module and the brief admits every upstream name at the pin, so these are observations. PO item: whether `recommended_skills` should also list the upstream skills a module builds on, as P5-11.3's first sentence on `recommended_skills` reads.
- Sibling calls inside `ma-ops` (`cyber-generate-certs` → `self-signed-cert`, `cyber-verify-docker-users` → `docker-hardening-verification`, `devops-sign-docker-image` → `docker-image-signing`, 37.3 D2) stay inside the module: no finding.

### Dimension 4 — 3.x sprint skills (FR296)
**Status:** PASS
**Summary:** None of the twelve FR296 names nor `bmad-sprint-planning`, `bmad-sprint-status`, `bmad-dev-story` appears in a text file outside `skills/bmod-ma-ops/migration-1.toml` and `skills/ma-ops-dev-epic/scripts/migrate_v6_backlog.py` (the migration report's replacement table, FR296's last sentence).

#### Observations
- `skills/open-presentation/assets/BMAD_AI_Development_Training.pptx` (3.6 MB, the training deck `open-presentation` opens) is an opaque asset the sweep skips; its slide XML names `sprint-status.yaml` (6 slides), `create-bug-story`, `bmad-sprint-planning` and `bmad-dev-story` once each (slides 24, 65, 82, 84, 85, 87). The deck teaches the 3.x line. WARNING for the PO: the 4.x module ships a 3.x training deck; a refreshed deck is a content change outside this sweep's remit.

### Dimension 5 — 3.x project files only in migrations (architecture module patterns)
**Status:** PASS
**Summary:** `sprint-status.yaml`, `development_status`, the `MA-AGENTS-START` / `MA-AGENTS-END` markers, `knowledge-graph.json` and `_bmad/ma-skills` are named only in the two migration files. `skills/ma-knowledge-atlas/assets/atlas.cjs` (the Epic 29 engine, which contains `sprint-status.yaml` and `_bmad/bmm/config.yaml` as its own classifier strings, 37.4 D1) is skipped as an opaque asset, the exemption 37.4 asked for; `build_atlas.py` keeps the engine away from the project, as 37.4 AC5 proves.

#### Observations
- 37.4 reported two tracked `__pycache__/*.pyc` files and no `.gitignore`; `main` at `1a0a571` carries `.gitignore` (`__pycache__/`, `*.pyc`) from the 37.4 merge and `git ls-files` lists no bytecode. Already resolved; nothing for this story.

---

## Action Items

| Priority | Action | Owner | Related Dimension |
|----------|--------|-------|-------------------|
| P1 (done) | Declare `js-ts-security-skill` and `python-security-skill` in `bmod-ma-ops` `recommended_skills`; make `cyber-vulnerability-scan` check for them and continue without | this story | 3 |
| P1 (done) | Remove the `document-revision-history` pointer from the seven MIL-STD-498 generators | this story | 3 |
| P1 (done) | Run `tools/sweep.py` and `tools/test_sweep.py` in CI after `check_names.py` | this story | 1–5 |
| P3 | Decide whether the 3.x training deck stays in `open-presentation` until a 4.x deck exists | PO | 4 |
| P3 | Decide whether `project-context-expansion` keeps editing `project-context.md` or retires in favour of `bmad-project-context` | PO | 1 |
| P3 | Decide whether records list the upstream skills they build on under `recommended_skills` | PO | 3 |

## Skipped Dimensions

None. Not in scope: the content of the skills beyond the five rules (the per-module stories verified it), the installer (Epic 39), `ma-atlassian`'s two unshipped members (Epic 38).

## Exemptions the sweep applies (and why)

| Exemption | Files at this audit | Reason |
|---|---|---|
| migrations: `skills/bmod-*/migration-<n>.toml`, `skills/*/scripts/migrate_*.py` | `bmod-ma-ops/migration-1.toml`, `ma-ops-dev-epic/scripts/migrate_v6_backlog.py` | they carry 3.x data over and must name 3.x files and the removed sprint skills (FR294, FR296); the key check and the cross-module check still apply to them |
| opaque assets: files that are not UTF-8 text, and `assets/*.cjs`, `assets/*.js`, `assets/*.mjs` | `ma-knowledge-atlas/assets/atlas.cjs`, `open-presentation/assets/BMAD_AI_Development_Training.pptx` | run by a script or opened by the user, never read as guidance; the engine's inner strings are its own (37.4 D1) |
| `bmad-code-org` | every `source` line | the upstream GitHub organisation, not a skill name |
