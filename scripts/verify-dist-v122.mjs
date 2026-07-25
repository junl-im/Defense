import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const dist = path.join(root, 'dist');
const pkg = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'));
const distVersion = JSON.parse(await readFile(path.join(dist, 'version.json'), 'utf8'));
if (distVersion.releaseVersion !== pkg.version || distVersion.buildId !== pkg.dokkaebi?.buildId) throw new Error('v1.0.22 dist identity mismatch');
async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...await walk(full)); else out.push(full);
  }
  return out;
}
const files = await walk(dist);
const textFiles = files.filter((file) => /\.(?:js|css|html)$/.test(file));
const source = (await Promise.all(textFiles.map((file) => readFile(file, 'utf8').catch(() => '')))).join('\n');
if (!source.includes('DD-BATTLEFIELD-CLARITY-V122')) throw new Error('v1.0.22 battlefield clarity marker missing from dist');
if (!source.includes('stabilizeDirectionalFrameV122') || !source.includes('assignHealthLanesV122')) throw new Error('v1.0.22 direction/health overlap runtime missing from dist');
if (!source.includes('--v122-boss-top') || !source.includes('battlefield-pressure-v122')) throw new Error('v1.0.22 HUD safety styling missing from dist');
await stat(path.join(dist, 'combat-lab-v122.html'));
console.log(`PASS v1.0.22 battlefield clarity runtime and QA assets are deployed (${files.length} files)`);
