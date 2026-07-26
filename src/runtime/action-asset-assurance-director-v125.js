export const ACTION_ASSET_ASSURANCE_V125_ID = 'DD-ACTION-ASSET-ASSURANCE-V125';

export const ACTION_ASSET_POLICY_V125 = Object.freeze({
  version: '1.0.25',
  build: 'b24.25',
  directions: 11,
  states: Object.freeze(['idle', 'move', 'attack', 'skill', 'hit', 'death']),
  viewportProfiles: Object.freeze([
    Object.freeze({ id: 'mobile-portrait', maxWidth: 720, portrait: true }),
    Object.freeze({ id: 'mobile-landscape', maxWidth: 960, portrait: false }),
    Object.freeze({ id: 'desktop-compact', maxWidth: 1440, portrait: false }),
    Object.freeze({ id: 'desktop-wide', maxWidth: Infinity, portrait: false })
  ]),
  approval: Object.freeze({
    protagonistDirectionArt: 'approved',
    protagonistActionRuntime: 'approved',
    protagonistActionArt: 'derived-provisional',
    bombImpDirectionalArt: 'replacement-pending',
    bombImpRuntime: 'quarantined'
  }),
  lifecycle: Object.freeze({ waveTarget: 10, sampleLimit: 24, residualRecordTolerance: 8, residualParticleTolerance: 36 })
});

const visible = (node) => Boolean(node && !node.classList?.contains('hidden') && node.getClientRects?.().length);
const overlapArea = (a, b, tolerance = 0) => {
  if (!a || !b) return 0;
  const width = Math.min(a.right, b.right) - Math.max(a.left, b.left) - tolerance;
  const height = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) - tolerance;
  return width > 0 && height > 0 ? width * height : 0;
};
const finite = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;

function viewportProfile() {
  if (typeof window === 'undefined') return 'server';
  const width = Math.max(1, window.visualViewport?.width || window.innerWidth || 1);
  const height = Math.max(1, window.visualViewport?.height || window.innerHeight || 1);
  if (height >= width && width <= 720) return 'mobile-portrait';
  if (height < width && width <= 960) return 'mobile-landscape';
  if (width <= 1440) return 'desktop-compact';
  return 'desktop-wide';
}

function emptyCoverage() {
  return Object.fromEntries(ACTION_ASSET_POLICY_V125.states.map((state) => [state, Array.from({ length: ACTION_ASSET_POLICY_V125.directions }, () => 0)]));
}

export default class ActionAssetAssuranceDirectorV125 {
  constructor({ combatVisual = null, hud = null, bossHealth = null, resultModal = null, collectionModal = null } = {}) {
    this.combatVisual = combatVisual;
    this.hud = hud;
    this.bossHealth = bossHealth;
    this.resultModal = resultModal;
    this.collectionModal = collectionModal;
    this.elapsed = 0;
    this.layoutElapsed = 0;
    this.lastWave = 0;
    this.waveSamples = [];
    this.profileChecks = Object.fromEntries(ACTION_ASSET_POLICY_V125.viewportProfiles.map((profile) => [profile.id, 0]));
    this.profileCollisions = Object.fromEntries(ACTION_ASSET_POLICY_V125.viewportProfiles.map((profile) => [profile.id, 0]));
    this.peakParticles = 0;
    this.peakProjectiles = 0;
    this.peakVisualRecords = 0;
    this.peakEchoes = 0;
    this.lowResidualSamples = 0;
    this.layoutChecks = 0;
    this.collisionRecoveries = 0;
    this.lastCollision = false;
    this.lastCoverage = emptyCoverage();
    this.report = Object.freeze({
      id: ACTION_ASSET_ASSURANCE_V125_ID,
      version: ACTION_ASSET_POLICY_V125.version,
      build: ACTION_ASSET_POLICY_V125.build,
      viewportProfile: viewportProfile(),
      protagonistDirectionsObserved: 0,
      protagonistStatesObserved: 0,
      protagonistCoverageCells: 0,
      actionTransitions: 0,
      actionLocksApplied: 0,
      waveSamples: 0,
      tenWaveTargetReached: false,
      lifecycleHealthy: true,
      collisionActive: false,
      bombImpRuntime: ACTION_ASSET_POLICY_V125.approval.bombImpRuntime
    });
    this.resizeHandler = () => this.measureLayout(true);
  }

