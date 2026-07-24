import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const metadataRoot = path.join(root, 'logs/patch/1.0.13');
const applyRoot = path.join(metadataRoot, 'APPLY_TO_PROJECT_ROOT');
const manifestPath = path.join(metadataRoot, 'PATCH_MANIFEST.json');
if (!existsSync(manifestPath)) throw new Error('Patch metadata missing. Run npm run create:patch:v113 first.');
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
const sha256 = (buffer) => createHash('sha256').update(buffer).digest('hex');
const failures = [];

if (manifest.baseVersion !== '1.0.12' || manifest.targetVersion !== '1.0.13' || manifest.buildId !== 'b24.13') failures.push('patch identity mismatch');
if (manifest.counts?.deleted !== 0) failures.push('v1.0.13 patch must not delete files');
for (const key of ['singleCitadelLayer', 'singleWorldHealthBar', 'oldSacredTreeGeometryHidden', 'curatedCharacterArtFallback']) {
  if (manifest.fixes?.[key] !== true) failures.push(`missing fix flag: ${key}`);
}
if (manifest.fixes?.p0PrototypeRuntimeEnabled !== false) failures.push('P0 prototype runtime quarantine flag mismatch');

for (const entry of manifest.files || []) {
  for (const base of [root, applyRoot]) {
    const file = path.join(base, entry.path);
    if (!existsSync(file)) { failures.push(`missing file: ${entry.path}`); continue; }
    const data = readFileSync(file);
    if (data.length !== entry.bytes || sha256(data) !== entry.sha256) failures.push(`hash mismatch: ${entry.path}`);
  }
}
if ((manifest.files || []).some((entry) => entry.path.toLowerCase().endsWith('.svg'))) failures.push('SVG included in patch');
for (const required of [
  'src/runtime/combat-art-runtime-policy-v113.js',
  'src/runtime/combat-visual-director-v112.js',
  'public/sw.js',
  'docs/PATCH_NOTES_v1.0.13.md',
  'dist/src/runtime/combat-art-runtime-policy-v113.js'
]) if (!(manifest.files || []).some((entry) => entry.path === required)) failures.push(`required patch file missing: ${required}`);

if (failures.length) {
  for (const failure of failures) console.error(`FAIL ${failure}`);
  process.exit(1);
}
console.log(`PASS patch v1.0.12 -> v1.0.13 files and SHA-256 hashes verified (${manifest.files.length} changed, 0 deleted)`);
