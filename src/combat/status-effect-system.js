export const STATUS_EFFECT_SYSTEM_VERSION = '1.0.0';

export const STATUS_EFFECTS = Object.freeze({
  burn: Object.freeze({ id: 'burn', icon: '🔥', label: '연소', duration: 3.2, tickInterval: .5, maxStacks: 3, speedMultiplier: 1, damageTakenMultiplier: 1 }),
  frost: Object.freeze({ id: 'frost', icon: '❄', label: '빙결', duration: 2.4, tickInterval: 0, maxStacks: 2, speedMultiplier: .78, damageTakenMultiplier: 1.04 }),
  mark: Object.freeze({ id: 'mark', icon: '➶', label: '풍인', duration: 3.4, tickInterval: 0, maxStacks: 3, speedMultiplier: .96, damageTakenMultiplier: 1.06 }),
  fracture: Object.freeze({ id: 'fracture', icon: '◆', label: '균열', duration: 3.8, tickInterval: 0, maxStacks: 2, speedMultiplier: .9, damageTakenMultiplier: 1.09 }),
  resonance: Object.freeze({ id: 'resonance', icon: '✦', label: '공명', duration: 3, tickInterval: .75, maxStacks: 3, speedMultiplier: .94, damageTakenMultiplier: 1.05 }),
  shock: Object.freeze({ id: 'shock', icon: 'ϟ', label: '감전', duration: 2.2, tickInterval: .7, maxStacks: 2, speedMultiplier: .9, damageTakenMultiplier: 1.08 })
});

export const STATUS_SOURCE_MAP = Object.freeze({
  ember: 'burn', frost: 'frost', wind: 'mark', stone: 'fracture', bell: 'resonance', thunder: 'shock',
  'ultimate-ember': 'burn', 'ultimate-frost': 'frost', 'ultimate-wind': 'mark', 'ultimate-stone': 'fracture', 'ultimate-bell': 'resonance', 'ultimate-thunder': 'shock'
});

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

export class StatusEffectSystem {
  constructor({ random = Math.random } = {}) {
    this.random = random;
    this.applied = 0;
    this.expired = 0;
    this.damageTicks = 0;
  }

  ensure(target) {
    if (!target.statusEffects) target.statusEffects = new Map();
    return target.statusEffects;
  }

  apply(target, type, { duration, potency = 1, source = '', chance = 1 } = {}) {
    const definition = STATUS_EFFECTS[type];
    if (!target || target.dead || !definition || this.random() > chance) return null;
    const effects = this.ensure(target);
    const existing = effects.get(type);
    const stacks = Math.min(definition.maxStacks, (existing?.stacks || 0) + 1);
    const state = {
      type,
      source,
      stacks,
      potency: clamp(Math.max(existing?.potency || 0, Number(potency) || 1), .2, 5),
      remaining: Math.max(existing?.remaining || 0, Number(duration) || definition.duration),
      tickRemaining: definition.tickInterval || 0
    };
    effects.set(type, state);
    this.applied += 1;
    return Object.freeze({ ...state, definition });
  }

  applyFromSource(target, source, amount = 0) {
    if (!source || String(source).startsWith('status-')) return null;
    const type = STATUS_SOURCE_MAP[source];
    if (!type) return null;
    const bossPenalty = target?.boss ? .72 : 1;
    const chanceByType = { burn: .72, frost: .88, mark: .78, fracture: .66, resonance: .72, shock: .62 };
    const chance = clamp((chanceByType[type] || .7) * bossPenalty, .25, .95);
    const potency = clamp((Number(amount) || 1) / Math.max(20, target?.maxHp * .08), .55, 1.85);
    return this.apply(target, type, { potency, source, chance });
  }

  update(target, dt, { onDamage } = {}) {
    const effects = target?.statusEffects;
    if (!effects?.size) return { speedMultiplier: 1, damageTakenMultiplier: 1, activeCount: 0 };
    let speedMultiplier = 1;
    let damageTakenMultiplier = 1;
    for (const [type, state] of [...effects.entries()]) {
      const definition = STATUS_EFFECTS[type];
      state.remaining -= dt;
      speedMultiplier *= Math.pow(definition.speedMultiplier, state.stacks);
      damageTakenMultiplier *= 1 + (definition.damageTakenMultiplier - 1) * state.stacks;
      if (definition.tickInterval > 0) {
        state.tickRemaining -= dt;
        if (state.tickRemaining <= 0) {
          state.tickRemaining += definition.tickInterval;
          const base = type === 'burn' ? 4.2 : type === 'shock' ? 3.2 : 2.4;
          const damage = base * state.stacks * state.potency;
          this.damageTicks += 1;
          onDamage?.(damage, `status-${type}`, state);
        }
      }
      if (state.remaining <= 0) {
        effects.delete(type);
        this.expired += 1;
      }
    }
    return {
      speedMultiplier: clamp(speedMultiplier, .45, 1),
      damageTakenMultiplier: clamp(damageTakenMultiplier, 1, 1.45),
      activeCount: effects.size
    };
  }

  damageTakenMultiplier(target) {
    const effects = target?.statusEffects;
    if (!effects?.size) return 1;
    let multiplier = 1;
    for (const [type, state] of effects.entries()) {
      const definition = STATUS_EFFECTS[type];
      multiplier *= 1 + (definition.damageTakenMultiplier - 1) * state.stacks;
    }
    return clamp(multiplier, 1, 1.45);
  }

  clear(target) {
    target?.statusEffects?.clear?.();
  }

  get diagnostics() {
    return Object.freeze({ version: STATUS_EFFECT_SYSTEM_VERSION, applied: this.applied, expired: this.expired, damageTicks: this.damageTicks });
  }
}

export default StatusEffectSystem;
