import * as THREE from 'three';

export const BATTLEFIELD_PROP_VERSION = '1.0.0';

const PROP_DEFINITIONS = Object.freeze([
  Object.freeze({ id: 'treasure', key: 'prop-chest-bronze', label: '달빛 보물 상자', prompt: '보상 획득', position: [-6.8, 1.15, 8.4], scale: 2.7, kind: 'interact', cooldown: 22 }),
  Object.freeze({ id: 'supply', key: 'prop-supply-crate', label: '장터 보급 상자', prompt: '보급품 획득', position: [7.4, 1.05, 7.6], scale: 2.45, kind: 'interact', cooldown: 25 }),
  Object.freeze({ id: 'reactor', key: 'prop-crystal-reactor', label: '수정 공명로', prompt: '혼불 공명', position: [-8.2, 1.2, -6.9], scale: 2.8, kind: 'interact', cooldown: 20, pulse: true }),
  Object.freeze({ id: 'brazier', key: 'env-fire-brazier', label: '성화 화로', position: [8.5, 1.2, -7.4], scale: 2.65, kind: 'auto', cooldown: 6.8, radius: 5.8, source: 'ember' }),
  Object.freeze({ id: 'cannon', key: 'prop-field-cannon', label: '월광 대포', position: [0.4, 1.15, -11.8], scale: 2.85, kind: 'auto', cooldown: 5.4, radius: 16.5, source: 'thunder' }),
  Object.freeze({ id: 'trap', key: 'prop-bear-trap', label: '빙결 덫', position: [-11.4, .58, 1.8], scale: 2.2, kind: 'auto', cooldown: 4.8, radius: 3.2, source: 'frost' }),
  Object.freeze({ id: 'barricade', key: 'prop-spike-barricade', label: '도깨비 방벽', position: [11.2, 1.1, 1.2], scale: 2.85, kind: 'auto', cooldown: 7.4, radius: 4.2, source: 'stone' })
]);

const distance2D = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);

export default class BattlefieldPropSystem {
  constructor({ lowPower = false } = {}) {
    this.lowPower = Boolean(lowPower);
    this.root = null;
    this.props = [];
    this.nearest = null;
    this.activations = 0;
    this.damage = 0;
    this.gold = 0;
    this.healing = 0;
    this.soul = 0;
    this.interestPoints = [];
  }

  populate(parent, spriteDirector, { titleMode = false } = {}) {
    this.clear();
    if (!parent || !spriteDirector?.loaded) return 0;
    this.root = new THREE.Group();
    this.root.name = 'LivingBattlefieldPropsV15';
    for (const definition of PROP_DEFINITIONS) {
      if (titleMode && definition.kind === 'auto') continue;
      const [x, y, z] = definition.position;
      const angle = Math.atan2(z, x);
      const radius = Math.hypot(x, z);
      const sprite = spriteDirector.createSprite(definition.key, { ...definition, radius, angle, y, pulse: definition.pulse });
      if (!sprite) continue;
      sprite.position.set(x, y, z);
      sprite.userData.propId = definition.id;
      sprite.userData.baseOpacity = 1;
      this.root.add(sprite);
      this.props.push({ definition, sprite, cooldown: titleMode ? 999 : definition.cooldown * .35, ready: !titleMode, charges: 0 });
    }
    parent.add(this.root);
    return this.props.length;
  }

  beginWave() {
    for (const prop of this.props) {
      if (prop.definition.kind === 'auto') prop.cooldown = Math.min(prop.cooldown, 1.25 + Math.random() * 1.8);
      if (prop.definition.kind === 'interact') prop.ready = true;
    }
  }

  findNearest(playerPosition) {
    let candidate = null;
    let best = Infinity;
    for (const prop of this.props) {
      if (prop.definition.kind !== 'interact' || !prop.ready || prop.cooldown > 0) continue;
      const distance = distance2D(playerPosition, prop.sprite.position);
      if (distance < 3.4 && distance < best) { candidate = prop; best = distance; }
    }
    this.nearest = candidate;
    return candidate ? Object.freeze({ id: candidate.definition.id, label: candidate.definition.label, prompt: candidate.definition.prompt, distance: Number(best.toFixed(2)) }) : null;
  }

