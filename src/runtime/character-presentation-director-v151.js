import * as THREE from 'three';
import CombatArtPolishDirectorV114 from './combat-art-polish-director-v114.js';
import {
  CHARACTER_CATEGORY_RENDER_V151,
  CHARACTER_PRESENTATION_POLICY_V151,
  resolveCharacterPresentationQualityV151
} from './character-presentation-policy-v151.js';

const finite = (value, fallback = 0) => Number.isFinite(value) ? value : fallback;
const clamp01 = (value) => Math.max(0, Math.min(1, Number(value) || 0));
const tempWorldV151 = new THREE.Vector3();

function createContactShadowTextureV151() {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = 96;
  canvas.height = 96;
  const context = canvas.getContext('2d');
  const gradient = context.createRadialGradient(48, 48, 3, 48, 48, 45);
  gradient.addColorStop(0, 'rgba(0,0,0,.72)');
  gradient.addColorStop(.46, 'rgba(0,0,0,.34)');
  gradient.addColorStop(1, 'rgba(0,0,0,0)');
  context.fillStyle = gradient;
  context.fillRect(0, 0, 96, 96);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.NoColorSpace;
  texture.generateMipmaps = false;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

function createLayerSpriteV151(record, { name, color, opacity = 0, blending = THREE.NormalBlending, renderOffset = 0 } = {}) {
  const material = new THREE.SpriteMaterial({
    map: record.sprite.material.map,
    color,
    transparent: true,
    opacity,
    alphaTest: .035,
    depthTest: true,
    depthWrite: false,
    blending,
    toneMapped: false,
    sizeAttenuation: true,
    premultipliedAlpha: true
  });
  material.dithering = true;
  const sprite = new THREE.Sprite(material);
  sprite.name = name;
  sprite.center.copy(record.sprite.center);
  sprite.renderOrder = record.sprite.renderOrder + renderOffset;
  sprite.frustumCulled = true;
  sprite.visible = false;
  sprite.userData.characterPresentationV151 = true;
  return sprite;
}

function createContactShadowV151(texture, renderOrder = 5) {
  const geometry = new THREE.PlaneGeometry(1, 1);
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    color: 0x11121a,
    transparent: true,
    opacity: 0,
    depthTest: true,
    depthWrite: false,
    toneMapped: false,
    side: THREE.DoubleSide
  });
  const shadow = new THREE.Mesh(geometry, material);
  shadow.name = 'characterContactShadowV151';
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = .025;
  shadow.renderOrder = renderOrder;
  shadow.frustumCulled = true;
  shadow.visible = false;
  shadow.userData.characterPresentationV151 = true;
  return shadow;
}

export default class CharacterPresentationDirectorV151 extends CombatArtPolishDirectorV114 {
  constructor({ assetPipeline, lowPower = false } = {}) {
    super({ assetPipeline, lowPower });
    this.qualityTierV151 = assetPipeline?.qualityTier || (lowPower ? 'low' : 'high');
    this.qualityV151 = resolveCharacterPresentationQualityV151({ lowPower, qualityTier: this.qualityTierV151 });
    this.contactShadowTextureV151 = createContactShadowTextureV151();
    this.modernRecordsV151 = 0;
    this.secondaryLayersV151 = 0;
    this.afterimageLayersV151 = 0;
    this.afterimageFramesV151 = 0;
    this.lodSuppressionsV151 = 0;
    this.keyLightFramesV151 = 0;
    this.silhouetteFramesV151 = 0;
    this.contactShadowFramesV151 = 0;
    this.textureSamplingUpgradesV151 = 0;
  }

