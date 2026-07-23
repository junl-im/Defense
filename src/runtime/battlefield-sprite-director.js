import * as THREE from 'three';
import { IP_V14_ATLAS_PAGES, getV14AtlasFrame } from '../ip-asset-library-v14.js';

const DECOR_SET = Object.freeze([
  { key: 'env-blue-lantern', radius: 13.4, angle: .18, scale: 3.1, y: 1.55 },
  { key: 'env-hanging-lantern', radius: 17.6, angle: .78, scale: 3.4, y: 1.7 },
  { key: 'env-mana-crystal', radius: 19.2, angle: 1.42, scale: 3.9, y: 1.75 },
  { key: 'env-fire-brazier', radius: 14.5, angle: 2.1, scale: 3.4, y: 1.45 },
  { key: 'env-market-house', radius: 23.5, angle: 2.74, scale: 5.4, y: 2.25 },
  { key: 'env-red-gate', radius: 24.8, angle: 3.35, scale: 5.2, y: 2.5 },
  { key: 'env-sacred-tree-green', radius: 22.3, angle: 4.02, scale: 5.1, y: 2.35 },
  { key: 'env-sacred-tree-autumn', radius: 23.7, angle: 4.68, scale: 5.1, y: 2.35 },
  { key: 'vfx-spirit-flame', radius: 11.6, angle: 5.18, scale: 2.1, y: 1.2, pulse: true },
  { key: 'vfx-ice-burst', radius: 11.8, angle: 5.72, scale: 2.35, y: 1.05, pulse: true },
  { key: 'vfx-heal-circle', radius: 8.6, angle: 1.12, scale: 2.55, y: .35, pulse: true },
  { key: 'vfx-fire-impact', radius: 8.8, angle: 3.84, scale: 2.4, y: .65, pulse: true }
]);

function loadTexture(url) {
  return new Promise((resolve, reject) => {
    new THREE.TextureLoader().load(url, (texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.wrapS = THREE.ClampToEdgeWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
      texture.generateMipmaps = true;
      texture.minFilter = THREE.LinearMipmapLinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.needsUpdate = true;
      resolve(texture);
    }, undefined, reject);
  });
}

export default class BattlefieldSpriteDirector {
  constructor({ lowPower = false } = {}) {
    this.lowPower = Boolean(lowPower);
    this.pageTextures = [];
    this.root = null;
    this.sprites = [];
    this.loaded = false;
    this.failed = false;
  }

  async preload() {
    if (this.loaded || this.failed) return this.loaded;
    try {
      this.pageTextures = await Promise.all(IP_V14_ATLAS_PAGES.map((page) => loadTexture(page.webp)));
      this.loaded = this.pageTextures.length === IP_V14_ATLAS_PAGES.length;
    } catch (error) {
      this.failed = true;
      console.warn('[BattlefieldSpriteDirector] atlas preload failed', error);
    }
    return this.loaded;
  }

  createSprite(key, definition) {
    const frame = getV14AtlasFrame(key);
    const base = frame ? this.pageTextures[frame.page] : null;
    if (!frame || !base) return null;
    const map = base.clone();
    const page = IP_V14_ATLAS_PAGES[frame.page];
    const columns = page.columns;
    const rows = page.rows;
    map.repeat.set(1 / columns, 1 / rows);
    map.offset.set(frame.column / columns, 1 - (frame.row + 1) / rows);
    map.needsUpdate = true;
    const material = new THREE.SpriteMaterial({
      map,
      transparent: true,
      depthWrite: false,
      alphaTest: .035,
      opacity: definition.pulse ? .92 : 1,
      toneMapped: !definition.pulse,
      blending: definition.pulse ? THREE.AdditiveBlending : THREE.NormalBlending
    });
    const sprite = new THREE.Sprite(material);
    const x = Math.cos(definition.angle) * definition.radius;
    const z = Math.sin(definition.angle) * definition.radius;
    sprite.position.set(x, definition.y, z);
    sprite.scale.setScalar(definition.scale);
    sprite.renderOrder = definition.pulse ? 6 : 2;
    sprite.userData.atlasKey = key;
    sprite.userData.baseScale = definition.scale;
    sprite.userData.phase = definition.angle * 2.7;
    sprite.userData.pulse = Boolean(definition.pulse);
    sprite.userData.disposeMap = true;
    return sprite;
  }

  populate(parent, { titleMode = false } = {}) {
    this.clear();
    if (!this.loaded || !parent) return 0;
    this.root = new THREE.Group();
    this.root.name = 'RuntimeAtlasBattlefieldPropsV14';
    const limit = this.lowPower ? 7 : titleMode ? DECOR_SET.length : 10;
    DECOR_SET.slice(0, limit).forEach((definition) => {
      const sprite = this.createSprite(definition.key, definition);
      if (!sprite) return;
      this.root.add(sprite);
      this.sprites.push(sprite);
    });
    parent.add(this.root);
    return this.sprites.length;
  }

  update(elapsed = 0) {
    for (const sprite of this.sprites) {
      if (!sprite.userData.pulse) continue;
      const wave = .92 + Math.sin(elapsed * 2.4 + sprite.userData.phase) * .08;
      sprite.scale.setScalar(sprite.userData.baseScale * wave);
      sprite.material.opacity = .78 + Math.sin(elapsed * 3.1 + sprite.userData.phase) * .16;
      sprite.material.rotation = Math.sin(elapsed * .45 + sprite.userData.phase) * .04;
    }
  }

  clear() {
    if (this.root?.parent) this.root.parent.remove(this.root);
    this.sprites.forEach((sprite) => {
      sprite.material?.map?.dispose?.();
      sprite.material?.dispose?.();
    });
    this.sprites.length = 0;
    this.root = null;
  }

  get diagnostics() {
    return Object.freeze({
      version: '14.0.0',
      loaded: this.loaded,
      failed: this.failed,
      atlasPages: this.pageTextures.length,
      activeSprites: this.sprites.length,
      lowPower: this.lowPower
    });
  }
}
