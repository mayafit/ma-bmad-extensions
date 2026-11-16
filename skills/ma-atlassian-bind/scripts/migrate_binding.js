#!/usr/bin/env node
'use strict';

/**
 * migrate_binding -- an ma-agents 3.x Atlassian binding into the ma-atlassian module (bmod-ma-atlassian/migration-1.toml).
 *
 * Reads the 3.x binding -- `_bmad-output/project-layout.yaml` (the Jira `sprint_management` record and the two
 * Confluence requirement stores) and the 3.x publish-hook blocks of `_bmad/custom/*.toml` -- and runs, in order:
 *
 *   1. the module answers, through `setup.py --module-answers` (only questions setup still lists as pending; a
 *      question already answered is kept and reported, with the 3.x value when it differs);
 *   2. deletion of every 3.x block (`# BEGIN:ma-agents-confluence-publish` .. `# END:ma-agents-confluence-publish`,
 *      the pair the 3.x installer wrote, and a commented `MA-AGENTS-START` .. `MA-AGENTS-END` pair), every other
 *      byte of the file kept, line endings included; a file whose 3.x markers are unbalanced, nested or mixed is
 *      left unchanged and reported;
 *   3. `ma-atlassian-bind bind` (`uv run --no-cache <skills-root>/ma-atlassian-bind/scripts/bind.py bind`);
 *   4. the report, `<output folder>/migration-v6-v7/ma-atlassian-migration-1.md`.
 *
 * 3.x -> 4.x answers: `sprint_management.jira_url` / `.jira_project_key` (mode `jira`) -> `jira_site` /
 * `jira_project_key`; a `confluence` requirement store's `space_key` and `root_page` (its id, else its title) ->
 * `planning_space` / `planning_root_page`. One Confluence store, or two with the same space and root page: that is
 * the planning destination and the tickets destination stays empty (the planning space). Two different ones: the
 * user chooses the planning store (`--planning-store system|software`); the other becomes the tickets destination.
 * `confluence_site` and the two MCP server names are not in a 3.x binding: a required one is asked for
 * (`--answer key=value`), an optional one takes its default. A required answer with no value stops the run before
 * anything is written (exit 3, one `ask:` line per question).
 *
 * `project-layout.yaml` is read, never changed: 4.x has no reader for it, and the report says the user may delete
 * it once satisfied. Every file the script changes is copied first to `<project-root>/.mv6/<run>/` under a short
 * hashed name (`index.txt` maps each copy to its source), so a backup path fits MAX_PATH on Windows whenever its
 * source does. A re-run completes what is left and changes nothing that is done: no pending question, no 3.x
 * block, an idempotent bind, and the report left as it is.
 *
 * Usage:
 *   node migrate_binding.js --project-root P [--skills-root S] [--output-folder F] [--answer KEY=VALUE ...]
 *                           [--planning-store system|software] [--dry-run] [--json]
 * Exit: 0 done (or nothing to migrate); 1 a step left work undone (a refused file, a setup or bind failure);
 *       2 a prerequisite is missing; 3 an answer or a choice is needed (nothing written).
 *
 * Node >= 22.20, built-in modules only.
 */

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');

const MODULE = 'ma-atlassian';
const SKILL = 'ma-atlassian-bind';
const ANSWER_KEYS = [
  'jira_site', 'jira_project_key', 'jira_mcp_server', 'confluence_site', 'confluence_mcp_server',
  'planning_space', 'planning_root_page', 'tickets_space', 'tickets_root_page',
];
const REQUIRED = new Set(['jira_site', 'jira_project_key', 'confluence_site', 'planning_space']);
const USER_SCOPED = new Set(['jira_mcp_server', 'confluence_mcp_server']);
const STORES = ['system', 'software'];
const LAYOUT = path.join('_bmad-output', 'project-layout.yaml');
const REPORT_NAME = 'ma-atlassian-migration-1.md';

// The 3.x marker families. A marker matches only a comment line that is exactly the marker once surrounding
// whitespace is removed (the 3.x writer's own rule); a marker inside a multi-line string is not a marker.
const FAMILIES = [
  { name: 'publish hook', begin: ['# BEGIN:ma-agents-confluence-publish'], end: ['# END:ma-agents-confluence-publish'] },
  { name: 'MA-AGENTS', begin: ['MA-AGENTS-START', '<!-- MA-AGENTS-START -->'], end: ['MA-AGENTS-END', '<!-- MA-AGENTS-END -->'] },
];

