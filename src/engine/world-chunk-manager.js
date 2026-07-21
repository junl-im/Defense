export class WorldChunkManager {
  constructor({ chunkSize = 24, visibleChunkRadius = 2 } = {}) {
    this.chunkSize = chunkSize;
    this.visibleChunkRadius = visibleChunkRadius;
    this.chunks = new Map();
    this.centerKey = '';
    this.activeKeys = new Set();
  }

  coordinatesFromPosition(position) {
    return {
      x: Math.round(position.x / this.chunkSize),
      z: Math.round(position.z / this.chunkSize)
    };
  }

  keyFromPosition(position) {
    const { x, z } = this.coordinatesFromPosition(position);
    return `${x}:${z}`;
  }

  register(key, object) {
    if (!this.chunks.has(key)) this.chunks.set(key, new Set());
    this.chunks.get(key).add(object);
    return () => this.chunks.get(key)?.delete(object);
  }

  registerAtPosition(position, object) {
    return this.register(this.keyFromPosition(position), object);
  }

  update(position, force = false) {
    const { x: cx, z: cz } = this.coordinatesFromPosition(position);
    const key = `${cx}:${cz}`;
    if (!force && key === this.centerKey) return false;
    this.centerKey = key;
    this.activeKeys.clear();
    for (const [chunkKey, objects] of this.chunks) {
      const [x, z] = chunkKey.split(':').map(Number);
      const visible = Math.abs(x - cx) <= this.visibleChunkRadius && Math.abs(z - cz) <= this.visibleChunkRadius;
      if (visible) this.activeKeys.add(chunkKey);
      objects.forEach((object) => { object.visible = visible; });
    }
    return true;
  }

  get diagnostics() {
    let totalObjects = 0;
    let visibleObjects = 0;
    for (const [key, objects] of this.chunks) {
      totalObjects += objects.size;
      if (this.activeKeys.has(key)) visibleObjects += objects.size;
    }
    return {
      active: this.activeKeys.size,
      total: this.chunks.size,
      visibleObjects,
      totalObjects,
      centerKey: this.centerKey
    };
  }

  clear() {
    this.chunks.clear();
    this.activeKeys.clear();
    this.centerKey = '';
  }
}
