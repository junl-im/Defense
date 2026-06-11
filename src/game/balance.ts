import type { EnemyConfig, EnemyKind, StageConfig, StageId, TowerConfig, TowerKind, WaveSpawn } from './types';

export const STAGE_1_ID: StageId = 'stage_001';
export const STAGE_2_ID: StageId = 'stage_002';
export const STAGE_3_ID: StageId = 'stage_003';
export const STAGE_4_ID: StageId = 'stage_004';
export const STAGE_5_ID: StageId = 'stage_005';
export const STAGE_6_ID: StageId = 'stage_006';
export const STAGE_7_ID: StageId = 'stage_007';
export const STAGE_8_ID: StageId = 'stage_008';
export const STAGE_9_ID: StageId = 'stage_009';
export const STAGE_10_ID: StageId = 'stage_010';
export const STAGE_11_ID: StageId = 'stage_011';
export const STAGE_12_ID: StageId = 'stage_012';

// Backward-compatible defaults for older imports.
export const STAGE_ID = STAGE_1_ID;

export const ENEMIES: Record<EnemyKind, EnemyConfig> = {
  goblin: {
    kind: 'goblin', label: '고블린', hp: 38, speed: 68, reward: 8,
    armor: 0, magicResist: 0, color: 0x7dd957, accentColor: 0x315f2b, threat: 'swarm'
  },
  wolf: {
    kind: 'wolf', label: '늑대', hp: 32, speed: 116, reward: 9,
    armor: 0, magicResist: 0, color: 0xd6d6d6, accentColor: 0x6f6f6f, threat: 'fast'
  },
  brute: {
    kind: 'brute', label: '브루트', hp: 150, speed: 40, reward: 22,
    armor: 0.35, magicResist: 0, color: 0xb5651d, accentColor: 0x5e2e0c, scale: 1.12, threat: 'tank'
  },
  bat: {
    kind: 'bat', label: '박쥐', hp: 28, speed: 94, reward: 10,
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
  },
  spider: {
    kind: 'spider', label: '늪지 거미', hp: 58, speed: 96, reward: 12,
    armor: 0.04, magicResist: 0.12, color: 0x2f3038, accentColor: 0x9cff62, threat: 'fast'
  },
  specter: {
    kind: 'specter', label: '망령', hp: 74, speed: 70, reward: 18,
    armor: 0.1, magicResist: 0.58, flying: true, color: 0xb4d7ff, accentColor: 0xe6f6ff, threat: 'flying'
  },
  troll: {
    kind: 'troll', label: '늪 트롤', hp: 260, speed: 38, reward: 38,
    armor: 0.38, magicResist: 0.08, color: 0x57713b, accentColor: 0x243015, scale: 1.22, threat: 'tank'
  },
  raider: {
    kind: 'raider', label: '검은 약탈자', hp: 115, speed: 92, reward: 18,
    armor: 0.2, magicResist: 0.08, color: 0x2b2b34, accentColor: 0xd45656, scale: 1.05, threat: 'fast'
  },
  gargoyle: {
    kind: 'gargoyle', label: '가고일', hp: 140, speed: 68, reward: 26,
    armor: 0.28, magicResist: 0.22, flying: true, color: 0x7d8490, accentColor: 0x29303a, scale: 1.12, threat: 'flying'
  },
  warlock: {
    kind: 'warlock', label: '흑마도사', hp: 150, speed: 48, reward: 34,
    armor: 0.04, magicResist: 0.62, color: 0x6a45a8, accentColor: 0xf06fff, scale: 1.08, threat: 'support'
  },
  golem: {
    kind: 'golem', label: '공성 골렘', hp: 640, speed: 25, reward: 72,
    armor: 0.48, magicResist: 0.18, color: 0x8b7765, accentColor: 0x3d342c, scale: 1.45, threat: 'tank'
  },
  demonlord: {
    kind: 'demonlord', label: '관문 군주', hp: 1350, speed: 22, reward: 190,
    armor: 0.32, magicResist: 0.34, color: 0x9d1f2f, accentColor: 0xffb347, scale: 1.68, threat: 'boss'
  },
  cultist: {
    kind: 'cultist', label: '광신도', hp: 135, speed: 78, reward: 22,
    armor: 0.08, magicResist: 0.18, color: 0x5a2424, accentColor: 0xff7060, scale: 1.04, threat: 'swarm'
  },
  assassin: {
    kind: 'assassin', label: '그림자 암살자', hp: 96, speed: 138, reward: 28,
    armor: 0.18, magicResist: 0.18, color: 0x1a1d27, accentColor: 0x9b7cff, scale: 1.03, threat: 'fast'
  },
  wyvern: {
    kind: 'wyvern', label: '와이번', hp: 210, speed: 82, reward: 38,
    armor: 0.18, magicResist: 0.16, flying: true, color: 0x5f8f49, accentColor: 0xffd36b, scale: 1.22, threat: 'flying'
  },
  necromancer: {
    kind: 'necromancer', label: '강령술사', hp: 190, speed: 44, reward: 44,
    armor: 0.04, magicResist: 0.68, color: 0x483167, accentColor: 0xd6b6ff, scale: 1.12, threat: 'support'
  },
  abomination: {
    kind: 'abomination', label: '살점 괴물', hp: 760, speed: 24, reward: 86,
    armor: 0.22, magicResist: 0.32, color: 0x7b3f46, accentColor: 0xff9a9a, scale: 1.58, threat: 'tank'
  },
  fireImp: {
    kind: 'fireImp', label: '화염 임프', hp: 86, speed: 112, reward: 17,
    armor: 0.02, magicResist: 0.36, color: 0xff6b2a, accentColor: 0xfff08a, scale: 0.96, threat: 'fast'
  },
  hellhound: {
    kind: 'hellhound', label: '지옥 사냥개', hp: 155, speed: 126, reward: 28,
    armor: 0.12, magicResist: 0.22, color: 0x4b1715, accentColor: 0xff9b3d, scale: 1.08, threat: 'fast'
  },
  obsidianKnight: {
    kind: 'obsidianKnight', label: '흑요석 기사', hp: 430, speed: 42, reward: 62,
    armor: 0.62, magicResist: 0.12, color: 0x24272e, accentColor: 0xff703d, scale: 1.24, threat: 'tank'
  },
  phoenix: {
    kind: 'phoenix', label: '불사조', hp: 260, speed: 92, reward: 55,
    armor: 0.08, magicResist: 0.42, flying: true, color: 0xffaa2a, accentColor: 0xffff9a, scale: 1.28, threat: 'flying'
  },
  dragon: {
    kind: 'dragon', label: '화산룡', hp: 1800, speed: 24, reward: 240,
    armor: 0.34, magicResist: 0.38, flying: true, color: 0xb92d21, accentColor: 0xffd36b, scale: 1.82, threat: 'boss'
  },
  voidling: {
    kind: 'voidling', label: '공허 벌레', hp: 72, speed: 154, reward: 16,
    armor: 0.05, magicResist: 0.22, color: 0x2a2357, accentColor: 0x88e7ff, scale: 0.94, threat: 'fast'
  },
  voidPriest: {
    kind: 'voidPriest', label: '공허 사제', hp: 230, speed: 48, reward: 58,
    armor: 0.08, magicResist: 0.72, color: 0x4a3b88, accentColor: 0x9ef4ff, scale: 1.12, threat: 'support'
  },
  nightmare: {
    kind: 'nightmare', label: '악몽 기사', hp: 520, speed: 78, reward: 75,
    armor: 0.38, magicResist: 0.34, color: 0x151525, accentColor: 0xff4fd8, scale: 1.32, threat: 'tank'
  },
  titan: {
    kind: 'titan', label: '공허 거신', hp: 2600, speed: 18, reward: 320,
    armor: 0.44, magicResist: 0.44, color: 0x35314a, accentColor: 0x9ef4ff, scale: 2.0, threat: 'boss'
  }
};

