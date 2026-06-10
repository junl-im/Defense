import type { StageId } from './types';
import type { ArtifactId } from './ArtifactForge';

export type StageRewardTable = {
  stageId: StageId;
  chestBias: ArtifactId[];
  guaranteedDust: number;
  shardBonus: number;
  flavor: string;
};

export const STAGE_REWARD_TABLES: Record<string, StageRewardTable> = {
  stage_001: {
    stageId: 'stage_001',
    chestBias: ['oakLongbow', 'captainsBanner', 'merchantLedger'],
    guaranteedDust: 4,
    shardBonus: 2,
    flavor: '숲의 보급품: 궁수와 병영 성장 재료가 더 자주 나옵니다.',
  },
  stage_002: {
    stageId: 'stage_002',
    chestBias: ['thunderPowder', 'arcaneCore', 'sunstoneAmulet'],
    guaranteedDust: 5,
    shardBonus: 3,
    flavor: '협곡의 화약통: 포탑과 마법 유물이 강화됩니다.',
  },
  stage_003: {
    stageId: 'stage_003',
    chestBias: ['hexedHourglass', 'captainsBanner', 'sunstoneAmulet'],
    guaranteedDust: 6,
    shardBonus: 4,
    flavor: '늪지의 주문서: 둔화와 스펠 계열 재료가 섞입니다.',
  },
  stage_004: {
    stageId: 'stage_004',
    chestBias: ['royalBulwark', 'arcaneCore', 'thunderPowder'],
    guaranteedDust: 7,
    shardBonus: 5,
    flavor: '관문의 전리품: 보스 대응 유물 파편이 추가됩니다.',
  },
  stage_005: {
    stageId: 'stage_005',
    chestBias: ['shadowDagger', 'hexedHourglass', 'royalBulwark'],
    guaranteedDust: 9,
    shardBonus: 6,
    flavor: '성채의 은닉품: 암살자/저주 계열 유물 파편이 등장합니다.',
  },
  stage_006: {
    stageId: 'stage_006',
    chestBias: ['dragonScale', 'thunderPowder', 'sunstoneAmulet'],
    guaranteedDust: 10,
    shardBonus: 7,
    flavor: '화산의 잔재: 폭발과 생존 유물 강화에 유리합니다.',
  },
  stage_007: {
    stageId: 'stage_007',
    chestBias: ['voidPrism', 'arcaneCore', 'hexedHourglass'],
    guaranteedDust: 12,
    shardBonus: 8,
    flavor: '공허의 결정: 마법과 최종 진화 재료가 풍부합니다.',
  },
  stage_008: {
    stageId: 'stage_008',
    chestBias: ['kingsCrown', 'dragonScale', 'voidPrism'],
    guaranteedDust: 15,
    shardBonus: 10,
    flavor: '왕의 보물고: 희귀 유물 파편과 왕실 토큰 획득률이 높습니다.',
  },
};

export function getStageRewardTable(stageId: string): StageRewardTable {
  return STAGE_REWARD_TABLES[stageId] ?? STAGE_REWARD_TABLES.stage_001;
}
