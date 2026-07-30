import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(import.meta.dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const failures=[]; const check=(value,label)=>{if(!value)failures.push(label);};
for (const file of [
  'src/runtime/transactional-persistence-v149.js',
  'src/runtime/recovery-state-v149.js',
  'src/runtime/run-state-coordinator-v149.js',
  'src/runtime/feature-exposure-policy-v149.js',
  'src/runtime/result-presenter-v149.js',
  'scripts/run-long-session-v145.mjs'
]) check(fs.existsSync(path.join(root,file)), `preserved ${file}`);
check(read('src/main.js').includes('createTransactionalPersistenceV149') && read('src/main.js').includes('buildRunResultPresentationV149'), 'v149 runtime integration preserved');
const assurance=read('src/runtime/long-session-assurance-v145.js');
check(assurance.includes('softwareRenderer') && assurance.includes('frameLongTaskRate') && assurance.includes('measurementCoverage'), 'v145 CI measurement hotfix preserved');
check(read('.github/workflows/deploy.yml').includes('REQUIRE_BROWSER_V149: 1') && read('.github/workflows/deploy.yml').includes('logs/qa/v149'), 'v149 CI browser evidence preserved');
if(failures.length){failures.forEach((failure)=>console.error(`FAIL ${failure}`));process.exit(1);}
console.log('PASS v1.0.49 runtime architecture and CI measurement hotfix preserved under v1.0.50');
