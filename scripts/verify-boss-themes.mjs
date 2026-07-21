import assert from 'node:assert/strict';
import { ENEMY_TYPES } from '../src/game-data.js';
import { BOSS_WAVE_TABLE, BOSS_PROFILES, getBossWave, getBossTypeForWave, getBossSpawnCount, isBossWave } from '../src/boss-director.js';
import { BATTLEFIELD_THEMES, getBattlefieldTheme } from '../src/battlefield-themes.js';

assert.deepEqual(Object.keys(BOSS_WAVE_TABLE).map(Number), [4, 7, 10], 'three boss wave cadence');
assert.equal(getBossTypeForWave(4), 'tiger', 'first boss');
assert.equal(getBossTypeForWave(7), 'serpent', 'middle boss');
assert.equal(getBossTypeForWave(10), 'king', 'final boss');
assert.equal(getBossWave(5), null, 'normal wave has no boss');
assert.equal(isBossWave(7), true, 'boss wave predicate');
assert.equal(isBossWave(8), false, 'normal wave predicate');
assert.ok(getBossSpawnCount(10) > getBossSpawnCount(4), 'final wave has more adds');
assert.equal(BOSS_PROFILES.king.phases, 3, 'king phase count');
assert.equal(BOSS_PROFILES.serpent.phases, 2, 'serpent phase count');
for (const id of ['tiger', 'serpent', 'king']) assert.equal(ENEMY_TYPES[id].boss, true, `${id} boss data`);
assert.equal(Object.keys(BATTLEFIELD_THEMES).length, 9, 'default plus eight omen themes');
for (const id of ['harvest','blood','frost','storm','eclipse','hunt','ghost','dawn']) {
  const theme = getBattlefieldTheme(id);
  assert.equal(typeof theme.background, 'number', `${id} background`);
  assert.equal(typeof theme.fogDensity, 'number', `${id} fog density`);
}
assert.equal(getBattlefieldTheme('missing'), BATTLEFIELD_THEMES.default, 'theme fallback');
console.log('Boss and battlefield theme verification passed.');
