import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(import.meta.dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const failures = [];
const check = (value, label) => { if (!value) failures.push(label); };
for (const file of [
  'src/runtime/atomic-save-snapshot-v150.js',
  'src/runtime/persistent-reward-orchestrator-v150.js',
  'src/runtime/production-error-boundary-v150.js',
  'docs/PATCH_PROVENANCE_v1.0.50.json',
  'docs/PERFORMANCE_BASELINE_STATUS_v1.0.50.json'
]) check(fs.existsSync(path.join(root, file)), `preserved ${file}`);
const main = read('src/main.js');
check(main.includes('new AtomicSaveSnapshotV150') && main.includes('new PersistentRewardOrchestratorV150') && main.includes('new ProductionErrorBoundaryV150'), 'v150 persistence and recovery integration preserved');
check(read('src/runtime/save-schema.js').includes('dokkaebi-atomic-save-snapshot-v150'), 'v150 atomic snapshot schema preserved');
check(read('.github/workflows/deploy.yml').includes('capture:baseline:v150'), 'v150 runtime baseline CI capture preserved');
if (failures.length) { failures.forEach((failure) => console.error(`FAIL ${failure}`)); process.exit(1); }
console.log('PASS v1.0.50 atomic persistence, safe recovery, and CI baseline foundation preserved under v1.0.51');
