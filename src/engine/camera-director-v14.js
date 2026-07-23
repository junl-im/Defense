import * as THREE from 'three';

const clamp = THREE.MathUtils.clamp;
const lerp = THREE.MathUtils.lerp;

export default class CameraDirectorV14 {
  constructor() {
    this.spreadBonus = 0;
    this.focusWeight = 0;
    this.pressure = 0;
    this.focusPoint = new THREE.Vector3();
    this._sum = new THREE.Vector3();
  }

  update({ player, enemies = [], waveActive = false, bossActive = false, dt = 1 / 60 } = {}) {
    if (!player?.group) return this.snapshot;
    const alive = enemies.filter((enemy) => enemy?.group?.parent && !enemy.dead);
    const sample = alive.slice(0, 28);
    this._sum.set(0, 0, 0);
    let maxRadius = 0;
    let boss = null;
    for (const enemy of sample) {
      const position = enemy.group.position;
      this._sum.add(position);
      maxRadius = Math.max(maxRadius, position.distanceTo(player.group.position));
      if (enemy.boss) boss = enemy;
    }
    const targetFocus = boss
      ? boss.group.position.clone().lerp(player.group.position, .46)
      : sample.length
        ? this._sum.multiplyScalar(1 / sample.length).lerp(player.group.position, .58)
        : player.group.position;
    const targetPressure = clamp((sample.length / 22) * .55 + (maxRadius / 30) * .28 + (bossActive ? .32 : 0), 0, 1);
    const targetSpread = waveActive ? clamp((maxRadius - 8) * .085 + sample.length * .025 + (bossActive ? .7 : 0), 0, 2.4) : 0;
    const targetWeight = waveActive ? clamp(.08 + targetPressure * .18, 0, .28) : 0;
    const blend = 1 - Math.pow(.035, dt);
    this.pressure = lerp(this.pressure, targetPressure, blend);
    this.spreadBonus = lerp(this.spreadBonus, targetSpread, blend);
    this.focusWeight = lerp(this.focusWeight, targetWeight, blend);
    this.focusPoint.lerp(targetFocus, blend);
    return this.snapshot;
  }

  get snapshot() {
    return Object.freeze({
      version: '14.0.0',
      spreadBonus: Number(this.spreadBonus.toFixed(3)),
      focusWeight: Number(this.focusWeight.toFixed(3)),
      pressure: Number(this.pressure.toFixed(3)),
      focusPoint: Object.freeze({
        x: Number(this.focusPoint.x.toFixed(2)),
        y: Number(this.focusPoint.y.toFixed(2)),
        z: Number(this.focusPoint.z.toFixed(2))
      })
    });
  }
}
