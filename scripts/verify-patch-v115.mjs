import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const metadataRoot = path.join(root, 'logs/patch/1.0.15');
const applyRoot = path.join(metadataRoot, 'APPLY_TO_PROJECT_ROOT');
const failures = [];
const sha256 = (buffer) => createHash('sha256').update(buffer).digest('hex');
const check = (condition, message) => { if (!condition) failures.push(message); };

check(existsSync(path.join(metadataRoot, 'PATCH_MANIFEST.json')), 'patch manifest missing');
if (!failures.length) {
  const manifest = JSON.parse(readFileSync(path.join(metadataRoot, 'PATCH_MANIFEST.json'), 'utf8'));
  check(manifest.baseVersion === '1.0.14' && manifest.targetVersion === '1.0.15' && manifest.buildId === 'b24.15', 'patch identity mismatch');
  check(manifest.counts?.deleted === 0, 'v1.0.15 patch must not delete files');
  check(manifest.performanceUpgrade?.criticalAssetCount === 15, 'critical boot asset count mismatch');
  check(manifest.performanceUpgrade?.deferredAssetCount === 38, 'deferred asset count mismatch');
  check(manifest.performanceUpgrade?.serviceWorkerInstallHeavyArt === false, 'service-worker heavy-art policy mismatch');
  check(manifest.performanceUpgrade?.cachedParallelPreload === true, 'parallel preload policy mismatch');
  check(manifest.performanceUpgrade?.floatingAltTextFixed === true, 'mascot alt-text fix missing');
  check(manifest.performanceUpgrade?.approvedRuntimeAssets === 25, 'approved runtime asset count mismatch');
  check(manifest.performanceUpgrade?.quarantinedDirectionalAtlases === 4, 'quarantined atlas count mismatch');
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
  for (const required of [
    'src/runtime/art-approval-pipeline-v115.js',
    'src/engine/asset-catalog.js',
    'src/engine/asset-pipeline.js',
    'src/runtime/visual-integration-director.js',
    'public/sw.js',
    'dist/src/runtime/art-approval-pipeline-v115.js'
  ]) check(existsSync(path.join(applyRoot, required)), `required v1.0.15 patch file missing: ${required}`);
  if (!failures.length) console.log(`PASS patch v1.0.14 -> v1.0.15 files and SHA-256 hashes verified (${manifest.files.length} changed, 0 deleted)`);
}
if (failures.length) {
  for (const failure of failures) console.error(`FAIL ${failure}`);
  process.exit(1);
}
