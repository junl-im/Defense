import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { FrameScope } from '../src/runtime-lifecycle.js';
import BossIdentityAssuranceDirectorV133, { BOSS_IDENTITY_PROFILES_V133 } from '../src/runtime/boss-identity-assurance-director-v133.js';
import {
  MOBILE_HUD_STABILITY_V135_ID,
  MOBILE_HUD_V23_VERSION,
  resolveMobileViewportV23
} from '../src/runtime/mobile-hud-director-v23.js';

const root = process.cwd();
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8');
const json = (relative) => JSON.parse(read(relative));
const exists = (relative) => fs.existsSync(path.join(root, relative));
const sha256 = (buffer) => createHash('sha256').update(buffer).digest('hex');
const failures = [];
const check = (condition, label) => { if (!condition) failures.push(label); };

const pkg = json('package.json');
const lock = json('package-lock.json');
const version = json('public/version.json');
const moduleShell = json('public/assets/system-v135/runtime-module-shell-v135.json');
const toolchain = json('logs/verify/BUILD_TOOLCHAIN_AUDIT_v135.json');
const simulation = json('logs/simulations/MOBILE_UI_SIMULATION_v23.latest.json');
const registry = json('public/assets/visual-v133/boss-identity-registry-v133.json');
const main = read('src/main.js');
const lifecycle = read('src/runtime-lifecycle.js');
const mobile = read('src/runtime/mobile-hud-director-v23.js');
const bossDirector = read('src/runtime/boss-identity-assurance-director-v133.js');
const css = read('src/style.css');
const html = read('index.html');
const sw = read('public/sw.js');
const bootstrap = read('public/static-bootstrap.js');
const handoff = read('PROJECT_HANDOFF.md');

const versionAtLeast = (current, minimum) => {
  const left = String(current).split('.').map((value) => Number.parseInt(value, 10) || 0);
  const right = String(minimum).split('.').map((value) => Number.parseInt(value, 10) || 0);
  for (let index = 0; index < Math.max(left.length, right.length); index += 1) {
    if ((left[index] || 0) > (right[index] || 0)) return true;
    if ((left[index] || 0) < (right[index] || 0)) return false;
  }
  return true;
};
const currentBuildId = pkg.dokkaebi?.buildId;
const currentLineage = pkg.dokkaebi?.lineageVersion;
const currentCacheRevision = pkg.dokkaebi?.cacheRevision;
const patch = String(pkg.version).split('.')[2] || '0';
const cacheToken = `release-v1${patch}-${String(currentBuildId).replace('.', '-')}`;

check(versionAtLeast(pkg.version, '1.0.35') && pkg.dokkaebi?.releaseVersion === pkg.version, 'package release identity');
check(versionAtLeast(currentLineage, '23.3.0') && currentBuildId && currentCacheRevision === `${pkg.version}-${currentBuildId}`, 'package build identity');
check(lock.version === pkg.version && lock.packages?.['']?.version === pkg.version && lock.packages?.['']?.dokkaebi?.buildId === currentBuildId, 'lock identity');
check(version.releaseVersion === pkg.version && version.lineageVersion === currentLineage && version.buildId === currentBuildId, 'public version identity');
check(main.includes(`const GAME_VERSION = '${pkg.version}';`), 'main version');
check(html.includes(`const RELEASE_VERSION = '${pkg.version}';`) && html.includes(`const BUILD_ID = '${currentBuildId}';`) && html.includes(cacheToken), 'index cache identity');
check(sw.includes(`const RELEASE_VERSION = '${pkg.version}';`) && sw.includes(`const BUILD_ID = '${currentBuildId}';`), 'service worker identity');
check(bootstrap.includes(`const RELEASE_VERSION = '${pkg.version}';`) && bootstrap.includes(`const BUILD_ID = '${currentBuildId}';`), 'static bootstrap identity');
check(toolchain.id === 'DD-BUILD-TOOLCHAIN-AUDIT-V135' && toolchain.releaseVersion === '1.0.35' && toolchain.buildId === 'b24.35', 'build toolchain audit identity');
check(['ready', 'exception-documented'].includes(toolchain.status), 'build toolchain audit status');
check(toolchain.status === 'ready' || (toolchain.missing?.includes('package.json') && toolchain.ciProductionGate?.includes('npm ci')), 'incomplete Vite dependency exception is documented');

