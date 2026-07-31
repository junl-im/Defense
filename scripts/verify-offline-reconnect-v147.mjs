import assert from 'node:assert/strict';
import { buildOfflineReconnectSuiteV147 } from './offline-reconnect-model-v147.mjs';
import { OFFLINE_SAVE_SENTINEL_V147, compareDurableSaveSnapshotsV147 } from './save-continuity-v147.mjs';

const durableBefore = {
  ...OFFLINE_SAVE_SENTINEL_V147,
  'dokkaebi-control-settings-v1': '{"vibration":true,"handedness":"right"}',
  'dokkaebi-guardian-growth-v1': '{"shards":42,"traits":{"ward":2,"pouch":1}}'
};
const durableAfter = {
  ...OFFLINE_SAVE_SENTINEL_V147,
  'dokkaebi-control-settings-v1': '{"handedness":"right","vibration":true}',
  'dokkaebi-guardian-growth-v1': '{"traits":{"pouch":1,"ward":2},"shards":42}'
};
const good = buildOfflineReconnectSuiteV147({
  offlineLaunch: {
    shellCached: true,
    serviceWorkerControlled: true,
    bootMarker: true,
    saveBefore: {
      ...durableBefore,
      'dokkaebi-browser-reliability-v19': '{"generatedAt":"before"}',
      'dokkaebi-wave-checkpoint-v18': '{"savedAt":"before"}'
    },
    saveAfter: {
      ...durableAfter,
      'dokkaebi-browser-reliability-v19': '{"generatedAt":"after"}',
      'dokkaebi-wave-checkpoint-v18': '{"savedAt":"after"}'
    },
    failedRequests: [{ errorText: 'net::ERR_INTERNET_DISCONNECTED', canceled: false }]
  },
  midWaveReconnect: {
    before: { wave: 5, state: 'playing', coreHp: 120 },
    offline: { wave: 5, state: 'playing', coreHp: 120 },
    after: { wave: 6, state: 'playing', coreHp: 120 },
    reconnectEvents: 1,
    queuedWritesBefore: 1,
    queuedWritesAfter: 0,
    runtimeErrors: []
  }
});
assert.equal(good.passed, true, JSON.stringify(good));
assert.equal(good.scenarios[0].saveDiff.changed.length, 0);
assert.equal(good.scenarios[0].saveDiff.sentinelMissing.length, 0);

const changed = compareDurableSaveSnapshotsV147(durableBefore, { ...durableAfter, 'dokkaebi-guardian-growth-v1': '{"shards":0}' });
assert.equal(changed.passed, false);
assert.deepEqual(changed.changed, ['dokkaebi-guardian-growth-v1']);

const bad = buildOfflineReconnectSuiteV147({
  offlineLaunch: {
    shellCached: false,
    saveBefore: durableBefore,
    saveAfter: { ...durableAfter, 'dokkaebi-hero-class-v1': 'mage' }
  },
  midWaveReconnect: { before: { wave: 5 }, offline: { wave: 4 }, after: { wave: 4 }, reconnectEvents: 2, runtimeErrors: ['boom'] }
});
assert.equal(bad.passed, false);
assert.equal(bad.scenarios[0].checks.saveContinuity, false);
assert.deepEqual(bad.scenarios[0].saveDiff.changed, ['dokkaebi-hero-class-v1']);
assert.equal(bad.scenarios[1].checks.waveNeverRegressed, false);
console.log('PASS v1.0.47 durable save continuity ignores volatile diagnostics and detects player-save drift');
