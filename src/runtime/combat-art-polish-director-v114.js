import * as THREE from 'three';
import CombatVisualDirectorV112 from './combat-visual-director-v112.js';
import { GUARDIAN_CITADEL_STATE_TEXTURE_IDS_V114, GUARDIAN_CITADEL_STATE_TEXTURE_IDS_V117 } from '../engine/asset-catalog.js';
import {
  CATEGORY_ACCENTS_V114,
  COMBAT_ART_POLISH_POLICY_V114,
  resolvePolishProfileV114
} from './combat-art-polish-policy-v114.js';

const clamp01 = (value) => Math.max(0, Math.min(1, Number(value) || 0));
const finite = (value, fallback = 0) => Number.isFinite(value) ? value : fallback;

function createGroundRing(accent, scale, renderOrder) {
  const geometry = new THREE.RingGeometry(.34, .46, 48);
  const material = new THREE.MeshBasicMaterial({
    color: accent,
    transparent: true,
    opacity: 0,
    depthTest: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    toneMapped: false
  });
  const ring = new THREE.Mesh(geometry, material);
  ring.name = 'combatGroundRingV114';
  ring.rotation.x = -Math.PI / 2;
  ring.position.set(0, .025, 0);
  ring.scale.setScalar(scale);
  ring.renderOrder = renderOrder;
  ring.frustumCulled = true;
  ring.visible = false;
  ring.userData.combatVisualV114 = true;
  return ring;
}

function createRimSprite(record, accent) {
  const material = new THREE.SpriteMaterial({
    map: record.sprite.material.map,
    color: accent,
    transparent: true,
    opacity: 0,
    alphaTest: .02,
    depthTest: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    toneMapped: false,
    sizeAttenuation: true
  });
  const sprite = new THREE.Sprite(material);
  sprite.name = 'combatSilhouetteRimV114';
  sprite.center.copy(record.sprite.center);
  sprite.renderOrder = record.sprite.renderOrder - 1;
  sprite.frustumCulled = true;
  sprite.visible = false;
  sprite.userData.combatVisualV114 = true;
  return sprite;
}

export default class CombatArtPolishDirectorV114 extends CombatVisualDirectorV112 {
  constructor(options = {}) {
    super(options);
    this.polishedRecords = 0;
    this.unmirroredFallbackUpdates = 0;
    this.actionProfileUpdates = 0;
    this.citadelStateChanges = 0;
    this.citadelStatesVisited = new Set();
  }

  setDirectionalState(record, frame, state) {
    super.setDirectionalState(record, frame, state);
    if (record.authoredAtlas) return;
    // Approved single-view production art is never mirrored or horizontally
    // compressed. Direction is communicated through motion timing until a
    // genuinely authored 11-direction sheet passes production review.
    const map = record.sprite?.material?.map;
    if (map) {
      map.repeat.set(1, 1);
      map.offset.set(0, 0);
      map.needsUpdate = true;
      this.unmirroredFallbackUpdates += 1;
    }
  }

  decorateRecord(group, profile) {
    const record = this.recordByGroup.get(group);
    if (!record || record.polishV114) return record;
    const accent = profile?.accent || CATEGORY_ACCENTS_V114[record.category] || 0xffffff;
    record.sprite.center.set(.5, profile?.centerY ?? .075);
    const rim = createRimSprite(record, accent);
    const ring = createGroundRing(accent, record.category === 'boss' ? record.baseScale * .82 : record.baseScale * .56, record.sprite.renderOrder - 2);
    group.add(ring, rim);
    record.polishV114 = {
      profile: profile || Object.freeze({ action: 'melee', accent }),
      rim,
      ring,
      accent,
      lastState: 'idle'
    };
    group.userData.combatArtPolishV114 = record.polishV114;
    group.userData.combatVisualRecordV114 = record;
    group.userData.combatVisualSpriteV114 = record.sprite;
    this.polishedRecords += 1;
    return record;
  }

  attachHero(group, classId = 'warrior', options = {}) {
    const profile = resolvePolishProfileV114('hero', classId);
    const rootScale = Math.max(.05, finite(group?.scale?.x, 1));
    const attached = super.attachHero(group, classId, {
      scale: profile.scale / rootScale,
      y: profile.y / rootScale,
      healthY: profile.healthY / rootScale,
      healthWidth: profile.healthWidth,
      ...options
    });
    if (attached) this.decorateRecord(group, profile);
    return attached;
  }

  attachGuardian(group, type = 'ember', rank = 1, options = {}) {
    const profile = resolvePolishProfileV114('guardian', type);
    const rankBoost = 1 + Math.max(0, rank - 1) * .028;
    const attached = super.attachGuardian(group, type, rank, {
      scale: profile.scale * rankBoost,
      y: profile.y,
      healthY: profile.healthY * rankBoost,
      healthWidth: profile.healthWidth * rankBoost,
      ...options
    });
    if (attached) this.decorateRecord(group, { ...profile, scale: profile.scale * rankBoost });
    return attached;
  }

