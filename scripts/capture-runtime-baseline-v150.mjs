import fs from 'node:fs';
import path from 'node:path';
import { buildRuntimeBaselineCandidateV150, sha256TextV150 } from './lib/runtime-baseline-v150.mjs';
const root = path.resolve(import.meta.dirname, '..');
const longPath = path.join(root, process.env.V150_LONG_SESSION_REPORT || 'logs/qa/v145/long-session-report.json');
const distPath = path.join(root, process.env.V150_DIST_BUDGET_REPORT || 'logs/qa/v144/dist-budget-report.json');
const out = path.join(root, 'logs/qa/v150/runtime-baseline-candidate.json');
if (!fs.existsSync(longPath) || !fs.existsSync(distPath)) throw new Error('v150 runtime baseline capture requires v145 long-session and v144 dist-budget reports');
const longText = fs.readFileSync(longPath, 'utf8');
const distText = fs.readFileSync(distPath, 'utf8');
const candidate = buildRuntimeBaselineCandidateV150({
  longSessionReport: JSON.parse(longText),
  distBudgetReport: JSON.parse(distText),
  longSessionSha256: sha256TextV150(longText),
  distBudgetSha256: sha256TextV150(distText),
  githubActions: process.env.GITHUB_ACTIONS === 'true',
  runId: process.env.GITHUB_RUN_ID || '',
  commitSha: process.env.GITHUB_SHA || ''
});
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, `${JSON.stringify(candidate, null, 2)}\n`);
console.log(`PASS v1.0.50 runtime baseline candidate captured (${candidate.provenance.candidateContentSha256})`);
