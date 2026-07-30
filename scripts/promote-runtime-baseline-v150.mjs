import fs from 'node:fs';
import path from 'node:path';
import { promoteRuntimeBaselineV150 } from './lib/runtime-baseline-v150.mjs';
const root = path.resolve(import.meta.dirname, '..');
const value = (name) => { const index = process.argv.indexOf(name); return index >= 0 ? process.argv[index + 1] : ''; };
const candidatePath = value('--candidate') || path.join(root, 'logs/qa/v150/runtime-baseline-candidate.json');
if (!fs.existsSync(candidatePath)) throw new Error('v150 runtime baseline candidate missing');
const approved = promoteRuntimeBaselineV150(JSON.parse(fs.readFileSync(candidatePath, 'utf8')), {
  approver: value('--approver'),
  ticket: value('--ticket'),
  approvedAt: value('--approved-at'),
  allowLocalFixture: process.argv.includes('--allow-local-fixture')
});
const output = path.join(root, 'docs/PERFORMANCE_BASELINE_v1.0.50_RUNTIME.json');
fs.writeFileSync(output, `${JSON.stringify(approved, null, 2)}\n`);
console.log(`PASS v1.0.50 approved runtime baseline promoted (${approved.approval.baselineContentSha256})`);
