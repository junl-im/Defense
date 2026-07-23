export const WAVE_RELIABILITY_VERSION = '18.0.0';
export const WAVE_CHECKPOINT_KEY = 'dokkaebi-wave-checkpoint-v18';

const REWARD_STATES = new Set(['blessing', 'relic', 'contract', 'choice']);
const round = (value, digits = 2) => {
  const factor = 10 ** digits;
  return Math.round((Number(value) || 0) * factor) / factor;
};
const finite = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;

function compactSnapshot(snapshot = {}) {
  return Object.freeze({
    state: String(snapshot.state || ''),
    waveActive: Boolean(snapshot.waveActive),
    currentWave: finite(snapshot.currentWave),
    maxWaves: finite(snapshot.maxWaves, 10),
    spawnRemaining: finite(snapshot.spawnRemaining),
    waveSpawned: finite(snapshot.waveSpawned),
    enemyCount: finite(snapshot.enemyCount),
    enemyHealthSignature: finite(snapshot.enemyHealthSignature),
    enemyRadiusSignature: finite(snapshot.enemyRadiusSignature),
    invalidEnemyCount: finite(snapshot.invalidEnemyCount),
    postWaveQueueLength: finite(snapshot.postWaveQueueLength),
    autoWaveCountdown: round(snapshot.autoWaveCountdown, 1),
    modalVisible: Boolean(snapshot.modalVisible),
    coreHp: round(snapshot.coreHp),
    score: Math.round(finite(snapshot.score)),
    gold: Math.round(finite(snapshot.gold))
  });
}

function stateKey(snapshot = {}) {
  const view = compactSnapshot(snapshot);
  return [
    view.state,
    view.waveActive ? 1 : 0,
    view.currentWave,
    view.spawnRemaining,
    view.waveSpawned,
    view.enemyCount,
    Math.round(view.enemyHealthSignature),
    Math.round(view.enemyRadiusSignature),
    view.invalidEnemyCount,
    view.postWaveQueueLength,
    view.autoWaveCountdown,
    view.modalVisible ? 1 : 0
  ].join('|');
}

export default class WaveReliabilityDirector {
  constructor({
    enemyStallSeconds = 16,
    rewardReminderSeconds = 18,
    rewardQueueStallSeconds = 4,
    firstWaveStallSeconds = 8,
    checkpointSeconds = 3,
    maxEvents = 180,
    storage = globalThis.localStorage
  } = {}) {
    this.enemyStallSeconds = enemyStallSeconds;
    this.rewardReminderSeconds = rewardReminderSeconds;
    this.rewardQueueStallSeconds = rewardQueueStallSeconds;
    this.firstWaveStallSeconds = firstWaveStallSeconds;
    this.checkpointSeconds = checkpointSeconds;
    this.maxEvents = maxEvents;
    this.storage = storage;
    this.resetRun();
  }

  resetRun(meta = {}) {
    this.meta = Object.freeze({ ...meta });
    this.elapsed = 0;
    this.lastProgressAt = 0;
    this.lastCheckpointAt = -Infinity;
    this.lastKey = '';
    this.waveStartedAt = 0;
    this.waveDurations = {};
    this.events = [];
    this.recoveries = 0;
    this.enemySweeps = 0;
    this.rewardReminders = 0;
    this.rewardQueueResumes = 0;
    this.firstWaveResumes = 0;
    this.backgroundPauses = 0;
    this.backgroundResumes = 0;
    this.backgroundSeconds = 0;
    this.hiddenAtMs = 0;
    this.autoPaused = false;
    this.lastRecovery = '';
    this.lastCheckpoint = null;
    this.lastRewardReminderKey = '';
    this.lastEnemySweepAt = -Infinity;
    this.record('run-reset', {}, meta);
  }

  beginWave(wave, snapshot = {}) {
    this.waveStartedAt = this.elapsed;
    this.lastProgressAt = this.elapsed;
    this.lastKey = stateKey(snapshot);
    this.lastRewardReminderKey = '';
    this.record('wave-start', snapshot, { wave: finite(wave) });
    this.writeCheckpoint(snapshot, 'wave-start', true);
  }

