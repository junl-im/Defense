export const FAILURE_DIGEST_V146_ID = 'DD-FAILURE-DIGEST-V146';
export const FAILURE_DIGEST_VERSION = '1.0.46';

const finite = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const round = (value, digits = 3) => {
  const scale = 10 ** digits;
  return Math.round(finite(value) * scale) / scale;
};

function slopePer10(samples, key) {
  const points = samples.map((sample) => ({ x: finite(sample.wave), y: finite(sample[key], NaN) })).filter((point) => Number.isFinite(point.y));
  if (points.length < 2) return 0;
  const meanX = points.reduce((sum, point) => sum + point.x, 0) / points.length;
  const meanY = points.reduce((sum, point) => sum + point.y, 0) / points.length;
  const denominator = points.reduce((sum, point) => sum + (point.x - meanX) ** 2, 0);
  if (!denominator) return 0;
  return round(points.reduce((sum, point) => sum + (point.x - meanX) * (point.y - meanY), 0) / denominator * 10);
}

function firstSampleFailure(samples, thresholds) {
  const first = samples[0] || {};
  for (let index = 0; index < samples.length; index += 1) {
    const sample = samples[index];
    const prefix = samples.slice(0, index + 1);
    const checks = [
      ['runtimeErrors', finite(sample.runtimeErrors), thresholds.maxRuntimeErrors],
      ['frameP95Ms', finite(sample.frameP95Ms), thresholds.maxFrameP95Ms],
      ['textureGrowth', finite(sample.textures) - finite(first.textures), thresholds.maxTextureGrowth],
      ['geometryGrowth', finite(sample.geometries) - finite(first.geometries), thresholds.maxGeometryGrowth],
      ['longTaskGrowth', finite(sample.longTasks) - finite(first.longTasks), thresholds.maxLongTaskGrowth],
      ['contextBalance', finite(sample.contextLosses) - finite(sample.contextRestores), thresholds.maxUnmatchedContextLosses]
    ];
    if (sample.heapSupported && first.heapSupported) checks.push(['heapGrowthMB', finite(sample.heapUsedMB) - finite(first.heapUsedMB), thresholds.maxHeapGrowthMB]);
    if (prefix.length >= 3) {
      checks.push(['frameSlopeMsPer10Waves', slopePer10(prefix, 'frameP95Ms'), thresholds.maxFrameSlopeMsPer10Waves]);
      checks.push(['textureSlopePer10Waves', slopePer10(prefix, 'textures'), thresholds.maxTextureSlopePer10Waves]);
      checks.push(['geometrySlopePer10Waves', slopePer10(prefix, 'geometries'), thresholds.maxGeometrySlopePer10Waves]);
      if (prefix.every((entry) => entry.heapSupported)) checks.push(['heapSlopeMBPer10Waves', slopePer10(prefix, 'heapUsedMB'), thresholds.maxHeapSlopeMBPer10Waves]);
    }
    const failure = checks.find(([, actual, maximum]) => actual > maximum);
    if (failure) return { wave: sample.wave, sampleIndex: index, metric: failure[0], actual: round(failure[1]), maximum: failure[2] };
  }
  return null;
}

export function buildFailureDigestV146(report = {}) {
  const failedChecks = Object.entries(report.checks || {}).filter(([, passed]) => !passed).map(([name]) => name);
  const firstRegression = firstSampleFailure(report.samples || [], report.thresholds || {});
  return Object.freeze({
    id: FAILURE_DIGEST_V146_ID,
    releaseVersion: FAILURE_DIGEST_VERSION,
    sourceReportId: String(report.id || ''),
    sourceReleaseVersion: String(report.releaseVersion || ''),
    passed: report.passed === true,
    failedChecks: Object.freeze(failedChecks),
    firstRegression: firstRegression ? Object.freeze(firstRegression) : null,
    summary: report.passed === true
      ? 'No regressing sample detected.'
      : firstRegression
        ? `${firstRegression.metric} first exceeded its limit at wave ${firstRegression.wave}.`
        : `Report failed without a sample-localized regression: ${failedChecks.join(', ') || 'unknown check'}.`
  });
}
