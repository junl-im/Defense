import assert from 'node:assert/strict';
import { TUTORIAL_STEPS, tutorialProgress } from '../src/ui/TutorialMissions.js';
const fake = {
  tilesPlaced: 1,
  grid: { cells: new Map([['0,0',{tileType:'village',owner:'player'}],
    ['8,9',{tileType:'forest',owner:'enemy'}]]) },
  researchSystem: { active: null, isCompleted:()=>false },
  progressionSystem: { tier: 0, upgrading: false }
};
const state=()=>tutorialProgress(fake);
assert.equal(TUTORIAL_STEPS.length,6);
assert.equal(state().current.id,'first_land');
assert.equal(state().value,1);
// Enemy homes are created at startup; these MUST NOT count as player's expansion.
assert.equal(state().current.goal,2);
fake.tilesPlaced=2;
fake.grid.cells.set('1,0',{tileType:'forest',owner:'player'});
assert.equal(state().current.id,'field');
fake.tilesPlaced=3;
fake.grid.cells.set('0,1',{tileType:'field',owner:'player'});
assert.equal(state().current.id,'research');
fake.researchSystem.active={id:'agriculture'};
assert.equal(state().current.id,'eight_lands');
fake.tilesPlaced=8;
assert.equal(state().current.id,'promotion');
fake.progressionSystem.upgrading=true;
assert.equal(state().finished,true);
fake.progressionSystem.upgrading=false;
fake.progressionSystem.tier=1;
assert.equal(state().finished,true);
// Restart resets progression. The introductory mission is derived from game state.
fake.tilesPlaced=1;
fake.grid.cells=new Map([['0,0',{tileType:'village',owner:'player'}]]);
fake.researchSystem.active=null;
fake.progressionSystem.tier=0;
assert.equal(state().current.id,'first_land');
console.log('PASS tutorial missions: saved-world inference, enemy exclusion, restart and all 6 stages');
