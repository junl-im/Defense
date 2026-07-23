import * as THREE from 'three';

export const COMBAT_READABILITY_V21_VERSION = '21.0.0';

const clamp = THREE.MathUtils.clamp;

export default class CombatReadabilityDirectorV21 {
  constructor({ effectRoot, lowPower = false } = {}) {
    this.version = COMBAT_READABILITY_V21_VERSION;
    this.effectRoot = effectRoot;
    this.lowPower = lowPower;
    this.elapsed = 0;
    this.markers = new Map();
    this.tracers = [];
    this.totalTracers = 0;
    this.maxMarkers = lowPower ? 18 : 32;
    this.sharedRingGeometry = new THREE.RingGeometry(.7, .9, 28);
    this.snapshot = Object.freeze({ version: this.version, markers: 0, tracers: 0, totalTracers: 0 });
  }

  ensureMarker(enemy) {
    if (!enemy?.group || enemy.dead || this.markers.has(enemy)) return;
    if (this.markers.size >= this.maxMarkers && !enemy.boss) return;
    const scale = Number(enemy.group.userData.scale || 1);
    const color = enemy.boss ? 0xff4f70 : enemy.elite ? 0xffc85a : 0x74d9ff;
    const material = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: enemy.boss ? .62 : .3, side: THREE.DoubleSide, depthWrite: false, depthTest: true });
    const marker = new THREE.Mesh(this.sharedRingGeometry, material);
    marker.rotation.x = -Math.PI / 2;
    marker.position.y = .055;
    marker.scale.setScalar(clamp(scale * (enemy.boss ? 2.25 : 1.28), .75, 4.2));
    marker.renderOrder = 3;
    enemy.group.add(marker);
    this.markers.set(enemy, marker);
  }

  spawnThreatTracer(origin, target, color = 0xff5566, duration = .8) {
    if (!this.effectRoot || !origin || !target) return null;
    const start = origin.clone().add(new THREE.Vector3(0, 1.15, 0));
    const end = target.clone().add(new THREE.Vector3(0, .18, 0));
    const direction = end.clone().sub(start);
    const length = Math.max(.1, direction.length());
    const material = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: .82, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(.045, .12, length, 8, 1, true), material);
    beam.position.copy(start).add(end).multiplyScalar(.5);
    beam.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
    beam.renderOrder = 8;
    const cap = new THREE.Mesh(new THREE.RingGeometry(.28, .42, 24), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: .88, side: THREE.DoubleSide, depthWrite: false }));
    cap.rotation.x = -Math.PI / 2;
    cap.position.copy(end);
    cap.renderOrder = 9;
    this.effectRoot.add(beam, cap);
    const tracer = { beam, cap, life: duration, maxLife: duration };
    this.tracers.push(tracer);
    this.totalTracers += 1;
    return tracer;
  }

  update(dt, { enemies = [], state = 'title' } = {}) {
    this.elapsed += dt;
    if (state === 'playing') {
      for (const enemy of enemies) this.ensureMarker(enemy);
    }
    for (const [enemy, marker] of this.markers) {
      if (!enemy || enemy.dead || !enemy.group?.parent) {
        marker.parent?.remove(marker);
        marker.material.dispose();
        this.markers.delete(enemy);
        continue;
      }
      const urgency = enemy.boss ? .72 : enemy.abilityState === 'windup' || enemy.abilityState === 'casting' ? .62 : .3;
      marker.material.opacity = urgency + Math.sin(this.elapsed * (enemy.boss ? 5 : 8) + (enemy.id || 0)) * .08;
      marker.rotation.z += dt * (enemy.boss ? .7 : .35);
    }
    for (let index = this.tracers.length - 1; index >= 0; index -= 1) {
      const tracer = this.tracers[index];
      tracer.life -= dt;
      const ratio = clamp(tracer.life / tracer.maxLife, 0, 1);
      tracer.beam.material.opacity = ratio * .82;
      tracer.cap.material.opacity = ratio * .9;
      tracer.cap.scale.setScalar(1 + (1 - ratio) * 1.4);
      if (tracer.life > 0) continue;
      this.effectRoot.remove(tracer.beam, tracer.cap);
      tracer.beam.geometry.dispose();
      tracer.beam.material.dispose();
      tracer.cap.geometry.dispose();
      tracer.cap.material.dispose();
      this.tracers.splice(index, 1);
    }
    this.snapshot = Object.freeze({
      version: this.version,
      markers: this.markers.size,
      tracers: this.tracers.length,
      totalTracers: this.totalTracers,
      maxMarkers: this.maxMarkers
    });
    return this.snapshot;
  }

  dispose() {
    for (const [, marker] of this.markers) {
      marker.parent?.remove(marker);
      marker.material.dispose();
    }
    this.markers.clear();
    for (const tracer of this.tracers) {
      this.effectRoot?.remove(tracer.beam, tracer.cap);
      tracer.beam.geometry.dispose();
      tracer.beam.material.dispose();
      tracer.cap.geometry.dispose();
      tracer.cap.material.dispose();
    }
    this.tracers.length = 0;
    this.sharedRingGeometry.dispose();
  }
}
