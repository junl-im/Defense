import assert from 'node:assert/strict';
import { MOON_OMENS, ELITE_AFFIXES, selectMoonOmen, rollEliteAffix } from '../src/run-director.js';

assert.equal(MOON_OMENS.length, 8, 'moon omen count');
assert.equal(ELITE_AFFIXES.length, 7, 'elite affix count');
assert.notEqual(selectMoonOmen('harvest', () => 0).id, 'harvest', 'omen should avoid immediate repeat');
assert.equal(rollEliteAffix(2, MOON_OMENS[0], () => 0), null, 'no elites before wave 3 without force');
assert.ok(rollEliteAffix(1, MOON_OMENS[0], () => 0, 0, true), 'forced elite should bypass early-wave lock');
assert.ok(rollEliteAffix(10, MOON_OMENS.find((omen) => omen.id === 'eclipse'), () => 0), 'elite should roll on guaranteed low random');
for (const omen of MOON_OMENS) {
  assert.ok(omen.enemyHp > 0 && omen.enemySpeed > 0 && omen.reward > 0, `valid omen ${omen.id}`);
}
for (const affix of ELITE_AFFIXES) {
  assert.ok(affix.hp > 0 && affix.speed > 0 && affix.reward > 0, `valid affix ${affix.id}`);
}
console.log('Run director verification passed.');
