import { createHash } from 'node:crypto';
import { existsSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const patchRoot = path.join(root, 'logs/patch/1.0.36');
const applyRoot = path.join(patchRoot, 'APPLY_TO_PROJECT_ROOT');
const manifestPath = path.join(patchRoot, 'PATCH_MANIFEST.json');
if (!existsSync(manifestPath)) throw new Error('v1.0.36 patch manifest missing; run npm run create:patch:v136');
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
if (manifest.baseVersion !== '1.0.35' || manifest.targetVersion !== '1.0.36' || manifest.buildId !== 'b24.36') throw new Error('v1.0.36 patch identity mismatch');
if (manifest.marker !== 'DD-STORAGE-HYGIENE-V136') throw new Error('v1.0.36 patch marker mismatch');
if (manifest.counts?.changed !== manifest.files?.length || manifest.counts?.deleted !== 1) throw new Error('v1.0.36 patch counts mismatch');
if (!manifest.deletedPaths?.includes('dist/') || !manifest.assurance?.runtimeAssetsPreserved || !manifest.assurance?.mandatoryHandoffHistory) throw new Error('v1.0.36 cleanup assurance mismatch');
const required = new Set([
  'PROJECT_HANDOFF.md',
  'package.json',
  'public/version.json',
  'public/assets/system-v135/runtime-module-shell-v135.json',
  'scripts/audit-storage-footprint-v136.mjs',
  'scripts/stage-clean-package-v136.mjs',
  'scripts/cleanup-generated-output-v136.mjs',
  'scripts/verify-release-v136.mjs',
  'docs/STORAGE_HYGIENE_AUDIT_v1.0.36.md',
  'docs/NEXT_UPDATE_v1.0.37.md'
]);
for (const file of manifest.files) {
  required.delete(file.path);
  const absolute = path.join(applyRoot, file.path);
  if (!existsSync(absolute) || !statSync(absolute).isFile()) throw new Error(`Patch payload missing: ${file.path}`);
  const data = readFileSync(absolute);
  const digest = createHash('sha256').update(data).digest('hex');
  if (digest !== file.sha256 || data.length !== file.bytes) throw new Error(`Patch hash mismatch: ${file.path}`);
}
if (required.size) throw new Error(`Required patch entries missing: ${[...required].join(', ')}`);
if (readFileSync(path.join(patchRoot, 'DELETE_LIST.txt'), 'utf8').trim() !== 'dist/') throw new Error('v1.0.36 delete list mismatch');
for (const helper of ['APPLY_PATCH_WINDOWS.bat', 'APPLY_PATCH_MAC_LINUX.sh', 'README_PATCH.txt']) if (!existsSync(path.join(patchRoot, helper))) throw new Error(`Patch helper missing: ${helper}`);
const handoff = readFileSync(path.join(applyRoot, 'PROJECT_HANDOFF.md'), 'utf8');
if (!handoff.includes('인수인계 내역 작성 필수') || !handoff.includes('2026-07-27 — v1.0.36 / b24.36')) throw new Error('Mandatory v1.0.36 handoff history missing from patch');
console.log(`PASS v1.0.36 patch payload verified (${manifest.files.length} files, ${manifest.counts.deleted} generated path deletion)`);
