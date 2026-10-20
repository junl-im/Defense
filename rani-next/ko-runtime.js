// Rani Kingdom: translate user-visible runtime text, never game identifiers.
document.documentElement.lang='ko';
const pairs=[
['FIEFDOM','라니킹덤'],['MAP EDITOR','지도 제작'],['CHOOSE YOUR ENEMIES','대결할 영주 선택'],
['CHOOSE YOUR ENEMIES · CHOOSE YOUR GROUND','영주와 시작 위치 선택'],
['THEY PLAY','참가 영주'],['CHOOSE LORDS →','영주 선택 →'],
['You','나'],['YOU','나'],['Gentle','쉬움'],['Fair','보통'],['Harsh','어려움'],
['Easy','쉬움'],['Normal','보통'],['Hard','어려움'],['Heavy','매우 어려움'],
['Castle','성곽'],['Stores','저장고'],['Town','마을'],['Faith','신앙'],
['Fear','공포'],['Industry','산업'],['Farms','농장'],['Food & Ale','식량과 맥주'],
['Weapons','무기'],['Rations','식량 배급'],['Taxes','세금'],['Gold','금'],
['Population','인구'],['Popularity','민심'],['Food','식량'],['Stockpile','자재 창고'],
['Granary','식량 창고'],['Armoury','무기고'],['Unemployed','미취업 주민'],
['Soldiers','병사'],['Enemies','적 영주'],['Enemy','적'],['Rival','적 영주'],
['Trade earned','거래 수입'],['spent','지출'],['Ale','맥주'],['Drinking','음주 현황'],
['Made / drunk','생산 / 소비'],['At the inns','여관 이용'],['Food balance','식량 수지'],
['Produced','생산량'],['Eaten','소비량'],['Balance','잔량'],['Stores last','예상 저장 기간'],
['Per minute','분당'],['Net per minute','분당 순생산량'],['Good','품목'],
['Buy','구매'],['Sell','판매'],['Market','시장'],['Recruitment','병사 모집'],
['Recruit','모집'],['Siege','공성'],['Set rally point','집결지 지정'],
['Demolish','철거'],['Build','건설'],['Controls','조작 안내'],['hide','접기'],
['Show','보기'],['Hide','숨기기'],['Close','닫기'],['Sound','소리'],
['Off','끄기'],['Low','낮게'],['Full','최대로'],['On','켜기'],
['Speed','속도'],['View','화면'],['Fullscreen','전체 화면'],
['Leave fullscreen','전체 화면 해제'],['Paused','일시정지'],['PAUSED','일시정지'],
['MENU','메뉴'],['Resume','계속하기'],['Quit to menu','메뉴로 나가기'],
['Give up and leave','포기하고 나가기'],['Saved games','저장한 게임'],
['Save','저장'],['Load','불러오기'],['Delete','삭제'],['Sure?','정말 삭제할까요?'],
['Really?','정말 삭제할까요?'],['Overwrite','덮어쓰기'],
['Autosave','자동 저장'],['Autosaves','자동 저장'],['Back to menu','메뉴로'],
['New game','새 게임'],['Start','시작'],['BEGIN','게임 시작'],['Edit','수정'],
['Map editor','지도 편집기'],['Map name','지도 이름'],['Map','지도'],
['Brush','붓 크기'],['Keeps','영주성'],['Clear keeps','영주성 제거'],
['Ground','지면'],['Height','높이'],['Raise (Q)','높이 올리기 (Q)'],
['Lower (Z)','높이 낮추기 (Z)'],['Room to farm','경작지 확보'],
['Rival lords','적 영주 수'],['Vegetation','식생'],
['From a picture','이미지로 가져오기'],['Import image…','이미지 불러오기…'],
['SAVE MAP','지도 저장'],['Your map','내 지도'],['Another name','다른 이름'],
['Return to title','시작 화면으로'],['Survey the field','전장 돌아보기'],
['Look on','전장 보기'],['VICTORY','승리'],['DEFEAT','패배'],
['Victory','승리'],['Defeat','패배'],['WHAT','변경 사항'],
['CLOSE','닫기'],['What changed in this version','이번 버전 변경 사항'],
['Sign in','로그인'],['Sign out','로그아웃'],['Multiplayer','멀티플레이어'],
['Or continue a saved game','저장한 왕국 이어하기'],
['Click to look at it','선택하여 위치 확인'],
['Not enough gold','금이 부족합니다.'],
['Not enough materials','자원이 부족합니다.'],
['Build a market to trade.','거래하려면 시장을 건설하세요.'],
['Not enough history yet — give it a minute of play.','기록이 부족합니다. 게임을 조금 더 진행하세요.'],
['No rations','배급 없음'],['Half rations','절반 배급'],
['Normal rations','보통 배급'],['Extra rations','추가 배급'],
['No taxes','세금 없음'],['Low taxes','낮은 세금'],
['Fair taxes','보통 세금'],['High taxes','높은 세금'],
['Keep','영주성'],['Wall','성벽'],['Gatehouse','성문'],['Tower','방어탑'],
['Hovel','주택'],['Barracks','병영'],['Wood','목재'],['Stone','석재'],
['Iron','철'],['Pitch','역청'],['Oil','기름'],['Wheat','밀'],
['Flour','밀가루'],['Hops','홉'],['Pigs','돼지'],['Bread','빵'],
['Cheese','치즈'],['Apples','사과'],['Meat','고기'],['Fish','생선'],
['Hides','가죽'],['Bows','활'],['Crossbows','석궁'],
['Spears','창'],['Pikes','장창'],['Swords','검'],['Maces','철퇴'],['Armour','갑옷']
];
const fixed=Object.fromEntries(pairs);
const fragments=[
[' — click for history',' — 기록 보기'],
[' — click to see history',' — 기록 보기'],
[' — fixed in a match',' — 대전 중 고정'],
['New troops gather at the flag.','새 병사들은 집결지에 모입니다.'],
['Trade earned','거래 수입'],['Not enough gold','금이 부족합니다'],
['Not enough materials','자원이 부족합니다'],['Buy one now for','즉시 구매 가격:'],
['Sell one now for','즉시 판매 가격:'],['Hide this panel','이 정보창 숨기기'],
['Too close to the edge of the world.','지도 끝에 너무 가깝습니다.'],
['Keep them at least','최소 거리:'],['Click to select','눌러서 선택'],
['New save','새 저장'],['Not saved','저장 실패']
];
const patterns=[
 [/^([+-]?\d[\d,]*)\s+gold$/i,(m,n)=>n+' 금'],
 [/^(\d+)\s+rival lords?$/i,(m,n)=>'적 영주 '+n+'명'],
 [/^(\d+)\.\s*new save$/i,(m,n)=>n+'번 새 저장'],
 [/^Autosaves — every (\d+) minutes of play/i,(m,n)=>'자동 저장 · 게임 시간 '+n+'분마다'],
 [/^Saved as (.+)\.$/i,(m,n)=>n+' 지도 저장 완료'],
 [/^Not saved:\s*(.+)$/i,(m,n)=>'저장 실패: '+n],
 [/^Build (?:an? )(.+) first\.$/i,(m,n)=>(fixed[n]||n)+'부터 건설하세요.']
];
function translate(s){
 if(!s||!/[A-Za-z]{2}/.test(s))return s;
 if(Object.hasOwn(fixed,s))return fixed[s];
 const trim=s.trim();
 if(Object.hasOwn(fixed,trim))return s.replace(trim,fixed[trim]);
 for(const [rx,fn] of patterns){const m=s.match(rx);if(m)return fn(...m);}
 let n=s;
 for(const [en,ko] of fragments)if(n.includes(en))n=n.split(en).join(ko);
 return n;
}
const ignored=new Set(['SCRIPT','STYLE','NOSCRIPT','TEXTAREA','CODE','PRE','SVG','CANVAS']);
function translateTree(root){
 if(!root)return;
 const walk=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
 let el,count=0;
 while((el=walk.nextNode())&&count++<5000){
  if(!el.parentElement||ignored.has(el.parentElement.tagName))continue;
  const after=translate(el.nodeValue);
  if(after!==el.nodeValue)el.nodeValue=after;
 }
 for(const element of [root,...root.querySelectorAll('[title],[aria-label],[placeholder],[alt]')]){
  for(const attr of ['title','aria-label','placeholder','alt']){
   const old=element.getAttribute?.(attr);
   if(!old)continue;
   const after=translate(old);
   if(after!==old)element.setAttribute(attr,after);
  }
 }
}
function localize(){
 for(const selector of ['#menu','#ui','#pause','#lords','#editor','#over','#gameover']){
  translateTree(document.querySelector(selector));
 }
 for(const dialog of document.querySelectorAll('[role=dialog],.modal,.dialog')){
  if(!dialog.closest('#menu,#ui,#pause,#lords,#editor,#over'))translateTree(dialog);
 }
}
localize();
const id=setInterval(localize,650);
window.addEventListener('beforeunload',()=>clearInterval(id),{once:true});
