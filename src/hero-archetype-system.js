export const HERO_ARCHETYPE_SYSTEM_VERSION = '1.0.0';

export const HERO_ARCHETYPE_PASSIVES = Object.freeze({
  warrior: Object.freeze({
    id: 'ironGuard', icon: '◆', name: '철벽 대장',
    description: '대장 피해 +4% · 신목이 받는 피해 -8%',
    modifiers: Object.freeze({ heroDamage: 1.04, coreDamage: .92 })
  }),
  archer: Object.freeze({
    id: 'moonHunt', icon: '➶', name: '월영 사냥',
    description: '이동 속도 +4% · 보스 피해 +8%',
    modifiers: Object.freeze({ moveSpeed: 1.04, bossDamage: 1.08 })
  }),
  mage: Object.freeze({
    id: 'elementalConduit', icon: '✦', name: '원소 도관',
    description: '원소 반응 피해 +18% · 스킬 피해 +5%',
    modifiers: Object.freeze({ reactionDamage: 1.18, skillDamage: 1.05 })
  }),
  taoist: Object.freeze({
    id: 'spiritSeal', icon: '符', name: '백귀 봉인',
    description: '상태이상 지속 +25% · 원소 반응 피해 +10%',
    modifiers: Object.freeze({ statusDuration: 1.25, reactionDamage: 1.10 })
  }),
  shaman: Object.freeze({
    id: 'guardianRitual', icon: '鈴', name: '신목 굿판',
    description: '신목 회복 +35% · 신목이 받는 피해 -6%',
    modifiers: Object.freeze({ coreHealing: 1.35, coreDamage: .94 })
  })
});

const MULTIPLICATIVE_KEYS = Object.freeze([
  'heroDamage', 'skillDamage', 'moveSpeed', 'bossDamage', 'coreDamage',
  'reactionDamage', 'statusDuration', 'statusPotency', 'coreHealing'
]);

export function getHeroArchetypePassive(classId = 'warrior') {
  return HERO_ARCHETYPE_PASSIVES[classId] || HERO_ARCHETYPE_PASSIVES.warrior;
}

export function applyHeroArchetypeModifiers(mods, classId = 'warrior') {
  const passive = getHeroArchetypePassive(classId);
  for (const key of MULTIPLICATIVE_KEYS) {
    if (passive.modifiers[key] === undefined) continue;
    mods[key] = Number(mods[key] ?? 1) * passive.modifiers[key];
  }
  return passive;
}

export const HERO_ARCHETYPE_SUMMARY = Object.freeze({
  version: HERO_ARCHETYPE_SYSTEM_VERSION,
  playableClasses: Object.keys(HERO_ARCHETYPE_PASSIVES).length,
  passiveIds: Object.freeze(Object.values(HERO_ARCHETYPE_PASSIVES).map((entry) => entry.id))
});