  upgradeTextureSamplingV151(record) {
    const map = record?.sprite?.material?.map;
    if (!map) return;
    map.anisotropy = Math.max(map.anisotropy || 1, this.assetPipeline?.maxAnisotropy || 1);
    map.colorSpace = THREE.SRGBColorSpace;
    map.premultiplyAlpha = true;
    map.needsUpdate = true;
    record.sprite.material.alphaTest = record.authoredAtlas ? .045 : .035;
    record.sprite.material.premultipliedAlpha = true;
    record.sprite.material.dithering = true;
    record.sprite.material.needsUpdate = true;
    this.textureSamplingUpgradesV151 += 1;
  }

  decorateModernRecordV151(group) {
    const record = this.recordByGroup.get(group);
    if (!record || record.modernV151 || record.citadel) return record;
    const categoryProfile = CHARACTER_CATEGORY_RENDER_V151[record.category] || CHARACTER_CATEGORY_RENDER_V151.guardian;
    this.upgradeTextureSamplingV151(record);

    const silhouette = createLayerSpriteV151(record, {
      name: 'characterDepthSilhouetteV151',
      color: 0x17151f,
      renderOffset: -2
    });
    const keyLight = createLayerSpriteV151(record, {
      name: 'characterKeyLightV151',
      color: record.polishV114?.accent || 0x9fe5ff,
      blending: THREE.AdditiveBlending,
      renderOffset: 1
    });
    const contactShadow = this.contactShadowTextureV151
      ? createContactShadowV151(this.contactShadowTextureV151, record.sprite.renderOrder - 3)
      : null;
    const allowedAfterimages = record.category === 'monster'
      ? Math.min(1, this.qualityV151.afterimages)
      : this.qualityV151.afterimages;
    const afterimageCount = Math.max(0, Math.min(CHARACTER_PRESENTATION_POLICY_V151.maxAfterimages, allowedAfterimages));
    const afterimages = Array.from({ length: afterimageCount }, (_, index) => createLayerSpriteV151(record, {
      name: `characterMotionAfterimageV151:${index}`,
      color: record.polishV114?.accent || 0x9fe5ff,
      blending: THREE.AdditiveBlending,
      renderOffset: -1 - index
    }));

    if (contactShadow) group.add(contactShadow);
    group.add(silhouette, ...afterimages, keyLight);
    record.modernV151 = {
      silhouette,
      keyLight,
      contactShadow,
      afterimages,
      categoryProfile,
      history: [],
      previousWorld: null,
      velocity: 0,
      lastState: 'idle',
      elapsedSinceHistory: 0
    };
    group.userData.characterPresentationV151 = record.modernV151;
    group.userData.characterPresentationMode = 'layered-modern-runtime-v151';
    this.modernRecordsV151 += 1;
    this.secondaryLayersV151 += 2 + (contactShadow ? 1 : 0) + afterimages.length;
    this.afterimageLayersV151 += afterimages.length;
    return record;
  }

  attachHero(group, classId = 'warrior', options = {}) {
    const result = super.attachHero(group, classId, options);
    if (result) this.decorateModernRecordV151(group);
    return result;
  }

  attachGuardian(group, type = 'ember', rank = 1, options = {}) {
    const result = super.attachGuardian(group, type, rank, options);
    if (result) this.decorateModernRecordV151(group);
    return result;
  }

  attachEnemy(group, type = 'imp', config = {}, options = {}) {
    const result = super.attachEnemy(group, type, config, options);
    if (result) this.decorateModernRecordV151(group);
    return result;
  }