export const TOWERS: Record<TowerKind, TowerConfig> = {
  archer: {
    kind: 'archer', label: '궁수', cost: 62, range: 136, fireRateMs: 430,
    damage: 17, canHitFlying: true, color: 0x8fd14f, maxSkill: '독화살'
  },
  mage: {
    kind: 'mage', label: '마법', cost: 88, range: 122, fireRateMs: 900,
    damage: 46, canHitFlying: true, color: 0xa970ff, maxSkill: '마력 감속'
  },
  barracks: {
    kind: 'barracks', label: '병영', cost: 72, range: 74, fireRateMs: 700,
    damage: 9, canHitFlying: false, color: 0x4fa3ff, maxSkill: '방패 태세'
  },
  artillery: {
    kind: 'artillery', label: '포탑', cost: 108, range: 124, fireRateMs: 1420,
    damage: 56, splashRadius: 48, canHitFlying: false, color: 0xffb347, maxSkill: '충격탄'
  }
};

const STAGE_1_WAVES: WaveSpawn[][] = [
  [{ kind: 'goblin', count: 8, gapMs: 720 }],
  [{ kind: 'goblin', count: 12, gapMs: 620 }, { kind: 'wolf', count: 3, gapMs: 820 }],
  [{ kind: 'wolf', count: 8, gapMs: 580 }],
  [{ kind: 'goblin', count: 15, gapMs: 470 }, { kind: 'brute', count: 2, gapMs: 1220 }],
  [{ kind: 'bat', count: 8, gapMs: 660 }],
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


const STAGE_3_WAVES: WaveSpawn[][] = [
  [{ kind: 'spider', count: 14, gapMs: 360 }, { kind: 'orc', count: 8, gapMs: 560 }],
  [{ kind: 'specter', count: 8, gapMs: 620 }, { kind: 'spider', count: 12, gapMs: 330 }],
  [{ kind: 'troll', count: 4, gapMs: 950 }, { kind: 'goblin', count: 18, gapMs: 320 }],
  [{ kind: 'shaman', count: 5, gapMs: 820 }, { kind: 'spider', count: 18, gapMs: 280 }],
  [{ kind: 'specter', count: 12, gapMs: 500 }, { kind: 'shield', count: 6, gapMs: 720 }],
  [{ kind: 'troll', count: 6, gapMs: 780 }, { kind: 'wasp', count: 12, gapMs: 390 }],
  [{ kind: 'spider', count: 30, gapMs: 230 }, { kind: 'shaman', count: 4, gapMs: 830 }],
  [{ kind: 'troll', count: 8, gapMs: 650 }, { kind: 'specter', count: 10, gapMs: 450 }],
  [{ kind: 'ogre', count: 1, gapMs: 1000 }, { kind: 'troll', count: 7, gapMs: 640 }, { kind: 'spider', count: 20, gapMs: 250 }],
  [{ kind: 'specter', count: 18, gapMs: 340 }, { kind: 'shield', count: 12, gapMs: 530 }, { kind: 'shaman', count: 5, gapMs: 720 }],
  [{ kind: 'ogre', count: 2, gapMs: 1400 }, { kind: 'troll', count: 9, gapMs: 540 }, { kind: 'wasp', count: 14, gapMs: 310 }],
  [{ kind: 'ogre', count: 3, gapMs: 1300 }, { kind: 'specter', count: 20, gapMs: 300 }, { kind: 'spider', count: 34, gapMs: 190 }]
];


const STAGE_4_WAVES: WaveSpawn[][] = [
  [{ kind: 'raider', count: 16, gapMs: 340 }, { kind: 'shield', count: 6, gapMs: 620 }],
  [{ kind: 'gargoyle', count: 8, gapMs: 650 }, { kind: 'raider', count: 12, gapMs: 360 }],
  [{ kind: 'warlock', count: 4, gapMs: 920 }, { kind: 'raider', count: 20, gapMs: 290 }],
  [{ kind: 'golem', count: 2, gapMs: 1300 }, { kind: 'goblin', count: 26, gapMs: 240 }],
  [{ kind: 'gargoyle', count: 12, gapMs: 520 }, { kind: 'warlock', count: 4, gapMs: 900 }],
  [{ kind: 'raider', count: 26, gapMs: 260 }, { kind: 'shield', count: 10, gapMs: 520 }],
  [{ kind: 'golem', count: 4, gapMs: 1050 }, { kind: 'warlock', count: 5, gapMs: 760 }],
  [{ kind: 'gargoyle', count: 18, gapMs: 390 }, { kind: 'raider', count: 24, gapMs: 260 }],
  [{ kind: 'golem', count: 5, gapMs: 920 }, { kind: 'gargoyle', count: 12, gapMs: 420 }],
  [{ kind: 'warlock', count: 7, gapMs: 650 }, { kind: 'shield', count: 14, gapMs: 450 }, { kind: 'raider', count: 20, gapMs: 240 }],
  [{ kind: 'demonlord', count: 1, gapMs: 1000 }, { kind: 'golem', count: 4, gapMs: 1000 }, { kind: 'gargoyle', count: 14, gapMs: 360 }],
  [{ kind: 'demonlord', count: 1, gapMs: 1000 }, { kind: 'warlock', count: 8, gapMs: 540 }, { kind: 'raider', count: 34, gapMs: 190 }],
  [{ kind: 'demonlord', count: 2, gapMs: 1800 }, { kind: 'golem', count: 6, gapMs: 780 }, { kind: 'gargoyle', count: 20, gapMs: 310 }],
  [{ kind: 'demonlord', count: 3, gapMs: 1600 }, { kind: 'warlock', count: 8, gapMs: 480 }, { kind: 'raider', count: 44, gapMs: 160 }]
];


const STAGE_5_WAVES: WaveSpawn[][] = [
  [{ kind: 'cultist', count: 18, gapMs: 300 }, { kind: 'assassin', count: 6, gapMs: 640 }],
  [{ kind: 'wyvern', count: 8, gapMs: 720 }, { kind: 'cultist', count: 18, gapMs: 260 }],
  [{ kind: 'necromancer', count: 4, gapMs: 900 }, { kind: 'shield', count: 10, gapMs: 510 }],
  [{ kind: 'assassin', count: 16, gapMs: 310 }, { kind: 'gargoyle', count: 10, gapMs: 520 }],
  [{ kind: 'abomination', count: 2, gapMs: 1600 }, { kind: 'cultist', count: 30, gapMs: 210 }],
  [{ kind: 'necromancer', count: 6, gapMs: 760 }, { kind: 'wyvern', count: 10, gapMs: 500 }],
  [{ kind: 'assassin', count: 24, gapMs: 220 }, { kind: 'warlock', count: 6, gapMs: 670 }],
  [{ kind: 'abomination', count: 4, gapMs: 1250 }, { kind: 'cultist', count: 34, gapMs: 180 }],
  [{ kind: 'wyvern', count: 18, gapMs: 360 }, { kind: 'necromancer', count: 7, gapMs: 620 }],
  [{ kind: 'abomination', count: 5, gapMs: 960 }, { kind: 'assassin', count: 24, gapMs: 190 }],
  [{ kind: 'demonlord', count: 1, gapMs: 1000 }, { kind: 'necromancer', count: 7, gapMs: 550 }, { kind: 'wyvern', count: 16, gapMs: 320 }],
  [{ kind: 'demonlord', count: 2, gapMs: 1500 }, { kind: 'abomination', count: 5, gapMs: 880 }, { kind: 'cultist', count: 44, gapMs: 140 }]
];

const STAGE_6_WAVES: WaveSpawn[][] = [
  [{ kind: 'fireImp', count: 24, gapMs: 230 }, { kind: 'hellhound', count: 8, gapMs: 560 }],
  [{ kind: 'obsidianKnight', count: 5, gapMs: 850 }, { kind: 'fireImp', count: 20, gapMs: 210 }],
  [{ kind: 'phoenix', count: 6, gapMs: 780 }, { kind: 'hellhound', count: 10, gapMs: 480 }],
  [{ kind: 'fireImp', count: 36, gapMs: 170 }, { kind: 'warlock', count: 5, gapMs: 700 }],
  [{ kind: 'obsidianKnight', count: 8, gapMs: 650 }, { kind: 'phoenix', count: 6, gapMs: 680 }],
  [{ kind: 'hellhound', count: 22, gapMs: 300 }, { kind: 'golem', count: 4, gapMs: 980 }],
  [{ kind: 'phoenix', count: 12, gapMs: 480 }, { kind: 'fireImp', count: 32, gapMs: 170 }],
  [{ kind: 'obsidianKnight', count: 12, gapMs: 540 }, { kind: 'hellhound', count: 24, gapMs: 260 }],
  [{ kind: 'dragon', count: 1, gapMs: 1200 }, { kind: 'phoenix', count: 12, gapMs: 420 }],
  [{ kind: 'dragon', count: 1, gapMs: 1000 }, { kind: 'obsidianKnight', count: 12, gapMs: 510 }, { kind: 'fireImp', count: 40, gapMs: 130 }],
  [{ kind: 'dragon', count: 2, gapMs: 1650 }, { kind: 'hellhound', count: 34, gapMs: 200 }],
  [{ kind: 'dragon', count: 2, gapMs: 1300 }, { kind: 'phoenix', count: 18, gapMs: 320 }, { kind: 'obsidianKnight', count: 14, gapMs: 420 }]
];

const STAGE_7_WAVES: WaveSpawn[][] = [
  [{ kind: 'voidling', count: 30, gapMs: 160 }, { kind: 'specter', count: 8, gapMs: 480 }],
  [{ kind: 'voidPriest', count: 4, gapMs: 920 }, { kind: 'voidling', count: 30, gapMs: 150 }],
  [{ kind: 'nightmare', count: 5, gapMs: 760 }, { kind: 'gargoyle', count: 10, gapMs: 470 }],
  [{ kind: 'voidling', count: 44, gapMs: 120 }, { kind: 'assassin', count: 14, gapMs: 270 }],
  [{ kind: 'voidPriest', count: 6, gapMs: 760 }, { kind: 'nightmare', count: 6, gapMs: 680 }],
  [{ kind: 'titan', count: 1, gapMs: 1500 }, { kind: 'voidling', count: 36, gapMs: 130 }],
  [{ kind: 'nightmare', count: 10, gapMs: 480 }, { kind: 'voidPriest', count: 8, gapMs: 560 }],
  [{ kind: 'voidling', count: 62, gapMs: 90 }, { kind: 'phoenix', count: 8, gapMs: 430 }],
  [{ kind: 'titan', count: 2, gapMs: 1500 }, { kind: 'nightmare', count: 10, gapMs: 430 }],
  [{ kind: 'voidPriest', count: 10, gapMs: 440 }, { kind: 'golem', count: 8, gapMs: 600 }],
  [{ kind: 'titan', count: 2, gapMs: 1200 }, { kind: 'voidling', count: 70, gapMs: 75 }],
  [{ kind: 'titan', count: 3, gapMs: 1350 }, { kind: 'nightmare', count: 14, gapMs: 360 }, { kind: 'voidPriest', count: 10, gapMs: 380 }]
];

const STAGE_8_WAVES: WaveSpawn[][] = [
  [{ kind: 'raider', count: 30, gapMs: 150 }, { kind: 'fireImp', count: 30, gapMs: 150 }],
  [{ kind: 'wyvern', count: 14, gapMs: 400 }, { kind: 'phoenix', count: 8, gapMs: 520 }],
  [{ kind: 'obsidianKnight', count: 12, gapMs: 470 }, { kind: 'nightmare', count: 8, gapMs: 520 }],
  [{ kind: 'necromancer', count: 8, gapMs: 520 }, { kind: 'voidPriest', count: 8, gapMs: 520 }],
  [{ kind: 'abomination', count: 6, gapMs: 840 }, { kind: 'golem', count: 6, gapMs: 840 }],
  [{ kind: 'demonlord', count: 1, gapMs: 1000 }, { kind: 'dragon', count: 1, gapMs: 1200 }],
  [{ kind: 'titan', count: 1, gapMs: 1400 }, { kind: 'voidling', count: 70, gapMs: 70 }],
  [{ kind: 'dragon', count: 2, gapMs: 1500 }, { kind: 'phoenix', count: 18, gapMs: 280 }],
  [{ kind: 'demonlord', count: 2, gapMs: 1200 }, { kind: 'nightmare', count: 18, gapMs: 300 }],
  [{ kind: 'titan', count: 2, gapMs: 1300 }, { kind: 'obsidianKnight', count: 18, gapMs: 330 }],
  [{ kind: 'demonlord', count: 1, gapMs: 900 }, { kind: 'dragon', count: 1, gapMs: 900 }, { kind: 'titan', count: 1, gapMs: 900 }],
  [{ kind: 'demonlord', count: 2, gapMs: 1200 }, { kind: 'dragon', count: 2, gapMs: 1200 }, { kind: 'titan', count: 2, gapMs: 1200 }],
  [{ kind: 'titan', count: 3, gapMs: 1100 }, { kind: 'dragon', count: 2, gapMs: 1100 }, { kind: 'voidPriest', count: 14, gapMs: 300 }],
  [{ kind: 'demonlord', count: 3, gapMs: 1000 }, { kind: 'dragon', count: 3, gapMs: 1000 }, { kind: 'titan', count: 3, gapMs: 1000 }],
  [{ kind: 'voidling', count: 120, gapMs: 55 }, { kind: 'assassin', count: 44, gapMs: 120 }]
];


const STAGE_9_WAVES: WaveSpawn[][] = [
  [{ kind: 'goblin', count: 18, gapMs: 230 }, { kind: 'raider', count: 8, gapMs: 420 }],
  [{ kind: 'spider', count: 20, gapMs: 210 }, { kind: 'shaman', count: 4, gapMs: 760 }],
  [{ kind: 'specter', count: 10, gapMs: 430 }, { kind: 'wolf', count: 18, gapMs: 250 }],
  [{ kind: 'troll', count: 5, gapMs: 680 }, { kind: 'wasp', count: 12, gapMs: 360 }],
  [{ kind: 'assassin', count: 14, gapMs: 260 }, { kind: 'shield', count: 8, gapMs: 520 }],
  [{ kind: 'ogre', count: 2, gapMs: 1350 }, { kind: 'spider', count: 30, gapMs: 150 }],
  [{ kind: 'necromancer', count: 5, gapMs: 640 }, { kind: 'specter', count: 14, gapMs: 360 }],
  [{ kind: 'abomination', count: 3, gapMs: 980 }, { kind: 'raider', count: 26, gapMs: 190 }],
  [{ kind: 'titan', count: 1, gapMs: 1500 }, { kind: 'voidling', count: 42, gapMs: 95 }],
  [{ kind: 'ogre', count: 3, gapMs: 1200 }, { kind: 'necromancer', count: 6, gapMs: 520 }, { kind: 'wasp', count: 20, gapMs: 240 }],
  [{ kind: 'titan', count: 2, gapMs: 1200 }, { kind: 'specter', count: 22, gapMs: 260 }],
  [{ kind: 'titan', count: 2, gapMs: 1050 }, { kind: 'abomination', count: 5, gapMs: 760 }, { kind: 'voidling', count: 56, gapMs: 80 }]
];

const STAGE_10_WAVES: WaveSpawn[][] = [
  [{ kind: 'fireImp', count: 28, gapMs: 170 }, { kind: 'hellhound', count: 10, gapMs: 360 }],
  [{ kind: 'phoenix', count: 8, gapMs: 520 }, { kind: 'fireImp', count: 32, gapMs: 150 }],
  [{ kind: 'obsidianKnight', count: 7, gapMs: 610 }, { kind: 'warlock', count: 5, gapMs: 620 }],
  [{ kind: 'dragon', count: 1, gapMs: 1300 }, { kind: 'hellhound', count: 22, gapMs: 240 }],
  [{ kind: 'gargoyle', count: 16, gapMs: 330 }, { kind: 'phoenix', count: 8, gapMs: 480 }],
  [{ kind: 'obsidianKnight', count: 12, gapMs: 450 }, { kind: 'fireImp', count: 44, gapMs: 105 }],
  [{ kind: 'dragon', count: 2, gapMs: 1450 }, { kind: 'phoenix', count: 12, gapMs: 360 }],
  [{ kind: 'demonlord', count: 1, gapMs: 1200 }, { kind: 'warlock', count: 8, gapMs: 430 }, { kind: 'hellhound', count: 30, gapMs: 180 }],
  [{ kind: 'dragon', count: 2, gapMs: 1250 }, { kind: 'obsidianKnight', count: 14, gapMs: 380 }],
  [{ kind: 'phoenix', count: 22, gapMs: 250 }, { kind: 'fireImp', count: 70, gapMs: 70 }],
  [{ kind: 'dragon', count: 3, gapMs: 1200 }, { kind: 'demonlord', count: 1, gapMs: 1600 }],
  [{ kind: 'dragon', count: 3, gapMs: 1050 }, { kind: 'phoenix', count: 28, gapMs: 210 }, { kind: 'hellhound', count: 42, gapMs: 120 }]
];

const STAGE_11_WAVES: WaveSpawn[][] = [
  [{ kind: 'voidling', count: 42, gapMs: 90 }, { kind: 'cultist', count: 18, gapMs: 190 }],
  [{ kind: 'voidPriest', count: 6, gapMs: 520 }, { kind: 'assassin', count: 18, gapMs: 190 }],
  [{ kind: 'nightmare', count: 7, gapMs: 430 }, { kind: 'specter', count: 14, gapMs: 300 }],
  [{ kind: 'troll', count: 8, gapMs: 560 }, { kind: 'voidling', count: 54, gapMs: 75 }],
  [{ kind: 'voidPriest', count: 8, gapMs: 460 }, { kind: 'gargoyle', count: 18, gapMs: 300 }],
  [{ kind: 'titan', count: 1, gapMs: 1300 }, { kind: 'nightmare', count: 9, gapMs: 390 }],
  [{ kind: 'necromancer', count: 8, gapMs: 440 }, { kind: 'voidling', count: 70, gapMs: 62 }],
  [{ kind: 'titan', count: 2, gapMs: 1150 }, { kind: 'voidPriest', count: 8, gapMs: 380 }],
  [{ kind: 'nightmare', count: 18, gapMs: 260 }, { kind: 'assassin', count: 28, gapMs: 140 }],
  [{ kind: 'titan', count: 2, gapMs: 1000 }, { kind: 'phoenix', count: 14, gapMs: 330 }],
  [{ kind: 'titan', count: 3, gapMs: 1050 }, { kind: 'voidPriest', count: 12, gapMs: 300 }],
  [{ kind: 'titan', count: 3, gapMs: 950 }, { kind: 'nightmare', count: 20, gapMs: 230 }, { kind: 'voidling', count: 88, gapMs: 50 }]
];

const STAGE_12_WAVES: WaveSpawn[][] = [
  [{ kind: 'raider', count: 34, gapMs: 120 }, { kind: 'fireImp', count: 34, gapMs: 120 }],
  [{ kind: 'wyvern', count: 18, gapMs: 290 }, { kind: 'gargoyle', count: 18, gapMs: 290 }],
  [{ kind: 'abomination', count: 7, gapMs: 720 }, { kind: 'golem', count: 7, gapMs: 720 }],
  [{ kind: 'demonlord', count: 1, gapMs: 900 }, { kind: 'dragon', count: 1, gapMs: 900 }, { kind: 'titan', count: 1, gapMs: 900 }],
  [{ kind: 'phoenix', count: 22, gapMs: 230 }, { kind: 'specter', count: 22, gapMs: 230 }],
  [{ kind: 'voidPriest', count: 12, gapMs: 320 }, { kind: 'necromancer', count: 12, gapMs: 320 }],
  [{ kind: 'dragon', count: 2, gapMs: 1100 }, { kind: 'demonlord', count: 2, gapMs: 1100 }],
  [{ kind: 'titan', count: 2, gapMs: 1050 }, { kind: 'nightmare', count: 20, gapMs: 230 }],
  [{ kind: 'dragon', count: 3, gapMs: 980 }, { kind: 'phoenix', count: 30, gapMs: 190 }],
  [{ kind: 'demonlord', count: 3, gapMs: 980 }, { kind: 'abomination', count: 10, gapMs: 480 }],
  [{ kind: 'titan', count: 3, gapMs: 920 }, { kind: 'voidling', count: 120, gapMs: 42 }],
  [{ kind: 'demonlord', count: 2, gapMs: 880 }, { kind: 'dragon', count: 2, gapMs: 880 }, { kind: 'titan', count: 2, gapMs: 880 }, { kind: 'phoenix', count: 32, gapMs: 160 }],
  [{ kind: 'demonlord', count: 3, gapMs: 820 }, { kind: 'dragon', count: 3, gapMs: 820 }, { kind: 'titan', count: 3, gapMs: 820 }],
  [{ kind: 'voidling', count: 160, gapMs: 34 }, { kind: 'assassin', count: 60, gapMs: 92 }, { kind: 'hellhound', count: 52, gapMs: 105 }]
];

export const STAGES: Record<StageId, StageConfig> = {
  stage_001: {
    id: 'stage_001', number: 1, title: '숲길 방어전', subtitle: '고블린 침입로', theme: 'forest', difficulty: '입문',
    startGold: 450, maxLives: 24,
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
    startGold: 460, maxLives: 22, unlockRequires: 'stage_001',
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
  },
  stage_003: {
    id: 'stage_003', number: 3, title: '그림자 늪지', subtitle: '망령과 늪 트롤의 소굴', theme: 'swamp', difficulty: '어려움',
    startGold: 500, maxLives: 20, unlockRequires: 'stage_002',
    path: [
      { x: -30, y: 160 }, { x: 125, y: 160 }, { x: 245, y: 260 }, { x: 145, y: 385 },
      { x: 350, y: 430 }, { x: 520, y: 320 }, { x: 450, y: 170 }, { x: 640, y: 105 },
      { x: 785, y: 210 }, { x: 720, y: 390 }, { x: 990, y: 390 }
    ],
    spots: [
      { x: 120, y: 250 }, { x: 260, y: 165 }, { x: 310, y: 355 },
      { x: 470, y: 405 }, { x: 535, y: 210 }, { x: 675, y: 180 },
      { x: 785, y: 310 }, { x: 850, y: 455 }
    ],
    waves: STAGE_3_WAVES,
    tip: '망령은 공중 판정이고 마법 저항이 높습니다. 궁수와 포탑, 병영 길막 조합을 강하게 가져가세요.'
  },
  stage_004: {
    id: 'stage_004', number: 4, title: '마왕의 관문', subtitle: '공성 골렘과 관문 군주', theme: 'fortress', difficulty: '매우 어려움',
    startGold: 550, maxLives: 20, unlockRequires: 'stage_003',
    path: [
      { x: -30, y: 420 }, { x: 130, y: 420 }, { x: 230, y: 315 }, { x: 160, y: 205 },
      { x: 330, y: 120 }, { x: 485, y: 205 }, { x: 610, y: 120 }, { x: 775, y: 185 },
      { x: 705, y: 330 }, { x: 810, y: 430 }, { x: 990, y: 430 }
    ],
    spots: [
      { x: 125, y: 330 }, { x: 250, y: 220 }, { x: 345, y: 65 },
      { x: 465, y: 295 }, { x: 595, y: 210 }, { x: 715, y: 115 },
      { x: 760, y: 345 }, { x: 870, y: 365 }, { x: 875, y: 470 }
    ],
    waves: STAGE_4_WAVES,
    tip: '관문 군주는 라이프를 크게 깎습니다. 병영을 여러 겹으로 배치하고 포탑 충격탄으로 보스 행렬을 늦추세요.'
  },
  stage_005: {
    id: 'stage_005', number: 5, title: '검은 성채', subtitle: '광신도와 강령술사의 밤', theme: 'fortress', difficulty: '악몽 입구',
    startGold: 590, maxLives: 19, unlockRequires: 'stage_004',
    path: [
      { x: -30, y: 130 }, { x: 125, y: 130 }, { x: 210, y: 250 }, { x: 110, y: 405 },
      { x: 305, y: 430 }, { x: 465, y: 300 }, { x: 610, y: 360 }, { x: 745, y: 240 },
      { x: 670, y: 110 }, { x: 850, y: 155 }, { x: 990, y: 260 }
    ],
    spots: [
      { x: 130, y: 220 }, { x: 255, y: 150 }, { x: 230, y: 360 }, { x: 400, y: 420 },
      { x: 510, y: 225 }, { x: 620, y: 455 }, { x: 720, y: 330 }, { x: 760, y: 115 }, { x: 870, y: 225 }
    ],
    waves: STAGE_5_WAVES,
    tip: '암살자는 전선을 빠르게 뚫고, 강령술사는 마법 저항이 높습니다. 궁수와 포탑 라인을 넓게 가져가세요.'
  },
  stage_006: {
    id: 'stage_006', number: 6, title: '용의 화산', subtitle: '하늘을 뒤덮는 불꽃 군단', theme: 'canyon', difficulty: '화염 지옥',
    startGold: 640, maxLives: 18, unlockRequires: 'stage_005',
    path: [
      { x: -30, y: 440 }, { x: 90, y: 440 }, { x: 180, y: 340 }, { x: 295, y: 390 },
      { x: 410, y: 270 }, { x: 315, y: 145 }, { x: 520, y: 105 }, { x: 680, y: 185 },
      { x: 600, y: 350 }, { x: 790, y: 430 }, { x: 990, y: 330 }
    ],
    spots: [
      { x: 120, y: 350 }, { x: 245, y: 300 }, { x: 350, y: 470 }, { x: 430, y: 180 },
      { x: 540, y: 195 }, { x: 650, y: 95 }, { x: 695, y: 315 }, { x: 810, y: 365 }, { x: 875, y: 260 }
    ],
    waves: STAGE_6_WAVES,
    tip: '화산룡과 불사조는 공중 보스급 위협입니다. 궁수 레벨업과 마법사 배치를 아끼지 마세요.'
  },
  stage_007: {
    id: 'stage_007', number: 7, title: '공허의 탑', subtitle: '현실을 찢는 균열', theme: 'swamp', difficulty: '불가능에 가까움',
    startGold: 690, maxLives: 17, unlockRequires: 'stage_006',
    path: [
      { x: -30, y: 270 }, { x: 140, y: 270 }, { x: 240, y: 120 }, { x: 410, y: 185 },
      { x: 330, y: 350 }, { x: 520, y: 425 }, { x: 680, y: 300 }, { x: 580, y: 150 },
      { x: 790, y: 100 }, { x: 850, y: 315 }, { x: 990, y: 315 }
    ],
    spots: [
      { x: 120, y: 180 }, { x: 210, y: 340 }, { x: 310, y: 210 }, { x: 430, y: 85 },
      { x: 480, y: 340 }, { x: 610, y: 435 }, { x: 665, y: 210 }, { x: 785, y: 200 }, { x: 875, y: 395 }
    ],
    waves: STAGE_7_WAVES,
    tip: '공허 벌레는 매우 빠릅니다. 여러 겹의 병영과 감속, 포탑 광역을 겹쳐야 합니다.'
  },
  stage_008: {
    id: 'stage_008', number: 8, title: '왕의 최후 방어선', subtitle: '모든 보스가 몰려오는 결전', theme: 'fortress', difficulty: '최종 결전',
    startGold: 760, maxLives: 16, unlockRequires: 'stage_007',
    path: [
      { x: -30, y: 455 }, { x: 130, y: 455 }, { x: 210, y: 330 }, { x: 120, y: 205 },
      { x: 285, y: 105 }, { x: 450, y: 190 }, { x: 570, y: 100 }, { x: 760, y: 135 },
      { x: 690, y: 285 }, { x: 805, y: 405 }, { x: 990, y: 405 }
    ],
    spots: [
      { x: 110, y: 360 }, { x: 230, y: 240 }, { x: 315, y: 55 }, { x: 410, y: 285 },
      { x: 545, y: 205 }, { x: 640, y: 85 }, { x: 735, y: 245 }, { x: 860, y: 310 }, { x: 860, y: 470 }, { x: 620, y: 430 }
    ],
    waves: STAGE_8_WAVES,
    tip: '결전 스테이지입니다. 모든 타워의 Lv.3 특수 스킬, 영웅, 용병, 메테오를 전부 순환시켜야 합니다.'
  },

  stage_009: {
    id: 'stage_009', number: 9, title: '수정 숲의 반격', subtitle: '분열된 정령로와 공허 전초대', theme: 'forest', difficulty: '원정 I',
    startGold: 800, maxLives: 18, unlockRequires: 'stage_008',
    path: [
      { x: -30, y: 315 }, { x: 120, y: 315 }, { x: 190, y: 190 }, { x: 350, y: 120 },
      { x: 505, y: 220 }, { x: 430, y: 390 }, { x: 610, y: 430 }, { x: 760, y: 300 }, { x: 990, y: 300 }
    ],
    spots: [
      { x: 130, y: 220 }, { x: 235, y: 310 }, { x: 350, y: 210 }, { x: 470, y: 115 },
      { x: 535, y: 340 }, { x: 660, y: 355 }, { x: 745, y: 205 }, { x: 850, y: 375 }
    ],
    waves: STAGE_9_WAVES,
    tip: '새 원정 구간입니다. 분산 길목에 감속과 포탑을 겹치고 빠른 공허 벌레는 병영으로 끊어내세요.'
  },
  stage_010: {
    id: 'stage_010', number: 10, title: '화염 왕관 협곡', subtitle: '불사조와 화산룡의 회랑', theme: 'canyon', difficulty: '원정 II',
    startGold: 850, maxLives: 17, unlockRequires: 'stage_009',
    path: [
      { x: -30, y: 430 }, { x: 100, y: 430 }, { x: 175, y: 310 }, { x: 300, y: 360 },
      { x: 420, y: 230 }, { x: 330, y: 120 }, { x: 550, y: 105 }, { x: 705, y: 210 },
      { x: 630, y: 390 }, { x: 825, y: 450 }, { x: 990, y: 350 }
    ],
    spots: [
      { x: 115, y: 335 }, { x: 245, y: 245 }, { x: 350, y: 450 }, { x: 430, y: 130 },
      { x: 545, y: 205 }, { x: 660, y: 110 }, { x: 705, y: 335 }, { x: 845, y: 385 }, { x: 875, y: 260 }
    ],
    waves: STAGE_10_WAVES,
    tip: '공중 적 비중이 높습니다. 궁수 장궁/저격 분기와 메테오 순환이 핵심입니다.'
  },
  stage_011: {
    id: 'stage_011', number: 11, title: '공허 정원', subtitle: '현실이 접히는 나선 방어선', theme: 'swamp', difficulty: '원정 III',
    startGold: 900, maxLives: 16, unlockRequires: 'stage_010',
    path: [
      { x: -30, y: 170 }, { x: 135, y: 170 }, { x: 260, y: 270 }, { x: 145, y: 410 },
      { x: 360, y: 430 }, { x: 520, y: 320 }, { x: 445, y: 165 }, { x: 640, y: 105 },
      { x: 810, y: 210 }, { x: 730, y: 395 }, { x: 990, y: 395 }
    ],
    spots: [
      { x: 120, y: 260 }, { x: 250, y: 160 }, { x: 315, y: 360 }, { x: 470, y: 410 },
      { x: 530, y: 215 }, { x: 675, y: 180 }, { x: 785, y: 315 }, { x: 855, y: 455 }, { x: 830, y: 115 }
    ],
    waves: STAGE_11_WAVES,
    tip: '공허 사제와 빠른 암살자가 동시에 옵니다. 타겟 우선순위 변경과 영웅 발구르기를 적극 활용하세요.'
  },
  stage_012: {
    id: 'stage_012', number: 12, title: '천공 왕좌 결전', subtitle: '왕국 원정의 최종 시험', theme: 'fortress', difficulty: '원정 최종',
    startGold: 980, maxLives: 15, unlockRequires: 'stage_011',
    path: [
      { x: -30, y: 455 }, { x: 120, y: 455 }, { x: 205, y: 330 }, { x: 120, y: 210 },
      { x: 290, y: 105 }, { x: 455, y: 195 }, { x: 575, y: 105 }, { x: 760, y: 135 },
      { x: 690, y: 285 }, { x: 810, y: 405 }, { x: 990, y: 405 }
    ],
    spots: [
      { x: 110, y: 365 }, { x: 230, y: 240 }, { x: 315, y: 55 }, { x: 415, y: 290 },
      { x: 545, y: 205 }, { x: 640, y: 85 }, { x: 735, y: 245 }, { x: 860, y: 310 }, { x: 860, y: 470 }, { x: 620, y: 430 }
    ],
    waves: STAGE_12_WAVES,
    tip: '모든 보스가 강화되어 등장합니다. 최종 진화, 긴급 강화, 용병, 메테오를 동시에 순환해야 합니다.'
  },
};

export const STAGE_LIST: StageConfig[] = [
  STAGES.stage_001, STAGES.stage_002, STAGES.stage_003, STAGES.stage_004,
  STAGES.stage_005, STAGES.stage_006, STAGES.stage_007, STAGES.stage_008,
  STAGES.stage_009, STAGES.stage_010, STAGES.stage_011, STAGES.stage_012
];

export function getStageConfig(stageId?: string): StageConfig {
  return STAGES[stageId as StageId] ?? STAGES.stage_001;
}

export const MAX_LIVES = STAGES[STAGE_ID].maxLives;
export const START_GOLD = STAGES[STAGE_ID].startGold;
export const WAVES = STAGES[STAGE_ID].waves;
