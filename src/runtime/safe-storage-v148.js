const DEFAULT_FALLBACK_LIMIT = 96;

function normalizeKey(key) {
  const value = String(key ?? '').trim();
  if (!value) throw new TypeError('storage key must be a non-empty string');
  return value;
}

function errorName(error) {
  if (error && typeof error === 'object' && typeof error.name === 'string') return error.name;
  return 'StorageError';
}

export function resolveLocalStorageV148(scope = globalThis) {
  try {
    return scope?.localStorage ?? null;
  } catch {
    return null;
  }
}

export class SafeStorageV148 {
  constructor({ storage = resolveLocalStorageV148(), maxFallbackEntries = DEFAULT_FALLBACK_LIMIT, onError = null } = {}) {
    this.storage = storage;
    this.maxFallbackEntries = Math.max(8, Number(maxFallbackEntries) || DEFAULT_FALLBACK_LIMIT);
    this.onError = typeof onError === 'function' ? onError : null;
    this.fallback = new Map();
    this.stats = {
      reads: 0,
      writes: 0,
      removes: 0,
      persistentReads: 0,
      persistentWrites: 0,
      fallbackReads: 0,
      fallbackWrites: 0,
      parseFailures: 0,
      storageFailures: 0,
      evictions: 0,
      lastError: null
    };
  }

  recordFailure(operation, key, error) {
    const entry = Object.freeze({ operation, key, name: errorName(error) });
    this.stats.storageFailures += 1;
    this.stats.lastError = entry;
    this.onError?.(entry, error);
    return entry;
  }

  remember(key, value) {
    if (this.fallback.has(key)) this.fallback.delete(key);
    this.fallback.set(key, value);
    while (this.fallback.size > this.maxFallbackEntries) {
      const oldest = this.fallback.keys().next().value;
      this.fallback.delete(oldest);
      this.stats.evictions += 1;
    }
  }

  get(key, fallbackValue = null) {
    const normalized = normalizeKey(key);
    this.stats.reads += 1;
    if (this.storage?.getItem) {
      try {
        const value = this.storage.getItem(normalized);
        this.stats.persistentReads += 1;
        if (value !== null) return value;
      } catch (error) {
        this.recordFailure('get', normalized, error);
      }
    }
    if (this.fallback.has(normalized)) {
      this.stats.fallbackReads += 1;
      return this.fallback.get(normalized);
    }
    return fallbackValue;
  }

  set(key, value) {
    const normalized = normalizeKey(key);
    const serialized = String(value ?? '');
    this.stats.writes += 1;
    if (this.storage?.setItem) {
      try {
        this.storage.setItem(normalized, serialized);
        this.stats.persistentWrites += 1;
        this.fallback.delete(normalized);
        return Object.freeze({ ok: true, persisted: true, fallback: false });
      } catch (error) {
        this.recordFailure('set', normalized, error);
      }
    }
    this.remember(normalized, serialized);
    this.stats.fallbackWrites += 1;
    return Object.freeze({ ok: true, persisted: false, fallback: true });
  }

  remove(key) {
    const normalized = normalizeKey(key);
    this.stats.removes += 1;
    let persisted = false;
    if (this.storage?.removeItem) {
      try {
        this.storage.removeItem(normalized);
        persisted = true;
      } catch (error) {
        this.recordFailure('remove', normalized, error);
      }
    }
    const fallback = this.fallback.delete(normalized);
    return Object.freeze({ ok: persisted || fallback, persisted, fallback });
  }

  getJSON(key, fallbackValue = null) {
    const raw = this.get(key, null);
    if (raw === null || raw === '') return fallbackValue;
    try {
      return JSON.parse(raw);
    } catch {
      this.stats.parseFailures += 1;
      return fallbackValue;
    }
  }

  setJSON(key, value) {
    let serialized = '';
    try {
      serialized = JSON.stringify(value);
    } catch (error) {
      this.recordFailure('stringify', normalizeKey(key), error);
      return Object.freeze({ ok: false, persisted: false, fallback: false });
    }
    return this.set(key, serialized);
  }

  get diagnostics() {
    return Object.freeze({
      available: Boolean(this.storage),
      fallbackEntries: this.fallback.size,
      maxFallbackEntries: this.maxFallbackEntries,
      ...this.stats
    });
  }
}

export function createSafeStorageV148(options = {}) {
  return new SafeStorageV148(options);
}
