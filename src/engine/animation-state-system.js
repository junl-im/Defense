import * as THREE from 'three';

const DEFAULT_ALIASES = Object.freeze({
  idle: ['idle', 'stand', 'breath'],
  move: ['walk', 'run', 'move'],
  attack: ['attack', 'strike', 'cast', 'shoot'],
  hit: ['hit', 'hurt', 'damage'],
  death: ['death', 'die', 'dead']
});

function findClip(clips, aliases) {
  const lowered = clips.map((clip) => ({ clip, name: clip.name.toLowerCase() }));
  for (const alias of aliases) {
    const match = lowered.find((item) => item.name.includes(alias));
    if (match) return match.clip;
  }
  return null;
}

export class AnimationStateSystem {
  constructor({ lowPower = false, mobile = false } = {}) {
    this.lowPower = lowPower;
    this.mobile = mobile;
    this.controllers = new Set();
    this.frame = 0;
    this.distanceLimit = lowPower ? 18 : mobile ? 24 : 34;
  }

  createController(root, clips = [], { aliases = DEFAULT_ALIASES, procedural = true } = {}) {
    if (!root?.position || !root?.scale) throw new Error('Animation controller root is missing or invalid.');
    const mixer = clips.length ? new THREE.AnimationMixer(root) : null;
    const actions = {};
    for (const [state, names] of Object.entries(aliases)) {
      const clip = findClip(clips, names);
      if (clip && mixer) actions[state] = mixer.clipAction(clip);
    }
    const controller = {
      root, mixer, actions, state: '', previousState: '', stateTime: 0,
      procedural, enabled: true, visibleLastFrame: true, oneShotUntil: 0,
      baseY: root.position.y, baseScale: root.scale.clone(), phase: Math.random() * Math.PI * 2,
      parts: root.userData?.parts || {}, partBase: {}
    };
    for (const [key, part] of Object.entries(controller.parts)) {
      if (part?.rotation) controller.partBase[key] = {
        rotation: part.rotation.clone(),
        position: part.position?.clone?.() || null,
        scale: part.scale?.clone?.() || null
      };
    }
    this.controllers.add(controller);
    this.setState(controller, 'idle', { immediate: true });
    return controller;
  }

  remove(controller) {
    if (!controller) return;
    controller.mixer?.stopAllAction();
    controller.enabled = false;
    this.controllers.delete(controller);
  }

  clear() {
    for (const controller of [...this.controllers]) this.remove(controller);
  }

  setState(controller, state, { immediate = false, oneShot = false, duration = 0.25 } = {}) {
    if (!controller || !controller.enabled) return;
    if (controller.state === state && !oneShot) return;
    controller.previousState = controller.state;
    controller.state = state;
    controller.stateTime = 0;
    controller.oneShotUntil = oneShot ? duration : 0;
    const next = controller.actions[state];
    if (next) {
      const current = controller.actions[controller.previousState];
      if (current && current !== next) current.fadeOut(immediate ? 0 : 0.12);
      next.reset().setLoop(oneShot ? THREE.LoopOnce : THREE.LoopRepeat, oneShot ? 1 : Infinity);
      next.clampWhenFinished = oneShot;
      next.fadeIn(immediate ? 0 : 0.12).play();
    }
  }

  trigger(controller, state, duration = 0.22) {
    this.setState(controller, state, { oneShot: true, duration });
  }

