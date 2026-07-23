export const ELEMENTAL_REACTION_SYSTEM_VERSION = '1.0.0';

export const ELEMENTAL_REACTIONS = Object.freeze({
  steamBurst: Object.freeze({ id: 'steamBurst', icon: '♨', label: '증기 폭발', pair: ['burn', 'frost'], damageMultiplier: .42, consume: ['burn', 'frost'], momentum: 13, color: 0xb9f4ff }),
  wildfire: Object.freeze({ id: 'wildfire', icon: '✹', label: '화염 회오리', pair: ['burn', 'mark'], damageMultiplier: .34, consume: ['mark'], momentum: 10, color: 0xffa54f }),
  magmaFracture: Object.freeze({ id: 'magmaFracture', icon: '◈', label: '용암 균열', pair: ['burn', 'fracture'], damageMultiplier: .5, consume: ['fracture'], momentum: 15, color: 0xff694f }),
  spiritFlare: Object.freeze({ id: 'spiritFlare', icon: '✺', label: '혼불 폭주', pair: ['burn', 'resonance'], damageMultiplier: .46, consume: ['resonance'], momentum: 14, color: 0xffd070 }),
  thermalShock: Object.freeze({ id: 'thermalShock', icon: 'ϟ', label: '열충격', pair: ['burn', 'shock'], damageMultiplier: .48, consume: ['shock'], momentum: 15, color: 0xffe06f }),
  iceGale: Object.freeze({ id: 'iceGale', icon: '❈', label: '빙풍 절단', pair: ['frost', 'mark'], damageMultiplier: .3, consume: ['mark'], momentum: 9, color: 0x9fefff }),
  crystalBreak: Object.freeze({ id: 'crystalBreak', icon: '◇', label: '빙정 파쇄', pair: ['frost', 'fracture'], damageMultiplier: .55, consume: ['frost', 'fracture'], momentum: 16, color: 0xa7dfff }),
  superconduct: Object.freeze({ id: 'superconduct', icon: '⚡', label: '초전도', pair: ['frost', 'shock'], damageMultiplier: .44, consume: ['shock'], momentum: 14, color: 0xd6fbff }),
  echoRift: Object.freeze({ id: 'echoRift', icon: '✦', label: '공명 균열', pair: ['fracture', 'resonance'], damageMultiplier: .52, consume: ['resonance'], momentum: 16, color: 0xc29cff }),
  thunderGale: Object.freeze({ id: 'thunderGale', icon: '↯', label: '뇌풍 연쇄', pair: ['mark', 'shock'], damageMultiplier: .4, consume: ['mark'], momentum: 12, color: 0x7eefff })
});

const REACTION_LIST = Object.freeze(Object.values(ELEMENTAL_REACTIONS));
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

export class ElementalReactionSystem {
  constructor() {
    this.triggered = 0;
    this.damage = 0;
    this.byReaction = {};
    this.lastReaction = null;
  }

  resolve(target, incomingType, baseDamage, { boss = false } = {}) {
    if (!target?.statusEffects?.size || !incomingType) return null;
    const active = new Set(target.statusEffects.keys());
    const reaction = REACTION_LIST.find((entry) => entry.pair.includes(incomingType) && entry.pair.some((type) => type !== incomingType && active.has(type)));
    if (!reaction) return null;
    const stackPower = reaction.pair.reduce((sum, type) => sum + Number(target.statusEffects.get(type)?.stacks || 0), 0);
    const bossScale = boss ? .72 : 1;
    const bonusDamage = Math.max(1, Number(baseDamage || 0) * reaction.damageMultiplier * bossScale * clamp(1 + stackPower * .08, 1, 1.4));
    reaction.consume.forEach((type) => target.statusEffects.delete(type));
    this.triggered += 1;
    this.damage += bonusDamage;
    this.byReaction[reaction.id] = (this.byReaction[reaction.id] || 0) + 1;
    this.lastReaction = Object.freeze({ id: reaction.id, label: reaction.label, icon: reaction.icon, bonusDamage: Math.round(bonusDamage), at: Date.now() });
    return Object.freeze({ ...reaction, bonusDamage, stackPower });
  }

  get diagnostics() {
    return Object.freeze({
      version: ELEMENTAL_REACTION_SYSTEM_VERSION,
      triggered: this.triggered,
      damage: Math.round(this.damage),
      byReaction: { ...this.byReaction },
      lastReaction: this.lastReaction
    });
  }
}

export default ElementalReactionSystem;
