const DEFAULT_JOURNAL_KEY = 'dokkaebi-persistence-journal-v149';

function normalizeKey(key) {
  const value = String(key ?? '').trim();
  if (!value) throw new TypeError('persistence key must be a non-empty string');
  return value;
}

function freezeResult(result = {}) {
  return Object.freeze({ ok: result.ok !== false, ...result });
}

function safeNow(now) {
  const value = Number(now?.());
  return Number.isFinite(value) ? value : Date.now();
}

export class TransactionalPersistenceV149 {
  constructor({ storage, journalKey = DEFAULT_JOURNAL_KEY, now = Date.now, schedule = queueMicrotask, onError = null } = {}) {
    if (!storage || typeof storage.get !== 'function' || typeof storage.set !== 'function') {
      throw new TypeError('TransactionalPersistenceV149 requires a storage adapter');
    }
    this.storage = storage;
    this.journalKey = normalizeKey(journalKey);
    this.now = typeof now === 'function' ? now : Date.now;
    this.schedule = typeof schedule === 'function' ? schedule : queueMicrotask;
    this.onError = typeof onError === 'function' ? onError : null;
    this.pending = new Map();
    this.sequence = 0;
    this.flushScheduled = false;
    this.flushing = false;
    this.stats = {
      queued: 0,
      coalesced: 0,
      flushes: 0,
      recoveredJournals: 0,
      committedOperations: 0,
      failedFlushes: 0,
      lifecycleFlushes: 0,
      lastFlushReason: null,
      lastTransactionId: null,
      lastError: null
    };
  }

  queue(operation) {
    const key = normalizeKey(operation.key);
    const previous = this.pending.get(key);
    if (previous) this.stats.coalesced += 1;
    const entry = Object.freeze({
      id: ++this.sequence,
      type: operation.type,
      key,
      value: operation.value ?? null,
      queuedAt: new Date(safeNow(this.now)).toISOString()
    });
    this.pending.delete(key);
    this.pending.set(key, entry);
    this.stats.queued += 1;
    this.requestFlush();
    return freezeResult({ queued: true, persisted: false, fallback: false, operationId: entry.id });
  }

  requestFlush() {
    if (this.flushScheduled || this.flushing) return;
    this.flushScheduled = true;
    this.schedule(() => {
      this.flushScheduled = false;
      this.flushSync('scheduled');
    });
  }

  get(key, fallbackValue = null) {
    const normalized = normalizeKey(key);
    const pending = this.pending.get(normalized);
    if (pending?.type === 'remove') return fallbackValue;
    if (pending?.type === 'set') return pending.value;
    return this.storage.get(normalized, fallbackValue);
  }

  getJSON(key, fallbackValue = null) {
    const raw = this.get(key, null);
    if (raw === null || raw === '') return fallbackValue;
    try { return JSON.parse(raw); } catch { return fallbackValue; }
  }

  set(key, value) {
    return this.queue({ type: 'set', key, value: String(value ?? '') });
  }

  setJSON(key, value) {
    try {
      return this.set(key, JSON.stringify(value));
    } catch (error) {
      this.noteError('stringify', key, error);
      return freezeResult({ ok: false, queued: false, persisted: false, fallback: false });
    }
  }

  remove(key) {
    return this.queue({ type: 'remove', key });
  }

  noteError(operation, key, error) {
    const entry = Object.freeze({
      operation,
      key: String(key || ''),
      name: error?.name || 'PersistenceError',
      message: String(error?.message || error || 'unknown persistence error').slice(0, 180)
    });
    this.stats.lastError = entry;
    this.onError?.(entry, error);
    return entry;
  }

  applyOperation(operation) {
    if (operation.type === 'remove') return this.storage.remove(operation.key);
    return this.storage.set(operation.key, operation.value);
  }

  flushSync(reason = 'manual') {
    if (this.flushing) return freezeResult({ ok: false, skipped: true, reason: 'already-flushing', pending: this.pending.size });
    if (!this.pending.size) return freezeResult({ ok: true, skipped: true, reason: 'empty', pending: 0 });
    this.flushing = true;
    const operations = [...this.pending.values()];
    const transactionId = `v149-${safeNow(this.now)}-${operations.at(-1)?.id || 0}`;
    const journal = Object.freeze({
      id: 'DD-TRANSACTIONAL-PERSISTENCE-V149',
      transactionId,
      reason: String(reason || 'manual').slice(0, 80),
      createdAt: new Date(safeNow(this.now)).toISOString(),
      operations: operations.map(({ type, key, value }) => ({ type, key, value }))
    });
    try {
      const journalResult = this.storage.setJSON?.(this.journalKey, journal) ?? this.storage.set(this.journalKey, JSON.stringify(journal));
      if (journalResult?.ok === false) throw new Error('persistence journal write failed');
      for (const operation of operations) {
        const result = this.applyOperation(operation);
        if (result?.ok === false) throw new Error(`persistence operation failed: ${operation.type}:${operation.key}`);
      }
      const clearResult = this.storage.remove(this.journalKey);
      if (clearResult?.ok === false && clearResult?.persisted === false && clearResult?.fallback === false) throw new Error('persistence journal cleanup failed');
      for (const operation of operations) {
        if (this.pending.get(operation.key)?.id === operation.id) this.pending.delete(operation.key);
      }
      this.stats.flushes += 1;
      this.stats.committedOperations += operations.length;
      this.stats.lastFlushReason = journal.reason;
      this.stats.lastTransactionId = transactionId;
      if (/pagehide|beforeunload|visibility|service-worker|finish-run/.test(journal.reason)) this.stats.lifecycleFlushes += 1;
      return freezeResult({ transactionId, committed: operations.length, pending: this.pending.size, reason: journal.reason });
    } catch (error) {
      this.stats.failedFlushes += 1;
      this.noteError('flush', transactionId, error);
      return freezeResult({ ok: false, transactionId, committed: 0, pending: this.pending.size, reason: String(reason || 'manual') });
    } finally {
      this.flushing = false;
    }
  }

  recover() {
    const journal = this.storage.getJSON?.(this.journalKey, null);
    if (!journal || journal.id !== 'DD-TRANSACTIONAL-PERSISTENCE-V149' || !Array.isArray(journal.operations)) {
      return freezeResult({ recovered: false, operations: 0 });
    }
    for (const operation of journal.operations) {
      if (!operation || !['set', 'remove'].includes(operation.type)) continue;
      this.queue({ type: operation.type, key: operation.key, value: operation.value });
    }
    this.stats.recoveredJournals += 1;
    const result = this.flushSync('journal-recovery');
    return freezeResult({ ...result, recovered: result.ok, operations: journal.operations.length, sourceTransactionId: journal.transactionId || null });
  }

  checkpoint(reason = 'checkpoint') {
    return this.flushSync(reason);
  }

  get diagnostics() {
    return Object.freeze({
      id: 'DD-TRANSACTIONAL-PERSISTENCE-V149',
      journalKey: this.journalKey,
      pendingOperations: this.pending.size,
      flushScheduled: this.flushScheduled,
      flushing: this.flushing,
      storage: this.storage.diagnostics || null,
      ...this.stats
    });
  }
}

export function createTransactionalPersistenceV149(options = {}) {
  return new TransactionalPersistenceV149(options);
}
