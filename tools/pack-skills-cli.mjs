#!/usr/bin/env node
/**
 * Pack the Skills CLI (npm `skills`) at one exact version into a folder that runs offline with `node`:
 * `npm pack skills@<version>`, extract it (pure Node, `package/` stripped), then complete it with its
 * runtime dependencies, the `node_modules` that `npm install --omit=dev --ignore-scripts` produces for the
 * package's `dependencies`. The install runs in a sibling folder whose package.json holds only those
 * `dependencies`, so npm never resolves the package's devDependencies (npm 10 crashes on their peer set
 * even with `--omit=dev`); `--no-bin-links` keeps platform `.bin` shims out of the tree. Same procedure as
 * the ma-agents bundle builder (`lib/bundle.js`, Story 36.3).
 *
 * Usage: node tools/pack-skills-cli.mjs <version> <out-dir>
 * Prints the absolute path of the bin entry (`<out-dir>/bin/cli.mjs` for skills 1.7.6).
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import zlib from 'node:zlib';

const PACKAGE = 'skills';
const EXACT = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/;

function npm(args, cwd) {
  for (const a of args) {
    if (!/^[A-Za-z0-9@._=\/-]+$/.test(a)) throw new Error(`unsafe npm argument ${JSON.stringify(a)}`);
  }
  // Paths travel as `cwd` and every token is validated, so the shell form (needed for npm.cmd) is safe.
  const r = spawnSync(`npm ${args.join(' ')}`, {
    cwd, shell: true, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true,
    env: { ...process.env, npm_config_update_notifier: 'false', npm_config_fund: 'false', npm_config_audit: 'false' },
  });
  if (r.error) throw r.error;
  if (r.status !== 0) throw new Error(`npm ${args.join(' ')} failed (exit ${r.status}): ${(r.stderr || '').trim()}`);
  return r.stdout || '';
}

function extractNpmTarball(tgzPath, dest) {
  const data = zlib.gunzipSync(fs.readFileSync(tgzPath));
  const root = path.resolve(dest);
  const field = (o, n) => data.toString('utf8', o, o + n).replace(/\0.*$/s, '');
  let off = 0;
  let paxPath = null;
  while (off + 512 <= data.length) {
    const header = data.subarray(off, off + 512);
    if (header.every((b) => b === 0)) break;
    const size = parseInt(field(off + 124, 12).trim() || '0', 8);
    const type = String.fromCharCode(header[156] || 48);
    const prefix = field(off + 345, 155);
    const name = paxPath || (prefix ? `${prefix}/${field(off, 100)}` : field(off, 100));
    paxPath = null;
    const body = data.subarray(off + 512, off + 512 + size);
    off += 512 + Math.ceil(size / 512) * 512;
    if (type === 'x') {
      const m = /\d+ path=([^\n]*)\n/.exec(body.toString('utf8'));
      if (m) paxPath = m[1];
      continue;
    }
    if (type === 'g') continue;
    const parts = name.split('/').filter(Boolean);
    parts.shift(); // `package/`
    if (parts.length === 0) continue;
    if (parts.some((p) => p === '..' || p.includes('\\') || p.includes(':'))) throw new Error(`unsafe path in tarball: ${name}`);
    const target = path.join(root, ...parts);
    if (type === '5') fs.mkdirSync(target, { recursive: true });
    else if (type === '0' || type === '\0' || type === '7') {
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(target, body);
    } else throw new Error(`unsupported tar entry type ${JSON.stringify(type)} for ${name}`);
  }
}

function main(argv) {
  const [version, out] = argv;
  if (!version || !out) throw new Error('usage: node tools/pack-skills-cli.mjs <version> <out-dir>');
  if (!EXACT.test(version)) throw new Error(`${JSON.stringify(version)} is not an exact version`);
  const dest = path.resolve(out);
  if (fs.existsSync(dest) && fs.readdirSync(dest).length) throw new Error(`${dest} is not empty`);
  const work = fs.mkdtempSync(path.join(os.tmpdir(), 'skills-cli-'));
  try {
    const packed = JSON.parse(npm(['pack', `${PACKAGE}@${version}`, '--json', '--pack-destination', '.'], work));
    fs.mkdirSync(dest, { recursive: true });
    extractNpmTarball(path.join(work, packed[0].filename), dest);
    const pkg = JSON.parse(fs.readFileSync(path.join(dest, 'package.json'), 'utf8'));
    if (pkg.version !== version) throw new Error(`packed ${pkg.name}@${pkg.version}, expected ${version}`);
    const deps = path.join(work, 'deps');
    fs.mkdirSync(deps);
    fs.writeFileSync(path.join(deps, 'package.json'),
      `${JSON.stringify({ name: `${pkg.name}-runtime-dependencies`, private: true, dependencies: pkg.dependencies || {} }, null, 2)}\n`);
    npm(['install', '--omit=dev', '--ignore-scripts', '--no-bin-links', '--no-audit', '--no-fund'], deps);
    const nm = path.join(deps, 'node_modules');
    if (fs.existsSync(nm)) {
      fs.rmSync(path.join(nm, '.package-lock.json'), { force: true });
      fs.cpSync(nm, path.join(dest, 'node_modules'), { recursive: true });
    }
    const bin = (typeof pkg.bin === 'string' ? pkg.bin : pkg.bin[pkg.name]).replace(/^\.\//, '');
    const binPath = path.join(dest, ...bin.split('/'));
    const r = spawnSync(process.execPath, [binPath, '--version'], {
      encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true,
      env: { ...process.env, DISABLE_TELEMETRY: '1', DO_NOT_TRACK: '1' },
    });
    if (r.status !== 0 || (r.stdout || '').trim() !== version) {
      throw new Error(`node ${bin} --version: exit ${r.status}, printed ${JSON.stringify((r.stdout || '').trim())}; ${(r.stderr || '').trim()}`);
    }
    process.stdout.write(`${binPath}\n`);
  } finally {
    fs.rmSync(work, { recursive: true, force: true });
  }
}

try {
  main(process.argv.slice(2));
} catch (error) {
  process.stderr.write(`pack-skills-cli: ${error.message}\n`);
  process.exit(1);
}
