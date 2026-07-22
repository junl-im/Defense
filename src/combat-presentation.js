import * as THREE from 'three';

const clamp = THREE.MathUtils.clamp;
const TAU = Math.PI * 2;
const FORWARD = new THREE.Vector3(0, 0, 1);
const scratchDirection = new THREE.Vector3();
const scratchWorld = new THREE.Vector3();
const scratchColor = new THREE.Color();
const scratchQuaternion = new THREE.Quaternion();

const STYLE_PRESETS = Object.freeze({
  hero: Object.freeze({ shape: 'slash', shake: .13, hitStop: .018, particles: 1 }),
  wind: Object.freeze({ shape: 'crescent', shake: .1, hitStop: .014, particles: 1 }),
  ember: Object.freeze({ shape: 'burst', shake: .14, hitStop: .018, particles: 2 }),
  frost: Object.freeze({ shape: 'shard', shake: .12, hitStop: .016, particles: 2 }),
  stone: Object.freeze({ shape: 'quake', shake: .28, hitStop: .034, particles: 3 }),
  bell: Object.freeze({ shape: 'rune', shake: .15, hitStop: .018, particles: 2 }),
  thunder: Object.freeze({ shape: 'spark', shake: .23, hitStop: .028, particles: 3 }),
  skill: Object.freeze({ shape: 'burst', shake: .32, hitStop: .042, particles: 4 }),
  ultimate: Object.freeze({ shape: 'quake', shake: .45, hitStop: .06, particles: 5 }),
  shield: Object.freeze({ shape: 'rune', shake: .1, hitStop: .014, particles: 2 })
});

function normalizeStyle(source = '') {
  if (source.startsWith('ultimate-')) return 'ultimate';
  if (source === 'skill' || source === 'hero-skill') return 'skill';
  if (STYLE_PRESETS[source]) return source;
  return 'hero';
}

function lerpAngle(a, b, t) {
  let diff = (b - a + Math.PI) % TAU - Math.PI;
  if (diff < -Math.PI) diff += TAU;
  return a + diff * t;
}

export function faceActorTowards(group, targetPosition, blend = 1) {
  if (!group || !targetPosition) return null;
  scratchDirection.copy(targetPosition).sub(group.position).setY(0);
  if (scratchDirection.lengthSq() < .000001) return null;
  scratchDirection.normalize();
  const targetRotation = Math.atan2(scratchDirection.x, scratchDirection.z);
  group.rotation.y = blend >= .999 ? targetRotation : lerpAngle(group.rotation.y, targetRotation, clamp(blend, 0, 1));
  return scratchDirection.clone();
}

export function resolveAttackOrigin(group, fallbackHeight = 1.35, forwardOffset = .18) {
  if (!group) return new THREE.Vector3(0, fallbackHeight, 0);
  const parts = group.userData?.parts || {};
  const socket = parts.weaponSocket || group.getObjectByName?.('WeaponSocket') || null;
  const origin = new THREE.Vector3();
  if (socket && socket !== group) socket.getWorldPosition(origin);
  else group.getWorldPosition(origin).add(new THREE.Vector3(0, fallbackHeight, 0));
  origin.add(new THREE.Vector3(Math.sin(group.rotation.y), 0, Math.cos(group.rotation.y)).multiplyScalar(forwardOffset));
  return origin;
}

function disposeObject(object) {
  object.parent?.remove(object);
  if (object.material) {
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    materials.forEach((material) => material.dispose?.());
  }
}

