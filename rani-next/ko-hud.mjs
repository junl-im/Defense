/**
 * High-frequency HUD strings need source-level translation:
 * Fiefdom refreshes this HTML on every animation tick. Post-render DOM
 * translation alone cannot reliably win that race on the user's screen.
 */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const root=path.resolve(process.argv[2]||'engines/fiefdom');
const file=path.join(root,'src/ui/hud.ts');
let s=fs.readFileSync(file,'utf8');
const pairs=[
 ["const label = r === 'gold' ? 'Gold' : RESOURCE_LABELS", "const label = r === 'gold' ? '금' : RESOURCE_LABELS"],
 ['>Pop</span>','>인구</span>'],['>Liked</span>','>민심</span>'],
 ['>Population</span>','>인구</span>'],['>Unemployed</span>','>미취업 주민</span>'],
 ['>Soldiers</span>','>병사</span>'],['>Food stores</span>','>식량 창고</span>'],
 ['>Stockpile</span>','>자재 창고</span>'],['>Armoury</span>','>무기고</span>'],
 ['>Storehouses</span>','>보조 창고</span>'],['>Popularity</span>','>민심</span>'],
 ['>Enemies</span>','>적 영주</span>'],['>Trade earned</span>','>거래 수입</span>'],
 ['>spent</span>','>지출</span>'],['>Ale</span>','>맥주</span>'],
 ['>Drinking</span>','>음주 현황</span>'],['>Made / drunk</span>','>생산 / 소비</span>'],
 ['>At the inns</span>','>여관 이용</span>'],['>Food balance</h4>','>식량 수지</h4>'],
 ['>Produced</span>','>생산량</span>'],['>Eaten</span>','>소비량</span>'],
 ['>Balance</span>','>차이</span>'],['>Stores last</span>','>저장 기간</span>'],
 ['>Net per minute</span>','>분당 순생산</span>'],
 ['>Per minute — made / used / net</h4>','>분당 생산 / 소비 / 순생산</h4>'],
 ['>Food balance</h4>','>식량 수지</h4>'],
 ['Popularity — click for history','민심 — 기록 보기'],
 ['Population — click for history','인구 — 기록 보기'],
 ['Storehouse shelf — takes any good the stores above are full of','상위 창고에 여유가 없을 때 사용하는 보조 창고'],
 ["['food', 'Food & Ale']","['food', '식량과 맥주']"],
 ["['popularity', 'Popularity']","['popularity', '민심']"],
 ["['production', 'Production']","['production', '생산 현황']"],
 ["['barracks', 'Barracks']","['barracks', '병영']"],
 ["['market', 'Market']","['market', '시장']"],
 ["['Off', 0], ['Low', 0.35], ['Full', 0.8]", "['끄기', 0], ['낮게', 0.35], ['최대로', 0.8]"],
 ["? 'Spoken messages: on' : 'Spoken messages: off'","? '음성 안내 켜짐' : '음성 안내 꺼짐'"],
 ["'Messages will be read aloud'","'안내 메시지를 음성으로 읽어 줍니다.'"],
 ["? 'None'","? '없음'"], ["? 'Half'","? '절반'"],
 ["? 'Normal' : 'Extra'","? '보통' : '추가'"],
 ["t.label.replace(' taxes', '')","t.label"],
 ['>Recruitment</','>병사 모집</'],['>Market</','>시장</'],
 ['>Controls</span>','>조작 안내</span>'],
 ['>hide</span>','>접기</span>'],
 ['>Soldiers</span>','>병사</span>'],
 ['>Food & ale</','>식량과 맥주</'],
 ["title: 'Popularity — what moves it'","title: '민심 변동 요인'"],
 ["label: 'Food & ale'","label: '식량과 맥주'"],
 ["label: 'Rations'","label: '배급'"],
 ["label: 'Taxes'","label: '세금'"],
 ["label: 'Fear'","label: '공포'"],
 ["label: 'You'","label: '나'"]
];
let edits=0;
for(const [en,ko] of pairs)if(s.includes(en)){s=s.split(en).join(ko);edits++;}
const search=['>Population</span>','>Unemployed</span>','>Food stores</span>','>Enemies</span>',
 "const label = r === 'gold' ? 'Gold'"];
for(const en of search)assert.ok(!s.includes(en),'High-frequency English HUD text persists: '+en);
fs.writeFileSync(file,s);
console.log('PASS high-frequency HUD Korean localization',{edits});
