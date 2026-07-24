import { createHash } from 'node:crypto';
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const baseVersion = '1.0.14';
const targetVersion = '1.0.15';
const buildId = 'b24.15';
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
  'src/engine/asset-catalog.js',
  'src/engine/asset-pipeline.js',
  'src/runtime/first-presentation-director-v107.js',
  'src/runtime/visual-integration-director.js',
  'src/runtime/art-approval-pipeline-v115.js',
  'public/version.json',
  'public/sw.js',
  'public/static-bootstrap.js',
  'scripts/build-static-fallback.mjs',
  'scripts/verify-v1700.mjs',
  'scripts/verify-release-v112.mjs',
  'scripts/verify-release-v114.mjs',
  'scripts/verify-release-v115.mjs',
  'scripts/create-patch-v115.mjs',
  'scripts/verify-patch-v115.mjs',
  'docs/PATCH_NOTES_v1.0.15.md',
  'docs/PATCH_APPLY_v1.0.15.md',
  'logs/README.md',
  'dist/STATIC_BUILD_NOTICE.txt',
  'dist/index.html',
  'dist/version.json',
  'dist/sw.js',
  'dist/static-bootstrap.js',
  'dist/src/main.js',
  'dist/src/style.css',
  'dist/src/version-policy.js',
  'dist/src/engine/asset-catalog.js',
  'dist/src/engine/asset-pipeline.js',
  'dist/src/runtime/first-presentation-director-v107.js',
  'dist/src/runtime/visual-integration-director.js',
  'dist/src/runtime/art-approval-pipeline-v115.js'
].sort();

const pkg = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'));
if (pkg.version !== targetVersion || pkg.dokkaebi?.buildId !== buildId) throw new Error('v1.0.15 identity is not synchronized');
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
  generatedAt: new Date().toISOString(),
  counts: { changed: files.length, deleted: 0 },
  performanceUpgrade: {
    criticalAssetCount: 15,
    deferredAssetCount: 38,
    serviceWorkerInstallHeavyArt: false,
    cachedParallelPreload: true,
    titleLiteFirstPaint: true,
    highQualityTitleIdleUpgrade: true,
    floatingAltTextFixed: true,
    approvedRuntimeAssets: 25,
    quarantinedDirectionalAtlases: 4
  },
  files
};
writeFileSync(path.join(outputRoot, 'PATCH_MANIFEST.json'), `${JSON.stringify(manifest, null, 2)}\n`);
writeFileSync(path.join(outputRoot, 'DELETE_LIST.txt'), '');
writeFileSync(path.join(outputRoot, 'PATCH_CONTENT_SHA256.txt'), `${files.map((file) => `${file.sha256}  ${file.path}`).join('\n')}\n`);
writeFileSync(path.join(outputRoot, 'README_PATCH.txt'), [
  'Dokkaebi Luck Defense 3D patch v1.0.14 -> v1.0.15',
  '',
  'Copy everything inside APPLY_TO_PROJECT_ROOT into the existing project root and overwrite matching files.',
  'No files need to be deleted.',
  'Then run: npm run verify:release:v115',
  '',
  'Fixes the floating mascot alternative text, uses lite title art for first paint, moves heavy combat assets to deferred loading, and locks the art approval/quarantine pipeline.',
  ''
].join('\n'));
console.log(JSON.stringify({ outputRoot, applyRoot, changed: files.length, deleted: 0 }, null, 2));
