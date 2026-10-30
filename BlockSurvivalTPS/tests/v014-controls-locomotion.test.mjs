import test from 'node:test';
import assert from 'node:assert/strict';
import {applyLookDelta,LOOK_SENSITIVITY} from '../src/control-math.mjs';
import {heroStridePose} from '../src/combat-pose.mjs';

test('mouse right turns right and mouse left turns left in real yaw coordinates',()=>{
 const right=applyLookDelta(0,0,50,0);
 const left=applyLookDelta(0,0,-50,0);
 assert.ok(right.yaw>0);assert.ok(left.yaw<0);
 assert.ok(Math.abs(right.yaw+left.yaw)<1e-10);
});
test('touch uses the same horizontal direction with slower, bounded vertical movement',()=>{
 const right=applyLookDelta(0.4,0.1,30,0,{horizontal:LOOK_SENSITIVITY.touchX,vertical:LOOK_SENSITIVITY.touchY});
 assert.ok(right.yaw>0.4);
 const lookDown=applyLookDelta(0.4,0,0,30,{horizontal:LOOK_SENSITIVITY.touchX,vertical:LOOK_SENSITIVITY.touchY});
 assert.ok(lookDown.pitch<0);
 assert.ok(Math.abs(applyLookDelta(0,0,0,10000).pitch+0.204)<1e-6);
});
test('mouse down looks down and input is safe for invalid deltas',()=>{
 assert.ok(applyLookDelta(0,0,0,60).pitch<0);
 assert.deepEqual(applyLookDelta(0,0,NaN,Infinity),{yaw:0,pitch:0});
});
test('leg stride is alternating and more visible during running',()=>{
 const a=heroStridePose({phase:Math.PI/2,blend:1,sprint:false});
 const b=heroStridePose({phase:Math.PI/2,blend:1,sprint:true});
 assert.ok(a.leftThigh>0.3);assert.equal(a.rightThigh,-a.leftThigh);
 assert.ok(b.leftThigh>a.leftThigh);
 assert.ok(a.bob>=0);
});
test('stopping returns the procedural layer to a neutral rest pose',()=>{
 const v=heroStridePose({phase:Math.PI/2,blend:0,sprint:true,strafe:1});
 for(const number of Object.values(v))assert.ok(Math.abs(number)<1e-9);
});
test('procedural gait ignores invalid phase and is bounded for mobile framerate drops',()=>{
 const v=heroStridePose({phase:NaN,blend:8,strafe:Infinity});
 for(const n of Object.values(v))assert.ok(Number.isFinite(n));
 assert.ok(Math.abs(v.leftThigh)<=0.41);
});
