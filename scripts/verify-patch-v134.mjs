import { createHash } from 'node:crypto';
import { existsSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const patchRoot = path.join(root, 'logs/patch/1.0.34');
const applyRoot = path.join(patchRoot, 'APPLY_TO_PROJECT_ROOT');
const manifestPath = path.join(patchRoot, 'PATCH_MANIFEST.json');
if (!existsSync(manifestPath)) throw new Error('v1.0.34 patch manifest missing; run npm run create:patch:v134');
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
if (manifest.baseVersion !== '1.0.33' || manifest.targetVersion !== '1.0.34' || manifest.buildId !== 'b24.34') throw new Error('v1.0.34 patch identity mismatch');
if (manifest.marker !== 'DD-MOBILE-HUD-RESILIENCE-V134') throw new Error('v1.0.34 patch marker mismatch');
if (manifest.counts?.changed !== manifest.files?.length || manifest.counts?.deleted !== 0) throw new Error('v1.0.34 patch counts mismatch');
if (!manifest.assurance?.mandatoryHandoffHistory || manifest.assurance?.simulatedProfiles !== 10) throw new Error('v1.0.34 patch assurance mismatch');
const required = new Set([
  'PROJECT_HANDOFF.md',
  'src/runtime/mobile-hud-director-v23.js',
  'src/style.css',
  'scripts/verify-release-v134.mjs',
  'docs/HANDOFF_CONTRACT_v1.0.34.md',
  'docs/NEXT_UPDATE_v1.0.35.md',
  'dist/src/runtime/mobile-hud-director-v23.js'
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
if (readFileSync(path.join(patchRoot, 'DELETE_LIST.txt'), 'utf8').trim()) throw new Error('v1.0.34 delete list must be empty');
const handoff = readFileSync(path.join(applyRoot, 'PROJECT_HANDOFF.md'), 'utf8');
if (!handoff.includes('인수인계 내역 작성 필수') || !handoff.includes('2026-07-27 — v1.0.34 / b24.34')) throw new Error('Mandatory handoff history missing from patch');
console.log(`PASS v1.0.34 patch payload verified (${manifest.files.length} files)`);
