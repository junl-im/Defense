export const SERVICE_WORKER_UPGRADE_ASSURANCE_V146_ID = 'DD-SW-UPGRADE-ASSURANCE-V146';
export const SERVICE_WORKER_UPGRADE_ASSURANCE_VERSION = '1.0.46';
export const PRESERVED_SAVE_NAMESPACES_V146 = Object.freeze([
  'dokkaebi-meta-v1',
  'dokkaebi-control-settings-v1',
  'dokkaebi-guardian-growth-v1',
  'dokkaebi-hud-density-v1'
]);

const freeze = (value) => Object.freeze(value);
const stableJson = (value) => JSON.stringify(value, Object.keys(value || {}).sort());

export function simulateServiceWorkerUpgradeV146({
  previousCache = 'dokkaebi-defense-1.0.45-b24.45',
  currentCache = 'dokkaebi-defense-1.0.46-b24.46',
  cacheKeys = [],
  shellByCache = {},
  saveBefore = {},
  saveAfter = saveBefore,
  controllerChanges = 1
} = {}) {
  const beforeKeys = [...new Set(cacheKeys.map(String))];
  const isReleaseCache = (key) => key.startsWith('dokkaebi-defense-') || key.startsWith('dokkaebi-shell-') || key.startsWith('dokkaebi-luck-defense-shell-');
  const removed = beforeKeys.filter((key) => isReleaseCache(key) && key !== currentCache);
  const afterKeys = beforeKeys.filter((key) => !removed.includes(key));
  if (!afterKeys.includes(currentCache)) afterKeys.push(currentCache);
  const previousShell = shellByCache[previousCache] || [];
  const currentShell = shellByCache[currentCache] || [];
  const saveContinuity = stableJson(saveBefore) === stableJson(saveAfter);
  const checks = freeze({
    previousAndCurrentDistinct: previousCache !== currentCache,
    previousCachePresentBefore: beforeKeys.includes(previousCache),
    currentCachePresentBefore: beforeKeys.includes(currentCache),
    previousShellAvailableDuringUpgrade: previousShell.includes('./index.html'),
    currentShellPrecachedBeforeActivation: currentShell.includes('./index.html'),
    oldReleaseCacheRemoved: removed.includes(previousCache),
    currentCacheRetained: afterKeys.includes(currentCache),
    unrelatedCachesRetained: beforeKeys.filter((key) => !isReleaseCache(key)).every((key) => afterKeys.includes(key)),
    exactlyOneControllerReplacement: Number(controllerChanges) === 1,
    saveContinuity
  });
  return freeze({
    id: SERVICE_WORKER_UPGRADE_ASSURANCE_V146_ID,
    releaseVersion: SERVICE_WORKER_UPGRADE_ASSURANCE_VERSION,
    previousCache,
    currentCache,
    beforeKeys: freeze(beforeKeys),
    removed: freeze(removed),
    afterKeys: freeze(afterKeys),
    preservedSaveNamespaces: PRESERVED_SAVE_NAMESPACES_V146,
    checks,
    passed: Object.values(checks).every(Boolean)
  });
}
