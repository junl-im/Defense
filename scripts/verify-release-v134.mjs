import fs from 'node:fs';
import path from 'node:path';
import {
  MOBILE_HUD_RESILIENCE_V134_ID,
  MOBILE_HUD_V23_VERSION,
  resolveMobileViewportV23,
  transitionEmergencyV23
} from '../src/runtime/mobile-hud-director-v23.js';

const root = process.cwd();
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8');
const exists = (relative) => fs.existsSync(path.join(root, relative));
const pkg = JSON.parse(read('package.json'));
const publicVersion = JSON.parse(read('public/version.json'));
const mobile = read('src/runtime/mobile-hud-director-v23.js');
const css = read('src/style.css');
const main = read('src/main.js');
const versionPolicy = read('src/version-policy.js');
const html = read('index.html');
const sw = read('public/sw.js');
const bootstrap = read('public/static-bootstrap.js');
const handoff = read('PROJECT_HANDOFF.md');
const simulation = JSON.parse(read('logs/simulations/MOBILE_UI_SIMULATION_v23.latest.json'));
const failures = [];
const check = (ok, label) => { if (!ok) failures.push(label); };

const releaseParts = String(pkg.version || '').split('.').map(Number);
const releaseAtLeastV134 = releaseParts.length === 3 && releaseParts.every(Number.isFinite)
  && (releaseParts[0] > 1 || (releaseParts[0] === 1 && (releaseParts[1] > 0 || releaseParts[2] >= 34)));
const revision = Number(pkg.dokkaebi?.buildRevision || 0);
check(releaseAtLeastV134 && pkg.dokkaebi?.buildEpoch === 24 && revision >= 34 && pkg.dokkaebi?.buildId === `b24.${revision}`, 'current package preserves v1.0.34 foundation');
check(publicVersion.releaseVersion === pkg.version && publicVersion.lineageVersion === pkg.dokkaebi?.lineageVersion && publicVersion.buildId === pkg.dokkaebi?.buildId, 'current public version identity');
check(versionPolicy.includes(`PUBLIC_GAME_VERSION = '${pkg.version}'`) && versionPolicy.includes(`LEGACY_LINEAGE_VERSION = '${pkg.dokkaebi?.lineageVersion}'`) && versionPolicy.includes(`BUILD_REVISION = ${revision}`), 'current version policy identity');
check(main.includes(`const GAME_VERSION = '${pkg.version}';`), 'current main version');
check(html.includes(`const RELEASE_VERSION = '${pkg.version}';`) && html.includes(`const BUILD_ID = '${pkg.dokkaebi?.buildId}';`), 'current index cache identity');
check(sw.includes(`const RELEASE_VERSION = '${pkg.version}';`) && sw.includes(`const BUILD_ID = '${pkg.dokkaebi?.buildId}';`), 'current service worker identity');
check(bootstrap.includes(`const RELEASE_VERSION = '${pkg.version}';`) && bootstrap.includes(`const BUILD_ID = '${pkg.dokkaebi?.buildId}';`), 'current static bootstrap identity');

check(MOBILE_HUD_RESILIENCE_V134_ID === 'DD-MOBILE-HUD-RESILIENCE-V134', 'runtime marker export');
check(Number(MOBILE_HUD_V23_VERSION.split('.')[1]) >= 2, 'mobile HUD runtime preserves v23.2 foundation');
check(mobile.includes('syncTargets()') && mobile.includes('lateMountRecoveries') && mobile.includes("{ childList: true, subtree: true }"), 'dynamic mount recovery');
check(mobile.includes("visualViewport?.addEventListener('scroll'") && mobile.includes('--mobile-visual-bottom-v23'), 'visual viewport tracking');
check(mobile.includes('suppressedAria') && mobile.includes("setAttribute('aria-hidden', 'true')") && mobile.includes('restoreSuppressedAria'), 'context accessibility restoration');
check(mobile.includes('transitionEmergencyV23') && mobile.includes('EMERGENCY_CLEAR_FRAMES = 3'), 'emergency hysteresis');

