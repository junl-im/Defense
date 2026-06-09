export type EnemyKind =
  | 'goblin'
  | 'wolf'
  | 'brute'
  | 'bat'
  | 'orc'
  | 'shield'
  | 'shaman'
  | 'wasp'
  | 'ogre';

export type TowerKind = 'archer' | 'mage' | 'barracks' | 'artillery';
export type StageId = 'stage_001' | 'stage_002';

export type PathPoint = { x: number; y: number };

export type EnemyConfig = {
  kind: EnemyKind;
  label: string;
  hp: number;
  speed: number;
  reward: number;
  armor: number;
  magicResist: number;
  flying?: boolean;
  color: number;
  accentColor?: number;
  scale?: number;
  threat?: 'swarm' | 'fast' | 'tank' | 'flying' | 'support' | 'boss';
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
  delayAfterMs?: number;
};

export type StageConfig = {
  id: StageId;
  number: number;
  title: string;
  subtitle: string;
  theme: 'forest' | 'canyon';
  difficulty: string;
  startGold: number;
  maxLives: number;
  unlockRequires?: StageId;
  path: PathPoint[];
  spots: PathPoint[];
  waves: WaveSpawn[][];
  tip: string;
};
