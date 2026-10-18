import test from 'node:test';import assert from 'node:assert/strict';import {applyGate,phaseForHp,clamp} from '../src/logic.js';
test('gate computes signed changes and multipliers safely',()=>{assert.equal(applyGate(12,'add',5),17);assert.equal(applyGate(12,'multiply',3),36);assert.equal(applyGate(10,'subtract',99),0);assert.equal(applyGate(10000,'multiply',99),10000);assert.throws(()=>applyGate(2,'invalid',4));});
test('boss thresholds',()=>{assert.equal(phaseForHp(100,100),1);assert.equal(phaseForHp(60,100),2);assert.equal(phaseForHp(20,100),3);});
test('lane boundaries',()=>{assert.equal(clamp(-8,-4.9,4.9),-4.9);assert.equal(clamp(8,-4.9,4.9),4.9);});
