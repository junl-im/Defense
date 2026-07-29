import assert from 'node:assert/strict';
import { buildBrowserEvidenceBundleV147 } from './browser-evidence-bundle-v147.mjs';
const bundle = buildBrowserEvidenceBundleV147([
  { source: 'pass.json', report: { id: 'PASS', releaseVersion: '1.0.46', passed: true, diagnostics: { console: [1,2,3], exceptions: [] }, summary: { waves: 100 } } },
  { source: 'fail.json', report: { id: 'FAIL', releaseVersion: '1.0.47', passed: false, error: 'offline boot failed', diagnostics: { console: Array.from({length:50},(_,i)=>i), exceptions: ['boom'], failedRequests: [{errorText:'x'}] }, chromiumStderr: 'z'.repeat(20000) } }
]);
assert.equal(bundle.scenarioCount, 2);
assert.equal(bundle.passedCount, 1);
assert.equal(bundle.failedCount, 1);
assert.equal('diagnostics' in bundle.scenarios[0], false);
assert.equal(bundle.scenarios[1].diagnostics.consoleTail.length, 30);
assert.equal(bundle.scenarios[1].chromiumStderrTail.length, 12000);
console.log('PASS v1.0.47 compact-pass/full-failure browser evidence policy');