export class CombatPresentation {
  constructor({ parent, flashElement = null, lowPower = false, reducedMotion = () => false } = {}) {
    this.root = new THREE.Group();
    this.root.name = 'CombatPresentationRoot';
    parent?.add(this.root);
    this.flashElement = flashElement;
    this.lowPower = lowPower;
    this.reducedMotion = reducedMotion;
    this.effects = [];
    this.hitStopRemaining = 0;
    this.hitStopCooldown = 0;
    this.flashRemaining = 0;
    this.maxEffects = lowPower ? 34 : 72;
    this.geometries = {
      slash: new THREE.RingGeometry(.42, .78, 28, 1, -.72, 2.55),
      crescent: new THREE.RingGeometry(.38, .72, 24, 1, -.45, 1.92),
      ring: new THREE.RingGeometry(.44, .57, 30),
      halo: new THREE.RingGeometry(.26, .36, 32),
      petal: new THREE.CircleGeometry(.11, 6),
      core: new THREE.OctahedronGeometry(.18, 0),
      shard: new THREE.ConeGeometry(.07, .48, 5),
      spark: new THREE.TetrahedronGeometry(.15, 0)
    };
  }

  clear() {
    for (const effect of this.effects) disposeObject(effect.object);
    this.effects.length = 0;
    this.hitStopRemaining = 0;
    this.hitStopCooldown = 0;
    this.flashRemaining = 0;
    this.flashElement?.classList.remove('show', 'critical', 'heavy');
  }

  dispose() {
    this.clear();
    this.root.parent?.remove(this.root);
    Object.values(this.geometries).forEach((geometry) => geometry.dispose());
  }

  get timeScale() {
    if (this.hitStopRemaining <= 0 || this.reducedMotion()) return 1;
    return .055;
  }

  addEffect(object, options = {}) {
    while (this.effects.length >= this.maxEffects) {
      const oldest = this.effects.shift();
      disposeObject(oldest.object);
    }
    this.root.add(object);
    this.effects.push({
      object,
      life: options.life ?? .22,
      maxLife: options.life ?? .22,
      startScale: options.startScale ?? .7,
      endScale: options.endScale ?? 1.65,
      velocity: options.velocity?.clone?.() || new THREE.Vector3(),
      spin: options.spin ?? 0,
      opacity: options.opacity ?? .9,
      vertical: options.vertical ?? false
    });
  }

