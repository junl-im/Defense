/** User-facing Korean for native Fiefdom notices and reasons.
 * No alteration to game keys, buildings, economy, states or serialization.
 * Called BEFORE both notice queue and speech; not a delayed DOM sweep.
 */
const resource:Record<string,string>={wood:'목재',stone:'석재',iron:'철',pitch:'역청',oil:'기름',wheat:'밀',flour:'밀가루',hops:'홉',ale:'맥주',pigs:'돼지',hides:'가죽',bread:'빵',cheese:'치즈',apples:'사과',meat:'고기',fish:'생선',bows:'활',crossbows:'석궁',spears:'창',pikes:'장창',swords:'검',maces:'철퇴',armour:'갑옷',stockpile:'자재 창고',granary:'식량 창고'};
const exact:Record<string,string>={
 'Your people are starving!':'주민들이 굶주리고 있습니다!',
 'Not enough gold to buy':'구매할 금이 부족합니다.',
 'Not enough gold':'금이 부족합니다.',
 'Not enough materials':'자원이 부족합니다.',
 'No trees near the woodcutter':'벌목장 근처에 나무가 없습니다.',
 'No game near the hunter':'사냥꾼 근처에 사냥감이 없습니다.',
 'The fishery has no water to work':'어장 근처에 물이 없습니다.',
 'Your keep is being sacked!':'영주성이 공격받고 있습니다!',
 'The keep cannot be pulled down':'영주성은 철거할 수 없습니다.',
 'Your lord is dead. The fief is lost.':'영주가 사망하여 영지를 잃었습니다.',
 'You are now the greatest lord in the land!':'이 땅에서 가장 위대한 영주가 되었습니다!',
 'A rival lord has surpassed you in greatness.':'다른 영주의 명성이 앞서고 있습니다.',
 'Click where new troops should gather':'병사들이 모일 집결지를 선택하세요.',
 'Rally point cleared — troops muster at the barracks':'집결지를 해제했습니다. 병사들은 병영에 모입니다.',
 'Rally point set — new troops will gather here':'집결지를 지정했습니다. 신규 병사가 이곳에 모입니다.',
 'Cannot set a rally point there':'그 위치에는 집결지를 지정할 수 없습니다.',
 'Nothing there to pull down':'철거할 건물이 없습니다.',
 'Select troops first':'먼저 병사를 선택하세요.',
 'They cannot reach there':'병사가 해당 위치로 이동할 수 없습니다.',
 'No stair to that wall — anchor it with a tower or gatehouse':'성벽에 계단이 없습니다. 탑이나 성문으로 연결하세요.',
 'Patrol cancelled':'순찰 지정을 취소했습니다.',
 'You have no drawbridges':'도개교가 없습니다.',
 'No enemy in the pitch yet':'역청 함정에 적이 없습니다.',
 'You have no pitch ditches':'역청 함정이 없습니다.',
 'No barracks':'병영이 없습니다.',
 'No idle peasant to take up arms':'병사로 모집할 여유 인구가 없습니다.',
 'You need an armoury':'무기고가 필요합니다.',
 'Build a market to trade':'거래하려면 시장을 건설하세요.',
 'Build a market to trade.':'거래하려면 시장을 건설하세요.',
 'Game loaded':'저장된 게임을 불러왔습니다.',
 'Autosaved.':'자동 저장 완료.',
 'Gate shut':'성문을 닫았습니다.',
 'Gate opened':'성문을 열었습니다.',
 'Unknown building':'알 수 없는 건물입니다.',
 'Unknown soldier':'알 수 없는 병종입니다.',
 'Outside the map':'지도 범위를 벗어났습니다.',
 'You cannot build on water':'물 위에는 건설할 수 없습니다.',
 'Something is in the way':'건설 위치에 장애물이 있습니다.',
 'The ground is too boggy to build on':'늪지라서 건설할 수 없습니다.',
 'The ground is not level':'지면이 평평하지 않습니다.',
 'Must be built on a shore':'해안가에 건설해야 합니다.',
 'Outside your lands — extend them with walls, towers or a gatehouse':'영지 밖입니다. 성벽·탑·성문으로 영토를 넓히세요.',
 'Nothing can be laid here':'이 위치에는 건설할 수 없습니다.',
 'no worker':'일꾼 없음','empty':'비어 있음','marked out':'공사 표시','burning':'화재 발생',
 'BURNING':'화재 발생','marked out — waiting to be dug':'굴착 대기 중',
 'shut — click to open':'닫힘 · 클릭하여 열기','open — click to shut':'열림 · 클릭하여 닫기',
 'Patrol: right-click the far end of their beat':'순찰할 반대편 위치를 선택하세요.',
 'You have no drawbridges':'도개교가 없습니다.',
 'Autosave failed':'자동 저장 실패'
};
const direction:Record<string,string>={north:'북쪽',south:'남쪽',east:'동쪽',west:'서쪽', 'north-east':'북동쪽','north-west':'북서쪽','south-east':'남동쪽','south-west':'남서쪽'};
const names=(s:string)=>s.replace(/\b(wood|stone|iron|pitch|oil|wheat|flour|hops|ale|pigs|hides|bread|cheese|apples|meat|fish|bows|crossbows|spears|pikes|swords|maces|armour|stockpile|granary)\b/gi,
 word=>resource[word.toLowerCase()]||word);
