/**
 * v5.24: source-specific Korean coverage for native Fiefdom events that
 * previously escaped the generic v5.23 translator.
 * Called before display/voice, without changing state or save identifiers.
 */
const fixed:Readonly<Record<string,string>>={
  'Sound on':'소리를 켰습니다.',
  'Sound off':'소리를 껐습니다.',
  'Frame timing shown (I to hide)':'성능 측정 표시 중 · I 키로 숨기기',
  'Debug: red = blocked for movement (G to hide)':'이동 불가 지역을 빨간색으로 표시합니다. G 키로 숨기기',
  'Your people have no water to fight the fire — build a well':'화재를 진압할 물이 없습니다. 우물을 건설하세요.',
  'You need a granary to store food':'식량을 보관할 식량 창고가 필요합니다.',
  'You need an armoury to store weapons':'무기를 보관할 무기고가 필요합니다.',
  'You need a stockpile to store goods':'자원을 보관할 자재 창고가 필요합니다.',
  'Nothing on four legs or wheels goes up there':'기마병과 공성 장비는 성벽 위로 올라갈 수 없습니다.',
  'They cannot reach it':'병사가 해당 위치에 도착할 수 없습니다.',
  'Sound on.':'소리를 켰습니다.',
  'Sound off.':'소리를 껐습니다.',
};
const goods:Readonly<Record<string,string>>={
 wood:'목재',stone:'석재',iron:'철',pitch:'역청',oil:'기름',
 wheat:'밀',flour:'밀가루',hops:'홉',ale:'맥주',pigs:'돼지',
 hides:'가죽',bread:'빵',cheese:'치즈',apples:'사과',
 meat:'고기',fish:'생선',bows:'활',crossbows:'석궁',spears:'창',
 pikes:'장창',swords:'검',maces:'철퇴',armour:'갑옷',
 stockpile:'자재 창고',granary:'식량 창고',armoury:'무기고'
};
const lang=(input:string)=>input.replace(/\b(?:wood|stone|iron|pitch|oil|wheat|flour|hops|ale|pigs|hides|bread|cheese|apples|meat|fish|bows|crossbows|spears|pikes|swords|maces|armour|stockpile|granary|armoury)\b/gi,t=>goods[t.toLowerCase()]||t);
export function raniKoExtra(original:string):string|null{
 const s=original.trim();
 if(!s||!/[A-Za-z]/.test(s))return null;
 if(Object.prototype.hasOwnProperty.call(fixed,s))return original.replace(s,fixed[s]);
 let m:RegExpMatchArray|null;
 if((m=s.match(/^Must be built on (.+)$/i))){
   const terra:Record<string,string>={sand:'모래',grass:'초원',rock:'암반',marsh:'늪',water:'물',shore:'해안',dry:'마른 땅',level:'평탄한 땅',hill:'언덕'};
   return (terra[m[1].toLowerCase()]||m[1])+' 지형에 건설해야 합니다.';
 }
 // The original per-worker scheduler emits these from game/workers.ts.
 if((m=s.match(/^(.+?) cannot reach its work$/i)))return m[1]+'의 작업 위치로 이동할 수 없습니다.';
 if((m=s.match(/^(.+?) needs an ox tether nearby$/i)))return m[1]+' 근처에 황소 운반 시설이 필요합니다.';
 if((m=s.match(/^(.+?) yard is full — the ox tether cannot keep up$/i)))return m[1]+'의 야적장이 가득 찼습니다. 운반 시설을 보강하세요.';
 if((m=s.match(/^(.+?) is full — (.+?) has stopped$/i)))return lang(m[1])+'이(가) 가득 차 '+m[2]+'의 생산이 멈췄습니다.';
 if((m=s.match(/^(.+?) has no stockpile to draw from$/i)))return m[1]+'에서 사용할 자재 창고가 없습니다.';
 if((m=s.match(/^(.+?) is waiting for materials$/i)))return m[1]+'이(가) 재료를 기다리고 있습니다.';
 if((m=s.match(/^(.+?) has no ale to fetch$/i)))return m[1]+'에 공급할 맥주가 없습니다.';
 if((m=s.match(/^(.+?) — nowhere for the (.+?) to deliver$/i)))return lang(m[1])+'에 '+m[2]+'의 생산품을 운반할 공간이 없습니다.';
 if((m=s.match(/^(.+?) is full — the ox is standing loaded$/i)))return lang(m[1])+'이(가) 가득 차 운반용 황소가 대기하고 있습니다.';
 // Enemy lord, battle and troop state messages.
 if((m=s.match(/^The enemy lord lays siege to your walls — (\d+) strong!$/i)))return '적 영주가 성벽을 포위했습니다! 적군 '+m[1]+'명';
 if((m=s.match(/^The enemy lord marches on you — (\d+) strong!$/i)))return '적 영주가 공격해 옵니다! 적군 '+m[1]+'명';
 if((m=s.match(/^(\d+) holding ground — they will not give chase$/i)))return '병사 '+m[1]+'명이 위치를 사수합니다. 적을 추격하지 않습니다.';
 if((m=s.match(/^(\d+) on the attack$/i)))return '병사 '+m[1]+'명이 공격 태세로 전환했습니다.';
 if((m=s.match(/^(\d+) to the (.+)$/i)))return '병사 '+m[1]+'명이 '+m[2]+'(으)로 이동합니다.';
 if((m=s.match(/^(\d+) (.+?) selected$/i)))return '병사 '+m[1]+'명 선택 · '+m[2].replace(/(?<=[가-힣])s$/,'');
 if((m=s.match(/^(.+?) has won their war\.$/i)))return m[1]+'이(가) 전쟁에서 승리했습니다.';
 if((m=s.match(/^(.+?) has been beaten\.$/i)))return m[1]+'이(가) 전쟁에서 패배했습니다.';
 if((m=s.match(/^No (.+?) to sell$/i)))return lang(m[1])+' 재고가 없어 판매할 수 없습니다.';
 // Intro notification retains the random proper names but localizes directions.
 if((m=s.match(/^Your rivals?: (.+)\.$/i))){
   const x=m[1].replace(/\bto the (north-east|north-west|south-east|south-west|north|south|east|west)\b/gi,
    (_,d:string)=>'· '+({'north':'북쪽','south':'남쪽','east':'동쪽','west':'서쪽','north-east':'북동쪽','north-west':'북서쪽','south-east':'남동쪽','south-west':'남서쪽'} as Record<string,string>)[d.toLowerCase()])
     .replace(/, and /g,' · ').replace(/ and /g,' · ');
   return '적 영주 위치: '+x;
 }
 // Partial battle summaries with generated lord names kept intact.
 if((m=s.match(/^(.+?) The field is yours!$/i)))return m[1]+' 전장을 장악했습니다!';
 if((m=s.match(/^(.+?) (\d+) rivals? left\.$/i)))return m[1]+' 남은 적 영주 '+m[2]+'명';
 return null;
}