check(MOBILE_HUD_STABILITY_V135_ID === 'DD-MOBILE-HUD-STABILITY-V135' && MOBILE_HUD_V23_VERSION === '23.3.0', 'mobile stability identity');
const toolbar = resolveMobileViewportV23({ layoutWidth: 390, layoutHeight: 844, visualWidth: 390, visualHeight: 760 });
const keyboard = resolveMobileViewportV23({ layoutWidth: 390, layoutHeight: 844, visualWidth: 390, visualHeight: 700, editableFocused: true });
const zoom = resolveMobileViewportV23({ layoutWidth: 390, layoutHeight: 844, visualWidth: 260, visualHeight: 562.67, offsetLeft: 65, offsetTop: 70, visualScale: 1.5 });
check(toolbar.browserChrome && !toolbar.keyboard, 'browser chrome is not misclassified as keyboard');
check(keyboard.keyboard && keyboard.editableFocused, 'focused virtual keyboard classification');
check(zoom.zoomed && !zoom.keyboard && zoom.scale <= 0.9, 'pinch zoom safety classification');
check(simulation.id === 'DD-MOBILE-HUD-STABILITY-V135' && simulation.version === '23.3.0', 'mobile simulation identity');
check(simulation.summary?.testedProfiles === 14 && simulation.summary?.passedProfiles === 14 && simulation.summary?.failedProfiles === 0, '14 profile UI overlap simulation');
check(simulation.summary?.browserChromeProfiles >= 2 && simulation.summary?.zoomProfiles >= 1 && simulation.summary?.keyboardProfiles >= 3, 'browser viewport simulation coverage');

check(lifecycle.includes('export class FrameScope') && lifecycle.includes('this.frames.cancelAll()') && lifecycle.includes('frames: this.frames.diagnostics'), 'managed frame lifecycle');
check(main.includes('this.transientVisuals = new Set()') && main.includes('animateTransientVisual') && main.includes('clearTransientVisuals'), 'transient visual lifecycle integration');
check(!/requestAnimationFrame\((?:animate|fade)\)/.test(main), 'unmanaged effect animation frames removed');
check(main.includes('this.clearTransientVisuals();\n    this.lifecycle?.dispose();'), 'transient visual disposal');

const previousWindow = globalThis.window;
let nextFrame = 0;
const pendingFrames = new Map();
globalThis.window = {
  requestAnimationFrame(callback) { nextFrame += 1; pendingFrames.set(nextFrame, callback); return nextFrame; },
  cancelAnimationFrame(frame) { pendingFrames.delete(frame); }
};
const frameScope = new FrameScope('verification');
frameScope.request(() => {});
frameScope.request(() => {}, { key: 'effect' });
check(frameScope.diagnostics.pending === 2 && pendingFrames.size === 2, 'frame scope registration');
frameScope.cancelAll();
check(frameScope.diagnostics.pending === 0 && pendingFrames.size === 0, 'frame scope cleanup');
if (previousWindow === undefined) delete globalThis.window; else globalThis.window = previousWindow;

const fakeVisual = { diagnostics: { activeRecords: 8 } };
const endurance = new BossIdentityAssuranceDirectorV133({ combatVisual: fakeVisual });
for (let wave = 1; wave <= 100; wave += 1) {
  fakeVisual.diagnostics.activeRecords = 8 + wave % 12;
  endurance.update({
    wave,
    boss: wave % 10 === 0 ? { type: wave % 30 === 0 ? 'king' : wave % 20 === 0 ? 'serpent' : 'tiger', phase: 1 + Math.floor((wave % 30) / 10), intent: '100웨이브 안정성 검사' } : null,
    particles: 72 + wave % 64,
    projectiles: 8 + wave % 15,
    hazards: 2 + wave % 6,
    fps: 58 - wave % 4,
    directionGroups: []
  });
}
check(endurance.report.highestWave === 100 && endurance.report.samples === 100 && endurance.report.lifecycleHealthy, '100 wave bounded resource simulation');

check(bossDirector.includes("setAttribute('role', 'status')") && bossDirector.includes("setAttribute('aria-atomic', 'true')"), 'boss badge live region semantics');
check(bossDirector.includes("this.badge.removeAttribute('aria-label')") && bossDirector.includes('this.badge.hidden = !identity'), 'stale boss accessibility state cleanup');
check(html.includes('role="progressbar" aria-label="보스 체력"') && html.includes('role="progressbar" aria-label="보스 파훼 게이지"'), 'boss progress semantics');
check(main.includes("setAttribute('aria-valuetext'") && main.includes('bossHealthPercent'), 'boss progress runtime values');
check(css.includes('v1.0.35 Runtime Stability, Boss Accessibility and Zoom Safety') && css.includes('color: #fff4dc'), 'v1.0.35 accessibility CSS');