  attachEnemy(group, type = 'imp', config = {}, options = {}) {
    const category = config.boss ? 'boss' : 'monster';
    const profile = resolvePolishProfileV114(category, type);
    const authoredScale = Math.max(.5, finite(config.scale, 1));
    const sourceScale = config.boss
      ? profile.scale * THREE.MathUtils.clamp(authoredScale / Math.max(1.8, authoredScale), .94, 1.10)
      : profile.scale * THREE.MathUtils.clamp(authoredScale, .72, 1.28);
    const attached = super.attachEnemy(group, type, config, {
      scale: sourceScale,
      y: profile.y,
      healthY: profile.healthY * (sourceScale / profile.scale),
      healthWidth: profile.healthWidth * THREE.MathUtils.clamp(sourceScale / profile.scale, .92, 1.14),
      ...options
    });
    if (attached) this.decorateRecord(group, { ...profile, scale: sourceScale });
    return attached;
  }

  attachCitadel(core, options = {}) {
    const attached = super.attachCitadel(core, options);
    if (!attached) return false;
    const record = this.recordByGroup.get(core);
    if (!record) return false;
    record.sprite.center.set(.5, .06);
    record.sprite.scale.multiplyScalar(.94);
    record.baseScale = record.sprite.scale.x;
    record.baseY = .018 / Math.max(.05, finite(core.scale?.x, 1));
    record.citadelTexturesV114 = Object.fromEntries(
      Object.keys(GUARDIAN_CITADEL_STATE_TEXTURE_IDS_V117)
        .map((state) => [state,
          this.getTexture(GUARDIAN_CITADEL_STATE_TEXTURE_IDS_V117[state]) ||
          this.getTexture(GUARDIAN_CITADEL_STATE_TEXTURE_IDS_V114[state])
        ])
        .filter(([, texture]) => Boolean(texture))
    );
    record.citadelArtVersion = record.citadelTexturesV114?.stable === this.getTexture(GUARDIAN_CITADEL_STATE_TEXTURE_IDS_V117.stable)
      ? 'v117-approved' : 'v114-fallback';
    const profile = Object.freeze({ action: 'core', accent: CATEGORY_ACCENTS_V114.core, centerY: .06 });
    this.decorateRecord(core, profile);
    record.polishV114.ring.scale.setScalar(record.baseScale * .72);
    record.polishV114.ring.material.opacity = .16;
    record.polishV114.ring.visible = true;
    record.citadelStateV114 = '';
    core.userData.guardianCitadelV114 = record.sprite;
    core.userData.combatVisualMode = 'guardian-citadel-four-state-v114';
    return true;
  }

  resolveCitadelState(record) {
    const maxHp = Math.max(.0001, finite(record.getMaxHp?.(), 1));
    const hpRatio = clamp01(finite(record.getHp?.(), maxHp) / maxHp);
    const maxShield = Math.max(0, finite(record.getMaxShield?.(), 0));
    const shieldRatio = maxShield > 0 ? clamp01(finite(record.getShield?.(), 0) / maxShield) : 0;
    if (shieldRatio > .025) return 'shielded';
    if (hpRatio <= .24) return 'critical';
    if (hpRatio <= .58) return 'cracked';
    return 'stable';
  }

  updateCitadelPolish(record, elapsed) {
    const state = this.resolveCitadelState(record);
    const texture = record.citadelTexturesV114?.[state] || record.citadelTexturesV114?.stable;
    if (texture && record.sprite.material.map !== texture) {
      record.sprite.material.map = texture;
      record.sprite.material.needsUpdate = true;
    }
    if (record.citadelStateV114 !== state) {
      record.citadelStateV114 = state;
      record.group.userData.guardianCitadelStateV114 = state;
      this.citadelStateChanges += 1;
      this.citadelStatesVisited.add(state);
    }
    const polish = record.polishV114;
    if (!polish) return;
    const pulse = .5 + .5 * Math.sin(elapsed * (state === 'critical' ? 4.8 : 2.2) + record.phase);
    polish.ring.visible = true;
    polish.ring.material.color.setHex(state === 'critical' ? 0xd45cff : state === 'cracked' ? 0xffb25d : 0x72dcff);
    polish.ring.material.opacity = state === 'stable' ? .10 : state === 'shielded' ? .34 + pulse * .16 : .18 + pulse * .12;
    polish.ring.rotation.z = elapsed * (state === 'critical' ? .9 : .35);
    polish.rim.visible = state !== 'stable';
    polish.rim.material.color.setHex(state === 'critical' ? 0xde66ff : state === 'cracked' ? 0xff9f55 : 0x84eaff);
    polish.rim.material.opacity = state === 'shielded' ? .20 + pulse * .12 : .10 + pulse * .10;
    polish.rim.position.copy(record.sprite.position);
    polish.rim.scale.copy(record.sprite.scale).multiplyScalar(state === 'critical' ? 1.055 : 1.035);
    polish.rim.material.rotation = record.sprite.material.rotation;
  }

