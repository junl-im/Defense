const SEOUL_TIME_ZONE = 'Asia/Seoul';

export const RUN_SEED_MODES = Object.freeze({
  daily: Object.freeze({ id: 'daily', icon: '日', name: '오늘의 원정', tag: '동일 조건', description: '한국 시간 기준 하루 동안 모든 수호자가 같은 징조와 선택지를 만납니다.' }),
  random: Object.freeze({ id: 'random', icon: '∞', name: '자유 원정', tag: '새 시드', description: '시작할 때마다 새로운 원정 시드와 선택 순서가 생성됩니다.' })
});

export const DAILY_EDICTS = Object.freeze([
  Object.freeze({ id: 'lanternRush', icon: '🏮', name: '등불 축제', desc: '엽전 +20% · 습격 간격 -8% · 점수 +12%', reward: 1.2, spawnInterval: .92, score: 1.12, enemyHp: 1, enemyDamage: 1, eliteChance: 0, soulGain: 1 }),
  Object.freeze({ id: 'guardianVow', icon: '◆', name: '수호의 맹세', desc: '시작 방패 +1 · 요괴 피해 +16% · 점수 +18%', reward: 1, spawnInterval: 1, score: 1.18, enemyHp: 1, enemyDamage: 1.16, eliteChance: 0, soulGain: 1, startWard: 1 }),
  Object.freeze({ id: 'heroNight', icon: '鬼', name: '대장의 밤', desc: '대장 피해 +30% · 적 체력 +12% · 혼불 +15%', reward: 1.05, spawnInterval: 1, score: 1.15, enemyHp: 1.12, enemyDamage: 1, eliteChance: 0, soulGain: 1.15, heroDamage: 1.3 }),
  Object.freeze({ id: 'eliteParade', icon: '王', name: '정예 행렬', desc: '정예 +14% · 정예 보상 +35% · 점수 +22%', reward: 1.08, spawnInterval: .97, score: 1.22, enemyHp: 1.04, enemyDamage: 1.06, eliteChance: .14, soulGain: 1.08, eliteReward: 1.35 }),
  Object.freeze({ id: 'fortuneTide', icon: '三', name: '운명의 밀물', desc: '대박 기운 +35% · 요괴 이동 +8% · 엽전 +10%', reward: 1.1, spawnInterval: 1, score: 1.08, enemyHp: 1, enemyDamage: 1, enemySpeed: 1.08, eliteChance: .03, soulGain: 1, luckGain: 1.35 }),
  Object.freeze({ id: 'ghostFire', icon: '✦', name: '혼불 만조', desc: '혼불 +35% · 적 체력 +18% · 수호신 점수 보너스', reward: 1.04, spawnInterval: .96, score: 1.2, enemyHp: 1.18, enemyDamage: 1.04, eliteChance: .05, soulGain: 1.35 })
]);

export function hashSeed(value) {
  const text = String(value ?? '');
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function createSeededRandom(seed) {
  let state = hashSeed(seed) || 0x6d2b79f5;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

export function getSeoulDateKey(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: SEOUL_TIME_ZONE,
    year: 'numeric', month: '2-digit', day: '2-digit'
  }).formatToParts(date);
  const map = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${map.year}${map.month}${map.day}`;
}

export function createDailySeed(date = new Date()) {
  return `MOON-${getSeoulDateKey(date)}`;
}

export function createRandomSeed(random = Math.random, now = Date.now()) {
  const left = Math.floor(Math.max(0, random()) * 0xffffff).toString(36).toUpperCase().padStart(5, '0');
  const right = (Number(now) >>> 0).toString(36).toUpperCase().slice(-5).padStart(5, '0');
  return `WILD-${left}-${right}`;
}

export function getDailyEdict(seed) {
  return DAILY_EDICTS[hashSeed(seed) % DAILY_EDICTS.length];
}

export function formatRunSeed(seed) {
  return String(seed || '').replace(/^MOON-/, '오늘 ').replace(/^WILD-/, '자유 ');
}
