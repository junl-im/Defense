import { buildRuntimeBaselineCandidateV150, promoteRuntimeBaselineV150 } from './lib/runtime-baseline-v150.mjs';
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
const distBudgetReport = { passed: true, initial: { textures: { count: 13, estimatedUploadBytes: 12345678 } } };
const candidate = buildRuntimeBaselineCandidateV150({ longSessionReport, distBudgetReport, githubActions: true, runId: '1', commitSha: 'abc' });
assert(candidate.metrics.cpu.drawCallsPeak === 99 && candidate.metrics.heap.usedMBPeak > 43, 'candidate metrics were not extracted');
assert(candidate.metrics.textures.initialResidentCount === 13, 'dist texture residency was not extracted');
let refused = false;
try { promoteRuntimeBaselineV150({ ...candidate, provenance: { ...candidate.provenance, githubActions: false } }, { approver: 'QA', ticket: 'QA-1', approvedAt: '2026-07-30T00:00:00Z' }); } catch { refused = true; }
assert(refused, 'local candidate promotion must be refused');
const approved = promoteRuntimeBaselineV150(candidate, { approver: 'QA', ticket: 'QA-1', approvedAt: '2026-07-30T00:00:00Z' });
assert(approved.status === 'approved' && approved.approval.baselineContentSha256.length === 64, 'approved baseline signature missing');
console.log('PASS v1.0.50 CI-only CPU, long-task, heap, draw-call, and texture baseline promotion contract');
