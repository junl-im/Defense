import { existsSync, readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { ENGINE_VERSION } from '../src/engine/engine-config.js';
import { SAVE_SCHEMA_VERSION } from '../src/runtime/save-schema.js';
import WaveFlowGuard, { WAVE_FLOW_GUARD_VERSION } from '../src/runtime/wave-flow-guard.js';

const root = resolve(import.meta.dirname, '..');
const read = (path) => readFileSync(resolve(root, path), 'utf8');
const bytes = (path) => readFileSync(resolve(root, path));
const pkg = JSON.parse(read('package.json'));
const main = read('src/main.js');
const html = read('index.html');
const style = read('src/style.css');
const consoleSource = read('src/production-console.js');
let failures = 0;
const check = (condition, message) => condition ? console.log(`PASS ${message}`) : (failures += 1, console.error(`FAIL ${message}`));

check(Number(pkg.version.split('.')[0]) >= 17, 'package version remains v17 or later');
check(/const GAME_VERSION = '(?:17|18|19|20)\.0\.0'/.test(main), 'runtime game version remains v17 or later');
check(Number(ENGINE_VERSION.split('.')[0]) >= 14, 'engine version remains 14.0.0 or later');
check(SAVE_SCHEMA_VERSION >= 15, 'save schema remains 15 or later');
check(WAVE_FLOW_GUARD_VERSION === '17.0.0', 'wave flow guard version 17.0.0');

const titleAssets = [
  'src/assets/title-v17/title-bg-desktop-v17.webp',
  'src/assets/title-v17/title-bg-mobile-v17.webp',
  'src/assets/title-v17/title-mascot-v17.webp'
];
check(titleAssets.every((path) => existsSync(resolve(root, path))), 'optimized desktop, mobile and mascot title assets exist');
check(titleAssets.every((path) => statSync(resolve(root, path)).size < 300 * 1024), 'runtime title assets remain below 300KB each');
check(titleAssets.every((path) => bytes(path).subarray(0, 4).toString('ascii') === 'RIFF' && bytes(path).subarray(8, 12).toString('ascii') === 'WEBP'), 'runtime title assets are WebP');
check(bytes('src/assets/title-v17/title-mascot-v17.webp').includes(Buffer.from('ALPH')) || bytes('src/assets/title-v17/title-mascot-v17.webp').includes(Buffer.from('VP8X')), 'mascot WebP retains alpha-capable container');

const titleBlock = html.slice(html.indexOf('<section id="title-screen"'), html.indexOf('<header id="hud"'));
check(titleBlock.includes('title-mascot-v17.webp') && titleBlock.includes('title-panel-v17') && titleBlock.includes('title-scene-v17'), 'title uses new mascot presentation');
check(style.includes('title-bg-desktop-v17.webp') && style.includes('title-bg-mobile-v17.webp') && style.includes('@media (max-width: 900px), (orientation: portrait)'), 'desktop and mobile title backgrounds are responsive');
check(html.includes('rel="preload"') && html.includes('title-bg-desktop-v17.webp') && html.includes('title-bg-mobile-v17.webp'), 'title artwork preloads by viewport');
check(!titleBlock.includes('PATCH') && !titleBlock.includes('UPDATE') && !titleBlock.includes('ENGINE'), 'first screen remains free of patch and engine information');

const waveSnapshot = Object.freeze({ state: 'playing', waveActive: true, currentWave: 4, maxWaves: 10, spawnRemaining: 4, waveSpawned: 2, enemyCount: 0, enemyCap: 20, postWaveQueueLength: 0, autoWaveCountdown: 0, modalVisible: false });
const spawnGuard = new WaveFlowGuard();
spawnGuard.beginWave(4, waveSnapshot);
check(spawnGuard.update(5.6, waveSnapshot)?.type === 'force-spawn', 'wave guard recovers stalled stage 4 spawning');
const rewardGuard = new WaveFlowGuard();
const rewardSnapshot = { ...waveSnapshot, state: 'blessing', waveActive: false, spawnRemaining: 0, modalVisible: false };
rewardGuard.beginWave(3, rewardSnapshot);
check(rewardGuard.update(.9, rewardSnapshot)?.type === 'restore-modal', 'wave guard restores hidden stage 3 reward modal');
const idleGuard = new WaveFlowGuard();
const idleSnapshot = { ...waveSnapshot, waveActive: false, currentWave: 4, spawnRemaining: 0, waveSpawned: 0, enemyCount: 0 };
idleGuard.beginWave(4, idleSnapshot);
check(idleGuard.update(12.1, idleSnapshot)?.type === 'resume-countdown', 'wave guard resumes stalled post-wave countdown');

check(main.includes("spawnEnemy({ forceType = '', emergency = false } = {})") && main.includes("forceType: 'imp', emergency: true"), 'enemy spawning has emergency fallback path');
check(main.includes('recordRuntimeError') && main.includes('runSafe') && main.includes("this.runSafe('wave'"), 'frame systems use runtime error isolation');
check(main.includes('blessing-modal-visibility-guard') && main.includes('relic-modal-visibility-guard'), 'stage 3 and 4 reward modals have visibility guards');
check(html.includes('id="blessing-recommend-btn"') && html.includes('id="relic-recommend-btn"'), 'reward screens expose continue recovery actions');
check(html.includes('id="wave-recovery"') && style.includes('.wave-recovery'), 'player-facing recovery indicator exists');
check(consoleSource.includes('WAVE FLOW') && (consoleSource.includes('MOON GATE REBORN v17') || consoleSource.includes('TEN-WAVE RELIABILITY v18')), 'production console exposes wave flow diagnostics');

check(['docs/MOON_GATE_REBORN_v17.0.0.md', 'docs/STAGE_STALL_AUDIT_v17.0.0.json', 'docs/TITLE_ASSET_OPTIMIZATION_v17.0.0.json', 'docs/TITLE_PRESENTATION_PREVIEW_v17.0.0.jpg', 'docs/PATCH_NOTES_v17.0.0.md', 'docs/PATCH_APPLY_v17.0.0.md', 'docs/NEXT_PATCH_LINEUP_v17.x.md'].every((path) => existsSync(resolve(root, path))), 'v17 operating, audit and preview documents exist');

if (failures) {
  console.error(`\nFAIL v17.0.0 Moon Gate Reborn contract ${failures}`);
  process.exit(1);
}
console.log('\nv17.0.0 Moon Gate Reborn contract verified');
