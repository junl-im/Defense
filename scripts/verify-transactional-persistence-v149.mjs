import { TransactionalPersistenceV149 } from '../src/runtime/transactional-persistence-v149.js';

class MemoryStorage {
  constructor(seed = {}) { this.map = new Map(Object.entries(seed)); this.failKey = ''; }
  get(key, fallback = null) { return this.map.has(key) ? this.map.get(key) : fallback; }
  getJSON(key, fallback = null) { const raw = this.get(key, null); if (raw === null) return fallback; try { return JSON.parse(raw); } catch { return fallback; } }
  set(key, value) { if (key === this.failKey) return { ok: false, persisted: false, fallback: false }; this.map.set(key, String(value)); return { ok: true, persisted: true, fallback: false }; }
  setJSON(key, value) { return this.set(key, JSON.stringify(value)); }
  remove(key) { const existed = this.map.delete(key); return { ok: existed, persisted: existed, fallback: false }; }
  get diagnostics() { return { entries: this.map.size }; }
}

const assert = (value, message) => { if (!value) throw new Error(message); };
const scheduled = [];
const storage = new MemoryStorage();
const persistence = new TransactionalPersistenceV149({ storage, now: () => 1700000000000, schedule: (fn) => scheduled.push(fn) });
persistence.set('profile', 'one');
persistence.set('profile', 'two');
persistence.setJSON('settings', { volume: 0.5 });
assert(persistence.get('profile') === 'two', 'pending reads must use the latest queued value');
assert(persistence.getJSON('settings').volume === 0.5, 'pending JSON reads must be available before flush');
const flushed = persistence.flushSync('pagehide-bfcache');
assert(flushed.ok && flushed.committed === 2, 'coalesced transaction must commit two operations');
assert(storage.get('profile') === 'two', 'latest coalesced value was not persisted');
assert(storage.getJSON('settings').volume === 0.5, 'JSON value was not persisted');
assert(storage.get(persistence.journalKey, null) === null, 'journal must be removed after commit');
assert(persistence.diagnostics.coalesced === 1 && persistence.diagnostics.lifecycleFlushes === 1, 'transaction diagnostics mismatch');

const journal = {
  id: 'DD-TRANSACTIONAL-PERSISTENCE-V149', transactionId: 'interrupted-1', reason: 'beforeunload', createdAt: new Date().toISOString(),
  operations: [{ type: 'set', key: 'resume', value: 'ready' }, { type: 'remove', key: 'obsolete', value: null }]
};
const recoveryStorage = new MemoryStorage({
  'dokkaebi-persistence-journal-v149': JSON.stringify(journal),
  obsolete: 'legacy'
});
const recovery = new TransactionalPersistenceV149({ storage: recoveryStorage, schedule: () => {} });
const recovered = recovery.recover();
assert(recovered.ok && recovered.recovered && recoveryStorage.get('resume') === 'ready', 'journal recovery did not replay set');
assert(recoveryStorage.get('obsolete', null) === null, 'journal recovery did not replay remove');
assert(recovery.diagnostics.recoveredJournals === 1, 'journal recovery count mismatch');

const failureStorage = new MemoryStorage();
failureStorage.failKey = 'blocked';
const failing = new TransactionalPersistenceV149({ storage: failureStorage, schedule: () => {} });
failing.set('blocked', 'value');
const failure = failing.flushSync('manual');
assert(!failure.ok && failing.diagnostics.pendingOperations === 1 && failing.diagnostics.failedFlushes === 1, 'failed transaction must stay pending');
assert(failureStorage.get(failing.journalKey, null) !== null, 'failed transaction journal must remain for replay');
console.log('PASS v1.0.49 transactional persistence queue, coalescing, lifecycle flush, recovery, and failure journal');
