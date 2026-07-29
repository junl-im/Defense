import { SAVE_MIGRATION_KEY, SAVE_SCHEMA_VERSION, migrateSaveSchema } from '../src/runtime/save-schema.js';

export const SAVE_SCHEMA_FUZZ_V147_ID = 'DD-SAVE-SCHEMA-FUZZ-V147';
export const PATCH_FIXTURES_V147 = Object.freeze([
  Object.freeze({ releaseVersion: '1.0.42', schemaVersion: 21 }),
  Object.freeze({ releaseVersion: '1.0.43', schemaVersion: 21 }),
  Object.freeze({ releaseVersion: '1.0.44', schemaVersion: 21 }),
  Object.freeze({ releaseVersion: '1.0.45', schemaVersion: 21 }),
  Object.freeze({ releaseVersion: '1.0.46', schemaVersion: 21 })
]);

const SAFE_KEYS = Object.freeze([
  'dokkaebi-run-mode-v1', 'dokkaebi-hero-class-v1', 'dokkaebi-seed-mode-v1',
  'dokkaebi-control-settings-v1', 'dokkaebi-left-ui-collapsed', 'dokkaebi-luck-scores',
  'dokkaebi-guardian-growth-v1', 'dokkaebi-equipment-v1', 'dokkaebi-hero-mastery-v1',
  'dokkaebi-codex-progress-v1', 'dokkaebi-asset-review-v10', 'dokkaebi-asset-review-v13',
  'dokkaebi-atlas-review-v14', 'dokkaebi-guardian-council-v1', 'dokkaebi-wave-checkpoint-v18',
  'dokkaebi-browser-reliability-v19'
]);

class MemoryStorage {
  constructor(entries = {}) { this.map = new Map(Object.entries(entries).map(([key, value]) => [key, String(value)])); }
  getItem(key) { return this.map.has(key) ? this.map.get(key) : null; }
  setItem(key, value) { this.map.set(key, String(value)); }
  removeItem(key) { this.map.delete(key); }
  key(index) { return [...this.map.keys()][index] ?? null; }
  get length() { return this.map.size; }
  snapshot() { return Object.fromEntries([...this.map.entries()].sort(([a], [b]) => a.localeCompare(b))); }
}

function rng(seed) {
  let state = (Number(seed) >>> 0) || 0x9e3779b9;
  return () => {
    state ^= state << 13; state ^= state >>> 17; state ^= state << 5;
    return (state >>> 0) / 0x100000000;
  };
}

function randomValue(random, index) {
  const choice = Math.floor(random() * 6);
  if (choice === 0) return JSON.stringify({ index, enabled: random() > .5, score: Math.floor(random() * 100000) });
  if (choice === 1) return JSON.stringify(Array.from({ length: 1 + Math.floor(random() * 5) }, () => Math.floor(random() * 1000)));
  if (choice === 2) return String(Math.floor(random() * 1e9));
  if (choice === 3) return random() > .5 ? 'true' : 'false';
  if (choice === 4) return `text-${index}-${Math.floor(random() * 1e6)}`;
  return '{malformed-json-preserved-byte-for-byte';
}

export function runSaveSchemaFuzzV147({ iterations = 500, seed = 0x1472026 } = {}) {
  const random = rng(seed);
  const failures = [];
  let cases = 0;
  for (const fixture of PATCH_FIXTURES_V147) {
    for (let iteration = 0; iteration < iterations; iteration += 1) {
      const initial = { [SAVE_MIGRATION_KEY]: String(fixture.schemaVersion) };
      SAFE_KEYS.forEach((key, index) => { if (random() > .28) initial[key] = randomValue(random, index); });
      initial[`unknown-${fixture.releaseVersion}-${iteration}`] = `opaque-${Math.floor(random() * 1e9)}`;
      const storage = new MemoryStorage(initial);
      const expected = storage.snapshot();
      const first = migrateSaveSchema(storage);
      const afterFirst = storage.snapshot();
      const second = migrateSaveSchema(storage);
      const afterSecond = storage.snapshot();
      for (const key of SAFE_KEYS) {
        if ((expected[key] ?? null) !== (afterFirst[key] ?? null)) failures.push(`${fixture.releaseVersion}:${iteration}:safe-key-mutated:${key}`);
      }
      const unknownKey = `unknown-${fixture.releaseVersion}-${iteration}`;
      if (expected[unknownKey] !== afterFirst[unknownKey]) failures.push(`${fixture.releaseVersion}:${iteration}:unknown-key-mutated`);
      if (afterFirst[SAVE_MIGRATION_KEY] !== String(SAVE_SCHEMA_VERSION)) failures.push(`${fixture.releaseVersion}:${iteration}:schema-not-current`);
      if (JSON.stringify(afterFirst) !== JSON.stringify(afterSecond)) failures.push(`${fixture.releaseVersion}:${iteration}:non-idempotent`);
      if (second.migrated) failures.push(`${fixture.releaseVersion}:${iteration}:second-migration-ran`);
      if (first.version !== SAVE_SCHEMA_VERSION || second.version !== SAVE_SCHEMA_VERSION) failures.push(`${fixture.releaseVersion}:${iteration}:reported-version`);
      cases += 1;
    }
  }
  return Object.freeze({
    id: SAVE_SCHEMA_FUZZ_V147_ID,
    releaseVersion: '1.0.47',
    sourcePatchVersions: PATCH_FIXTURES_V147.map((entry) => entry.releaseVersion),
    schemaVersion: SAVE_SCHEMA_VERSION,
    iterationsPerPatch: iterations,
    cases,
    failures: Object.freeze(failures),
    passed: failures.length === 0
  });
}
