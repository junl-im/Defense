export const RUN_MODES = Object.freeze({
  guardian: Object.freeze({
    id: 'guardian', icon: '☾', name: '달빛 수호전', tag: '기본',
    description: '균형 잡힌 10웨이브 수호전입니다.',
    enemyHp: 1, enemySpeed: 1, enemyDamage: 1, reward: 1, score: 1,
    eliteChance: 0, startGold: 0, startWard: 0, soulGain: 1
  }),
  eclipse: Object.freeze({
    id: 'eclipse', icon: '◐', name: '월식 원정', tag: '도전',
    description: '요괴가 강해지지만 전리품과 점수가 크게 증가합니다.',
    enemyHp: 1.25, enemySpeed: 1.06, enemyDamage: 1.18, reward: 1.18, score: 1.5,
    eliteChance: .07, startGold: 15, startWard: 0, soulGain: 1.12
  }),
  abyss: Object.freeze({
    id: 'abyss', icon: '●', name: '백귀 심연', tag: '극한',
    description: '정예가 쏟아지는 극한 모드입니다. 최고 점수 배율을 제공합니다.',
    enemyHp: 1.55, enemySpeed: 1.1, enemyDamage: 1.35, reward: 1.35, score: 2.1,
    eliteChance: .14, startGold: 25, startWard: 1, soulGain: 1.24
  })
});

export const RELICS = Object.freeze([
  Object.freeze({ id: 'moonPouch', icon: '◉', name: '만월 복주머니', grade: '희귀', tag: '경제', desc: '엽전 획득량 +22%, 획득 범위 +1.', apply: (g) => { g.mods.goldMultiplier *= 1.22; g.mods.pickupRadius += 1; } }),
  Object.freeze({ id: 'warDrum', icon: '♬', name: '도깨비 전고', grade: '영웅', tag: '공속', desc: '수호대 공격 주기 -12%, 집중 명령 재사용 -15%.', apply: (g) => { g.mods.unitCooldown *= .88; g.mods.commandCooldown *= .85; } }),
  Object.freeze({ id: 'spiritBlade', icon: '†', name: '혼불 대도', grade: '영웅', tag: '화력', desc: '수호대 피해 +20%. 대신 신목이 받는 피해 +8%.', apply: (g) => { g.mods.unitDamage *= 1.2; g.mods.coreDamage *= 1.08; } }),
  Object.freeze({ id: 'foxShoes', icon: '➶', name: '여우비 신발', grade: '희귀', tag: '기동', desc: '이동 속도 +16%, 질주 재사용 -24%.', apply: (g) => { g.mods.moveSpeed *= 1.16; g.mods.dashCooldown *= .76; } }),
  Object.freeze({ id: 'blueFlame', icon: '☄', name: '청염 화로', grade: '전설', tag: '스킬', desc: '도깨비불 난무 피해 +35%, 재사용 -25%.', apply: (g) => { g.mods.skillDamage *= 1.35; g.mods.skillCooldown *= .75; } }),
  Object.freeze({ id: 'fortuneSeal', icon: '三', name: '삼재 대박부', grade: '영웅', tag: '운빨', desc: '대박 기운 +38%, 모든 소환 비용 -4.', apply: (g) => { g.mods.luckGain *= 1.38; g.mods.summonDiscount += 4; } }),
  Object.freeze({ id: 'guardianKnot', icon: '◆', name: '신목 매듭', grade: '전설', tag: '방어', desc: '신목 최대 체력 +15, 즉시 회복하고 달빛 방패 +1.', apply: (g) => { g.coreMaxHp += 15; g.coreHp = Math.min(g.coreMaxHp, g.coreHp + 15); g.moonWard = Math.min(3, g.moonWard + 1); } }),
  Object.freeze({ id: 'thunderCrown', icon: 'ϟ', name: '뇌신의 관', grade: '전설', tag: '대장', desc: '대장 깨비 피해 +40%, 혼불 게이지 획득 +20%.', apply: (g) => { g.mods.heroDamage *= 1.4; g.mods.soulGain *= 1.2; } }),
  Object.freeze({ id: 'echoBell', icon: '✦', name: '메아리 방울', grade: '전설', tag: '폭주', desc: '수호신 폭주 지속 +4초, 폭주 피해 보정 +18%.', apply: (g) => { g.mods.burstDuration += 4; g.mods.burstPower *= 1.18; } }),
  Object.freeze({ id: 'harvestLedger', icon: '▤', name: '야시장 장부', grade: '희귀', tag: '도전', desc: '웨이브 도전 보상 +50%, 엽전 획득 +8%.', apply: (g) => { g.mods.objectiveReward *= 1.5; g.mods.goldMultiplier *= 1.08; } }),
  Object.freeze({ id: 'starMap', icon: '☆', name: '육성 성도', grade: '영웅', tag: '성장', desc: '수호대 피해 +8%, 삼지선다 소환권 +1.', apply: (g) => { g.mods.unitDamage *= 1.08; g.choiceTickets += 1; } }),
  Object.freeze({ id: 'nightMarket', icon: '🏮', name: '심야 흥정패', grade: '영웅', tag: '소환', desc: '모든 소환 비용 -8. 대신 수호대 공격 주기 +6%.', apply: (g) => { g.mods.summonDiscount += 8; g.mods.unitCooldown *= 1.06; } })
]);