const keyboardProfile = resolveMobileViewportV23({ visualWidth: 390, visualHeight: 520, layoutWidth: 390, layoutHeight: 844, editableFocused: true });
check(keyboardProfile.phone && keyboardProfile.keyboard && keyboardProfile.offsetBottom === 324, 'keyboard viewport classification');
const offsetProfile = resolveMobileViewportV23({ visualWidth: 756, visualHeight: 390, layoutWidth: 800, layoutHeight: 390, offsetLeft: 22 });
check(offsetProfile.offsetLeft === 22 && offsetProfile.offsetRight === 22 && offsetProfile.phone && offsetProfile.landscape, 'offset viewport classification');
let emergency = transitionEmergencyV23({}, 1);
check(emergency.active, 'emergency enters on overlap');
emergency = transitionEmergencyV23(emergency, 0);
check(emergency.active, 'emergency holds clear frame 1');
emergency = transitionEmergencyV23(emergency, 0);
check(emergency.active, 'emergency holds clear frame 2');
emergency = transitionEmergencyV23(emergency, 0);
check(!emergency.active, 'emergency clears after frame 3');

check(css.includes('v1.0.34 Mobile HUD Resilience'), 'v1.0.34 CSS section');
check(css.includes('min-height: 44px') && css.includes('touch-action: manipulation') && css.includes(':focus-visible'), 'touch and keyboard accessibility CSS');
check(css.includes('--mobile-visual-left-v23') && css.includes('--mobile-visual-right-v23') && css.includes('--mobile-visual-bottom-v23'), 'visual viewport CSS variables');
check(['DD-MOBILE-HUD-RESILIENCE-V134', 'DD-MOBILE-HUD-STABILITY-V135'].includes(simulation.id), 'simulation identity');
check(simulation.summary?.testedProfiles >= 10 && simulation.summary?.passedProfiles === simulation.summary?.testedProfiles && simulation.summary?.failedProfiles === 0, 'mobile profile simulation preserves v1.0.34 coverage');
check(simulation.summary?.keyboardProfiles >= 2 && simulation.summary?.offsetProfiles >= 1, 'keyboard and offset simulation coverage');

const requiredDocs = [
  'docs/MOBILE_HUD_RESILIENCE_v1.0.34.md',
  'docs/HANDOFF_CONTRACT_v1.0.34.md',
  'docs/PATCH_NOTES_v1.0.34.md',
  'docs/PATCH_APPLY_v1.0.34.md',
  'docs/NEXT_UPDATE_v1.0.35.md'
];
check(requiredDocs.every(exists), 'v1.0.34 operating docs');
check(handoff.includes('## 절대 규칙'), 'handoff absolute rules heading');
check(handoff.includes('인수인계 내역 작성 필수'), 'mandatory handoff history rule');
check(handoff.includes('## 인수인계 내역') && handoff.includes('2026-07-27 — v1.0.34 / b24.34'), 'version handoff history');
check(handoff.includes('전체 통파일 ZIP') && handoff.includes('패치 ZIP') && handoff.includes('다음 업데이트 패치 예정 라인'), 'required final report format');
check(pkg.scripts?.verify?.includes('verify:release:v134') && pkg.scripts?.['verify:dist:v134'] && pkg.scripts?.['create:patch:v134'] && pkg.scripts?.['verify:patch:v134'], 'package verification scripts');
check(!exists('COMPACT_PACKAGE_NOTE.txt') && !exists('REBUILD_DIST_WINDOWS.bat'), 'root hygiene');

if (failures.length) {
  failures.forEach((label) => console.error(`FAIL ${label}`));
  process.exit(1);
}
console.log(`PASS v1.0.34 mobile HUD resilience foundation preserved under current release ${pkg.version} / ${pkg.dokkaebi?.buildId}`);
