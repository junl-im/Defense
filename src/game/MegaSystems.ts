import type { EnemyKind, StageId, TowerKind } from './types';

export type DifficultyMode = 'normal' | 'veteran' | 'nightmare';
export type DailyModifierId =
  | 'gold_rush'
  | 'no_mage'
  | 'air_raid'
  | 'iron_wall'
  | 'meteor_storm'
  | 'hero_trial'
  | 'boss_contract';

export type AchievementId =
  | 'first_clear'
  | 'perfect_stage'
  | 'stage_004_clear'
  | 'stage_008_clear'
  | 'stage_012_clear'
  | 'forest_guardian'
  | 'volcano_breaker'
  | 'void_breaker'
  | 'daily_challenger'
  | 'relic_collector'
  | 'legend_commander';

export type RelicId =
  | 'oak_bow'
  | 'arcane_core'
  | 'captain_banner'
  | 'thunder_powder'
  | 'merchant_contract'
  | 'sunstone_charm'
  | 'witch_bottle'
  | 'ogre_chain'
  | 'phoenix_feather'
  | 'void_lens'
  | 'royal_seal'
  | 'dragon_scale';

export type DailyChallenge = {
  dateKey: string;
  stageId: StageId;
  modifiers: DailyModifierId[];
  seed: number;
  rewardRelicId?: RelicId;
};

export type Achievement = {
  id: AchievementId;
  title: string;
  description: string;
  rewardRelicId?: RelicId;
  rewardHonor: number;
};

export type Relic = {
  id: RelicId;
  title: string;
  grade: 'common' | 'rare' | 'epic' | 'legendary';
  description: string;
  tower?: TowerKind;
  enemyCounter?: EnemyKind;
};

export type MetaState = {
  ownedRelics: RelicId[];
  equippedRelics: RelicId[];
  claimedAchievements: AchievementId[];
  claimedDailyKeys: string[];
  honor: number;
  lastSeenDailyKey?: string;
};

export type RelicBattleBonuses = {
  archerDamageMultiplier: number;
  archerFireRateMultiplier: number;
  mageDamageMultiplier: number;
  barracksHpBonus: number;
  barracksDamageMultiplier: number;
  artillerySplashBonus: number;
  startGoldBonus: number;
  meteorCooldownMultiplier: number;
  trueDamageBonus: number;
};

export const RELIC_SLOT_COUNT = 3;

