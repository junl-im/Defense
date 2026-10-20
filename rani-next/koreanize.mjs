/**
 * Rani Kingdom: first-class Korean localization of user-visible Fiefdom data.
 * Keys, world seeds, save identifiers, rules and simulation API never change.
 * This is applied ONLY to the temporary engine working tree after prepare.mjs.
 */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const root=path.resolve(process.argv[2]||'engines/fiefdom');
const here=import.meta.dirname;
const ko=JSON.parse(fs.readFileSync(path.join(here,'ko-strings.json'),'utf8'));
const p=x=>path.join(root,x);
const read=x=>fs.readFileSync(p(x),'utf8');
const write=(x,s)=>fs.writeFileSync(p(x),s);
const esc=x=>JSON.stringify(x);
let defs=read('src/game/defs.ts');
assert.ok(defs.includes('export const BUILDINGS: Record<string, BuildingDef>'));
assert.ok(defs.includes('export const SOLDIER_TYPES: Record<string, SoldierType>'));
for(const [key,value] of Object.entries(ko.resources)){
  const re=new RegExp('\\b'+key+":\\s*'[^']+'");
  assert.match(defs,re,'Missing resource name '+key);
  // Source names under RESOURCE_LABELS only; a search beginning at its
  // declaration avoids rewriting unrelated gameplay keys.
  const start=defs.indexOf('export const RESOURCE_LABELS');
  const end=defs.indexOf('};',start)+2;
  const before=defs.slice(start,end);
  assert.match(before,re,'Missing resource in label table '+key);
  defs=defs.slice(0,start)+before.replace(re,key+': '+JSON.stringify(value))+defs.slice(end);
}
// Keep names/ids/footprints/costs unchanged: only visible fields are overridden.
defs+='\n// Rani Kingdom Korean display strings. IDs, stats and save keys stay stable.\n';
for(const [k,v] of Object.entries(ko.miscLabels)){
 // Misc labels in data declaration only. Explicit field syntax prevents
 // accidental replacement of internal enum values.
 defs=defs.replaceAll("label: '"+k+"'",'label: '+esc(v));
}
defs+='const RK_BUILDING_NAMES: Record<string, string> = '+JSON.stringify(ko.buildings)+';\n';
defs+='const RK_BUILDING_DESCRIPTIONS: Record<string, string> = '+JSON.stringify(ko.buildDescriptions)+';\n';
defs+='const RK_SOLDIER_NAMES: Record<string, string> = '+JSON.stringify(ko.soldiers)+';\n';
defs+='const RK_SOLDIER_DESCRIPTIONS: Record<string, string> = '+JSON.stringify(ko.soldierDescriptions)+';\n';
defs+='for (const [id, name] of Object.entries(RK_BUILDING_NAMES)) { if (BUILDINGS[id]) BUILDINGS[id].label = name; }\n';
defs+='for (const [id, desc] of Object.entries(RK_BUILDING_DESCRIPTIONS)) { if (BUILDINGS[id]) BUILDINGS[id].description = desc; }\n';
defs+='for (const [id, name] of Object.entries(RK_SOLDIER_NAMES)) { if (SOLDIER_TYPES[id]) SOLDIER_TYPES[id].label = name; }\n';
defs+='for (const [id, desc] of Object.entries(RK_SOLDIER_DESCRIPTIONS)) { if (SOLDIER_TYPES[id]) SOLDIER_TYPES[id].description = desc; }\n';
write('src/game/defs.ts',defs);
let maps=read('src/game/maps.ts');
assert.ok(maps.includes('export const DEFAULT_MAP = MAPS[0]'));
maps+='\n// Korean map names and blurbs. id/seed/height/water/save rules are unchanged.\n';
maps+='const RK_MAP_NAMES: Record<string, string> = '+JSON.stringify(ko.mapNames)+';\n';
maps+='const RK_MAP_DESCRIPTIONS: Record<string, string> = '+JSON.stringify(ko.mapDescriptions)+';\n';
maps+='for (const map of MAPS) { if(RK_MAP_NAMES[map.id]) map.name = RK_MAP_NAMES[map.id]; if(RK_MAP_DESCRIPTIONS[map.id]) map.blurb = RK_MAP_DESCRIPTIONS[map.id]; }\n';
write('src/game/maps.ts',maps);
// Localize concrete native control labels and screen strings, not game enums,
// event names, DOM IDs, CSS selectors, serialization keys or object property IDs.
const sourcePairs={
 'src/ui/menu.ts':[
 ["'Your map'","'내가 만든 지도'"],["'Edit'","'수정'"],["'Delete'","'삭제'"],["'Really?'","'정말 삭제할까요?'"],["'Load'","'불러오기'"],
 ["'Or continue a saved game'","'저장한 왕국 이어하기'"],["'Sign out'","'로그아웃'"],
 ["'Autosave'","'자동 저장'"],["'MULTIPLAYER →'","'멀티플레이어 →'"],
 ["'The first load takes a moment while the sprites are read.'","'최초 실행 시 그래픽 자료를 불러오는 데 시간이 조금 걸릴 수 있습니다.'"],
 ["'Esc in game to pause, save, load or leave. '","'게임에서 Esc를 누르면 일시정지·저장·불러오기·나가기를 할 수 있습니다. '"],
 ["'<h3>+ Draw your own</h3>'","'<h3>+ 직접 지도 만들기</h3>'"],
 ["'<p>Start from bare desert and paint the ground and hills yourself.</p>'","'<p>빈 땅부터 지형과 언덕을 직접 만들어 보세요.</p>'"]
 ],
 'src/ui/lords.ts':[
 ["'No room left far enough from the others.'","'다른 영주와 충분히 떨어진 빈자리가 없습니다.'"],
 ["'Too close to the edge of the world.'","'지도 끝에 너무 가깝습니다.'"],
 ["'A keep needs five tiles of level ground.'","'영주성을 세우려면 평탄한 땅 5칸이 필요합니다.'"],
 ["'Nothing stands in water or bog. Seat it on dry ground.'","'물이나 늪에는 건설할 수 없습니다. 마른 땅을 선택하세요.'"],
 ["'← Another map'","'← 다른 지도 선택'"],
 ["'THEY PLAY'","'참가 영주'"],
 ["'BEGIN'","'게임 시작'"],
 ["'You'","'나'"],["'Remove'","'제거'"],["'Add'","'추가'"]
 ],
 'src/ui/pause.ts':[
 ["'Resume'","'게임 계속하기'"],["'Saved games'","'저장한 게임'"],["'Overwrite'","'덮어쓰기'"],
 ["'Delete'","'삭제'"],["'Sure?'","'정말요?'"],["'Save'","'저장'"],["'Load'","'불러오기'"],
 ["'Quit to menu'","'시작 화면으로'"],["'Give up and leave'","'포기하고 나가기'"],
 ["'unreadable'","'읽을 수 없는 파일'"]
 ],
 'src/ui/editor.ts':[
 ["'Ground'","'지면'"],["'Height'","'높이'"],["'Raise (Q)'","'높이 올리기 (Q)'"],
 ["'Lower (Z)'","'높이 낮추기 (Z)'"],["'Keeps'","'영주성'"],["'Clear keeps'","'영주성 제거'"],
 ["'Room to farm'","'농사 가능한 땅'"],["'Brush'","'붓 크기'"],
 ["'Map name'","'지도 이름'"],["'Another name'","'다른 이름'"],
 ["'Rival lords'","'적 영주 수'"],["'Vegetation'","'식생'"],["'From a picture'","'사진에서 가져오기'"],
 ["'Import image…'","'이미지 불러오기…'"],["'Map'","'지도'"],["'SAVE MAP'","'지도 저장'"],["'Back to menu'","'메뉴로 돌아가기'"]
 ],
 'src/ui/hud.ts':[
 ["'Paused'","'일시정지'"],["'Not enough history yet — give it a minute of play.'","'기록이 부족합니다. 게임을 조금 더 진행하세요.'"],
 ["'Pull a building down. Half its cost comes back.'","'건물을 철거하면 건설 자원의 절반을 돌려받습니다.'"],
 ["'Rations'","'식량 배급'"],["'Taxes'","'세금'"],["'Sound'","'소리'"],["'View'","'화면'"],
 ["'Recruitment'","'병사 모집'"],["'Set rally point'","'집결지 지정'"],["'Recruit'","'모집'"],
 ["'Market'","'시장'"],["'Build a market to trade.'","'거래하려면 시장을 건설하세요.'"],
 ["'Hide this panel (T)'","'정보창 숨기기 (T)'"],["'Click to look at it'","'선택하여 위치 확인'"],
 ["'Not enough gold'","'금이 부족합니다.'"],["'Not enough materials'","'자원이 부족합니다.'"]
 ],
 'src/ui/gameover.ts':[
 ["'Return to title'","'시작 화면으로'"],["'Survey the field'","'전장 돌아보기'"],
 ["'Look on'","'계속 보기'"],["'VICTORY'","'승리'"],["'DEFEAT'","'패배'"]
 ],
 'src/ui/bugreport.ts':[
 ["'Report a bug'","'오류 제보'"],
 ["'Opens a GitHub issue with the version and build already filled in'","'버전과 빌드 정보를 포함하여 GitHub 오류 제보 페이지를 엽니다.'"]
 ],
 'src/ui/whatsnew.ts':[
 ["'WHAT'","'변경 사항'"],["'CLOSE'","'닫기'"],["'What changed in this version'","'이번 버전 변경 사항'"]
 ]
};
let edits=0;
for(const [name,pairs] of Object.entries(sourcePairs)){
 let s=read(name);
 for(const [from,to] of pairs){
  if(s.includes(from)){s=s.split(from).join(to);edits++;}
 }
 write(name,s);
}
const smoke='tools/e2e/smoke.mjs';
let tst=read(smoke);
// The smoke test exercises the actual start button; retain its meaning.
tst=tst.replace(/\/BEGIN\//g,'/게임 시작/');
write(smoke,tst);
const raniRoot=path.join(root,'public/rani');
fs.copyFileSync(path.join(here,'ko-runtime.js'),path.join(raniRoot,'ko-runtime.js'));
let html=read('index.html');
assert.ok(!html.includes('ko-runtime.js'));
html=html.replace('</body>','  <script type="module" src="/rani/ko-runtime.js"></script>\n</body>');
html=html.replace('<html lang="en"','<html lang="ko"');
write('index.html',html);
console.log('PASS Korean display data',{resources:Object.keys(ko.resources).length,buildings:Object.keys(ko.buildings).length,soldiers:Object.keys(ko.soldiers).length,maps:Object.keys(ko.mapNames).length,uiStringEdits:edits});
