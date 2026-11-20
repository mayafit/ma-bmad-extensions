#!/usr/bin/env node
'use strict';
/**
 * Confluence publish engine of ma-atlassian (Story 38.4; ma-agents PRD F29, FR290, FR300; Decisions P5-11.4,
 * P5-11.9). Ported from the ma-agents 3.x engine (`lib/confluence-page-tree.js` `executePlan`, Epic 31) to the
 * BMad v7 initiative store and the Confluence Data Center REST API, with no npm dependency (Node >= 22.20).
 *
 *   node confluence_publish.cjs publish --project-root DIR [--destination planning|tickets|both] [--path FILE ...]
 *                                       [--via rest|mcp] [--json]
 *   node confluence_publish.cjs resolve --project-root DIR --destination planning|tickets --page TITLE|ID|URL
 *                                       [--via rest|mcp] [--json]
 *
 * publish  Plans the page tree (`confluence_page_tree.cjs`), refuses on any local collision
 *          (`confluence_collision_check.cjs`), then reads the identity of every page of the plan (id, version,
 *          ancestors; never a body), refuses when a page of the plan exists outside the destination's root
 *          page, and only then writes, parents first: a missing page is created, a document page whose source
 *          or parent changed is updated, anything else is left as it is. A failed call stops the run and says
 *          which pages were written before it; success is reported only when every page has an id.
 * resolve  Finds one page (by title in the destination's space, or by id or page URL) and prints the root-page
 *          answer to record (`ma-atlassian-confluence-record-root-page`).
 *
 * Reaching Confluence: `--via` defaults to `mcp` when the user's answer `confluence_mcp_server` names a server,
 * else `rest`. REST authenticates with a Data Center personal access token read from the environment variable
 * CONFLUENCE_PERSONAL_TOKEN (the variable mcp-atlassian reads too); the token is never printed, logged or
 * written, and is sent only over https (plain http only to a loopback host). The MCP form performs no call: it
 * prints, in order, the mcp-atlassian 0.24.4 tool calls the agent makes (references/confluence-verbs.md).
 *
 * The page body is the document's Markdown converted to Confluence storage XHTML (headings, paragraphs, lists,
 * tables, code blocks, quotes, emphasis, inline code, links; everything else as escaped text). A document page
 * records `ma-atlassian sha256:<hash of the body>` as its version message, which is how a re-run knows the page
 * is unchanged without reading its content (no local copy of Confluence is kept: PRD out of scope).
 *
 * Exit: 0 published (or nothing to change), 1 refused or failed, 2 a prerequisite is missing.
 */

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const tree = require('./confluence_page_tree.cjs');
const check = require('./confluence_collision_check.cjs');

const { Prerequisite, ROLE_ROOT, ROLE_DOCUMENT } = tree;
const TOKEN_VARIABLE = 'CONFLUENCE_PERSONAL_TOKEN';
const VERSION_MARK = 'ma-atlassian sha256:';
const LOOPBACK = new Set(['localhost', '127.0.0.1', '[::1]', '::1']);
const TIMEOUT_MS = 60000;

class ConfluenceError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ConfluenceError';
  }
}

// ----------------------------------------------------------------------------- Markdown to storage XHTML

