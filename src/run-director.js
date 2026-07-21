export const MOON_OMENS = Object.freeze([
  Object.freeze({
    id: 'harvest', icon: '◉', name: '풍요의 달',
    description: '엽전 보상 +35% · 요괴 이동 속도 +8%',
    enemyHp: 1, enemySpeed: 1.08, enemyDamage: 1, reward: 1.35, score: 1,
    spawnInterval: 1, unitCooldown: 1, heroDamage: 1, luckGain: 1, eliteChance: 0
  }),
  Object.freeze({
    id: 'blood', icon: '●', name: '붉은 달',
    description: '요괴 체력·피해 +28% · 점수 +35%',
    enemyHp: 1.28, enemySpeed: 1, enemyDamage: 1.28, reward: 1.12, score: 1.35,
    spawnInterval: 1, unitCooldown: 1, heroDamage: 1, luckGain: 1, eliteChance: .03
  }),
  Object.freeze({
    id: 'frost', icon: '❄', name: '서리 달',
    description: '요괴 이동 -14% · 수호대 공격 속도 -10% · 보상 +10%',
    enemyHp: 1, enemySpeed: .86, enemyDamage: 1, reward: 1.1, score: 1.08,
    spawnInterval: 1, unitCooldown: 1.1, heroDamage: 1, luckGain: 1, eliteChance: 0
  }),
  Object.freeze({
    id: 'storm', icon: 'ϟ', name: '천둥 달',
    description: '습격 간격 -18% · 대장 깨비 피해 +45% · 점수 +20%',
    enemyHp: 1, enemySpeed: 1.04, enemyDamage: 1.05, reward: 1, score: 1.2,
    spawnInterval: .82, unitCooldown: 1, heroDamage: 1.45, luckGain: 1, eliteChance: .02
  }),
  Object.freeze({
    id: 'eclipse', icon: '☾', name: '검은 월식',
    description: '정예 출현 증가 · 대박 기운 +40% · 엽전 +25%',
    enemyHp: 1.12, enemySpeed: 1, enemyDamage: 1.08, reward: 1.25, score: 1.18,
    spawnInterval: .94, unitCooldown: 1, heroDamage: 1, luckGain: 1.4, eliteChance: .18
  }),
  Object.freeze({
    id: 'hunt', icon: '!', name: '사냥꾼의 달',
    description: '정예 출현 대폭 증가 · 정예 보상 +45%',
    enemyHp: 1.06, enemySpeed: 1.04, enemyDamage: 1.08, reward: 1.08, score: 1.25,
    spawnInterval: .94, unitCooldown: 1, heroDamage: 1, luckGain: 1, eliteChance: .26, eliteReward: 1.45
  }),
  Object.freeze({
    id: 'ghost', icon: '✦', name: '혼령의 달',
    description: '요괴 체력 +18% · 수호대 공격 속도 +12% · 혼불 증가',
    enemyHp: 1.18, enemySpeed: 1, enemyDamage: 1, reward: 1.08, score: 1.15,
    spawnInterval: 1, unitCooldown: .88, heroDamage: 1, luckGain: 1, eliteChance: .05, soulGain: 1.35
  }),
  Object.freeze({
    id: 'dawn', icon: '☀', name: '새벽의 달',
    description: '요괴 이동 +10% · 대장 피해 +22% · 엽전 +18%',
    enemyHp: .96, enemySpeed: 1.1, enemyDamage: 1.05, reward: 1.18, score: 1.12,
    spawnInterval: .9, unitCooldown: .96, heroDamage: 1.22, luckGain: 1.08, eliteChance: .03
  })
]);

export const ELITE_AFFIXES = Object.freeze([
  Object.freeze({ id: 'swift', icon: '➶', name: '질풍', color: 0x72ecff, hp: .9, speed: 1.42, damage: 1.08, reward: 1.45, score: 1.25 }),
  Object.freeze({ id: 'bulwark', icon: '◆', name: '철벽', color: 0xc7adff, hp: 1.7, speed: .84, damage: 1.12, reward: 1.65, score: 1.55 }),
  Object.freeze({ id: 'volatile', icon: '!', name: '폭주', color: 0xff6c72, hp: 1.15, speed: 1.12, damage: 1.65, reward: 1.5, score: 1.45 }),
  Object.freeze({ id: 'treasure', icon: '◉', name: '황금', color: 0xffd25e, hp: 1.22, speed: .96, damage: 1.05, reward: 2.45, score: 1.35 }),
  Object.freeze({ id: 'warded', icon: '◇', name: '결계', color: 0x8de8ff, hp: 1.22, speed: .94, damage: 1.12, reward: 1.7, score: 1.6, shield: .42 }),
  Object.freeze({ id: 'explosive', icon: '✹', name: '파열', color: 0xff8c6a, hp: 1.12, speed: 1.08, damage: 1.25, reward: 1.75, score: 1.55, deathBurst: true }),
  Object.freeze({ id: 'ancient', icon: '王', name: '고대', color: 0xe7b8ff, hp: 2.25, speed: .76, damage: 1.48, reward: 2.35, score: 2.2 })
]);

export function selectMoonOmen(previousId = '', random = Math.random) {
  const candidates = MOON_OMENS.filter((omen) => omen.id !== previousId);
  const pool = candidates.length ? candidates : MOON_OMENS;
  const index = Math.min(pool.length - 1, Math.floor(Math.max(0, random()) * pool.length));
  return pool[index];
}

export function rollEliteAffix(wave, omen, random = Math.random, bonusChance = 0, force = false) {
  if (wave < 3 && !force) return null;
  const chance = Math.min(.72, .075 + wave * .012 + (omen?.eliteChance || 0) + bonusChance);
  if (!force && random() >= chance) return null;
  const index = Math.min(ELITE_AFFIXES.length - 1, Math.floor(Math.max(0, random()) * ELITE_AFFIXES.length));
  return ELITE_AFFIXES[index];
}