class Prerequisite extends Error {}

// ------------------------------------------------------------------ arguments

const HELP = `migrate_binding: an ma-agents 3.x Atlassian binding into the ma-atlassian module answers and bind.

Usage: node migrate_binding.js --project-root P [options]

  --project-root P        the folder holding _bmad/ (required)
  --skills-root S         the skills folder holding bmad and ${SKILL} (default: this script's skill folder's
                          parent, else the one <project-root>/<folder>/skills/ that holds ${SKILL})
  --output-folder F       core.output_folder (default: read with resolve_config.py)
  --answer KEY=VALUE      an answer for a pending question (repeatable); KEY= leaves it empty
  --planning-store NAME   system or software: the 3.x store that becomes the planning destination when the
                          3.x binding names two different Confluence stores
  --dry-run               print the plan; write nothing
  --json                  print a JSON summary as the last line

Exit: 0 done or nothing to migrate; 1 work left undone; 2 a prerequisite is missing; 3 an answer is needed.`;

function parseArgs(argv) {
  const args = { answers: new Map(), dryRun: false, json: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const value = () => {
      if (i + 1 >= argv.length) throw new Prerequisite(`${a} needs a value`);
      return argv[++i];
    };
    if (a === '--help' || a === '-h') args.help = true;
    else if (a === '--project-root') args.projectRoot = value();
    else if (a === '--skills-root') args.skillsRoot = value();
    else if (a === '--output-folder') args.outputFolder = value();
    else if (a === '--planning-store') args.planningStore = value();
    else if (a === '--dry-run') args.dryRun = true;
    else if (a === '--json') args.json = true;
    else if (a === '--answer') {
      const pair = value();
      const eq = pair.indexOf('=');
      const key = eq < 0 ? '' : pair.slice(0, eq).trim();
      if (!ANSWER_KEYS.includes(key)) throw new Prerequisite(`--answer ${JSON.stringify(pair)}: the key must be one of ${ANSWER_KEYS.join(', ')}`);
      args.answers.set(key, pair.slice(eq + 1).trim());
    } else throw new Prerequisite(`unknown argument ${JSON.stringify(a)} (see --help)`);
  }
  if (args.planningStore !== undefined && !STORES.includes(args.planningStore)) {
    throw new Prerequisite(`--planning-store must be system or software, not ${JSON.stringify(args.planningStore)}`);
  }
  return args;
}

// ------------------------------------------------------------------ processes

function run(cmd, argv, opts = {}) {
  const result = spawnSync(cmd, argv, {
    encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true,
    env: { ...process.env, PYTHONIOENCODING: 'utf-8' }, ...opts,
  });
  if (result.error) throw new Prerequisite(`${cmd} could not start: ${result.error.message}`);
  return { code: result.status, stdout: result.stdout || '', stderr: result.stderr || '' };
}

function uvRun(script, argv) {
  return run('uv', ['run', '--no-cache', script, ...argv]);
}

function tail(result) {
  return (result.stderr.trim() || result.stdout.trim()).split(/\r?\n/).slice(-6).join(' | ');
}

// ------------------------------------------------------------------ the 3.x project-layout.yaml

function unquoteDouble(s) {
  return s.replace(/\\(u[0-9a-fA-F]{4}|x[0-9a-fA-F]{2}|[\s\S])/g, (_m, e) => {
    if (e.length === 5 && e[0] === 'u') return String.fromCharCode(parseInt(e.slice(1), 16));
    if (e.length === 3 && e[0] === 'x') return String.fromCharCode(parseInt(e.slice(1), 16));
    return { 0: '\0', t: '\t', n: '\n', r: '\r', b: '\b', f: '\f', v: '\v' }[e] ?? e;
  });
}

