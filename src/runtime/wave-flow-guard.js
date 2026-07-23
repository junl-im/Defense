export const WAVE_FLOW_GUARD_VERSION = '17.0.0';

const REWARD_STATES = new Set(['blessing', 'relic', 'contract', 'choice']);

function number(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export default class WaveFlowGuard {
  constructor({ spawnStallSeconds = 5.5, rewardRestoreSeconds = 0.8, idleResumeSeconds = 12 } = {}) {
    this.spawnStallSeconds = spawnStallSeconds;
    this.rewardRestoreSeconds = rewardRestoreSeconds;
    this.idleResumeSeconds = idleResumeSeconds;
    this.reset();
  }

  reset() {
    this.wave = 0;
    this.elapsed = 0;
    this.lastProgressAt = 0;
    this.lastKey = '';
    this.spawnFailures = 0;
    this.recoveries = 0;
    this.modalRestores = 0;
    this.forcedSpawns = 0;
    this.forcedCompletions = 0;
    this.idleResumes = 0;
    this.lastRecovery = '';
    this.lastError = '';
  }

  beginWave(wave, snapshot = {}) {
    this.wave = number(wave);
    this.elapsed = 0;
    this.lastProgressAt = 0;
    this.lastKey = this.makeKey(snapshot);
    this.spawnFailures = 0;
    this.lastRecovery = '';
  }

  makeKey(snapshot = {}) {
    return [
      snapshot.state || '',
      snapshot.waveActive ? 1 : 0,
      number(snapshot.currentWave),
      number(snapshot.spawnRemaining),
      number(snapshot.waveSpawned),
      number(snapshot.enemyCount),
      number(snapshot.postWaveQueueLength),
      number(snapshot.autoWaveCountdown).toFixed(1),
      snapshot.modalVisible ? 1 : 0
    ].join('|');
  }

  noteProgress(snapshot = {}, reason = 'progress') {
    this.lastKey = this.makeKey(snapshot);
    this.lastProgressAt = this.elapsed;
    this.spawnFailures = 0;
    this.lastRecovery = reason;
  }

  recordSpawnFailure(error = '') {
    this.spawnFailures += 1;
    this.lastError = String(error || 'spawn-failed').slice(0, 180);
  }

  recordRecovery(type) {
    this.recoveries += 1;
    this.lastRecovery = type;
    if (type === 'restore-modal') this.modalRestores += 1;
    if (type === 'force-spawn') this.forcedSpawns += 1;
    if (type === 'complete-wave') this.forcedCompletions += 1;
    if (type === 'resume-countdown') this.idleResumes += 1;
    this.lastProgressAt = this.elapsed;
  }

  update(dt, snapshot = {}) {
    this.elapsed += Math.max(0, number(dt));
    const key = this.makeKey(snapshot);
    if (key !== this.lastKey) {
      this.lastKey = key;
      this.lastProgressAt = this.elapsed;
      this.spawnFailures = 0;
      return null;
    }

    const stalledFor = this.elapsed - this.lastProgressAt;
    const state = snapshot.state || '';

    if (REWARD_STATES.has(state) && !snapshot.modalVisible && stalledFor >= this.rewardRestoreSeconds) {
      this.recordRecovery('restore-modal');
      return { type: 'restore-modal', state };
    }

    if (snapshot.waveActive) {
      if (number(snapshot.spawnRemaining) > 0 && stalledFor >= this.spawnStallSeconds) {
        const cap = Math.max(1, number(snapshot.enemyCap, 30));
        if (number(snapshot.enemyCount) < cap || this.spawnFailures > 0) {
          this.recordRecovery('force-spawn');
          return { type: 'force-spawn', failures: this.spawnFailures };
        }
      }
      if (number(snapshot.spawnRemaining) <= 0 && number(snapshot.enemyCount) <= 0 && stalledFor >= 0.75) {
        this.recordRecovery('complete-wave');
        return { type: 'complete-wave' };
      }
      return null;
    }

    if (state === 'playing'
      && number(snapshot.currentWave) > 0
      && number(snapshot.currentWave) < number(snapshot.maxWaves, 10)
      && number(snapshot.autoWaveCountdown) <= 0
      && number(snapshot.postWaveQueueLength) <= 0
      && stalledFor >= this.idleResumeSeconds) {
      this.recordRecovery('resume-countdown');
      return { type: 'resume-countdown' };
    }

    return null;
  }

  get diagnostics() {
    return Object.freeze({
      version: WAVE_FLOW_GUARD_VERSION,
      wave: this.wave,
      spawnFailures: this.spawnFailures,
      recoveries: this.recoveries,
      modalRestores: this.modalRestores,
      forcedSpawns: this.forcedSpawns,
      forcedCompletions: this.forcedCompletions,
      idleResumes: this.idleResumes,
      lastRecovery: this.lastRecovery,
      lastError: this.lastError
    });
  }
}
