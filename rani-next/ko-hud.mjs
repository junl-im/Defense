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
 ["for (const t of ['Good', 'Buy', 'below', 'Sell', 'above', '', ''])", "for (const t of ['품목', '구매', '하한선', '판매', '상한선', '', ''])"],
 ["'R / E rotate &nbsp; middle-drag or Alt-drag turn freely<br>'", "'R / E 화면 회전 · 마우스 가운데 또는 Alt 드래그로 자유 회전<br>'"],
 ["'wheel zoom &nbsp; drag pan<br>'", "'휠 확대·축소 · 드래그 지도 이동<br>'"],
 ["'<b>Space</b> pause &nbsp; <b>,</b> / <b>.</b> slower / faster<br>'", "'<b>Space</b> 일시정지 · <b>,</b> / <b>.</b> 속도 감소 / 증가<br>'"],
 ["'<b>,</b> / <b>.</b> turn what you are placing<br>'", "'<b>,</b> / <b>.</b> 배치 중 건물 회전<br>'"],
 ["'<b>1-6</b> build menu &nbsp; <b>B</b> toggle it<br>'", "'<b>1-6</b> 건설 메뉴 · <b>B</b> 건설 메뉴 열기/닫기<br>'"],
 ["'<b>V</b> mutes and unmutes<br>'", "'<b>V</b> 소리 켜기/끄기<br>'"],
 ["'<b>X</b> demolish a building (half cost back)<br>'", "'<b>X</b> 건물 철거 (비용 절반 반환)<br>'"],
 ["'<b>Wall, moat, yard:</b> drag to lay a whole run at once<br>'", "'<b>성벽·해자·창고:</b> 드래그로 한 번에 이어서 배치<br>'"],
 ["'Esc cancels building &nbsp; M market &nbsp; T hide panel<br>'", "'Esc 건설 취소 · M 시장 · T 정보창 숨기기<br>'"],
 ["'<b>Troops:</b> click select &nbsp; <b>shift-drag</b> box<br>'", "'<b>병사:</b> 클릭 선택 · <b>Shift+드래그</b> 범위 선택<br>'"],
 ["'double-click all of a kind &nbsp; right-click move<br>'", "'두 번 클릭하면 같은 종류 전체 선택 · 우클릭으로 이동<br>'"],
 ["'right-click a <b>tower/gatehouse</b>, or a wall joined to one, to man it<br>'", "'<b>망루·성문</b> 또는 연결된 성벽 우클릭으로 병력 배치<br>'"],
 ["'click a <b>gatehouse</b> to shut it, again to open &nbsp; <b>G</b> drawbridges<br>'", "'<b>성문</b> 클릭으로 개폐 · <b>G</b> 도개교 조작<br>'"],
 ["'<b>H</b> hold ground &nbsp; <b>P</b> then right-click: patrol between here and there<br>'", "'<b>H</b> 위치 사수 · <b>P</b> 후 우클릭으로 순찰 지정<br>'"],
 ["'<b>Fire</b> takes timber: build a <b>well</b> and idle people run with buckets<br>'", "'<b>화재</b>는 목재를 태웁니다. <b>우물</b>을 지으면 주민이 불을 끕니다.<br>'"],
 ["'<b>F</b> lights your pitch ditches &nbsp; <b>Shift-F</b> fullscreen<br>'", "'<b>F</b> 역청 함정 점화 · <b>Shift+F</b> 전체 화면<br>'"],
 ["'push the pointer at a screen edge to scroll &nbsp; <b>Esc</b> pause / save'", "'마우스를 화면 끝으로 이동하면 지도 스크롤 · <b>Esc</b> 일시정지 / 저장'"],
 ["`Buy ${RESOURCE_LABELS[r]} whenever the stock falls below the level`", "`재고가 설정한 하한선 미만일 때 ${RESOURCE_LABELS[r]} 자동 구매`"],
 ["`Sell ${RESOURCE_LABELS[r]} whenever the stock rises above the level`", "`재고가 설정한 상한선을 초과하면 ${RESOURCE_LABELS[r]} 자동 판매`"],
 ["label: 'You'","label: '나'"]
];
let edits=0;
for(const [en,ko] of pairs)if(s.includes(en)){s=s.split(en).join(ko);edits++;}
const search=['>Population</span>','>Unemployed</span>','>Food stores</span>','>Enemies</span>',
 "const label = r === 'gold' ? 'Gold'"];
for(const en of search)assert.ok(!s.includes(en),'High-frequency English HUD text persists: '+en);
fs.writeFileSync(file,s);
console.log('PASS high-frequency HUD Korean localization',{edits});
