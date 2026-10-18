import test from 'node:test';
import assert from 'node:assert/strict';
import {BARRICADE_MAX_HP,BARRICADE_Z,BARRICADE_HOLD_Z,barricadeDps,stepBarricade,advanceTowardsBarricade} from '../src/barricade.js';
test('barricade holds hero before impact and lets her through after destruction',()=>{
 assert.ok(BARRICADE_Z>BARRICADE_HOLD_Z);
 assert.equal(advanceTowardsBarricade(58,5,BARRICADE_MAX_HP),BARRICADE_HOLD_Z);
 assert.equal(advanceTowardsBarricade(BARRICADE_HOLD_Z,2,0),BARRICADE_HOLD_Z+2);
});
test('auto fire damages barricade without negative HP or frame dependence',()=>{
 const a=stepBarricade(300,50,.1),b=stepBarricade(a.hp,50,.1);
 const combined=stepBarricade(300,50,.2);
 assert.ok(a.hp<300);
 assert.ok(Math.abs(b.hp-combined.hp)<1e-8);
 assert.equal(stepBarricade(1,50,.35).hp,0);
 assert.equal(stepBarricade(0,50,.2).damage,0);
});
test('large units fire more but cannot exceed capped population or 350ms tick',()=>{
 assert.ok(barricadeDps(70)>barricadeDps(12));
 assert.equal(barricadeDps(0),18);
 assert.equal(barricadeDps(100000),barricadeDps(10000));
 assert.equal(stepBarricade(300,50,1).damage,stepBarricade(300,50,.35).damage);
 assert.equal(stepBarricade(300,50,-10).damage,0);
});
