export function readReleasePolicy(pkg) {
  const meta = pkg?.dokkaebi || {};
  return Object.freeze({
    releaseVersion: meta.releaseVersion || pkg?.version || '0.0.0',
    lineageVersion: meta.lineageVersion || pkg?.version || '0.0.0',
    buildEpoch: Number(meta.buildEpoch || 0),
    buildRevision: Number(meta.buildRevision || 0),
    buildId: meta.buildId || `b${Number(meta.buildEpoch || 0)}.${Number(meta.buildRevision || 0)}`
  });
}

export function versionParts(value) {
  const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(String(value || ''));
  if (!match) return null;
  return { major: Number(match[1]), minor: Number(match[2]), patch: Number(match[3]) };
}

export function isReleaseSequenceValid(value) {
  const parts = versionParts(value);
  return Boolean(parts && parts.patch >= 0 && parts.patch <= 99);
}

export function lineageMajor(pkg) {
  const policy = readReleasePolicy(pkg);
  return versionParts(policy.lineageVersion)?.major || 0;
}
