import assert from 'node:assert/strict';
import { buildOfflineReconnectSuiteV147 } from './offline-reconnect-model-v147.mjs';

const good = buildOfflineReconnectSuiteV147({
  offlineLaunch: {
    shellCached: true,
    serviceWorkerControlled: true,
    bootMarker: true,
    saveBefore: { wave: '4', controls: '{"leftHanded":true}' },
    saveAfter: { wave: '4', controls: '{"leftHanded":true}' },
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
const broken = structuredClone(good);
const bad = buildOfflineReconnectSuiteV147({
  offlineLaunch: { shellCached: false },
  midWaveReconnect: { before: { wave: 5 }, offline: { wave: 4 }, after: { wave: 4 }, reconnectEvents: 2, runtimeErrors: ['boom'] }
});
assert.equal(bad.passed, false);
assert.equal(bad.scenarios[1].checks.waveNeverRegressed, false);
console.log('PASS v1.0.47 offline launch and mid-wave reconnect deterministic model');