function scalar(raw, lineNo) {
  const s = raw.trim();
  if (s.startsWith('"')) {
    const m = /^"((?:[^"\\]|\\.)*)"\s*(?:#.*)?$/.exec(s);
    if (!m) throw new Error(`line ${lineNo}: unterminated double-quoted value`);
    return unquoteDouble(m[1]);
  }
  if (s.startsWith("'")) {
    const m = /^'((?:[^']|'')*)'\s*(?:#.*)?$/.exec(s);
    if (!m) throw new Error(`line ${lineNo}: unterminated single-quoted value`);
    return m[1].replace(/''/g, "'");
  }
  const plain = s.replace(/\s+#.*$/, '').trim();
  if (plain === '' || plain === '~' || plain === 'null' || plain === 'Null' || plain === 'NULL') return null;
  if (/^[\[{|>&*!-]/.test(plain)) throw new Error(`line ${lineNo}: unsupported YAML value ${JSON.stringify(plain)}`);
  return plain;
}

/** The block-mapping subset of YAML the 3.x installer wrote: nested `key: value` / `key:` lines, no lists. */
function parseLayout(text) {
  const root = {};
  const stack = [{ indent: -1, node: root }];
  const lines = text.replace(/^﻿/, '').split(/\r?\n/);
  lines.forEach((line, i) => {
    if (/^\s*(#.*)?$/.test(line)) return;
    const m = /^( *)([A-Za-z0-9_.-]+)\s*:(?:\s+(.*))?$/.exec(line);
    if (!m) throw new Error(`line ${i + 1}: not a "key: value" line`);
    const indent = m[1].length;
    while (stack.length > 1 && indent <= stack[stack.length - 1].indent) stack.pop();
    const parent = stack[stack.length - 1].node;
    if (Object.prototype.hasOwnProperty.call(parent, m[2])) throw new Error(`line ${i + 1}: duplicate key ${m[2]}`);
    const rest = m[3] === undefined ? '' : m[3];
    if (rest.trim() === '' || /^#/.test(rest.trim())) {
      parent[m[2]] = {};
      stack.push({ indent, node: parent[m[2]] });
    } else {
      parent[m[2]] = scalar(rest, i + 1);
    }
  });
  return root;
}

function str(v) {
  return typeof v === 'string' ? v.trim() : '';
}

/** What the 3.x binding says about each 4.x answer. */
function mapLayout(doc, planningStore) {
  const mapped = {}; // key -> { value, from }
  const notes = []; // what was read and not carried over
  const sm = doc && typeof doc.sprint_management === 'object' ? doc.sprint_management : null;
  if (sm && str(sm.mode) === 'jira') {
    if (str(sm.jira_url)) mapped.jira_site = { value: str(sm.jira_url), from: 'sprint_management.jira_url' };
    if (str(sm.jira_project_key)) mapped.jira_project_key = { value: str(sm.jira_project_key), from: 'sprint_management.jira_project_key' };
  } else if (sm) {
    notes.push(`sprint_management is \`${str(sm.mode) || 'same'}\`, not \`jira\`: no Jira answer in the 3.x binding`);
  } else {
    notes.push('no `sprint_management` record: no Jira answer in the 3.x binding');
  }
  const confluence = [];
  for (const name of STORES) {
    const record = doc ? doc[`${name}_requirements_store`] : undefined;
    if (!record || typeof record !== 'object') continue;
    const backend = str(record.backend) || 'file-system';
    if (backend !== 'confluence') {
      notes.push(`\`${name}_requirements_store\` is a \`${backend}\` store: it has no Confluence destination; its documents stay in the output folder`);
      continue;
    }
    if (!str(record.space_key)) {
      notes.push(`\`${name}_requirements_store\` is a Confluence store with no \`space_key\`: not mapped`);
      continue;
    }
    const page = record.root_page && typeof record.root_page === 'object' ? record.root_page : {};
    const root = str(page.id) || str(page.title);
    const rootFrom = str(page.id) ? 'root_page.id' : str(page.title) ? 'root_page.title' : null;
    confluence.push({ name, space: str(record.space_key), root, rootFrom });
  }
  const asks = [];
  const set = (dest, store) => {
    mapped[`${dest}_space`] = { value: store.space, from: `${store.name}_requirements_store.space_key` };
    if (store.root) mapped[`${dest}_root_page`] = { value: store.root, from: `${store.name}_requirements_store.${store.rootFrom}` };
  };
  if (confluence.length === 1) {
    set('planning', confluence[0]);
  } else if (confluence.length === 2) {
    const [a, b] = confluence;
    if (a.space === b.space && a.root === b.root) {
      set('planning', a);
      mapped.planning_space.from += ' (both stores)';
      if (mapped.planning_root_page) mapped.planning_root_page.from += ' (both stores)';
    } else if (planningStore) {
      const chosen = confluence.find((s) => s.name === planningStore);
      set('planning', chosen);
      set('tickets', confluence.find((s) => s.name !== planningStore));
      notes.push(`the two 3.x Confluence stores differ; \`${planningStore}\` became the planning destination (--planning-store) and the other the tickets destination`);
    } else {
      asks.push({
        key: 'planning-store',
        prompt: `the 3.x binding names two Confluence stores: system (space ${a.space}, root ${a.root || 'none'}) and software (space ${b.space}, root ${b.root || 'none'}). Which becomes the planning destination? (--planning-store system|software; the other becomes the tickets destination)`,
      });
    }
  }
  return { mapped, notes, asks };
}

// ------------------------------------------------------------------ the 3.x blocks

/** Lines with their endings, as latin1 text, so every byte round-trips. */
function splitLines(text) {
  const lines = [];
  const re = /\r?\n/g;
  let pos = 0;
  let m;
  while ((m = re.exec(text)) !== null) {
    lines.push({ text: text.slice(pos, m.index), eol: m[0] });
    pos = m.index + m[0].length;
  }
  if (pos < text.length) lines.push({ text: text.slice(pos), eol: '' });
  return lines;
}

function markerOf(line) {
  const t = line.trim();
  if (!t.startsWith('#')) return null;
  const inner = t.replace(/^#+/, '').trim();
  for (const family of FAMILIES) {
    if (family.begin.includes(t) || family.begin.includes(inner)) return { family: family.name, kind: 'begin' };
    if (family.end.includes(t) || family.end.includes(inner)) return { family: family.name, kind: 'end' };
  }
  return null;
}

function countOf(text, needle) {
  let n = 0;
  for (let i = text.indexOf(needle); i >= 0; i = text.indexOf(needle, i + needle.length)) n++;
  return n;
}

/** The 3.x blocks of one file: { blocks: [{first, last, family}], error } (1-based line numbers in messages). */
function findBlocks(lines) {
  const blocks = [];
  let open = null;
  let inString = null; // the delimiter of an open multi-line string
  for (let i = 0; i < lines.length; i++) {
    const text = lines[i].text;
    if (inString) {
      if (countOf(text, inString) % 2 === 1) inString = null;
      continue;
    }
    const marker = markerOf(text);
    if (marker) {
      if (marker.kind === 'begin') {
        if (open) return { blocks, error: `a second 3.x begin marker at line ${i + 1} before the end of the block opened at line ${open.first + 1}` };
        open = { first: i, family: marker.family };
      } else {
        if (!open) return { blocks, error: `a 3.x end marker at line ${i + 1} with no begin marker` };
        if (open.family !== marker.family) return { blocks, error: `the 3.x block opened at line ${open.first + 1} ends with another marker pair at line ${i + 1}` };
        blocks.push({ first: open.first, last: i, family: open.family });
        open = null;
      }
      continue;
    }
    if (text.trim().startsWith('#')) continue;
    for (const delim of ['"""', "'''"]) {
      if (countOf(text, delim) % 2 === 1) {
        inString = delim;
        break;
      }
    }
  }
  if (open) return { blocks, error: `the 3.x begin marker at line ${open.first + 1} has no end marker` };
  return { blocks, error: null };
}

function withoutBlocks(lines, blocks) {
  const drop = new Set();
  for (const b of blocks) for (let i = b.first; i <= b.last; i++) drop.add(i);
  return lines.filter((_, i) => !drop.has(i)).map((l) => l.text + l.eol).join('');
}

function scanCustom(project) {
  const dir = path.join(project, '_bmad', 'custom');
  if (!fs.existsSync(dir)) return [];
  const files = fs.readdirSync(dir).filter((n) => n.endsWith('.toml')).sort();
  return files.map((name) => {
    const file = path.join(dir, name);
    const text = fs.readFileSync(file).toString('latin1');
    const lines = splitLines(text);
    const { blocks, error } = findBlocks(lines);
    return { name, file, text, lines, blocks: error ? [] : blocks, error };
  });
}

// ------------------------------------------------------------------ the run

function stamp() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
}

function relOf(project, file) {
  const r = path.relative(project, file);
  return r.startsWith('..') || path.isAbsolute(r) ? file.split(path.sep).join('/') : r.split(path.sep).join('/');
}

function backup(ctx, file) {
  const rel = relOf(ctx.project, file);
  const digest = crypto.createHash('sha256').update(rel, 'utf8').digest('hex').slice(0, 10);
  const copy = path.join(ctx.backupDir, digest + path.extname(file));
  if (fs.existsSync(copy)) return;
  fs.mkdirSync(ctx.backupDir, { recursive: true });
  const ignore = path.join(ctx.backupDir, '.gitignore');
  if (!fs.existsSync(ignore)) fs.writeFileSync(ignore, '*\n');
  fs.copyFileSync(file, copy);
  fs.appendFileSync(path.join(ctx.backupDir, 'index.txt'), `${path.basename(copy)}\t${rel}\n`, 'utf8');
  ctx.backups.push(rel);
}

function defaultSkillsRoot(project) {
  const here = path.resolve(__dirname);
  if (path.basename(here) === 'scripts' && path.basename(path.dirname(here)) === SKILL) return path.dirname(path.dirname(here));
  const found = [];
  for (const entry of fs.readdirSync(project, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    for (const candidate of [path.join(project, entry.name, 'skills'), path.join(project, entry.name)]) {
      if (fs.existsSync(path.join(candidate, SKILL, 'SKILL.md')) && !found.includes(candidate)) found.push(candidate);
    }
  }
  if (found.length === 1) return found[0];
  throw new Prerequisite(found.length
    ? `${SKILL} is installed in more than one skills folder (${found.map((f) => relOf(project, f)).join(', ')}); pass --skills-root`
    : `no skills folder under ${project} holds ${SKILL}; pass --skills-root`);
}

function resolveOutput(ctx, given) {
  if (given) return path.resolve(ctx.project, given);
  const script = path.join(ctx.project, '_bmad', 'scripts', 'resolve_config.py');
  if (!fs.existsSync(script)) return path.join(ctx.project, '_bmad-output');
  const r = uvRun(script, ['--project-root', ctx.project, '--key', 'core.output_folder']);
  if (r.code !== 0) throw new Prerequisite(`resolve_config.py exited ${r.code}: ${tail(r)}`);
  const value = String(JSON.parse(r.stdout)['core.output_folder'] || '_bmad-output');
  return path.resolve(ctx.project, value.replace('{project-root}', ctx.project));
}

function currentAnswers(ctx, keys) {
  if (!keys.length) return {};
  const script = path.join(ctx.project, '_bmad', 'scripts', 'resolve_config.py');
  if (!fs.existsSync(script)) return {};
  const argv = ['--project-root', ctx.project];
  for (const k of keys) argv.push('--key', `modules.${MODULE}.${k}`);
  const r = uvRun(script, argv);
  if (r.code !== 0) throw new Prerequisite(`resolve_config.py exited ${r.code}: ${tail(r)}`);
  const data = JSON.parse(r.stdout);
  const out = {};
  for (const k of keys) {
    const v = data[`modules.${MODULE}.${k}`];
    out[k] = typeof v === 'string' ? v : '';
  }
  return out;
}

function pendingQuestions(ctx) {
  const r = uvRun(ctx.setup, ['--project-root', ctx.project, '--skill', ctx.bmad, '--root', ctx.skillsRoot,
    '--module', MODULE, '--list-config-questions']);
  if (r.code !== 0) throw new Prerequisite(`setup.py --list-config-questions exited ${r.code}: ${tail(r)}`);
  const data = JSON.parse(r.stdout);
  if (!Array.isArray(data)) throw new Prerequisite(`setup.py does not know the ${MODULE} module here: ${r.stdout.trim().slice(0, 400)}`);
  return data.filter((q) => q.module === MODULE);
}

function tomlString(v) {
  return JSON.stringify(v).replace(/\u007f/g, '\\u007f');
}

function bindChanged(lines) {
  return lines.some((l) => /: (written|updated)$/.test(l) || /\(stale pair removed\)$/.test(l)
    || /^\S+\.toml: [1-9]\d* key\(s\) written/.test(l) || /key\(s\) written, [1-9]\d* updated/.test(l));
}

function planAnswers(ctx, args, mapped, pending, choicePending) {
  const pendingKeys = new Map(pending.map((q) => [q.key, q]));
  const current = currentAnswers(ctx, ANSWER_KEYS.filter((k) => !pendingKeys.has(k)));
  const rows = [];
  const asks = [];
  for (const key of ANSWER_KEYS) {
    const scope = pendingKeys.get(key)?.scope || (USER_SCOPED.has(key) ? 'user' : 'team');
    const m = mapped[key];
    if (pendingKeys.has(key)) {
      if (args.answers.has(key)) rows.push({ key, scope, value: args.answers.get(key), how: 'asked', note: 'answered by the user (--answer)' });
      else if (m) rows.push({ key, scope, value: m.value, how: 'mapped', note: `from \`${m.from}\`` });
      else if (choicePending && key.startsWith('planning_')) {
        rows.push({ key, scope, value: null, how: 'ask', note: 'follows the planning-store choice' });
      } else if (REQUIRED.has(key)) {
        rows.push({ key, scope, value: null, how: 'ask', note: 'required; not in the 3.x binding' });
        asks.push({ key, prompt: pendingKeys.get(key).prompt });
      } else rows.push({ key, scope, value: String(pendingKeys.get(key).default ?? ''), how: 'default', note: 'not in the 3.x binding; the default' });
    } else {
      const value = current[key] ?? '';
      let note = 'already answered; kept';
      if (m && m.value !== value) note += ` (the 3.x binding has \`${m.value}\` in \`${m.from}\`)`;
      if (args.answers.has(key) && args.answers.get(key) !== value) note += '; --answer ignored: not a pending question';
      rows.push({ key, scope, value, how: 'kept', note });
    }
  }
  return { rows, asks };
}

function reportText(ctx, s) {
  const md = (v) => (v === null ? '(asked)' : v === '' ? '(empty)' : `\`${v}\``);
  const out = [
    '---',
    'type: migration',
    "title: 'ma-atlassian migration 1: the 3.x Atlassian binding into the module answers and bind'",
    `status: ${s.complete ? 'done' : 'incomplete'}`,
    `created: '${ctx.stamp.slice(0, 8)}'`,
    '---',
    '',
    '# ma-atlassian migration 1: the 3.x Atlassian binding into the module answers and bind',
    '',
    `Run \`${ctx.stamp}\` by \`migrate_binding.js\`. ` + (ctx.backups.length
      ? `Backups of every changed file: \`${relOf(ctx.project, ctx.backupDir)}/\` (its \`index.txt\` maps each copy to its source); nothing was overwritten or deleted.`
      : 'No file changed this run, so no backup was made.'),
    '',
    '## Inputs read',
    '',
    ...s.inputs.map((l) => `- ${l}`),
    '',
    '## Answers',
    '',
    '| answer | scope | value | how |',
    '|---|---|---|---|',
    ...s.rows.map((r) => `| \`${r.key}\` | ${r.scope} | ${md(r.value)} | ${r.how}: ${r.note} |`),
    '',
    s.answersWritten ? `Written through \`setup.py --module-answers\`: ${s.answersWritten} pending answer(s).` : 'No pending question: setup was not asked to write an answer.',
    '',
    '## 3.x blocks',
    '',
    ...(s.blockLines.length ? s.blockLines.map((l) => `- ${l}`) : ['- none found']),
    '',
    '## Bind',
    '',
    `\`ma-atlassian-bind bind\` exited ${s.bindCode}:`,
    '',
    '```text',
    ...s.bindLines,
    '```',
    '',
    '## Not carried over',
    '',
    ...s.notes.map((l) => `- ${l}`),
    '',
    '## Verification',
    '',
    'Filled in by `bmad migrate` from the `checklist` of `bmod-ma-atlassian/migration-1.toml`.',
    '',
  ];
  return out.join('\n');
}

function main(argv) {
  const say = (line) => process.stdout.write(line + '\n');
  let args;
  try {
    args = parseArgs(argv);
  } catch (e) {
    say(`prerequisite: ${e.message}`);
    return 2;
  }
  if (args.help) {
    say(HELP);
    return 0;
  }
  const ctx = { stamp: stamp(), backups: [] };
  let summary = null;
  try {
    if (!args.projectRoot) throw new Prerequisite('--project-root is required (see --help)');
    ctx.project = path.resolve(args.projectRoot);
    if (!fs.existsSync(path.join(ctx.project, '_bmad'))) throw new Prerequisite(`${ctx.project} holds no _bmad/: BMad is not set up there; ask bmad to run setup`);
    ctx.backupDir = path.join(ctx.project, '.mv6', ctx.stamp);

    // the 3.x binding
    const layoutPath = path.join(ctx.project, LAYOUT);
    const custom = scanCustom(ctx.project);
    const marked = custom.filter((f) => f.blocks.length || f.error);
    const hasLayout = fs.existsSync(layoutPath);
    if (!hasLayout && !marked.length) {
      say(`nothing to migrate: no ${LAYOUT.split(path.sep).join('/')} and no 3.x block in _bmad/custom/*.toml`);
      if (args.json) say(JSON.stringify({ exit: 0, nothing: true }));
      return 0;
    }

    ctx.skillsRoot = path.resolve(args.skillsRoot || defaultSkillsRoot(ctx.project));
    ctx.bmad = path.join(ctx.skillsRoot, 'bmad');
    ctx.setup = path.join(ctx.bmad, 'scripts', 'setup.py');
    ctx.bind = path.join(ctx.skillsRoot, SKILL, 'scripts', 'bind.py');
    for (const need of [ctx.setup, ctx.bind]) if (!fs.existsSync(need)) throw new Prerequisite(`${need} not found: is ${need === ctx.bind ? SKILL : 'bmad'} installed in ${ctx.skillsRoot}?`);
    if (run('uv', ['--version']).code !== 0) throw new Prerequisite('uv does not run');

    const inputs = [];
    const notes = [];
    let doc = null;
    if (hasLayout) {
      try {
        doc = parseLayout(fs.readFileSync(layoutPath, 'utf8'));
        inputs.push(`\`${relOf(ctx.project, layoutPath)}\` (schema_version ${str(doc.schema_version) || '1 (none declared)'}): read, not changed`);
      } catch (e) {
        inputs.push(`\`${relOf(ctx.project, layoutPath)}\`: could not be read (${e.message}); no answer mapped from it`);
      }
      notes.push(`\`${relOf(ctx.project, layoutPath)}\` is kept as it was; 4.x reads nothing from it, so delete it once you are satisfied (version control or the 4.x upgrade backup holds it)`);
    } else {
      inputs.push(`\`${LAYOUT.split(path.sep).join('/')}\`: absent; no answer mapped from it`);
    }
    for (const f of custom) {
      const rel = relOf(ctx.project, f.file);
      if (f.error) inputs.push(`\`${rel}\`: damaged 3.x markers (${f.error})`);
      else if (f.blocks.length) inputs.push(`\`${rel}\`: ${f.blocks.length} 3.x block(s), lines ${f.blocks.map((b) => `${b.first + 1}-${b.last + 1}`).join(', ')}`);
      else inputs.push(`\`${rel}\`: no 3.x block`);
    }
    // 1. answers (plan)
    const pending = pendingQuestions(ctx);
    const layoutMap = doc ? mapLayout(doc, args.planningStore) : { mapped: {}, notes: [], asks: [] };
    // The planning-store choice matters only while a destination answer is still pending and not given by --answer.
    const openDestination = pending.some((q) => /^(planning|tickets)_/.test(q.key) && !args.answers.has(q.key));
    if (layoutMap.asks.length && !openDestination) {
      layoutMap.asks = [];
      layoutMap.notes.push('the 3.x binding names two different Confluence stores; the destination answers are already given, so no store was chosen');
    }
    notes.push(...layoutMap.notes);
    const { rows, asks } = planAnswers(ctx, args, layoutMap.mapped, pending, layoutMap.asks.length > 0);
    const allAsks = [...layoutMap.asks, ...asks];
    for (const r of rows) say(`answer ${r.key} (${r.scope}): ${r.value === null ? '(ask)' : JSON.stringify(r.value)} -- ${r.how}: ${r.note}`);
    const blockLines = [];
    for (const f of custom) {
      const rel = relOf(ctx.project, f.file);
      if (f.error) blockLines.push(`\`${rel}\`: refused, left unchanged: ${f.error}; repair the markers by hand and run the migration again`);
      else for (const b of f.blocks) blockLines.push(`\`${rel}\`: lines ${b.first + 1}-${b.last + 1} (${b.family} block) ${args.dryRun || allAsks.length ? 'to delete' : 'deleted'}`);
    }
    for (const l of blockLines) say(`block ${l.replace(/`/g, '')}`);
    if (allAsks.length) {
      for (const a of allAsks) say(`ask: ${a.key}: ${a.prompt}`);
      say('nothing written: answer each question (--answer KEY=VALUE, --planning-store NAME) and run again');
      if (args.json) say(JSON.stringify({ exit: 3, asks: allAsks.map((a) => a.key) }));
      return 3;
    }
    const output = resolveOutput(ctx, args.outputFolder);
    const report = path.join(output, 'migration-v6-v7', REPORT_NAME);
    if (args.dryRun) {
      say(`would run: setup.py --module-answers (${pending.length} pending answer(s)), delete ${custom.reduce((n, f) => n + f.blocks.length, 0)} 3.x block(s), ${SKILL} bind`);
      say(`would write: ${report}`);
      say('dry run: nothing written');
      if (args.json) say(JSON.stringify({ exit: 0, dry_run: true, pending: pending.length }));
      return 0;
    }

    // 1. answers (write)
    let answersWritten = 0;
    let complete = true;
    if (pending.length) {
      const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'mab-'));
      const file = path.join(tmp, 'answers.toml');
      try {
        const body = rows.filter((r) => r.how !== 'kept').map((r) => `${r.key} = ${tomlString(r.value)}\n`).join('');
        fs.writeFileSync(file, `[modules."${MODULE}"]\n${body}`, 'utf8');
        const r = uvRun(ctx.setup, ['--project-root', ctx.project, '--skill', ctx.bmad, '--root', ctx.skillsRoot,
          '--module', MODULE, '--module-answers', file]);
        if (r.code !== 0) {
          say(`error: setup.py --module-answers exited ${r.code}: ${tail(r)}`);
          say('migration: incomplete; nothing was changed (no 3.x block deleted, bind not run)');
          if (args.json) say(JSON.stringify({ exit: 1, setup_exit: r.code }));
          return 1;
        }
        answersWritten = pending.length;
        say(`setup.py --module-answers: ${answersWritten} answer(s) written`);
      } finally {
        fs.rmSync(tmp, { recursive: true, force: true });
      }
    }

    // 2. the 3.x blocks
    let deleted = 0;
    for (const f of custom) {
      if (f.error) {
        complete = false;
        continue;
      }
      if (!f.blocks.length) continue;
      backup(ctx, f.file);
      fs.writeFileSync(f.file, Buffer.from(withoutBlocks(f.lines, f.blocks), 'latin1'));
      deleted += f.blocks.length;
    }
    if (deleted) say(`3.x blocks: ${deleted} deleted`);

    // 3. bind
    const b = uvRun(ctx.bind, ['bind', '--project-root', ctx.project, '--skills-root', ctx.skillsRoot]);
    const bindLines = (b.stdout + (b.stderr.trim() ? b.stderr : '')).split(/\r?\n/).filter((l) => l.trim() !== '');
    for (const l of bindLines) say(`bind: ${l}`);
    if (b.code !== 0) complete = false;
    const changedByBind = bindChanged(bindLines);

    // 4. the report
    const changed = answersWritten > 0 || deleted > 0 || changedByBind;
    summary = { inputs, rows, answersWritten, blockLines, bindCode: b.code, bindLines, notes, complete };
    if (changed || !fs.existsSync(report)) {
      fs.mkdirSync(path.dirname(report), { recursive: true });
      fs.writeFileSync(report, reportText(ctx, summary), 'utf8');
      say(`report: ${report}`);
    } else {
      say(`report: ${report} (unchanged: nothing to migrate this run)`);
    }
    if (ctx.backups.length) say(`backups: ${ctx.backupDir} (${ctx.backups.length} file(s))`);
    const code = complete ? 0 : 1;
    say(complete ? (changed ? 'migration: done' : 'migration: done; nothing changed (already migrated)') : 'migration: incomplete; see the report');
    if (args.json) {
      say(JSON.stringify({ exit: code, answers_written: answersWritten, blocks_deleted: deleted, bind_changed: changedByBind,
        bind_exit: b.code, changed, report, backup_dir: ctx.backups.length ? ctx.backupDir : null }));
    }
    return code;
  } catch (e) {
    if (e instanceof Prerequisite) {
      say(`prerequisite: ${e.message}`);
      return 2;
    }
    throw e;
  }
}

if (require.main === module) {
  process.exitCode = main(process.argv.slice(2));
}

module.exports = { parseLayout, mapLayout, findBlocks, splitLines, withoutBlocks, main };
