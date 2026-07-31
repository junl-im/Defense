import * as THREE from 'three';
import CombatArtPolishDirectorV114 from './combat-art-polish-director-v114.js';
import {
  CHARACTER_CATEGORY_RENDER_V151,
  CHARACTER_PRESENTATION_POLICY_V151,
  resolveCharacterPresentationQualityV151
} from './character-presentation-policy-v151.js';
import { CharacterPresentationBudgetV152 } from './character-presentation-budget-v152.js';

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
    this.qualityTierV152 = lowPower || this.qualityTierV151 === 'low' ? 'economy' : this.qualityTierV151 === 'medium' ? 'balanced' : 'cinematic';
    this.qualityV151 = resolveCharacterPresentationQualityV151({ lowPower, qualityTier: this.qualityTierV151 });
    this.presentationBudgetV152 = new CharacterPresentationBudgetV152({ initialTier: this.qualityTierV152 });
    this.presentationBudgetDowngradesV152 = 0;
    this.motionHistoryResetsV152 = 0;
    this.teleportResetsV152 = 0;
    this.eventDrivenFramesV152 = 0;
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
    this.presentationFallbacksV151 = 0;
    this.presentationFallbackMessagesV151 = new Set();
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
      history: Array.from({ length: CHARACTER_PRESENTATION_POLICY_V151.maxAfterimages + 2 }, () => ({
        x: 0, y: 0, sx: 1, sy: 1, rotation: 0, opacity: 0, state: 'idle', valid: false
      })),
      historyCount: 0,
      previousWorld: new THREE.Vector3(),
      hasPreviousWorld: false,
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

  clearMotionHistoryV152(modern, { resetWorld = false, teleport = false } = {}) {
    if (!modern) return;
    const hadHistory = modern.historyCount > 0 || (modern.history || []).some((sample) => sample.valid);
    const hadWorldAnchor = Boolean(modern.hasPreviousWorld);
    for (const sample of modern.history || []) sample.valid = false;
    modern.historyCount = 0;
    modern.elapsedSinceHistory = 0;
    if (resetWorld) modern.hasPreviousWorld = false;
    modern.afterimages?.forEach?.((sprite) => { sprite.visible = false; });
    if (hadHistory || (resetWorld && hadWorldAnchor) || teleport) this.motionHistoryResetsV152 += 1;
    if (teleport) this.teleportResetsV152 += 1;
  }

  pushMotionHistoryV152(modern, record, state, opacity) {
    const history = modern.history || [];
    if (!history.length) return;
    for (let index = history.length - 1; index > 0; index -= 1) {
      const source = history[index - 1];
      const target = history[index];
      target.x = source.x; target.y = source.y; target.sx = source.sx; target.sy = source.sy;
      target.rotation = source.rotation; target.opacity = source.opacity; target.state = source.state; target.valid = source.valid;
    }
    const first = history[0];
    first.x = record.sprite.position.x;
    first.y = record.sprite.position.y;
    first.sx = record.sprite.scale.x;
    first.sy = record.sprite.scale.y;
    first.rotation = record.sprite.material.rotation;
    first.opacity = opacity;
    first.state = state;
    first.valid = true;
    modern.historyCount = Math.min(history.length, modern.historyCount + 1);
  }

  applyPresentationBudgetV152(report) {
    if (!report || report.activeTier === this.qualityTierV152) return false;
    this.qualityTierV152 = report.activeTier;
    const qualityTier = report.activeTier === 'economy' ? 'low' : report.activeTier === 'balanced' ? 'medium' : 'high';
    this.qualityV151 = resolveCharacterPresentationQualityV151({ lowPower: report.activeTier === 'economy', qualityTier });
    this.presentationBudgetDowngradesV152 += 1;
    for (const record of this.records || []) {
      const modern = record.modernV151;
      if (!modern) continue;
      modern.afterimages.forEach((sprite, index) => { if (index >= this.qualityV151.afterimages) sprite.visible = false; });
      this.clearMotionHistoryV152(modern);
    }
    return true;
  }

  observePresentationCostV152(sample = {}) {
    const report = this.presentationBudgetV152.observe(sample);
    this.applyPresentationBudgetV152(report);
    return report;
  }

  updateModernRecordV151(record, dt, camera, elapsed) {
    const modern = record.modernV151;
    if (!modern || !record.sprite?.visible) {
      if (modern) {
        modern.silhouette.visible = false;
        modern.keyLight.visible = false;
        modern.contactShadow && (modern.contactShadow.visible = false);
        this.clearMotionHistoryV152(modern, { resetWorld: true });
        modern.velocity = 0;
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

    if (modern.hasPreviousWorld) {
      const worldDelta = tempWorldV151.distanceTo(modern.previousWorld);
      const teleportThreshold = Math.max(2.5, record.baseScale * 3.5);
      if (worldDelta > teleportThreshold || dt > .22) {
        modern.velocity = 0;
        this.clearMotionHistoryV152(modern, { teleport: true });
      } else {
        modern.velocity = THREE.MathUtils.lerp(modern.velocity, worldDelta / Math.max(.001, dt), .22);
      }
    }
    modern.previousWorld.copy(tempWorldV151);
    modern.hasPreviousWorld = true;

    const state = record.state || 'idle';
    if (state !== modern.lastState) this.clearMotionHistoryV152(modern);
    const stateTime = Math.max(0, finite(record.animation?.stateTime, 0));
    const eventEnvelope = record.animation?.presentationV152;
    const hasEventEnvelope = eventEnvelope && eventEnvelope.state === state;
    const attack = hasEventEnvelope ? clamp01(eventEnvelope.attack) : (state === 'attack' ? Math.sin(Math.min(1, stateTime / .32) * Math.PI) : 0);
    const skill = hasEventEnvelope ? clamp01(eventEnvelope.skill) : (state === 'skill' ? Math.sin(Math.min(1, stateTime / .58) * Math.PI) : 0);
    const hit = hasEventEnvelope ? clamp01(eventEnvelope.hit) : (state === 'hit' ? Math.sin(Math.min(1, stateTime / .20) * Math.PI) : 0);
    const trailEvent = hasEventEnvelope ? clamp01(eventEnvelope.trail) : Math.max(attack, skill, hit);
    if (hasEventEnvelope) this.eventDrivenFramesV152 += 1;
    const move = state === 'move' || state === 'run' ? clamp01(modern.velocity / 4.8) : 0;
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
    const activeAfterimages = Math.min(modern.afterimages.length, this.qualityV151.afterimages);
    const shouldTrail = visibleBudget && activeAfterimages > 0 && (trailEvent > .08 || ((state === 'move' || state === 'run') && modern.velocity > 1.2));
    if (!shouldTrail && modern.historyCount > 0) this.clearMotionHistoryV152(modern);
    if (shouldTrail && modern.elapsedSinceHistory >= (this.lowPower ? .075 : .045)) {
      modern.elapsedSinceHistory = 0;
      this.pushMotionHistoryV152(modern, record, state, .18 + Math.max(actionEnergy, trailEvent) * .24);
    }
    modern.afterimages.forEach((sprite, index) => {
      const sample = modern.history[index + 1];
      if (!shouldTrail || index >= activeAfterimages || !sample?.valid) {
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

  disableModernRecordV151(record, error) {
    const modern = record?.modernV151;
    if (!modern || modern.disabled) return;
    modern.disabled = true;
    const message = error instanceof Error ? error.message : String(error || 'unknown presentation error');
    modern.fallbackReason = message.slice(0, 180);
    modern.silhouette.visible = false;
    modern.keyLight.visible = false;
    if (modern.contactShadow) modern.contactShadow.visible = false;
    modern.afterimages.forEach((sprite) => { sprite.visible = false; });
    this.presentationFallbacksV151 += 1;
    if (!this.presentationFallbackMessagesV151.has(modern.fallbackReason)) {
      this.presentationFallbackMessagesV151.add(modern.fallbackReason);
      console.warn('[CharacterPresentationV151] enhancement disabled for one record; legacy combat art remains active', modern.fallbackReason);
    }
  }

  updateRecord(record, dt, camera, elapsed, showHealth = true) {
    // Legacy combat art is the release-critical path. The v1.0.51 enhancement
    // is fail-open per record so an optional rim/shadow layer can never poison
    // the global animation loop or the 100-wave assurance ledger.
    super.updateRecord(record, dt, camera, elapsed, showHealth);
    if (record?.modernV151?.disabled) return;
    try {
      this.updateModernRecordV151(record, dt, camera, elapsed);
    } catch (error) {
      this.disableModernRecordV151(record, error);
    }
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
      qualityTierV152: this.qualityTierV152,
      qualityProfileV151: { ...this.qualityV151 },
      presentationBudgetV152: this.presentationBudgetV152.report,
      presentationBudgetDowngradesV152: this.presentationBudgetDowngradesV152,
      motionHistoryResetsV152: this.motionHistoryResetsV152,
      teleportResetsV152: this.teleportResetsV152,
      eventDrivenFramesV152: this.eventDrivenFramesV152,
      modernRecordsV151: this.modernRecordsV151,
      secondaryLayersV151: this.secondaryLayersV151,
      afterimageLayersV151: this.afterimageLayersV151,
      afterimageFramesV151: this.afterimageFramesV151,
      lodSuppressionsV151: this.lodSuppressionsV151,
      keyLightFramesV151: this.keyLightFramesV151,
      silhouetteFramesV151: this.silhouetteFramesV151,
      contactShadowFramesV151: this.contactShadowFramesV151,
      textureSamplingUpgradesV151: this.textureSamplingUpgradesV151,
      presentationFallbacksV151: this.presentationFallbacksV151,
      presentationFallbackMessagesV151: [...this.presentationFallbackMessagesV151],
      finalCharacterArtApprovalsAddedV151: 0
    });
  }
}