  install() {
    if (typeof document === 'undefined') return this.report;
    document.documentElement.dataset.ddActionAssetV125 = 'ready';
    document.body.classList.add('action-asset-assurance-v125');
    this.resultModal?.classList?.add('result-modal-v125');
    this.collectionModal?.classList?.add('collection-modal-v125');
    window.addEventListener('resize', this.resizeHandler, { passive: true });
    window.visualViewport?.addEventListener?.('resize', this.resizeHandler, { passive: true });
    this.measureLayout(true);
    window.__DOKKAEBI_ACTION_ASSET_ASSURANCE_V125__ = this.report;
    return this.report;
  }

  measureLayout(force = false) {
    if (typeof document === 'undefined') return { collision: false, profile: 'server' };
    const profile = viewportProfile();
    const hudRect = visible(this.hud) ? this.hud.getBoundingClientRect() : null;
    const bossRect = visible(this.bossHealth) ? this.bossHealth.getBoundingClientRect() : null;
    const floating = ['#luck-meter', '#synergy-panel', '#unit-strip', '#moon-omen', '#run-seed-chip', '#stage-chip', '#council-chip', '#wave-trial']
      .map((selector) => document.querySelector(selector)).filter(visible);
    let collision = overlapArea(hudRect, bossRect, 2) > 0;
    if (bossRect) collision ||= floating.some((node) => overlapArea(bossRect, node.getBoundingClientRect(), 2) > 0);
    const root = document.documentElement;
    root.dataset.v125Viewport = profile;
    document.body.classList.toggle('hud-collision-guard-v125', collision);
    this.layoutChecks += 1;
    this.profileChecks[profile] = (this.profileChecks[profile] || 0) + 1;
    if (collision) this.profileCollisions[profile] = (this.profileCollisions[profile] || 0) + 1;
    if (this.lastCollision && !collision) this.collisionRecoveries += 1;
    this.lastCollision = collision;
    return { collision, profile, force };
  }

  sampleWave(snapshot, diagnostics) {
    const wave = Math.max(0, Math.floor(finite(snapshot.wave, 0)));
    if (!wave || wave === this.lastWave) return;
    this.lastWave = wave;
    const sample = Object.freeze({
      wave,
      visualRecords: Math.max(0, Math.floor(finite(diagnostics.activeRecords, 0))),
      echoes: Math.max(0, Math.floor(finite(diagnostics.echoesV125, 0))),
      enemies: Math.max(0, Math.floor(finite(snapshot.enemies, 0))),
      units: Math.max(0, Math.floor(finite(snapshot.units, 0))),
      particles: Math.max(0, Math.floor(finite(snapshot.particles, 0))),
      projectiles: Math.max(0, Math.floor(finite(snapshot.projectiles, 0))),
      releasedRecords: Math.max(0, Math.floor(finite(diagnostics.releasedRecordsV125, 0)))
    });
    this.waveSamples.push(sample);
    if (this.waveSamples.length > ACTION_ASSET_POLICY_V125.lifecycle.sampleLimit) this.waveSamples.shift();
    const residualRecords = Math.max(0, sample.visualRecords - sample.enemies - sample.units - 2);
    if (residualRecords <= ACTION_ASSET_POLICY_V125.lifecycle.residualRecordTolerance
      && sample.particles <= ACTION_ASSET_POLICY_V125.lifecycle.residualParticleTolerance + sample.enemies * 3) this.lowResidualSamples += 1;
  }

  readCoverage(diagnostics) {
    const coverage = diagnostics.protagonistDirectionStateCoverageV125 || emptyCoverage();
    this.lastCoverage = coverage;
    let cells = 0;
    let directions = new Set();
    let states = 0;
    for (const state of ACTION_ASSET_POLICY_V125.states) {
      const row = Array.isArray(coverage[state]) ? coverage[state] : [];
      const observed = row.some((value) => finite(value, 0) > 0);
      if (observed) states += 1;
      row.forEach((value, index) => {
        if (finite(value, 0) > 0) {
          cells += 1;
          directions.add(index);
        }
      });
    }
    return { cells, directions: directions.size, states };
  }

