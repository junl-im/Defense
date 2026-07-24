import * as THREE from 'three';
import { DirectionalImpostorSelector } from '../engine/directional-impostor.js';
import { COMBAT_ART_TEXTURE_IDS, GUARDIAN_CITADEL_TEXTURE_ID, P0_DIRECTIONAL_ATLAS_IDS, P0_DIRECTIONAL_ATLAS_SPEC_V112 } from '../engine/asset-catalog.js';
import { COMBAT_ART_RUNTIME_POLICY_V113, canUseP0DirectionalAtlasV113 } from './combat-art-runtime-policy-v113.js';

const DIRECTIONS = P0_DIRECTIONAL_ATLAS_SPEC_V112.directions;
const STATES = P0_DIRECTIONAL_ATLAS_SPEC_V112.states;
const ATLAS_COLUMNS = P0_DIRECTIONAL_ATLAS_SPEC_V112.columns;
const ATLAS_ROWS = P0_DIRECTIONAL_ATLAS_SPEC_V112.rows;
export const COMBAT_VISUAL_HARDENING_V113_VERSION = '1.0.13';
const P0_ATLAS_IDS = Object.freeze([
  ...Object.values(P0_DIRECTIONAL_ATLAS_IDS.heroes),
  ...Object.values(P0_DIRECTIONAL_ATLAS_IDS.guardians),
  ...Object.values(P0_DIRECTIONAL_ATLAS_IDS.monsters),
  ...Object.values(P0_DIRECTIONAL_ATLAS_IDS.bosses)
]);
const STATUS_COLORS = Object.freeze({ shield: 0x63d8ff, break: 0xffc65b, stun: 0xffe67a, poison: 0x82ef72, burn: 0xff754d, frost: 0x84ddff, freeze: 0x84ddff, mark: 0x91f0b0, fracture: 0xe0b073, resonance: 0xd987ff, shock: 0xcaa6ff, curse: 0xd172ff });
const STATE_ROWS = Object.freeze(Object.fromEntries(STATES.map((state, index) => [state, index])));
const PRESERVE_NAME = /(aura|rankbead|shadow|telegraph|target|ring|marker|health|intent|phase|break|citadel)/i;
const LEGACY_RUNTIME_LAYER_NAME = /^(?:combatDirectionalVisual:|combatActionAuraV|worldHealthBarV|guardianCitadelV)/i;
const tempWorld = new THREE.Vector3();
const tempScale = new THREE.Vector3();
const tempParentQuaternion = new THREE.Quaternion();
const tempCameraQuaternion = new THREE.Quaternion();

const clamp01 = (value) => Math.max(0, Math.min(1, Number(value) || 0));
const finite = (value, fallback = 1) => Number.isFinite(value) ? value : fallback;
const normalizeState = (state = 'idle') => {
  if (state === 'run') return 'move';
  if (state === 'cast' || state === 'ultimate') return 'skill';
  if (state === 'hurt') return 'hit';
  return STATE_ROWS[state] === undefined ? 'idle' : state;
};

function addTreeToSet(object, set) {
  if (!object) return;
  object.traverse?.((child) => set.add(child));
}

