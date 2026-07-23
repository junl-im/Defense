export const ENCOUNTER_DIRECTOR_VERSION = '1.0.0';

export const ENCOUNTER_MUTATORS = Object.freeze({
  standard: Object.freeze({
    id: 'standard', icon: '☾', name: '달빛 진군', description: '균형 잡힌 기본 공세입니다.',
    minWave: 1, spawnCount: 1, spawnInterval: 1, hp: 1, speed: 1, damage: 1, eliteChance: 0, reward: 1
  }),
  swarm: Object.freeze({
    id: 'swarm', icon: '三', name: '백귀 군집', description: '작은 요괴가 빠르게 몰려옵니다.',
    minWave: 2, spawnCount: 1.28, spawnInterval: .78, hp: .84, speed: 1.04, damage: .9, eliteChance: -.02, reward: 1.08,
    bias: Object.freeze({ imp: 1.45, runner: 1.25, crow: 1.15 })
  }),
  armored: Object.freeze({
    id: 'armored', icon: '◆', name: '철갑 야행', description: '둔중하지만 단단한 요괴가 전열을 압박합니다.',
    minWave: 3, spawnCount: .9, spawnInterval: 1.12, hp: 1.3, speed: .9, damage: 1.12, eliteChance: .04, reward: 1.16,
    bias: Object.freeze({ brute: 1.7, skeleton: 1.45, shaman: 1.12 })
  }),
  tempest: Object.freeze({
    id: 'tempest', icon: '➶', name: '폭풍 질주', description: '빠른 적과 원거리 압박이 강화됩니다.',
    minWave: 4, spawnCount: 1.02, spawnInterval: .86, hp: .96, speed: 1.22, damage: 1.04, eliteChance: .03, reward: 1.14,
    bias: Object.freeze({ runner: 1.75, crow: 1.55, ghost: 1.28 })
  }),
  hexed: Object.freeze({
    id: 'hexed', icon: '✦', name: '주술 행렬', description: '주술사와 혼령 계열의 패턴 빈도가 높아집니다.',
    minWave: 5, spawnCount: 1, spawnInterval: .95, hp: 1.08, speed: 1.02, damage: 1.15, eliteChance: .06, reward: 1.18,
    bias: Object.freeze({ shaman: 1.8, ghost: 1.45, skeleton: 1.2 })
  }),
  eclipse: Object.freeze({
    id: 'eclipse', icon: '●', name: '월식 강림', description: '정예 확률과 공격력이 크게 증가하는 고위험 공세입니다.',
    minWave: 7, spawnCount: 1.08, spawnInterval: .9, hp: 1.18, speed: 1.08, damage: 1.24, eliteChance: .1, reward: 1.32,
    bias: Object.freeze({ brute: 1.2, shaman: 1.3, crow: 1.3 })
  }),
  boss: Object.freeze({
    id: 'boss', icon: '鬼', name: '우두머리 강림', description: '보스 중심 공세입니다.',
    minWave: 1, spawnCount: 1, spawnInterval: 1, hp: 1, speed: 1, damage: 1, eliteChance: 0, reward: 1.25
  })
});

const MUTATOR_ORDER = Object.freeze(['standard', 'swarm', 'armored', 'tempest', 'hexed', 'eclipse']);

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

function weightedPick(entries, random) {
  const total = entries.reduce((sum, entry) => sum + entry.weight, 0);
  if (total <= 0) return entries[0]?.value;
  let roll = random() * total;
  for (const entry of entries) {
    roll -= entry.weight;
    if (roll <= 0) return entry.value;
  }
  return entries.at(-1)?.value;
}

export class EncounterDirector {
  constructor({ random = Math.random } = {}) {
    this.random = random;
    this.currentPlan = null;
    this.previousMutatorId = '';
    this.previousClearSeconds = 0;
    this.waveStartedAt = 0;
    this.serial = 0;
    this.history = [];
    this.spawned = 0;
    this.killed = 0;
  }

