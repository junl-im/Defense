import { createHash } from 'node:crypto';
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const baseVersion = '1.0.34';
const targetVersion = '1.0.35';
const buildId = 'b24.35';
const outputRoot = path.join(root, 'logs/patch', targetVersion);
const applyRoot = path.join(outputRoot, 'APPLY_TO_PROJECT_ROOT');
const sha256 = (buffer) => createHash('sha256').update(buffer).digest('hex');

const changedPaths = [
  '.github/workflows/deploy.yml',
  'README.md',
  'PROJECT_HANDOFF.md',
  'package.json',
  'package-lock.json',
  'index.html',
  'src/main.js',
  'src/style.css',
  'src/version-policy.js',
  'src/runtime-lifecycle.js',
  'src/runtime/mobile-hud-director-v23.js',
  'src/runtime/boss-identity-assurance-director-v133.js',
  'public/version.json',
  'public/sw.js',
  'public/static-bootstrap.js',
  'public/assets/system-v135/runtime-module-shell-v135.json',
  'scripts/generate-runtime-shell-v135.mjs',
  'scripts/audit-build-toolchain-v135.mjs',
  'scripts/simulate-mobile-hud-v23.mjs',
  'scripts/verify-release-v133.mjs',
  'scripts/verify-release-v134.mjs',
  'scripts/verify-dist-v134.mjs',
  'scripts/verify-release-v135.mjs',
  'scripts/verify-dist-v135.mjs',
  'scripts/create-patch-v135.mjs',
  'scripts/verify-patch-v135.mjs',
  'docs/SYSTEM_AUDIT_v1.0.35.md',
  'docs/BUILD_TOOLCHAIN_EXCEPTION_v1.0.35.md',
  'docs/RUNTIME_STABILITY_ASSURANCE_v1.0.35.md',
  'docs/PATCH_NOTES_v1.0.35.md',
  'docs/PATCH_APPLY_v1.0.35.md',
  'docs/NEXT_UPDATE_v1.0.36.md',
  'dist/STATIC_BUILD_NOTICE.txt',
  'dist/index.html',
  'dist/version.json',
  'dist/sw.js',
  'dist/static-bootstrap.js',
  'dist/assets/system-v135/runtime-module-shell-v135.json',
  'dist/src/main.js',
  'dist/src/style.css',
  'dist/src/version-policy.js',
  'dist/src/runtime-lifecycle.js',
  'dist/src/runtime/mobile-hud-director-v23.js',
  'dist/src/runtime/boss-identity-assurance-director-v133.js'
].sort();

const pkg = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'));
if (pkg.version !== targetVersion || pkg.dokkaebi?.buildId !== buildId) throw new Error('v1.0.35 identity is not synchronized');
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
  marker: 'DD-RELEASE-INTEGRITY-V135',
  generatedAt: new Date().toISOString(),
  counts: { changed: files.length, deleted: 0 },
  assurance: {
    mobileHudRuntime: '23.3.0',
    simulatedProfiles: 14,
    enduranceWaves: 100,
    managedFrameLifecycle: true,
    runtimeModuleShell: true,
    bossAccessibility: true,
    assetBoundaryPreserved: true,
    mandatoryHandoffHistory: true,
    buildToolchainAudit: true
  },
  files
};
writeFileSync(path.join(outputRoot, 'PATCH_MANIFEST.json'), `${JSON.stringify(manifest, null, 2)}\n`);
writeFileSync(path.join(outputRoot, 'DELETE_LIST.txt'), '');
writeFileSync(path.join(outputRoot, 'PATCH_CONTENT_SHA256.txt'), `${files.map((file) => `${file.sha256}  ${file.path}`).join('\n')}\n`);
writeFileSync(path.join(outputRoot, 'README_PATCH.txt'), [
  'Dokkaebi Luck Defense 3D patch v1.0.34 -> v1.0.35',
  '',
  'Copy everything inside APPLY_TO_PROJECT_ROOT into the existing project root and overwrite matching files.',
  'No files need to be deleted.',
  'Then run: npm run verify:release:v135 && npm run build:static && npm run verify:dist:v135',
  '',
  'Includes managed effect frames, offline runtime-module shell integrity, browser viewport and pinch-zoom safety, boss accessibility, 100-wave endurance checks, and mandatory handoff history.',
  ''
].join('\n'));
console.log(JSON.stringify({ outputRoot, applyRoot, changed: files.length, deleted: 0 }, null, 2));
