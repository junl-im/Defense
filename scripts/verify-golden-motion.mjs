import * as THREE from 'three';
import { AnimationStateSystem, CHARACTER_ANIMATION_STATES } from '../src/engine/animation-state-system.js';

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
  console.log(`PASS ${message}`);
};

const root = new THREE.Group();
root.userData.parts = {
  head: new THREE.Group(), armL: new THREE.Group(), armR: new THREE.Group(),
  legL: new THREE.Group(), legR: new THREE.Group(), weapon: new THREE.Group(), signature: new THREE.Group()
};
for (const part of Object.values(root.userData.parts)) root.add(part);
const system = new AnimationStateSystem();
const controller = system.createController(root, [], { procedural: true });
system.setBaseState(controller, 'move');
assert(controller.state === 'move' && controller.baseState === 'move', 'Walk 기본 상태 설정');
system.trigger(controller, 'attack', .1);
system.setBaseState(controller, 'run');
system.updateController(controller, .12, null);
assert(controller.state === 'run', 'Attack 종료 후 최신 Run 상태 복귀');
system.trigger(controller, 'skill', .1);
system.updateController(controller, .12, null);
assert(controller.state === 'run', 'Skill 종료 후 Run 상태 복귀');
assert(['idle', 'move', 'run', 'attack', 'skill', 'hit', 'death'].every((state) => CHARACTER_ANIMATION_STATES.includes(state)), '골든 샘플 7개 모션 상태');
system.remove(controller);
assert(system.diagnostics.controllers === 0, '애니메이션 컨트롤러 수명 정리');
console.log('Golden motion verification passed.');
