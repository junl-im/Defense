import { createHash } from 'node:crypto';
import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const dist = path.join(root, 'dist');
const pkg = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'));
const distVersion = JSON.parse(await readFile(path.join(dist, 'version.json'), 'utf8'));
if (distVersion.releaseVersion !== pkg.version || distVersion.buildId !== pkg.dokkaebi?.buildId) {
  throw new Error('v1.0.20 dist identity mismatch');
}

async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...await walk(full));
    else out.push(full);
  }
  return out;
}

const files = await walk(dist);
const textFiles = files.filter((file) => /\.(?:js|css|html)$/.test(file));
const source = (await Promise.all(textFiles.map((file) => readFile(file, 'utf8').catch(() => '')))).join('\n');
if (!source.includes('DD-HERO-HUD-POLISH-V120')) throw new Error('v1.0.20 runtime marker missing from dist');
if (!source.includes('core-hp-track-v120')) throw new Error('v1.0.20 premium core HP styling missing from dist');
if (!source.includes('core-hp-progress-v120')) throw new Error('v1.0.20 core HP markup missing from dist');
if (!source.includes('approved Pupu turntable') && !source.includes('approved-directional-v117-action-provisional')) {
  throw new Error('approved protagonist directional runtime missing from dist');
}

// v1.0.23 restored the original approved title mascot. Do not hard-code the
// temporary v1.0.20 replacement: resolve the currently active approved mascot
// from the authored entrypoint and verify that its exact bytes reached dist.
const authoredIndex = await readFile(path.join(root, 'index.html'), 'utf8');
const activeMascotMatch = authoredIndex.match(/\.\/(src\/assets\/title-v\d+\/title-mascot-lite-v\d+\.webp)\?rev=/);
if (!activeMascotMatch) throw new Error('active approved title mascot path missing from index.html');

const activeMascotRelative = activeMascotMatch[1];
const srcMascot = path.join(root, activeMascotRelative);
const srcInfo = await stat(srcMascot);
const expectedHash = createHash('sha256').update(await readFile(srcMascot)).digest('hex');
let mascotFound = false;
for (const file of files) {
  const info = await stat(file);
  if (info.size !== srcInfo.size) continue;
  const hash = createHash('sha256').update(await readFile(file)).digest('hex');
  if (hash === expectedHash) {
    mascotFound = true;
    break;
  }
}
if (!mascotFound) {
  throw new Error(`active approved title mascot bytes missing from dist: ${activeMascotRelative}`);
}

await stat(path.join(dist, 'assets/visual-v117/directional/guardian-ember-pupu-atlas-low-v117.webp'));
await stat(path.join(dist, 'assets/visual-v120/directional/hero-pupu-atlas-low-v120.webp'));
console.log(`PASS v1.0.20 protagonist, premium HP and active approved title mascot are deployed (${files.length} files)`);
