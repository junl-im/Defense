import type { EnemyKind } from './types';

export type MonsterTraitId = 'armor' | 'magic' | 'flying' | 'swift' | 'boss' | 'tank' | 'regen' | 'summon';

export type MonsterTrait = {
  id: MonsterTraitId;
  label: string;
  shortLabel: string;
  color: number;
  description: string;
};

export const MONSTER_TRAITS: Record<MonsterTraitId, MonsterTrait> = {
  armor: { id: 'armor', label: '장갑', shortLabel: 'DEF', color: 0x9aa7b5, description: '물리 피해를 줄입니다. 마법 타워로 대응하세요.' },
  magic: { id: 'magic', label: '마법저항', shortLabel: 'MR', color: 0xb27cff, description: '마법 피해를 줄입니다. 궁수/포탑으로 대응하세요.' },
  flying: { id: 'flying', label: '비행', shortLabel: 'AIR', color: 0x79d8ff, description: '병영으로 막을 수 없습니다. 궁수/마법 사거리 배치가 중요합니다.' },
  swift: { id: 'swift', label: '신속', shortLabel: 'SPD', color: 0x90ff9b, description: '빠르게 돌파합니다. 선두 타겟과 둔화가 효과적입니다.' },
  boss: { id: 'boss', label: '보스', shortLabel: 'BOSS', color: 0xff5b4f, description: '도착 시 라이프를 크게 잃습니다. 긴급 강화와 최종 진화를 활용하세요.' },
  tank: { id: 'tank', label: '탱커', shortLabel: 'HP', color: 0xffb85c, description: '체력이 높습니다. 병영으로 묶고 광역 화력을 집중하세요.' },
  regen: { id: 'regen', label: '재생', shortLabel: 'REG', color: 0x5cffb7, description: '시간이 지날수록 회복합니다. 집중 화력이 필요합니다.' },
  summon: { id: 'summon', label: '소환', shortLabel: 'SUM', color: 0xd6d0ff, description: '주변 전장을 흔드는 패턴을 보유합니다. 우선 처치가 좋습니다.' },
};

const TRAIT_MAP: Partial<Record<EnemyKind, MonsterTraitId[]>> = {
  goblin: ['swift'],
  wolf: ['swift'],
  brute: ['tank'],
  bat: ['flying', 'swift'],
  orc: ['tank'],
  shield: ['armor', 'tank'],
  shaman: ['magic', 'summon'],
  wasp: ['flying', 'swift'],
  ogre: ['boss', 'tank'],
  spider: ['swift'],
  specter: ['magic'],
  troll: ['tank', 'regen'],
  raider: ['swift'],
  gargoyle: ['flying', 'armor'],
  warlock: ['magic', 'summon'],
  golem: ['boss', 'armor', 'tank'],
  demonlord: ['boss', 'magic', 'tank'],
  cultist: ['magic'],
  assassin: ['swift'],
  wyvern: ['flying', 'tank'],
  necromancer: ['magic', 'summon'],
  abomination: ['tank', 'regen'],
  fireImp: ['swift', 'magic'],
  hellhound: ['swift', 'tank'],
  obsidianKnight: ['armor', 'tank'],
  phoenix: ['boss', 'flying', 'regen'],
  dragon: ['boss', 'flying', 'tank'],
  voidling: ['swift', 'magic'],
  voidPriest: ['magic', 'summon'],
  nightmare: ['armor', 'swift'],
  titan: ['boss', 'armor', 'tank'],
};

export function getMonsterTraits(kind: EnemyKind): MonsterTrait[] {
  return (TRAIT_MAP[kind] ?? []).map((traitId) => MONSTER_TRAITS[traitId]);
}

export type BossProfile = {
  title: string;
  subtitle: string;
  warning: string;
  quote: string;
  accent: number;
};

const BOSS_PROFILES: Partial<Record<EnemyKind, BossProfile>> = {
  ogre: { title: '오우거 전투대장', subtitle: '육중한 돌파자', warning: '병영으로 묶고 마법/포탑 화력을 집중하세요.', quote: '성문을 부숴라!', accent: 0xffb85c },
  golem: { title: '공성 골렘', subtitle: '철벽 장갑 괴수', warning: '장갑이 높습니다. 마법사 타워와 긴급 강화를 준비하세요.', quote: '돌과 쇠가 왕국을 짓밟는다.', accent: 0x9aa7b5 },
  demonlord: { title: '관문 군주', subtitle: '마왕의 선봉장', warning: '보스 패턴 중 받는 피해가 감소합니다. 타이밍을 보고 폭딜하세요.', quote: '불꽃 아래 무릎 꿇어라.', accent: 0xff5b4f },
  phoenix: { title: '불사조', subtitle: '되살아나는 화염', warning: '재생 패턴을 보유합니다. 공중 대응 타워가 필요합니다.', quote: '재가 되어도 다시 타오른다.', accent: 0xff8d3b },
  dragon: { title: '화산룡', subtitle: '하늘의 폭군', warning: '공중 보스입니다. 궁수 최종 진화와 메테오 타이밍이 중요합니다.', quote: '왕국의 하늘은 내 것이다.', accent: 0xff703b },
  titan: { title: '공허 거신', subtitle: '차원의 파괴자', warning: '체력/장갑이 매우 높습니다. 모든 전술 자원을 아끼지 마세요.', quote: '공허가 너희를 기억하지 않으리라.', accent: 0x9c7cff },
};

export function getBossProfile(kind: EnemyKind): BossProfile | undefined {
  return BOSS_PROFILES[kind];
}
