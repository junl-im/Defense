import { createHash } from 'node:crypto';
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const baseVersion = '1.0.33';
const targetVersion = '1.0.34';
const buildId = 'b24.34';
const outputRoot = path.join(root, 'logs/patch', targetVersion);
const applyRoot = path.join(outputRoot, 'APPLY_TO_PROJECT_ROOT');
const sha256 = (buffer) => createHash('sha256').update(buffer).digest('hex');

const changedPaths = [
  'README.md',
  'PROJECT_HANDOFF.md',
  'package.json',
  'package-lock.json',
  'index.html',
  'src/main.js',
  'src/style.css',
  'src/version-policy.js',
  'src/runtime/mobile-hud-director-v23.js',
  'public/version.json',
  'public/sw.js',
  'public/static-bootstrap.js',
  'scripts/simulate-mobile-hud-v23.mjs',
  'scripts/verify-v2300.mjs',
  'scripts/verify-v2310.mjs',
  'scripts/verify-release-v101.mjs',
  'scripts/verify-release-v102.mjs',
  'scripts/verify-release-v103.mjs',
  'scripts/verify-release-v133.mjs',
  'scripts/verify-release-v134.mjs',
  'scripts/verify-dist-v134.mjs',
  'scripts/create-patch-v134.mjs',
  'scripts/verify-patch-v134.mjs',
  'docs/MOBILE_HUD_RESILIENCE_v1.0.34.md',
  'docs/HANDOFF_CONTRACT_v1.0.34.md',
  'docs/PATCH_NOTES_v1.0.34.md',
  'docs/PATCH_APPLY_v1.0.34.md',
  'docs/NEXT_UPDATE_v1.0.35.md',
  'dist/STATIC_BUILD_NOTICE.txt',
  'dist/index.html',
  'dist/version.json',
  'dist/sw.js',
  'dist/static-bootstrap.js',
  'dist/src/main.js',
  'dist/src/style.css',
  'dist/src/version-policy.js',
  'dist/src/runtime/mobile-hud-director-v23.js'
].sort();

const pkg = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'));
if (pkg.version !== targetVersion || pkg.dokkaebi?.buildId !== buildId) throw new Error('v1.0.34 identity is not synchronized');
for (const file of changedPaths) {
  const absolute = path.join(root, file);
  if (!existsSync(absolute) || !statSync(absolute).isFile()) throw new Error(`Required patch file missing: ${file}`);
}
if (changedPaths.some((file) => file.toLowerCase().endsWith('.svg'))) throw new Error('SVG files are forbidden in the patch');

rmSync(outputRoot, { recursive: true, force: true });
mkdirSync(applyRoot, { recursive: true });
const files = [];
for (const file of changedPaths) {
  const source = path.join(root, file);
  const target = path.join(applyRoot, file);
  mkdirSync(path.dirname(target), { recursive: true });
  cpSync(source, target);
  const data = readFileSync(source);
  files.push({ path: file, bytes: data.length, sha256: sha256(data) });
}
const manifest = {
  schema: 'DD-PATCH-MANIFEST-1.0',
  baseVersion,
  targetVersion,
  buildId,
  marker: 'DD-MOBILE-HUD-RESILIENCE-V134',
  generatedAt: new Date().toISOString(),
  counts: { changed: files.length, deleted: 0 },
  assurance: {
    mobileHudRuntime: '23.2.0',
    simulatedProfiles: 10,
    dynamicMountRecovery: true,
    visualViewportOffsets: true,
    emergencyClearFrames: 3,
    mandatoryHandoffHistory: true
  },
  files
};
writeFileSync(path.join(outputRoot, 'PATCH_MANIFEST.json'), `${JSON.stringify(manifest, null, 2)}\n`);
writeFileSync(path.join(outputRoot, 'DELETE_LIST.txt'), '');
writeFileSync(path.join(outputRoot, 'PATCH_CONTENT_SHA256.txt'), `${files.map((file) => `${file.sha256}  ${file.path}`).join('\n')}\n`);
writeFileSync(path.join(outputRoot, 'README_PATCH.txt'), [
  'Dokkaebi Luck Defense 3D patch v1.0.33 -> v1.0.34',
  '',
  'Copy everything inside APPLY_TO_PROJECT_ROOT into the existing project root and overwrite matching files.',
  'No files need to be deleted.',
  'Then run: npm run verify && npm run build:static && npm run verify:dist:v134',
  '',
  'Includes mobile HUD dynamic mount recovery, visual viewport and virtual keyboard offsets, 44px touch targets, emergency hysteresis, and mandatory handoff history.',
  ''
].join('\n'));
console.log(JSON.stringify({ outputRoot, applyRoot, changed: files.length, deleted: 0 }, null, 2));