  completeWave(wave, snapshot = {}) {
    const duration = Math.max(0, this.elapsed - this.waveStartedAt);
    this.waveDurations[String(finite(wave))] = round(duration, 2);
    this.lastProgressAt = this.elapsed;
    this.lastKey = stateKey(snapshot);
    this.record('wave-complete', snapshot, { wave: finite(wave), duration: round(duration, 2) });
    this.writeCheckpoint(snapshot, 'wave-complete', true);
  }

  noteProgress(snapshot = {}, reason = 'progress') {
    const key = stateKey(snapshot);
    const stateChanged = key !== this.lastKey;
    this.lastKey = key;
    this.lastProgressAt = this.elapsed;
    if (stateChanged || reason !== 'frame-progress') this.record(reason, snapshot);
    this.writeCheckpoint(snapshot, reason, false);
  }

  noteRecovery(type, snapshot = {}, detail = {}) {
    this.recoveries += 1;
    this.lastRecovery = String(type || 'recovery');
    if (type === 'unstick-enemies') this.enemySweeps += 1;
    if (type === 'reward-reminder') this.rewardReminders += 1;
    if (type === 'resume-reward-queue') this.rewardQueueResumes += 1;
    if (type === 'resume-first-wave') this.firstWaveResumes += 1;
    this.lastProgressAt = this.elapsed;
    this.record(`recovery:${type}`, snapshot, detail);
    this.writeCheckpoint(snapshot, `recovery:${type}`, true);
  }

  noteVisibility(hidden, snapshot = {}, nowMs = Date.now()) {
    if (hidden) {
      this.hiddenAtMs = nowMs;
      this.autoPaused = snapshot.state === 'playing';
      if (this.autoPaused) this.backgroundPauses += 1;
      this.record('visibility:hidden', snapshot, { autoPaused: this.autoPaused });
      this.writeCheckpoint(snapshot, 'visibility:hidden', true);
      return Object.freeze({ hidden: true, autoPaused: this.autoPaused, durationSeconds: 0 });
    }
    const durationSeconds = this.hiddenAtMs > 0 ? Math.max(0, (nowMs - this.hiddenAtMs) / 1000) : 0;
    this.hiddenAtMs = 0;
    this.backgroundSeconds += durationSeconds;
    if (this.autoPaused) this.backgroundResumes += 1;
    const autoPaused = this.autoPaused;
    this.autoPaused = false;
    this.lastProgressAt = this.elapsed;
    this.record('visibility:visible', snapshot, { autoPaused, durationSeconds: round(durationSeconds, 2) });
    return Object.freeze({ hidden: false, autoPaused, durationSeconds });
  }

  update(dt, snapshot = {}) {
    this.elapsed += Math.max(0, finite(dt));
    const key = stateKey(snapshot);
    if (key !== this.lastKey) {
      const previous = this.lastKey;
      this.lastKey = key;
      this.lastProgressAt = this.elapsed;
      this.record('state-progress', snapshot, { previous });
      this.writeCheckpoint(snapshot, 'state-progress', false);
      return null;
    }

    this.writeCheckpoint(snapshot, 'heartbeat', false);
    const stalledFor = this.elapsed - this.lastProgressAt;
    const state = String(snapshot.state || '');

    if (snapshot.waveActive && finite(snapshot.invalidEnemyCount) > 0) {
      return Object.freeze({ type: 'unstick-enemies', reason: 'invalid-enemy', stalledFor });
    }

    if (snapshot.waveActive
      && finite(snapshot.spawnRemaining) <= 0
      && finite(snapshot.enemyCount) > 0
      && stalledFor >= this.enemyStallSeconds
      && this.elapsed - this.lastEnemySweepAt >= 6) {
      this.lastEnemySweepAt = this.elapsed;
      return Object.freeze({ type: 'unstick-enemies', reason: 'enemy-progress-stall', stalledFor });
    }

    if (REWARD_STATES.has(state)
      && snapshot.modalVisible
      && stalledFor >= this.rewardReminderSeconds) {
      const reminderKey = `${state}:${finite(snapshot.currentWave)}`;
      if (this.lastRewardReminderKey !== reminderKey) {
        this.lastRewardReminderKey = reminderKey;
        return Object.freeze({ type: 'reward-reminder', state, stalledFor });
      }
    }

    if (state === 'playing'
      && !snapshot.waveActive
      && finite(snapshot.postWaveQueueLength) > 0
      && !snapshot.modalVisible
      && stalledFor >= this.rewardQueueStallSeconds) {
      return Object.freeze({ type: 'resume-reward-queue', stalledFor });
    }

    if (state === 'playing'
      && !snapshot.waveActive
      && finite(snapshot.currentWave) === 0
      && finite(snapshot.autoWaveCountdown) <= 0
      && stalledFor >= this.firstWaveStallSeconds) {
      return Object.freeze({ type: 'resume-first-wave', stalledFor });
    }

    return null;
  }

