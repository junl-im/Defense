import type { TowerKind } from './types';

export type TowerMasteryId =
  | 'archer_longbow'
  | 'archer_sniper'
  | 'mage_arcane'
  | 'mage_hex'
  | 'barracks_paladin'
  | 'barracks_assault'
  | 'artillery_mortar'
  | 'artillery_shock';

export type TowerMastery = {
  id: TowerMasteryId;
  kind: TowerKind;
  label: string;
  shortLabel: string;
  description: string;
  color: number;
};

export const TOWER_MASTERIES: Record<TowerMasteryId, TowerMastery> = {
  archer_longbow: {
    id: 'archer_longbow', kind: 'archer', label: '장궁 초소', shortLabel: '장궁', color: 0x9dff7a,
    description: '사거리와 연사력을 높여 공중/선두 적을 안정적으로 압박합니다.',
  },
  archer_sniper: {
    id: 'archer_sniper', kind: 'archer', label: '저격 감시탑', shortLabel: '저격', color: 0xffe38c,
    description: '강적과 보스에게 추가 고정 피해를 넣는 고화력 단일 타워입니다.',
  },
  mage_arcane: {
    id: 'mage_arcane', kind: 'mage', label: '비전 첨탑', shortLabel: '비전', color: 0xc8a2ff,
    description: '마법 피해와 사거리를 높이고 일부 피해를 고정 피해로 전환합니다.',
  },
  mage_hex: {
    id: 'mage_hex', kind: 'mage', label: '저주 오벨리스크', shortLabel: '저주', color: 0xff8cff,
    description: '적을 더 오래 둔화시키는 군중 제어형 마법 타워입니다.',
  },
  barracks_paladin: {
    id: 'barracks_paladin', kind: 'barracks', label: '성기사 막사', shortLabel: '성기사', color: 0x9ad7ff,
    description: '병사 체력과 블로킹 시간이 크게 증가하는 방어형 병영입니다.',
  },
  barracks_assault: {
    id: 'barracks_assault', kind: 'barracks', label: '돌격대 막사', shortLabel: '돌격대', color: 0xffb36b,
    description: '병사 수와 피해량이 증가하는 공격형 병영입니다.',
  },
  artillery_mortar: {
    id: 'artillery_mortar', kind: 'artillery', label: '대구경 박격포', shortLabel: '박격포', color: 0xffd36b,
    description: '폭발 반경과 중심 피해가 증가해 밀집 웨이브를 녹입니다.',
  },
  artillery_shock: {
    id: 'artillery_shock', kind: 'artillery', label: '충격포 진지', shortLabel: '충격포', color: 0x8ce8ff,
    description: '폭발에 강한 둔화를 부여해 전선을 오래 묶어둡니다.',
  },
};

export function getTowerMastery(id: TowerMasteryId | undefined): TowerMastery | undefined {
  return id ? TOWER_MASTERIES[id] : undefined;
}

export function getTowerMasteries(kind: TowerKind): TowerMastery[] {
  return Object.values(TOWER_MASTERIES).filter((mastery) => mastery.kind === kind);
}
