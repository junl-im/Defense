import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const metadataRoot = path.join(root, 'logs/patch/1.0.14');
const applyRoot = path.join(metadataRoot, 'APPLY_TO_PROJECT_ROOT');
const failures = [];
const sha256 = (buffer) => createHash('sha256').update(buffer).digest('hex');
const check = (condition, message) => { if (!condition) failures.push(message); };

check(existsSync(path.join(metadataRoot, 'PATCH_MANIFEST.json')), 'patch manifest missing');
if (!failures.length) {
  const manifest = JSON.parse(readFileSync(path.join(metadataRoot, 'PATCH_MANIFEST.json'), 'utf8'));
  check(manifest.baseVersion === '1.0.13' && manifest.targetVersion === '1.0.14' && manifest.buildId === 'b24.14', 'patch identity mismatch');
  check(manifest.counts?.deleted === 0, 'v1.0.14 patch must not delete files');
  check(manifest.artUpgrade?.polishedCombatCharacters === 21, 'polished combat character count mismatch');
  check(manifest.artUpgrade?.guardianCitadelStates === 4, 'citadel state count mismatch');
  check(manifest.artUpgrade?.runtimeTierFiles === 75, 'runtime tier file count mismatch');
  check(manifest.artUpgrade?.staticArtMirroringAllowed === false, 'no-mirroring policy mismatch');
  check(Array.isArray(manifest.files) && manifest.files.length === manifest.counts?.changed, 'patch file count mismatch');
  for (const entry of manifest.files || []) {
    const file = path.join(applyRoot, entry.path);
    check(existsSync(file), `patch file missing: ${entry.path}`);
    if (!existsSync(file)) continue;
    const data = readFileSync(file);
    check(data.length === entry.bytes, `patch file size mismatch: ${entry.path}`);
    check(sha256(data) === entry.sha256, `patch file hash mismatch: ${entry.path}`);
    check(!entry.path.toLowerCase().endsWith('.svg'), `SVG file included: ${entry.path}`);
  }
  check(existsSync(path.join(applyRoot, 'public/assets/visual-v114/asset-polish-manifest-v114.json')), 'v114 art manifest missing from patch');
  check(existsSync(path.join(applyRoot, 'src/runtime/combat-art-polish-director-v114.js')), 'v114 runtime director missing from patch');
  check(existsSync(path.join(applyRoot, 'dist/src/runtime/combat-art-polish-director-v114.js')), 'v114 static runtime director missing from patch');
  if (!failures.length) console.log(`PASS patch v1.0.13 -> v1.0.14 files and SHA-256 hashes verified (${manifest.files.length} changed, 0 deleted)`);
}
if (failures.length) {
  for (const failure of failures) console.error(`FAIL ${failure}`);
  process.exit(1);
}