export const RELICS: Relic[] = [
  { id: 'oak_bow', title: '참나무 장궁', grade: 'common', tower: 'archer', description: '궁수 피해 +12%, 공격 간격 5% 감소.' },
  { id: 'arcane_core', title: '비전 핵', grade: 'common', tower: 'mage', description: '마법사 피해 +15%.' },
  { id: 'captain_banner', title: '대장의 깃발', grade: 'common', tower: 'barracks', description: '병영 병사 체력 +30, 피해 +8%.' },
  { id: 'thunder_powder', title: '천둥 화약', grade: 'common', tower: 'artillery', description: '포탑 폭발 범위 +12.' },
  { id: 'merchant_contract', title: '상단 계약서', grade: 'rare', description: '시작 골드 +60.' },
  { id: 'sunstone_charm', title: '태양석 부적', grade: 'rare', description: '메테오 재사용 시간 15% 감소.' },
  { id: 'witch_bottle', title: '마녀의 독병', grade: 'rare', tower: 'archer', description: '궁수 피해 +6%, 진실 피해 보너스 +5.' },
  { id: 'ogre_chain', title: '오우거 족쇄', grade: 'epic', enemyCounter: 'ogre', description: '보스에게 주는 진실 피해 +10.' },
  { id: 'phoenix_feather', title: '불사조 깃털', grade: 'epic', enemyCounter: 'phoenix', description: '공중 보스 대응용. 시작 골드 +40, 메테오 재사용 10% 감소.' },
  { id: 'void_lens', title: '공허 렌즈', grade: 'epic', enemyCounter: 'titan', description: '마법사 피해 +10%, 보스 진실 피해 +8.' },
  { id: 'royal_seal', title: '왕가의 인장', grade: 'legendary', description: '모든 전선 강화: 시작 골드 +100, 병영 체력 +25.' },
  { id: 'dragon_scale', title: '화산룡 비늘', grade: 'legendary', enemyCounter: 'dragon', description: '포탑 범위 +10, 메테오 재사용 10% 감소.' },
];

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_clear', title: '첫 승리', description: '아무 스테이지나 처음으로 클리어', rewardRelicId: 'merchant_contract', rewardHonor: 10 },
  { id: 'perfect_stage', title: '완벽한 방어', description: '아무 스테이지나 3별 클리어', rewardRelicId: 'sunstone_charm', rewardHonor: 18 },
  { id: 'forest_guardian', title: '숲길 수호자', description: 'Stage 001과 Stage 002 클리어', rewardRelicId: 'witch_bottle', rewardHonor: 20 },
  { id: 'stage_004_clear', title: '관문 돌파', description: 'Stage 004 마왕의 관문 클리어', rewardRelicId: 'ogre_chain', rewardHonor: 24 },
  { id: 'volcano_breaker', title: '화산 돌파자', description: 'Stage 006 용의 화산 클리어', rewardRelicId: 'phoenix_feather', rewardHonor: 30 },
  { id: 'void_breaker', title: '공허 절단자', description: 'Stage 007 공허의 탑 클리어', rewardRelicId: 'void_lens', rewardHonor: 35 },
  { id: 'stage_008_clear', title: '왕국의 수호자', description: 'Stage 008 왕의 최후 방어선 클리어', rewardRelicId: 'royal_seal', rewardHonor: 60 },
  { id: 'stage_012_clear', title: '원정의 지휘관', description: 'Stage 012 천공 왕좌 결전 클리어', rewardRelicId: 'dragon_scale', rewardHonor: 95 },
  { id: 'daily_challenger', title: '오늘의 지휘관', description: '일일 도전 보상 1회 수령', rewardRelicId: 'dragon_scale', rewardHonor: 22 },
  { id: 'relic_collector', title: '유물 수집가', description: '유물 6개 이상 보유', rewardHonor: 26 },
  { id: 'legend_commander', title: '전설의 지휘관', description: '3별 클리어 스테이지 4개 이상', rewardHonor: 80 },
];

const STARTER_RELICS: RelicId[] = ['oak_bow', 'arcane_core', 'captain_banner', 'thunder_powder'];

function storageKey(uid?: string): string {
  return `kingdom-seed:meta:${uid || 'guest'}`;
}

function fallbackState(): MetaState {
  return {
    ownedRelics: [...STARTER_RELICS],
    equippedRelics: ['oak_bow', 'captain_banner', 'thunder_powder'],
    claimedAchievements: [],
    claimedDailyKeys: [],
    honor: 0,
  };
}

function normalizeState(value: Partial<MetaState> | undefined): MetaState {
  const base = fallbackState();
  const owned = Array.from(new Set([...(value?.ownedRelics ?? []), ...STARTER_RELICS]));
  const equipped = (value?.equippedRelics ?? base.equippedRelics)
    .filter((id): id is RelicId => owned.includes(id as RelicId))
    .slice(0, RELIC_SLOT_COUNT);
  return {
    ownedRelics: owned as RelicId[],
    equippedRelics: equipped,
    claimedAchievements: Array.from(new Set(value?.claimedAchievements ?? [])) as AchievementId[],
    claimedDailyKeys: Array.from(new Set(value?.claimedDailyKeys ?? [])),
    honor: Math.max(0, Math.floor(value?.honor ?? 0)),
    lastSeenDailyKey: value?.lastSeenDailyKey,
  };
}

export function loadMetaState(uid?: string): MetaState {
  try {
    const key = storageKey(uid);
    const raw = localStorage.getItem(key);
    localStorage.setItem('kingdom-seed:meta:active', key);
    if (!raw) {
      const fresh = fallbackState();
      localStorage.setItem(key, JSON.stringify(fresh));
      return fresh;
    }
    return normalizeState(JSON.parse(raw) as Partial<MetaState>);
  } catch {
    return fallbackState();
  }
}

export function saveMetaState(state: MetaState, uid?: string): MetaState {
  const next = normalizeState(state);
  try {
    const key = storageKey(uid);
    localStorage.setItem(key, JSON.stringify(next));
    localStorage.setItem('kingdom-seed:meta:active', key);
  } catch {
    // localStorage unavailable.
  }
  return next;
}

