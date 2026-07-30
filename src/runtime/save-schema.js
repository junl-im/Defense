export const SAVE_SCHEMA_VERSION = 22;
export const SAVE_MIGRATION_KEY = 'dokkaebi-save-schema-version';

const SAFE_KEYS = Object.freeze([
  'dokkaebi-run-mode-v1',
  'dokkaebi-hero-class-v1',
  'dokkaebi-seed-mode-v1',
  'dokkaebi-control-settings-v1',
  'dokkaebi-left-ui-collapsed',
  'dokkaebi-luck-scores',
  'dokkaebi-guardian-growth-v1',
  'dokkaebi-equipment-v1',
  'dokkaebi-hero-mastery-v1',
  'dokkaebi-codex-progress-v1',
  'dokkaebi-asset-review-v10',
  'dokkaebi-asset-review-v13',
  'dokkaebi-atlas-review-v14',
  'dokkaebi-guardian-council-v1',
  'dokkaebi-wave-checkpoint-v18',
  'dokkaebi-browser-reliability-v19',
  'dokkaebi-atomic-save-snapshot-v150'
]);

export function migrateSaveSchema(storage = globalThis.localStorage) {
  if (!storage) return Object.freeze({ version: SAVE_SCHEMA_VERSION, migrated: false, reason: 'storage-unavailable' });
  try {
    const before = Number(storage.getItem(SAVE_MIGRATION_KEY) || 0);
    if (before >= SAVE_SCHEMA_VERSION) return Object.freeze({ version: before, migrated: false, reason: 'current' });
    const backup = {};
    for (const key of SAFE_KEYS) {
      const value = storage.getItem(key);
      if (value !== null) backup[key] = value;
    }
    storage.setItem(`dokkaebi-save-backup-v${SAVE_SCHEMA_VERSION}`, JSON.stringify({ createdAt: new Date().toISOString(), fromVersion: before, values: backup }));
    storage.setItem(SAVE_MIGRATION_KEY, String(SAVE_SCHEMA_VERSION));
    return Object.freeze({ version: SAVE_SCHEMA_VERSION, migrated: true, fromVersion: before, backupCount: Object.keys(backup).length });
  } catch (error) {
    return Object.freeze({ version: SAVE_SCHEMA_VERSION, migrated: false, reason: 'migration-failed', message: error instanceof Error ? error.message : String(error) });
  }
}
