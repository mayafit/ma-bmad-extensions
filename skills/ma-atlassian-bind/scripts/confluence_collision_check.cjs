#!/usr/bin/env node
'use strict';
/**
 * Confluence page collision check of ma-atlassian (Story 38.4; Decision P5-11.9). The page-collision predicate
 * of the ma-agents 3.x engine (`lib/confluence-page-tree.js`, Epic 31: two pages of a plan with one title,
 * and the cross-store pre-flight), ported to the two v7 destinations, plus the check against Confluence.
 *
 * Page identity is (space, title): Confluence refuses a second page with a title the space already holds, and
 * a lookup by title finds whichever page holds it. So a publish is refused, before its first write, when
 *   same-page          two files map to one page of a destination;
 *   in-destination     two pages of one destination carry one title (the root page included);
 *   cross-destination  the planning and tickets destinations share a space and a title names two different
 *                      pages: two root pages with one title are one shared root, and a folder page (no body)
 *                      under the same parent as the other destination's page is that page, so neither clashes;
 *   foreign            (against Confluence) a page of the plan already exists in the space outside the
 *                      destination's root page: publishing would overwrite a page this module does not own.
 *
 * The local checks need no server. The foreign check reads identity only (id, ancestors) through the
 * publish engine's REST client, or is listed as MCP calls for the agent when `confluence_mcp_server` is set.
 *
 *   node confluence_collision_check.cjs --project-root DIR [--destination planning|tickets|both] [--path FILE ...]
 *                                       [--local] [--json]
 *
 * Exit: 0 no collision, 1 a collision, 2 a prerequisite is missing (no token, no answer, BMad not set up).
 */

const tree = require('./confluence_page_tree.cjs');

const { ROLE_ROOT, ROLE_FOLDER } = tree;

function describe(plan, node) {
  if (node.role === ROLE_ROOT) return `the ${plan.destination} root page`;
  if (node.sourcePath) return `${plan.destination} ${node.sourcePath}`;
  return `${plan.destination} folder page ${node.key}`;
}

function parentTitle(plan, node) {
  if (node.parentKey === null) return null;
  const parent = plan.nodes.find((n) => n.key === node.parentKey);
  return parent ? parent.title : null;
}

/** The local collisions of one or two plans; nothing is thrown, every collision is listed. */
function localCollisions(plans) {
  const collisions = [];
  for (const plan of plans) {
    for (const d of plan.duplicates || []) {
      collisions.push({
        kind: 'same-page', space: plan.space, title: d.title,
        message: `"${d.title}": ${plan.destination} ${d.a} and ${d.b} map to one page; rename one of them`,
      });
    }
    const owners = new Map();
    for (const node of plan.nodes) {
      const prior = owners.get(node.title);
      if (prior) {
        collisions.push({
          kind: 'in-destination', space: plan.space, title: node.title,
          message: `"${node.title}": ${describe(plan, prior)} and ${describe(plan, node)} carry one title in space ${plan.space}; rename one of them` +
            (prior.role === ROLE_ROOT || node.role === ROLE_ROOT ? ', or record another root page' : ''),
        });
      } else {
        owners.set(node.title, node);
      }
    }
  }
  for (let i = 0; i < plans.length; i++) {
    for (let j = i + 1; j < plans.length; j++) {
      const a = plans[i];
      const b = plans[j];
      if (a.space !== b.space) continue;
      const byTitle = new Map(a.nodes.map((n) => [n.title, n]));
      for (const nb of b.nodes) {
        const na = byTitle.get(nb.title);
        if (!na) continue;
        if (na.role === ROLE_ROOT && nb.role === ROLE_ROOT) continue;
        const folder = na.role === ROLE_FOLDER || nb.role === ROLE_FOLDER;
        if (folder && na.role !== ROLE_ROOT && nb.role !== ROLE_ROOT && parentTitle(a, na) === parentTitle(b, nb)) continue;
        collisions.push({
          kind: 'cross-destination', space: a.space, title: nb.title,
          message: `"${nb.title}": ${describe(a, na)} and ${describe(b, nb)} are two pages with one title in the shared space ${a.space}; ` +
            'give the destinations different spaces or the same root page, or rename one side',
        });
      }
    }
  }
  return collisions;
}

/**
 * The collisions against Confluence for one plan. `resolved` maps a node key to `{found, id, ancestorIds}`
 * (`ancestorIds` from the root of the space down to the parent).
 */
function remoteCollisions(plan, resolved) {
  const collisions = [];
  const root = resolved.get('');
  const rootId = root && root.found ? String(root.id) : null;
  for (const node of plan.nodes) {
    if (node.role === ROLE_ROOT) continue;
    const r = resolved.get(node.key);
    if (!r || !r.found) continue;
    const ancestors = (r.ancestorIds || []).map(String);
    if (rootId && ancestors.includes(rootId)) continue;
    collisions.push({
      kind: 'foreign', space: plan.space, title: node.title, id: String(r.id),
      message: `"${node.title}": page ${r.id} already holds this title in space ${plan.space} outside the ${plan.destination} root page "${plan.rootTitle}"; ` +
        'publishing would overwrite a page ma-atlassian does not own; rename the source or move that page',
    });
  }
  return collisions;
}

const USAGE = `usage: node confluence_collision_check.cjs --project-root DIR [--destination planning|tickets|both] [--path FILE ...] [--local] [--json]

Check the page tree of the initiative store for page collisions before a publish: two files on one page, two
pages with one title in a destination or across destinations sharing a space, and (unless --local) a page of
the tree that already exists in the space outside the destination's root page. Reads Confluence identity only
(REST, token from CONFLUENCE_PERSONAL_TOKEN), or prints the MCP calls when confluence_mcp_server is set.
Exit: 0 no collision, 1 a collision, 2 a prerequisite is missing.`;

async function main(argv, out = console.log) {
  let args;
  try {
    args = tree.parseArgs(argv, {
      '--project-root': null, '--destination': ['planning', 'tickets', 'both'], '--path': null, '--local': true, '--json': true,
    });
    if (args.help) {
      out(USAGE);
      return 0;
    }
    if (!args.projectRoot) throw new tree.Prerequisite('--project-root is required');
    const built = tree.buildPlans({ projectRoot: args.projectRoot, destination: args.destination, paths: args.paths });
    const collisions = localCollisions(built.plans);
    let remote = 'skipped (--local)';
    if (!args.local && collisions.length === 0) {
      const engine = require('./confluence_publish.cjs');
      if (built.answers.confluence_mcp_server) {
        remote = 'listed as MCP calls';
        if (!args.json) engine.printMcpCheck(built, out);
      } else {
        const client = engine.restClient(built.answers.confluence_site);
        for (const plan of built.plans) {
          const resolved = await engine.resolvePlan(client, plan);
          collisions.push(...remoteCollisions(plan, resolved));
        }
        remote = 'checked over REST';
      }
    }
    if (args.json) {
      out(JSON.stringify({ collisions, remote }, null, 2));
    } else {
      for (const c of collisions) out(`collision: ${c.message}`);
      out(`collision check: ${collisions.length} collision(s); Confluence ${remote}`);
    }
    return collisions.length ? 1 : 0;
  } catch (error) {
    if (error instanceof tree.Prerequisite) {
      out(`prerequisite: ${error.message}`);
      return 2;
    }
    if (error && error.name === 'ConfluenceError') {
      out(`failed: ${error.message}`);
      return 1;
    }
    throw error;
  }
}

module.exports = { localCollisions, remoteCollisions };

if (require.main === module) {
  main(process.argv.slice(2)).then((code) => { process.exitCode = code; });
}
