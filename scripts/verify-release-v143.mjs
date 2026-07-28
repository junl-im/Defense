import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = path.resolve(import.meta.dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const json = (file) => JSON.parse(read(file));
const failures = [];
const check = (value, message) => { if (!value) failures.push(message); };

const pkg = json('package.json');
const lock = json('package-lock.json');
const version = json('public/version.json');
const shell = json('public/assets/system-v135/runtime-module-shell-v135.json');
const main = read('src/main.js');
const css = read('src/style.css');
const index = read('index.html');
const sw = read('public/sw.js');
const handoff = read('PROJECT_HANDOFF.md');
const patch = Number(pkg.version.split('.')[2]);

check(pkg.version.startsWith('1.0.') && patch >= 43 && pkg.dokkaebi?.buildId === `b24.${patch}`, 'v143+ package identity');
check(lock.version === pkg.version && lock.packages?.['']?.version === pkg.version && lock.packages?.['']?.dokkaebi?.buildId === pkg.dokkaebi?.buildId, 'lock identity');
check(version.releaseVersion === pkg.version && version.buildId === pkg.dokkaebi?.buildId && version.lineageVersion === pkg.dokkaebi?.lineageVersion, 'public identity');
check(main.includes("import MobileInputRecoveryV143") && main.includes('this.mobileInputRecoveryV143.mount()') && main.includes('resetMobilePointerStateV143'), 'runtime input recovery integration');
check(main.includes('resetJoystickGestureV143') && main.includes('lookPointers.clear()') && main.includes('mobile-input-recovery-v143'), 'pointer and joystick cleanup');
check(index.includes('data-summon-visibility-v143="enhanced"') && css.includes('#summon-btn[data-summon-visibility-v143="enhanced"]') && css.includes('touch-action: manipulation') && css.includes('pointer-events: none'), 'summon behavior contract');
check(index.includes('legacy-loading-retired-v141') && !index.includes('수호대를 전장으로 부르는 중...'), 'legacy loading remains retired');
check(sw.includes(`const RELEASE_VERSION = '${pkg.version}';`) && sw.includes(`const BUILD_ID = '${pkg.dokkaebi?.buildId}';`) && sw.includes("'./src/runtime/mobile-input-recovery-v143.js'"), 'service worker identity and module shell');
check(shell.releaseVersion === pkg.version && shell.buildId === pkg.dokkaebi?.buildId && shell.files?.some((entry) => entry.path === 'src/runtime/mobile-input-recovery-v143.js'), 'runtime shell manifest');
check(pkg.scripts?.['verify:mobile-input:v143'] && pkg.scripts?.['verify:browser:v143'] && pkg.scripts?.['verify:reachability:v143'] && pkg.scripts?.['verify:presentation:v143'] && pkg.scripts?.['verify:release:v143'] && pkg.scripts?.['verify:dist:v143'], 'v143 scripts');
const reach = json('docs/generated/runtime-asset-reachability-v143.json');
check(reach.id === 'DD-RUNTIME-ASSET-REACHABILITY-V143' && reach.assetFilesScanned >= 1900 && reach.runtimeUnresolvedReferences?.length === 0, 'runtime asset reachability report');
const snapshots = json('docs/generated/presentation-surface-snapshots-v143.json');
check(snapshots.id === 'DD-PRESENTATION-SNAPSHOTS-V143' && snapshots.surfaces?.loading?.hidden && !snapshots.surfaces?.loading?.legacyArtwork && snapshots.surfaces?.combatDock?.hasSummonV143, 'presentation snapshots');
check(handoff.includes('인수인계 내역 작성 필수') && handoff.includes('2026-07-27 — v1.0.43 / b24.43'), 'mandatory v143 handoff');
for (const doc of ['docs/MOBILE_INPUT_RECOVERY_v1.0.43.md', 'docs/PATCH_NOTES_v1.0.43.md', 'docs/PATCH_APPLY_v1.0.43.md', 'docs/NEXT_UPDATE_v1.0.44.md']) check(fs.existsSync(path.join(root, doc)), `document ${doc}`);
for (const script of ['scripts/verify-mobile-input-recovery-v143.mjs', 'scripts/generate-runtime-asset-reachability-v143.mjs', 'scripts/generate-presentation-snapshots-v143.mjs']) {
  const run = spawnSync(process.execPath, [path.join(root, script), ...(script.includes('generate-') ? ['--check'] : [])], { cwd: root, encoding: 'utf8' });
  process.stdout.write(run.stdout || '');
  process.stderr.write(run.stderr || '');
  check(run.status === 0, `sub-verifier ${script}`);
}
if (failures.length) {
  failures.forEach((failure) => console.error(`FAIL ${failure}`));
  process.exit(1);
}
console.log(`PASS v1.0.43+ mobile input recovery, summon visibility, presentation snapshots, and asset reachability under ${pkg.version}`);