  update(dt, snapshot = {}) {
    const delta = Math.max(0, finite(dt, 0));
    this.elapsed += delta;
    this.layoutElapsed += delta;
    if (this.layoutElapsed >= .5) {
      this.layoutElapsed = 0;
      this.measureLayout(false);
    }
    const diagnostics = this.combatVisual?.diagnostics || {};
    this.peakParticles = Math.max(this.peakParticles, finite(snapshot.particles, 0));
    this.peakProjectiles = Math.max(this.peakProjectiles, finite(snapshot.projectiles, 0));
    this.peakVisualRecords = Math.max(this.peakVisualRecords, finite(diagnostics.peakActiveRecordsV125, diagnostics.activeRecords));
    this.peakEchoes = Math.max(this.peakEchoes, finite(diagnostics.peakEchoesV125, diagnostics.echoesV125));
    this.sampleWave(snapshot, diagnostics);
    if (this.elapsed < .25) return this.report;
    this.elapsed = 0;

    const coverage = this.readCoverage(diagnostics);
    const tenWaveTargetReached = this.waveSamples.some((sample) => sample.wave >= ACTION_ASSET_POLICY_V125.lifecycle.waveTarget);
    const lifecycleHealthy = !this.waveSamples.length || this.lowResidualSamples >= Math.max(1, Math.floor(this.waveSamples.length * .5));
    const profile = viewportProfile();
    const resultVisible = visible(this.resultModal);
    const collectionVisible = visible(this.collectionModal);
    if (typeof document !== 'undefined') {
      document.body?.classList?.toggle('result-presentation-v125', resultVisible);
      document.body?.classList?.toggle('collection-presentation-v125', collectionVisible);
      document.body?.classList?.toggle('lifecycle-pressure-v125', !lifecycleHealthy);
    }

    this.report = Object.freeze({
      id: ACTION_ASSET_ASSURANCE_V125_ID,
      version: ACTION_ASSET_POLICY_V125.version,
      build: ACTION_ASSET_POLICY_V125.build,
      viewportProfile: profile,
      profileChecks: { ...this.profileChecks },
      profileCollisions: { ...this.profileCollisions },
      layoutChecks: this.layoutChecks,
      collisionActive: this.lastCollision,
      collisionRecoveries: this.collisionRecoveries,
      protagonistDirectionArt: ACTION_ASSET_POLICY_V125.approval.protagonistDirectionArt,
      protagonistActionRuntime: ACTION_ASSET_POLICY_V125.approval.protagonistActionRuntime,
      protagonistActionArt: ACTION_ASSET_POLICY_V125.approval.protagonistActionArt,
      protagonistDirectionsObserved: coverage.directions,
      protagonistStatesObserved: coverage.states,
      protagonistCoverageCells: coverage.cells,
      protagonistCoverageTarget: ACTION_ASSET_POLICY_V125.directions * ACTION_ASSET_POLICY_V125.states.length,
      actionTransitions: Math.max(0, Math.floor(finite(diagnostics.protagonistActionTransitionsV125, 0))),
      actionLocksApplied: Math.max(0, Math.floor(finite(diagnostics.protagonistActionLocksAppliedV125, 0))),
      actionStateRejects: Math.max(0, Math.floor(finite(diagnostics.protagonistActionStateRejectsV125, 0))),
      waveSamples: this.waveSamples.length,
      latestWave: this.lastWave,
      tenWaveTargetReached,
      lifecycleHealthy,
      lowResidualSamples: this.lowResidualSamples,
      peakParticles: this.peakParticles,
      peakProjectiles: this.peakProjectiles,
      peakVisualRecords: this.peakVisualRecords,
      peakEchoes: this.peakEchoes,
      activeVisualRecords: Math.max(0, Math.floor(finite(diagnostics.activeRecords, 0))),
      releasedVisualRecords: Math.max(0, Math.floor(finite(diagnostics.releasedRecordsV125, 0))),
      resultPresentationApproved: true,
      collectionPresentationApproved: true,
      bombImpDirectionalArt: ACTION_ASSET_POLICY_V125.approval.bombImpDirectionalArt,
      bombImpRuntime: ACTION_ASSET_POLICY_V125.approval.bombImpRuntime,
      runtimeCandidateCount: 0,
      quarantinedCandidateCount: 1
    });
    if (typeof window !== 'undefined') window.__DOKKAEBI_ACTION_ASSET_ASSURANCE_V125__ = this.report;
    return this.report;
  }

  dispose() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', this.resizeHandler);
      window.visualViewport?.removeEventListener?.('resize', this.resizeHandler);
      delete window.__DOKKAEBI_ACTION_ASSET_ASSURANCE_V125__;
    }
    if (typeof document !== 'undefined') document.body?.classList?.remove('action-asset-assurance-v125', 'hud-collision-guard-v125', 'result-presentation-v125', 'collection-presentation-v125', 'lifecycle-pressure-v125');
  }
}
