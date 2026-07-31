import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(import.meta.dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const main = read('src/main.js');
const persistentRewardsV150 = read('src/runtime/persistent-reward-orchestrator-v150.js');
const failures = [];
const check = (value, label) => { if (!value) failures.push(label); };
for (const file of ['src/runtime/transactional-persistence-v149.js','src/runtime/recovery-state-v149.js','src/runtime/run-state-coordinator-v149.js','src/runtime/feature-exposure-policy-v149.js','src/runtime/result-presenter-v149.js']) check(fs.existsSync(path.join(root, file)), `module ${file}`);
const finishRunPersistence = main.includes("checkpoint('finish-run')") || (
  main.includes('this.persistentRewardsV150.awardRun') &&
  persistentRewardsV150.includes('this.snapshots.commit') &&
  persistentRewardsV150.includes("'finish-run-rewards'")
);
check(main.includes('createTransactionalPersistenceV149') && finishRunPersistence && main.includes("checkpoint('service-worker-activated')"), 'transactional persistence lifecycle integration');
check(main.includes('RecoveryStateV149') && main.includes('recovery.user.title') && !main.includes('`${entry.source} 경로를 격리'), 'user and developer recovery separation');
check(main.includes('buildRunResultPresentationV149') && !main.includes('<div><span>최고 피해</span>'), 'result presentation extracted from main');
check(main.includes('RunStateCoordinatorV149') && main.includes('this.runStateV149.observe(entry)'), 'run state transition observation');
check(main.includes('resolveFeatureExposureV149') && main.includes('if (game.featureExposureV149.allowQaApi)') && main.includes('__DOKKAEBI_PUBLIC_API__'), 'production QA feature exposure boundary');
check(main.includes("const GAME_VERSION = PUBLIC_GAME_VERSION;") && !main.includes("const GAME_VERSION = '1.0.48'"), 'runtime identity responsibility extracted');
if (failures.length) { failures.forEach((failure) => console.error(`FAIL ${failure}`)); process.exit(1); }
console.log('PASS v1.0.49 main responsibilities are staged into persistence, recovery, run-state, result, feature exposure, and identity modules');
