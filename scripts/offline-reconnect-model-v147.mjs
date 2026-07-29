export const OFFLINE_RECONNECT_ASSURANCE_V147_ID = 'DD-OFFLINE-RECONNECT-ASSURANCE-V147';

const freeze = (value) => Object.freeze(value);
const finite = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;

export function simulateOfflineLaunchV147({
  shellCached = true,
  serviceWorkerControlled = true,
  bootMarker = true,
  saveBefore = {},
  saveAfter = saveBefore,
  failedRequests = []
} = {}) {
  const meaningfulFailures = (Array.isArray(failedRequests) ? failedRequests : [])
    .filter((entry) => !entry?.canceled && !/ERR_ABORTED|INTERNET_DISCONNECTED/.test(String(entry?.errorText || '')));
  const checks = freeze({
    shellCached: Boolean(shellCached),
    serviceWorkerControlled: Boolean(serviceWorkerControlled),
    bootMarker: Boolean(bootMarker),
    saveContinuity: JSON.stringify(saveAfter) === JSON.stringify(saveBefore),
    noUnexpectedNetworkFailures: meaningfulFailures.length === 0
  });
  return freeze({
    id: OFFLINE_RECONNECT_ASSURANCE_V147_ID,
    scenario: 'offline-launch',
    checks,
    failedRequests: freeze(meaningfulFailures),
    passed: Object.values(checks).every(Boolean)
  });
}

export function simulateMidWaveReconnectV147({
  before = {},
  offline = {},
  after = {},
  reconnectEvents = 1,
  queuedWritesBefore = 0,
  queuedWritesAfter = 0,
  runtimeErrors = []
} = {}) {
  const waveBefore = Math.max(0, finite(before.wave ?? before.currentWave));
  const waveOffline = Math.max(0, finite(offline.wave ?? offline.currentWave, waveBefore));
  const waveAfter = Math.max(0, finite(after.wave ?? after.currentWave, waveOffline));
  const checks = freeze({
    waveNeverRegressed: waveOffline >= waveBefore && waveAfter >= waveOffline,
    statePreserved: String(after.state || '') !== 'boot-error' && String(after.state || '') !== 'gameover',
    corePreserved: finite(after.coreHp, 1) > 0,
    exactlyOneReconnect: finite(reconnectEvents) === 1,
    writeQueueDrained: finite(queuedWritesAfter) <= finite(queuedWritesBefore),
    noRuntimeErrors: (Array.isArray(runtimeErrors) ? runtimeErrors : []).length === 0
  });
  return freeze({
    id: OFFLINE_RECONNECT_ASSURANCE_V147_ID,
    scenario: 'mid-wave-reconnect',
    wave: freeze({ before: waveBefore, offline: waveOffline, after: waveAfter }),
    checks,
    passed: Object.values(checks).every(Boolean)
  });
}

export function buildOfflineReconnectSuiteV147(input = {}) {
  const offlineLaunch = simulateOfflineLaunchV147(input.offlineLaunch);
  const midWaveReconnect = simulateMidWaveReconnectV147(input.midWaveReconnect);
  return freeze({
    id: OFFLINE_RECONNECT_ASSURANCE_V147_ID,
    releaseVersion: '1.0.47',
    scenarios: freeze([offlineLaunch, midWaveReconnect]),
    passed: offlineLaunch.passed && midWaveReconnect.passed
  });
}
