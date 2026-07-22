import { HERO_CLASS_ORDER } from './hero-classes.js';

export const HERO_MASTERY_STORAGE_KEY = 'dokkaebi-hero-mastery-v1';
export const HERO_MASTERY_MAX_LEVEL = 10;

const blankEntry = () => ({ level: 1, xp: 0, runs: 0, wins: 0 });

export function xpForNextLevel(level) {
  return 80 + Math.max(0, level - 1) * 35;
}

export function createDefaultHeroMastery() {
  return Object.fromEntries(HERO_CLASS_ORDER.map((id) => [id, blankEntry()]));
}

export function sanitizeHeroMastery(raw) {
  const result = createDefaultHeroMastery();
  for (const id of HERO_CLASS_ORDER) {
    const source = raw?.[id];
    if (!source) continue;
    result[id] = {
      level: Math.min(HERO_MASTERY_MAX_LEVEL, Math.max(1, Math.floor(Number(source.level) || 1))),
      xp: Math.max(0, Math.floor(Number(source.xp) || 0)),
      runs: Math.max(0, Math.floor(Number(source.runs) || 0)),
      wins: Math.max(0, Math.floor(Number(source.wins) || 0))
    };
  }
  return result;
}

export function loadHeroMastery(storage = globalThis.localStorage) {
  try { return sanitizeHeroMastery(JSON.parse(storage?.getItem(HERO_MASTERY_STORAGE_KEY) || 'null')); }
  catch { return createDefaultHeroMastery(); }
}

export function saveHeroMastery(state, storage = globalThis.localStorage) {
  const clean = sanitizeHeroMastery(state);
  try { storage?.setItem(HERO_MASTERY_STORAGE_KEY, JSON.stringify(clean)); } catch {}
  return clean;
}

export function getHeroMasteryEntry(state, classId) {
  return sanitizeHeroMastery(state)[classId] || blankEntry();
}

export function getHeroMasteryBonus(state, classId) {
  const entry = getHeroMasteryEntry(state, classId);
  const steps = Math.max(0, entry.level - 1);
  return Object.freeze({
    heroDamage: 1 + steps * .018,
    skillDamage: 1 + steps * .012,
    moveSpeed: 1 + steps * .004
  });
}

export function awardHeroMastery(state, classId, { wave = 0, won = false } = {}) {
  const next = sanitizeHeroMastery(state);
  const entry = next[classId] || blankEntry();
  const gained = 18 + Math.max(0, wave) * 5 + (won ? 45 : 0);
  entry.xp += gained;
  entry.runs += 1;
  if (won) entry.wins += 1;
  let levelsGained = 0;
  while (entry.level < HERO_MASTERY_MAX_LEVEL) {
    const requirement = xpForNextLevel(entry.level);
    if (entry.xp < requirement) break;
    entry.xp -= requirement;
    entry.level += 1;
    levelsGained += 1;
  }
  if (entry.level >= HERO_MASTERY_MAX_LEVEL) entry.xp = 0;
  next[classId] = entry;
  return Object.freeze({ state: next, gained, levelsGained, entry: { ...entry } });
}
