import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { ENGINE_VERSION } from '../src/engine/engine-config.js';
import { SAVE_SCHEMA_VERSION } from '../src/runtime/save-schema.js';
import WaveReliabilityDirector, { WAVE_RELIABILITY_VERSION, WAVE_CHECKPOINT_KEY } from '../src/runtime/wave-reliability-director.js';
import { simulateTenWaveReliability } from '../src/runtime/ten-wave-reliability-simulation.js';

const root = resolve(import.meta.dirname, '..');
const read = (path) => readFileSync(resolve(root, path), 'utf8');
const pkg = JSON.parse(read('package.json'));
const main = read('src/main.js');
const html = read('index.html');
const consoleSource = read('src/production-console.js');
const saveSchema = read('src/runtime/save-schema.js');
let failures = 0;
const check = (condition, message) => condition ? console.log(`PASS ${message}`) : (failures += 1, console.error(`FAIL ${message}`));

check(Number(pkg.version.split('.')[0]) >= 18, 'package version remains v18 or newer');
check(/const GAME_VERSION = '(?:18|19|20)\.0\.0'/.test(main), 'runtime game version remains v18 or newer');
check(Number(ENGINE_VERSION.split('.')[0]) >= 15, 'engine version remains 15.0.0 or newer');
check(SAVE_SCHEMA_VERSION >= 16, 'save schema version remains 16 or newer');
check(WAVE_RELIABILITY_VERSION === '18.0.0', 'wave reliability version 18.0.0');
check(saveSchema.includes(WAVE_CHECKPOINT_KEY), 'wave checkpoint is included in safe save backup keys');

const storage = new Map();
const adapter = { getItem: (key) => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, String(value)) };
const director = new WaveReliabilityDirector({ enemyStallSeconds: 1, rewardReminderSeconds: .5, rewardQueueStallSeconds: .4, firstWaveStallSeconds: .4, checkpointSeconds: .1, storage: adapter });
const base = { state: 'playing', waveActive: true, currentWave: 8, maxWaves: 10, spawnRemaining: 0, waveSpawned: 20, enemyCount: 2, enemyHealthSignature: 2000, enemyRadiusSignature: 260, invalidEnemyCount: 0, postWaveQueueLength: 0, autoWaveCountdown: 0, modalVisible: false, coreHp: 80, gold: 120, score: 5000 };
director.resetRun({ seed: 'verify-v18' });
director.beginWave(8, base);
check(director.update(1.1, base)?.type === 'unstick-enemies', 'enemy progress stall requests position repair');
director.noteRecovery('unstick-enemies', base);
const reward = { ...base, state: 'relic', waveActive: false, enemyCount: 0, enemyHealthSignature: 0, enemyRadiusSignature: 0, modalVisible: true };
director.noteProgress(reward, 'reward-open');
check(director.update(.6, reward)?.type === 'reward-reminder', 'long reward selection shows a non-destructive reminder');
const queue = { ...reward, state: 'playing', modalVisible: false, postWaveQueueLength: 2 };
director.noteProgress(queue, 'queue-wait');
check(director.update(.5, queue)?.type === 'resume-reward-queue', 'stalled post-wave reward queue is resumed');
const hidden = director.noteVisibility(true, queue, 1000);
const visible = director.noteVisibility(false, { ...queue, state: 'paused' }, 5100);
check(hidden.autoPaused && visible.autoPaused && Math.round(visible.durationSeconds) === 4, 'background pause duration and automatic resume intent are recorded');
check(storage.has(WAVE_CHECKPOINT_KEY), 'lightweight wave checkpoint is persisted');

const simulation = simulateTenWaveReliability();
check(simulation.passed && simulation.wavesCompleted === 10, 'deterministic 10-wave simulation completes');
check(simulation.timeline.length === 10, '10-wave simulation records all wave timelines');
check(simulation.recoveries.some((entry) => entry.type === 'restore-modal'), 'simulation covers hidden reward modal recovery');
check(simulation.recoveries.some((entry) => entry.type === 'unstick-enemies'), 'simulation covers invalid or stalled enemy recovery');
check(simulation.recoveries.some((entry) => entry.type === 'background-resume'), 'simulation covers background resume');

check(main.includes('this.waveReliability = new WaveReliabilityDirector()'), 'runtime instantiates reliability director');
check(main.includes('handleVisibilityChange') && main.includes('autoPausedByVisibility'), 'runtime automatically pauses and resumes after background transitions');
check(main.includes('unstickWaveEnemies') && main.includes("action.type === 'unstick-enemies'"), 'runtime repairs stalled enemy paths');
check(main.includes("action.type === 'resume-reward-queue'") && main.includes("action.type === 'resume-first-wave'"), 'runtime repairs reward queue and initial wave timers');
check(main.includes('waveReliability: this.waveReliability?.report'), 'diagnostic export includes full reliability report');
check(html.includes('성능·웨이브 진단 JSON 저장'), 'pause menu exposes combined diagnostic export');
check(consoleSource.includes('RUN RELIABILITY') && consoleSource.includes('TEN-WAVE RELIABILITY v18'), 'production console exposes reliability diagnostics');

const docs = [
  'docs/TEN_WAVE_RELIABILITY_v18.0.0.md',
  'docs/TEN_WAVE_RELIABILITY_SIMULATION_v18.0.0.json',
  'docs/PATCH_NOTES_v18.0.0.md',
  'docs/PATCH_APPLY_v18.0.0.md',
  'docs/NEXT_PATCH_LINEUP_v18.x.md'
];
check(docs.every((path) => existsSync(resolve(root, path))), 'v18 operating, simulation and patch documents exist');

if (failures) {
  console.error(`\nFAIL v18.0.0 Ten-Wave Reliability contract ${failures}`);
  process.exit(1);
}
console.log('\nv18.0.0 Ten-Wave Reliability contract verified');
