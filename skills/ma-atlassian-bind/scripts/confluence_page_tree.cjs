#!/usr/bin/env node
'use strict';
/**
 * Confluence page tree of ma-atlassian (Story 38.4; ma-agents PRD F29 "Destinations", FR290, FR300;
 * Decision P5-11.9). Ported from the ma-agents 3.x engine `lib/confluence-page-tree.js` (Epic 31) to the
 * BMad v7 initiative store, with no npm dependency (Node >= 22.20 built-ins only).
 *
 * One Confluence page per Markdown file of the initiative store, nested under the destination's root page
 * so the pages mirror the store's folders:
 *
 *   planning  documents of the planning skills' runs (`prd-*`, `architecture-*`, `ux-*`, `brief-*`,
 *             `prfaq-*`, facilitate runs): any Markdown file inside a folder that is not part of the
 *             ticket tree;
 *   tickets   the ticket tree: `initiative-*.md`, `epic-*.md`, `story-*.md`, `spike-*.md`, `bug-*.md` and
 *             the build plans `*-plan.md`, in folders that are all ticket-tree folders (`initiative-*`,
 *             `epic-*`, `tickets`, `backlog`).
 *
 * Tree rules (the v7 form of 3.x's "index rule"):
 *   - a folder is a page titled with the folder name; a file is a page titled with its name without `.md`;
 *     inside a planning run the title is prefixed with the run's folder name (`ux-checkout - DESIGN`);
 *   - a file named after its own folder (`epic-cart/epic-cart.md`, `prd-x/prd-x.md`) is that folder's page:
 *     the file gives the body, the folder gives the children;
 *   - `tickets/` folders are not pages: their content hangs under the container that owns them, so an epic
 *     is a child of its initiative and a story a child of its epic;
 *   - a folder page with no file of its own carries no body; nothing else is generated.
 * Hidden paths (`.memlog.md`, `.working/`), non-Markdown files (`tickets.toml`) and Markdown files that are
 * neither a ticket nor inside a planning run (`glossary.md`) are left out and reported with the reason.
 *
 * Page identity is (space, title): Confluence titles are unique within a space. The collision predicate
 * that refuses two pages with one title is `confluence_collision_check.cjs`.
 *
 * This module never writes a file and opens no socket. Its command line prints the preview of
 * `ma-atlassian-confluence-plan`:
 *
 *   node confluence_page_tree.cjs --project-root DIR [--destination planning|tickets|both] [--path FILE ...] [--json]
 *
 * Exit: 0 the plan has no collision, 1 a collision (the plan is printed with it), 2 a prerequisite is missing.
 */

const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const MODULE = 'ma-atlassian';
const PLANNING = 'planning';
const TICKETS = 'tickets';
const DESTINATIONS = Object.freeze([PLANNING, TICKETS]);

const ROLE_ROOT = 'root';
const ROLE_FOLDER = 'folder';
const ROLE_DOCUMENT = 'document';

const EXCLUDED_HIDDEN = 'hidden path';
const EXCLUDED_NOT_MARKDOWN = 'not Markdown';
const EXCLUDED_UNCLASSIFIED = 'neither a ticket nor a planning document';
const EXCLUDED_OTHER_DESTINATION = 'belongs to the other destination';
const EXCLUDED_OUTSIDE = 'outside the output folder';
const EXCLUDED_MISSING = 'no such file';

const TICKET_FOLDER = /^(initiative-.+|epic-.+|tickets|backlog)$/;
const TICKET_FILE = /^((initiative|epic|story|spike|bug)-.+|.+-plan)\.md$/;
const COLLAPSED_FOLDER = 'tickets';

const ANSWER_KEYS = Object.freeze([
  'confluence_site', 'confluence_mcp_server', 'planning_space', 'planning_root_page', 'tickets_space',
  'tickets_root_page',
]);

class Prerequisite extends Error {}

