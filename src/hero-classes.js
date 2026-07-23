export const HERO_CLASS_ASSET_IDS = Object.freeze({
  warrior: 'player-dokkaebi-warrior-golden-v1',
  archer: 'player-dokkaebi-archer-candidate-v1',
  mage: 'player-dokkaebi-mage-candidate-v1',
  taoist: 'player-dokkaebi-mage-candidate-v1',
  shaman: 'player-dokkaebi-mage-candidate-v1'
});

const V13_HERO_ART = Object.freeze({
  hero_dokkaebi_warrior: 'assets/ip-v13/crops/heroes/heroes-r01-c01.png',
  hero_dokkaebi_archer: 'assets/ip-v13/crops/heroes/heroes-r01-c02.png',
  hero_dokkaebi_mage: 'assets/ip-v13/crops/heroes/heroes-r01-c03.png',
  hero_mudang_shaman: 'assets/ip-v13/crops/heroes/heroes-r01-c04.png',
  hero_taoist_exorcist: 'assets/ip-v13/crops/heroes/heroes-r01-c05.png'
});
const presentation = (name) => V13_HERO_ART[name] || `assets/ip-v10/presentation/characters/${name}.png`;

export const HERO_CLASSES = Object.freeze({
  warrior: Object.freeze({
    id: 'warrior', assetId: HERO_CLASS_ASSET_IDS.warrior, name: '도깨비 전사', role: '근중거리 균형',
    icon: presentation('hero_dokkaebi_warrior'), conceptArt: presentation('hero_dokkaebi_warrior'), color: 0x69edff, accent: '#ffd978',
    description: '빠른 혼불탄과 넓은 도깨비불 난무로 전선을 직접 정리합니다.',
    attackStyle: 'hero', damageSource: 'hero',
    attack: Object.freeze({ range: 8.8, cooldown: .54, damage: 13, speed: 20, radius: .16, pierce: 0 }),
    skill: Object.freeze({ name: '도깨비불 난무', cooldown: 13, damage: 72, radius: 8.2, style: 'burst' }),
    modifiers: Object.freeze({ moveSpeed: 1, heroDamage: 1, skillDamage: 1 })
  }),
  archer: Object.freeze({
    id: 'archer', assetId: HERO_CLASS_ASSET_IDS.archer, name: '도깨비 궁수', role: '장거리 관통',
    icon: presentation('hero_dokkaebi_archer'), conceptArt: presentation('hero_dokkaebi_archer'), color: 0x8ff3b2, accent: '#baffd1',
    description: '긴 사거리와 관통 화살로 위험한 후열 요괴를 먼저 끊습니다.',
    attackStyle: 'wind', damageSource: 'hero-archer',
    attack: Object.freeze({ range: 12.4, cooldown: .68, damage: 16.5, speed: 29, radius: .13, pierce: 1 }),
    skill: Object.freeze({ name: '천풍 삼연시', cooldown: 11.5, damage: 48, radius: 12.8, style: 'volley' }),
    modifiers: Object.freeze({ moveSpeed: 1.06, heroDamage: 1.04, skillDamage: .96 })
  }),
  mage: Object.freeze({
    id: 'mage', assetId: HERO_CLASS_ASSET_IDS.mage, name: '도깨비 법사', role: '광역 원소',
    icon: presentation('hero_dokkaebi_mage'), conceptArt: presentation('hero_dokkaebi_mage'), color: 0xa881ff, accent: '#8feeff',
    description: '느린 월광탄과 넓은 결계 폭발로 다수의 요괴를 묶고 원소 반응을 증폭합니다.',
    attackStyle: 'skill', damageSource: 'hero-mage',
    attack: Object.freeze({ range: 10.2, cooldown: .82, damage: 21, speed: 17, radius: .2, pierce: 0, splash: 1.65 }),
    skill: Object.freeze({ name: '월령 결계', cooldown: 14.5, damage: 86, radius: 9.4, slow: 2.4, style: 'control' }),
    modifiers: Object.freeze({ moveSpeed: .96, heroDamage: 1.08, skillDamage: 1.12 })
  }),
  taoist: Object.freeze({
    id: 'taoist', assetId: HERO_CLASS_ASSET_IDS.taoist, name: '도깨비 도사', role: '봉인 연쇄',
    icon: presentation('hero_taoist_exorcist'), conceptArt: presentation('hero_taoist_exorcist'), color: 0x74e6b1, accent: '#ffe69a',
    description: '부적탄으로 공명을 쌓고 백귀 봉인진으로 넓은 범위의 적을 연쇄 제압합니다.',
    attackStyle: 'spirit', damageSource: 'hero-taoist',
    attack: Object.freeze({ range: 11.1, cooldown: .72, damage: 17.5, speed: 23, radius: .15, pierce: 1, splash: .62 }),
    skill: Object.freeze({ name: '백귀 봉인진', cooldown: 13.2, damage: 66, radius: 10.6, targets: 8, style: 'seal' }),
    modifiers: Object.freeze({ moveSpeed: 1.01, heroDamage: 1.02, skillDamage: 1.08 })
  }),
  shaman: Object.freeze({
    id: 'shaman', assetId: HERO_CLASS_ASSET_IDS.shaman, name: '도깨비 무당', role: '수호 회복',
    icon: presentation('hero_mudang_shaman'), conceptArt: presentation('hero_mudang_shaman'), color: 0xffa6c9, accent: '#8feeff',
    description: '신령 방울로 적을 흔들고 치유굿으로 신목을 회복하며 전선을 안정시킵니다.',
    attackStyle: 'spirit', damageSource: 'hero-shaman',
    attack: Object.freeze({ range: 9.7, cooldown: .8, damage: 15.5, speed: 19, radius: .18, pierce: 0, splash: .9, chain: 1 }),
    skill: Object.freeze({ name: '신령 치유굿', cooldown: 15.2, damage: 58, radius: 9.2, healCore: 12, style: 'ritual' }),
    modifiers: Object.freeze({ moveSpeed: .98, heroDamage: .98, skillDamage: 1.04 })
  })
});

export const HERO_CLASS_ORDER = Object.freeze(['warrior', 'archer', 'mage', 'taoist', 'shaman']);

export function getHeroClass(id = 'warrior') {
  return HERO_CLASSES[id] || HERO_CLASSES.warrior;
}
