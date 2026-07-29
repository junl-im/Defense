import { createHash } from 'node:crypto';

export const DIST_BASELINE_PROMOTION_V147_ID = 'DD-DIST-BASELINE-PROMOTION-V147';
export const METRIC_KEYS_V147 = Object.freeze(['initialJsGzipBytes','initialCssGzipBytes','initialRequests','initialTextureUploadBytes']);
const canonical = (value) => JSON.stringify(value, (_key, item) => item && typeof item === 'object' && !Array.isArray(item) ? Object.fromEntries(Object.entries(item).sort(([a],[b]) => a.localeCompare(b))) : item);
export const digestCandidateV147 = (candidate) => createHash('sha256').update(canonical(candidate)).digest('hex');

export function extractMeasurementsV147(candidate = {}) {
  return Object.freeze({
    initialJsGzipBytes: Number(candidate.initial?.js?.gzipBytes),
    initialCssGzipBytes: Number(candidate.initial?.css?.gzipBytes),
    initialRequests: Number(candidate.initial?.requests),
    initialTextureUploadBytes: Number(candidate.initial?.textures?.estimatedUploadBytes)
  });
}

export function validateV145DistCandidateV147(candidate = {}) {
  const failures = [];
  if (candidate.id !== 'DD-DIST-BUDGET-V144') failures.push('candidate-id');
  if (candidate.releaseVersion !== '1.0.45') failures.push('release-version');
  if (candidate.buildId !== 'b24.45') failures.push('build-id');
  if (candidate.buildKind !== 'vite') failures.push('build-kind');
  const measurements = extractMeasurementsV147(candidate);
  for (const key of METRIC_KEYS_V147) if (!Number.isFinite(measurements[key]) || measurements[key] < 0) failures.push(`metric:${key}`);
  const failedChecks = Object.entries(candidate.checks || {}).filter(([, value]) => value?.pass !== true).map(([key]) => key);
  if (failedChecks.length) failures.push(`candidate-checks:${failedChecks.join('|')}`);
  return Object.freeze({ passed: failures.length === 0, failures: Object.freeze(failures), measurements, candidateSha256: digestCandidateV147(candidate) });
}

export function buildApprovedBaselineV147({ candidate, approver, approvalTicket, approvedAt } = {}) {
  const validation = validateV145DistCandidateV147(candidate);
  if (!validation.passed) throw new Error(`invalid v1.0.45 candidate: ${validation.failures.join(', ')}`);
  if (!String(approver || '').trim()) throw new Error('approver required');
  if (!/^[A-Z0-9][A-Z0-9._-]{4,80}$/i.test(String(approvalTicket || ''))) throw new Error('approvalTicket required');
  if (!/^\d{4}-\d{2}-\d{2}T/.test(String(approvedAt || ''))) throw new Error('approvedAt ISO timestamp required');
  return Object.freeze({
    id: 'DD-PERFORMANCE-BASELINE-V145-DIST',
    releaseVersion: '1.0.45',
    buildId: 'b24.45',
    measurementStatus: 'approved-exact-vite-artifact',
    comparisonPolicy: 'Exact approved v1.0.45 Vite dist measurements are the baseline. v1.0.47 and later allow at most five percent regression per metric.',
    maxRegressionPercent: 5,
    approvedMeasurements: validation.measurements,
    approval: {
      id: DIST_BASELINE_PROMOTION_V147_ID,
      approver: String(approver),
      approvalTicket: String(approvalTicket),
      approvedAt: String(approvedAt),
      candidateSha256: validation.candidateSha256,
      candidateReleaseVersion: candidate.releaseVersion,
      candidateBuildId: candidate.buildId,
      measurementTool: candidate.id
    },
    provisionalEnvelopeSource: 'docs/DIST_BUDGETS_v1.0.44.json'
  });
}