function escapeXml(text) {
  return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function cdata(text) {
  return `<![CDATA[${String(text).split(']]>').join(']]]]><![CDATA[>')}]]>`;
}

function codeMacro(body, language) {
  const lang = /^[A-Za-z0-9+#._-]{1,30}$/.test(language || '') ? `<ac:parameter ac:name="language">${escapeXml(language)}</ac:parameter>` : '';
  return `<ac:structured-macro ac:name="code">${lang}<ac:plain-text-body>${cdata(body)}</ac:plain-text-body></ac:structured-macro>`;
}

// A link to one of these schemes is published as its text only.
const UNSAFE_LINK = /^\s*(javascript|vbscript|data):/i;
// Characters XML 1.0 does not allow; Confluence refuses a storage body that holds one.
const XML_INVALID = /[\u0000-\u0008\u000B\u000C\u000E-\u001F￾￿]/g;

/** Inline Markdown to XHTML. Code spans and links become atomic tokens first, so no tag can straddle another. */
function inline(text) {
  const tokens = [];
  const hold = (html) => `\u0000${tokens.push(html) - 1}\u0000`;
  let s = String(text).replace(/\u0000/g, '');
  s = s.replace(/(`+)([^`]|[^`].*?[^`])\1(?!`)/g, (m, ticks, code) => hold(`<code>${escapeXml(code.trim() || code)}</code>`));
  s = s.replace(/!?\[([^\]\u0000]*)\]\(([^)\s\u0000]+)(?:\s+"[^"\u0000]*")?\)/g, (m, label, href) =>
    hold(UNSAFE_LINK.test(href) ? escapeXml(label || href) : `<a href="${escapeXml(href)}">${escapeXml(label || href)}</a>`));
  s = escapeXml(s);
  s = s.replace(/\*\*([^*]+?)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/(^|[^*\w])\*([^*<>\s](?:[^*<>]*[^*<>\s])?)\*(?![*\w])/g, '$1<em>$2</em>');
  return s.replace(/\u0000(\d+)\u0000/g, (m, i) => tokens[Number(i)]);
}

const LIST_ITEM = /^(\s*)([-*+]|\d{1,9}[.)])\s+(.*)$/;
const TABLE_RULE = /^\s*\|?\s*:?-{1,}:?\s*(\|\s*:?-{1,}:?\s*)*\|?\s*$/;

function cells(line) {
  let s = line.trim();
  if (s.startsWith('|')) s = s.slice(1);
  if (s.endsWith('|') && !s.endsWith('\\|')) s = s.slice(0, -1);
  return s.split(/(?<!\\)\|/).map((c) => c.trim().replace(/\\\|/g, '|'));
}

function renderList(items, start) {
  const base = items[start].indent;
  const tag = items[start].ordered ? 'ol' : 'ul';
  let html = `<${tag}>`;
  let i = start;
  while (i < items.length && items[i].indent >= base && items[i].ordered === items[start].ordered) {
    html += `<li>${inline(items[i].text)}`;
    i += 1;
    while (i < items.length && items[i].indent > base) {
      const [sub, next] = renderList(items, i);
      html += sub;
      i = next;
    }
    html += '</li>';
  }
  return [`${html}</${tag}>`, i];
}

function markdownToStorage(markdown) {
  const lines = String(markdown).replace(/^﻿/, '').replace(XML_INVALID, '').replace(/\r\n?/g, '\n').split('\n');
  const out = [];
  let i = 0;
  if (lines[0] === '---') {
    const end = lines.indexOf('---', 1);
    if (end > 0) {
      out.push(codeMacro(lines.slice(1, end).join('\n'), 'yaml'));
      i = end + 1;
    }
  }
  const blank = (l) => l.trim() === '';
  while (i < lines.length) {
    const line = lines[i];
    if (blank(line)) {
      i += 1;
      continue;
    }
    const fence = line.match(/^\s*(`{3,}|~{3,})\s*([^\s`]*)/);
    if (fence) {
      const close = new RegExp(`^\\s*${fence[1][0] === '`' ? '`' : '~'}{${fence[1].length},}\\s*$`);
      const body = [];
      i += 1;
      while (i < lines.length && !close.test(lines[i])) body.push(lines[i++]);
      i += 1;
      out.push(codeMacro(body.join('\n'), fence[2]));
      continue;
    }
    const heading = line.match(/^\s{0,3}(#{1,6})\s+(.*?)\s*#*\s*$/);
    if (heading) {
      out.push(`<h${heading[1].length}>${inline(heading[2])}</h${heading[1].length}>`);
      i += 1;
      continue;
    }
    if (/^\s{0,3}([-*_])(\s*\1){2,}\s*$/.test(line)) {
      out.push('<hr />');
      i += 1;
      continue;
    }
    if (/^\s{0,3}>/.test(line)) {
      const quoted = [];
      while (i < lines.length && /^\s{0,3}>/.test(lines[i])) quoted.push(lines[i++].replace(/^\s{0,3}>\s?/, ''));
      out.push(`<blockquote>${markdownToStorage(quoted.join('\n'))}</blockquote>`);
      continue;
    }
    if (line.includes('|') && i + 1 < lines.length && TABLE_RULE.test(lines[i + 1]) && lines[i + 1].includes('-')) {
      const head = cells(line);
      i += 2;
      let html = `<table><tbody><tr>${head.map((c) => `<th>${inline(c)}</th>`).join('')}</tr>`;
      while (i < lines.length && !blank(lines[i]) && lines[i].includes('|')) {
        const row = cells(lines[i++]);
        html += `<tr>${head.map((h, k) => `<td>${inline(row[k] || '')}</td>`).join('')}</tr>`;
      }
      out.push(`${html}</tbody></table>`);
      continue;
    }
    if (LIST_ITEM.test(line)) {
      const items = [];
      while (i < lines.length && !blank(lines[i])) {
        const m = lines[i].match(LIST_ITEM);
        if (m) items.push({ indent: m[1].replace(/\t/g, '    ').length, ordered: /\d/.test(m[2]), text: m[3] });
        else if (/^\s+\S/.test(lines[i]) && items.length) items[items.length - 1].text += ` ${lines[i].trim()}`;
        else break;
        i += 1;
      }
      let k = 0;
      while (k < items.length) {
        const [html, next] = renderList(items, k);
        out.push(html);
        k = next;
      }
      continue;
    }
    const para = [];
    while (i < lines.length && !blank(lines[i]) && !/^\s*(`{3,}|~{3,}|#{1,6}\s|>)/.test(lines[i]) && !(para.length && LIST_ITEM.test(lines[i]))) {
      para.push(lines[i++].trim());
    }
    if (para.length === 0) para.push(lines[i++].trim());
    out.push(`<p>${inline(para.join(' '))}</p>`);
  }
  return out.join('');
}

function bodyHash(storage) {
  return crypto.createHash('sha256').update(storage, 'utf8').digest('hex');
}

// ----------------------------------------------------------------------------- REST client

/** A Confluence Data Center REST client. The token stays in this closure; no message ever carries it. */
function restClient(site) {
  let url;
  try {
    url = new URL(site);
  } catch {
    throw new Prerequisite(`confluence_site ${JSON.stringify(site)} is not a URL`);
  }
  if (url.protocol !== 'https:' && !(url.protocol === 'http:' && LOOPBACK.has(url.hostname))) {
    throw new Prerequisite(`confluence_site ${url.origin} is not https; the token is sent only over https (plain http only to a loopback host)`);
  }
  const token = (process.env[TOKEN_VARIABLE] || '').trim();
  if (!token) {
    throw new Prerequisite(`${TOKEN_VARIABLE} is not set: create a personal access token in Confluence (profile, Personal Access Tokens) and put it in that environment variable, or answer confluence_mcp_server to publish through an MCP server`);
  }
  if (/[\s\u0000-\u001f]/.test(token)) throw new Prerequisite(`${TOKEN_VARIABLE} holds whitespace or a control character`);
  const base = site.replace(/\/+$/, '');
  const writes = [];

  async function call(method, apiPath, body) {
    const headers = { Accept: 'application/json', Authorization: `Bearer ${token}` };
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    let response;
    try {
      response = await fetch(`${base}${apiPath}`, {
        method, headers, body: body === undefined ? undefined : JSON.stringify(body), redirect: 'error',
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
    } catch (error) {
      const cause = error && error.cause ? error.cause.code || error.cause.message : error.message;
      throw new ConfluenceError(`${method} ${apiPath}: could not reach ${url.origin} (${cause || error.name})`);
    }
    const text = await response.text();
    let data = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = null;
    }
    if (!response.ok) {
      const said = data && typeof data.message === 'string' ? data.message : text.slice(0, 200).replace(/\s+/g, ' ');
      const err = new ConfluenceError(`${method} ${apiPath.split('?')[0]} answered ${response.status}${said ? `: ${said}` : ''}`);
      err.status = response.status;
      throw err;
    }
    if (method !== 'GET') writes.push(`${method} ${apiPath}`);
    return data;
  }

  return { site: base, get: (p) => call('GET', p), post: (p, b) => call('POST', p, b), put: (p, b) => call('PUT', p, b), writes };
}

function pageLink(client, id) {
  return `${client.site}/pages/viewpage.action?pageId=${encodeURIComponent(id)}`;
}

function identity(page) {
  const ancestors = Array.isArray(page.ancestors) ? page.ancestors.map((a) => String(a.id)) : [];
  return {
    found: true,
    id: String(page.id),
    title: page.title,
    version: page.version && Number.isInteger(page.version.number) ? page.version.number : null,
    message: page.version && typeof page.version.message === 'string' ? page.version.message : '',
    ancestorIds: ancestors,
    parentId: ancestors.length ? ancestors[ancestors.length - 1] : null,
    space: page.space && page.space.key ? page.space.key : null,
  };
}

/** Identity of the page titled `title` in `space`: id, version, ancestors. Never its body. */
async function resolvePage(client, space, title) {
  const q = new URLSearchParams({ type: 'page', spaceKey: space, title, expand: 'version,ancestors', limit: '2' });
  const data = await client.get(`/rest/api/content?${q}`);
  const results = data && Array.isArray(data.results) ? data.results : null;
  if (!results) throw new ConfluenceError(`GET /rest/api/content for "${title}" answered without a results list`);
  if (results.length === 0) return { found: false };
  const page = identity(results[0]);
  if (!page.id || page.version === null) throw new ConfluenceError(`GET /rest/api/content for "${title}" answered a page without id or version`);
  return page;
}

async function checkSpace(client, space) {
  try {
    await client.get(`/rest/api/space/${encodeURIComponent(space)}`);
  } catch (error) {
    if (error.status === 404) throw new ConfluenceError(`space ${space} does not exist, or the token's user cannot see it`);
    throw error;
  }
}

async function resolvePlan(client, plan) {
  await checkSpace(client, plan.space);
  const resolved = new Map();
  for (const node of plan.nodes) resolved.set(node.key, await resolvePage(client, plan.space, node.title));
  return resolved;
}

function pagePayload(plan, node, storage, parentId) {
  const payload = {
    type: 'page',
    title: node.title,
    space: { key: plan.space },
    body: { storage: { value: storage, representation: 'storage' } },
  };
  if (parentId) payload.ancestors = [{ id: parentId }];
  return payload;
}

/**
 * Write one plan. Returns the page records; throws ConfluenceError on the first failure (`written` holds the
 * titles written so far). `runPages` carries the pages this run wrote in an earlier plan (a root or folder page
 * the two destinations share in one space), keyed by space and title, so the later plan does not create them twice.
 */
async function writePlan(client, plan, resolved, written, runPages = new Map()) {
  const ids = new Map();
  const pages = [];
  for (const node of plan.nodes) {
    const runKey = `${plan.space}\u0000${node.title}`;
    let r = resolved.get(node.key);
    if (!r.found && runPages.has(runKey)) r = { found: true, ...runPages.get(runKey) };
    const parentId = node.parentKey === null ? null : ids.get(node.parentKey);
    if (node.parentKey !== null && !parentId) throw new ConfluenceError(`the parent of "${node.title}" has no page id`);
    let state;
    let id;
    let storage = '';
    if (node.role === ROLE_DOCUMENT) {
      let markdown;
      try {
        markdown = fs.readFileSync(node.abs, 'utf8');
      } catch (error) {
        throw new ConfluenceError(`could not read ${node.sourcePath}: ${error.code || error.message}`);
      }
      storage = markdownToStorage(markdown);
    }
    const mark = `${VERSION_MARK}${bodyHash(storage)}`;
    if (!r.found) {
      const payload = pagePayload(plan, node, storage, parentId);
      if (node.role === ROLE_DOCUMENT) payload.version = { number: 1, message: mark };
      const created = await client.post('/rest/api/content', payload);
      id = created && created.id !== undefined && created.id !== null ? String(created.id) : '';
      if (!id) throw new ConfluenceError(`POST /rest/api/content for "${node.title}" answered no page id`);
      state = 'created';
      written.push(node.title);
      const version = created.version && Number.isInteger(created.version.number) ? created.version.number : 1;
      runPages.set(runKey, { id, version, message: node.role === ROLE_DOCUMENT ? mark : '', parentId: parentId || null });
    } else if (node.role !== ROLE_DOCUMENT) {
      id = r.id;
      state = 'exists';
    } else if (r.message === mark && (r.parentId || null) === (parentId || null)) {
      id = r.id;
      state = 'unchanged';
    } else {
      const payload = { id: r.id, ...pagePayload(plan, node, storage, parentId), version: { number: r.version + 1, message: mark } };
      const updated = await client.put(`/rest/api/content/${encodeURIComponent(r.id)}`, payload);
      id = updated && updated.id !== undefined && updated.id !== null ? String(updated.id) : '';
      if (id !== r.id) throw new ConfluenceError(`PUT /rest/api/content/${r.id} for "${node.title}" answered another page id`);
      state = 'updated';
      written.push(node.title);
      runPages.set(runKey, { id, version: r.version + 1, message: mark, parentId: parentId || null });
    }
    ids.set(node.key, id);
    pages.push({ destination: plan.destination, title: node.title, key: node.key, role: node.role, sourcePath: node.sourcePath, id, state, link: pageLink(client, id) });
  }
  return pages;
}

// ----------------------------------------------------------------------------- MCP form

const MCP_VERSION = 'mcp-atlassian 0.24.4';

function idOf(title) {
  return `<id of "${title}">`;
}

function mcpSteps(plan) {
  const steps = [];
  const byKey = new Map(plan.nodes.map((n) => [n.key, n]));
  const root = byKey.get('');
  for (const node of plan.nodes) {
    steps.push({
      phase: 'read', page: node.title, tool: 'confluence_get_page',
      args: { title: node.title, space_key: plan.space, include_metadata: true, convert_to_markdown: true },
      then: 'found: note its id and version; not found: it is created in the write phase',
    });
    if (node.role !== ROLE_ROOT) {
      steps.push({
        phase: 'read', page: node.title, tool: 'confluence_search', when: `"${node.title}" was found`,
        args: { query: `type = page AND space = "${plan.space}" AND title = "${node.title.replace(/"/g, '\\"')}" AND ancestor = ${idOf(root.title)}`, limit: 1 },
        then: 'no result: the page sits outside the root page; stop before any write (collision foreign)',
      });
    }
  }
  for (const node of plan.nodes) {
    const parent = node.parentKey === null ? null : byKey.get(node.parentKey);
    const place = parent ? { parent_id: idOf(parent.title) } : {};
    if (node.role === ROLE_DOCUMENT) {
      steps.push({
        phase: 'write', page: node.title, tool: 'confluence_create_page', when: 'not found',
        args: { space_key: plan.space, title: node.title, content_file: node.abs, content_format: 'markdown', ...place },
      });
      steps.push({
        phase: 'write', page: node.title, tool: 'confluence_update_page', when: 'found',
        args: { page_id: idOf(node.title), title: node.title, content_file: node.abs, content_format: 'markdown', ...place, version_comment: 'ma-atlassian' },
      });
    } else {
      steps.push({
        phase: 'write', page: node.title, tool: 'confluence_create_page', when: 'not found (found: nothing to write)',
        args: { space_key: plan.space, title: node.title, content: '<p></p>', content_format: 'storage', ...place },
      });
    }
  }
  return steps;
}

function printMcp(server, plans, out, readOnly) {
  out(`${readOnly ? 'check' : 'publish'} through the MCP server "${server}" (${MCP_VERSION} tool names); this script made no Confluence call.`);
  out('Make these calls in order and stop at the first error. <id of "T"> is the id an earlier call returned for page "T".');
  for (const plan of plans) {
    out(`destination ${plan.destination}: site ${plan.site}, space ${plan.space}, root page "${plan.rootTitle}"`);
    let n = 0;
    for (const step of mcpSteps(plan)) {
      if (readOnly && step.phase === 'write') continue;
      n += 1;
      out(`  ${n}. [${step.phase}] ${step.when ? `${step.when}: ` : ''}${step.tool} ${JSON.stringify(step.args)}${step.then ? ` -> ${step.then}` : ''}`);
    }
  }
  out('Report each page as created, updated or exists, with its link; report a failure with the pages written before it.');
}

function printMcpCheck(built, out) {
  printMcp(built.answers.confluence_mcp_server, built.plans, out, true);
}

// ----------------------------------------------------------------------------- commands

async function cmdPublish(args, out) {
  const built = tree.buildPlans({ projectRoot: args.projectRoot, destination: args.destination, paths: args.paths });
  const via = args.via || (built.answers.confluence_mcp_server ? 'mcp' : 'rest');
  // A destination with no document of the run publishes nothing, not even its root page.
  built.plans = built.plans.filter((p) => p.nodes.some((x) => x.role === ROLE_DOCUMENT));
  const documents = built.plans.reduce((n, p) => n + p.nodes.filter((x) => x.role === ROLE_DOCUMENT).length, 0);
  const report = { via, plans: [], excluded: built.excluded, collisions: [], pages: [], written: [], published: false };
  const finish = (code) => {
    if (args.json) out(JSON.stringify(report, null, 2));
    return code;
  };
  if (!args.json) for (const e of built.excluded) if (args.paths.length) out(`left out: ${e.path}: ${e.reason}`);
  if (documents === 0) {
    if (!args.json) out('publish: nothing to publish (no document of the chosen destination)');
    return finish(1);
  }
  report.collisions = check.localCollisions(built.plans);
  if (report.collisions.length) {
    if (!args.json) {
      for (const c of report.collisions) out(`collision: ${c.message}`);
      out('published: no (refused before any Confluence call)');
    }
    return finish(1);
  }
  if (via === 'mcp') {
    report.steps = built.plans.map((p) => ({ destination: p.destination, steps: mcpSteps(p) }));
    if (!args.json) printMcp(built.answers.confluence_mcp_server || '(none)', built.plans, out, false);
    return finish(0);
  }
  const client = restClient(built.answers.confluence_site);
  try {
    const resolutions = [];
    for (const plan of built.plans) {
      const resolved = await resolvePlan(client, plan);
      resolutions.push([plan, resolved]);
      report.collisions.push(...check.remoteCollisions(plan, resolved));
    }
    if (report.collisions.length) {
      if (!args.json) {
        for (const c of report.collisions) out(`collision: ${c.message}`);
        out('published: no (refused before any write)');
      }
      return finish(1);
    }
    const runPages = new Map();
    for (const [plan, resolved] of resolutions) {
      const pages = await writePlan(client, plan, resolved, report.written, runPages);
      report.pages.push(...pages);
      if (!args.json) {
        for (const p of pages) out(`${p.destination}: ${p.state} "${p.title}" (id ${p.id}) ${p.link}`);
        const root = pages.find((p) => p.role === ROLE_ROOT);
        if (root && root.state === 'created' && !built.destinations[plan.destination].rootAnswered) {
          out(`note: created the ${plan.destination} root page "${root.title}"; record it with ma-atlassian-confluence-record-root-page`);
        }
      }
    }
  } catch (error) {
    if (!(error instanceof ConfluenceError)) throw error;
    report.error = error.message;
    if (!args.json) {
      out(`failed: ${error.message}`);
      out(`published: no (${report.written.length} page(s) written before the failure${report.written.length ? `: ${report.written.map((t) => `"${t}"`).join(', ')}` : ''})`);
    }
    return finish(1);
  }
  report.published = true;
  if (!args.json) {
    const count = (s) => report.pages.filter((p) => p.state === s).length;
    out(`published: yes (${count('created')} created, ${count('updated')} updated, ${count('unchanged')} unchanged, ${count('exists')} existing folder or root page(s))`);
  }
  return finish(0);
}

function pageReference(text) {
  const s = String(text || '').trim();
  if (/^\d+$/.test(s)) return { id: s };
  const m = s.match(/[?&]pageId=(\d+)/) || s.match(/\/pages\/(\d+)(?:[/?#]|$)/);
  if (/^https?:\/\//i.test(s)) {
    if (m) return { id: m[1] };
    throw new Prerequisite('that page URL carries no page id; give the page id or its exact title');
  }
  return { title: s };
}

async function cmdResolve(args, out) {
  if (!args.destination || args.destination === 'both') throw new Prerequisite('--destination planning or tickets is required');
  if (!args.page || !String(args.page).trim()) throw new Prerequisite('--page is required (a title, a page id or a page URL)');
  const projectRoot = path.resolve(args.projectRoot);
  if (!fs.existsSync(path.join(projectRoot, '_bmad'))) throw new Prerequisite(`${projectRoot} holds no _bmad/: BMad is not set up there; ask bmad to run setup`);
  const answers = tree.readAnswers(projectRoot);
  const dest = tree.destinations(answers)[args.destination];
  const ref = pageReference(args.page);
  const key = `${args.destination}_root_page`;
  const via = args.via || (answers.confluence_mcp_server ? 'mcp' : 'rest');
  if (via === 'mcp') {
    const call = ref.id ? { page_id: ref.id, include_metadata: true } : { title: ref.title, space_key: dest.space, include_metadata: true };
    const report = { via, destination: args.destination, space: dest.space, call: { tool: 'confluence_get_page', args: call }, answer: key };
    if (args.json) out(JSON.stringify(report, null, 2));
    else {
      out(`resolve through the MCP server "${answers.confluence_mcp_server || '(none)'}" (${MCP_VERSION}); this script made no Confluence call.`);
      out(`  1. confluence_get_page ${JSON.stringify(call)}`);
      out(`  The page must exist and sit in space ${dest.space}; its exact title is the answer modules.ma-atlassian.${key}.`);
    }
    return 0;
  }
  const client = restClient(answers.confluence_site);
  let page;
  try {
    if (ref.id) {
      try {
        page = identity(await client.get(`/rest/api/content/${encodeURIComponent(ref.id)}?expand=space,version,ancestors`));
      } catch (error) {
        if (error.status === 404) page = { found: false };
        else throw error;
      }
    } else {
      await checkSpace(client, dest.space);
      page = await resolvePage(client, dest.space, ref.title);
    }
  } catch (error) {
    if (!(error instanceof ConfluenceError)) throw error;
    out(`failed: ${error.message}`);
    return 1;
  }
  const report = { via, destination: args.destination, space: dest.space, found: page.found, answer: key, current: answers[key] };
  if (!page.found) {
    if (args.json) out(JSON.stringify(report, null, 2));
    else out(`not found: no page ${ref.id ? `with id ${ref.id}` : `titled "${ref.title}" in space ${dest.space}`}`);
    return 1;
  }
  if (page.space && page.space !== dest.space) {
    report.found = false;
    report.otherSpace = page.space;
    if (args.json) out(JSON.stringify(report, null, 2));
    else out(`refused: page ${page.id} "${page.title}" is in space ${page.space}, not in the ${args.destination} space ${dest.space}`);
    return 1;
  }
  Object.assign(report, { id: page.id, title: page.title, link: pageLink(client, page.id), value: page.title, same: page.title === answers[key] });
  if (args.json) out(JSON.stringify(report, null, 2));
  else {
    out(`found: page "${page.title}" (id ${page.id}) in space ${dest.space}, ${page.parentId ? `under page ${page.parentId}` : 'at the top of the space'}: ${report.link}`);
    out(report.same ? `answer: modules.ma-atlassian.${key} already is "${page.title}"` : `answer: modules.ma-atlassian.${key} = ${JSON.stringify(page.title)} (now ${JSON.stringify(answers[key])})`);
  }
  return 0;
}

const USAGE = `usage: node confluence_publish.cjs publish --project-root DIR [--destination planning|tickets|both] [--path FILE ...] [--via rest|mcp] [--json]
       node confluence_publish.cjs resolve --project-root DIR --destination planning|tickets --page TITLE|ID|URL [--via rest|mcp] [--json]

publish  Publish the initiative store's documents to the Confluence planning and tickets destinations (one page
         per Markdown file, under each destination's root page); --path limits it to the named files.
resolve  Find a page to record as a destination's root page.
REST reads the personal access token from ${TOKEN_VARIABLE}; with confluence_mcp_server answered (or --via mcp)
the script prints the MCP tool calls to make instead of calling Confluence.
Exit: 0 done, 1 refused or failed, 2 a prerequisite is missing.`;

async function main(argv, out = console.log) {
  try {
    const command = argv[0];
    if (!command || command === '--help' || command === '-h') {
      out(USAGE);
      return command ? 0 : 2;
    }
    if (command !== 'publish' && command !== 'resolve') throw new Prerequisite(`unknown command ${JSON.stringify(command)} (publish or resolve)`);
    const args = tree.parseArgs(argv.slice(1), {
      '--project-root': null, '--destination': ['planning', 'tickets', 'both'], '--path': null, '--page': null,
      '--via': ['rest', 'mcp'], '--json': true,
    });
    if (args.help) {
      out(USAGE);
      return 0;
    }
    if (!args.projectRoot) throw new Prerequisite('--project-root is required');
    return command === 'publish' ? await cmdPublish(args, out) : await cmdResolve(args, out);
  } catch (error) {
    if (error instanceof Prerequisite) {
      out(`prerequisite: ${error.message}`);
      return 2;
    }
    if (error instanceof ConfluenceError) {
      out(`failed: ${error.message}`);
      return 1;
    }
    throw error;
  }
}

module.exports = {
  TOKEN_VARIABLE, ConfluenceError, markdownToStorage, inline, restClient, resolvePage, resolvePlan, writePlan,
  mcpSteps, printMcpCheck, pageReference, main,
};

if (require.main === module) {
  main(process.argv.slice(2)).then((code) => { process.exitCode = code; });
}
