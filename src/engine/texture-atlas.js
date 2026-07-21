import * as THREE from 'three';

export class TextureAtlas {
  constructor(texture, columns = 1, rows = 1) {
    this.texture = texture;
    this.columns = Math.max(1, columns);
    this.rows = Math.max(1, rows);
    if (texture) {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.wrapS = THREE.ClampToEdgeWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
      texture.generateMipmaps = true;
      texture.needsUpdate = true;
    }
  }

  frame(index) {
    const column = index % this.columns;
    const row = Math.floor(index / this.columns) % this.rows;
    return {
      offset: new THREE.Vector2(column / this.columns, 1 - (row + 1) / this.rows),
      repeat: new THREE.Vector2(1 / this.columns, 1 / this.rows)
    };
  }

  apply(material, index) {
    if (!this.texture || !material) return material;
    const map = this.texture.clone();
    const frame = this.frame(index);
    map.offset.copy(frame.offset);
    map.repeat.copy(frame.repeat);
    map.needsUpdate = true;
    material.map = map;
    material.needsUpdate = true;
    return material;
  }
}
