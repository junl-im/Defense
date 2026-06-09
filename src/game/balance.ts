import type { EnemyConfig, EnemyKind, StageConfig, StageId, TowerConfig, TowerKind, WaveSpawn } from './types';

export const STAGE_1_ID: StageId = 'stage_001';
export const STAGE_2_ID: StageId = 'stage_002';

// Backward-compatible defaults for older imports.
export const STAGE_ID = STAGE_1_ID;

export const ENEMIES: Record<EnemyKind, EnemyConfig> = {
  goblin: {
    kind: 'goblin', label: '고블린', hp: 42, speed: 72, reward: 8,
    armor: 0, magicResist: 0, color: 0x7dd957, accentColor: 0x315f2b, threat: 'swarm'
  },
  wolf: {
    kind: 'wolf', label: '늑대', hp: 34, speed: 122, reward: 9,
    armor: 0, magicResist: 0, color: 0xd6d6d6, accentColor: 0x6f6f6f, threat: 'fast'
  },
  brute: {
    kind: 'brute', label: '브루트', hp: 160, speed: 42, reward: 22,
    armor: 0.35, magicResist: 0, color: 0xb5651d, accentColor: 0x5e2e0c, scale: 1.12, threat: 'tank'
  },
  bat: {
    kind: 'bat', label: '박쥐', hp: 30, speed: 98, reward: 10,
    armor: 0, magicResist: 0, flying: true, color: 0xd672ff, accentColor: 0x542066, threat: 'flying'
  },
  orc: {
    kind: 'orc', label: '오크 돌격병', hp: 88, speed: 74, reward: 14,
    armor: 0.12, magicResist: 0, color: 0x3ea95b, accentColor: 0x1d542f, scale: 1.04, threat: 'swarm'
  },
  shield: {
    kind: 'shield', label: '방패병', hp: 120, speed: 50, reward: 18,
    armor: 0.52, magicResist: 0.05, color: 0x8e9aa8, accentColor: 0x39424d, scale: 1.06, threat: 'tank'
  },
  shaman: {
    kind: 'shaman', label: '주술사', hp: 76, speed: 58, reward: 20,
    armor: 0, magicResist: 0.42, color: 0x5fe0cf, accentColor: 0x205a74, threat: 'support'
  },
  wasp: {
    kind: 'wasp', label: '독침 말벌', hp: 52, speed: 126, reward: 13,
    armor: 0, magicResist: 0.1, flying: true, color: 0xffdf5e, accentColor: 0x4d3910, threat: 'flying'
  },
  ogre: {
    kind: 'ogre', label: '오우거', hp: 420, speed: 34, reward: 55,
    armor: 0.22, magicResist: 0.16, color: 0x7f4b2a, accentColor: 0x2d1710, scale: 1.32, threat: 'boss'
  }
};

export const TOWERS: Record<TowerKind, TowerConfig> = {
  archer: {
    kind: 'archer', label: '궁수', cost: 70, range: 148, fireRateMs: 420,
    damage: 14, canHitFlying: true, color: 0x8fd14f, maxSkill: '독화살'
  },
  mage: {
    kind: 'mage', label: '마법', cost: 100, range: 128, fireRateMs: 900,
    damage: 42, canHitFlying: true, color: 0xa970ff, maxSkill: '마력 감속'
  },
  barracks: {
    kind: 'barracks', label: '병영', cost: 80, range: 86, fireRateMs: 700,
    damage: 7, canHitFlying: false, color: 0x4fa3ff, maxSkill: '방패 태세'
  },
  artillery: {
    kind: 'artillery', label: '포탑', cost: 120, range: 132, fireRateMs: 1420,
    damage: 50, splashRadius: 50, canHitFlying: false, color: 0xffb347, maxSkill: '충격탄'
  }
};

const STAGE_1_WAVES: WaveSpawn[][] = [
  [{ kind: 'goblin', count: 10, gapMs: 650 }],
  [{ kind: 'goblin', count: 14, gapMs: 560 }, { kind: 'wolf', count: 4, gapMs: 760 }],
  [{ kind: 'wolf', count: 10, gapMs: 520 }],
  [{ kind: 'goblin', count: 18, gapMs: 420 }, { kind: 'brute', count: 2, gapMs: 1120 }],
  [{ kind: 'bat', count: 10, gapMs: 600 }],
  [{ kind: 'brute', count: 5, gapMs: 960 }, { kind: 'goblin', count: 18, gapMs: 420 }],
  [{ kind: 'wolf', count: 16, gapMs: 430 }, { kind: 'bat', count: 8, gapMs: 550 }],
  [{ kind: 'brute', count: 7, gapMs: 850 }, { kind: 'wolf', count: 12, gapMs: 480 }],
  [{ kind: 'goblin', count: 26, gapMs: 320 }, { kind: 'bat', count: 14, gapMs: 420 }],
  [{ kind: 'brute', count: 10, gapMs: 700 }, { kind: 'wolf', count: 18, gapMs: 360 }]
];

