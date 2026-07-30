import { TransactionalPersistenceV149 } from '../src/runtime/transactional-persistence-v149.js';
import { AtomicSaveSnapshotV150 } from '../src/runtime/atomic-save-snapshot-v150.js';
import { PersistentRewardOrchestratorV150, META_PROGRESS_STORAGE_KEY_V150, LOCAL_SCORE_STORAGE_KEY_V150 } from '../src/runtime/persistent-reward-orchestrator-v150.js';
import { createDefaultHeroMastery, HERO_MASTERY_STORAGE_KEY } from '../src/hero-mastery.js';
import { createDefaultEquipmentState, EQUIPMENT_STORAGE_KEY } from '../src/equipment-system.js';
import { CODEX_STORAGE_KEY } from '../src/codex-progression.js';

class MemoryStorage {
  constructor(seed = {}) { this.map = new Map(Object.entries(seed)); this.failKey = ''; }
  get(key, fallback = null) { return this.map.has(key) ? this.map.get(key) : fallback; }
  getJSON(key, fallback = null) { const raw = this.get(key, null); if (raw === null || raw === '') return fallback; try { return JSON.parse(raw); } catch { return fallback; } }
  set(key, value) { if (key === this.failKey) return { ok: false, persisted: false, fallback: false }; this.map.set(key, String(value)); return { ok: true, persisted: true, fallback: false }; }
  setJSON(key, value) { return this.set(key, JSON.stringify(value)); }
  remove(key) { const existed = this.map.delete(key); return { ok: true, persisted: existed, fallback: false }; }
  get diagnostics() { return { entries: this.map.size }; }
}
const assert = (value, message) => { if (!value) throw new Error(message); };

const storage = new MemoryStorage();
const persistence = new TransactionalPersistenceV149({ storage, schedule: () => {}, now: () => 1700000000000 });
const snapshots = new AtomicSaveSnapshotV150({ persistence, now: () => 1700000000000 });
const rewards = new PersistentRewardOrchestratorV150({ persistence, snapshots, now: () => 1700000000000 });
const heroMastery = createDefaultHeroMastery();
const equipmentState = createDefaultEquipmentState();
const result = rewards.awardRun({
  runToken: 'run-1', won: true, currentWave: 10, activeRunMode: { id: 'eclipse' },
  runStats: { trialsCompleted: 2, relicsChosen: 3 }, kills: 120, maxRank: 5,
  metaProgress: { shards: 5, traits: {} }, heroMastery, equipmentState,
  codexProgress: { version: 1, entries: {}, loot: {} }, selectedHeroClassId: 'warrior', random: () => 0
});
assert(result.ok && result.shardReward > 0 && result.metaProgress.shards > 5, 'run reward was not awarded');
assert(storage.getJSON(META_PROGRESS_STORAGE_KEY_V150).shards === result.metaProgress.shards, 'meta reward was not atomically persisted');
assert(storage.getJSON(HERO_MASTERY_STORAGE_KEY).warrior.runs === 1, 'mastery reward was not persisted');
assert(storage.getJSON(EQUIPMENT_STORAGE_KEY).drops === 1, 'equipment reward was not persisted');
assert(storage.getJSON(CODEX_STORAGE_KEY).version === 1, 'codex state was not included in the snapshot');
const duplicate = rewards.awardRun({ ...result, runToken: 'run-1', selectedHeroClassId: 'warrior' });
assert(duplicate.duplicate && storage.getJSON(HERO_MASTERY_STORAGE_KEY).warrior.runs === 1, 'duplicate run token awarded twice');
const score = await rewards.submitScore({ name: '수호자', score: 12345, wave: 10, kills: 120 });
assert(score.ok && score.localSaved && storage.getJSON(LOCAL_SCORE_STORAGE_KEY_V150)[0].score === 12345, 'local score snapshot failed');
const online = new PersistentRewardOrchestratorV150({
  persistence, snapshots, now: () => 1700000000000, isOnlineEnabled: () => true,
  submitOnlineScore: async () => { throw new Error('offline'); }, loadOnlineScores: async () => []
});
const fallback = await online.submitScore({ name: '오프라인', score: 50 });
assert(fallback.ok && fallback.online === 'fallback-local', 'online failure must preserve local score');
console.log('PASS v1.0.50 persistent run rewards and score submission are extracted and atomically committed');
