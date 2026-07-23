import * as THREE from 'three';
import { IP_V15_ATLAS_PAGES, getV15AtlasFrame } from '../ip-asset-library-v15.js';

export const BATTLEFIELD_SPRITE_DIRECTOR_VERSION = '17.0.0';

const DECOR_SET = Object.freeze([
  { key: 'env-blue-lantern', position: [-8.6, 1.8, 10.5], scale: 4.1 },
  { key: 'env-hanging-lantern', position: [8.8, 1.8, 10.2], scale: 4.1 },
  { key: 'env-mana-crystal', position: [-11.5, 1.75, -5.7], scale: 4.8 },
  { key: 'env-fire-brazier', position: [11.2, 1.55, -5.9], scale: 4.3 },
  { key: 'env-market-house', position: [-16.2, 2.7, 4.2], scale: 7.1 },
  { key: 'env-red-gate', position: [0, 3.05, -18.8], scale: 7.4 },
  { key: 'env-sacred-tree-green', position: [17.2, 2.8, 5.1], scale: 6.8 },
  { key: 'env-sacred-tree-autumn', position: [-16.8, 2.8, -9.8], scale: 6.5 },
  { key: 'prop-crystal-reactor', position: [8.7, 1.55, 14.7], scale: 4.4, pulse: true },
  { key: 'prop-field-cannon', position: [-1.6, 1.35, -13.7], scale: 4.2 },
  { key: 'vfx-spirit-flame', position: [-5.6, 1.25, -9.4], scale: 2.7, pulse: true, overlay: true },
  { key: 'vfx-ice-burst', position: [5.8, 1.1, -9.2], scale: 3, pulse: true, overlay: true },
  { key: 'vfx-heal-circle', position: [4.8, .42, 6.4], scale: 3.25, pulse: true, overlay: true },
  { key: 'vfx-fire-impact', position: [-4.9, .76, 6.1], scale: 3.05, pulse: true, overlay: true }
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

function versionedAssetUrl(path, version = '17.0.0') {
  const url = new URL(path, document.baseURI);
  url.searchParams.set('v', version);
  return url.href;
}

export default class BattlefieldSpriteDirectorV16 {
  constructor({ lowPower = false } = {}) {
    this.lowPower = Boolean(lowPower);
    this.resolution = this.lowPower || globalThis.devicePixelRatio <= 1.2 ? '1x' : '2x';
    this.pageTextures = [];
    this.root = null;
    this.sprites = [];
    this.loaded = false;
    this.failed = false;
    this.fallbackUsed = false;
    this.lastError = '';
  }

  async preload() {
    if (this.loaded || this.failed) return this.loaded;
    const preferred = this.resolution === '2x' ? 'webp2x' : 'webp1x';
    const fallback = this.resolution === '2x' ? 'png2x' : 'png1x';
    try {
      this.pageTextures = await Promise.all(IP_V15_ATLAS_PAGES.map(async (page) => {
        try {
          return await loadTexture(versionedAssetUrl(page[preferred]));
        } catch {
          this.fallbackUsed = true;
          return loadTexture(versionedAssetUrl(page[fallback]));
        }
      }));
      this.loaded = this.pageTextures.length === IP_V15_ATLAS_PAGES.length;
    } catch (error) {
      this.failed = true;
      this.lastError = String(error?.message || error || 'atlas preload failed');
      console.warn('[BattlefieldSpriteDirectorV16] atlas preload failed', error);
    }
    return this.loaded;
  }

  createSprite(key, definition = {}) {
    const frame = getV15AtlasFrame(key);
    const base = frame ? this.pageTextures[frame.page] : null;
    if (!frame || !base) return null;
    const map = base.clone();
    const page = IP_V15_ATLAS_PAGES[frame.page];
    map.repeat.set(1 / page.columns, 1 / page.rows);
    map.offset.set(frame.column / page.columns, 1 - (frame.row + 1) / page.rows);
    map.needsUpdate = true;
    const pulse = Boolean(definition.pulse);
    const additive = Boolean(definition.additive ?? pulse);
    const overlay = Boolean(definition.overlay);
    const material = new THREE.SpriteMaterial({
      map,
      transparent: true,
      depthWrite: false,
      depthTest: !overlay,
      alphaTest: .018,
      opacity: Number(definition.opacity ?? (pulse ? .94 : 1)),
      toneMapped: !additive,
      blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending
    });
    const sprite = new THREE.Sprite(material);
    const scale = Number(definition.scale || 2);
    if (Array.isArray(definition.position)) sprite.position.set(...definition.position);
    else {
      const radius = Number(definition.radius || 0);
      const angle = Number(definition.angle || 0);
      sprite.position.set(Math.cos(angle) * radius, Number(definition.y || 0), Math.sin(angle) * radius);
    }
    sprite.scale.setScalar(scale);
    sprite.renderOrder = overlay ? 9 : pulse ? 6 : 3;
    sprite.userData.atlasKey = key;
    sprite.userData.baseScale = scale;
    sprite.userData.phase = Number(definition.angle || sprite.position.x * .11 + sprite.position.z * .07);
    sprite.userData.pulse = pulse;
    sprite.userData.disposeMap = true;
    sprite.userData.runtimeArtV16 = true;
    return sprite;
  }

  populate(parent, { titleMode = false } = {}) {
    this.clear();
    if (!this.loaded || !parent) return 0;
    this.root = new THREE.Group();
    this.root.name = 'RuntimeAtlasBattlefieldPropsV16';
    const limit = this.lowPower ? 9 : titleMode ? DECOR_SET.length : 12;
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
      const wave = .94 + Math.sin(elapsed * 2.25 + sprite.userData.phase) * .06;
      sprite.scale.setScalar(sprite.userData.baseScale * wave);
      sprite.material.opacity = .8 + Math.sin(elapsed * 3 + sprite.userData.phase) * .14;
      sprite.material.rotation = Math.sin(elapsed * .4 + sprite.userData.phase) * .035;
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
      version: BATTLEFIELD_SPRITE_DIRECTOR_VERSION,
      loaded: this.loaded,
      failed: this.failed,
      fallbackUsed: this.fallbackUsed,
      lastError: this.lastError,
      atlasPages: this.pageTextures.length,
      resolution: this.resolution,
      activeSprites: this.sprites.length,
      lowPower: this.lowPower
    });
  }
}
