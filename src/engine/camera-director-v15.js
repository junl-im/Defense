import * as THREE from 'three';

const clamp = THREE.MathUtils.clamp;
const lerp = THREE.MathUtils.lerp;

export default class CameraDirectorV15 {
  constructor() {
    this.spreadBonus = 0;
    this.focusWeight = 0;
    this.pressure = 0;
    this.fovBonus = 0;
    this.shakeLimit = 0.82;
    this.focusPoint = new THREE.Vector3();
    this._sum = new THREE.Vector3();
    this._interest = new THREE.Vector3();
  }

  update({ player, enemies = [], waveActive = false, bossActive = false, interestPoints = [], aspect = 16 / 9, dt = 1 / 60 } = {}) {
    if (!player?.group) return this.snapshot;
    const alive = enemies.filter((enemy) => enemy?.group?.parent && !enemy.dead);
    const sample = alive.slice(0, 32);
    this._sum.set(0, 0, 0);
    let maxRadius = 0;
    let boss = null;
    for (const enemy of sample) {
      const position = enemy.group.position;
      this._sum.add(position);
      maxRadius = Math.max(maxRadius, position.distanceTo(player.group.position));
      if (enemy.boss) boss = enemy;
    }

    const combatFocus = boss
      ? boss.group.position.clone().lerp(player.group.position, .44)
      : sample.length
        ? this._sum.multiplyScalar(1 / sample.length).lerp(player.group.position, .56)
        : player.group.position.clone();

    const activeInterest = interestPoints.filter((point) => point?.position && Number(point.weight || 0) > 0).slice(0, 4);
    let interestWeight = 0;
    this._interest.set(0, 0, 0);
    for (const point of activeInterest) {
      const weight = clamp(Number(point.weight) || 0, 0, 1);
      this._interest.addScaledVector(point.position, weight);
      interestWeight += weight;
    }
    const targetFocus = combatFocus.clone();
    if (interestWeight > 0) {
      this._interest.multiplyScalar(1 / interestWeight);
      targetFocus.lerp(this._interest, clamp(interestWeight * .18, 0, .34));
    }

    const enemyPressure = (sample.length / 24) * .5;
    const spreadPressure = (maxRadius / 32) * .26;
    const bossPressure = bossActive ? .32 : 0;
    const eventPressure = clamp(interestWeight * .08, 0, .16);
    const targetPressure = clamp(enemyPressure + spreadPressure + bossPressure + eventPressure, 0, 1);
    const targetSpread = waveActive
      ? clamp((maxRadius - 7.5) * .09 + sample.length * .027 + (bossActive ? .82 : 0) + eventPressure * 2.2, 0, 3.4)
      : 0;
    const ultrawideBonus = aspect >= 2 ? .5 : aspect >= 1.72 ? .24 : 0;
    const targetFovBonus = waveActive ? clamp(targetPressure * 2.6 + ultrawideBonus, 0, 3.2) : ultrawideBonus * .45;
    const targetWeight = waveActive ? clamp(.075 + targetPressure * .18 + Math.min(.07, interestWeight * .025), 0, .31) : 0;
    const targetShakeLimit = clamp(.86 - targetPressure * .28 - (bossActive ? .08 : 0), .42, .86);
    const blend = 1 - Math.pow(.035, dt);
    this.pressure = lerp(this.pressure, targetPressure, blend);
    this.spreadBonus = lerp(this.spreadBonus, targetSpread, blend);
    this.focusWeight = lerp(this.focusWeight, targetWeight, blend);
    this.fovBonus = lerp(this.fovBonus, targetFovBonus, blend);
    this.shakeLimit = lerp(this.shakeLimit, targetShakeLimit, blend);
    this.focusPoint.lerp(targetFocus, blend);
    return this.snapshot;
  }

  get snapshot() {
    return Object.freeze({
      version: '15.0.0',
      spreadBonus: Number(this.spreadBonus.toFixed(3)),
      focusWeight: Number(this.focusWeight.toFixed(3)),
      pressure: Number(this.pressure.toFixed(3)),
      fovBonus: Number(this.fovBonus.toFixed(3)),
      shakeLimit: Number(this.shakeLimit.toFixed(3)),
      focusPoint: Object.freeze({
        x: Number(this.focusPoint.x.toFixed(2)),
        y: Number(this.focusPoint.y.toFixed(2)),
        z: Number(this.focusPoint.z.toFixed(2))
      })
    });
  }
}
