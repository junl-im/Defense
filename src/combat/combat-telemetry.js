export const COMBAT_TELEMETRY_VERSION = '2.0.0';

export class CombatTelemetry {
  constructor() {
    this.resetRun();
  }

  resetRun() {
    this.runStartedAt = performance.now();
    this.waveStartedAt = 0;
    this.currentWave = 0;
    this.waveHistory = [];
    this.damageDealt = 0;
    this.damageBySource = {};
    this.statusApplications = {};
    this.kills = 0;
    this.bossKills = 0;
    this.droppedSpawns = 0;
    this.reactions = {};
    this.reactionDamage = 0;
    this.overdrives = 0;
    this.bossEnrages = 0;
  }

  startWave(wave, plan) {
    this.currentWave = wave;
    this.waveStartedAt = performance.now();
    this.activePlan = plan || null;
  }

  recordDamage(source, amount) {
    const value = Math.max(0, Number(amount) || 0);
    this.damageDealt += value;
    const key = source || 'unknown';
    this.damageBySource[key] = (this.damageBySource[key] || 0) + value;
  }

  recordStatus(type) {
    if (!type) return;
    this.statusApplications[type] = (this.statusApplications[type] || 0) + 1;
  }

  recordReaction(id, damage = 0) {
    if (!id) return;
    this.reactions[id] = (this.reactions[id] || 0) + 1;
    this.reactionDamage += Math.max(0, Number(damage) || 0);
  }

  recordOverdrive() {
    this.overdrives += 1;
  }

  recordBossEnrage() {
    this.bossEnrages += 1;
  }

  recordKill({ boss = false } = {}) {
    this.kills += 1;
    if (boss) this.bossKills += 1;
  }

  recordDroppedSpawn() {
    this.droppedSpawns += 1;
  }

  endWave({ wave, perfect, coreHpRatio, planResult } = {}) {
    const clearSeconds = this.waveStartedAt ? Math.max(0, (performance.now() - this.waveStartedAt) / 1000) : 0;
    const entry = Object.freeze({
      wave: wave || this.currentWave,
      perfect: Boolean(perfect),
      clearSeconds: Number(clearSeconds.toFixed(2)),
      coreHpRatio: Number((coreHpRatio || 0).toFixed(3)),
      mutatorId: this.activePlan?.mutatorId || planResult?.mutatorId || 'none',
      spawned: planResult?.spawned || 0,
      killed: planResult?.killed || 0
    });
    this.waveHistory.push(entry);
    if (this.waveHistory.length > 20) this.waveHistory.shift();
    return entry;
  }

  get snapshot() {
    return Object.freeze({
      version: COMBAT_TELEMETRY_VERSION,
      runSeconds: Number(((performance.now() - this.runStartedAt) / 1000).toFixed(1)),
      currentWave: this.currentWave,
      damageDealt: Math.round(this.damageDealt),
      damageBySource: { ...this.damageBySource },
      statusApplications: { ...this.statusApplications },
      kills: this.kills,
      bossKills: this.bossKills,
      droppedSpawns: this.droppedSpawns,
      reactions: { ...this.reactions },
      reactionDamage: Math.round(this.reactionDamage),
      overdrives: this.overdrives,
      bossEnrages: this.bossEnrages,
      waveHistory: [...this.waveHistory]
    });
  }
}

export default CombatTelemetry;
