import { createHash } from 'node:crypto';

const number = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const round = (value, digits = 3) => Number(number(value).toFixed(digits));
const percentile = (values, ratio = .95) => {
  const sorted = values.map(Number).filter(Number.isFinite).sort((a, b) => a - b);
  if (!sorted.length) return 0;
  return sorted[Math.min(sorted.length - 1, Math.max(0, Math.ceil(sorted.length * ratio) - 1))];
};
export const sha256TextV150 = (text) => createHash('sha256').update(String(text)).digest('hex');

export function buildRuntimeBaselineCandidateV150({ longSessionReport, distBudgetReport, longSessionSha256 = '', distBudgetSha256 = '', githubActions = false, runId = '', commitSha = '', capturedAt = new Date().toISOString() } = {}) {
  const assurance = longSessionReport?.session?.report || longSessionReport?.report || longSessionReport;
  const samples = Array.isArray(assurance?.samples) ? assurance.samples : [];
  const dist = distBudgetReport || {};
  if (longSessionReport?.passed !== true || assurance?.passed !== true) throw new Error('v150 baseline candidate requires a passing long-session report');
  if (dist.passed !== true) throw new Error('v150 baseline candidate requires a passing dist-budget report');
  if (samples.length < 10) throw new Error('v150 baseline candidate requires at least 10 long-session samples');
  const heapSamples = samples.filter((sample) => sample.heapSupported && Number.isFinite(Number(sample.heapUsedMB)));
  const candidate = {
    id: 'DD-RUNTIME-BASELINE-CANDIDATE-V150',
    releaseVersion: '1.0.50',
    status: 'candidate-unapproved',
    provenance: {
      githubActions: Boolean(githubActions),
      runId: String(runId || ''),
      commitSha: String(commitSha || ''),
      capturedAt: String(capturedAt || ''),
      longSessionSha256: String(longSessionSha256 || ''),
      distBudgetSha256: String(distBudgetSha256 || '')
    },
    environment: assurance.environment || {},
    metrics: {
      cpu: {
        frameP95Ms: round(assurance.metrics?.frameP95Ms || percentile(samples.map((sample) => sample.frameP95Ms), .95)),
        frameSlopeMsPer10Waves: round(assurance.metrics?.frameSlopeMsPer10Waves),
        drawCallsP95: round(percentile(samples.map((sample) => sample.drawCalls), .95)),
        drawCallsPeak: round(Math.max(...samples.map((sample) => number(sample.drawCalls))))
      },
      longTasks: {
        rateP95: round(assurance.metrics?.longTaskRateP95 || percentile(samples.map((sample) => sample.frameLongTaskRate), .95), 5),
        rateSlopePer10Waves: round(assurance.metrics?.longTaskRateSlopePer10Waves, 5),
        growth: round(assurance.metrics?.longTaskGrowth)
      },
      heap: {
        supported: heapSamples.length > 1,
        usedMBP95: round(percentile(heapSamples.map((sample) => sample.heapUsedMB), .95)),
        usedMBPeak: round(heapSamples.length ? Math.max(...heapSamples.map((sample) => number(sample.heapUsedMB))) : 0),
        growthMB: round(assurance.metrics?.heapGrowthMB),
        slopeMBPer10Waves: round(assurance.metrics?.heapSlopeMBPer10Waves)
      },
      textures: {
        runtimeP95: round(percentile(samples.map((sample) => sample.textures), .95)),
        runtimePeak: round(Math.max(...samples.map((sample) => number(sample.textures)))),
        runtimeGrowth: round(assurance.metrics?.textureGrowth),
        initialResidentCount: Math.max(0, Math.round(number(dist.initial?.textures?.count))),
        estimatedInitialUploadBytes: Math.max(0, Math.round(number(dist.initial?.textures?.estimatedUploadBytes)))
      }
    }
  };
  candidate.provenance.candidateContentSha256 = sha256TextV150(JSON.stringify({
    releaseVersion: candidate.releaseVersion,
    environment: candidate.environment,
    metrics: candidate.metrics,
    longSessionSha256: candidate.provenance.longSessionSha256,
    distBudgetSha256: candidate.provenance.distBudgetSha256
  }));
  return Object.freeze(candidate);
}

export function promoteRuntimeBaselineV150(candidate, { approver = '', ticket = '', approvedAt = '', allowLocalFixture = false } = {}) {
  if (candidate?.id !== 'DD-RUNTIME-BASELINE-CANDIDATE-V150' || candidate.status !== 'candidate-unapproved') throw new Error('invalid v150 baseline candidate');
  if (!candidate.provenance?.githubActions && !allowLocalFixture) throw new Error('v150 baseline promotion requires a GitHub Actions candidate');
  if (!String(approver).trim() || !String(ticket).trim() || !String(approvedAt).trim()) throw new Error('v150 baseline promotion requires approver, ticket, and approved-at');
  const approved = {
    id: 'DD-APPROVED-RUNTIME-BASELINE-V150',
    releaseVersion: '1.0.50',
    status: 'approved',
    candidate: {
      sha256: candidate.provenance.candidateContentSha256,
      longSessionSha256: candidate.provenance.longSessionSha256,
      distBudgetSha256: candidate.provenance.distBudgetSha256,
      runId: candidate.provenance.runId,
      commitSha: candidate.provenance.commitSha
    },
    approval: {
      approver: String(approver).trim(),
      ticket: String(ticket).trim(),
      approvedAt: String(approvedAt).trim()
    },
    environment: candidate.environment,
    metrics: candidate.metrics
  };
  approved.approval.baselineContentSha256 = sha256TextV150(JSON.stringify({
    candidate: approved.candidate,
    approval: { approver: approved.approval.approver, ticket: approved.approval.ticket, approvedAt: approved.approval.approvedAt },
    metrics: approved.metrics
  }));
  return Object.freeze(approved);
}