export function raniKoText(value:string):string {
 const s=String(value||'');if(!s||!/[A-Za-z]/.test(s))return s;
 const fixed=exact[s.trim()];if(fixed)return s.replace(s.trim(),fixed);
 let m:RegExpMatchArray|null;
 if((m=s.match(/^Not enough (.+)$/i)))return names(m[1]).replace(/\s+and\s+/g,'·')+' 부족';
 if((m=s.match(/^Must touch the (.+)$/i)))return names(m[1])+'와 맞닿아 있어야 합니다.';
 if((m=s.match(/^Must be built on (.+)$/i)))return names(m[1])+' 지형에 건설해야 합니다.';
 if((m=s.match(/^No room in the (.+) for (.+)$/i)))return names(m[1])+'에 '+names(m[2])+'을(를) 보관할 공간이 없습니다.';
 if((m=s.match(/^(.+?) is full — nowhere to put (.+)$/i)))return names(m[1])+'이(가) 가득 차 '+names(m[2])+'을(를) 보관할 수 없습니다.';
 if((m=s.match(/^Enemies approach from ([\w-]+)!$/i)))return '적군이 '+(direction[m[1]]||m[1])+'에서 접근합니다!';
 if((m=s.match(/^(.+?) × (\d+) laid$/i)))return m[1]+' '+m[2]+'개 건설 완료';
 if((m=s.match(/^Your (.+?) has fallen$/i)))return m[1]+'이(가) 함락되었습니다!';
 if((m=s.match(/^Your (.+?) has been destroyed!$/i)))return m[1]+'이(가) 파괴되었습니다!';
 if((m=s.match(/^Fire! Your (.+?) is burning$/i)))return '화재 발생! '+m[1]+'에 불이 났습니다.';
 if((m=s.match(/^The fire at your (.+?) is out$/i)))return m[1]+'의 화재가 진압됐습니다.';
 if((m=s.match(/^(.+?) now makes (.+)$/i)))return m[1]+' 생산품 변경: '+names(m[2]);
 if((m=s.match(/^(.+?) recruited$/i)))return m[1]+' 모집 완료';
 if((m=s.match(/^(\d+) selected$/i)))return m[1]+'명 선택';
 if((m=s.match(/^(\d+) on patrol$/i)))return m[1]+'명 순찰 시작';
 if((m=s.match(/^short (\d+)$/i)))return '일꾼 '+m[1]+'명 부족';
 if((m=s.match(/^Speed: (.+)$/i)))return '게임 속도: '+({Slow:'느림',Normal:'보통',Fast:'빠름',Pause:'일시정지'}[m[1]]||m[1]);
 if((m=s.match(/^Autosave failed:\s*(.+)$/i)))return '자동 저장 실패: '+m[1];
 if((m=s.match(/^(.+?) only stands one way/i)))return m[1]+'은(는) 방향을 바꿀 수 없습니다.';
 if((m=s.match(/^(\d+) drawbridges? (raised|dropped)$/i)))return '도개교 '+m[1]+'개 '+(m[2]==='raised'?'올림':'내림');
 if((m=s.match(/^The pitch is alight — (\d+) burning!$/i)))return '역청 함정 점화 · '+m[1]+'명 피해';
 if((m=s.match(/^Water pots doused (\d+) fires?$/i)))return '물항아리로 화재 '+m[1]+'곳 진압';
 if((m=s.match(/^(\d+) killing pits? sprung$/i)))return '함정 '+m[1]+'개 작동';
 if((m=s.match(/^(\d+) oil pots? tipped — the ground is alight$/i)))return '기름항아리 '+m[1]+'개 투척 · 지면 화재';
 if((m=s.match(/^(.+?)'s barracks is destroyed — no more troops!$/i)))return m[1]+'의 병영이 파괴돼 더 이상 병사를 모집할 수 없습니다.';
 if((m=s.match(/^Your standing rises — you are now a (.+)\.$/i)))return '명성 상승 · 새로운 작위: '+m[1];
 if((m=s.match(/^You need (.+)$/i)))return names(m[1])+'이(가) 필요합니다.';
 if((m=s.match(/^No (.+) in the armoury$/i)))return '무기고에 '+names(m[1]).replace(/\s+or\s+/g,'·')+'이(가) 없습니다.';
 // Hover sub-information from the native game, without touching identifiers.
 if((m=s.match(/^(\d+)\/(\d+) workers?$/i)))return '일꾼 '+m[1]+'/'+m[2]+'명';
 if((m=s.match(/^houses (\d+)$/i)))return '주거 수용 '+m[1]+'명';
 if((m=s.match(/^(\d+) \/ (\d+) weapons$/i)))return '무기 '+m[1]+'/'+m[2]+'개';
 if((m=s.match(/^shelf (\d+) \/ (\d+) — takes and gives out any good$/i)))return '공용 선반 '+m[1]+'/'+m[2]+' · 모든 자원 보관';
 if((m=s.match(/^good season ×(.+)$/i)))return '풍작 ×'+m[1];
 if((m=s.match(/^bad season ×(.+)$/i)))return '흉작 ×'+m[1];
 if((m=s.match(/^click to make (.+)$/i)))return '클릭하면 '+names(m[1])+' 생산';
 if((m=s.match(/^(.+?) waiting to be hauled$/i)))return names(m[1])+' · 운반 대기';
 if((m=s.match(/^(\d+)\/(\d+) hp$/i)))return '내구도 '+m[1]+'/'+m[2];
 return names(s).replace(/(\d+)s\b/g,'$1초').replace(/([0-9]+) ([A-Za-z]+)\b/g,(all,n,k)=>resource[k.toLowerCase()]?n+' '+resource[k.toLowerCase()]:all);
}
export function raniKoTooltip(text:string):string {
 return text.split(' · ').map(x=>raniKoText(x)).join(' · ');
}