const luminance = (hex) => {
  const values = hex.replace('#', '').match(/.{2}/g).map((part) => Number.parseInt(part, 16) / 255).map((value) => value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
  return 0.2126 * values[0] + 0.7152 * values[1] + 0.0722 * values[2];
};
const contrast = (a, b) => {
  const left = luminance(a); const right = luminance(b);
  return (Math.max(left, right) + 0.05) / (Math.min(left, right) + 0.05);
};
check(contrast('#fff4dc', '#0a0b18') >= 7, 'boss badge text contrast');
check(Object.values(BOSS_IDENTITY_PROFILES_V133).every((profile) => contrast(profile.accent, '#0a0b18') >= 4.5), 'boss accent contrast');

check(moduleShell.id === 'DD-RELEASE-INTEGRITY-V135' && moduleShell.releaseVersion === pkg.version && moduleShell.buildId === currentBuildId, 'runtime module shell identity');
check(moduleShell.moduleCount === moduleShell.files?.length && moduleShell.moduleCount >= 100, 'runtime module shell coverage');
for (const entry of moduleShell.files || []) {
  const absolute = path.join(root, entry.path);
  check(fs.existsSync(absolute), `runtime shell missing ${entry.path}`);
  if (fs.existsSync(absolute)) {
    const data = fs.readFileSync(absolute);
    check(data.length === entry.bytes && sha256(data) === entry.sha256, `runtime shell hash ${entry.path}`);
    check(sw.includes(`'./${entry.path}'`), `service worker shell ${entry.path}`);
  }
}

const assetRoots = ['public/assets', 'src/assets'];
let assetCount = 0;
let zeroByteAssets = 0;
let forbiddenSvgAssets = 0;
for (const assetRoot of assetRoots) {
  const pending = [path.join(root, assetRoot)];
  while (pending.length) {
    const current = pending.pop();
    for (const item of fs.readdirSync(current, { withFileTypes: true })) {
      const absolute = path.join(current, item.name);
      if (item.isDirectory()) pending.push(absolute);
      else if (item.isFile()) {
        assetCount += 1;
        if (fs.statSync(absolute).size === 0) zeroByteAssets += 1;
        if (item.name.toLowerCase().endsWith('.svg')) forbiddenSvgAssets += 1;
      }
    }
  }
}
check(assetCount >= 1900 && zeroByteAssets === 0 && forbiddenSvgAssets === 0, 'asset presence and SVG policy');
check(registry.approvals?.pupuIndependentActions === 'derived-provisional' && registry.approvals?.bombImpRuntime === 'quarantined' && registry.summary?.newFinalCharacterArt === 0, 'asset approval boundary');

const requiredDocs = [
  'docs/RUNTIME_STABILITY_ASSURANCE_v1.0.35.md',
  'docs/SYSTEM_AUDIT_v1.0.35.md',
  'docs/PATCH_NOTES_v1.0.35.md',
  'docs/PATCH_APPLY_v1.0.35.md',
  'docs/NEXT_UPDATE_v1.0.36.md',
  'docs/BUILD_TOOLCHAIN_EXCEPTION_v1.0.35.md'
];
check(requiredDocs.every(exists), 'v1.0.35 operating docs');
check(handoff.includes('인수인계 내역 작성 필수') && handoff.includes('2026-07-27 — v1.0.35 / b24.35'), 'mandatory v1.0.35 handoff history');
check(pkg.scripts?.verify?.includes('verify:release:v135') && pkg.scripts?.['audit:toolchain:v135'] && pkg.scripts?.['verify:dist:v135'] && pkg.scripts?.['create:patch:v135'] && pkg.scripts?.['verify:patch:v135'], 'v1.0.35 package verification scripts');

if (failures.length) {
  failures.forEach((label) => console.error(`FAIL ${label}`));
  process.exit(1);
}
console.log(`PASS v1.0.35 system, performance, engine lifecycle, UI overlap, accessibility, release integrity, and asset boundary verified (${assetCount} assets)`);
