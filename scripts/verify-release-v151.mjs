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
check(pkg.scripts?.['verify:ci-source:v151'] === 'node scripts/verify-ci-source-revision-v151.mjs', 'v151 R6 CI source revision script');
check(pkg.scripts?.['verify:dist:all']?.includes('verify:ci-source:v151'), 'v151 R6 dist source preflight');
check(pkg.scripts?.['verify:long-session-hotfix:v151'] === 'node scripts/verify-long-session-hotfix-v151.mjs' && pkg.scripts?.['verify:release:v151']?.includes('verify:long-session-hotfix:v151'), 'v151 long-session hotfix verification chain');
check(pkg.scripts?.['verify:enemy-material:v151'] === 'node scripts/verify-enemy-material-lifecycle-v151.mjs' && pkg.scripts?.['verify:release:v151']?.includes('verify:enemy-material:v151'), 'v151 enemy material lifecycle verification chain');
check(pipeline.includes('applyCharacterMaterialEnhancementV151(root'), 'v151 PBR character material runtime integration');
for (const file of [
  'src/runtime/enemy-body-material-v151.js',
  'src/runtime/character-presentation-policy-v151.js',
  'src/runtime/character-presentation-director-v151.js',
  'src/engine/character-material-enhancer-v151.js',
  'scripts/verify-character-presentation-v151.mjs',
  'scripts/verify-repository-root-v151.mjs',
  'scripts/verify-ci-root-cleanup-v151.mjs',
  'scripts/verify-long-session-hotfix-v151.mjs',
  'scripts/verify-enemy-material-lifecycle-v151.mjs',
  'scripts/verify-ci-source-revision-v151.mjs',
  'docs/generated/ci-source-revision-v151.json',
  'src/runtime/long-session-load-profile-v151.js',
  'scripts/root-output-policy.mjs',
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
const workflow = read('.github/workflows/deploy.yml');
check(workflow.includes('node scripts/verify-ci-source-revision-v151.mjs'), 'v151 R6 workflow source preflight');
check(read('scripts/run-release-assurance-v146.mjs').includes('DD-V151-ENEMY-MATERIAL-R6'), 'v151 R6 enemy material runner marker');
check(workflow.indexOf('node scripts/clean-obsolete-assets.mjs') >= 0 && workflow.indexOf('node scripts/clean-obsolete-assets.mjs') < workflow.indexOf('node scripts/verify-repository-root-v151.mjs'), 'v151 CI cleanup before repository-root preflight');
check(read('scripts/bootstrap-release-package-v151.mjs').includes('removedStaleRootMetadata'), 'v151 bootstrap stale metadata cleanup');
check(read('scripts/bootstrap-release-package-v151.mjs').includes('removedStaleRootOverlay'), 'v151 bootstrap stale overlay cleanup');
check(read('scripts/verify-repository-root-v151.mjs').includes('console.warn(`WARN stale patch metadata'), 'v151 non-fatal stale metadata preflight');
check(read('scripts/verify-repository-root-v151.mjs').includes('stale root overlay/ remains after cleanup'), 'v151 repository verifier rejects remaining overlay');
const rootOutputPolicy = read('scripts/root-output-policy.mjs');
check(rootOutputPolicy.includes('accidentalOverlayRecovery: false') && rootOutputPolicy.includes("accidentalOverlayStrategy: 'remove-without-merge'"), 'v151 stale overlay removal without merge');
check(!rootOutputPolicy.includes('RECOVER accidental root overlay/ -> project root'), 'v151 unsafe overlay merge removed');
if (failures.length) { failures.forEach((failure) => console.error(`FAIL ${failure}`)); process.exit(1); }
console.log('PASS v1.0.51 modern character presentation, PBR material enhancement, honest asset boundary, identity, package, and patch contracts');
