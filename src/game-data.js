const RANKS = [
  { name: '평범', stars: 1, mult: 1, color: 0xd8d3df, glow: 0x8d7f9b },
  { name: '희귀', stars: 2, mult: 2.15, color: 0x69dcff, glow: 0x3cbbe8 },
  { name: '영웅', stars: 3, mult: 4.7, color: 0xb983ff, glow: 0x8b4ee6 },
  { name: '전설', stars: 4, mult: 10.3, color: 0xffcf68, glow: 0xf09c38 },
  { name: '신화', stars: 5, mult: 23, color: 0xff759d, glow: 0xff3c76 }
];

const UNIT_TYPES = {
  ember: {
    name: '불씨 깨비', symbol: '🔥', element: '화염', color: 0xff704d, soft: '#6b2430',
    description: '빠른 도깨비불을 던집니다. 같은 적을 연속 공격할수록 강해집니다.',
    damage: 12, range: 9.2, cooldown: .68, projectileSpeed: 18, role: '연사', ultimateName: '적련 백화', ultimateCooldown: 13.5
  },
  frost: {
    name: '달서리 깨비', symbol: '❄', element: '달빛', color: 0x75e9ff, soft: '#1f516b',
    description: '적을 얼려 이동 속도를 낮추는 서리 구슬을 발사합니다.',
    damage: 9, range: 8.6, cooldown: .9, projectileSpeed: 15, slow: 2.2, role: '둔화', ultimateName: '월빙 결계', ultimateCooldown: 16
  },
  wind: {
    name: '바람 갓깨비', symbol: '➶', element: '바람', color: 0x8ff3b2, soft: '#245a48',
    description: '가장 멀리 있는 적을 꿰뚫는 바람 화살을 날립니다.',
    damage: 16, range: 11.3, cooldown: 1.05, projectileSpeed: 23, pierce: 2, role: '저격', ultimateName: '천풍 만발', ultimateCooldown: 14.5
  },
  stone: {
    name: '바위 몽둥깨비', symbol: '◆', element: '산', color: 0xe2b477, soft: '#60452c',
    description: '묵직한 바위를 떨어뜨려 넓은 범위의 적을 공격합니다.',
    damage: 25, range: 7.8, cooldown: 1.65, projectileSpeed: 11, splash: 2.6, role: '광역', ultimateName: '태산 붕괴', ultimateCooldown: 17.5
  },
  bell: {
    name: '방울 무당깨비', symbol: '✦', element: '혼령', color: 0xf6a6ff, soft: '#57215d',
    description: '혼령 파동이 주변 적 사이를 튕기며 연쇄 피해를 줍니다.',
    damage: 11, range: 8.8, cooldown: 1.15, projectileSpeed: 16, chain: 3, role: '연쇄', ultimateName: '백귀 방울춤', ultimateCooldown: 15
  },
  thunder: {
    name: '번개 장군깨비', symbol: 'ϟ', element: '천둥', color: 0xffe45f, soft: '#665313',
    description: '느리지만 강력한 낙뢰로 단일 적을 처형합니다.',
    damage: 38, range: 9.5, cooldown: 1.85, projectileSpeed: 28, execute: .16, role: '처형', ultimateName: '천뢰 심판', ultimateCooldown: 18
  }
};

const UNIT_KEYS = Object.keys(UNIT_TYPES);

const ENEMY_TYPES = {
  imp: { name: '장난 요괴', hp: 44, speed: 2.8, damage: 5, reward: 7, color: 0xd75672, scale: .85 },
  runner: { name: '두억 질주꾼', hp: 30, speed: 4.25, damage: 4, reward: 7, color: 0xff8c5a, scale: .66 },
  brute: { name: '돌갑옷 귀수', hp: 118, speed: 1.65, damage: 11, reward: 13, color: 0x78628f, scale: 1.23 },
  shaman: { name: '저주 무당', hp: 72, speed: 2.15, damage: 7, reward: 11, color: 0x4f9eb2, scale: .95 },
  tiger: { name: '저승 호랑이', hp: 920, speed: 1.58, damage: 21, reward: 90, color: 0xff5578, scale: 2.02, boss: true },
  serpent: { name: '청월 이무기', hp: 1540, speed: 1.42, damage: 28, reward: 150, color: 0x45d8b4, scale: 2.3, boss: true },
  king: { name: '백귀 야행왕', hp: 2380, speed: 1.35, damage: 35, reward: 230, color: 0x7b3eff, scale: 2.58, boss: true }
};

