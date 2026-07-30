const SNAPSHOT_ID = 'DD-ATOMIC-SAVE-SNAPSHOT-V150';
export const ATOMIC_SAVE_SCHEMA_VERSION_V150 = 150;
export const ATOMIC_SAVE_STORAGE_KEY_V150 = 'dokkaebi-atomic-save-snapshot-v150';

function normalizeKey(key) {
  const value = String(key ?? '').trim();
  if (!value) throw new TypeError('snapshot key must be a non-empty string');
  return value;
}

function stableHash(input = '') {
  let hash = 2166136261;
  for (const char of String(input)) {
    hash ^= char.codePointAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

function serializeValue(value) {
  return JSON.stringify(value);
}

function normalizeValues(entries = {}) {
  const values = {};
  for (const [rawKey, value] of Object.entries(entries || {})) {
    const key = normalizeKey(rawKey);
    const serialized = serializeValue(value);
    values[key] = Object.freeze({ encoding: 'json', value: serialized });
  }
  if (!Object.keys(values).length) throw new TypeError('atomic snapshot requires at least one value');
  return Object.freeze(values);
}

function checksum(values = {}) {
  const canonical = Object.keys(values).sort().map((key) => `${key}\0${values[key]?.encoding || ''}\0${values[key]?.value || ''}`).join('\n');
  return stableHash(canonical);
}

function sanitizeSlot(slot) {
  if (!slot || typeof slot !== 'object' || !slot.values || typeof slot.values !== 'object') return null;
  const values = {};
  for (const [rawKey, entry] of Object.entries(slot.values)) {
    const key = normalizeKey(rawKey);
    if (!entry || entry.encoding !== 'json' || typeof entry.value !== 'string') return null;
    values[key] = Object.freeze({ encoding: 'json', value: entry.value });
  }
  if (!Object.keys(values).length || checksum(values) !== slot.checksum) return null;
  return Object.freeze({
    id: String(slot.id || ''),
    createdAt: String(slot.createdAt || ''),
    reason: String(slot.reason || ''),
    checksum: slot.checksum,
    values: Object.freeze(values)
  });
}

function freezeResult(result = {}) {
  return Object.freeze({ ok: result.ok !== false, ...result });
}

export class AtomicSaveSnapshotV150 {
  constructor({ persistence, storageKey = ATOMIC_SAVE_STORAGE_KEY_V150, now = Date.now, maxRollbackSlots = 2, onError = null } = {}) {
    if (!persistence || typeof persistence.getJSON !== 'function' || typeof persistence.set !== 'function' || typeof persistence.checkpoint !== 'function') {
      throw new TypeError('AtomicSaveSnapshotV150 requires transactional persistence');
    }
    this.persistence = persistence;
    this.storageKey = normalizeKey(storageKey);
    this.now = typeof now === 'function' ? now : Date.now;
    this.maxRollbackSlots = Math.max(1, Math.min(4, Number(maxRollbackSlots) || 2));
    this.onError = typeof onError === 'function' ? onError : null;
    this.stats = {
      commits: 0,
      failedCommits: 0,
      reconciliations: 0,
      restoredValues: 0,
      rollbacks: 0,
      invalidSnapshots: 0,
      lastReason: '',
      lastSnapshotId: '',
      lastError: null
    };
  }

  noteError(operation, error) {
    const entry = Object.freeze({
      operation,
      name: error?.name || 'SnapshotError',
      message: String(error?.message || error || 'unknown snapshot error').slice(0, 180)
    });
    this.stats.lastError = entry;
    this.onError?.(entry, error);
    return entry;
  }

  readEnvelope() {
    const raw = this.persistence.getJSON(this.storageKey, null);
    if (!raw) return null;
    if (raw.id !== SNAPSHOT_ID || raw.schemaVersion !== ATOMIC_SAVE_SCHEMA_VERSION_V150) {
      this.stats.invalidSnapshots += 1;
      return null;
    }
    const active = sanitizeSlot(raw.active);
    if (!active) {
      this.stats.invalidSnapshots += 1;
      return null;
    }
    const rollbackSlots = (Array.isArray(raw.rollbackSlots) ? raw.rollbackSlots : []).map(sanitizeSlot).filter(Boolean).slice(0, this.maxRollbackSlots);
    return Object.freeze({
      id: SNAPSHOT_ID,
      schemaVersion: ATOMIC_SAVE_SCHEMA_VERSION_V150,
      generation: Math.max(1, Math.floor(Number(raw.generation) || 1)),
      committedAt: String(raw.committedAt || ''),
      active,
      rollbackSlots: Object.freeze(rollbackSlots)
    });
  }

  createSlot(values, reason, generation) {
    const at = new Date(Number(this.now()) || Date.now()).toISOString();
    return Object.freeze({
      id: `v150-${generation}-${stableHash(`${at}:${reason}:${checksum(values)}`)}`,
      createdAt: at,
      reason: String(reason || 'manual').slice(0, 80),
      checksum: checksum(values),
      values
    });
  }

  applyEnvelope(envelope, reason) {
    for (const [key, entry] of Object.entries(envelope.active.values)) this.persistence.set(key, entry.value);
    this.persistence.setJSON(this.storageKey, envelope);
    const result = this.persistence.checkpoint(`atomic-save:${String(reason || 'manual').slice(0, 60)}`);
    if (!result.ok) throw new Error(`atomic snapshot transaction failed: ${reason}`);
    this.stats.lastReason = String(reason || '');
    this.stats.lastSnapshotId = envelope.active.id;
    return result;
  }

  commit(entries, reason = 'manual') {
    try {
      const incoming = normalizeValues(entries);
      const previous = this.readEnvelope();
      const values = Object.freeze({ ...(previous?.active?.values || {}), ...incoming });
      const generation = (previous?.generation || 0) + 1;
      const active = this.createSlot(values, reason, generation);
      const rollbackSlots = [previous?.active, ...(previous?.rollbackSlots || [])].filter(Boolean).slice(0, this.maxRollbackSlots);
      const envelope = Object.freeze({
        id: SNAPSHOT_ID,
        schemaVersion: ATOMIC_SAVE_SCHEMA_VERSION_V150,
        generation,
        committedAt: active.createdAt,
        active,
        rollbackSlots: Object.freeze(rollbackSlots)
      });
      const transaction = this.applyEnvelope(envelope, reason);
      this.stats.commits += 1;
      return freezeResult({ transactionId: transaction.transactionId || null, generation, snapshotId: active.id, keys: Object.keys(values), rollbackSlots: rollbackSlots.length });
    } catch (error) {
      this.stats.failedCommits += 1;
      this.noteError('commit', error);
      return freezeResult({ ok: false, generation: this.readEnvelope()?.generation || 0, keys: [] });
    }
  }

  reconcile(reason = 'boot-reconcile') {
    try {
      const envelope = this.readEnvelope();
      if (!envelope) return freezeResult({ restored: false, values: 0, reason: 'no-valid-snapshot' });
      let restored = 0;
      for (const [key, entry] of Object.entries(envelope.active.values)) {
        if (this.persistence.get(key, null) === entry.value) continue;
        this.persistence.set(key, entry.value);
        restored += 1;
      }
      if (restored) {
        const transaction = this.persistence.checkpoint(`atomic-save:${reason}`);
        if (!transaction.ok) throw new Error('atomic snapshot reconciliation failed');
      }
      this.stats.reconciliations += 1;
      this.stats.restoredValues += restored;
      this.stats.lastSnapshotId = envelope.active.id;
      return freezeResult({ restored: restored > 0, values: restored, snapshotId: envelope.active.id, generation: envelope.generation });
    } catch (error) {
      this.noteError('reconcile', error);
      return freezeResult({ ok: false, restored: false, values: 0 });
    }
  }

  restoreLastRollback(reason = 'manual-rollback') {
    try {
      const current = this.readEnvelope();
      const rollback = current?.rollbackSlots?.[0];
      if (!current || !rollback) return freezeResult({ restored: false, values: 0, reason: 'no-rollback-slot' });
      const remaining = current.rollbackSlots.slice(1);
      const envelope = Object.freeze({
        id: SNAPSHOT_ID,
        schemaVersion: ATOMIC_SAVE_SCHEMA_VERSION_V150,
        generation: current.generation + 1,
        committedAt: new Date(Number(this.now()) || Date.now()).toISOString(),
        active: rollback,
        rollbackSlots: Object.freeze([current.active, ...remaining].slice(0, this.maxRollbackSlots))
      });
      const transaction = this.applyEnvelope(envelope, reason);
      this.stats.rollbacks += 1;
      return freezeResult({ restored: true, values: Object.keys(rollback.values).length, snapshotId: rollback.id, transactionId: transaction.transactionId || null });
    } catch (error) {
      this.noteError('rollback', error);
      return freezeResult({ ok: false, restored: false, values: 0 });
    }
  }

  get diagnostics() {
    const envelope = this.readEnvelope();
    return Object.freeze({
      id: SNAPSHOT_ID,
      schemaVersion: ATOMIC_SAVE_SCHEMA_VERSION_V150,
      storageKey: this.storageKey,
      generation: envelope?.generation || 0,
      activeSnapshotId: envelope?.active?.id || '',
      rollbackSlots: envelope?.rollbackSlots?.length || 0,
      ...this.stats
    });
  }
}