const TRIAL_BLUEPRINTS = Object.freeze([
  Object.freeze({ id: 'perfect', icon: '◆', name: '결계 불변', description: '신목 피해 없이 웨이브를 막으세요.' }),
  Object.freeze({ id: 'hunt', icon: '!', name: '정예 현상금', description: '정예 요괴를 처치하세요.' }),
  Object.freeze({ id: 'chain', icon: '×', name: '백귀 연참', description: '한 번의 연속 처치 기록을 달성하세요.' }),
  Object.freeze({ id: 'collector', icon: '◉', name: '엽전 회수', description: '전투 중 엽전을 직접 회수하세요.' }),
  Object.freeze({ id: 'skill', icon: '☄', name: '귀화 폭격', description: '도깨비불 난무로 누적 피해를 주세요.' }),
  Object.freeze({ id: 'dash', icon: '➶', name: '질풍 순찰', description: '질주를 사용해 전장을 누비세요.' })
]);

export function getRunMode(id) {
  return RUN_MODES[id] || RUN_MODES.guardian;
}

export function selectRelicOptions(history = [], random = Math.random, count = 3) {
  const unseen = RELICS.filter((relic) => !history.includes(relic.id));
  const pool = unseen.length >= count ? unseen : RELICS;
  const shuffled = [...pool];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const roll = Math.min(.999999, Math.max(0, Number(random()) || 0));
    const swapIndex = Math.floor(roll * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled.slice(0, count);
}

export function rollWaveTrial(wave, modeId = 'guardian', previousId = '', random = Math.random) {
  const mode = getRunMode(modeId);
  const candidates = TRIAL_BLUEPRINTS.filter((trial) => trial.id !== previousId && !(wave === 1 && trial.id === 'skill'));
  const blueprint = candidates[Math.min(candidates.length - 1, Math.floor(Math.max(0, random()) * candidates.length))];
  let target = 1;
  if (blueprint.id === 'hunt') target = mode.id === 'abyss' && wave >= 6 ? 2 : 1;
  if (blueprint.id === 'chain') target = Math.min(24, 8 + wave * 2);
  if (blueprint.id === 'collector') target = 24 + wave * 5;
  if (blueprint.id === 'skill') target = 90 + wave * 32;
  if (blueprint.id === 'dash') target = wave >= 7 ? 3 : 2;
  return { ...blueprint, target, progress: 0, completed: false, failed: false };
}

export function getWaveTrialProgress(game, trial) {
  if (!trial) return 0;
  const start = trial.start || {};
  if (trial.id === 'perfect') return game.coreHp >= game.waveStartHp - .01 ? 1 : 0;
  if (trial.id === 'hunt') return Math.max(0, game.runStats.eliteKills - (start.eliteKills || 0));
  if (trial.id === 'chain') return Math.max(0, game.waveMaxChain || 0);
  if (trial.id === 'collector') return Math.max(0, game.runStats.coinsCollected - (start.coinsCollected || 0));
  if (trial.id === 'skill') return Math.max(0, game.runStats.skillDamage - (start.skillDamage || 0));
  if (trial.id === 'dash') return Math.max(0, game.runStats.dashUses - (start.dashUses || 0));
  return 0;
}

export function getWaveTrialReward(wave, modeId = 'guardian', rewardMultiplier = 1) {
  const mode = getRunMode(modeId);
  return {
    gold: Math.round((18 + wave * 4) * mode.reward * rewardMultiplier),
    score: Math.round((360 + wave * 130) * mode.score * rewardMultiplier),
    soul: Math.round((9 + wave * .7) * rewardMultiplier)
  };
}

export function formatTrialProgress(trial) {
  if (!trial) return '';
  if (trial.id === 'perfect') return trial.completed ? '무피해 달성' : trial.failed || trial.progress < 1 ? '결계 손상' : '무피해 유지 중';
  return `${Math.min(trial.target, Math.floor(trial.progress || 0))} / ${trial.target}`;
}
