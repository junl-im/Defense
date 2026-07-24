import { createHash } from 'node:crypto';
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const baseVersion = '1.0.13';
const targetVersion = '1.0.14';
const buildId = 'b24.14';
const outputRoot = path.join(root, 'logs/patch', targetVersion);
const applyRoot = path.join(outputRoot, 'APPLY_TO_PROJECT_ROOT');
const sha256 = (buffer) => createHash('sha256').update(buffer).digest('hex');

function collectFiles(directory, prefix = '') {
  const absolute = path.join(root, directory);
  if (!existsSync(absolute)) return [];
  const result = [];
  const walk = (current, relativeBase) => {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      const rel = path.join(relativeBase, entry.name);
      if (entry.isDirectory()) walk(full, rel);
      else if (entry.isFile()) result.push(path.join(prefix, rel).replaceAll('\\', '/'));
    }
  };
  walk(absolute, directory);
  return result;
}

const fixedPaths = [
  'README.md',
  'PROJECT_HANDOFF.md',
  'package.json',
  'package-lock.json',
  'index.html',
  'src/main.js',
  'src/style.css',
  'src/version-policy.js',
  'src/engine/asset-catalog.js',
  'src/runtime/combat-art-polish-policy-v114.js',
  'src/runtime/combat-art-polish-director-v114.js',
  'public/version.json',
  'public/sw.js',
  'public/static-bootstrap.js',
  'scripts/build-static-fallback.mjs',
  'scripts/generate-mega-art-polish-v114.py',
  'scripts/verify-texture-budget.mjs',
  'scripts/verify-release-v109.mjs',
  'scripts/verify-release-v110.mjs',
  'scripts/verify-release-v112.mjs',
  'scripts/verify-release-v113.mjs',
  'scripts/verify-release-v114.mjs',
  'scripts/verify-static-dist.mjs',
  'scripts/create-patch-v114.mjs',
  'scripts/verify-patch-v114.mjs',
  'docs/PATCH_NOTES_v1.0.14.md',
  'docs/PATCH_APPLY_v1.0.14.md',
  'docs/ART_POLISH_REPORT_v1.0.14.md',
  'docs/v1.0.14-asset-polish-board.png',
  'dist/STATIC_BUILD_NOTICE.txt',
  'dist/index.html',
  'dist/version.json',
  'dist/sw.js',
  'dist/static-bootstrap.js',
  'dist/src/main.js',
  'dist/src/style.css',
  'dist/src/version-policy.js',
  'dist/src/engine/asset-catalog.js',
  'dist/src/runtime/combat-art-polish-policy-v114.js',
  'dist/src/runtime/combat-art-polish-director-v114.js'
];
const changedPaths = [...new Set([
  ...fixedPaths,
  ...collectFiles('public/assets/visual-v114'),
  ...collectFiles('dist/assets/visual-v114')
])].sort();

const pkg = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'));
if (pkg.version !== targetVersion || pkg.dokkaebi?.buildId !== buildId) throw new Error('v1.0.14 identity is not synchronized');
for (const file of changedPaths) if (!existsSync(path.join(root, file)) || !statSync(path.join(root, file)).isFile()) throw new Error(`Required patch file missing: ${file}`);
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
  artUpgrade: {
    polishedCombatCharacters: 21,
    guardianCitadelStates: 4,
    runtimeTierFiles: 75,
    actionProfiles: 7,
    staticArtMirroringAllowed: false,
    p0PrototypeRuntimePreload: false,
    mobileTextureBudgetMB: 62.53
  },
  files
};
writeFileSync(path.join(outputRoot, 'PATCH_MANIFEST.json'), `${JSON.stringify(manifest, null, 2)}\n`);
writeFileSync(path.join(outputRoot, 'DELETE_LIST.txt'), '');
writeFileSync(path.join(outputRoot, 'PATCH_CONTENT_SHA256.txt'), `${files.map((file) => `${file.sha256}  ${file.path}`).join('\n')}\n`);
writeFileSync(path.join(outputRoot, 'README_PATCH.txt'), [
  'Dokkaebi Luck Defense 3D patch v1.0.13 -> v1.0.14',
  '',
  'Copy everything inside APPLY_TO_PROJECT_ROOT into the existing project root and overwrite matching files.',
  'No files need to be deleted.',
  'Then run: npm run verify:release:v114',
  '',
  'Includes 21 polished combat characters, four guardian citadel states, seven action profiles and cross-platform HUD readability polish.',
  ''
].join('\n'));
console.log(JSON.stringify({ outputRoot, applyRoot, changed: files.length, deleted: 0 }, null, 2));
