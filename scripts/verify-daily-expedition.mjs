import assert from 'node:assert/strict';
import {
  RUN_SEED_MODES, DAILY_EDICTS, hashSeed, createSeededRandom,
  getSeoulDateKey, createDailySeed, createRandomSeed, getDailyEdict, formatRunSeed
} from '../src/daily-expedition.js';

assert.equal(Object.keys(RUN_SEED_MODES).length, 2, 'seed mode count');
assert.equal(DAILY_EDICTS.length, 6, 'daily edict count');
const date = new Date('2026-07-20T15:30:00.000Z');
assert.equal(getSeoulDateKey(date), '20260721', 'Seoul date rollover');
assert.equal(createDailySeed(date), 'MOON-20260721', 'daily seed format');
const a = createSeededRandom('MOON-20260721');
const b = createSeededRandom('MOON-20260721');
assert.deepEqual([a(), a(), a(), a()], [b(), b(), b(), b()], 'seeded random replay');
assert.notEqual(hashSeed('MOON-20260721'), hashSeed('MOON-20260722'), 'seed hash changes');
assert.equal(getDailyEdict('MOON-20260721'), getDailyEdict('MOON-20260721'), 'daily edict stable');
assert.match(createRandomSeed(() => .5, 123456), /^WILD-[A-Z0-9]{5}-[A-Z0-9]{5}$/u, 'random seed format');
assert.equal(formatRunSeed('MOON-20260721'), '오늘 20260721', 'daily display format');
console.log('Daily expedition verification passed.');
