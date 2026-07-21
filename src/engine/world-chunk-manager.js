export class WorldChunkManager {
  constructor({ chunkSize = 24, visibleChunkRadius = 2 } = {}) {
    this.chunkSize = chunkSize;
    this.visibleChunkRadius = visibleChunkRadius;
    this.chunks = new Map();
    this.centerKey = '';
  }

  keyFromPosition(position) {
    const x = Math.floor(position.x / this.chunkSize);
    const z = Math.floor(position.z / this.chunkSize);
    return `${x}:${z}`;
  }

  register(key, object) {
    if (!this.chunks.has(key)) this.chunks.set(key, new Set());
    this.chunks.get(key).add(object);
    return () => this.chunks.get(key)?.delete(object);
  }

  update(position) {
    const cx = Math.floor(position.x / this.chunkSize);
    const cz = Math.floor(position.z / this.chunkSize);
    const key = `${cx}:${cz}`;
    if (key === this.centerKey) return false;
    this.centerKey = key;
    for (const [chunkKey, objects] of this.chunks) {
      const [x, z] = chunkKey.split(':').map(Number);
      const visible = Math.abs(x - cx) <= this.visibleChunkRadius && Math.abs(z - cz) <= this.visibleChunkRadius;
      objects.forEach((object) => { object.visible = visible; });
    }
    return true;
  }

  clear() {
    this.chunks.clear();
    this.centerKey = '';
  }
}
