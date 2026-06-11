import type { EnemyConfig, StageConfig } from './types';

export type RunModifierId =
  | 'spring_breeze'
  | 'market_caravan'
  | 'misty_route'
  | 'blood_moon'
  | 'arcane_flux'
  | 'air_raid'
  | 'siege_drums'
  | 'royal_inspiration'
  | 'elite_patrol';

export type RunModifierTone = 'good' | 'neutral' | 'danger' | 'magic' | 'air';

export type RunModifier = {
  id: RunModifierId;
  label: string;
  shortLabel: string;
  description: string;
  tone: RunModifierTone;
  startGold?: number;
  startLives?: number;
  enemyHpMultiplier?: number;
  enemySpeedMultiplier?: number;
  rewardMultiplier?: number;
  flyingHpMultiplier?: number;
  tankArmorBonus?: number;
  magicResistBonus?: number;
  towerDamageMultiplier?: number;
  towerFireRateMultiplier?: number;
  eliteEvery?: number;
};

const CATALOG: Record<RunModifierId, RunModifier> = {
  spring_breeze: {
    id: 'spring_breeze', label: '봄바람 보급로', shortLabel: '보급', tone: 'good',
    description: '초반 골드가 증가하고 적 보상도 소폭 증가합니다.', startGold: 55, rewardMultiplier: 1.06,
  },
  market_caravan: {
    id: 'market_caravan', label: '상단 지원', shortLabel: '상단', tone: 'good',
    description: '건설 운영이 쉬워지도록 시작 골드와 생명력이 증가합니다.', startGold: 35, startLives: 1,
  },
  misty_route: {
    id: 'misty_route', label: '안개 낀 길목', shortLabel: '안개', tone: 'neutral',
    description: '빠른 적이 조금 느려지지만 보스는 더 단단해집니다.', enemySpeedMultiplier: 0.96, tankArmorBonus: 0.03,
  },
  blood_moon: {
    id: 'blood_moon', label: '붉은 달', shortLabel: '달', tone: 'danger',
    description: '적 체력이 증가하지만 처치 보상이 증가합니다.', enemyHpMultiplier: 1.08, rewardMultiplier: 1.12,
  },
  arcane_flux: {
    id: 'arcane_flux', label: '마력의 흐름', shortLabel: '마력', tone: 'magic',
    description: '마법 저항 적이 강해지고, 모든 타워 화력이 소폭 상승합니다.', magicResistBonus: 0.04, towerDamageMultiplier: 1.04,
  },
  air_raid: {
    id: 'air_raid', label: '공중 습격', shortLabel: '공중', tone: 'air',
    description: '공중 적의 체력이 증가하지만 공중 적 보상이 증가합니다.', flyingHpMultiplier: 1.10, rewardMultiplier: 1.05,
  },
  siege_drums: {
    id: 'siege_drums', label: '공성 북소리', shortLabel: '공성', tone: 'danger',
    description: '탱커와 보스의 방어력이 증가합니다.', tankArmorBonus: 0.06,
  },
  royal_inspiration: {
    id: 'royal_inspiration', label: '왕실 격려', shortLabel: '격려', tone: 'good',
    description: '타워 사격 템포가 소폭 빨라집니다.', towerFireRateMultiplier: 0.96,
  },
  elite_patrol: {
    id: 'elite_patrol', label: '정예 순찰대', shortLabel: '정예', tone: 'danger',
    description: '일부 웨이브에 정예 적이 섞여 나옵니다. 보상도 높습니다.', eliteEvery: 4,
  },
};

const ROTATION: RunModifierId[][] = [
  ['spring_breeze', 'elite_patrol'],
  ['market_caravan', 'air_raid'],
  ['misty_route', 'arcane_flux'],
  ['blood_moon', 'royal_inspiration'],
  ['siege_drums', 'spring_breeze'],
  ['arcane_flux', 'elite_patrol'],
  ['air_raid', 'royal_inspiration'],
  ['blood_moon', 'market_caravan'],
];

function stableHash(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function getStageRunModifiers(stage: StageConfig, seed = ''): RunModifier[] {
  const day = Math.floor(Date.now() / 86_400_000);
  const rotationIndex = (stage.number + day + stableHash(seed) % ROTATION.length) % ROTATION.length;
  const ids = ROTATION[rotationIndex];
  return ids.map((id) => CATALOG[id]);
}

export function getRunStartAdjustments(modifiers: RunModifier[]): { gold: number; lives: number } {
  return modifiers.reduce((acc, modifier) => ({
    gold: acc.gold + (modifier.startGold ?? 0),
    lives: acc.lives + (modifier.startLives ?? 0),
  }), { gold: 0, lives: 0 });
}

export function getTowerAura(modifiers: RunModifier[]): { damageMultiplier: number; fireRateMultiplier: number; label: string } {
  const damageMultiplier = modifiers.reduce((value, modifier) => value * (modifier.towerDamageMultiplier ?? 1), 1);
  const fireRateMultiplier = modifiers.reduce((value, modifier) => value * (modifier.towerFireRateMultiplier ?? 1), 1);
  const labels = modifiers.filter((modifier) => modifier.towerDamageMultiplier || modifier.towerFireRateMultiplier).map((modifier) => modifier.shortLabel);
  return { damageMultiplier, fireRateMultiplier, label: labels.join(' · ') || '기본' };
}

export function applyRunModifiersToEnemy(base: EnemyConfig, modifiers: RunModifier[], waveNumber: number, spawnIndex: number): EnemyConfig {
  const cfg: EnemyConfig = { ...base };
  let rewardMultiplier = 1;

  modifiers.forEach((modifier) => {
    if (modifier.enemyHpMultiplier) cfg.hp = Math.round(cfg.hp * modifier.enemyHpMultiplier);
    if (modifier.enemySpeedMultiplier) cfg.speed = Math.round(cfg.speed * modifier.enemySpeedMultiplier);
    if (modifier.rewardMultiplier) rewardMultiplier *= modifier.rewardMultiplier;
    if (modifier.flyingHpMultiplier && cfg.flying) cfg.hp = Math.round(cfg.hp * modifier.flyingHpMultiplier);
    if (modifier.tankArmorBonus && (cfg.threat === 'tank' || cfg.threat === 'boss')) cfg.armor = Math.min(0.82, cfg.armor + modifier.tankArmorBonus);
    if (modifier.magicResistBonus && cfg.magicResist >= 0.3) cfg.magicResist = Math.min(0.82, cfg.magicResist + modifier.magicResistBonus);

    if (modifier.eliteEvery && waveNumber > 0 && waveNumber % modifier.eliteEvery === 0 && spawnIndex % 5 === 0) {
      cfg.label = `정예 ${cfg.label}`;
      cfg.hp = Math.round(cfg.hp * 1.28);
      cfg.reward = Math.round(cfg.reward * 1.35);
      cfg.speed = Math.round(cfg.speed * 1.04);
      cfg.scale = (cfg.scale ?? 1) * 1.08;
      cfg.accentColor = 0xffd36b;
    }
  });

  cfg.reward = Math.max(1, Math.round(cfg.reward * rewardMultiplier));
  return cfg;
}

export function runModifierSummary(modifiers: RunModifier[]): string {
  return modifiers.map((modifier) => `${modifier.shortLabel}: ${modifier.description}`).join('  /  ');
}

export function runModifierColor(tone: RunModifierTone): number {
  if (tone === 'good') return 0x8be878;
  if (tone === 'danger') return 0xff8a6c;
  if (tone === 'magic') return 0xb993ff;
  if (tone === 'air') return 0x8fdcff;
  return 0xffd56c;
}
