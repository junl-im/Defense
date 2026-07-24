import { createHash } from 'node:crypto';
import fs from 'node:fs';
import AppStateMachineV103 from '../src/runtime/app-state-machine-v103.js';

const read = (file) => fs.readFileSync(file, 'utf8');
const hash = (file) => createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const pkg = JSON.parse(read('package.json'));
const lock = JSON.parse(read('package-lock.json'));
const baseline = JSON.parse(read('scripts/patch-baselines/v1.0.2.json'));
const main = read('src/main.js');
const stateMachineSource = read('src/runtime/app-state-machine-v103.js');
const mobileHud = read('src/runtime/mobile-hud-director-v23.js');
const adaptiveHud = read('src/ui-layout-manager.js');
const browserLab = read('scripts/run-browser-reliability-lab-v19.mjs');
const policy = read('src/version-policy.js');
const sw = read('public/sw.js');

const protectedFiles = [
  'src/style.css',
  'src/art-style-tokens.js',
  'docs/ABSOLUTE_ART_BIBLE_v2.0.md'
];
const artUnchanged = protectedFiles.every((file) => baseline.files?.[file]?.sha256 === hash(file));
const assetsUnchanged = Object.entries(baseline.files || {})
  .filter(([file]) => file.startsWith('src/assets/') || file.startsWith('public/assets/'))
  .every(([file, meta]) => fs.existsSync(file) && meta.sha256 === hash(file));

const machine = new AppStateMachineV103({ initial: 'loading' });
machine.transition('title', { source: 'verify' });
machine.transition('playing', { source: 'verify' });
machine.transition('paused', { source: 'verify' });
machine.transition('playing', { source: 'verify' });
machine.transition('result', { source: 'verify' });
machine.transition('title', { source: 'verify' });

const constructorBlock = main.slice(main.indexOf('constructor() {'), main.indexOf('this.assertRequiredUI();'));
const checks = [
  ['public release is 1.0.3', pkg.version === '1.0.3' && pkg.dokkaebi?.releaseVersion === '1.0.3'],
  ['package lock release is synchronized', lock.version === pkg.version && lock.packages?.['']?.version === pkg.version],
  ['monotonic build id is b24.3', pkg.dokkaebi?.buildId === 'b24.3' && policy.includes('BUILD_REVISION = 3')],
  ['runtime and service worker identities match', main.includes("const GAME_VERSION = '1.0.3'") && sw.includes("RELEASE_VERSION = '1.0.3'") && sw.includes("BUILD_ID = 'b24.3'")],
  ['central app state machine is installed', main.includes("AppStateMachineV103") && main.includes("Object.defineProperty(this, 'state'") && stateMachineSource.includes('ALLOWED_TRANSITIONS')],
  ['state transition contract passes representative flow', machine.current === 'title' && machine.invalidTransitions === 0 && machine.history.length >= 7],
  ['write-only previousState flag removed', !main.includes('previousState')],
  ['constructor reward flag is initialized once', (constructorBlock.match(/this\.progressRewarded\s*=\s*false/g) || []).length === 1],
  ['top-level animation and runtime disposal exists', main.includes('if (this.disposed) return;') && main.includes('cancelAnimationFrame(this.animationFrameId)') && main.includes('this.lifecycle?.dispose()')],
  ['mobile HUD listener and observer disposal exists', mobileHud.includes("removeEventListener('resize', this.queueHandler)") && mobileHud.includes('this.observer?.disconnect()') && mobileHud.includes('this.resizeObserver?.disconnect()')],
  ['adaptive HUD queued frame disposal exists', adaptiveHud.includes('cancelAnimationFrame(this.refreshFrame)') && adaptiveHud.includes('this.refreshQueued = false')],
  ['browser reliability runner imports generated output', browserLab.includes("import { generatedOutput } from './output-paths.mjs';")],
  ['browser reliability runner uses current service worker identity', browserLab.includes("const RELEASE_VERSION = '${currentVersion}'") && browserLab.includes("const BUILD_ID = 'b\\d+\\.\\d+'")],
  ['patch manifest and hash automation exists', fs.existsSync('scripts/create-patch-v103.mjs') && fs.existsSync('scripts/verify-patch-v103.mjs') && fs.existsSync('scripts/patch-baselines/v1.0.2.json')],
  ['absolute art bible files are unchanged', artUnchanged],
  ['runtime art asset bytes are unchanged', assetsUnchanged],
  ['no SVG files were introduced', !Object.keys(baseline.files || {}).some((file) => file.toLowerCase().endsWith('.svg')) && !fs.readdirSync('src/runtime').some((file) => file.toLowerCase().endsWith('.svg'))]
];

let failed = 0;
for (const [name, passed] of checks) {
  console.log(`${passed ? 'PASS' : 'FAIL'} ${name}`);
  if (!passed) failed += 1;
}
if (failed) process.exit(1);
console.log('\nv1.0.3 State and Lifecycle Foundation contract verified');