function activeMetaState(): MetaState {
  try {
    const active = localStorage.getItem('kingdom-seed:meta:active') ?? storageKey();
    const raw = localStorage.getItem(active);
    return normalizeState(raw ? JSON.parse(raw) as Partial<MetaState> : undefined);
  } catch {
    return fallbackState();
  }
}

export function equipRelic(state: MetaState, id: RelicId): MetaState {
  if (!state.ownedRelics.includes(id)) return state;
  const equipped = state.equippedRelics.filter((item) => item !== id);
  equipped.unshift(id);
  return normalizeState({ ...state, equippedRelics: equipped.slice(0, RELIC_SLOT_COUNT) });
}

export function unequipRelic(state: MetaState, id: RelicId): MetaState {
  return normalizeState({ ...state, equippedRelics: state.equippedRelics.filter((item) => item !== id) });
}

export function getRelic(id: RelicId): Relic {
  return RELICS.find((relic) => relic.id === id) ?? RELICS[0];
}

export function getRelicBattleBonuses(state = activeMetaState()): RelicBattleBonuses {
  const bonuses: RelicBattleBonuses = {
    archerDamageMultiplier: 1,
    archerFireRateMultiplier: 1,
    mageDamageMultiplier: 1,
    barracksHpBonus: 0,
    barracksDamageMultiplier: 1,
    artillerySplashBonus: 0,
    startGoldBonus: 0,
    meteorCooldownMultiplier: 1,
    trueDamageBonus: 0,
  };

  state.equippedRelics.forEach((id) => {
    if (id === 'oak_bow') {
      bonuses.archerDamageMultiplier += 0.12;
      bonuses.archerFireRateMultiplier *= 0.95;
    } else if (id === 'arcane_core') {
      bonuses.mageDamageMultiplier += 0.15;
    } else if (id === 'captain_banner') {
      bonuses.barracksHpBonus += 30;
      bonuses.barracksDamageMultiplier += 0.08;
    } else if (id === 'thunder_powder') {
      bonuses.artillerySplashBonus += 12;
    } else if (id === 'merchant_contract') {
      bonuses.startGoldBonus += 60;
    } else if (id === 'sunstone_charm') {
      bonuses.meteorCooldownMultiplier *= 0.85;
    } else if (id === 'witch_bottle') {
      bonuses.archerDamageMultiplier += 0.06;
      bonuses.trueDamageBonus += 5;
    } else if (id === 'ogre_chain') {
      bonuses.trueDamageBonus += 10;
    } else if (id === 'phoenix_feather') {
      bonuses.startGoldBonus += 40;
      bonuses.meteorCooldownMultiplier *= 0.9;
    } else if (id === 'void_lens') {
      bonuses.mageDamageMultiplier += 0.1;
      bonuses.trueDamageBonus += 8;
    } else if (id === 'royal_seal') {
      bonuses.startGoldBonus += 100;
      bonuses.barracksHpBonus += 25;
    } else if (id === 'dragon_scale') {
      bonuses.artillerySplashBonus += 10;
      bonuses.meteorCooldownMultiplier *= 0.9;
    }
  });

  return bonuses;
}

export function makeDateKey(date = new Date()): string {
  const yyyy = date.getFullYear();
  const mm = `${date.getMonth() + 1}`.padStart(2, '0');
  const dd = `${date.getDate()}`.padStart(2, '0');
  return `${yyyy}${mm}${dd}`;
}

