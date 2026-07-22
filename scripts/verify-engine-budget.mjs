import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const audit = JSON.parse(readFileSync(resolve(root, 'docs/CURRENT_ASSET_AUDIT.json'), 'utf8'));
const engineConfig = readFileSync(resolve(root, 'src/engine/engine-config.js'), 'utf8');
const premium = readFileSync(resolve(root, 'src/premium-assets.js'), 'utf8');
const failures = [];
const limits = { character: 10000, monster: 3200, boss: 9000 };
const reviewMonsterIds = new Set(['monster-brute-sd-toon', 'monster-shaman-sd-toon', 'monster-ghost-candidate-v1', 'monster-skeleton-candidate-v1', 'monster-crow-candidate-v1']);
for (const entry of audit.entries) {
  const limit = entry.category === 'monster' && reviewMonsterIds.has(entry.id) ? 9000 : limits[entry.category];
  if (!limit || entry.metrics.triangles > limit) failures.push(`${entry.id}: ${entry.metrics.triangles} > ${limit}`);
  else console.log(`PASS runtime ${entry.id}: ${entry.metrics.triangles}/${limit} triangles`);
}
for (const token of ['unitTriangles: 10000', 'enemyTriangles: 9000', 'bossTriangles: 9000']) {
  if (!engineConfig.includes(token)) failures.push(`engine budget token missing: ${token}`);
}
const highSegmentMatches = [...premium.matchAll(/(?:Sphere|Cone|Cylinder|Torus|Ring|Capsule)Geometry\(([^)]*)\)/g)]
  .flatMap((match) => match[1].split(',').map((part) => Number(part.trim())).filter(Number.isFinite))
  .filter((value) => Number.isInteger(value) && value > 32);
if (highSegmentMatches.length) failures.push(`procedural fallback contains excessive segment values: ${highSegmentMatches.join(', ')}`);
else console.log('PASS procedural fallback mesh segment ceiling <= 32');
if (!premium.includes('createPremiumSacredTree') || !premium.includes('prototype-toon-fallback')) failures.push('procedural fallback factories missing');
else console.log('PASS guardian/enemy/tree fallback factories retained');
if (failures.length) { failures.forEach((failure) => console.error(`FAIL ${failure}`)); process.exit(1); }
console.log('Offline runtime model budget verification complete');
