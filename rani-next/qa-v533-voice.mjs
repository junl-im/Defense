// v5.33: verify actual classification logic against gameplay notice language.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const root=path.resolve(process.argv[2]||'engines/fiefdom');
const rq=createRequire(path.join(root,'package.json'));
const ts=rq('typescript');
const source=fs.readFileSync(path.join(root,'src/ui/raniVoiceNotice.ts'),'utf8');
const compiled=ts.transpileModule(source,{
 compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}
}).outputText;
const {raniVoiceNotice}=await import('data:text/javascript;base64,'+Buffer.from(compiled).toString('base64'));
const on=[
 ['주민들이 굶주리고 있습니다!','식량 경고'],
 ['영주성이 공격받고 있습니다!','영주성이 공격'],
 ['적군이 북쪽에서 접근합니다!','북쪽'],
 ['적군이 남서쪽에서 접근합니다!','남서쪽'],
 ['화재 발생! granary에 불이 났습니다.','화재'],
 ['stone tower이(가) 함락되었습니다!','함락'],
 ['barracks이(가) 파괴되었습니다!','파괴'],
 ['영주가 사망하여 영지를 잃었습니다.','사망'],
];
for(const [notice,keyword] of on){
 const d=raniVoiceNotice(notice,'warn');
 assert.ok(d&&d.urgent&&d.text.includes(keyword),notice+' should be a Korean critical warning');
 assert.ok(!/[A-Za-z]/.test(d.text),notice+' must not produce English speech');
 assert.equal(raniVoiceNotice(notice,'info'),null,'untrusted info must not escalate: '+notice);
}
const off=[
 '자원이 부족합니다.','건설 위치에 장애물이 있습니다.',
 '영지 밖입니다. 성벽·탑·성문으로 영토를 넓히세요.',
 '건설 완료','농가 8개 건설 완료','게임 속도: 빠름',
 '자동 저장 실패: 할당량 초과','자동 저장 완료.',
 '1명 선택','집결지를 지정했습니다. 신규 병사가 이곳에 모입니다.',
 '다른 영주의 명성이 앞서고 있습니다.','병사들이 모일 집결지를 선택하세요.',
 'Rally point set','Our keep has fallen.','적군이 북쪽에서 접근합니다.'];
for(const notice of off)assert.equal(raniVoiceNotice(notice,'warn'),null,
 'Routine/unverified message must stay silent: '+notice);
const main=fs.readFileSync(path.join(root,'src/main.ts'),'utf8');
const audio=fs.readFileSync(path.join(root,'src/engine/audio.ts'),'utf8');
assert.match(main,/const spoken = raniVoiceNotice\(text, kind\)/);
assert.match(main,/if \(spoken\) audio\.say\(spoken\.text, spoken\.urgent\)/);
assert.match(main,/audio\.say\(win \? '승리했습니다\. 왕국을 지켜냈습니다\.'/);
assert.doesNotMatch(main,/audio\.say\(['`]You are now/);
assert.match(audio,/u\.lang = 'ko-KR'/);
assert.match(audio,/getVoices\(\)\.find/);
assert.match(audio,/if \(!this\.speech \|\| this\.volume <= 0\) return/);
console.log('PASS v5.33 voice: 8 emergencies, 15 silent contexts, Korean TTS, settings preserved');