  chooseMutator(wave, boss) {
    if (boss) return ENCOUNTER_MUTATORS.boss;
    const eligible = MUTATOR_ORDER
      .map((id) => ENCOUNTER_MUTATORS[id])
      .filter((entry) => wave >= entry.minWave);
    const weighted = eligible.map((entry) => ({
      value: entry,
      weight: entry.id === 'standard'
        ? Math.max(.35, 1.3 - wave * .08)
        : entry.id === this.previousMutatorId ? .22 : 1
    }));
    return weightedPick(weighted, this.random) || ENCOUNTER_MUTATORS.standard;
  }

  beginWave({ wave, boss = false, coreHpRatio = 1, modeId = 'guardian' } = {}) {
    const mutator = this.chooseMutator(wave, boss);
    const playerPressure = coreHpRatio < .35 ? -.12 : coreHpRatio < .55 ? -.06 : coreHpRatio > .88 ? .05 : 0;
    const speedPressure = this.previousClearSeconds > 0 && this.previousClearSeconds < 28 ? .05 : this.previousClearSeconds > 65 ? -.04 : 0;
    const modePressure = modeId === 'nightmare' ? .08 : modeId === 'guardian' ? 0 : .03;
    const pressure = clamp(playerPressure + speedPressure + modePressure, -.16, .16);
    const difficulty = clamp(1 + pressure + Math.max(0, wave - 1) * .0075, .86, 1.22);

    this.serial += 1;
    this.spawned = 0;
    this.killed = 0;
    this.waveStartedAt = performance.now();
    this.previousMutatorId = mutator.id;
    this.currentPlan = Object.freeze({
      id: `encounter-${wave}-${mutator.id}-${this.serial}`,
      version: ENCOUNTER_DIRECTOR_VERSION,
      wave,
      boss,
      mutatorId: mutator.id,
      icon: mutator.icon,
      name: mutator.name,
      description: mutator.description,
      spawnCountMultiplier: mutator.spawnCount,
      spawnIntervalMultiplier: mutator.spawnInterval,
      hpMultiplier: mutator.hp * difficulty,
      speedMultiplier: mutator.speed * clamp(1 + pressure * .55, .9, 1.12),
      damageMultiplier: mutator.damage * clamp(1 + pressure * .75, .86, 1.18),
      eliteChanceBonus: clamp(mutator.eliteChance + Math.max(0, pressure) * .18, -.05, .18),
      rewardMultiplier: mutator.reward * clamp(1 + Math.max(0, pressure) * .6, 1, 1.12),
      bias: mutator.bias || Object.freeze({}),
      adaptivePressure: Number(pressure.toFixed(3)),
      difficultyMultiplier: Number(difficulty.toFixed(3))
    });
    return this.currentPlan;
  }

  selectEnemyType({ wave, fallback = 'imp', available = [], random = this.random } = {}) {
    const bias = this.currentPlan?.bias || {};
    const entries = available
      .filter((entry) => wave >= Number(entry.minWave || 1))
      .map((entry) => ({ value: entry.id, weight: Number(entry.weight || 1) * Number(bias[entry.id] || 1) }));
    return weightedPick(entries, random) || fallback;
  }

  recordSpawn() {
    this.spawned += 1;
  }

  recordKill() {
    this.killed += 1;
  }

  completeWave({ perfect = false, coreHpRatio = 1 } = {}) {
    const clearSeconds = this.waveStartedAt ? Math.max(0, (performance.now() - this.waveStartedAt) / 1000) : 0;
    this.previousClearSeconds = clearSeconds;
    const result = Object.freeze({
      planId: this.currentPlan?.id || '',
      wave: this.currentPlan?.wave || 0,
      mutatorId: this.currentPlan?.mutatorId || 'none',
      clearSeconds: Number(clearSeconds.toFixed(2)),
      perfect,
      coreHpRatio: Number(coreHpRatio.toFixed(3)),
      spawned: this.spawned,
      killed: this.killed
    });
    this.history.push(result);
    if (this.history.length > 12) this.history.shift();
    return result;
  }

  get diagnostics() {
    return Object.freeze({
      version: ENCOUNTER_DIRECTOR_VERSION,
      active: this.currentPlan,
      previousClearSeconds: Number(this.previousClearSeconds.toFixed(2)),
      spawned: this.spawned,
      killed: this.killed,
      history: [...this.history]
    });
  }
}

export default EncounterDirector;
