import fs from 'node:fs';

const read = (path) => fs.readFileSync(path, 'utf8');
const pkg = JSON.parse(read('package.json'));
const main = read('src/main.js');
const html = read('index.html');
const style = read('src/style.css');
const policy = read('src/runtime/native-input-policy-v231.js');
const consoleSource = read('src/production-console.js');
const keyboardBlock = main.match(/on\(window, 'keydown',[\s\S]*?'keyboard-movement-up'\);/)?.[0] || '';

const checks = [
  ['package version 23.1.0', pkg.version === '23.1.0'],
  ['runtime version 23.1.0', main.includes("GAME_VERSION = '23.1.0'")],
  ['engine version 21.0.0', read('src/engine/engine-config.js').includes("ENGINE_VERSION = '21.0.0'")],
  ['service worker version 23.1.0', read('public/sw.js').includes("VERSION = '23.1.0'")],
  ['global game shortcuts disabled by policy', policy.includes('GLOBAL_GAME_SHORTCUTS_ENABLED = false')],
  ['movement input remains available', ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].every((code) => policy.includes(`'${code}'`))],
  ['global keyboard handler only processes movement', keyboardBlock.includes('isMovementCode(code)') && !/code === ['"]F\d+/.test(keyboardBlock)],
  ['browser function keys are not prevented', !/code === ['"]F[1-9][0-2]?/.test(main)],
  ['action hotkeys removed', !['KeyQ', 'KeyE', 'KeyR', 'KeyF', 'KeyG'].some((code) => keyboardBlock.includes(code)) && !keyboardBlock.includes("code === 'Space'") && !keyboardBlock.includes("code === 'Enter'") && !keyboardBlock.includes("code === 'Escape'")],
  ['shortcut labels removed from player UI', !html.includes('F4 제작 콘솔') && !html.includes('F5로 시야') && !style.includes("content: ' · F6'")],
  ['production console remains button-accessible', main.includes("on(ui.productionConsole, 'click'") && html.includes('id="production-console-btn"')],
  ['desktop title uses split columns', style.includes('v23.1.0 Native Input Shell') && style.includes('grid-template-columns: minmax(430px, 1.12fr) minmax(370px, .88fr)')],
  ['desktop mascot uses left column', style.includes('position: relative;\n    grid-column: 1;') && style.includes('grid-column: 2;\n    justify-self: end;')],
  ['mobile title flow remains supported', style.includes('@media (max-width:760px)') || style.includes('@media (max-width: 760px)')],
  ['cache revision updated', html.includes('native-input-v2310') && read('src/engine/asset-catalog.js').includes("ASSET_REVISION = '23.1.0'")],
  ['documentation exists', fs.existsSync('docs/NATIVE_INPUT_SHELL_v23.1.0.md') && fs.existsSync('docs/PATCH_NOTES_v23.1.0.md') && fs.existsSync('docs/PATCH_APPLY_v23.1.0.md')],
  ['handoff locks native browser keys', read('PROJECT_HANDOFF.md').includes('PERMANENT NATIVE KEY CONTRACT')],
  ['production console no longer advertises function keys', !consoleSource.includes('F4 toggle') && !consoleSource.includes('F7 browser snapshot')]
];

let failed = 0;
for (const [name, ok] of checks) {
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}`);
  if (!ok) failed += 1;
}
if (failed) process.exit(1);
console.log('\nv23.1.0 Native Input Shell contract verified');
