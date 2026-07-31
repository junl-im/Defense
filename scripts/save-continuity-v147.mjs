export const DURABLE_SAVE_KEYS_V147 = Object.freeze([
  'dokkaebi-save-schema-version',
  'dokkaebi-meta-v1',
  'dokkaebi-run-mode-v1',
  'dokkaebi-hero-class-v1',
  'dokkaebi-seed-mode-v1',
  'dokkaebi-control-settings-v1',
  'dokkaebi-hud-density-v1',
  'dokkaebi-left-ui-collapsed',
  'dokkaebi-first-missions-complete',
  'dokkaebi-luck-scores',
  'dokkaebi-guardian-growth-v1',
  'dokkaebi-equipment-v1',
  'dokkaebi-hero-mastery-v1',
  'dokkaebi-codex-progress-v1',
  'dokkaebi-guardian-council-v1',
  'dokkaebi-asset-review-v10',
  'dokkaebi-asset-review-v13',
  'dokkaebi-atlas-review-v14',
  'dokkaebi-atomic-save-snapshot-v150',
  'dokkaebi-render-stats'
]);

export const VOLATILE_STORAGE_KEYS_V147 = Object.freeze([
  'dokkaebi-browser-reliability-v19',
  'dokkaebi-wave-checkpoint-v18',
  'dokkaebi-persistence-journal-v149'
]);

export const OFFLINE_SAVE_SENTINEL_V147 = Object.freeze({
  'dokkaebi-run-mode-v1': 'guardian',
  'dokkaebi-hero-class-v1': 'warrior',
  'dokkaebi-seed-mode-v1': 'daily'
});

function stableValue(value) {
  if (Array.isArray(value)) return value.map(stableValue);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stableValue(value[key])]));
}

export function canonicalStorageValueV147(value) {
  if (value === null || value === undefined) return null;
  const text = String(value);
  try {
    return JSON.stringify(stableValue(JSON.parse(text)));
  } catch {
    return text;
  }
}

export function selectDurableSaveSnapshotV147(snapshot = {}) {
  const selected = {};
  for (const key of DURABLE_SAVE_KEYS_V147) {
    if (!Object.prototype.hasOwnProperty.call(snapshot || {}, key)) continue;
    selected[key] = canonicalStorageValueV147(snapshot[key]);
  }
  return Object.freeze(selected);
}

export function compareDurableSaveSnapshotsV147(before = {}, after = {}) {
  const left = selectDurableSaveSnapshotV147(before);
  const right = selectDurableSaveSnapshotV147(after);
  const missing = [];
  const added = [];
  const changed = [];
  for (const key of DURABLE_SAVE_KEYS_V147) {
    const hasBefore = Object.prototype.hasOwnProperty.call(left, key);
    const hasAfter = Object.prototype.hasOwnProperty.call(right, key);
    if (hasBefore && !hasAfter) missing.push(key);
    else if (!hasBefore && hasAfter) added.push(key);
    else if (hasBefore && left[key] !== right[key]) changed.push(key);
  }
  const sentinelMissing = Object.entries(OFFLINE_SAVE_SENTINEL_V147)
    .filter(([key, expected]) => right[key] !== canonicalStorageValueV147(expected))
    .map(([key]) => key);
  return Object.freeze({
    passed: missing.length === 0 && added.length === 0 && changed.length === 0 && sentinelMissing.length === 0,
    comparedKeys: Object.keys(left).length,
    missing: Object.freeze(missing),
    added: Object.freeze(added),
    changed: Object.freeze(changed),
    sentinelMissing: Object.freeze(sentinelMissing)
  });
}
