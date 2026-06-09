import type { EnemyConfig, EnemyKind, TowerConfig, TowerKind, WaveSpawn } from './types';

export const STAGE_ID = 'stage_001';
export const MAX_LIVES = 20;
export const START_GOLD = 400;

export const ENEMIES: Record<EnemyKind, EnemyConfig> = {
  goblin: { kind: 'goblin', hp: 40, speed: 70, reward: 8, armor: 0, magicResist: 0 },
  wolf: { kind: 'wolf', hp: 32, speed: 115, reward: 9, armor: 0, magicResist: 0 },
  brute: { kind: 'brute', hp: 150, speed: 42, reward: 22, armor: 0.35, magicResist: 0 },
  bat: { kind: 'bat', hp: 28, speed: 95, reward: 10, armor: 0, magicResist: 0, flying: true }
};

export const TOWERS: Record<TowerKind, TowerConfig> = {
  archer: {
    kind: 'archer', label: '궁수', cost: 70, range: 145, fireRateMs: 430,
    damage: 14, canHitFlying: true, color: 0x8fd14f, maxSkill: '독화살'
  },
  mage: {
    kind: 'mage', label: '마법', cost: 100, range: 125, fireRateMs: 920,
    damage: 42, canHitFlying: true, color: 0xa970ff, maxSkill: '마력 감속'
  },
  barracks: {
    kind: 'barracks', label: '병영', cost: 80, range: 85, fireRateMs: 700,
    damage: 7, canHitFlying: false, color: 0x4fa3ff, maxSkill: '방패 태세'
  },
  artillery: {
    kind: 'artillery', label: '포탑', cost: 120, range: 130, fireRateMs: 1450,
    damage: 48, splashRadius: 48, canHitFlying: false, color: 0xffb347, maxSkill: '충격탄'
  }
};

export const WAVES: WaveSpawn[][] = [
  [{ kind: 'goblin', count: 10, gapMs: 650 }],
  [{ kind: 'goblin', count: 14, gapMs: 560 }, { kind: 'wolf', count: 4, gapMs: 800 }],
  [{ kind: 'wolf', count: 10, gapMs: 520 }],
  [{ kind: 'goblin', count: 18, gapMs: 420 }, { kind: 'brute', count: 2, gapMs: 1200 }],
  [{ kind: 'bat', count: 10, gapMs: 600 }],
  [{ kind: 'brute', count: 5, gapMs: 1000 }, { kind: 'goblin', count: 18, gapMs: 420 }],
  [{ kind: 'wolf', count: 18, gapMs: 430 }, { kind: 'bat', count: 8, gapMs: 550 }],
  [{ kind: 'brute', count: 8, gapMs: 850 }, { kind: 'wolf', count: 12, gapMs: 480 }],
  [{ kind: 'goblin', count: 28, gapMs: 320 }, { kind: 'bat', count: 14, gapMs: 420 }],
  [{ kind: 'brute', count: 12, gapMs: 700 }, { kind: 'wolf', count: 20, gapMs: 360 }]
];
