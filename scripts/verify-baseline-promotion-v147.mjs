import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { METRIC_KEYS_V147, buildApprovedBaselineV147, validateV145DistCandidateV147 } from './dist-baseline-promotion-v147.mjs';
const root = path.resolve(import.meta.dirname, '..');
const baseline = JSON.parse(fs.readFileSync(path.join(root, 'docs/PERFORMANCE_BASELINE_v1.0.45_DIST.json'), 'utf8'));
assert.equal(baseline.id, 'DD-PERFORMANCE-BASELINE-V145-DIST');
assert.equal(baseline.maxRegressionPercent, 5);
if (baseline.measurementStatus === 'approved-exact-vite-artifact') {
  for (const key of METRIC_KEYS_V147) assert.ok(Number.isFinite(baseline.approvedMeasurements?.[key]));
  assert.match(baseline.approval?.candidateSha256 || '', /^[a-f0-9]{64}$/);
  assert.equal(baseline.approval?.id, 'DD-DIST-BASELINE-PROMOTION-V147');
  console.log('PASS v1.0.47 exact v1.0.45 Vite baseline approval');
} else {
  assert.equal(baseline.measurementStatus, 'awaiting-first-approved-vite-artifact');
  assert.equal(baseline.approvedMeasurements, null);
  assert.equal(baseline.approval, undefined);
  const synthetic = { id:'DD-DIST-BUDGET-V144', releaseVersion:'1.0.45', buildId:'b24.45', buildKind:'vite', initial:{requests:2,js:{gzipBytes:100},css:{gzipBytes:20},textures:{estimatedUploadBytes:4096}}, checks:{all:{pass:true}} };
  assert.equal(validateV145DistCandidateV147(synthetic).passed, true);
  const approved = buildApprovedBaselineV147({candidate:synthetic,approver:'release-engineering',approvalTicket:'QA-V145-BASELINE-001',approvedAt:'2026-07-28T00:00:00Z'});
  assert.equal(approved.measurementStatus, 'approved-exact-vite-artifact');
  console.log('PASS v1.0.47 exact-baseline promotion gate (candidate still pending; no values fabricated)');
}