  updateRecord(record, dt, camera, elapsed, showHealth = true) {
    super.updateRecord(record, dt, camera, elapsed, showHealth);
    if (!record.polishV114) return;
    if (record.citadel) {
      this.updateCitadelPolish(record, elapsed);
      return;
    }

    const { rim, ring, profile, accent } = record.polishV114;
    const state = record.state || 'idle';
    const t = Math.max(0, finite(record.animation?.stateTime, 0));
    const attackPulse = Math.sin(Math.min(1, t / .32) * Math.PI);
    const skillPulse = Math.sin(Math.min(1, t / .58) * Math.PI);
    const hitPulse = Math.sin(Math.min(1, t / .20) * Math.PI);
    const side = finite(record.directionSide, 0) || 1;

    // Reduce generic squash/rotation and add role-specific readable timing.
    record.sprite.material.rotation *= profile.action === 'tank' ? .28 : .56;
    if (profile.action === 'melee' && state === 'attack') {
      record.sprite.position.x += side * record.baseScale * .060 * attackPulse;
      record.sprite.position.y += record.baseScale * .018 * attackPulse;
      record.sprite.material.rotation -= side * .032 * attackPulse;
    } else if (profile.action === 'ranged' && state === 'attack') {
      record.sprite.position.x -= side * record.baseScale * .035 * attackPulse;
      record.sprite.scale.x *= 1 - attackPulse * .035;
    } else if ((profile.action === 'caster' || profile.action === 'support' || profile.action === 'controller') && state === 'skill') {
      record.sprite.position.y += record.baseScale * .045 * skillPulse;
      record.sprite.scale.multiplyScalar(1 + skillPulse * .035);
    } else if (profile.action === 'tank' && state === 'hit') {
      record.sprite.material.rotation *= .35;
      record.sprite.scale.x *= 1 + hitPulse * .045;
      record.sprite.scale.y *= 1 - hitPulse * .025;
    } else if (profile.action === 'roar' && state === 'skill') {
      record.sprite.scale.multiplyScalar(1 + skillPulse * .085);
      record.sprite.position.y += record.baseScale * .025 * skillPulse;
    }

    const activePulse = state === 'skill' ? skillPulse : state === 'attack' ? attackPulse : state === 'hit' ? hitPulse : 0;
    rim.position.copy(record.sprite.position);
    rim.scale.copy(record.sprite.scale).multiplyScalar(1.028 + activePulse * .022);
    rim.material.rotation = record.sprite.material.rotation;
    rim.material.color.setHex(state === 'hit' ? 0xff7c91 : accent);
    rim.material.opacity = state === 'skill' ? .10 + skillPulse * .24 : state === 'hit' ? hitPulse * .22 : state === 'attack' ? attackPulse * .10 : 0;
    rim.visible = rim.material.opacity > .018 && record.sprite.visible;

    ring.material.color.setHex(accent);
    ring.material.opacity = state === 'skill' ? .12 + skillPulse * .34 : state === 'attack' && profile.action === 'roar' ? attackPulse * .20 : 0;
    ring.visible = ring.material.opacity > .018 && record.group.visible;
    ring.rotation.z += dt * (state === 'skill' ? 1.6 : .45);
    ring.scale.setScalar((record.category === 'boss' ? record.baseScale * .82 : record.baseScale * .56) * (1 + activePulse * .16));
    this.actionProfileUpdates += activePulse > 0 ? 1 : 0;
  }

  detach(group, options = {}) {
    const record = this.recordByGroup.get(group);
    const polish = record?.polishV114;
    if (polish) {
      group.remove(polish.rim, polish.ring);
      polish.rim.material.dispose?.();
      polish.ring.geometry.dispose?.();
      polish.ring.material.dispose?.();
      delete group.userData.combatArtPolishV114;
      delete group.userData.combatVisualRecordV114;
      delete group.userData.combatVisualSpriteV114;
      delete group.userData.guardianCitadelV114;
    }
    return super.detach(group, options);
  }

  get diagnostics() {
    const base = super.diagnostics;
    return Object.freeze({
      ...base,
      mode: 'mega-art-polish-v114',
      polishVersion: COMBAT_ART_POLISH_POLICY_V114.version,
      polishBuild: COMBAT_ART_POLISH_POLICY_V114.build,
      polishPolicyId: COMBAT_ART_POLISH_POLICY_V114.id,
      approvedStaticCombatArt: COMBAT_ART_POLISH_POLICY_V114.approvedStaticCombatArt,
      staticArtMirroringAllowed: COMBAT_ART_POLISH_POLICY_V114.staticArtMirroringAllowed,
      independentlyAuthoredDirectionsRequired: COMBAT_ART_POLISH_POLICY_V114.independentlyAuthoredDirectionsRequired,
      polishedRecords: this.polishedRecords,
      unmirroredFallbackUpdates: this.unmirroredFallbackUpdates,
      actionProfileUpdates: this.actionProfileUpdates,
      citadelStateChanges: this.citadelStateChanges,
      citadelStatesVisited: [...this.citadelStatesVisited],
      approvedCitadelArtV117: [...this.records].filter((record) => record.citadelArtVersion === 'v117-approved').length
    });
  }
}
