export const COMBAT_ART_POLISH_POLICY_V114 = Object.freeze({
  version: '1.0.14',
  build: 'b24.14',
  id: 'DD-MEGA-ART-POLISH-V114',
  approvedStaticCombatArt: 21,
  guardianCitadelStates: 4,
  runtimeQualityTiers: Object.freeze(['low', 'medium', 'high']),
  staticArtMirroringAllowed: false,
  prototypeDirectionalAtlasesEnabled: false,
  independentlyAuthoredDirectionsRequired: true,
  actionProfiles: Object.freeze(['melee', 'ranged', 'caster', 'support', 'controller', 'tank', 'roar']),
  objective: '기존 고품질 IP 원화를 보존하면서 접지, 실루엣, 크기, 액션 타이밍과 수호성 상태 표현을 런타임 기준으로 통일합니다.'
});

export const CATEGORY_ACCENTS_V114 = Object.freeze({
  hero: 0x76d9ff,
  guardian: 0xffce67,
  monster: 0xc18aff,
  boss: 0xff745d,
  core: 0x72dcff
});

export const ENTITY_POLISH_PROFILES_V114 = Object.freeze({
  heroes: Object.freeze({
    warrior: Object.freeze({ action: 'melee', scale: 2.58, y: .07, healthY: 2.72, healthWidth: 1.42, centerY: .075, accent: 0x66cfff }),
    archer: Object.freeze({ action: 'ranged', scale: 2.52, y: .07, healthY: 2.69, healthWidth: 1.40, centerY: .075, accent: 0xffbf69 }),
    mage: Object.freeze({ action: 'caster', scale: 2.54, y: .08, healthY: 2.73, healthWidth: 1.42, centerY: .075, accent: 0x7bc7ff }),
    shaman: Object.freeze({ action: 'support', scale: 2.48, y: .07, healthY: 2.67, healthWidth: 1.40, centerY: .075, accent: 0xffd884 }),
    taoist: Object.freeze({ action: 'controller', scale: 2.50, y: .07, healthY: 2.69, healthWidth: 1.40, centerY: .075, accent: 0xc996ff })
  }),
  guardians: Object.freeze({
    ember: Object.freeze({ action: 'caster', scale: 2.02, y: .06, healthY: 2.17, healthWidth: 1.24, centerY: .072, accent: 0xff713e }),
    frost: Object.freeze({ action: 'caster', scale: 2.02, y: .06, healthY: 2.17, healthWidth: 1.24, centerY: .072, accent: 0x74dcff }),
    wind: Object.freeze({ action: 'ranged', scale: 2.00, y: .06, healthY: 2.14, healthWidth: 1.23, centerY: .072, accent: 0x84efae }),
    stone: Object.freeze({ action: 'tank', scale: 2.16, y: .055, healthY: 2.28, healthWidth: 1.32, centerY: .068, accent: 0xd6ae76 }),
    bell: Object.freeze({ action: 'support', scale: 2.02, y: .06, healthY: 2.17, healthWidth: 1.24, centerY: .072, accent: 0xf1adff }),
    thunder: Object.freeze({ action: 'melee', scale: 2.12, y: .06, healthY: 2.23, healthWidth: 1.29, centerY: .07, accent: 0xffe56a })
  }),
  monsters: Object.freeze({
    imp: Object.freeze({ action: 'ranged', scale: 1.56, y: .05, healthY: 1.68, healthWidth: 1.08, centerY: .07, accent: 0x9be96d }),
    runner: Object.freeze({ action: 'melee', scale: 1.60, y: .05, healthY: 1.72, healthWidth: 1.08, centerY: .07, accent: 0xbe8aff }),
    brute: Object.freeze({ action: 'tank', scale: 1.88, y: .05, healthY: 1.98, healthWidth: 1.20, centerY: .067, accent: 0xd69c68 }),
    shaman: Object.freeze({ action: 'caster', scale: 1.68, y: .05, healthY: 1.80, healthWidth: 1.12, centerY: .07, accent: 0xd283ff }),
    ghost: Object.freeze({ action: 'caster', scale: 1.52, y: .08, healthY: 1.68, healthWidth: 1.06, centerY: .08, accent: 0x8ee9ff }),
    skeleton: Object.freeze({ action: 'melee', scale: 1.66, y: .05, healthY: 1.77, healthWidth: 1.10, centerY: .07, accent: 0xe5d9b8 }),
    crow: Object.freeze({ action: 'ranged', scale: 1.54, y: .16, healthY: 1.75, healthWidth: 1.08, centerY: .09, accent: 0xbc7cff })
  }),
  bosses: Object.freeze({
    tiger: Object.freeze({ action: 'roar', scale: 3.48, y: .09, healthY: 3.55, healthWidth: 2.10, centerY: .065, accent: 0xff9361 }),
    serpent: Object.freeze({ action: 'caster', scale: 3.70, y: .09, healthY: 3.72, healthWidth: 2.18, centerY: .065, accent: 0xb181ff }),
    king: Object.freeze({ action: 'controller', scale: 3.58, y: .09, healthY: 3.64, healthWidth: 2.16, centerY: .065, accent: 0x83e9ff })
  })
});

export function resolvePolishProfileV114(category, id) {
  const table = category === 'hero'
    ? ENTITY_POLISH_PROFILES_V114.heroes
    : category === 'guardian'
      ? ENTITY_POLISH_PROFILES_V114.guardians
      : category === 'boss'
        ? ENTITY_POLISH_PROFILES_V114.bosses
        : ENTITY_POLISH_PROFILES_V114.monsters;
  return table[id] || Object.values(table)[0];
}