  record(type, snapshot = {}, detail = {}) {
    const event = Object.freeze({
      at: new Date().toISOString(),
      elapsed: round(this.elapsed, 2),
      type: String(type || 'event'),
      wave: finite(snapshot.currentWave),
      state: String(snapshot.state || ''),
      detail: Object.freeze({ ...detail })
    });
    this.events.push(event);
    if (this.events.length > this.maxEvents) this.events.splice(0, this.events.length - this.maxEvents);
    return event;
  }

  writeCheckpoint(snapshot = {}, reason = 'heartbeat', force = false) {
    if (!this.storage?.setItem) return false;
    if (!force && this.elapsed - this.lastCheckpointAt < this.checkpointSeconds) return false;
    this.lastCheckpointAt = this.elapsed;
    const payload = Object.freeze({
      version: WAVE_RELIABILITY_VERSION,
      savedAt: new Date().toISOString(),
      reason,
      meta: this.meta,
      snapshot: compactSnapshot(snapshot),
      recoveries: this.recoveries,
      lastRecovery: this.lastRecovery
    });
    this.lastCheckpoint = payload;
    try {
      this.storage.setItem(WAVE_CHECKPOINT_KEY, JSON.stringify(payload));
      return true;
    } catch {
      return false;
    }
  }

  readPreviousCheckpoint() {
    if (!this.storage?.getItem) return null;
    try {
      const value = JSON.parse(this.storage.getItem(WAVE_CHECKPOINT_KEY) || 'null');
      return value && typeof value === 'object' ? value : null;
    } catch {
      return null;
    }
  }

  get report() {
    return Object.freeze({
      version: WAVE_RELIABILITY_VERSION,
      meta: this.meta,
      elapsed: round(this.elapsed, 2),
      recoveries: this.recoveries,
      enemySweeps: this.enemySweeps,
      rewardReminders: this.rewardReminders,
      rewardQueueResumes: this.rewardQueueResumes,
      firstWaveResumes: this.firstWaveResumes,
      backgroundPauses: this.backgroundPauses,
      backgroundResumes: this.backgroundResumes,
      backgroundSeconds: round(this.backgroundSeconds, 2),
      waveDurations: Object.freeze({ ...this.waveDurations }),
      lastRecovery: this.lastRecovery,
      lastCheckpoint: this.lastCheckpoint,
      events: Object.freeze([...this.events])
    });
  }

  get diagnostics() {
    const previous = this.readPreviousCheckpoint();
    return Object.freeze({
      version: WAVE_RELIABILITY_VERSION,
      recoveries: this.recoveries,
      enemySweeps: this.enemySweeps,
      rewardReminders: this.rewardReminders,
      rewardQueueResumes: this.rewardQueueResumes,
      firstWaveResumes: this.firstWaveResumes,
      backgroundPauses: this.backgroundPauses,
      backgroundResumes: this.backgroundResumes,
      backgroundSeconds: round(this.backgroundSeconds, 2),
      completedWaves: Object.keys(this.waveDurations).length,
      lastRecovery: this.lastRecovery,
      eventCount: this.events.length,
      previousCheckpointWave: finite(previous?.snapshot?.currentWave),
      previousCheckpointState: String(previous?.snapshot?.state || '')
    });
  }
}
