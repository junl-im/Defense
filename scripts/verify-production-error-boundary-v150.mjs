import { TransactionalPersistenceV149 } from '../src/runtime/transactional-persistence-v149.js';
import { AtomicSaveSnapshotV150 } from '../src/runtime/atomic-save-snapshot-v150.js';
import { ProductionErrorBoundaryV150 } from '../src/runtime/production-error-boundary-v150.js';

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
snapshots.commit({ profile: { safe: true, wave: 8 } }, 'safe-point');
storage.set('profile', JSON.stringify({ safe: false, wave: 99 }));
let presented = null;
const boundary = new ProductionErrorBoundaryV150({ snapshots, now: () => 1700000001000, onPresent: (value) => { presented = value; } });
const result = boundary.capture(new Error('/secret/source/main.js failed at https://internal.invalid'), { source: 'window-error', state: 'playing', wave: 9 });
assert(JSON.parse(storage.get('profile')).wave === 8, 'error boundary did not restore the safe checkpoint');
assert(result.user.title.includes('안전한 저장 지점') && !JSON.stringify(result.user).includes('/secret/'), 'user copy exposed developer details');
assert(result.developer.message.includes('/secret/source/main.js'), 'bounded developer diagnostics were not retained');
assert(presented?.id === 'DD-PRODUCTION-ERROR-BOUNDARY-V150', 'error boundary presenter was not invoked');
console.log('PASS v1.0.50 production error boundary preserves a safe checkpoint and hides developer details');
