import * as THREE from 'three';

const scratch = new THREE.Object3D();

export class InstanceBatch {
  constructor(geometry, material, capacity, options = {}) {
    this.mesh = new THREE.InstancedMesh(geometry, material, capacity);
    this.mesh.name = options.name || 'InstanceBatch';
    this.mesh.castShadow = Boolean(options.castShadow);
    this.mesh.receiveShadow = Boolean(options.receiveShadow);
    this.mesh.frustumCulled = options.frustumCulled !== false;
    this.capacity = capacity;
    this.count = 0;
    this.mesh.count = 0;
    this.mesh.instanceMatrix.setUsage(options.dynamic ? THREE.DynamicDrawUsage : THREE.StaticDrawUsage);
  }

  addMatrix(matrix, color) {
    if (this.count >= this.capacity) return -1;
    this.mesh.setMatrixAt(this.count, matrix);
    if (color) this.mesh.setColorAt(this.count, color);
    this.count += 1;
    this.mesh.count = this.count;
    return this.count - 1;
  }

  add({ position, rotation, scale, color } = {}) {
    if (this.count >= this.capacity) return -1;
    scratch.position.copy(position || new THREE.Vector3());
    scratch.rotation.set(rotation?.x || 0, rotation?.y || 0, rotation?.z || 0);
    if (typeof scale === 'number') scratch.scale.setScalar(scale);
    else scratch.scale.copy(scale || new THREE.Vector3(1, 1, 1));
    scratch.updateMatrix();
    this.mesh.setMatrixAt(this.count, scratch.matrix);
    if (color) this.mesh.setColorAt(this.count, color);
    this.count += 1;
    this.mesh.count = this.count;
    return this.count - 1;
  }

  set(index, { position, rotation, scale, color } = {}) {
    if (index < 0 || index >= this.capacity) return false;
    scratch.position.copy(position || new THREE.Vector3());
    scratch.rotation.set(rotation?.x || 0, rotation?.y || 0, rotation?.z || 0);
    if (typeof scale === 'number') scratch.scale.setScalar(scale);
    else scratch.scale.copy(scale || new THREE.Vector3(1, 1, 1));
    scratch.updateMatrix();
    this.mesh.setMatrixAt(index, scratch.matrix);
    if (color) this.mesh.setColorAt(index, color);
    return true;
  }

  commit() {
    this.mesh.instanceMatrix.needsUpdate = true;
    if (this.mesh.instanceColor) this.mesh.instanceColor.needsUpdate = true;
  }
}
