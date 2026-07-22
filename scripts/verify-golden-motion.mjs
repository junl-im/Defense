import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const sourcePath = resolve(import.meta.dirname, '../src/engine/animation-state-system.js');
const source = readFileSync(sourcePath, 'utf8');
const shim = `
class AnimationMixer { constructor(){ } clipAction(){ return { reset(){return this}, setLoop(){return this}, fadeIn(){return this}, fadeOut(){return this}, play(){return this} }; } update(){} stopAllAction(){} }
const THREE = { AnimationMixer, LoopOnce: 2200, LoopRepeat: 2201 };
`;
const transformed = source.replace("import * as THREE from 'three';", shim);
const moduleUrl = `data:text/javascript;base64,${Buffer.from(transformed).toString('base64')}`;
const { AnimationStateSystem, CHARACTER_ANIMATION_STATES } = await import(moduleUrl);

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
  console.log(`PASS ${message}`);
};
const vector = (x=0,y=0,z=0) => ({ x,y,z, clone(){ return vector(this.x,this.y,this.z); }, copy(v){ this.x=v.x;this.y=v.y;this.z=v.z;return this; }, multiplyScalar(v){ this.x*=v;this.y*=v;this.z*=v;return this; }, distanceTo(v){ return Math.hypot(this.x-v.x,this.y-v.y,this.z-v.z); } });
const part = () => ({ rotation: vector(), position: vector(), scale: vector(1,1,1), userData: {} });
const root = { position: vector(0,.3,0), scale: vector(1,1,1), rotation: vector(), visible: true, userData: { parts: { head:part(),armL:part(),armR:part(),legL:part(),legR:part(),weapon:part(),signature:part() } } };
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
assert(['idle','move','run','attack','skill','hit','death'].every((state)=>CHARACTER_ANIMATION_STATES.includes(state)), '골든 샘플 7개 모션 상태');
system.remove(controller);
assert(system.diagnostics.controllers === 0, '애니메이션 컨트롤러 수명 정리');
console.log('Golden motion verification passed.');
