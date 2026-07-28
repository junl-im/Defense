import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  CORE_ASSET_CATALOG,
  BOOT_ASSET_CATALOG,
  DEFERRED_ASSET_CATALOG,
  GUARDIAN_ASSET_IDS,
  MONSTER_ASSET_IDS,
  BOSS_ASSET_IDS,
  HERO_CLASS_ASSET_IDS
} from '../src/engine/asset-catalog.js';

const root = path.resolve(import.meta.dirname, '..');
const jsonPath = path.join(root, 'docs/generated/asset-residency-v145.json');
const mdPath = path.join(root, 'docs/generated/asset-residency-v145.md');
const checkOnly = process.argv.includes('--check');
const stableUrl = (value = '') => {
  let normalized = String(value);
  try {
    const parsed = new URL(normalized);
    if (parsed.protocol === 'file:') {
      const fileUrl = new URL(parsed.href);
      fileUrl.search = '';
      fileUrl.hash = '';
      const absolutePath = fileURLToPath(fileUrl);
      const relativePath = path.relative(root, absolutePath);
      const isInsideRoot = relativePath !== '..' && !relativePath.startsWith(`..${path.sep}`) && !path.isAbsolute(relativePath);
      if (!isInsideRoot) throw new Error(`asset URL escapes project root: ${normalized}`);
      normalized = `${relativePath.split(path.sep).join('/')}${parsed.search}${parsed.hash}`;
    }
  } catch (error) {
    if (normalized.startsWith('file:')) throw error;
  }
  return normalized.replace(/[?&]v=[^&#]+/g, '?v={CACHE_REVISION}');
};
const summarize = (entry, stage) => ({
  id: entry.id,
  stage,
  kind: entry.kind,
  role: entry.role || '',
  required: Boolean(entry.required),
  retain: Boolean(entry.retain),
  estimatedBytes: Math.round(Number(entry.estimatedBytes || (entry.sourceWidth && entry.sourceHeight ? entry.sourceWidth * entry.sourceHeight * 4 : 0)) || 0),
  variants: Object.fromEntries(Object.entries(entry.variants || {}).map(([tier, url]) => [tier, stableUrl(url)]))
});
const bootIds = new Set(BOOT_ASSET_CATALOG.map((entry) => entry.id));
const deferredIds = new Set(DEFERRED_ASSET_CATALOG.map((entry) => entry.id));
const allIds = CORE_ASSET_CATALOG.map((entry) => entry.id);
const duplicateIds = allIds.filter((id, index) => allIds.indexOf(id) !== index);
const unclassified = allIds.filter((id) => !bootIds.has(id) && !deferredIds.has(id));
const overlap = allIds.filter((id) => bootIds.has(id) && deferredIds.has(id));
if (duplicateIds.length || unclassified.length || overlap.length) {
  throw new Error(`v145 residency classification invalid: duplicates=${duplicateIds.join(',')} unclassified=${unclassified.join(',')} overlap=${overlap.join(',')}`);
}

const edges = [];
for (const id of bootIds) edges.push({ from: 'surface:title-first-frame', to: `asset:${id}`, trigger: 'boot-critical', residency: 'initial' });
for (const id of deferredIds) edges.push({ from: 'surface:combat-entry', to: `asset:${id}`, trigger: 'idle-deferred-before-combat', residency: 'deferred' });
for (const [key, id] of Object.entries(HERO_CLASS_ASSET_IDS)) edges.push({ from: `catalog:hero:${key}`, to: `asset:${id}`, trigger: 'hero-selection', residency: bootIds.has(id) ? 'initial' : 'deferred' });
for (const [key, id] of Object.entries(GUARDIAN_ASSET_IDS)) edges.push({ from: `catalog:guardian:${key}`, to: `asset:${id}`, trigger: 'summon', residency: bootIds.has(id) ? 'initial' : 'deferred' });
for (const [key, id] of Object.entries(MONSTER_ASSET_IDS)) edges.push({ from: `catalog:monster:${key}`, to: `asset:${id}`, trigger: 'wave-spawn', residency: bootIds.has(id) ? 'initial' : 'deferred' });
for (const [key, id] of Object.entries(BOSS_ASSET_IDS)) edges.push({ from: `catalog:boss:${key}`, to: `asset:${id}`, trigger: 'boss-wave', residency: bootIds.has(id) ? 'initial' : 'deferred' });

const assets = CORE_ASSET_CATALOG.map((entry) => summarize(entry, bootIds.has(entry.id) ? 'boot' : 'deferred')).sort((a, b) => a.id.localeCompare(b.id));
const nonPortableUrls = assets.flatMap((asset) => Object.values(asset.variants)
  .filter((url) => /^file:/i.test(url))
  .map((url) => `${asset.id}:${url}`));
if (nonPortableUrls.length) throw new Error(`v145 residency contains non-portable file URLs: ${nonPortableUrls.join(',')}`);
const totals = (stage) => {
  const rows = assets.filter((asset) => asset.stage === stage);
  return { count: rows.length, estimatedBytes: rows.reduce((sum, asset) => sum + asset.estimatedBytes, 0) };
};
const report = {
  id: 'DD-ASSET-RESIDENCY-V145',
  releaseVersion: '1.0.45',
  policy: 'Only boot-classified assets contribute to initial residency. Every dynamic catalog reference is an explicit reachability edge.',
  totals: { all: { count: assets.length, estimatedBytes: assets.reduce((sum, asset) => sum + asset.estimatedBytes, 0) }, boot: totals('boot'), deferred: totals('deferred') },
  integrity: { duplicateIds, unclassified, overlap, nonPortableUrls, allClassifiedOnce: duplicateIds.length === 0 && unclassified.length === 0 && overlap.length === 0, portableUrls: nonPortableUrls.length === 0 },
  assets,
  edges: edges.sort((a, b) => `${a.from}:${a.to}`.localeCompare(`${b.from}:${b.to}`))
};
const jsonText = `${JSON.stringify(report, null, 2)}\n`;
const mdText = `# Asset Residency v1.0.45\n\n- Contract: ${report.id}\n- Boot assets: ${report.totals.boot.count} (${report.totals.boot.estimatedBytes.toLocaleString()} estimated bytes)\n- Deferred assets: ${report.totals.deferred.count} (${report.totals.deferred.estimatedBytes.toLocaleString()} estimated bytes)\n- Explicit reachability edges: ${report.edges.length}\n- All assets classified exactly once: ${report.integrity.allClassifiedOnce}\n\n## Policy\n\n${report.policy}\n\n## Boot residency\n\n${assets.filter((asset) => asset.stage === 'boot').map((asset) => `- \`${asset.id}\` — ${asset.kind} — ${asset.estimatedBytes.toLocaleString()} bytes`).join('\n')}\n\n## Deferred residency\n\n${assets.filter((asset) => asset.stage === 'deferred').map((asset) => `- \`${asset.id}\` — ${asset.kind} — ${asset.estimatedBytes.toLocaleString()} bytes`).join('\n')}\n`;

if (checkOnly) {
  const currentJson = fs.existsSync(jsonPath) ? fs.readFileSync(jsonPath, 'utf8') : '';
  const currentMd = fs.existsSync(mdPath) ? fs.readFileSync(mdPath, 'utf8') : '';
  if (currentJson !== jsonText || currentMd !== mdText) throw new Error('v145 asset residency outputs are stale; run npm run generate:residency:v145');
  console.log(`PASS v1.0.45 asset residency (${report.totals.boot.count} boot, ${report.totals.deferred.count} deferred, ${report.edges.length} edges)`);
  process.exit(0);
}
fs.mkdirSync(path.dirname(jsonPath), { recursive: true });
fs.writeFileSync(jsonPath, jsonText);
fs.writeFileSync(mdPath, mdText);
console.log(`GENERATED v1.0.45 asset residency (${report.totals.boot.count} boot, ${report.totals.deferred.count} deferred, ${report.edges.length} edges)`);
