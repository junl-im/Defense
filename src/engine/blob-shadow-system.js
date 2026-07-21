import * as THREE from 'three';
import { InstanceBatch } from './instance-batch.js';

export class BlobShadowSystem {
  constructor(capacity = 96) {
    const geometry = new THREE.CircleGeometry(0.72, 12);
    geometry.rotateX(-Math.PI / 2);
    const material = new THREE.MeshBasicMaterial({
      color: 0x05030a,
      transparent: true,
      opacity: 0.28,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1
    });
    this.batch = new InstanceBatch(geometry, material, capacity, { name: 'BlobShadows', dynamic: true });
    this.batch.mesh.renderOrder = 1;
    this.capacity = capacity;
  }

  update(entries) {
    const count = Math.min(entries.length, this.capacity);
    this.batch.count = count;
    this.batch.mesh.count = count;
    for (let i = 0; i < count; i += 1) {
      const entry = entries[i];
      const position = entry.position.clone();
      position.y = 0.035;
      this.batch.set(i, {
        position,
        scale: new THREE.Vector3(entry.radius || 1, entry.radius || 1, entry.radius || 1)
      });
    }
    this.batch.commit();
    this.batch.mesh.visible = count > 0;
  }

  dispose() {
    this.batch.mesh.geometry.dispose();
    this.batch.mesh.material.dispose();
  }
}
