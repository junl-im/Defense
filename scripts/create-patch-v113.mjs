import { createHash } from 'node:crypto';
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const baseVersion = '1.0.12';
const targetVersion = '1.0.13';
const buildId = 'b24.13';
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
  'src/version-policy.js',
  'src/runtime/combat-visual-director-v112.js',
  'src/runtime/combat-art-runtime-policy-v113.js',
  'public/version.json',
  'public/sw.js',
  'public/static-bootstrap.js',
  'scripts/build-static-fallback.mjs',
  'scripts/verify-release-v112.mjs',
  'scripts/verify-release-v113.mjs',
  'scripts/verify-static-dist.mjs',
  'scripts/create-patch-v113.mjs',
  'scripts/verify-patch-v113.mjs',
  'docs/PATCH_NOTES_v1.0.13.md',
  'docs/PATCH_APPLY_v1.0.13.md',
  'dist/STATIC_BUILD_NOTICE.txt',
  'dist/index.html',
  'dist/version.json',
  'dist/sw.js',
  'dist/static-bootstrap.js',
  'dist/src/main.js',
  'dist/src/version-policy.js',
  'dist/src/runtime/combat-visual-director-v112.js',
  'dist/src/runtime/combat-art-runtime-policy-v113.js'
].sort();

const pkg = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'));
if (pkg.version !== targetVersion || pkg.dokkaebi?.buildId !== buildId) throw new Error('v1.0.13 identity is not synchronized');
for (const file of changedPaths) if (!existsSync(path.join(root, file))) throw new Error(`Required patch file missing: ${file}`);
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
  fixes: {
    singleCitadelLayer: true,
    singleWorldHealthBar: true,
    oldSacredTreeGeometryHidden: true,
    p0PrototypeRuntimeEnabled: false,
    curatedCharacterArtFallback: true
  },
  files
};
writeFileSync(path.join(outputRoot, 'PATCH_MANIFEST.json'), `${JSON.stringify(manifest, null, 2)}\n`);
writeFileSync(path.join(outputRoot, 'DELETE_LIST.txt'), '');
writeFileSync(path.join(outputRoot, 'PATCH_CONTENT_SHA256.txt'), `${files.map((file) => `${file.sha256}  ${file.path}`).join('\n')}\n`);
writeFileSync(path.join(outputRoot, 'README_PATCH.txt'), [
  'Dokkaebi Luck Defense 3D patch v1.0.12 -> v1.0.13',
  '',
  'Copy everything inside APPLY_TO_PROJECT_ROOT into the existing project root and overwrite matching files.',
  'No files need to be deleted.',
  'Then run: npm run verify:release:v113',
  '',
  'Fixes: one guardian citadel layer, one world HP bar, P0 prototype runtime quarantine, curated character art fallback.',
  ''
].join('\n'));
console.log(JSON.stringify({ outputRoot, applyRoot, changed: files.length, deleted: 0 }, null, 2));