  material(color, opacity = .9, { additive = true } = {}) {
    return new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending
    });
  }

  tint(color, whiteAmount = .35) {
    return new THREE.Color(color).lerp(new THREE.Color(0xffffff), clamp(whiteAmount, 0, 1)).getHex();
  }

  orientImpactPlane(mesh, direction) {
    const safeDirection = direction?.lengthSq?.() > .00001 ? direction.clone().normalize() : FORWARD;
    scratchQuaternion.setFromUnitVectors(FORWARD, safeDirection);
    mesh.quaternion.copy(scratchQuaternion);
  }

  pulseScreen(color, { critical = false, heavy = false } = {}) {
    if (!this.flashElement) return;
    scratchColor.set(color);
    this.flashElement.style.setProperty('--combat-impact-color', `#${scratchColor.getHexString()}`);
    this.flashElement.classList.remove('show', 'critical', 'heavy');
    void this.flashElement.offsetWidth;
    this.flashElement.classList.toggle('critical', critical);
    this.flashElement.classList.toggle('heavy', heavy);
    this.flashElement.classList.add('show');
    this.flashRemaining = heavy ? .13 : critical ? .09 : .055;
  }

  requestHitStop(duration) {
    if (this.reducedMotion() || this.hitStopCooldown > 0) return;
    if (this.lowPower && duration < .03) return;
    this.hitStopRemaining = Math.max(this.hitStopRemaining, duration);
    this.hitStopCooldown = duration + .025;
  }

  muzzle({ position, direction, color, style = 'hero', heavy = false } = {}) {
    if (!position) return;
    const normalized = normalizeStyle(style);
    const preset = STYLE_PRESETS[normalized];
    const bright = this.tint(color, heavy ? .62 : .42);
    const mesh = new THREE.Mesh(this.geometries.core, this.material(bright, heavy ? .96 : .78));
    mesh.position.copy(position);
    mesh.scale.setScalar(heavy ? 1.35 : .8);
    if (direction?.lengthSq?.() > 0) mesh.position.addScaledVector(direction.clone().normalize(), .16);
    this.addEffect(mesh, { life: heavy ? .2 : .12, startScale: .55, endScale: heavy ? 2.3 : 1.55, spin: 7, opacity: .92 });

    const halo = new THREE.Mesh(this.geometries.halo, this.material(color, heavy ? .76 : .52));
    halo.position.copy(position);
    this.orientImpactPlane(halo, direction);
    this.addEffect(halo, { life: heavy ? .24 : .15, startScale: .42, endScale: heavy ? 2.7 : 1.8, spin: heavy ? -5.5 : -3.2, opacity: .72 });
    if (preset.shape === 'crescent' || preset.shape === 'slash') {
      const slash = new THREE.Mesh(this.geometries.crescent, this.material(color, .62));
      slash.position.copy(position);
      this.orientImpactPlane(slash, direction);
      slash.rotation.z = normalized === 'wind' ? -.48 : .18;
      this.addEffect(slash, { life: .16, startScale: .32, endScale: 1.3, spin: normalized === 'wind' ? -3.5 : 2.2, opacity: .7 });
    }
  }

  impact({ position, origin = null, color = 0xffffff, source = 'hero', critical = false, heavy = false, shielded = false } = {}) {
    if (!position) return { shake: 0 };
    const normalized = shielded ? 'shield' : normalizeStyle(source);
    const preset = STYLE_PRESETS[normalized] || STYLE_PRESETS.hero;
    const direction = origin ? position.clone().sub(origin).setY(0) : new THREE.Vector3(0, 0, 1);
    if (direction.lengthSq() < .00001) direction.set(0, 0, 1);
    direction.normalize();
    const strength = heavy ? 1.35 : critical ? 1.15 : 1;
    const shape = preset.shape;

    const bright = this.tint(color, critical ? .72 : heavy ? .58 : .38);
    const soft = this.tint(color, .16);
    const coreGeometry = shape === 'shard' ? this.geometries.shard : shape === 'spark' ? this.geometries.spark : this.geometries.core;
    const core = new THREE.Mesh(coreGeometry, this.material(bright, .96));
    core.position.copy(position).add(new THREE.Vector3(0, heavy ? 1.05 : .82, 0));
    core.scale.setScalar((shape === 'quake' ? 1.3 : .82) * strength);
    core.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    this.addEffect(core, {
      life: heavy ? .3 : .2,
      startScale: .45,
      endScale: heavy ? 2.9 : 2,
      spin: shape === 'spark' ? 14 : 7,
      opacity: .96,
      velocity: new THREE.Vector3(0, heavy ? .7 : .35, 0)
    });

    const halo = new THREE.Mesh(this.geometries.halo, this.material(soft, critical ? .95 : .72));
    halo.position.copy(position).add(new THREE.Vector3(0, .9, 0));
    this.orientImpactPlane(halo, direction);
    halo.rotation.z = critical ? -.28 : .08;
    this.addEffect(halo, { life: heavy ? .36 : .24, startScale: .42, endScale: heavy ? 4.1 : 2.65, spin: critical ? -6.2 : 3.4, opacity: .78 });

    if (!this.lowPower || heavy || critical) {
      const petalCount = heavy ? 4 : critical ? 3 : 2;
      for (let index = 0; index < petalCount; index += 1) {
        const petal = new THREE.Mesh(this.geometries.petal, this.material(index % 2 ? color : bright, .62));
        petal.position.copy(position).add(new THREE.Vector3(0, .88, 0));
        this.orientImpactPlane(petal, direction);
        petal.rotation.z = index / petalCount * TAU + .35;
        petal.position.x += Math.cos(index / petalCount * TAU) * .16;
        petal.position.z += Math.sin(index / petalCount * TAU) * .16;
        this.addEffect(petal, { life: .18 + index * .025, startScale: .3, endScale: heavy ? 1.75 : 1.15, spin: (index % 2 ? -1 : 1) * 7, opacity: .58 });
      }
    }

    if (shape === 'slash' || shape === 'crescent' || critical) {
      const slash = new THREE.Mesh(shape === 'crescent' ? this.geometries.crescent : this.geometries.slash, this.material(bright, critical ? .98 : .84));
      slash.position.copy(position).add(new THREE.Vector3(0, .92, 0));
      this.orientImpactPlane(slash, direction);
      slash.rotation.z = critical ? -.4 : .16;
      this.addEffect(slash, { life: critical ? .28 : .2, startScale: .38, endScale: critical ? 2.65 : 1.85, spin: critical ? -4.2 : 2.5, opacity: .9 });
      if (critical) {
        const cross = new THREE.Mesh(this.geometries.crescent, this.material(color, .72));
        cross.position.copy(slash.position);
        cross.quaternion.copy(slash.quaternion);
        cross.rotation.z = .92;
        this.addEffect(cross, { life: .24, startScale: .3, endScale: 2.25, spin: 4.6, opacity: .72 });
      }
    }

    if (shape === 'quake' || shape === 'rune' || heavy || shielded) {
      const ring = new THREE.Mesh(this.geometries.ring, this.material(color, shielded ? .82 : .7));
      ring.position.copy(position).setY(.12);
      ring.rotation.x = -Math.PI / 2;
      this.addEffect(ring, { life: heavy ? .38 : .28, startScale: .32, endScale: heavy ? 5.2 : 3.1, spin: shape === 'rune' ? 4.8 : 0, opacity: .78 });
    }

    const shardCount = this.lowPower ? Math.min(2, preset.particles) : preset.particles;
    for (let index = 0; index < shardCount; index += 1) {
      const shard = new THREE.Mesh(this.geometries.shard, this.material(color, .7));
      shard.position.copy(position).add(new THREE.Vector3(0, .75, 0));
      shard.rotation.z = Math.random() * TAU;
      const angle = index / Math.max(1, shardCount) * TAU + Math.random() * .45;
      this.addEffect(shard, {
        life: .22 + Math.random() * .11,
        startScale: .3,
        endScale: .75,
        spin: (index % 2 ? -1 : 1) * (8 + Math.random() * 5),
        opacity: .65,
        velocity: new THREE.Vector3(Math.cos(angle) * (1.4 + Math.random()), .5 + Math.random() * .7, Math.sin(angle) * (1.4 + Math.random()))
      });
    }

    const stop = preset.hitStop * (critical ? 1.8 : 1) * (heavy ? 1.4 : 1);
    this.requestHitStop(stop);
    if (critical || heavy || shielded) this.pulseScreen(color, { critical, heavy });
    return { shake: preset.shake * strength };
  }

  update(realDt) {
    this.hitStopCooldown = Math.max(0, this.hitStopCooldown - realDt);
    this.hitStopRemaining = Math.max(0, this.hitStopRemaining - realDt);
    this.flashRemaining = Math.max(0, this.flashRemaining - realDt);
    if (this.flashRemaining <= 0) this.flashElement?.classList.remove('show', 'critical', 'heavy');

    for (let index = this.effects.length - 1; index >= 0; index -= 1) {
      const effect = this.effects[index];
      effect.life -= realDt;
      const progress = 1 - clamp(effect.life / effect.maxLife, 0, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const scale = THREE.MathUtils.lerp(effect.startScale, effect.endScale, eased);
      effect.object.scale.setScalar(scale);
      effect.object.position.addScaledVector(effect.velocity, realDt);
      effect.object.rotation.z += effect.spin * realDt;
      if (effect.object.material) effect.object.material.opacity = effect.opacity * Math.pow(1 - progress, 1.35);
      if (effect.life <= 0) {
        this.effects.splice(index, 1);
        disposeObject(effect.object);
      }
    }
  }
}

export default CombatPresentation;
