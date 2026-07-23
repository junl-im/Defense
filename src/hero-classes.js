export const HERO_CLASS_ASSET_IDS = Object.freeze({
  warrior: 'player-dokkaebi-warrior-golden-v1',
  archer: 'player-dokkaebi-archer-candidate-v1',
  mage: 'player-dokkaebi-mage-candidate-v1'
});

export const HERO_CLASSES = Object.freeze({
  warrior: Object.freeze({
    id: 'warrior', assetId: HERO_CLASS_ASSET_IDS.warrior, name: '도깨비 전사', role: '근중거리 균형',
    icon: 'assets/ui/v390/class-warrior.png', conceptArt: 'assets/ip-v8/curated/characters/hero_dokkaebi_warrior.png', color: 0x69edff, accent: '#ffd978',
    description: '빠른 혼불탄과 넓은 도깨비불 난무로 전선을 직접 정리합니다.',
    attack: Object.freeze({ range: 8.8, cooldown: .54, damage: 13, speed: 20, radius: .16, pierce: 0 }),
    skill: Object.freeze({ name: '도깨비불 난무', cooldown: 13, damage: 72, radius: 8.2 }),
    modifiers: Object.freeze({ moveSpeed: 1, heroDamage: 1, skillDamage: 1 })
  }),
  archer: Object.freeze({
    id: 'archer', assetId: HERO_CLASS_ASSET_IDS.archer, name: '도깨비 궁수', role: '장거리 관통',
    icon: 'assets/ui/v390/class-archer.png', conceptArt: 'assets/ip-v8/curated/characters/hero_dokkaebi_archer.png', color: 0x8ff3b2, accent: '#baffd1',
    description: '긴 사거리와 관통 화살로 위험한 후열 요괴를 먼저 끊습니다.',
    attack: Object.freeze({ range: 12.4, cooldown: .68, damage: 16.5, speed: 29, radius: .13, pierce: 1 }),
    skill: Object.freeze({ name: '천풍 삼연시', cooldown: 11.5, damage: 48, radius: 12.8 }),
    modifiers: Object.freeze({ moveSpeed: 1.06, heroDamage: 1.04, skillDamage: .96 })
  }),
  mage: Object.freeze({
    id: 'mage', assetId: HERO_CLASS_ASSET_IDS.mage, name: '도깨비 법사', role: '광역 제어',
    icon: 'assets/ui/v390/class-mage.png', conceptArt: 'assets/ip-v8/curated/characters/hero_dokkaebi_mage.png', color: 0xa881ff, accent: '#8feeff',
    description: '느린 월광탄과 넓은 결계 폭발로 다수의 요괴를 묶어 처리합니다.',
    attack: Object.freeze({ range: 10.2, cooldown: .82, damage: 21, speed: 17, radius: .2, pierce: 0, splash: 1.65 }),
    skill: Object.freeze({ name: '월령 결계', cooldown: 14.5, damage: 86, radius: 9.4, slow: 2.4 }),
    modifiers: Object.freeze({ moveSpeed: .96, heroDamage: 1.08, skillDamage: 1.12 })
  })
});

export const HERO_CLASS_ORDER = Object.freeze(['warrior', 'archer', 'mage']);

export function getHeroClass(id = 'warrior') {
  return HERO_CLASSES[id] || HERO_CLASSES.warrior;
}
