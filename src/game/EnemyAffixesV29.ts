import type { EnemyConfig, StageConfig } from './types';

export type EnemyAffixV29Id =
  | 'none'
  | 'gold_pouch'
  | 'swift_feet'
  | 'iron_shell'
  | 'mana_veil'
  | 'unstable_core'
  | 'scout_split';

export type EnemyAffixRuntimeV29 = {
  id: EnemyAffixV29Id;
  title: string;
  shortLabel: string;
  description: string;
  color: number;
  risk: number;
};

const AFFIX_POOL: EnemyAffixRuntimeV29[] = [
  {
    id: 'gold_pouch',
    title: '보급 약탈대',
    shortLabel: '보급',
    description: '보상 골드가 늘어나지만 체력이 조금 증가합니다.',
    color: 0xffd56c,
    risk: 1,
  },
  {
    id: 'swift_feet',
    title: '신속 행군',
    shortLabel: '신속',
    description: '이동 속도가 빨라지고 보상이 소폭 증가합니다.',
    color: 0x8fdcff,
    risk: 2,
  },
  {
    id: 'iron_shell',
    title: '강철 장갑',
    shortLabel: '장갑',
    description: '물리 방어가 증가합니다. 마법 타워가 효율적입니다.',
    color: 0xb8c7d6,
    risk: 2,
  },
  {
    id: 'mana_veil',
    title: '마력 장막',
    shortLabel: '마저',
    description: '마법 저항이 증가합니다. 궁수/포탑 화력을 겹치세요.',
    color: 0xcaa4ff,
    risk: 2,
  },
  {
    id: 'unstable_core',
    title: '불안정 핵',
    shortLabel: '핵심',
    description: '체력이 낮아지지만 처치 보상이 커집니다.',
    color: 0xff9b6b,
    risk: 1,
  },
  {
    id: 'scout_split',
    title: '분산 정찰대',
    shortLabel: '분산',
    description: '소형 적이 더 빠르게 들어옵니다. 병영으로 묶으세요.',
    color: 0x9cff8f,
    risk: 1,
  },
];

export const NO_ENEMY_AFFIX_V29: EnemyAffixRuntimeV29 = {
  id: 'none',
  title: '기본 공세',
  shortLabel: '기본',
  description: '특수 변수 없음',
  color: 0xdbe7ff,
  risk: 0,
};

function hashString(value: string): number {
  let h = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function pickEnemyAffixV29(stage: StageConfig, userKey: string, waveIndex: number): EnemyAffixRuntimeV29 {
  if (waveIndex < 1) return NO_ENEMY_AFFIX_V29;
  // Boss waves are already dramatic through cut-ins/patterns. Keep those readable.
  const hasBoss = stage.waves[waveIndex]?.some((group) => group.kind === 'ogre' || group.kind === 'demonlord' || group.kind === 'dragon' || group.kind === 'titan');
  if (hasBoss) return NO_ENEMY_AFFIX_V29;
  const seed = hashString(`${stage.id}:${userKey}:v29:${waveIndex}`);
  if (waveIndex < 3 && seed % 3 === 0) return NO_ENEMY_AFFIX_V29;
  return AFFIX_POOL[seed % AFFIX_POOL.length];
}

export function applyEnemyAffixV29(config: EnemyConfig, affix: EnemyAffixRuntimeV29, spawnIndex: number): EnemyConfig {
  if (affix.id === 'none' || config.threat === 'boss') return config;
  const next: EnemyConfig = { ...config };
  const elitePulse = spawnIndex % 7 === 0;

  if (affix.id === 'gold_pouch') {
    next.label = `보급 ${next.label}`;
    next.hp = Math.round(next.hp * (elitePulse ? 1.18 : 1.1));
    next.reward = Math.round(next.reward * 1.28);
    next.accentColor = 0xffd56c;
  }

  if (affix.id === 'swift_feet') {
    next.label = `신속 ${next.label}`;
    next.speed = Math.round(next.speed * (elitePulse ? 1.18 : 1.1));
    next.hp = Math.round(next.hp * 0.96);
    next.reward = Math.round(next.reward * 1.12);
    next.accentColor = 0x8fdcff;
  }

  if (affix.id === 'iron_shell') {
    next.label = `장갑 ${next.label}`;
    next.armor = Math.min(0.76, next.armor + (elitePulse ? 0.16 : 0.1));
    next.speed = Math.round(next.speed * 0.97);
    next.reward = Math.round(next.reward * 1.16);
    next.accentColor = 0xb8c7d6;
  }

  if (affix.id === 'mana_veil') {
    next.label = `장막 ${next.label}`;
    next.magicResist = Math.min(0.78, next.magicResist + (elitePulse ? 0.18 : 0.12));
    next.reward = Math.round(next.reward * 1.15);
    next.accentColor = 0xcaa4ff;
  }

  if (affix.id === 'unstable_core') {
    next.label = `핵 ${next.label}`;
    next.hp = Math.round(next.hp * 0.88);
    next.speed = Math.round(next.speed * 1.04);
    next.reward = Math.round(next.reward * 1.3);
    next.accentColor = 0xff9b6b;
  }

  if (affix.id === 'scout_split') {
    next.label = `정찰 ${next.label}`;
    if (next.threat === 'swarm' || next.threat === 'fast') {
      next.speed = Math.round(next.speed * 1.12);
      next.hp = Math.round(next.hp * 0.94);
    } else {
      next.hp = Math.round(next.hp * 1.05);
    }
    next.reward = Math.round(next.reward * 1.1);
    next.accentColor = 0x9cff8f;
  }

  return next;
}

export function enemyAffixHudLineV29(affix: EnemyAffixRuntimeV29): string {
  if (affix.id === 'none') return '공세 변수: 기본';
  return `공세 변수: ${affix.shortLabel} · 위험 ${affix.risk}`;
}

export function enemyAffixFullLineV29(affix: EnemyAffixRuntimeV29): string {
  if (affix.id === 'none') return '이번 웨이브는 기본 공세입니다.';
  return `${affix.title}: ${affix.description}`;
}
