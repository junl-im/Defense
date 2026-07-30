import fs from 'node:fs';
import path from 'node:path';
import { SafeStorageV148 } from '../src/runtime/safe-storage-v148.js';
import { RuntimeHealthAssuranceV148, sanitizeRuntimeMessageV148 } from '../src/runtime/runtime-health-assurance-v148.js';
import { FrameBudgetScheduler } from '../src/engine/frame-budget-scheduler.js';

const root = path.resolve(import.meta.dirname, '..');
const failures = [];
const check = (value, label) => { if (!value) failures.push(label); };

const blocked = {
  getItem() { const error = new Error('blocked read'); error.name = 'SecurityError'; throw error; },
  setItem() { const error = new Error('quota full'); error.name = 'QuotaExceededError'; throw error; },
  removeItem() { const error = new Error('blocked remove'); error.name = 'SecurityError'; throw error; }
};
const safe = new SafeStorageV148({ storage: blocked, maxFallbackEntries: 8 });
check(safe.set('score', '100').fallback === true, 'blocked storage falls back on write');
check(safe.get('score') === '100', 'fallback value remains readable');
check(safe.setJSON('profile', { level: 7 }).ok === true, 'fallback JSON write succeeds');
check(safe.getJSON('profile', {}).level === 7, 'fallback JSON round-trip succeeds');
for (let index = 0; index < 12; index += 1) safe.set(`key-${index}`, String(index));
check(safe.diagnostics.fallbackEntries <= 8 && safe.diagnostics.evictions >= 4, 'fallback storage is bounded');
check(safe.diagnostics.storageFailures >= 3, 'storage failures are recorded');

const memory = new Map([['bad-json', '{broken']]);
const memoryStorage = {
  getItem(key) { return memory.has(key) ? memory.get(key) : null; },
  setItem(key, value) { memory.set(key, String(value)); },
  removeItem(key) { memory.delete(key); }
};
const parseSafe = new SafeStorageV148({ storage: memoryStorage });
check(parseSafe.getJSON('bad-json', { recovered: true }).recovered === true, 'malformed JSON returns fallback');
check(parseSafe.diagnostics.parseFailures === 1, 'malformed JSON is diagnosed');

const rawMessage = 'failed https://example.com/private?q=1 /home/runner/work/Defense/secret user@example.com abcdef0123456789abcdef0123456789';
const sanitized = sanitizeRuntimeMessageV148(rawMessage);
check(!sanitized.includes('example.com') && !sanitized.includes('/home/runner') && !sanitized.includes('user@example.com'), 'runtime message strips URL, path and email');
check(sanitized.includes('[url]') && sanitized.includes('[path]') && sanitized.includes('[email]'), 'runtime message leaves safe redaction markers');

const health = new RuntimeHealthAssuranceV148({ maxErrors: 12, maxFingerprints: 16 });
const first = health.capture(rawMessage, { source: 'test', state: 'playing', wave: 9, now: 1000 });
const duplicate = health.capture(rawMessage, { source: 'test', state: 'playing', wave: 9, now: 1001 });
check(first.duplicate === false && duplicate.duplicate === true, 'runtime errors are deduplicated');
for (let index = 0; index < 40; index += 1) health.capture(`unique-${index}`, { source: 'loop', now: 2000 + index });
check(health.diagnostics.retainedErrors <= 12, 'runtime error history is bounded');
check(health.diagnostics.retainedFingerprints <= 16, 'runtime error fingerprints are bounded');
check(health.noteFrame({ hidden: true, dt: 1.25 }) === true, 'hidden frame requests suspension');
check(health.noteFrame({ hidden: false, dt: 0.016 }) === false && health.diagnostics.resumeCount === 1, 'visible frame records resume');

const scheduler = new FrameBudgetScheduler();
let runs = 0;
for (let frame = 0; frame < 120; frame += 1) {
  scheduler.tick(1 / 60);
  if (scheduler.shouldRun('ten-hz', 10)) runs += 1;
}
check(runs >= 19 && runs <= 20, `frame scheduler cadence remains stable (${runs})`);
check(scheduler.diagnostics.channels['ten-hz'].runs === runs, 'frame scheduler diagnostics match cadence');

const main = fs.readFileSync(path.join(root, 'src/main.js'), 'utf8');
const hiddenGuard = main.indexOf('this.runtimeHealthV148.noteFrame({ hidden, dt: rawDt })');
const heavyUpdate = main.indexOf("this.runSafe('world-effects'");
check(main.includes("createSafeStorageV148") && main.includes('RuntimeHealthAssuranceV148'), 'main integrates v148 resilience modules');
check(!main.includes('runtimeErrorKeys'), 'unbounded runtime error key set removed');
check(!/localStorage\.(?:getItem|setItem|removeItem)/.test(main), 'main has no direct localStorage access');
check(hiddenGuard >= 0 && heavyUpdate > hiddenGuard, 'hidden-page suspension occurs before heavy frame updates');
const rewardsV150 = fs.readFileSync(path.join(root, 'src/runtime/persistent-reward-orchestrator-v150.js'), 'utf8');
check(main.includes('this.persistentRewardsV150.submitScore(entry)') && rewardsV150.includes("this.snapshots.commit({ [LOCAL_SCORE_STORAGE_KEY_V150]: local }, 'score-save')"), 'score persistence uses safe transactional snapshots');

if (failures.length) {
  failures.forEach((failure) => console.error(`FAIL ${failure}`));
  process.exit(1);
}
const evidenceDir = path.join(root, 'logs/qa/v148');
fs.mkdirSync(evidenceDir, { recursive: true });
fs.writeFileSync(path.join(evidenceDir, 'runtime-resilience-summary.json'), `${JSON.stringify({
  id: 'DD-RUNTIME-RESILIENCE-EVIDENCE-V148',
  releaseVersion: '1.0.48',
  passed: true,
  cadenceRuns: runs,
  safeStorage: safe.diagnostics,
  runtimeHealth: health.diagnostics
}, null, 2)}\n`);
console.log(`PASS v1.0.48 storage denial, bounded errors, privacy redaction, background suspension, and frame cadence resilience (${runs} cadence runs)`);
