import assert from 'node:assert/strict';
import {
  RUN_MODES, RELICS, RELIC_SET_BONUSES, getRunMode, getRelicSetProgress,
  activateRelicSetBonuses, selectRelicOptions, rollWaveTrial,
  getWaveTrialProgress, getWaveTrialReward, formatTrialProgress
} from '../src/expedition-director.js';
import { createSeededRandom } from '../src/daily-expedition.js';

assert.equal(Object.keys(RUN_MODES).length, 4, 'run mode count');
assert.equal(RELICS.length, 18, 'relic count');
assert.equal(RELICS.filter((relic) => relic.cursed).length, 4, 'cursed relic count');
assert.equal(Object.keys(RELIC_SET_BONUSES).length, 4, 'relic set count');
assert.equal(getRunMode('missing').id, 'guardian', 'invalid mode fallback');
assert.ok(RUN_MODES.abyss.enemyHp > RUN_MODES.guardian.enemyHp, 'abyss enemy scaling');
assert.ok(RUN_MODES.abyss.score > RUN_MODES.eclipse.score, 'abyss score scaling');
assert.ok(RUN_MODES.convergence.reactionDamage > 1 && RUN_MODES.convergence.statusDuration > 1, 'convergence reaction and status scaling');

const excluded = RELICS.slice(0, 4).map((relic) => relic.id);
const relicOptions = selectRelicOptions(excluded, createSeededRandom('relic-test'), 3);
assert.equal(relicOptions.length, 3, 'three relic options');
assert.ok(relicOptions.every((relic) => !excluded.includes(relic.id)), 'relic history exclusion');
const cursedOffer = selectRelicOptions([], createSeededRandom('boss-reward'), 3, { guaranteeCursed: true });
assert.ok(cursedOffer.some((relic) => relic.cursed), 'boss reward guarantees cursed choice');

const first = rollWaveTrial(1, 'guardian', '', () => 0);
assert.equal(first.id, 'perfect', 'deterministic first trial');
assert.notEqual(rollWaveTrial(4, 'guardian', first.id, () => 0).id, first.id, 'trial avoids immediate repeat');
const last = rollWaveTrial(8, 'abyss', '', () => .9999);
assert.equal(last.id, 'dash', 'deterministic final trial');
assert.equal(last.target, 3, 'late dash target');

const fakeGame = {
  coreHp: 100, waveStartHp: 100, waveMaxChain: 13,
  runStats: { eliteKills: 4, coinsCollected: 50, skillDamage: 400, dashUses: 5 }
};
assert.equal(getWaveTrialProgress(fakeGame, { id: 'perfect', start: {} }), 1, 'perfect trial progress');
assert.equal(getWaveTrialProgress(fakeGame, { id: 'chain', start: {} }), 13, 'chain trial progress');
assert.equal(getWaveTrialProgress(fakeGame, { id: 'collector', start: { coinsCollected: 20 } }), 30, 'collector delta');
assert.equal(getWaveTrialProgress(fakeGame, { id: 'skill', start: { skillDamage: 125 } }), 275, 'skill damage delta');
assert.equal(getWaveTrialProgress(fakeGame, { id: 'dash', start: { dashUses: 2 } }), 3, 'dash delta');

const guardianReward = getWaveTrialReward(6, 'guardian', 1);
const abyssReward = getWaveTrialReward(6, 'abyss', 1.5);
assert.ok(abyssReward.gold > guardianReward.gold, 'mode and relic reward scaling');
assert.ok(abyssReward.score > guardianReward.score, 'score reward scaling');
assert.match(formatTrialProgress({ id: 'dash', target: 3, progress: 2 }), /2 \/ 3/, 'progress formatting');
assert.equal(formatTrialProgress({ id: 'perfect', completed: true, progress: 1 }), '무피해 달성', 'perfect formatting');

const relicGame = {
  mods: { goldMultiplier: 1, pickupRadius: 0, unitCooldown: 1, commandCooldown: 1, unitDamage: 1, coreDamage: 1, moveSpeed: 1, dashCooldown: 1, skillDamage: 1, skillCooldown: 1, luckGain: 1, summonDiscount: 0, heroDamage: 1, soulGain: 1, burstDuration: 0, burstPower: 1, objectiveReward: 1, eliteReward: 1, reactionDamage: 1, statusDuration: 1, statusPotency: 1, coreHealing: 1 },
  coreMaxHp: 100, coreHp: 80, moonWard: 0, choiceTickets: 0,
  relicHistory: ['warDrum', 'spiritBlade'], activeRelicSets: []
};
const progress = getRelicSetProgress(relicGame.relicHistory);
assert.equal(progress.war.active, true, 'two relic set threshold');
const activated = activateRelicSetBonuses(relicGame);
assert.equal(activated.length, 1, 'one set activates');
assert.equal(relicGame.activeRelicSets[0], 'war', 'war set recorded');
assert.equal(activateRelicSetBonuses(relicGame).length, 0, 'set bonus cannot duplicate');
console.log('Expedition system verification passed.');