function posix(rel) {
  return String(rel == null ? '' : rel).replace(/\\/g, '/').replace(/^\.\//, '').replace(/^\/+/, '').replace(/\/+$/, '');
}

/**
 * Classify one path relative to the output folder: `{destination}` or `{excluded: reason}`.
 * `destination` is `planning` or `tickets`.
 */
function classifyPath(relPath) {
  const rel = posix(relPath);
  const segs = rel.split('/').filter((s) => s !== '');
  if (segs.length === 0) return { excluded: EXCLUDED_UNCLASSIFIED };
  if (segs.some((s) => s.startsWith('.'))) return { excluded: EXCLUDED_HIDDEN };
  const file = segs[segs.length - 1];
  if (!/\.md$/i.test(file)) return { excluded: EXCLUDED_NOT_MARKDOWN };
  const folders = segs.slice(0, -1);
  if (folders.length === 0) return { excluded: EXCLUDED_UNCLASSIFIED };
  if (folders.some((f) => !TICKET_FOLDER.test(f))) return { destination: PLANNING };
  if (TICKET_FILE.test(file)) return { destination: TICKETS };
  return { excluded: EXCLUDED_UNCLASSIFIED };
}

/** The page segments of a path: `tickets/` folders collapsed, a file named after its folder merged into it. */
function pageSegments(relPath) {
  const segs = posix(relPath).split('/').filter((s) => s !== '');
  const file = segs.pop();
  const folders = segs.filter((s) => s !== COLLAPSED_FOLDER);
  const stem = file.replace(/\.md$/i, '');
  if (folders.length > 0 && folders[folders.length - 1] === stem) return folders;
  return [...folders, stem];
}

/**
 * The title of page segment `i`. Titles are unique within a space, and every UX run holds a `DESIGN.md`, so a
 * page inside a planning run folder (the first folder of the path outside the ticket tree) carries the run's
 * name: `ux-checkout - DESIGN`. A segment that already starts with the run's name keeps its own name.
 */
function titleFor(segs, i) {
  const run = segs.findIndex((s) => !TICKET_FOLDER.test(s));
  const seg = segs[i];
  if (run === -1 || run >= i || seg === segs[run] || seg.startsWith(`${segs[run]}-`)) return seg;
  return `${segs[run]} - ${seg}`;
}

/**
 * Build the page tree of one destination.
 * @param {object} spec  { destination, site, space, rootTitle, documents: [{path, abs?}] }
 * @returns {object} plan { destination, site, space, rootTitle, nodes: [{key, title, parentKey, role, sourcePath}] }
 *   Nodes are ordered parents first (depth, then key). Two documents mapping to one page are reported in
 *   `duplicates`; the collision check refuses them.
 */
function planDestination(spec) {
  const destination = spec.destination;
  if (!DESTINATIONS.includes(destination)) throw new Error(`unknown destination ${JSON.stringify(destination)}`);
  const space = String(spec.space || '').trim();
  const rootTitle = String(spec.rootTitle || '').trim();
  if (!space) throw new Prerequisite(`the ${destination} destination has no space key`);
  if (!rootTitle) throw new Prerequisite(`the ${destination} destination has no root page title`);
  const byKey = new Map();
  byKey.set('', { key: '', title: rootTitle, parentKey: null, role: ROLE_ROOT, sourcePath: null, abs: null });
  const duplicates = [];
  const documents = [...(spec.documents || [])].sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0));
  for (const doc of documents) {
    const segs = pageSegments(doc.path);
    let parentKey = '';
    segs.forEach((seg, i) => {
      const title = titleFor(segs, i);
      const key = parentKey === '' ? seg : `${parentKey}/${seg}`;
      let node = byKey.get(key);
      if (!node) {
        node = { key, title, parentKey, role: ROLE_FOLDER, sourcePath: null, abs: null };
        byKey.set(key, node);
      }
      if (i === segs.length - 1) {
        if (node.sourcePath !== null && node.sourcePath !== posix(doc.path)) {
          duplicates.push({ title, key, a: node.sourcePath, b: posix(doc.path) });
        } else {
          node.role = ROLE_DOCUMENT;
          node.sourcePath = posix(doc.path);
          node.abs = doc.abs || null;
        }
      }
      parentKey = key;
    });
  }
  const depth = (k) => (k === '' ? 0 : k.split('/').length);
  const nodes = [...byKey.values()].sort((a, b) => depth(a.key) - depth(b.key) || (a.key < b.key ? -1 : a.key > b.key ? 1 : 0));
  return { destination, site: spec.site || '', space, rootTitle, nodes, duplicates };
}

// ----------------------------------------------------------------------------- project and answers

