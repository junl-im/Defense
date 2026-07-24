import * as THREE from 'three';
import { COMBAT_ART_TEXTURE_IDS } from '../engine/asset-catalog.js';

const ALL_TEXTURE_IDS = Object.freeze([
  ...Object.values(COMBAT_ART_TEXTURE_IDS.heroes),
  ...Object.values(COMBAT_ART_TEXTURE_IDS.guardians),
  ...Object.values(COMBAT_ART_TEXTURE_IDS.monsters),
  ...Object.values(COMBAT_ART_TEXTURE_IDS.bosses)
]);

const PRESERVE_NAME = /(aura|rankbead|shadow|telegraph|target|ring|marker|health|intent|phase|break)/i;

const addTreeToSet = (object, set) => {
  if (!object) return;
  object.traverse?.((child) => set.add(child));
};

const finiteScale = (value, fallback = 1) => Number.isFinite(value) && value > 0 ? value : fallback;

export default class CombatArtSkinV109 {
  constructor({ assetPipeline, lowPower = false } = {}) {
    this.assetPipeline = assetPipeline;
    this.lowPower = lowPower;
    this.attachments = 0;
    this.byCategory = { hero: 0, guardian: 0, monster: 0, boss: 0 };
  }

  getTexture(assetId) {
    return this.assetPipeline?.get?.(assetId)?.texture || null;
  }

  hidePrototypeVisuals(group) {
    const preserved = new Set();
    const data = group?.userData || {};
    [data.aura, data.eliteAura, data.phaseAura, data.shield, data.targetRing].forEach((object) => addTreeToSet(object, preserved));
    [data.parts?.rankBeads, data.parts?.halo].forEach((object) => addTreeToSet(object, preserved));

    group?.traverse?.((object) => {
      if (!object.isMesh || object.userData?.combatArtV109) return;
      if (preserved.has(object) || PRESERVE_NAME.test(object.name || '')) return;
      object.userData.combatArtPreviousVisibleV109 = object.visible;
      object.visible = false;
      object.userData.combatArtHiddenV109 = true;
    });
  }

  attach(group, assetId, {
    category = 'guardian',
    scale = 2.1,
    y = .12,
    opacity = 1
  } = {}) {
    if (!group || group.userData?.combatArtSpriteV109) return Boolean(group?.userData?.combatArtSpriteV109);
    const texture = this.getTexture(assetId);
    if (!texture) return false;

    this.hidePrototypeVisuals(group);
    const material = new THREE.SpriteMaterial({
      map: texture,
      color: 0xffffff,
      transparent: true,
      opacity,
      alphaTest: .035,
      depthTest: true,
      depthWrite: false,
      toneMapped: false,
      sizeAttenuation: true
    });
    material.userData.disposeMap = false;
    const sprite = new THREE.Sprite(material);
    sprite.name = `combatArt:${category}:${assetId}`;
    sprite.center.set(.5, .055);
    sprite.position.set(0, y, 0);
    sprite.scale.set(scale, scale, 1);
    sprite.renderOrder = category === 'boss' ? 8 : 6;
    sprite.frustumCulled = true;
    sprite.userData.combatArtV109 = true;
    sprite.userData.assetSourceId = assetId;
    sprite.userData.disposeMap = false;

    group.add(sprite);
    group.userData.combatArtSpriteV109 = sprite;
    group.userData.combatArtAssetIdV109 = assetId;
    group.userData.combatArtMode = 'art-bible-billboard-v109';
    this.attachments += 1;
    this.byCategory[category] = (this.byCategory[category] || 0) + 1;
    return true;
  }

  restoreVisibility(group) {
    if (!group?.userData?.combatArtSpriteV109) return false;
    group.traverse?.((object) => {
      if (object.userData?.combatArtHiddenV109) object.visible = false;
    });
    group.userData.combatArtSpriteV109.visible = true;
    return true;
  }

  attachHero(group, classId = 'warrior') {
    const assetId = COMBAT_ART_TEXTURE_IDS.heroes[classId] || COMBAT_ART_TEXTURE_IDS.heroes.warrior;
    const rootScale = finiteScale(group?.scale?.x);
    return this.attach(group, assetId, {
      category: 'hero',
      scale: 2.78 / rootScale,
      y: .13 / rootScale
    });
  }

  attachGuardian(group, type = 'ember', rank = 1) {
    const assetId = COMBAT_ART_TEXTURE_IDS.guardians[type] || COMBAT_ART_TEXTURE_IDS.guardians.ember;
    const rankBoost = 1 + Math.max(0, rank - 1) * .035;
    return this.attach(group, assetId, {
      category: 'guardian',
      scale: 2.18 * rankBoost,
      y: .11
    });
  }

  attachEnemy(group, type = 'imp', config = {}) {
    const boss = Boolean(config.boss);
    const table = boss ? COMBAT_ART_TEXTURE_IDS.bosses : COMBAT_ART_TEXTURE_IDS.monsters;
    const fallbackId = boss ? COMBAT_ART_TEXTURE_IDS.bosses.tiger : COMBAT_ART_TEXTURE_IDS.monsters.imp;
    const assetId = table[type] || fallbackId;
    const authoredScale = finiteScale(config.scale);
    const scale = boss ? 3.8 + Math.max(0, authoredScale - 2) * .8 : Math.max(1.72, authoredScale * 1.68);
    return this.attach(group, assetId, {
      category: boss ? 'boss' : 'monster',
      scale,
      y: boss ? .18 : .09
    });
  }

  get diagnostics() {
    const loaded = ALL_TEXTURE_IDS.filter((id) => Boolean(this.getTexture(id))).length;
    return Object.freeze({
      mode: 'art-bible-billboard-v109',
      loaded,
      expected: ALL_TEXTURE_IDS.length,
      attachments: this.attachments,
      byCategory: { ...this.byCategory }
    });
  }
}

export { ALL_TEXTURE_IDS as COMBAT_ART_TEXTURE_ID_LIST_V109 };