  updateModernRecordV151(record, dt, camera, elapsed) {
    const modern = record.modernV151;
    if (!modern || !record.sprite?.visible) {
      if (modern) {
        modern.silhouette.visible = false;
        modern.keyLight.visible = false;
        modern.contactShadow && (modern.contactShadow.visible = false);
        modern.afterimages.forEach((sprite) => { sprite.visible = false; });
      }
      return;
    }

    record.group.getWorldPosition(tempWorldV151);
    const distance = camera ? camera.position.distanceTo(tempWorldV151) : 0;
    const maxDistance = record.category === 'monster'
      ? this.qualityV151.monsterSecondaryDistance
      : this.qualityV151.maxSecondaryDistance;
    const pressure = Boolean(this.battlefieldClarityPolicyV122?.sustainedPressure);
    const visibleBudget = maxDistance > 0 && distance <= maxDistance && !(pressure && record.category === 'monster');
    if (!visibleBudget) this.lodSuppressionsV151 += 1;

    const currentWorld = tempWorldV151.clone();
    if (modern.previousWorld) modern.velocity = THREE.MathUtils.lerp(modern.velocity, currentWorld.distanceTo(modern.previousWorld) / Math.max(.001, dt), .22);
    modern.previousWorld = currentWorld;

    const state = record.state || 'idle';
    const stateTime = Math.max(0, finite(record.animation?.stateTime, 0));
    const attack = state === 'attack' ? Math.sin(Math.min(1, stateTime / .32) * Math.PI) : 0;
    const skill = state === 'skill' ? Math.sin(Math.min(1, stateTime / .58) * Math.PI) : 0;
    const hit = state === 'hit' ? Math.sin(Math.min(1, stateTime / .20) * Math.PI) : 0;
    const move = state === 'move' ? clamp01(modern.velocity / 4.8) : 0;
    const actionEnergy = Math.max(attack, skill, hit, move * .72);
    const side = finite(record.directionSide, 0) || 1;
    const profile = modern.categoryProfile;

    const outlineBase = this.qualityV151.persistentSilhouette ? profile.outline : 0;
    modern.silhouette.position.copy(record.sprite.position);
    modern.silhouette.position.x -= side * record.baseScale * profile.depthOffset * (1 + actionEnergy * .45);
    modern.silhouette.position.y -= record.baseScale * .008;
    modern.silhouette.scale.copy(record.sprite.scale).multiplyScalar(1.028 + actionEnergy * .018);
    modern.silhouette.material.rotation = record.sprite.material.rotation;
    modern.silhouette.material.opacity = visibleBudget ? outlineBase + hit * .16 + skill * .06 : 0;
    modern.silhouette.visible = modern.silhouette.material.opacity > .015;
    if (modern.silhouette.visible) this.silhouetteFramesV151 += 1;

    const keyBase = this.qualityV151.persistentKeyLight ? profile.key : 0;
    modern.keyLight.position.copy(record.sprite.position);
    modern.keyLight.position.x += side * record.baseScale * .010;
    modern.keyLight.position.y += record.baseScale * .012;
    modern.keyLight.scale.copy(record.sprite.scale).multiplyScalar(1.006 + skill * .020);
    modern.keyLight.material.rotation = record.sprite.material.rotation;
    modern.keyLight.material.color.setHex(state === 'hit' ? 0xff8b9b : (record.polishV114?.accent || 0xa6e9ff));
    modern.keyLight.material.opacity = visibleBudget ? keyBase + attack * .08 + skill * .20 + hit * .24 : 0;
    modern.keyLight.visible = modern.keyLight.material.opacity > .012;
    if (modern.keyLight.visible) this.keyLightFramesV151 += 1;

    if (modern.contactShadow) {
      const airborne = Math.max(0, record.sprite.position.y - record.baseY);
      const shadowCompression = THREE.MathUtils.clamp(1 - airborne / Math.max(.2, record.baseScale * .24), .54, 1);
      const shadowScale = record.baseScale * profile.shadowScale * (1 + move * .09 + skill * .12);
      modern.contactShadow.scale.set(shadowScale, shadowScale * .44 * shadowCompression, 1);
      modern.contactShadow.material.opacity = visibleBudget ? this.qualityV151.shadowOpacity * shadowCompression * (record.category === 'monster' ? .72 : 1) : 0;
      modern.contactShadow.visible = modern.contactShadow.material.opacity > .012 && state !== 'death';
      if (modern.contactShadow.visible) this.contactShadowFramesV151 += 1;
    }

    modern.elapsedSinceHistory += Math.max(0, dt);
    const shouldTrail = visibleBudget && modern.afterimages.length > 0 && (state === 'attack' || state === 'skill' || (state === 'move' && modern.velocity > 1.2));
    if (shouldTrail && modern.elapsedSinceHistory >= (this.lowPower ? .075 : .045)) {
      modern.elapsedSinceHistory = 0;
      modern.history.unshift({
        x: record.sprite.position.x,
        y: record.sprite.position.y,
        sx: record.sprite.scale.x,
        sy: record.sprite.scale.y,
        rotation: record.sprite.material.rotation,
        opacity: .18 + actionEnergy * .24,
        state
      });
      modern.history.length = Math.min(5, modern.afterimages.length + 2);
    }
    modern.afterimages.forEach((sprite, index) => {
      const sample = modern.history[index + 1];
      if (!shouldTrail || !sample) {
        sprite.visible = false;
        return;
      }
      sprite.position.set(sample.x - side * record.baseScale * .018 * (index + 1), sample.y, -.01 - index * .002);
      sprite.scale.set(sample.sx * (1 + index * .012), sample.sy * (1 - index * .018), 1);
      sprite.material.rotation = sample.rotation;
      sprite.material.color.setHex(record.polishV114?.accent || 0x9fe5ff);
      sprite.material.opacity = sample.opacity * profile.afterimage * (1 - index * .34);
      sprite.visible = sprite.material.opacity > .018;
      if (sprite.visible) this.afterimageFramesV151 += 1;
    });
    modern.lastState = state;
  }