/** The answers and core keys, read only through BMad's `resolve_config.py` (P5-11.3, FR293). */
function readAnswers(projectRoot) {
  const resolver = path.join(projectRoot, '_bmad', 'scripts', 'resolve_config.py');
  if (!fs.existsSync(resolver)) {
    throw new Prerequisite(`${resolver} not found: BMad is not set up in this project; ask bmad to run setup`);
  }
  const args = ['run', '--no-cache', resolver, '--project-root', projectRoot,
    '--key', 'core.output_folder', '--key', 'core.project_name'];
  for (const key of ANSWER_KEYS) args.push('--key', `modules.${MODULE}.${key}`);
  const result = spawnSync('uv', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true });
  if (result.error) throw new Prerequisite(`uv could not be started (${result.error.code || result.error.message}); BMad's resolve_config.py runs with it`);
  if (result.status !== 0) throw new Prerequisite(`resolve_config.py exited ${result.status}: ${(result.stderr || result.stdout).trim()}`);
  let data;
  try {
    data = JSON.parse(result.stdout);
  } catch (error) {
    throw new Prerequisite(`resolve_config.py printed no JSON: ${error.message}`);
  }
  const text = (key) => (typeof data[key] === 'string' ? data[key].trim() : '');
  const answers = {};
  for (const key of ANSWER_KEYS) answers[key] = text(`modules.${MODULE}.${key}`);
  const outputFolder = text('core.output_folder').split('{project-root}').join(projectRoot);
  return { ...answers, output_folder: outputFolder ? path.resolve(projectRoot, outputFolder) : '', project_name: text('core.project_name') };
}

/** The two destinations from the answers: `tickets_space` empty means the planning space (FR300). */
function destinations(answers) {
  const missing = ['confluence_site', 'planning_space'].filter((k) => !answers[k]);
  if (missing.length) throw new Prerequisite(`unbound: missing answer ${missing.join(', ')}; ask bmad to run \`bmad setup ma-atlassian\``);
  const root = (answer) => answer || answers.project_name;
  if (!root(answers.planning_root_page) || !root(answers.tickets_root_page)) {
    throw new Prerequisite('a root page answer is empty and core.project_name is empty too; record a root page with ma-atlassian-confluence-record-root-page');
  }
  const site = answers.confluence_site.replace(/\/+$/, '');
  return {
    [PLANNING]: { destination: PLANNING, site, space: answers.planning_space, rootTitle: root(answers.planning_root_page), rootAnswered: Boolean(answers.planning_root_page) },
    [TICKETS]: { destination: TICKETS, site, space: answers.tickets_space || answers.planning_space, rootTitle: root(answers.tickets_root_page), rootAnswered: Boolean(answers.tickets_root_page) },
  };
}

function walk(dir, base, out) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const entry of entries) {
    const abs = path.join(dir, entry.name);
    const rel = posix(path.relative(base, abs));
    if (entry.isDirectory()) {
      if (entry.name.startsWith('.')) out.push({ path: `${rel}/`, abs: null, hiddenFolder: true });
      else walk(abs, base, out);
    } else if (entry.isFile()) {
      out.push({ path: rel, abs });
    }
    // Symbolic links are not followed: the store is the output folder's own files.
  }
  return out;
}

function inside(parent, child) {
  const rel = path.relative(parent, child);
  return rel !== '' && !rel.startsWith('..') && !path.isAbsolute(rel);
}

/**
 * Select the store's documents for the chosen destinations.
 * @param {string} outputFolder absolute
 * @param {string[]} chosen destinations
 * @param {string[]} paths optional files (absolute or relative to `cwd`); empty: the whole store
 */
function selectDocuments(outputFolder, chosen, paths, cwd) {
  const selected = Object.fromEntries(chosen.map((d) => [d, []]));
  const excluded = [];
  let candidates;
  if (paths && paths.length) {
    candidates = [];
    for (const p of paths) {
      const abs = path.resolve(cwd || process.cwd(), p);
      if (!inside(outputFolder, abs)) {
        excluded.push({ path: p, reason: EXCLUDED_OUTSIDE });
        continue;
      }
      let stat;
      try {
        stat = fs.lstatSync(abs);
      } catch {
        stat = null;
      }
      if (!stat || !stat.isFile()) {
        excluded.push({ path: posix(path.relative(outputFolder, abs)), reason: EXCLUDED_MISSING });
        continue;
      }
      candidates.push({ path: posix(path.relative(outputFolder, abs)), abs });
    }
  } else {
    candidates = fs.existsSync(outputFolder) ? walk(outputFolder, outputFolder, []) : [];
  }
  for (const cand of candidates) {
    if (cand.hiddenFolder) {
      excluded.push({ path: cand.path, reason: EXCLUDED_HIDDEN });
      continue;
    }
    const c = classifyPath(cand.path);
    if (c.excluded) excluded.push({ path: cand.path, reason: c.excluded });
    else if (!selected[c.destination]) excluded.push({ path: cand.path, reason: EXCLUDED_OTHER_DESTINATION, destination: c.destination });
    else selected[c.destination].push(cand);
  }
  excluded.sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0));
  return { selected, excluded };
}

