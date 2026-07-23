import WaveFlowGuard from './wave-flow-guard.js';
import WaveReliabilityDirector from './wave-reliability-director.js';

const rewardQueueForWave = (wave) => {
  const queue = [];
  if ([2, 4, 5, 7, 9].includes(wave)) queue.push('relic');
  if (wave === 5 || wave === 8) queue.push('contract');
  if (wave % 3 === 0) queue.push('blessing');
  return queue;
};

export function simulateTenWaveReliability() {
  const storage = new Map();
  const storageAdapter = {
    getItem: (key) => storage.has(key) ? storage.get(key) : null,
    setItem: (key, value) => storage.set(key, String(value))
  };
  const guard = new WaveFlowGuard({ spawnStallSeconds: 1.2, rewardRestoreSeconds: .4, idleResumeSeconds: 1.2 });
  const reliability = new WaveReliabilityDirector({
    enemyStallSeconds: 1.4,
    rewardReminderSeconds: .8,
    rewardQueueStallSeconds: .5,
    firstWaveStallSeconds: .6,
    checkpointSeconds: .1,
    storage: storageAdapter
  });
  reliability.resetRun({ seed: 'v18-simulation', maxWaves: 10 });
  const timeline = [];
  const recoveries = [];
  let state = 'playing';
  let currentWave = 0;
  let waveActive = false;
  let spawnRemaining = 0;
  let waveSpawned = 0;
  let enemyCount = 0;
  let enemyHealthSignature = 0;
  let enemyRadiusSignature = 0;
  let invalidEnemyCount = 0;
  let postWaveQueue = [];
  let autoWaveCountdown = 0;
  let modalVisible = false;

  const snapshot = () => ({
    state,
    waveActive,
    currentWave,
    maxWaves: 10,
    spawnRemaining,
    waveSpawned,
    enemyCount,
    enemyHealthSignature,
    enemyRadiusSignature,
    invalidEnemyCount,
    postWaveQueueLength: postWaveQueue.length,
    autoWaveCountdown,
    modalVisible,
    coreHp: 100,
    score: currentWave * 1000,
    gold: 70 + currentWave * 20
  });

  const tick = (seconds) => {
    const flowAction = guard.update(seconds, snapshot());
    const reliabilityAction = reliability.update(seconds, snapshot());
    return reliabilityAction || flowAction;
  };

  const recover = (action) => {
    if (!action) return;
    recoveries.push({ wave: currentWave, ...action });
    if (action.type === 'restore-modal') modalVisible = true;
    if (action.type === 'force-spawn') {
      spawnRemaining = Math.max(0, spawnRemaining - 1);
      waveSpawned += 1;
      enemyCount += 1;
      enemyHealthSignature += 1000;
      enemyRadiusSignature += 140;
    }
    if (action.type === 'unstick-enemies') {
      invalidEnemyCount = 0;
      enemyRadiusSignature = Math.max(20, enemyRadiusSignature - 40);
    }
    if (action.type === 'resume-reward-queue') {
      state = postWaveQueue.shift() || 'playing';
      modalVisible = state !== 'playing';
    }
    if (action.type === 'resume-first-wave') autoWaveCountdown = 1;
    reliability.noteRecovery(action.type, snapshot(), { simulated: true });
    reliability.noteProgress(snapshot(), `simulation:${action.type}`);
  };

  recover(tick(.7));
  autoWaveCountdown = 0;

  for (let wave = 1; wave <= 10; wave += 1) {
    currentWave = wave;
    state = 'playing';
    waveActive = true;
    spawnRemaining = wave === 10 ? 1 : 4 + wave;
    waveSpawned = 0;
    enemyCount = 0;
    enemyHealthSignature = 0;
    enemyRadiusSignature = 0;
    invalidEnemyCount = 0;
    modalVisible = false;
    guard.beginWave(wave, snapshot());
    reliability.beginWave(wave, snapshot());

    if (wave === 4) recover(tick(1.3));

    while (spawnRemaining > 0) {
      spawnRemaining -= 1;
      waveSpawned += 1;
      enemyCount += 1;
      enemyHealthSignature += 1000;
      enemyRadiusSignature += 140;
      guard.noteProgress(snapshot(), 'spawn');
      reliability.noteProgress(snapshot(), 'spawn');
      tick(.08);
    }

    if (wave === 8) {
      invalidEnemyCount = 1;
      tick(.1);
      recover(tick(.01));
    }

    while (enemyCount > 0) {
      enemyCount -= 1;
      enemyHealthSignature = Math.max(0, enemyHealthSignature - 1000);
      enemyRadiusSignature = Math.max(0, enemyRadiusSignature - 140);
      reliability.noteProgress(snapshot(), 'kill');
      tick(.08);
    }

    waveActive = false;
    guard.noteProgress(snapshot(), 'wave-complete');
    reliability.completeWave(wave, snapshot());
    postWaveQueue = rewardQueueForWave(wave);

    while (postWaveQueue.length > 0) {
      state = 'playing';
      modalVisible = false;
      recover(tick(.6));
      if (state === 'playing') {
        state = postWaveQueue.shift();
        modalVisible = true;
      }
      if (wave === 3 && state === 'blessing') {
        modalVisible = false;
        recover(tick(.5));
      }
      recover(tick(.9));
      state = 'playing';
      modalVisible = false;
      reliability.noteProgress(snapshot(), 'reward-selected');
    }

    if (wave === 6) {
      reliability.noteVisibility(true, snapshot(), 1000);
      const visible = reliability.noteVisibility(false, snapshot(), 6100);
      if (visible.autoPaused) recoveries.push({ wave, type: 'background-resume', durationSeconds: visible.durationSeconds });
    }

    timeline.push({ wave, rewards: rewardQueueForWave(wave), checkpoint: reliability.lastCheckpoint?.reason || '' });
  }

  const rawReport = reliability.report;
  const report = Object.freeze({
    ...rawReport,
    lastCheckpoint: rawReport.lastCheckpoint
      ? Object.freeze({ ...rawReport.lastCheckpoint, savedAt: 'SIMULATED' })
      : null,
    events: Object.freeze((rawReport.events || []).map(({ at, ...event }) => Object.freeze(event)))
  });

  return Object.freeze({
    version: '18.0.0',
    passed: currentWave === 10 && Object.keys(reliability.waveDurations).length === 10,
    wavesCompleted: Object.keys(reliability.waveDurations).length,
    timeline: Object.freeze(timeline),
    recoveries: Object.freeze(recoveries),
    diagnostics: reliability.diagnostics,
    report
  });
}
