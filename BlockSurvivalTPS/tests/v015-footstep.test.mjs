import test from 'node:test';
import assert from 'node:assert/strict';
import {footstepCrossed} from '../src/combat-pose.mjs';

test('normal walking emits one footstep at each half-stride boundary',()=>{
 assert.equal(footstepCrossed({previousPhase:3.0,phase:3.3,blend:1,moving:true}),true);
 assert.equal(footstepCrossed({previousPhase:3.3,phase:3.6,blend:1,moving:true}),false);
 assert.equal(footstepCrossed({previousPhase:6.1,phase:6.4,blend:1,moving:true}),true);
});
test('idle and physically blocked movement never create a footstep',()=>{
 assert.equal(footstepCrossed({previousPhase:3,phase:3.5,blend:1,moving:false}),false);
 assert.equal(footstepCrossed({previousPhase:3,phase:3.5,blend:0.1,moving:true}),false);
});
test('invalid or backwards motion cannot trigger particles',()=>{
 assert.equal(footstepCrossed({previousPhase:NaN,phase:5,blend:1,moving:true}),false);
 assert.equal(footstepCrossed({previousPhase:5,phase:4,blend:1,moving:true}),false);
 assert.equal(footstepCrossed({previousPhase:4,phase:Infinity,blend:1,moving:true}),false);
});
