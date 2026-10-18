// ============================================================
// ResearchConfig — lightweight research tree data.
// Each node: cost, duration, prerequisites, and what it unlocks
// (buildings via BuildingConfig.research, or passive bonuses
// applied by ResearchSystem).
// ============================================================

export const RESEARCH = {
  agriculture: {
    id: 'agriculture',
    name: '농업',
    icon: 'agriculture',
    cost: { food: 30, gold: 10 },
    duration: 30,             // seconds
    requires: [],
    unlocks: '농장 건설 해금 · 식량 생산량 10% 증가',
    bonus: { foodMult: 1.10 },
  },
  mining: {
    id: 'mining',
    name: '채광',
    icon: 'mining',
    cost: { wood: 25, gold: 15 },
    duration: 40,
    requires: [],
    unlocks: '광산 건설 해금 · 석재 생산량 10% 증가',
    bonus: { stoneMult: 1.10 },
  },
  engineering: {
    id: 'engineering',
    name: '공학',
    icon: 'engineering',
    cost: { wood: 40, stone: 30, gold: 20 },
    duration: 60,
    requires: ['mining'],
    unlocks: '창고 건설 해금 · 건설 시간 15% 감소',
    bonus: { buildTimeMult: 0.85 },
  },
  trade: {
    id: 'trade',
    name: '상업',
    icon: 'trade',
    cost: { gold: 35, food: 20 },
    duration: 50,
    requires: ['agriculture'],
    unlocks: '시장 건설 해금 · 금화 생산량 15% 증가',
    bonus: { goldMult: 1.15 },
  },
  military: {
    id: 'military',
    name: '군사',
    icon: 'military',
    cost: { wood: 30, stone: 25, gold: 25 },
    duration: 55,
    requires: ['engineering'],
    unlocks: '감시탑 건설 해금 · 왕국 방어력 10 증가',
    bonus: { defenseBonus: 10 },
  },
  warfare: {
    id: 'warfare',
    name: '전술',
    icon: 'warfare',
    cost: { wood: 40, stone: 40, gold: 30 },
    duration: 70,
    requires: ['military'],
    unlocks: '쇠뇌탑·성문·보루·공성 진지 해금 · 왕국 방어력 10 증가',
    bonus: { defenseBonus: 10 },
  },
  crop_rotation: {
    id: 'crop_rotation',
    name: '윤작법',
    icon: 'crop_rotation',
    cost: { food: 50, gold: 25 },
    duration: 60,
    requires: ['agriculture'],
    unlocks: '농사 도구 개선 · 식량 생산량 20% 증가',
    bonus: { foodMult: 1.20 },
  },
  iron_tools: {
    id: 'iron_tools',
    name: '철제 도구',
    icon: 'iron_tools',
    cost: { wood: 40, stone: 35, gold: 25 },
    duration: 65,
    requires: ['mining'],
    unlocks: '철제 도끼와 곡괭이 · 목재·석재 생산량 15% 증가',
    bonus: { woodMult: 1.15, stoneMult: 1.15 },
  },
  crossbows: {
    id: 'crossbows',
    name: '쇠뇌 연구',
    icon: 'crossbows',
    cost: { wood: 50, gold: 40 },
    duration: 75,
    requires: ['warfare'],
    unlocks: '무기 개선 · 병력 전투력 25% 증가 · 왕국 방어력 5 증가',
    bonus: { armyMult: 1.25, defenseBonus: 5 },
  },
};

export const RESEARCH_ORDER = [
  'agriculture', 'crop_rotation', 'mining', 'iron_tools',
  'trade', 'engineering', 'military', 'warfare', 'crossbows',
];
