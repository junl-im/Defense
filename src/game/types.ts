export type EnemyKind = 'goblin' | 'wolf' | 'brute' | 'bat';
export type TowerKind = 'archer' | 'mage' | 'barracks' | 'artillery';

export type PathPoint = { x: number; y: number };

export type EnemyConfig = {
  kind: EnemyKind;
  hp: number;
  speed: number;
  reward: number;
  armor: number;
  magicResist: number;
  flying?: boolean;
};

export type TowerConfig = {
  kind: TowerKind;
  label: string;
  cost: number;
  range: number;
  fireRateMs: number;
  damage: number;
  splashRadius?: number;
  canHitFlying: boolean;
  color: number;
  maxSkill: string;
};

export type WaveSpawn = {
  kind: EnemyKind;
  count: number;
  gapMs: number;
};