function hashString(value: string): number {
  let h = 2166136261;
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function getDailyChallenge(date = new Date()): DailyChallenge {
  const dateKey = makeDateKey(date);
  const seed = hashString(`kingdom-seed:${dateKey}`);
  const stageNumbers: StageId[] = ['stage_002', 'stage_003', 'stage_004', 'stage_005', 'stage_006', 'stage_007', 'stage_008', 'stage_009', 'stage_010', 'stage_011', 'stage_012'];
  const modifierPool: DailyModifierId[] = ['gold_rush', 'no_mage', 'air_raid', 'iron_wall', 'meteor_storm', 'hero_trial', 'boss_contract'];
  const stageId = stageNumbers[seed % stageNumbers.length];
  const first = modifierPool[(seed >>> 3) % modifierPool.length];
  const second = modifierPool[(seed >>> 11) % modifierPool.length];
  const rewardPool: RelicId[] = ['merchant_contract', 'sunstone_charm', 'witch_bottle', 'ogre_chain', 'phoenix_feather', 'void_lens', 'dragon_scale'];
  return {
    dateKey,
    stageId,
    seed,
    modifiers: first === second ? [first] : [first, second],
    rewardRelicId: rewardPool[(seed >>> 19) % rewardPool.length],
  };
}

export function modifierLabel(id: DailyModifierId): string {
  if (id === 'gold_rush') return '골드 러시: 시작 골드 +25%, 처치 보상 압박 증가';
  if (id === 'no_mage') return '마력 봉인: 마법사 타워 비용 증가';
  if (id === 'air_raid') return '공습 경보: 공중 적 중심 전술 필요';
  if (id === 'iron_wall') return '강철 행군: 탱커 방어력 상승';
  if (id === 'meteor_storm') return '메테오 폭풍: 메테오 쿨타임 감소';
  if (id === 'boss_contract') return '보스 계약: 보스 고유 패턴 빈도 증가';
  return '영웅 시험: 영웅 공격력 증가, 직접 조작 중요';
}

export function evaluateAchievement(
  id: AchievementId,
  save: { clearedStages?: Record<string, { bestStars?: number; bestScore?: number }> },
  state: MetaState
): boolean {
  const cleared = save.clearedStages ?? {};
  const isClear = (stageId: StageId) => (cleared[stageId]?.bestStars ?? 0) > 0;
  const perfectCount = Object.values(cleared).filter((stage) => (stage.bestStars ?? 0) >= 3).length;
  const clearCount = Object.values(cleared).filter((stage) => (stage.bestStars ?? 0) > 0).length;

  if (id === 'first_clear') return clearCount >= 1;
  if (id === 'perfect_stage') return perfectCount >= 1;
  if (id === 'forest_guardian') return isClear('stage_001') && isClear('stage_002');
  if (id === 'stage_004_clear') return isClear('stage_004');
  if (id === 'volcano_breaker') return isClear('stage_006');
  if (id === 'void_breaker') return isClear('stage_007');
  if (id === 'stage_008_clear') return isClear('stage_008');
  if (id === 'stage_012_clear') return isClear('stage_012');
  if (id === 'daily_challenger') return state.claimedDailyKeys.length >= 1;
  if (id === 'relic_collector') return state.ownedRelics.length >= 6;
  if (id === 'legend_commander') return perfectCount >= 4;
  return false;
}

export function claimAchievement(id: AchievementId, state: MetaState): MetaState {
  if (state.claimedAchievements.includes(id)) return state;
  const achievement = ACHIEVEMENTS.find((item) => item.id === id);
  const owned = new Set(state.ownedRelics);
  if (achievement?.rewardRelicId) owned.add(achievement.rewardRelicId);
  return normalizeState({
    ...state,
    ownedRelics: Array.from(owned),
    claimedAchievements: [...state.claimedAchievements, id],
    honor: state.honor + (achievement?.rewardHonor ?? 0),
  });
}

export function claimDailyReward(challenge: DailyChallenge, state: MetaState): MetaState {
  if (state.claimedDailyKeys.includes(challenge.dateKey)) return state;
  const owned = new Set(state.ownedRelics);
  if (challenge.rewardRelicId) owned.add(challenge.rewardRelicId);
  return normalizeState({
    ...state,
    ownedRelics: Array.from(owned),
    claimedDailyKeys: [...state.claimedDailyKeys, challenge.dateKey],
    lastSeenDailyKey: challenge.dateKey,
    honor: state.honor + 12,
  });
}

export function bossPatternLabel(kind: EnemyKind): string {
  if (kind === 'demonlord') return '지옥 장막: 짧은 시간 받는 피해 감소';
  if (kind === 'dragon') return '화염 포효: 이동 속도 증가와 광역 압박';
  if (kind === 'titan') return '공허 균열: 체력 회복과 순간 돌진';
  if (kind === 'ogre' || kind === 'golem' || kind === 'abomination') return '지진 강타: 주변 전선을 흔드는 탱커 패턴';
  if (kind === 'phoenix') return '재점화: 체력 회복';
  return '보스 패턴: 강화 페이즈';
}

export function bossPatternCooldown(kind: EnemyKind): number {
  if (kind === 'dragon' || kind === 'titan' || kind === 'demonlord') return 4800;
  if (kind === 'phoenix') return 5600;
  return 6800;
}
