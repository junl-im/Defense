import assert from 'node:assert/strict';
import { runSaveSchemaFuzzV147 } from './save-schema-fuzz-v147.mjs';
const report = runSaveSchemaFuzzV147({ iterations: 120 });
assert.equal(report.cases, 600);
assert.deepEqual(report.sourcePatchVersions, ['1.0.42','1.0.43','1.0.44','1.0.45','1.0.46']);
assert.equal(report.passed, true, report.failures.slice(0, 5).join('\n'));
console.log(`PASS v1.0.47 save-schema round-trip fuzz (${report.cases} cases across five patch versions)`);
