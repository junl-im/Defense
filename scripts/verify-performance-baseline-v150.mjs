import { buildRuntimeBaselineCandidateV150, isPassingDistBudgetReportV150, promoteRuntimeBaselineV150 } from './lib/runtime-baseline-v150.mjs';
const assert = (value, message) => { if (!value) throw new Error(message); };
const samples = Array.from({ length: 20 }, (_, index) => ({
  wave: (index + 1) * 5, frameP95Ms: 15 + index * .05, frameLongTaskRate: .01,
  heapSupported: true, heapUsedMB: 40 + index * .2, drawCalls: 80 + index, textures: 25 + Math.floor(index / 10)
}));
const longSessionReport = {
  passed: true,
  session: { report: { passed: true, samples, environment: { renderer: 'ANGLE hardware' }, metrics: {
    frameP95Ms: 16, frameSlopeMsPer10Waves: .1, longTaskRateP95: .01, longTaskRateSlopePer10Waves: 0,
    longTaskGrowth: 0, heapGrowthMB: 3.8, heapSlopeMBPer10Waves: .4, textureGrowth: 1
  } } }
};
const passingChecks = { jsChunks: { actual: 14, maximum: 20, pass: true }, initialRequests: { actual: 3, maximum: 10, pass: true } };
const distBudgetReport = { id: 'DD-DIST-BUDGET-V144', passed: true, checks: passingChecks, initial: { textures: { count: 13, estimatedUploadBytes: 12345678 } } };
const candidate = buildRuntimeBaselineCandidateV150({ longSessionReport, distBudgetReport, githubActions: true, runId: '1', commitSha: 'abc' });
assert(candidate.metrics.cpu.drawCallsPeak === 99 && candidate.metrics.heap.usedMBPeak > 43, 'candidate metrics were not extracted');
assert(candidate.metrics.textures.initialResidentCount === 13, 'dist texture residency was not extracted');

const legacyPassing = { id: 'DD-DIST-BUDGET-V144', checks: passingChecks, initial: distBudgetReport.initial };
assert(isPassingDistBudgetReportV150(legacyPassing), 'R11 passing dist-budget report without explicit passed flag must remain readable');
buildRuntimeBaselineCandidateV150({ longSessionReport, distBudgetReport: legacyPassing });
for (const invalid of [
  { ...distBudgetReport, passed: false },
  { ...legacyPassing, checks: { ...passingChecks, initialRequests: { actual: 11, maximum: 10, pass: false } } },
  { checks: passingChecks }
]) {
  let refused = false;
  try { buildRuntimeBaselineCandidateV150({ longSessionReport, distBudgetReport: invalid }); } catch { refused = true; }
  assert(refused, 'non-passing or unidentifiable dist-budget input must be refused');
}

let refused = false;
try { promoteRuntimeBaselineV150({ ...candidate, provenance: { ...candidate.provenance, githubActions: false } }, { approver: 'QA', ticket: 'QA-1', approvedAt: '2026-07-30T00:00:00Z' }); } catch { refused = true; }
assert(refused, 'local candidate promotion must be refused');
const approved = promoteRuntimeBaselineV150(candidate, { approver: 'QA', ticket: 'QA-1', approvedAt: '2026-07-30T00:00:00Z' });
assert(approved.status === 'approved' && approved.approval.baselineContentSha256.length === 64, 'approved baseline signature missing');
console.log('PASS v1.0.50/R12 runtime baseline accepts explicit or legacy passing budget reports and rejects failed evidence');