  updateRecord(record, dt, camera, elapsed, showHealth = true) {
    super.updateRecord(record, dt, camera, elapsed, showHealth);
    this.updateModernRecordV151(record, dt, camera, elapsed);
  }

  detach(group, options = {}) {
    const record = this.recordByGroup.get(group);
    const modern = record?.modernV151;
    if (modern) {
      const sprites = [modern.silhouette, modern.keyLight, ...modern.afterimages].filter(Boolean);
      for (const sprite of sprites) {
        group.remove(sprite);
        sprite.material.map = null;
        sprite.material.dispose?.();
      }
      if (modern.contactShadow) {
        group.remove(modern.contactShadow);
        modern.contactShadow.material.map = null;
        modern.contactShadow.geometry.dispose?.();
        modern.contactShadow.material.dispose?.();
      }
      delete group.userData.characterPresentationV151;
      delete group.userData.characterPresentationMode;
    }
    return super.detach(group, options);
  }

  dispose() {
    super.dispose();
    this.contactShadowTextureV151?.dispose?.();
    this.contactShadowTextureV151 = null;
  }

  get diagnostics() {
    return Object.freeze({
      ...super.diagnostics,
      mode: 'modern-character-presentation-v151',
      presentationPolicyIdV151: CHARACTER_PRESENTATION_POLICY_V151.id,
      presentationVersionV151: CHARACTER_PRESENTATION_POLICY_V151.version,
      presentationBuildV151: CHARACTER_PRESENTATION_POLICY_V151.buildId,
      qualityTierV151: this.qualityTierV151,
      qualityProfileV151: { ...this.qualityV151 },
      modernRecordsV151: this.modernRecordsV151,
      secondaryLayersV151: this.secondaryLayersV151,
      afterimageLayersV151: this.afterimageLayersV151,
      afterimageFramesV151: this.afterimageFramesV151,
      lodSuppressionsV151: this.lodSuppressionsV151,
      keyLightFramesV151: this.keyLightFramesV151,
      silhouetteFramesV151: this.silhouetteFramesV151,
      contactShadowFramesV151: this.contactShadowFramesV151,
      textureSamplingUpgradesV151: this.textureSamplingUpgradesV151,
      finalCharacterArtApprovalsAddedV151: 0
    });
  }
}