const SYNERGIES = [
  { element: '화염', icon: '🔥', text: '도깨비 공격력 증가', thresholds: [2, 4], values: ['+15%', '+32%'] },
  { element: '달빛', icon: '☾', text: '대박 기운 획득 증가', thresholds: [2, 4], values: ['+30%', '+65%'] },
  { element: '바람', icon: '➶', text: '공격 속도 증가', thresholds: [2, 4], values: ['+12%', '+25%'] },
  { element: '산', icon: '◆', text: '신목 피해 감소', thresholds: [2, 4], values: ['-15%', '-30%'] },
  { element: '혼령', icon: '✦', text: '처치 엽전 보너스', thresholds: [2, 4], values: ['+18%', '+38%'] },
  { element: '천둥', icon: 'ϟ', text: '영웅 직접 공격 강화', thresholds: [2, 4], values: ['+25%', '+60%'] }
];

const BLESSINGS = [
  { id: 'bounty', icon: '🪙', name: '깨비 복주머니', desc: '적이 떨어뜨리는 엽전이 30% 증가합니다.', tag: '경제', apply: (g) => { g.mods.goldMultiplier *= 1.3; } },
  { id: 'magnet', icon: '🧲', name: '달빛 자석', desc: '엽전 획득 범위가 크게 증가하고 이동 속도가 8% 오릅니다.', tag: '수집', apply: (g) => { g.mods.pickupRadius += 2.6; g.mods.moveSpeed *= 1.08; } },
  { id: 'frenzy', icon: '⚔', name: '도깨비 난장', desc: '모든 도깨비의 공격 속도가 22% 증가합니다.', tag: '공격', apply: (g) => { g.mods.unitCooldown *= .78; } },
  { id: 'hero', icon: '🔥', name: '대장 깨비의 혼', desc: '플레이어의 기본 공격력이 65% 증가합니다.', tag: '액션', apply: (g) => { g.mods.heroDamage *= 1.65; } },
  { id: 'moonfire', icon: '☄', name: '푸른 귀화', desc: '도깨비불 난무의 재사용 시간이 35% 감소합니다.', tag: '스킬', apply: (g) => { g.mods.skillCooldown *= .65; } },
  { id: 'fortune', icon: '🎲', name: '왕대박 부적', desc: '대박 기운 획득량이 55% 증가합니다.', tag: '운빨', apply: (g) => { g.mods.luckGain *= 1.55; } },
  { id: 'roots', icon: '🌳', name: '천년 신목의 뿌리', desc: '신목 체력을 25 회복하고 받는 피해가 18% 감소합니다.', tag: '방어', apply: (g) => { g.coreHp = Math.min(g.coreMaxHp, g.coreHp + 25); g.mods.coreDamage *= .82; } },
  { id: 'discount', icon: '🏮', name: '야시장 흥정왕', desc: '이후 모든 소환 비용이 7 엽전 감소합니다.', tag: '경제', apply: (g) => { g.mods.summonDiscount += 7; } },
  { id: 'choice', icon: '三', name: '삼지선다 부적', desc: '앞으로 2번의 소환에서 서로 다른 도깨비 3개 중 하나를 선택합니다.', tag: '선택', apply: (g) => { g.choiceTickets += 2; } }
];

const CONTRACTS = [
  {
    id: 'bloodMoon', icon: '🌕', name: '혈월의 사냥', tag: '고위험 · 고수익',
    desc: '다음 웨이브 요괴 체력 +45%, 이동 속도 +12%. 처치 엽전 +65%, 클리어 시 선택권 +1.'
  },
  {
    id: 'treeOath', icon: '🌳', name: '신목의 맹세', tag: '무피해 도전',
    desc: '다음 웨이브 신목 피해 +80%. 무피해로 막으면 엽전 +120과 대량 점수를 얻습니다.'
  },
  {
    id: 'summonSeal', icon: '🔒', name: '강림 봉인', tag: '진형 시험',
    desc: '다음 웨이브 전투 중 소환 불가. 클리어하면 무료 3성 도깨비와 선택권 +1.'
  }
];

export { RANKS, UNIT_TYPES, UNIT_KEYS, ENEMY_TYPES, SYNERGIES, BLESSINGS, CONTRACTS };