/** Everything a command needs: answers, destinations and the plans of the chosen destinations. */
function buildPlans(options) {
  const projectRoot = path.resolve(options.projectRoot);
  if (!fs.existsSync(path.join(projectRoot, '_bmad'))) {
    throw new Prerequisite(`${projectRoot} holds no _bmad/: BMad is not set up there; ask bmad to run setup`);
  }
  const answers = readAnswers(projectRoot);
  if (!answers.output_folder) throw new Prerequisite('core.output_folder is empty; ask bmad to run setup');
  const dests = destinations(answers);
  const chosen = options.destination === 'both' || !options.destination ? [...DESTINATIONS] : [options.destination];
  const { selected, excluded } = selectDocuments(answers.output_folder, chosen, options.paths || [], options.cwd);
  const plans = chosen.map((d) => planDestination({ ...dests[d], documents: selected[d] }));
  return { projectRoot, answers, destinations: dests, plans, excluded };
}

// ----------------------------------------------------------------------------- command line

function parseArgs(argv, spec) {
  const out = { paths: [] };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--help' || arg === '-h') return { help: true };
    const flag = spec[arg];
    if (flag === undefined) throw new Prerequisite(`unknown argument ${JSON.stringify(arg)}`);
    if (flag === true) {
      out[arg.slice(2).replace(/-([a-z])/g, (m, c) => c.toUpperCase())] = true;
      continue;
    }
    const value = argv[++i];
    if (value === undefined) throw new Prerequisite(`${arg} needs a value`);
    if (Array.isArray(flag) && !flag.includes(value)) throw new Prerequisite(`${arg} must be one of ${flag.join(', ')}`);
    if (arg === '--path') out.paths.push(value);
    else out[arg.slice(2).replace(/-([a-z])/g, (m, c) => c.toUpperCase())] = value;
  }
  return out;
}

function printPlan(plan, out) {
  const dest = plan.destination;
  out(`destination ${dest}: site ${plan.site}, space ${plan.space}, root page "${plan.rootTitle}"`);
  const depth = (k) => (k === '' ? 0 : k.split('/').length);
  for (const node of plan.nodes) {
    const pad = '  '.repeat(depth(node.key) + 1);
    const what = node.role === ROLE_ROOT ? 'root page' : node.role === ROLE_DOCUMENT ? node.sourcePath : 'folder page, no body';
    out(`${pad}${node.title}  (${what})`);
  }
  out(`  ${plan.nodes.length - 1} page(s) under the root page`);
}

const USAGE = `usage: node confluence_page_tree.cjs --project-root DIR [--destination planning|tickets|both] [--path FILE ...] [--json]

Preview the Confluence page tree of the initiative store: one page per Markdown file, under the root page
of the planning destination (planning documents) or the tickets destination (initiative, epic, story,
spike and bug files, build plans). Writes nothing and reaches no server; runs the local collision check.
Exit: 0 no collision, 1 a collision, 2 a prerequisite is missing.`;

function main(argv, out = console.log) {
  let args;
  try {
    args = parseArgs(argv, { '--project-root': null, '--destination': ['planning', 'tickets', 'both'], '--path': null, '--json': true });
    if (args.help) {
      out(USAGE);
      return 0;
    }
    if (!args.projectRoot) throw new Prerequisite('--project-root is required');
    const built = buildPlans({ projectRoot: args.projectRoot, destination: args.destination, paths: args.paths });
    const { localCollisions } = require('./confluence_collision_check.cjs');
    const collisions = localCollisions(built.plans);
    if (args.json) {
      out(JSON.stringify({
        plans: built.plans.map((p) => ({ ...p, nodes: p.nodes.map(({ abs, ...n }) => n) })),
        excluded: built.excluded,
        collisions,
      }, null, 2));
    } else {
      for (const plan of built.plans) printPlan(plan, out);
      if (built.excluded.length) {
        out(`left out (${built.excluded.length}):`);
        for (const e of built.excluded) out(`  ${e.path}: ${e.reason}${e.destination ? ` (${e.destination})` : ''}`);
      }
      for (const c of collisions) out(`collision: ${c.message}`);
      out(collisions.length ? `preview: ${collisions.length} collision(s); publishing would be refused` : 'preview: no collision; nothing was written');
    }
    return collisions.length ? 1 : 0;
  } catch (error) {
    if (error instanceof Prerequisite) {
      out(`prerequisite: ${error.message}`);
      return 2;
    }
    throw error;
  }
}

module.exports = {
  PLANNING, TICKETS, DESTINATIONS, ROLE_ROOT, ROLE_FOLDER, ROLE_DOCUMENT, ANSWER_KEYS, Prerequisite,
  classifyPath, pageSegments, titleFor, planDestination, readAnswers, destinations, selectDocuments, buildPlans, parseArgs,
  printPlan, inside, posix,
};

if (require.main === module) {
  process.exitCode = main(process.argv.slice(2));
}
