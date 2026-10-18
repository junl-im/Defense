import test from 'node:test';
import assert from 'node:assert/strict';
import {SECTIONS,BARRIERS,GATE_BLUEPRINTS,WAVES,getSection,progressPercent,initialGates,expectedRunSeconds,LEVEL_FINISH_Z,BOSS_TRIGGER_Z,BOSS_STOP_Z} from '../src/long-level.js';
test('long campaign has 8 sections, 17 gate decisions, 15 enemy waves, 4 barricades',()=>{
 assert.equal(SECTIONS.length,8);assert.equal(GATE_BLUEPRINTS.length,17);
 assert.equal(WAVES.length,15);assert.equal(BARRIERS.length,4);
 assert.ok(expectedRunSeconds()>115,'run must exceed two minutes even before encounters');
 assert.equal(getSection(4).index,0);assert.equal(getSection(701).index,7);
 assert.equal(progressPercent(3),0);assert.equal(progressPercent(LEVEL_FINISH_Z),100);
});
test('encounters ordered and do not overlap boss',()=>{
 for(const list of [BARRIERS,GATE_BLUEPRINTS,WAVES]) {
  for(let i=1;i<list.length;i++) assert.ok(list[i].z>list[i-1].z);
  assert.ok(list.every(item=>item.z<BOSS_TRIGGER_Z));
 }
 assert.ok(BOSS_STOP_Z>BOSS_TRIGGER_Z);
});
test('gate reset does not mutate master data',()=>{
 const a=initialGates(),b=initialGates();a[0].done=true;a[0].choices[0].value=9999;
 assert.equal(b[0].done,false);assert.notEqual(b[0].choices[0].value,9999);
});
test('long-level stats model should exceed 2000 enemies',()=>{
 assert.ok(WAVES.reduce((a,w)=>a+w.count,0)>2000);
});