function makeRadialTexture() {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const context = canvas.getContext('2d');
  const gradient = context.createRadialGradient(64, 64, 4, 64, 64, 62);
  gradient.addColorStop(0, 'rgba(255,255,255,.98)');
  gradient.addColorStop(.18, 'rgba(139,235,255,.76)');
  gradient.addColorStop(.52, 'rgba(76,126,255,.24)');
  gradient.addColorStop(1, 'rgba(0,0,0,0)');
  context.fillStyle = gradient;
  context.fillRect(0, 0, 128, 128);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.generateMipmaps = false;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

function makeBarSprite(color, renderOrder = 40) {
  const material = new THREE.SpriteMaterial({
    color,
    transparent: true,
    opacity: 1,
    depthTest: false,
    depthWrite: false,
    toneMapped: false,
    sizeAttenuation: true
  });
  const sprite = new THREE.Sprite(material);
  sprite.renderOrder = renderOrder;
  sprite.frustumCulled = false;
  return sprite;
}

function createHealthBar({ width = 1.55, height = .13, renderOrder = 40 } = {}) {
  const root = new THREE.Group();
  root.name = 'worldHealthBarV112';
  root.userData.worldHealthBarV112 = true;

  const shadow = makeBarSprite(0x03050b, renderOrder);
  shadow.scale.set(width + .18, height + .14, 1);
  shadow.position.set(0, -.035, 0);

  const back = makeBarSprite(0x351826, renderOrder + 1);
  back.scale.set(width, height, 1);
  back.position.z = .002;

  const fill = makeBarSprite(0x6ff58b, renderOrder + 2);
  fill.center.set(0, .5);
  fill.scale.set(width, height * .66, 1);
  fill.position.set(-width * .5, -.01, .004);

  const shieldFill = makeBarSprite(0x63d8ff, renderOrder + 3);
  shieldFill.center.set(0, .5);
  shieldFill.scale.set(.001, height * .34, 1);
  shieldFill.position.set(-width * .5, height * .29, .006);
  shieldFill.visible = false;

  const breakBack = makeBarSprite(0x241b17, renderOrder + 3);
  breakBack.scale.set(width, height * .15, 1);
  breakBack.position.set(0, -height * .61, .006);
  breakBack.visible = false;

  const breakFill = makeBarSprite(0xffc65b, renderOrder + 4);
  breakFill.center.set(0, .5);
  breakFill.scale.set(.001, height * .13, 1);
  breakFill.position.set(-width * .5, -height * .61, .008);
  breakFill.visible = false;

  const shine = makeBarSprite(0xffffff, renderOrder + 5);
  shine.center.set(0, .5);
  shine.scale.set(width, height * .14, 1);
  shine.position.set(-width * .5, height * .20, .010);
  shine.material.opacity = .34;

  const statusPips = Array.from({ length: 4 }, (_, index) => {
    const pip = makeBarSprite(0xffffff, renderOrder + 6 + index);
    pip.scale.set(height * .42, height * .42, 1);
    pip.position.set(width * .5 - height * (.24 + index * .50), height * .76, .012 + index * .001);
    pip.visible = false;
    return pip;
  });

  root.add(shadow, back, fill, shieldFill, breakBack, breakFill, shine, ...statusPips);
  root.userData.parts = { shadow, back, fill, shieldFill, breakBack, breakFill, shine, statusPips };
  root.userData.width = width;
  root.userData.height = height;
  return root;
}

export default class CombatVisualDirectorV112 {
  constructor({ assetPipeline, lowPower = false } = {}) {
    this.assetPipeline = assetPipeline;
    this.lowPower = lowPower;
    this.records = new Set();
    this.echoes = [];
    this.recordByGroup = new WeakMap();
    this.auraTexture = makeRadialTexture();
    this.attachments = 0;
    this.healthBars = 0;
    this.directionUpdates = 0;
    this.stateChanges = 0;
    this.citadelAttached = false;
    this.byCategory = { hero: 0, guardian: 0, monster: 0, boss: 0, core: 0 };
    this.legacyLayersRemoved = 0;
    this.coreMeshesHidden = 0;
    this.quarantinedPrototypeSelections = 0;
  }

  getTexture(assetId) {
    return this.assetPipeline?.get?.(assetId)?.texture || null;
  }


  disposeRuntimeLayer(root) {
    root?.traverse?.((object) => {
      const materials = object.material ? (Array.isArray(object.material) ? object.material : [object.material]) : [];
      for (const material of materials) {
        if (material?.userData?.disposeMap || object.userData?.disposeMap) material.map?.dispose?.();
        material?.dispose?.();
      }
    });
  }

  clearLegacyRuntimeLayers(group, { citadelOnly = false } = {}) {
    if (!group) return 0;
    const removals = [];
    group.traverse?.((object) => {
      if (object === group) return;
      const name = String(object.name || '');
      const isCitadel = /^guardianCitadelV/i.test(name) || object.userData?.guardianCitadelLayer;
      const isHealth = /^worldHealthBarV/i.test(name) || object.userData?.worldHealthBarV110 || object.userData?.worldHealthBarV112 || object.userData?.worldHealthBarV113;
      const isCombat = /^combatDirectionalVisual:/i.test(name) || /^combatActionAuraV/i.test(name) || object.userData?.combatVisualV110 || object.userData?.combatVisualV112 || object.userData?.combatVisualV113;
      if ((citadelOnly && (isCitadel || isHealth)) || (!citadelOnly && (LEGACY_RUNTIME_LAYER_NAME.test(name) || isCitadel || isHealth || isCombat))) removals.push(object);
    });
    const roots = removals.filter((object) => !removals.includes(object.parent));
    for (const object of roots) {
      object.parent?.remove(object);
      this.disposeRuntimeLayer(object);
    }
    this.legacyLayersRemoved += roots.length;
    return roots.length;
  }

  clearCombatAliases(group) {
    if (!group?.userData) return;
    for (const key of [
      'combatVisualSpriteV110', 'combatVisualRecordV110',
      'combatVisualSpriteV112', 'combatVisualRecordV112',
      'combatVisualSpriteV113', 'combatVisualRecordV113',
      'guardianCitadelV110', 'guardianCitadelV112', 'guardianCitadelV113'
    ]) delete group.userData[key];
  }

  hideLegacyCoreGeometry(core) {
    let hidden = 0;
    core?.traverse?.((object) => {
      if (object === core || !object.isMesh || object.userData?.combatVisualV113) return;
      if (object.userData.guardianCitadelPreviousVisibleV113 === undefined) object.userData.guardianCitadelPreviousVisibleV113 = object.visible;
      if (object.visible) hidden += 1;
      object.visible = false;
      object.userData.guardianCitadelHiddenV113 = true;
    });
    this.coreMeshesHidden += hidden;
    return hidden;
  }

  resolveCuratedAsset(fallbackAssetId, p0AssetId = '') {
    const p0Loaded = Boolean(p0AssetId && this.getTexture(p0AssetId));
    const p0Allowed = p0Loaded && canUseP0DirectionalAtlasV113({ productionArtApproved: false });
    if (p0Loaded && !p0Allowed) this.quarantinedPrototypeSelections += 1;
    return { assetId: fallbackAssetId, authoredAtlas: false, p0Loaded, p0Allowed };
  }

  hidePrototypeVisuals(group) {
    const preserved = new Set();
    const data = group?.userData || {};
    [data.aura, data.eliteAura, data.phaseAura, data.shield, data.targetRing].forEach((object) => addTreeToSet(object, preserved));
    [data.parts?.rankBeads, data.parts?.halo].forEach((object) => addTreeToSet(object, preserved));

    group?.traverse?.((object) => {
      if (!object.isMesh || object.userData?.combatVisualV112 || object.userData?.combatVisualV113) return;
      if (preserved.has(object) || PRESERVE_NAME.test(object.name || '')) return;
      object.userData.combatVisualPreviousVisibleV112 = object.visible;
      object.visible = false;
      object.userData.combatVisualHiddenV112 = true;
    });
  }

  createAtlasSprite(texture, { category, assetId, scale, y, opacity = 1, authoredAtlas = false } = {}) {
    const map = texture.clone();
    map.wrapS = THREE.ClampToEdgeWrapping;
    map.wrapT = THREE.ClampToEdgeWrapping;
    map.repeat.set(authoredAtlas ? 1 / ATLAS_COLUMNS : 1, authoredAtlas ? 1 / ATLAS_ROWS : 1);
    map.offset.set(0, authoredAtlas ? (ATLAS_ROWS - 1) / ATLAS_ROWS : 0);
    map.generateMipmaps = !authoredAtlas;
    map.minFilter = authoredAtlas ? THREE.LinearFilter : THREE.LinearMipmapLinearFilter;
    map.magFilter = THREE.LinearFilter;
    map.needsUpdate = true;

    const material = new THREE.SpriteMaterial({
      map,
      color: 0xffffff,
      transparent: true,
      opacity,
      alphaTest: .025,
      depthTest: true,
      depthWrite: false,
      toneMapped: false,
      sizeAttenuation: true
    });
    material.userData.disposeMap = true;
    const sprite = new THREE.Sprite(material);
    sprite.name = `combatDirectionalVisual:${category}:${assetId}`;
    sprite.center.set(.5, .055);
    sprite.position.set(0, y, 0);
    sprite.scale.set(scale, scale, 1);
    sprite.renderOrder = category === 'boss' ? 12 : category === 'hero' ? 10 : 8;
    sprite.frustumCulled = true;
    sprite.userData.combatVisualV112 = true;
    sprite.userData.combatVisualV113 = true;
    sprite.userData.assetSourceId = assetId;
    sprite.userData.authoredDirectionalAtlasV112 = authoredAtlas;
    sprite.userData.disposeMap = true;
    return sprite;
  }

  createActionAura(scale, category) {
    if (!this.auraTexture) return null;
    const material = new THREE.SpriteMaterial({
      map: this.auraTexture,
      color: category === 'monster' || category === 'boss' ? 0xff6f8d : 0x79eaff,
      transparent: true,
      opacity: 0,
      depthTest: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      toneMapped: false
    });
    const sprite = new THREE.Sprite(material);
    sprite.name = 'combatActionAuraV112';
    sprite.scale.set(scale * 1.36, scale * 1.36, 1);
    sprite.position.set(0, scale * .42, -.02);
    sprite.renderOrder = category === 'boss' ? 11 : 7;
    sprite.visible = false;
    sprite.userData.combatVisualV112 = true;
    sprite.userData.combatVisualV113 = true;
    return sprite;
  }

  attach(group, assetId, {
    category = 'guardian',
    scale = 2.1,
    y = .1,
    healthY = 2.45,
    healthWidth = 1.5,
    showHealth = true,
    getHp = () => 1,
    getMaxHp = () => 1,
    getShield = null,
    getMaxShield = null,
    getBreak = null,
    getStatuses = null,
    authoredAtlas = false
  } = {}) {
    if (!group) return false;
    const existing = this.recordByGroup.get(group);
    if (existing) {
      existing.getHp = getHp || existing.getHp;
      existing.getMaxHp = getMaxHp || existing.getMaxHp;
      existing.healthY = healthY || existing.healthY;
      if (typeof getShield === 'function') existing.getShield = getShield;
      if (typeof getMaxShield === 'function') existing.getMaxShield = getMaxShield;
      if (typeof getBreak === 'function') existing.getBreak = getBreak;
      if (typeof getStatuses === 'function') existing.getStatuses = getStatuses;
      return true;
    }
    this.clearLegacyRuntimeLayers(group);
    this.clearCombatAliases(group);
    const texture = this.getTexture(assetId);
    if (!texture) return false;

    this.hidePrototypeVisuals(group);
    const sprite = this.createAtlasSprite(texture, { category, assetId, scale, y, authoredAtlas });
    const aura = this.createActionAura(scale, category);
    if (aura) group.add(aura);
    group.add(sprite);

    const healthBar = showHealth ? createHealthBar({
      width: healthWidth,
      height: category === 'boss' || category === 'core' ? .17 : .125,
      renderOrder: category === 'core' ? 52 : category === 'boss' ? 48 : 42
    }) : null;
    if (healthBar) {
      healthBar.position.set(0, healthY, 0);
      group.add(healthBar);
      this.healthBars += 1;
    }

    const record = {
      group,
      category,
      assetId,
      sprite,
      aura,
      healthBar,
      healthY,
      getHp,
      getMaxHp,
      getShield: getShield || (() => finite(group.userData?.worldShield, 0)),
      getMaxShield: getMaxShield || (() => finite(group.userData?.worldShieldMax, 0)),
      getBreak: getBreak || (() => finite(group.userData?.worldBreakRatio, 0)),
      getStatuses: getStatuses || (() => group.userData?.worldStatuses || []),
      authoredAtlas,
      animation: null,
      selector: new DirectionalImpostorSelector({ directions: DIRECTIONS, hysteresis: .055 }),
      state: 'idle',
      frame: -1,
      baseScale: scale,
      baseY: y,
      phase: Math.random() * Math.PI * 2,
      disposed: false
    };
    this.records.add(record);
    this.recordByGroup.set(group, record);
    group.userData.combatVisualSpriteV112 = sprite;
    group.userData.combatVisualRecordV112 = record;
    group.userData.combatVisualSpriteV113 = sprite;
    group.userData.combatVisualRecordV113 = record;
    // Compatibility aliases for systems that still read the v110 field names.
    group.userData.combatVisualSpriteV110 = sprite;
    group.userData.combatVisualRecordV110 = record;
    group.userData.combatVisualMode = authoredAtlas ? 'authored-directional-atlas-v112' : 'directional-art-fallback-v112';
    this.attachments += 1;
    this.byCategory[category] = (this.byCategory[category] || 0) + 1;
    return true;
  }

  attachHero(group, classId = 'warrior', options = {}) {
    const fallbackAssetId = COMBAT_ART_TEXTURE_IDS.heroes[classId] || COMBAT_ART_TEXTURE_IDS.heroes.warrior;
    const p0AssetId = classId === 'warrior' ? P0_DIRECTIONAL_ATLAS_IDS.heroes.warrior : '';
    const { assetId, authoredAtlas } = this.resolveCuratedAsset(fallbackAssetId, p0AssetId);
    const rootScale = Math.max(.05, finite(group?.scale?.x, 1));
    return this.attach(group, assetId, {
      category: 'hero',
      scale: 2.72 / rootScale,
      y: .08 / rootScale,
      healthY: 2.92 / rootScale,
      healthWidth: 1.45,
      authoredAtlas,
      ...options
    });
  }

  attachGuardian(group, type = 'ember', rank = 1, options = {}) {
    const fallbackAssetId = COMBAT_ART_TEXTURE_IDS.guardians[type] || COMBAT_ART_TEXTURE_IDS.guardians.ember;
    const p0AssetId = type === 'ember' ? P0_DIRECTIONAL_ATLAS_IDS.guardians.ember : '';
    const { assetId, authoredAtlas } = this.resolveCuratedAsset(fallbackAssetId, p0AssetId);
    const rankBoost = 1 + Math.max(0, rank - 1) * .035;
    return this.attach(group, assetId, {
      category: 'guardian',
      scale: 2.12 * rankBoost,
      y: .07,
      healthY: 2.40 * rankBoost,
      healthWidth: 1.28 * rankBoost,
      authoredAtlas,
      ...options
    });
  }

  attachEnemy(group, type = 'imp', config = {}, options = {}) {
    const boss = Boolean(config.boss);
    const table = boss ? COMBAT_ART_TEXTURE_IDS.bosses : COMBAT_ART_TEXTURE_IDS.monsters;
    const fallbackAssetId = table[type] || (boss ? COMBAT_ART_TEXTURE_IDS.bosses.tiger : COMBAT_ART_TEXTURE_IDS.monsters.imp);
    const p0AssetId = boss && type === 'tiger'
      ? P0_DIRECTIONAL_ATLAS_IDS.bosses.tiger
      : (!boss && type === 'imp' ? P0_DIRECTIONAL_ATLAS_IDS.monsters.imp : '');
    const { assetId, authoredAtlas } = this.resolveCuratedAsset(fallbackAssetId, p0AssetId);
    const authoredScale = Math.max(.5, finite(config.scale, 1));
    const scale = boss ? 3.72 + Math.max(0, authoredScale - 2) * .78 : Math.max(1.68, authoredScale * 1.64);
    return this.attach(group, assetId, {
      category: boss ? 'boss' : 'monster',
      scale,
      y: boss ? .12 : .055,
      healthY: boss ? scale * 1.02 : scale * .96,
      healthWidth: boss ? 2.18 : 1.14,
      authoredAtlas,
      ...options
    });
  }

  attachCitadel(core, options = {}) {
    if (!core) return false;
    const current = this.recordByGroup.get(core);
    if (current?.citadel && current.sprite?.parent === core) return true;

    this.clearLegacyRuntimeLayers(core, { citadelOnly: true });
    this.clearCombatAliases(core);
    this.hideLegacyCoreGeometry(core);

    const texture = this.getTexture(GUARDIAN_CITADEL_TEXTURE_ID);
    if (!texture) return false;
    const rootScale = Math.max(.05, finite(core.scale?.x, 1));
    const material = new THREE.SpriteMaterial({
      map: texture,
      color: 0xffffff,
      transparent: true,
      opacity: 1,
      alphaTest: .04,
      depthTest: true,
      depthWrite: false,
      toneMapped: false
    });
    material.userData.disposeMap = false;
    const sprite = new THREE.Sprite(material);
    sprite.name = 'guardianCitadelV113';
    sprite.center.set(.5, .045);
    sprite.scale.set(5.18 / rootScale, 5.18 / rootScale, 1);
    sprite.position.set(0, .025 / rootScale, .12 / rootScale);
    sprite.renderOrder = 5;
    sprite.frustumCulled = true;
    sprite.userData.combatVisualV112 = true;
    sprite.userData.combatVisualV113 = true;
    sprite.userData.guardianCitadelLayer = true;
    sprite.userData.disposeMap = false;
    core.add(sprite);

    const bar = createHealthBar({ width: 2.35, height: .18, renderOrder: 54 });
    bar.name = 'worldHealthBarV113';
    bar.userData.worldHealthBarV113 = true;
    bar.position.set(0, 5.28 / rootScale, 0);
    core.add(bar);
    const record = {
      group: core,
      category: 'core',
      assetId: GUARDIAN_CITADEL_TEXTURE_ID,
      sprite,
      aura: null,
      healthBar: bar,
      healthY: 5.28 / rootScale,
      getHp: options.getHp || (() => 1),
      getMaxHp: options.getMaxHp || (() => 1),
      getShield: options.getShield || (() => 0),
      getMaxShield: options.getMaxShield || (() => 0),
      getBreak: options.getBreak || (() => 0),
      getStatuses: options.getStatuses || (() => []),
      authoredAtlas: false,
      animation: null,
      selector: null,
      state: 'idle',
      frame: 0,
      baseScale: 5.18 / rootScale,
      baseY: .025 / rootScale,
      phase: Math.random() * Math.PI * 2,
      disposed: false,
      citadel: true
    };
    this.records.add(record);
    this.recordByGroup.set(core, record);
    core.userData.guardianCitadelV110 = sprite;
    core.userData.guardianCitadelV112 = sprite;
    core.userData.guardianCitadelV113 = sprite;
    core.userData.combatVisualSpriteV110 = sprite;
    core.userData.combatVisualSpriteV112 = sprite;
    core.userData.combatVisualSpriteV113 = sprite;
    core.userData.combatVisualRecordV110 = record;
    core.userData.combatVisualRecordV112 = record;
    core.userData.combatVisualRecordV113 = record;
    core.userData.combatVisualMode = 'single-guardian-citadel-v113';
    this.citadelAttached = true;
    this.attachments += 1;
    this.healthBars += 1;
    this.byCategory.core += 1;
    return true;
  }

  bindActor(group, { animation = null, getHp, getMaxHp, getShield, getMaxShield, getBreak, getStatuses, healthY } = {}) {
    const record = this.recordByGroup.get(group);
    if (!record) return false;
    if (animation) record.animation = animation;
    if (typeof getHp === 'function') record.getHp = getHp;
    if (typeof getMaxHp === 'function') record.getMaxHp = getMaxHp;
    if (typeof getShield === 'function') record.getShield = getShield;
    if (typeof getMaxShield === 'function') record.getMaxShield = getMaxShield;
    if (typeof getBreak === 'function') record.getBreak = getBreak;
    if (typeof getStatuses === 'function') record.getStatuses = getStatuses;
    if (Number.isFinite(healthY)) {
      record.healthY = healthY;
      if (record.healthBar) record.healthBar.position.y = healthY;
    }
    return true;
  }

  restoreVisibility(group) {
    const record = this.recordByGroup.get(group);
    if (!record) return false;
    group.traverse?.((object) => {
      if (object.userData?.combatVisualHiddenV112 || object.userData?.combatVisualHiddenV113) object.visible = false;
    });
    record.sprite.visible = true;
    if (record.healthBar) record.healthBar.visible = true;
    return true;
  }

  setDirectionalState(record, frame, state) {
    if (record.frame === frame && record.state === state) return;
    if (record.state !== state) this.stateChanges += 1;
    if (record.frame !== frame) this.directionUpdates += 1;
    record.frame = frame;
    record.state = state;
    const signed = frame <= 5 ? frame : frame - DIRECTIONS;
    const side = signed === 0 ? 0 : Math.sign(signed);
    const turn = Math.min(1, Math.abs(signed) / 5);
    const map = record.sprite.material.map;
    if (map) {
      if (record.authoredAtlas) {
        const row = STATE_ROWS[state] ?? 0;
        map.repeat.set(1 / ATLAS_COLUMNS, 1 / ATLAS_ROWS);
        map.offset.set(frame / ATLAS_COLUMNS, (ATLAS_ROWS - 1 - row) / ATLAS_ROWS);
      } else {
        map.repeat.set(side < 0 ? -1 : 1, 1);
        map.offset.set(side < 0 ? 1 : 0, 0);
      }
      map.needsUpdate = true;
    }
    record.directionSide = side;
    record.directionTurn = turn;
  }

  updateHealth(record, camera, showHealth = true) {
    const bar = record.healthBar;
    if (!bar) return;
    const maxHp = Math.max(.0001, finite(record.getMaxHp?.(), 1));
    const hp = Math.max(0, finite(record.getHp?.(), maxHp));
    const ratio = clamp01(hp / maxHp);
    const { fill, shieldFill, breakBack, breakFill, shine, statusPips } = bar.userData.parts;
    const width = bar.userData.width;
    fill.scale.x = Math.max(.001, width * ratio);
    shine.scale.x = Math.max(.001, width * ratio);
    if (ratio > .58) fill.material.color.setHex(0x6ff58b);
    else if (ratio > .28) fill.material.color.setHex(0xffd45f);
    else fill.material.color.setHex(0xff6178);
    fill.material.opacity = hp > 0 ? 1 : 0;
    shine.material.opacity = hp > 0 ? .34 : 0;

    const maxShield = Math.max(0, finite(record.getMaxShield?.(), 0));
    const shield = Math.max(0, finite(record.getShield?.(), 0));
    const shieldRatio = maxShield > 0 ? clamp01(shield / maxShield) : 0;
    shieldFill.scale.x = Math.max(.001, width * shieldRatio);
    shieldFill.visible = shieldRatio > .005 && hp > 0;

    const breakRatio = clamp01(record.getBreak?.());
    breakBack.visible = breakRatio > .005 && hp > 0;
    breakFill.visible = breakBack.visible;
    breakFill.scale.x = Math.max(.001, width * breakRatio);

    const statuses = [...new Set((record.getStatuses?.() || []).map((entry) => typeof entry === 'string' ? entry : entry?.id).filter(Boolean))].slice(0, statusPips.length);
    statusPips.forEach((pip, index) => {
      const status = statuses[index];
      pip.visible = Boolean(status) && hp > 0;
      if (status) pip.material.color.setHex(STATUS_COLORS[status] || 0xffffff);
    });

    record.group.getWorldPosition(tempWorld);
    record.group.getWorldScale(tempScale);
    const distance = camera ? tempWorld.distanceTo(camera.position) : 16;
    const screenCompensation = THREE.MathUtils.clamp(distance / 18, .82, record.category === 'core' ? 1.26 : 1.42);
    const inheritedScale = Math.max(.05, Math.abs(tempScale.x));
    if (camera) {
      record.group.getWorldQuaternion(tempParentQuaternion);
      camera.getWorldQuaternion(tempCameraQuaternion);
      bar.quaternion.copy(tempParentQuaternion).invert().multiply(tempCameraQuaternion);
    }
    bar.scale.setScalar(screenCompensation / inheritedScale);
    bar.visible = Boolean(showHealth) && record.group.visible && hp > 0 && record.state !== 'death';
  }

  updateRecord(record, dt, camera, elapsed, showHealth = true) {
    if (record.disposed || !record.group?.parent) return;
    if (record.citadel) {
      record.sprite.position.y = record.baseY + Math.sin(elapsed * 1.6 + record.phase) * .025;
      this.updateHealth(record, camera, showHealth);
      return;
    }

    const controller = record.animation;
    const state = normalizeState(controller?.state || 'idle');
    record.group.getWorldPosition(tempWorld);
    const cameraYaw = camera ? Math.atan2(camera.position.x - tempWorld.x, camera.position.z - tempWorld.z) : 0;
    const frame = record.selector.update(record.group.rotation.y, cameraYaw);
    this.setDirectionalState(record, frame, state);

    const t = finite(controller?.stateTime, elapsed + record.phase);
    let scaleX = 1;
    let scaleY = 1;
    let y = record.baseY;
    let rotation = 0;
    let opacity = 1;
    let color = 0xffffff;
    let auraOpacity = 0;
    let auraScale = 1;

    if (state === 'idle') {
      y += Math.sin(t * 2.4 + record.phase) * .028;
      rotation = Math.sin(t * 1.55 + record.phase) * .012;
    } else if (state === 'move') {
      const step = Math.sin(t * 11.5 + record.phase);
      y += Math.abs(step) * .065;
      rotation = step * .035;
      scaleX = 1 + Math.abs(step) * .025;
      scaleY = 1 - Math.abs(step) * .025;
    } else if (state === 'attack') {
      const strike = Math.sin(Math.min(1, t / .28) * Math.PI);
      y += strike * .055;
      scaleX = 1 + strike * .12;
      scaleY = 1 - strike * .065;
      rotation = -strike * .075;
      auraOpacity = strike * .38;
      auraScale = .72 + strike * .55;
    } else if (state === 'skill') {
      const charge = Math.sin(Math.min(1, t / .54) * Math.PI);
      y += charge * .18;
      scaleX = scaleY = 1 + charge * .12;
      rotation = Math.sin(t * 18) * .025 * charge;
      auraOpacity = .28 + charge * .72;
      auraScale = .7 + charge * .82;
    } else if (state === 'hit') {
      const recoil = Math.sin(Math.min(1, t / .18) * Math.PI);
      scaleX = 1 - recoil * .07;
      scaleY = 1 + recoil * .07;
      rotation = recoil * .11;
      color = 0xff9aa9;
      auraOpacity = recoil * .34;
      auraScale = 1 + recoil * .22;
    } else if (state === 'death') {
      const fall = Math.min(1, t / .32);
      y -= fall * .32;
      rotation = fall * 1.12;
      scaleY = 1 - fall * .25;
      opacity = 1 - fall * .88;
    }

    const directionTurn = finite(record.directionTurn, 0);
    const directionSide = finite(record.directionSide, 0);
    const perspectiveX = record.authoredAtlas ? 1 : 1 - directionTurn * .08;
    const rearShade = record.authoredAtlas ? 1 : 1 - directionTurn * .06;
    record.sprite.position.x = record.authoredAtlas ? 0 : directionSide * directionTurn * record.baseScale * .045;
    record.sprite.position.y = y;
    record.sprite.scale.set(record.baseScale * scaleX * perspectiveX, record.baseScale * scaleY, 1);
    record.sprite.material.opacity = opacity;
    if (color === 0xffffff) record.sprite.material.color.setRGB(rearShade, rearShade, Math.min(1, rearShade + directionTurn * .035));
    else record.sprite.material.color.setHex(color).multiplyScalar(rearShade);
    record.sprite.material.rotation = rotation;
    record.sprite.visible = record.group.visible && opacity > .03;

    if (record.aura) {
      record.aura.visible = auraOpacity > .02 && record.group.visible;
      record.aura.material.opacity = auraOpacity;
      record.aura.scale.set(record.baseScale * 1.36 * auraScale, record.baseScale * 1.36 * auraScale, 1);
      record.aura.material.rotation = -elapsed * (state === 'skill' ? 2.8 : 1.4);
    }
    this.updateHealth(record, camera, showHealth);
  }

  playDeathEcho(group, parent, { duration = .38, state = 'death' } = {}) {
    const record = this.recordByGroup.get(group);
    if (!record?.sprite || !parent) return false;
    group.updateWorldMatrix?.(true, false);
    group.getWorldPosition(tempWorld);
    group.getWorldScale(tempScale);
    const material = record.sprite.material.clone();
    material.map = record.sprite.material.map?.clone?.() || record.sprite.material.map;
    if (material.map) material.map.needsUpdate = true;
    material.depthTest = true;
    material.depthWrite = false;
    const sprite = new THREE.Sprite(material);
    sprite.center.copy(record.sprite.center);
    sprite.position.copy(tempWorld);
    sprite.scale.set(record.sprite.scale.x * Math.abs(tempScale.x), record.sprite.scale.y * Math.abs(tempScale.y), 1);
    sprite.renderOrder = record.sprite.renderOrder + 1;
    sprite.frustumCulled = false;
    parent.add(sprite);
    this.echoes.push({ sprite, age: 0, duration: Math.max(.18, duration), phase: Math.random() * Math.PI * 2 });
    return true;
  }

  clearTransient() {
    for (const echo of this.echoes.splice(0)) {
      echo.sprite.parent?.remove(echo.sprite);
      echo.sprite.material.map?.dispose?.();
      echo.sprite.material.dispose?.();
    }
  }

  updateEchoes(dt) {
    for (let index = this.echoes.length - 1; index >= 0; index -= 1) {
      const echo = this.echoes[index];
      echo.age += dt;
      const t = Math.min(1, echo.age / echo.duration);
      echo.sprite.position.y -= dt * (.35 + t * .8);
      echo.sprite.material.rotation = t * 1.22;
      echo.sprite.material.opacity = Math.max(0, 1 - t);
      echo.sprite.scale.multiplyScalar(1 - dt * .42);
      if (t >= 1) {
        echo.sprite.parent?.remove(echo.sprite);
        echo.sprite.material.map?.dispose?.();
        echo.sprite.material.dispose?.();
        this.echoes.splice(index, 1);
      }
    }
  }

  update(dt, camera, elapsed = 0, { showHealth = true } = {}) {
    for (const record of [...this.records]) {
      if (record.disposed || !record.group) {
        this.records.delete(record);
        continue;
      }
      this.updateRecord(record, dt, camera, elapsed, showHealth);
    }
    this.updateEchoes(dt);
  }

  detach(group, { dispose = true } = {}) {
    const record = this.recordByGroup.get(group);
    if (!record) return false;
    record.disposed = true;
    this.records.delete(record);
    this.recordByGroup.delete(group);
    group.remove(record.sprite);
    if (record.aura) group.remove(record.aura);
    if (record.healthBar) group.remove(record.healthBar);
    if (dispose) {
      record.sprite.material.map?.dispose?.();
      record.sprite.material.dispose?.();
      record.aura?.material?.dispose?.();
      for (const object of record.healthBar?.children || []) object.material?.dispose?.();
    }
    delete group.userData.combatVisualSpriteV112;
    delete group.userData.combatVisualRecordV112;
    delete group.userData.combatVisualSpriteV110;
    delete group.userData.combatVisualRecordV110;
    delete group.userData.combatVisualSpriteV113;
    delete group.userData.combatVisualRecordV113;
    delete group.userData.guardianCitadelV110;
    delete group.userData.guardianCitadelV112;
    delete group.userData.guardianCitadelV113;
    return true;
  }

  dispose() {
    for (const record of [...this.records]) this.detach(record.group, { dispose: true });
    this.clearTransient();
    this.auraTexture?.dispose?.();
    this.auraTexture = null;
  }

  get diagnostics() {
    const fallbackIds = [
      ...Object.values(COMBAT_ART_TEXTURE_IDS.heroes),
      ...Object.values(COMBAT_ART_TEXTURE_IDS.guardians),
      ...Object.values(COMBAT_ART_TEXTURE_IDS.monsters),
      ...Object.values(COMBAT_ART_TEXTURE_IDS.bosses)
    ];
    const ids = [...P0_ATLAS_IDS, ...fallbackIds];
    const loaded = ids.filter((id) => Boolean(this.getTexture(id))).length;
    const authoredLoaded = P0_ATLAS_IDS.filter((id) => Boolean(this.getTexture(id))).length;
    const authoredActive = [...this.records].filter((record) => record.authoredAtlas).length;
    return Object.freeze({
      mode: 'curated-combat-art-v113',
      hardeningVersion: COMBAT_VISUAL_HARDENING_V113_VERSION,
      runtimePolicyId: COMBAT_ART_RUNTIME_POLICY_V113.id,
      directions: DIRECTIONS,
      states: STATES.length,
      loaded,
      expected: ids.length,
      authoredAtlasesLoaded: authoredLoaded,
      authoredAtlasesExpected: P0_ATLAS_IDS.length,
      authoredFrames: authoredLoaded * DIRECTIONS * STATES.length,
      authoredActive,
      mirroringAllowed: false,
      productionArtApproved: false,
      p0PrototypeRuntimeEnabled: COMBAT_ART_RUNTIME_POLICY_V113.p0PrototypeRuntimeEnabled,
      quarantinedPrototypeSelections: this.quarantinedPrototypeSelections,
      legacyLayersRemoved: this.legacyLayersRemoved,
      coreMeshesHidden: this.coreMeshesHidden,
      attachments: this.attachments,
      activeRecords: this.records.size,
      healthBars: this.healthBars,
      directionUpdates: this.directionUpdates,
      stateChanges: this.stateChanges,
      citadelAttached: this.citadelAttached,
      byCategory: { ...this.byCategory }
    });
  }
}

export { DIRECTIONS as COMBAT_DIRECTIONS_V112, STATES as COMBAT_ACTION_STATES_V112 };
