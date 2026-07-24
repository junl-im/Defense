import fs from 'node:fs';
const read = (path) => fs.readFileSync(path, 'utf8');
const main = read('src/main.js');
const css = read('src/style.css');
const html = read('index.html');
const pkg = JSON.parse(read('package.json'));
const checks = [
  ['package version remains v22 or later', Number(pkg.version.split('.')[0]) >= 22],
  ['runtime retains v22 lineage', /GAME_VERSION = '(?:2[2-9]|[3-9]\d)\.\d+\.\d+'/.test(main)],
  ['engine remains 19.0.0 or later', /ENGINE_VERSION = '(?:19|[2-9]\d)\.\d+\.\d+'/.test(read('src/engine/engine-config.js'))],
  ['save schema remains 20 or later', Number(read('src/runtime/save-schema.js').match(/SAVE_SCHEMA_VERSION = (\d+)/)?.[1] || 0) >= 20],
  ['service worker remains v22 or later', /VERSION = '(?:2[2-9]|[3-9]\d)\.\d+\.\d+'/.test(read('public/sw.js'))],
  ['guardian targeting director wired', main.includes('new GuardianTargetingDirectorV22') && fs.existsSync('src/combat/guardian-targeting-director-v22.js')],
  ['tower extended acquisition and sticky target', read('src/combat/guardian-targeting-director-v22.js').includes('getAcquisitionRange') && read('src/combat/guardian-targeting-director-v22.js').includes('autoTarget')],
  ['shaman range capped', main.includes('distance <= 12.5') && main.includes('distanceTo(this.player.group.position) <= 10.5')],
  ['global wheel and pinch zoom retained without forced buttons', main.includes('camera-wheel-global') && main.includes('pinchSensitivity') && !html.includes('zoom-in-btn') && !html.includes('zoom-out-btn')],
  ['centered title layout', css.includes(".title-scene-v17 { display:grid; grid-template-columns:1fr; place-items:center")],
  ['mobile HUD v22 wired', main.includes('new MobileHudDirectorV22') && css.includes('mobile-hud-v22-emergency')],
  ['treasure prompts localized', read('src/runtime/battlefield-prop-system.js').includes("prompt: '상자 열기'")],
  ['auto wave panel clickable', html.includes('id="auto-wave-panel"') && html.includes('role="button"') && main.includes('auto-wave-panel-click')],
  ['reward countdown 10 seconds', html.includes('blessing-auto-seconds') && html.includes('relic-auto-seconds') && html.includes('contract-auto-seconds') && main.includes("startRewardAutoChoice('blessing', 10)") && main.includes("startRewardAutoChoice('relic', 10)")],
  ['choice summon auto selection', html.includes('choice-auto-seconds') && main.includes("startRewardAutoChoice('choice', 10)")],
  ['wave-end loot vacuum', main.includes('vacuumRemainingCoins()') && main.includes('wave-vacuum')],
  ['automation diagnostics exposed', main.includes('automationV22?.report') && fs.existsSync('src/runtime/automation-director-v22.js')],
  ['v22 operating docs exist', ['docs/AUTONOMOUS_MOONFRONT_v22.0.0.md','docs/PATCH_NOTES_v22.0.0.md','docs/PATCH_APPLY_v22.0.0.md','docs/NEXT_PATCH_LINEUP_v22.x.md'].every(fs.existsSync)]
];
let failed = 0;
for (const [name, ok] of checks) { console.log(`${ok ? 'PASS' : 'FAIL'} ${name}`); if (!ok) failed += 1; }
if (failed) process.exit(1);
console.log('\nv22.0.0 Autonomous Moonfront contract verified');
