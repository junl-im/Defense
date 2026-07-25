import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const dist = path.join(root, 'dist');
const pkg = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'));
const distVersion = JSON.parse(await readFile(path.join(dist, 'version.json'), 'utf8'));
if (distVersion.releaseVersion !== pkg.version || distVersion.buildId !== pkg.dokkaebi?.buildId) throw new Error('v1.0.21 dist identity mismatch');

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
if (!source.includes('DD-LIVE-COMBAT-V121')) throw new Error('v1.0.21 live combat marker missing from dist');
if (!source.includes('ghostRatioV121') || !source.includes('damageGhost')) throw new Error('v1.0.21 world HP trail runtime missing from dist');
if (!source.includes('--v121-boss-top')) throw new Error('v1.0.21 measured HUD styling missing from dist');
await stat(path.join(dist, 'combat-lab-v121.html'));
console.log(`PASS v1.0.21 live combat runtime and HUD assets are deployed (${files.length} files)`);
