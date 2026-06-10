import type { PlayerSave } from '../services/firebase';

export type MissionId = 'daily_clear' | 'daily_stars' | 'daily_tower' | 'weekly_boss' | 'weekly_mastery';

export type MissionDefinition = {
  id: MissionId;
  title: string;
  subtitle: string;
  target: number;
  reward: string;
  category: 'daily' | 'weekly' | 'campaign';
};

export type MissionState = MissionDefinition & {
  progress: number;
  completed: boolean;
  claimed: boolean;
};

const CLAIM_PREFIX = 'kingdom-seed:mission-claimed:v28:';
const CHEST_KEY = 'kingdom-seed:reward-chests:v28';

const MISSIONS: MissionDefinition[] = [
  { id: 'daily_clear', title: '오늘의 방어선', subtitle: '아무 스테이지나 1회 클리어', target: 1, reward: '일반 보급 상자', category: 'daily' },
  { id: 'daily_stars', title: '별빛 작전', subtitle: '누적 별 6개 이상 보유', target: 6, reward: '희귀 룬 조각', category: 'daily' },
  { id: 'daily_tower', title: '건설 감독관', subtitle: '타워 최종 진화 1회 달성', target: 1, reward: '골드 부적', category: 'daily' },
  { id: 'weekly_boss', title: '보스 사냥꾼', subtitle: '보스 스테이지를 1회 이상 클리어', target: 1, reward: '영웅 휘장', category: 'weekly' },
  { id: 'weekly_mastery', title: '전술 장인', subtitle: '총 별 12개 이상 보유', target: 12, reward: '전설 보급 상자', category: 'weekly' },
];

function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
}

function claimedKey(id: MissionId): string {
  return `${CLAIM_PREFIX}${todayKey()}:${id}`;
}

function totalStars(save: PlayerSave): number {
  return Object.values(save.clearedStages ?? {}).reduce((sum, stage) => sum + Number(stage.bestStars ?? 0), 0);
}

function clearCount(save: PlayerSave): number {
  return Object.values(save.clearedStages ?? {}).reduce((sum, stage) => sum + Number(stage.clearCount ?? 0), 0);
}

export function getMissionStates(save: PlayerSave): MissionState[] {
  const stars = totalStars(save);
  const clears = clearCount(save);
  const bossClear = ['stage_004', 'stage_006', 'stage_007', 'stage_008'].some((id) => Boolean(save.clearedStages?.[id]?.bestStars));

  return MISSIONS.map((mission) => {
    let progress = 0;
    if (mission.id === 'daily_clear') progress = Math.min(clears, mission.target);
    if (mission.id === 'daily_stars') progress = Math.min(stars, mission.target);
    if (mission.id === 'daily_tower') progress = Number(localStorage.getItem('kingdom-seed:mastery-count:v27') ?? '0') > 0 ? 1 : 0;
    if (mission.id === 'weekly_boss') progress = bossClear ? 1 : 0;
    if (mission.id === 'weekly_mastery') progress = Math.min(stars, mission.target);
    const completed = progress >= mission.target;
    const claimed = typeof localStorage !== 'undefined' ? localStorage.getItem(claimedKey(mission.id)) === '1' : false;
    return { ...mission, progress, completed, claimed };
  });
}

export function claimMissionReward(id: MissionId, save: PlayerSave): boolean {
  const mission = getMissionStates(save).find((item) => item.id === id);
  if (!mission || !mission.completed || mission.claimed || typeof localStorage === 'undefined') return false;
  localStorage.setItem(claimedKey(id), '1');
  const chests = Number(localStorage.getItem(CHEST_KEY) ?? '0') + (mission.category === 'weekly' ? 2 : 1);
  localStorage.setItem(CHEST_KEY, String(chests));
  return true;
}

export function getRewardChestCount(): number {
  if (typeof localStorage === 'undefined') return 0;
  return Number(localStorage.getItem(CHEST_KEY) ?? '0');
}

export function consumeRewardChest(): boolean {
  if (typeof localStorage === 'undefined') return false;
  const count = getRewardChestCount();
  if (count <= 0) return false;
  localStorage.setItem(CHEST_KEY, String(count - 1));
  return true;
}
