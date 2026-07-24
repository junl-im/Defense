import fs from 'node:fs';
const read = (path) => fs.readFileSync(path, 'utf8');
const main = read('src/main.js');
const css = read('src/style.css');
const html = read('index.html');
const pkg = JSON.parse(read('package.json'));
const mobile = read('src/runtime/mobile-hud-director-v23.js');
const checks = [
  ['package version remains v23', /^23\.\d+\.\d+$/.test(pkg.version)],
  ['game version remains v23', /GAME_VERSION = '23\.\d+\.\d+'/.test(main)],
  ['engine version 20.0.0', /ENGINE_VERSION = '(?:2[0-9]|[3-9][0-9])\.\d+\.\d+'/.test(read('src/engine/engine-config.js'))],
  ['save schema 21', read('src/runtime/save-schema.js').includes('SAVE_SCHEMA_VERSION = 21')],
  ['service worker remains v23', /VERSION = '23\.\d+\.\d+'/.test(read('public/sw.js'))],
  ['zoom buttons removed from DOM', !html.includes('camera-zoom-controls') && !html.includes('zoom-in-btn') && !html.includes('zoom-out-btn')],
  ['zoom button handlers removed', !main.includes('camera-zoom-in') && !main.includes('camera-zoom-out') && !main.includes('ui.zoomIn') && !main.includes('ui.zoomOut')],
  ['wheel and pinch zoom retained', main.includes('camera-wheel-global') && main.includes('this.pinchState') && main.includes('pinchSensitivity')],
  ['mobile HUD v23 wired', main.includes('new MobileHudDirectorV23') && main.includes('this.mobileHudV23.install()') && main.includes("runSafe('mobile-hud-v23'")],
  ['reserved information and control lanes', css.includes('--v23-control-bottom') && css.includes('--v23-context-bottom') && css.includes('mobile-hud-v23 #action-dock')],
  ['single mobile context lane', mobile.includes("priority: 4") && mobile.includes("priority: 3") && mobile.includes("priority: 2") && mobile.includes("priority: 1") && css.includes('mobile-context-suppressed-v23')],
  ['compact micro landscape profiles', css.includes('mobile-hud-v23-compact') && css.includes('mobile-hud-v23-micro') && css.includes('mobile-hud-v23-landscape')],
  ['runtime overlap protection', mobile.includes('overlapPairs') && mobile.includes('mobile-hud-v23-emergency') && mobile.includes('ResizeObserver')],
  ['nonessential mobile panels folded', css.includes('body.mobile-hud-v23 #first-mission-panel') && css.includes('body.mobile-hud-v23 #synergy-panel')],
  ['title art cache revision updated', html.includes('quiet-screen-v23') || html.includes('boot-recovery-v2301') || html.includes('clean-foundation-v2302') || html.includes('native-input-v2310')],
  ['v23 operating docs exist', ['docs/QUIET_SCREEN_v23.0.0.md','docs/PATCH_NOTES_v23.0.0.md','docs/PATCH_APPLY_v23.0.0.md','docs/NEXT_PATCH_LINEUP_v23.x.md','docs/MOBILE_UI_SIMULATION_v23.0.0.json'].every(fs.existsSync)]
];
let failed = 0;
for (const [name, ok] of checks) { console.log(`${ok ? 'PASS' : 'FAIL'} ${name}`); if (!ok) failed += 1; }
if (failed) process.exit(1);
console.log('\nv23.0.0 Quiet Screen contract verified');
