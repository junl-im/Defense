import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const outputRoot = path.join(root, 'logs/patch/1.0.39');
const overlayRoot = path.join(outputRoot, 'overlay');
const manifestPath = path.join(outputRoot, 'PATCH_MANIFEST.json');
const failures = [];
const check = (condition, label) => { if (!condition) failures.push(label); };
const sha256 = (buffer) => createHash('sha256').update(buffer).digest('hex');
check(fs.existsSync(manifestPath), 'patch manifest exists');
if (fs.existsSync(manifestPath)) {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  check(manifest.baseVersion === '1.0.38' && manifest.targetVersion === '1.0.39' && manifest.buildId === 'b24.39', 'patch identity');
  check(manifest.marker === 'DD-CI-DIST-PORTABILITY-V139', 'patch marker');
  check(manifest.counts?.changed === manifest.files?.length && manifest.counts?.deleted === 0, 'patch counts');
  check(manifest.apply?.includes('directly into the project root'), 'direct overlay contract');
  for (const entry of manifest.files || []) {
    const staged = path.join(overlayRoot, entry.path);
    check(fs.existsSync(staged), `overlay file ${entry.path}`);
    if (fs.existsSync(staged)) {
      const data = fs.readFileSync(staged);
      check(data.length === entry.bytes && sha256(data) === entry.sha256, `overlay hash ${entry.path}`);
    }
  }
  for (const required of [
    'scripts/lib/verify-dist-v134-foundation.mjs',
    'scripts/verify-dist-v134.mjs',
    'scripts/verify-release-v139.mjs',
    'scripts/verify-dist-v139.mjs',
    '.github/workflows/deploy.yml',
    'PROJECT_HANDOFF.md'
  ]) check(manifest.files?.some((entry) => entry.path === required), `required patch file ${required}`);
}
check(fs.existsSync(overlayRoot), 'overlay root exists');
if (fs.existsSync(overlayRoot)) {
  for (const unwanted of ['APPLY_TO_PROJECT_ROOT', 'README_PATCH.txt', 'APPLY_PATCH_WINDOWS.bat', 'APPLY_PATCH_MAC_LINUX.sh']) {
    check(!fs.existsSync(path.join(overlayRoot, unwanted)), `no wrapper ${unwanted}`);
  }
}
if (failures.length) {
  failures.forEach((failure) => console.error(`FAIL ${failure}`));
  process.exit(1);
}
console.log('PASS v1.0.39 direct paste-overwrite patch hashes and structure verified');