  updateController(controller, dt, camera) {
    if (!controller?.enabled || !controller.root?.visible) return;
    const distance = camera ? controller.root.position.distanceTo(camera.position) : 0;
    const inRange = distance <= this.distanceLimit;
    if (controller.mixer && inRange) controller.mixer.update(dt);
    controller.stateTime += dt;
    if (controller.oneShotUntil > 0) {
      controller.oneShotUntil -= dt;
      if (controller.oneShotUntil <= 0) this.setState(controller, controller.previousState || 'idle');
    }
    if (!controller.procedural || controller.mixer || !inRange) return;
    const t = controller.stateTime;
    const phase = controller.phase;
    const { weapon, shoulders, signature, rankBeads, halo, head, armL, armR, legL, legR, cloth, shoulderL, shoulderR } = controller.parts;
    for (const [key, part] of Object.entries(controller.parts)) {
      const base = controller.partBase[key];
      if (!part || !base) continue;
      if (base.rotation) part.rotation.copy(base.rotation);
      if (base.scale) part.scale.copy(base.scale);
    }
    const addRot = (part, key, x = 0, y = 0, z = 0) => {
      if (!part || !controller.partBase[key]?.rotation) return;
      part.rotation.x += x; part.rotation.y += y; part.rotation.z += z;
    };
    if (rankBeads) rankBeads.rotation.y += dt * .8;
    if (halo) halo.rotation.z += dt * .48;
    if (signature) signature.position.y = (signature.userData.baseY ?? signature.position.y) + Math.sin(t * 3 + phase) * .025;
    if (controller.state === 'move') {
      const stride = Math.sin(t * 10.5 + phase);
      controller.root.rotation.z = stride * 0.045;
      controller.root.position.y = controller.baseY + Math.abs(stride) * .065;
      if (shoulders) shoulders.rotation.z = stride * .08;
      addRot(armL, 'armL', stride * .46, 0, .08);
      addRot(armR, 'armR', -stride * .46, 0, -.08);
      addRot(legL, 'legL', -stride * .5, 0, 0);
      addRot(legR, 'legR', stride * .5, 0, 0);
      addRot(cloth, 'cloth', -.08 - Math.abs(stride) * .08, 0, stride * .03);
      addRot(head, 'head', 0, -stride * .035, -stride * .018);
    } else if (controller.state === 'attack') {
      const strike = Math.sin(Math.min(1, t / 0.22) * Math.PI);
      controller.root.rotation.x = strike * -0.16;
      controller.root.rotation.z = strike * -.035;
      addRot(armR, 'armR', -strike * .82, strike * -.18, strike * -.42);
      addRot(armL, 'armL', strike * .24, 0, strike * .12);
      addRot(weapon, 'weapon', -strike * .3, strike * -.62, strike * -.24);
      addRot(head, 'head', strike * -.08, strike * .08, 0);
      if (signature) signature.scale.multiplyScalar(1 + strike * .14);
    } else if (controller.state === 'hit') {
      const hit = Math.sin(t * 34);
      controller.root.rotation.z = hit * 0.09;
      addRot(head, 'head', .08, 0, hit * .04);
      addRot(armL, 'armL', -.12, 0, -.1);
      addRot(armR, 'armR', -.12, 0, .1);
      if (signature) signature.scale.multiplyScalar(1 + Math.sin(t * 28) * .08);
    } else if (controller.state === 'idle') {
      const breath = Math.sin(t * 2.2 + phase);
      controller.root.position.y = controller.baseY + breath * .026;
      controller.root.rotation.z = Math.sin(t * 1.7 + phase) * .012;
      addRot(armL, 'armL', breath * .025, 0, breath * .02);
      addRot(armR, 'armR', -breath * .025, 0, -breath * .02);
      addRot(head, 'head', 0, Math.sin(t * .8 + phase) * .025, breath * .008);
      addRot(cloth, 'cloth', breath * .025, 0, 0);
      addRot(shoulderL, 'shoulderL', 0, 0, breath * .018);
      addRot(shoulderR, 'shoulderR', 0, 0, -breath * .018);
    } else if (controller.state === 'death') {
      const fall = Math.min(1, t * 2.6);
      controller.root.rotation.x = fall * Math.PI * 0.48;
      addRot(armL, 'armL', fall * .6, 0, fall * -.25);
      addRot(armR, 'armR', fall * .6, 0, fall * .25);
    }
  }

  update(dt, camera) {
    this.frame += 1;
    const stride = this.lowPower ? 2 : 1;
    if (this.frame % stride !== 0) return;
    const scaledDt = dt * stride;
    for (const controller of this.controllers) this.updateController(controller, scaledDt, camera);
  }

  get diagnostics() {
    let mixers = 0;
    for (const controller of this.controllers) if (controller.mixer) mixers += 1;
    return { controllers: this.controllers.size, mixers, distanceLimit: this.distanceLimit };
  }
}

export const CHARACTER_ANIMATION_STATES = Object.freeze(['idle', 'move', 'attack', 'hit', 'death']);
