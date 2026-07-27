import { createHash } from 'node:crypto';
import { existsSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const patchRoot = path.join(root, 'logs/patch/1.0.35');
const applyRoot = path.join(patchRoot, 'APPLY_TO_PROJECT_ROOT');
const manifestPath = path.join(patchRoot, 'PATCH_MANIFEST.json');
if (!existsSync(manifestPath)) throw new Error('v1.0.35 patch manifest missing; run npm run create:patch:v135');
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
if (manifest.baseVersion !== '1.0.34' || manifest.targetVersion !== '1.0.35' || manifest.buildId !== 'b24.35') throw new Error('v1.0.35 patch identity mismatch');
if (manifest.marker !== 'DD-RELEASE-INTEGRITY-V135') throw new Error('v1.0.35 patch marker mismatch');
if (manifest.counts?.changed !== manifest.files?.length || manifest.counts?.deleted !== 0) throw new Error('v1.0.35 patch counts mismatch');
if (!manifest.assurance?.managedFrameLifecycle || !manifest.assurance?.runtimeModuleShell || manifest.assurance?.simulatedProfiles !== 14 || manifest.assurance?.enduranceWaves !== 100 || !manifest.assurance?.mandatoryHandoffHistory || !manifest.assurance?.buildToolchainAudit) throw new Error('v1.0.35 patch assurance mismatch');
const required = new Set([
  'PROJECT_HANDOFF.md',
  'src/runtime-lifecycle.js',
  'src/runtime/mobile-hud-director-v23.js',
  'src/runtime/boss-identity-assurance-director-v133.js',
  'public/assets/system-v135/runtime-module-shell-v135.json',
  'scripts/verify-release-v135.mjs',
  'scripts/audit-build-toolchain-v135.mjs',
  'docs/BUILD_TOOLCHAIN_EXCEPTION_v1.0.35.md',
  'docs/SYSTEM_AUDIT_v1.0.35.md',
  'docs/NEXT_UPDATE_v1.0.36.md',
  'dist/src/runtime-lifecycle.js'
]);
for (const file of manifest.files) {
  required.delete(file.path);
  const absolute = path.join(applyRoot, file.path);
  if (!existsSync(absolute) || !statSync(absolute).isFile()) throw new Error(`Patch payload missing: ${file.path}`);
  const data = readFileSync(absolute);
  const digest = createHash('sha256').update(data).digest('hex');
  if (digest !== file.sha256 || data.length !== file.bytes) throw new Error(`Patch hash mismatch: ${file.path}`);
  if (file.path.toLowerCase().endsWith('.svg')) throw new Error(`SVG forbidden in patch: ${file.path}`);
}
if (required.size) throw new Error(`Required patch entries missing: ${[...required].join(', ')}`);
if (readFileSync(path.join(patchRoot, 'DELETE_LIST.txt'), 'utf8').trim()) throw new Error('v1.0.35 delete list must be empty');
const handoff = readFileSync(path.join(applyRoot, 'PROJECT_HANDOFF.md'), 'utf8');
if (!handoff.includes('인수인계 내역 작성 필수') || !handoff.includes('2026-07-27 — v1.0.35 / b24.35')) throw new Error('Mandatory v1.0.35 handoff history missing from patch');
console.log(`PASS v1.0.35 patch payload verified (${manifest.files.length} files)`);
