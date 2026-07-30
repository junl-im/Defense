import { TransactionalPersistenceV149 } from '../src/runtime/transactional-persistence-v149.js';
import { AtomicSaveSnapshotV150, ATOMIC_SAVE_SCHEMA_VERSION_V150, ATOMIC_SAVE_STORAGE_KEY_V150 } from '../src/runtime/atomic-save-snapshot-v150.js';

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
const first = snapshots.commit({ meta: { shards: 10 }, mastery: { hero: { level: 1 } } }, 'initial-safe-point');
assert(first.ok && first.generation === 1 && first.rollbackSlots === 0, 'first snapshot commit failed');
const second = snapshots.commit({ meta: { shards: 25 } }, 'reward-update');
assert(second.ok && second.generation === 2 && second.rollbackSlots === 1, 'second snapshot commit failed');
const envelope = storage.getJSON(ATOMIC_SAVE_STORAGE_KEY_V150);
assert(envelope.schemaVersion === ATOMIC_SAVE_SCHEMA_VERSION_V150, 'snapshot schema mismatch');
assert(JSON.parse(envelope.active.values.meta.value).shards === 25, 'active meta was not updated');
assert(JSON.parse(envelope.active.values.mastery.value).hero.level === 1, 'complete known save set was not carried forward');
storage.set('meta', JSON.stringify({ shards: 999 }));
const reconciled = snapshots.reconcile();
assert(reconciled.ok && reconciled.restored && JSON.parse(storage.get('meta')).shards === 25, 'active snapshot reconciliation failed');
const rollback = snapshots.restoreLastRollback();
assert(rollback.ok && rollback.restored && JSON.parse(storage.get('meta')).shards === 10, 'rollback slot did not restore prior generation');
const corrupted = storage.getJSON(ATOMIC_SAVE_STORAGE_KEY_V150);
corrupted.active.checksum = '00000000';
storage.setJSON(ATOMIC_SAVE_STORAGE_KEY_V150, corrupted);
const invalid = snapshots.reconcile();
assert(invalid.ok && !invalid.restored && invalid.reason === 'no-valid-snapshot', 'corrupted snapshot must not be trusted');
assert(snapshots.diagnostics.invalidSnapshots >= 1, 'invalid snapshot diagnostics missing');
console.log('PASS v1.0.50 atomic multi-key snapshots, schema, reconciliation, and rollback slots');
