export type HeroId = 'leon' | 'aria' | 'nox';

export type HeroProfile = {
  id: HeroId;
  name: string;
  title: string;
  role: string;
  portraitKey: string;
  color: number;
  description: string;
  perks: string[];
};

export type HeroBattleBonus = {
  heroDamage: number;
  startGold: number;
  extraLives: number;
  towerRange: number;
  spellCooldown: number;
};

const SELECTED_HERO_KEY = 'kingdom-seed:selected-hero:v28';

export const HERO_PROFILES: HeroProfile[] = [
  {
    id: 'leon',
    name: '레온',
    title: '왕국의 방패',
    role: '전선 유지 / 보스 저지',
    portraitKey: 'portrait-knight',
    color: 0x89a4d8,
    description: '전선을 직접 틀어막는 기사형 영웅. 안정적인 클리어와 초반 생존에 강합니다.',
    perks: ['영웅 피해 +15%', '라이프 +2', '병영 보충 비용 체감'],
  },
  {
    id: 'aria',
    name: '아리아',
    title: '숲의 추적자',
    role: '공중 대응 / 빠른 웨이브',
    portraitKey: 'portrait-ranger',
    color: 0x74d18b,
    description: '공중과 빠른 적에게 강한 레인저. 진행 보너스를 노리는 공격적인 플레이에 좋습니다.',
    perks: ['시작 골드 +45', '타워 사거리 +4%', '영웅 피해 +5%'],
  },
  {
    id: 'nox',
    name: '녹스',
    title: '비전 현자',
    role: '스펠 순환 / 중갑 카운터',
    portraitKey: 'portrait-mage',
    color: 0xb58cff,
    description: '마법과 스킬 쿨타임에 특화된 영웅. 위기 대처 능력이 가장 뛰어납니다.',
    perks: ['메테오/용병 쿨타임 -12%', '마법 계열 보조', '시작 골드 +20'],
  },
];

export function getHeroProfiles(): HeroProfile[] {
  return HERO_PROFILES;
}

export function getSelectedHero(): HeroProfile {
  const saved = typeof localStorage !== 'undefined' ? localStorage.getItem(SELECTED_HERO_KEY) : null;
  return HERO_PROFILES.find((hero) => hero.id === saved) ?? HERO_PROFILES[0];
}

export function setSelectedHero(id: HeroId): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(SELECTED_HERO_KEY, id);
}

export function getHeroBattleBonus(id: HeroId = getSelectedHero().id): HeroBattleBonus {
  if (id === 'aria') return { heroDamage: 1.05, startGold: 45, extraLives: 0, towerRange: 1.04, spellCooldown: 1 };
  if (id === 'nox') return { heroDamage: 1.08, startGold: 20, extraLives: 0, towerRange: 1, spellCooldown: 0.88 };
  return { heroDamage: 1.15, startGold: 0, extraLives: 2, towerRange: 1, spellCooldown: 1 };
}

export function heroSelectionSummary(): string {
  const hero = getSelectedHero();
  return `${hero.name} · ${hero.role}`;
}
