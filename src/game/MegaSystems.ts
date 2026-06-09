import type { StageId, EnemyKind, TowerKind } from './types';

export type DifficultyMode = 'normal' | 'veteran' | 'nightmare';
export type DailyModifierId = 'gold_rush' | 'no_mage' | 'air_raid' | 'iron_wall' | 'meteor_storm' | 'hero_trial';
export type AchievementId =
  | 'first_clear'
  | 'perfect_stage'
  | 'stage_004_clear'
  | 'stage_008_clear'
  | 'tower_master'
  | 'boss_hunter'
  | 'daily_challenger';

export type DailyChallenge = {
  dateKey: string;
  stageId: StageId;
  modifiers: DailyModifierId[];
  seed: number;
};

export type Achievement = {
  id: AchievementId;
  title: string;
  description: string;
  rewardStars: number;
};

export type Relic = {
  id: string;
  title: string;
  description: string;
  tower?: TowerKind;
  enemyCounter?: EnemyKind;
};

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_clear', title: '첫 승리', description: '아무 스테이지나 처음으로 클리어', rewardStars: 1 },
  { id: 'perfect_stage', title: '완벽한 방어', description: '라이프 손실 없이 스테이지 클리어', rewardStars: 2 },
  { id: 'stage_004_clear', title: '관문 돌파', description: '마왕의 관문 클리어', rewardStars: 2 },
  { id: 'stage_008_clear', title: '왕국의 수호자', description: '왕의 최후 방어선 클리어', rewardStars: 5 },
  { id: 'tower_master', title: '전술 건축가', description: '한 판에서 네 종류 타워를 모두 Lv.3 달성', rewardStars: 2 },
  { id: 'boss_hunter', title: '보스 사냥꾼', description: '보스급 적 10마리 처치', rewardStars: 3 },
  { id: 'daily_challenger', title: '오늘의 지휘관', description: '일일 도전 1회 클리어', rewardStars: 1 },
];

export const RELICS: Relic[] = [
  { id: 'oak_bow', title: '참나무 장궁', tower: 'archer', description: '궁수 타워의 첫 사격이 독화살로 시작됩니다.' },
  { id: 'arcane_core', title: '비전 핵', tower: 'mage', description: '마법사 타워가 방어 높은 적을 우선 조준합니다.' },
  { id: 'captain_banner', title: '대장의 깃발', tower: 'barracks', description: '병영 병사가 집결지 변경 후 3초간 받는 피해가 감소합니다.' },
  { id: 'thunder_powder', title: '천둥 화약', tower: 'artillery', description: '포탑 폭발이 낮은 확률로 짧은 기절을 겁니다.' },
];

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
  const stageNumbers: StageId[] = ['stage_002', 'stage_003', 'stage_004', 'stage_005', 'stage_006', 'stage_007'];
  const modifierPool: DailyModifierId[] = ['gold_rush', 'no_mage', 'air_raid', 'iron_wall', 'meteor_storm', 'hero_trial'];
  const stageId = stageNumbers[seed % stageNumbers.length];
  const first = modifierPool[(seed >>> 3) % modifierPool.length];
  const second = modifierPool[(seed >>> 11) % modifierPool.length];
  return {
    dateKey,
    stageId,
    seed,
    modifiers: first === second ? [first] : [first, second],
  };
}

export function modifierLabel(id: DailyModifierId): string {
  if (id === 'gold_rush') return '골드 러시: 처치 보상 증가, 적 수 증가';
  if (id === 'no_mage') return '마력 봉인: 마법사 타워 비용 증가';
  if (id === 'air_raid') return '공습 경보: 공중 적 비율 증가';
  if (id === 'iron_wall') return '강철 행군: 탱커 방어력 증가';
  if (id === 'meteor_storm') return '메테오 폭풍: 메테오 쿨타임 감소';
  return '영웅 시험: 영웅 스킬 피해 증가, 재사용 증가';
}