const STAGE_2_WAVES: WaveSpawn[][] = [
  [{ kind: 'orc', count: 8, gapMs: 620 }, { kind: 'goblin', count: 10, gapMs: 390 }],
  [{ kind: 'wolf', count: 12, gapMs: 430 }, { kind: 'orc', count: 8, gapMs: 650 }],
  [{ kind: 'shield', count: 5, gapMs: 880 }, { kind: 'goblin', count: 14, gapMs: 360 }],
  [{ kind: 'wasp', count: 10, gapMs: 520 }, { kind: 'orc', count: 9, gapMs: 600 }],
  [{ kind: 'shaman', count: 4, gapMs: 1100 }, { kind: 'shield', count: 5, gapMs: 760 }],
  [{ kind: 'orc', count: 18, gapMs: 390 }, { kind: 'wasp', count: 10, gapMs: 480 }],
  [{ kind: 'shield', count: 8, gapMs: 720 }, { kind: 'brute', count: 5, gapMs: 860 }],
  [{ kind: 'shaman', count: 5, gapMs: 950 }, { kind: 'wolf', count: 18, gapMs: 330 }, { kind: 'wasp', count: 8, gapMs: 440 }],
  [{ kind: 'shield', count: 10, gapMs: 620 }, { kind: 'orc', count: 18, gapMs: 360 }],
  [{ kind: 'ogre', count: 1, gapMs: 1000 }, { kind: 'shaman', count: 4, gapMs: 900 }, { kind: 'wasp', count: 14, gapMs: 390 }],
  [{ kind: 'ogre', count: 2, gapMs: 1700 }, { kind: 'shield', count: 10, gapMs: 580 }, { kind: 'orc', count: 24, gapMs: 300 }],
  [{ kind: 'ogre', count: 3, gapMs: 1500 }, { kind: 'wasp', count: 18, gapMs: 320 }, { kind: 'shaman', count: 5, gapMs: 720 }]
];

export const STAGES: Record<StageId, StageConfig> = {
  stage_001: {
    id: 'stage_001', number: 1, title: '숲길 방어전', subtitle: '고블린 침입로', theme: 'forest', difficulty: '입문',
    startGold: 400, maxLives: 20,
    path: [
      { x: -30, y: 285 }, { x: 150, y: 285 }, { x: 225, y: 165 }, { x: 395, y: 165 },
      { x: 500, y: 365 }, { x: 700, y: 365 }, { x: 795, y: 220 }, { x: 990, y: 220 }
    ],
    spots: [
      { x: 165, y: 200 }, { x: 290, y: 255 }, { x: 410, y: 95 },
      { x: 530, y: 285 }, { x: 645, y: 435 }, { x: 790, y: 305 }
    ],
    waves: STAGE_1_WAVES,
    tip: '병영으로 길을 막고 포탑으로 뭉친 적을 터뜨리세요.'
  },
  stage_002: {
    id: 'stage_002', number: 2, title: '붉은 협곡', subtitle: '방패병과 말벌 둥지', theme: 'canyon', difficulty: '보통+',
    startGold: 430, maxLives: 20, unlockRequires: 'stage_001',
    path: [
      { x: -30, y: 405 }, { x: 120, y: 405 }, { x: 220, y: 315 }, { x: 150, y: 205 },
      { x: 310, y: 125 }, { x: 470, y: 215 }, { x: 610, y: 150 }, { x: 760, y: 285 },
      { x: 690, y: 425 }, { x: 990, y: 425 }
    ],
    spots: [
      { x: 130, y: 315 }, { x: 250, y: 225 }, { x: 330, y: 70 },
      { x: 470, y: 305 }, { x: 600, y: 245 }, { x: 760, y: 370 }, { x: 835, y: 475 }
    ],
    waves: STAGE_2_WAVES,
    tip: '방패병은 마법으로, 말벌은 궁수와 마법으로 빠르게 처리하세요.'
  }
};

export const STAGE_LIST: StageConfig[] = [STAGES.stage_001, STAGES.stage_002];

export function getStageConfig(stageId?: string): StageConfig {
  if (stageId === STAGE_2_ID) return STAGES.stage_002;
  return STAGES.stage_001;
}

export const MAX_LIVES = STAGES[STAGE_ID].maxLives;
export const START_GOLD = STAGES[STAGE_ID].startGold;
export const WAVES = STAGES[STAGE_ID].waves;
