import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const json = (file) => JSON.parse(read(file));
const failures = [];
const check = (value, label) => { if (!value) failures.push(label); };

const pkg = json('package.json');
const lock = json('package-lock.json');
const publicVersion = json('public/version.json');
const identity = read('src/release-identity.generated.js');
const main = read('src/main.js');
const handoff = read('PROJECT_HANDOFF.md');

check(pkg.version === '1.0.52', 'package version 1.0.52');
check(lock.version === '1.0.52' && lock.packages?.['']?.version === '1.0.52', 'lockfile root version 1.0.52');
check(publicVersion.releaseVersion === '1.0.52' && publicVersion.buildId === 'b24.52', 'public version identity');
check(identity.includes('\"releaseVersion\": \"1.0.52\"') && identity.includes('\"buildId\": \"b24.52\"'), 'generated source identity');
check(fs.existsSync(path.join(root, 'src/runtime/character-action-timing-v152.js')), 'action timing module exists');
check(fs.existsSync(path.join(root, 'src/runtime/character-presentation-budget-v152.js')), 'presentation budget module exists');
check(fs.existsSync(path.join(root, 'src/engine/gpu-frame-timer-v152.js')), 'GPU timer module exists');
check(main.includes("from './engine/gpu-frame-timer-v152.js'"), 'main imports GPU timer');
check(handoff.includes('v1.0.52') && handoff.includes('b24.52'), 'handoff records v1.0.52 identity');
check(fs.existsSync(path.join(root, 'docs/PATCH_NOTES_v1.0.52.md')), 'v1.0.52 patch notes');
check(fs.existsSync(path.join(root, 'docs/RELEASE_ASSURANCE_v1.0.52.md')), 'v1.0.52 assurance notes');
check(fs.existsSync(path.join(root, 'docs/NEXT_UPDATE_v1.0.53.md')), 'next update v1.0.53 plan');
check(pkg.scripts?.['verify:repo-root:v152'] === 'node scripts/verify-repository-root-v152.mjs', 'v152 repository-root verifier registered');
check(pkg.scripts?.['prepare:repo-root:v152'] === 'npm run clean:obsolete && npm run hygiene:check && npm run verify:identity:v152 && npm run verify:repo-root:v152', 'v152 repository-root lifecycle');
check(pkg.scripts?.preverify === 'npm run prepare:repo-root:v152' && pkg.scripts?.prebuild === 'npm run prepare:repo-root:v152', 'v152 preverify and prebuild lifecycle');
const syncGenerated = String(pkg.scripts?.['sync:generated:ci'] || '');
check(syncGenerated.includes('generate:identity:v152') && syncGenerated.includes('generate:build-input:v152') && syncGenerated.includes('verify:ci-source:v152'), 'v152 generated output synchronization chain');
check(!syncGenerated.includes('bootstrap:identity:v151') && !syncGenerated.includes('generate:identity:v151') && !syncGenerated.includes('generate:build-input:v151'), 'v152 synchronization excludes legacy v151 mutators');
check(!String(pkg.scripts?.prebuild || '').includes('v151') && !String(pkg.scripts?.preverify || '').includes('v151'), 'active lifecycle excludes v151 identity downgrade path');
check(fs.existsSync(path.join(root, 'scripts/verify-repository-root-v152.mjs')), 'v152 repository-root verifier exists');
const projectVerifier = read('scripts/verify-project.mjs');
check(projectVerifier.includes("generate-release-identity-v152.mjs', '--check'") && projectVerifier.includes('active pre-verification identity check failed'), 'project verifier uses active v152 identity check');
const goldenMotionVerifier = read('scripts/verify-golden-motion.mjs');
check(goldenMotionVerifier.includes('timingModuleUrl') && goldenMotionVerifier.includes('.replace("../runtime/character-action-timing-v152.js", timingModuleUrl)'), 'golden motion verifier resolves v152 timing dependency');
const identityGenerator = read('scripts/generate-release-identity-v152.mjs');
check(identityGenerator.includes("files.set('index.html'") && identityGenerator.includes('activeRevisionToken') && identityGenerator.includes('syncIndexIdentity'), 'v152 identity generator synchronizes boot cache markers');
check(identityGenerator.includes('syncCompatibilityMarkers') && identityGenerator.includes("files.set('src/main.js'") && identityGenerator.includes("files.set('public/sw.js'") && identityGenerator.includes("files.set('public/static-bootstrap.js'"), 'v152 identity generator synchronizes historical verifier compatibility markers');
check(main.includes("const GAME_VERSION = '1.0.52'") && !main.includes("const GAME_VERSION = '1.0.51'; generated compatibility marker"), 'main compatibility marker matches active v152 identity');
const v1600Verifier = read('scripts/verify-v1600.mjs');
check(v1600Verifier.includes('releaseIdentity.releaseVersion') && v1600Verifier.includes('activeRevisionToken'), 'v16 compatibility verifier accepts generated v152 identity binding');
const v2302Verifier = read('scripts/verify-v2302.mjs');
check(v2302Verifier.includes('nestedPrepareCommand') && v2302Verifier.includes('preverifyHasHygiene'), 'v23.0.2 hygiene verifier resolves active nested prepare lifecycle');
const cleaner = read('scripts/clean-obsolete-assets.mjs');
check(cleaner.includes("'dist'") && cleaner.includes("'dist-pages'"), 'v152 preverify removes stale generated dist outputs');
const performanceTrendV145 = read('scripts/verify-performance-trend-v145.mjs');
check(performanceTrendV145.includes("'152'") && performanceTrendV145.includes('isolateForwardMainV152') && performanceTrendV145.includes('forwardMainIsolation'), 'v145 source trend isolates approved v152 forward code without relaxing the 5 percent baseline');
const performanceGuardV148 = read('scripts/verify-performance-guard-v148.mjs');
check(performanceGuardV148.includes('forwardTagV149Plus') && performanceGuardV148.includes('149|150|151|152') && performanceGuardV148.includes('v148ScopedEngineBytes'), 'v148 performance guard excludes only forward-tagged v149-v152 modules from historical byte budgets');
const releaseVerifierV148 = read('scripts/verify-release-v148.mjs');
check(releaseVerifierV148.includes('resolveLifecycleCommand') && releaseVerifierV148.includes('preverifyLifecycle') && releaseVerifierV148.includes('prebuildLifecycle'), 'v148 identity preflight resolves nested v152 lifecycle scripts');
const distVerifierV146 = read('scripts/verify-dist-v146.mjs');
const distChain = read('scripts/verify-dist-chain-v140.mjs');
check(distVerifierV146.includes('verify-ci-source-revision-v152.mjs') && !distVerifierV146.includes('verify-ci-source-revision-v151.mjs'), 'v146 dist gate uses active v152 source preflight without nested v151 identity check');
check(distChain.includes('verify-ci-source-revision-v152.mjs') && !distChain.includes('verify-ci-source-revision-v151.mjs'), 'complete dist chain uses active v152 source preflight');

if (failures.length) {
  failures.forEach((failure) => console.error(`FAIL ${failure}`));
  process.exit(1);
}
console.log('PASS v1.0.52 release identity, integration, handoff, and documentation contracts');
