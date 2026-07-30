import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(import.meta.dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const json = (file) => JSON.parse(read(file));
const failures = [];
const check = (value, label) => { if (!value) failures.push(label); };
const pkg = json('package.json');
const lock = json('package-lock.json');
const version = json('public/version.json');
const main = read('src/main.js');
const pipeline = read('src/engine/asset-pipeline.js');
check(pkg.version === '1.0.51' && pkg.dokkaebi?.buildId === 'b24.51' && pkg.dokkaebi?.cacheRevision === '1.0.51-b24.51', 'v151 package identity');
check(lock.version === pkg.version && lock.packages?.['']?.version === pkg.version, 'v151 lock identity');
check(version.releaseVersion === pkg.version && version.buildId === 'b24.51', 'v151 public identity');
check(main.includes('new CharacterPresentationDirectorV151'), 'v151 presentation director runtime integration');
check(pipeline.includes('applyCharacterMaterialEnhancementV151(root'), 'v151 PBR character material runtime integration');
for (const file of [
  'src/runtime/character-presentation-policy-v151.js',
  'src/runtime/character-presentation-director-v151.js',
  'src/engine/character-material-enhancer-v151.js',
  'scripts/verify-character-presentation-v151.mjs',
  'scripts/verify-repository-root-v151.mjs',
  'docs/PATCH_NOTES_v1.0.51.md',
  'docs/CI_REPOSITORY_ROOT_REPAIR_v1.0.51.md',
  'docs/RELEASE_ASSURANCE_v1.0.51.md',
  'docs/PATCH_APPLY_v1.0.51.md',
  'docs/NEXT_UPDATE_v1.0.52.md',
  'docs/PATCH_PROVENANCE_v1.0.51.json',
  'scripts/v151-patch-files.mjs'
]) check(fs.existsSync(path.join(root, file)), `v151 contract ${file}`);
const manifest = json('docs/generated/build-input-manifest-v151.json');
check(manifest.id === 'DD-BUILD-INPUT-MANIFEST-V151' && manifest.releaseVersion === '1.0.51' && manifest.fileCount > 2000, 'v151 build input manifest');
check(read('scripts/verify-dist-chain-v140.mjs').includes("'151'"), 'v151 dist chain');
check(read('scripts/clean-obsolete-assets.mjs').includes("'PATCH_SUMMARY.md'"), 'v151 stale root patch metadata cleanup');
check(read('.github/workflows/deploy.yml').includes('verify-repository-root-v151.mjs'), 'v151 CI repository-root preflight');
if (failures.length) { failures.forEach((failure) => console.error(`FAIL ${failure}`)); process.exit(1); }
console.log('PASS v1.0.51 modern character presentation, PBR material enhancement, honest asset boundary, identity, package, and patch contracts');
