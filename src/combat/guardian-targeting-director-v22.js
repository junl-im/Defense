export const GUARDIAN_TARGETING_V22_VERSION = '22.0.0';

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

export default class GuardianTargetingDirectorV22 {
  constructor() {
    this.version = GUARDIAN_TARGETING_V22_VERSION;
    this.acquisitions = 0;
    this.stickyReuses = 0;
    this.extendedShots = 0;
    this.misses = 0;
    this.lastRange = 0;
    this.lastTargetType = '';
  }

  getAcquisitionRange(unit, baseRange, wave = 1) {
    const rankBonus = clamp((Number(unit?.rank) || 1) - 1, 0, 4) * 0.035;
    const waveBonus = clamp((Number(wave) || 1) - 1, 0, 12) * 0.018;
    return Math.min(18, baseRange * (1.24 + rankBonus + waveBonus));
  }

  isValidTarget(target, origin, range) {
    return Boolean(target && !target.dead && target.group?.position && target.group.position.distanceTo(origin) <= range);
  }

  select(unit, enemies, { baseRange, wave = 1, preferFarthest = false } = {}) {
    const origin = unit?.group?.position;
    if (!origin) return null;
    const range = this.getAcquisitionRange(unit, Number(baseRange) || 8, wave);
    this.lastRange = range;
    if (this.isValidTarget(unit.autoTarget, origin, range)) {
      this.stickyReuses += 1;
      const distance = unit.autoTarget.group.position.distanceTo(origin);
      return { target: unit.autoTarget, distance, range, extended: distance > baseRange, damageMultiplier: distance > baseRange ? 0.86 : 1 };
    }
    const candidates = enemies.filter((enemy) => this.isValidTarget(enemy, origin, range));
    if (!candidates.length) {
      unit.autoTarget = null;
      this.misses += 1;
      return null;
    }
    let best = null;
    let bestScore = -Infinity;
    for (const enemy of candidates) {
      const distance = enemy.group.position.distanceTo(origin);
      const coreDistance = Math.hypot(enemy.group.position.x, enemy.group.position.z);
      const threat = 1 - clamp(coreDistance / 34, 0, 1);
      const proximity = preferFarthest ? distance / range : 1 - distance / range;
      const score = threat * 6 + proximity * 1.5 + (enemy.boss ? 5 : 0) + (enemy.type === 'shaman' ? 1.6 : 0) + (enemy.elite ? 1.1 : 0) + clamp((enemy.maxHp || 1) / 900, 0, 1.4);
      if (score > bestScore) { best = enemy; bestScore = score; }
    }
    unit.autoTarget = best;
    this.acquisitions += 1;
    this.lastTargetType = best?.type || '';
    const distance = best.group.position.distanceTo(origin);
    return { target: best, distance, range, extended: distance > baseRange, damageMultiplier: distance > baseRange ? 0.86 : 1 };
  }

  noteShot(selection) {
    if (selection?.extended) this.extendedShots += 1;
  }

  get report() {
    return Object.freeze({
      version: this.version,
      acquisitions: this.acquisitions,
      stickyReuses: this.stickyReuses,
      extendedShots: this.extendedShots,
      misses: this.misses,
      lastRange: Number(this.lastRange.toFixed(2)),
      lastTargetType: this.lastTargetType
    });
  }
}
