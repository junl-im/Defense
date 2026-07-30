import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const read=(file)=>fs.readFileSync(path.join(root,file),'utf8');
const main=read('src/main.js'), html=read('index.html'), schema=read('src/runtime/save-schema.js');
const failures=[];const check=(value,label)=>{if(!value)failures.push(label);};
for(const file of ['src/runtime/atomic-save-snapshot-v150.js','src/runtime/persistent-reward-orchestrator-v150.js','src/runtime/production-error-boundary-v150.js'])check(fs.existsSync(path.join(root,file)),`module ${file}`);
check(main.includes('new AtomicSaveSnapshotV150')&&main.includes("reconcile('boot-reconcile')"),'atomic snapshot boot integration');
check(main.includes('new PersistentRewardOrchestratorV150')&&main.includes('this.persistentRewardsV150.awardRun')&&main.includes('this.persistentRewardsV150.submitScore'),'reward and score orchestration extracted');
check(!main.includes('calculateShardReward(won)')&&!main.includes('awardRunShards(won)')&&!main.includes('awardPersistentProgress(won)'),'legacy reward orchestration removed from main');
check(main.includes('new ProductionErrorBoundaryV150')&&main.includes('__DOKKAEBI_SHOW_RUNTIME_ERROR_BOUNDARY_V150__'),'production error boundary integrated');
check(html.includes('runtime-error-v150')&&html.includes('개발자 경로·오류 원문은 이 화면에 표시하지 않습니다.'),'generic production recovery screen');
check(!html.includes('게임 모듈 로딩 오류: ${reason}')&&!html.includes('게임 초기화 오류: ${reason}'),'developer error details excluded from user UI');
check(schema.includes('SAVE_SCHEMA_VERSION = 22')&&schema.includes('dokkaebi-atomic-save-snapshot-v150'),'save schema v22 snapshot registration');
if(failures.length){failures.forEach((failure)=>console.error(`FAIL ${failure}`));process.exit(1);}
console.log('PASS v1.0.50 main responsibilities, atomic snapshot schema, and production error boundary');