  interact(context = {}) {
    const prop = this.nearest;
    if (!prop || !prop.ready || prop.cooldown > 0) return null;
    const eventMultiplier = context.event?.id === 'treasure' ? 1.4 : 1;
    let result = null;
    if (prop.definition.id === 'treasure') {
      const gold = Math.round((18 + (context.wave || 1) * 3) * eventMultiplier);
      context.addGold?.(gold); this.gold += gold;
      result = { type: 'gold', amount: gold, label: `엽전 +${gold}` };
    } else if (prop.definition.id === 'supply') {
      const heal = Math.max(3, Math.round((context.coreMaxHp || 100) * .055));
      const applied = context.healCore?.(heal) || 0; this.healing += applied;
      result = { type: 'heal', amount: applied, label: `신목 회복 +${applied}` };
    } else if (prop.definition.id === 'reactor') {
      const soul = Math.round(12 * (context.soulMultiplier || 1));
      context.gainSoul?.(soul); this.soul += soul;
      result = { type: 'soul', amount: soul, label: `혼불 +${soul}%` };
    }
    if (!result) return null;
    prop.ready = false;
    prop.cooldown = prop.definition.cooldown;
    prop.charges += 1;
    this.activations += 1;
    context.spawnEffect?.(prop.sprite.position, result.type);
    return Object.freeze({ ...result, propId: prop.definition.id, propLabel: prop.definition.label });
  }

  update(dt, context = {}) {
    const rate = Math.max(.75, Number(context.propRateMultiplier) || 1);
    const enemies = context.enemies || [];
    const waveActive = Boolean(context.waveActive);
    this.interestPoints.length = 0;
    for (const prop of this.props) {
      prop.cooldown = Math.max(0, prop.cooldown - dt * rate);
      if (prop.definition.kind === 'interact') {
        if (prop.cooldown <= 0) prop.ready = true;
        const readyPulse = prop.ready ? 1 + Math.sin((context.elapsed || 0) * 3.1 + prop.sprite.position.x) * .065 : .88;
        prop.sprite.scale.setScalar(prop.definition.scale * readyPulse);
        prop.sprite.material.opacity = prop.ready ? .98 : .55;
        if (prop.ready) this.interestPoints.push({ position: prop.sprite.position, weight: .22, type: prop.definition.id });
        continue;
      }
      prop.sprite.material.opacity = waveActive ? .98 : .72;
      if (!waveActive || prop.cooldown > 0 || !enemies.length) continue;
      const inRange = enemies.filter((enemy) => !enemy.dead && distance2D(enemy.group.position, prop.sprite.position) <= prop.definition.radius);
      if (!inRange.length) continue;
      let targets = inRange;
      if (prop.definition.id === 'cannon') targets = [inRange.sort((a, b) => a.group.position.distanceToSquared(prop.sprite.position) - b.group.position.distanceToSquared(prop.sprite.position))[0]];
      const base = prop.definition.id === 'cannon' ? 72 : prop.definition.id === 'barricade' ? 34 : prop.definition.id === 'trap' ? 28 : 24;
      const damage = base + (context.wave || 1) * (prop.definition.id === 'cannon' ? 9 : 4);
      let dealt = 0;
      for (const enemy of targets.slice(0, prop.definition.id === 'brazier' ? 6 : 3)) {
        context.damageEnemy?.(enemy, damage, prop.definition.source, prop.sprite.position);
        dealt += damage;
      }
      this.damage += dealt;
      this.activations += 1;
      prop.charges += 1;
      prop.cooldown = prop.definition.cooldown;
      context.spawnAttackEffect?.(prop.sprite.position, prop.definition.source, targets[0]?.group?.position);
      this.interestPoints.push({ position: prop.sprite.position, weight: .48, type: prop.definition.id });
    }
    if (context.playerPosition) this.findNearest(context.playerPosition);
    return this.nearest;
  }

  clear() {
    if (this.root?.parent) this.root.parent.remove(this.root);
    this.props.forEach((prop) => {
      prop.sprite?.material?.map?.dispose?.();
      prop.sprite?.material?.dispose?.();
    });
    this.props.length = 0;
    this.interestPoints.length = 0;
    this.nearest = null;
    this.root = null;
  }

  get diagnostics() {
    return Object.freeze({
      version: BATTLEFIELD_PROP_VERSION,
      active: this.props.length,
      interactable: this.props.filter((prop) => prop.definition.kind === 'interact').length,
      automated: this.props.filter((prop) => prop.definition.kind === 'auto').length,
      ready: this.props.filter((prop) => prop.ready && prop.cooldown <= 0).length,
      activations: this.activations,
      damage: Math.round(this.damage),
      gold: this.gold,
      healing: this.healing,
      soul: this.soul,
      nearest: this.nearest ? this.nearest.definition.id : ''
    });
  }
}
