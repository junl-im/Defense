export const BOSS_ENCOUNTER_ASSURANCE_V126_ID = 'DD-BOSS-ENCOUNTER-ASSURANCE-V126';

export const BOSS_ENCOUNTER_POLICY_V126 = Object.freeze({
  version: '1.0.26',
  build: 'b24.26',
  waveTarget: 20,
  damageTrailHold: .32,
  damageTrailCatchup: 1.7,
  warningPressureThreshold: 7,
  criticalWarningTime: .55,
  lifecycleSampleLimit: 28,
  approval: Object.freeze({
    bossHudRuntime: 'approved',
    hazardTelegraphRuntime: 'approved',
    protagonistIndependentActionArt: 'derived-provisional',
    bombImpDirectionalArt: 'replacement-pending',
    bombImpRuntime: 'quarantined'
  })
});

const finite = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const visible = (node) => Boolean(node && !node.classList?.contains('hidden') && node.getClientRects?.().length);
const overlapArea = (a, b, tolerance = 0) => {
  if (!a || !b) return 0;
  const width = Math.min(a.right, b.right) - Math.max(a.left, b.left) - tolerance;
  const height = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) - tolerance;
  return width > 0 && height > 0 ? width * height : 0;
};

function viewportProfile() {
  if (typeof window === 'undefined') return 'server';
  const width = Math.max(1, window.visualViewport?.width || window.innerWidth || 1);
  const height = Math.max(1, window.visualViewport?.height || window.innerHeight || 1);
  if (height >= width && width <= 720) return 'mobile-portrait';
  if (height < width && height <= 560) return 'mobile-landscape-short';
  if (width <= 960) return 'tablet';
  if (width <= 1440) return 'desktop-compact';
  return 'desktop-wide';
}

function snapshotHazards(hazards = []) {
  const list = Array.isArray(hazards) ? hazards : [];
  let warnings = 0;
  let bossWarnings = 0;
  let nearestWarning = Infinity;
  const types = new Set();
  for (const hazard of list) {
    if (!hazard) continue;
    types.add(String(hazard.type || 'unknown'));
    if (hazard.phase === 'warning') {
      warnings += 1;
      nearestWarning = Math.min(nearestWarning, Math.max(0, finite(hazard.warning, 0)));
      if (/boss|serpent|nightMarch/i.test(String(hazard.type || ''))) bossWarnings += 1;
    }
  }
  return Object.freeze({
    total: list.length,
    warnings,
    bossWarnings,
    nearestWarning: Number.isFinite(nearestWarning) ? nearestWarning : null,
    uniqueTypes: types.size
  });
}

export default class BossEncounterAssuranceDirectorV126 {
  constructor({
    combatVisual = null,
    hud = null,
    bossHealth = null,
    bossHealthProgress = null,
    bossHealthDamage = null,
    bossIntent = null,
    dangerHint = null,
    mission = null,
    bossBanner = null
  } = {}) {
    this.combatVisual = combatVisual;
    this.hud = hud;
    this.bossHealth = bossHealth;
    this.bossHealthProgress = bossHealthProgress;
    this.bossHealthDamage = bossHealthDamage;
    this.bossIntent = bossIntent;
    this.dangerHint = dangerHint;
    this.mission = mission;
    this.bossBanner = bossBanner;
    this.elapsed = 0;
    this.layoutElapsed = 0;
    this.damageTrail = 1;
    this.damageTrailHold = 0;
    this.lastBossRatio = 1;
    this.lastWave = 0;
    this.waveSamples = [];
    this.layoutChecks = 0;
    this.layoutCollisions = 0;
    this.layoutRecoveries = 0;
    this.lastCollision = false;
    this.peakHazards = 0;
    this.peakWarnings = 0;
    this.peakParticles = 0;
    this.peakProjectiles = 0;
    this.peakVisualRecords = 0;
    this.criticalTelegraphs = 0;
    this.report = Object.freeze({
      id: BOSS_ENCOUNTER_ASSURANCE_V126_ID,
      version: BOSS_ENCOUNTER_POLICY_V126.version,
      build: BOSS_ENCOUNTER_POLICY_V126.build,
      viewportProfile: viewportProfile(),
      bossActive: false,
      bossHpRatio: 1,
      damageTrailRatio: 1,
      hazardPressure: 'clear',
      twentyWaveTargetReached: false,
      lifecycleHealthy: true,
      approval: BOSS_ENCOUNTER_POLICY_V126.approval
    });
    this.resizeHandler = () => this.measureLayout(true);
  }

  install() {
    if (typeof document === 'undefined') return this.report;
    document.documentElement.dataset.ddBossEncounterV126 = 'ready';
    document.body.classList.add('boss-encounter-assurance-v126');
    this.bossHealth?.setAttribute?.('role', 'group');
    this.bossHealth?.setAttribute?.('aria-label', '보스 체력과 다음 공격 정보');
    this.bossHealthProgress?.setAttribute?.('role', 'progressbar');
    this.bossHealthProgress?.setAttribute?.('aria-valuemin', '0');
    this.bossHealthProgress?.setAttribute?.('aria-valuemax', '100');
    window.addEventListener('resize', this.resizeHandler, { passive: true });
    window.visualViewport?.addEventListener?.('resize', this.resizeHandler, { passive: true });
    this.measureLayout(true);
    window.__DOKKAEBI_BOSS_ENCOUNTER_V126__ = this.report;
    return this.report;
  }

  measureLayout(force = false) {
    if (typeof document === 'undefined') return { profile: 'server', collision: false };
    const profile = viewportProfile();
    const hudRect = visible(this.hud) ? this.hud.getBoundingClientRect() : null;
    const bossRect = visible(this.bossHealth) ? this.bossHealth.getBoundingClientRect() : null;
    const missionRect = visible(this.mission) ? this.mission.getBoundingClientRect() : null;
    const bannerRect = visible(this.bossBanner) ? this.bossBanner.getBoundingClientRect() : null;
    const dangerRect = visible(this.dangerHint) ? this.dangerHint.getBoundingClientRect() : null;
    const safeTop = Math.ceil(Math.max(72, hudRect?.bottom || 0) + 10);
    document.documentElement.style.setProperty('--boss-safe-top-v126', `${safeTop}px`);
    document.documentElement.dataset.v126Viewport = profile;

    let collision = overlapArea(hudRect, bossRect, 2) > 0;
    if (bossRect) {
      collision ||= overlapArea(bossRect, missionRect, 4) > 0;
      collision ||= overlapArea(bossRect, bannerRect, 4) > 0;
      collision ||= overlapArea(bossRect, dangerRect, 4) > 0;
    }
    document.body.classList.toggle('boss-layout-collision-v126', collision);
    document.body.classList.toggle('boss-cinematic-stack-v126', Boolean(missionRect || bannerRect));
    this.layoutChecks += 1;
    if (collision) this.layoutCollisions += 1;
    if (this.lastCollision && !collision) this.layoutRecoveries += 1;
    this.lastCollision = collision;
    return { profile, collision, safeTop, force };
  }

  updateDamageTrail(dt, bossRatio, bossActive) {
    if (!bossActive) {
      this.damageTrail = 1;
      this.damageTrailHold = 0;
      this.lastBossRatio = 1;
    } else {
      const ratio = clamp(finite(bossRatio, 1), 0, 1);
      if (ratio < this.lastBossRatio - .001) this.damageTrailHold = BOSS_ENCOUNTER_POLICY_V126.damageTrailHold;
      if (ratio > this.damageTrail) this.damageTrail = ratio;
      this.damageTrailHold = Math.max(0, this.damageTrailHold - dt);
      if (this.damageTrailHold <= 0 && this.damageTrail > ratio) {
        const catchup = Math.max(.03, (this.damageTrail - ratio) * BOSS_ENCOUNTER_POLICY_V126.damageTrailCatchup);
        this.damageTrail = Math.max(ratio, this.damageTrail - catchup * dt);
      }
      this.lastBossRatio = ratio;
    }
    if (this.bossHealthDamage) this.bossHealthDamage.style.width = `${(this.damageTrail * 100).toFixed(2)}%`;
    if (this.bossHealthProgress) {
      this.bossHealthProgress.setAttribute('aria-valuenow', String(Math.round(clamp(finite(bossRatio, 1), 0, 1) * 100)));
      this.bossHealthProgress.setAttribute('aria-valuetext', `보스 체력 ${Math.round(clamp(finite(bossRatio, 1), 0, 1) * 100)}퍼센트`);
    }
  }

  sampleWave(snapshot, hazards) {
    const wave = Math.max(0, Math.floor(finite(snapshot.wave, 0)));
    if (!wave || wave === this.lastWave) return;
    this.lastWave = wave;
    const visual = this.combatVisual?.diagnostics || {};
    const memoryBytes = typeof performance !== 'undefined' ? finite(performance.memory?.usedJSHeapSize, 0) : 0;
    const sample = Object.freeze({
      wave,
      enemies: Math.max(0, Math.floor(finite(snapshot.enemies, 0))),
      units: Math.max(0, Math.floor(finite(snapshot.units, 0))),
      particles: Math.max(0, Math.floor(finite(snapshot.particles, 0))),
      projectiles: Math.max(0, Math.floor(finite(snapshot.projectiles, 0))),
      hazards: hazards.total,
      warnings: hazards.warnings,
      activeRecords: Math.max(0, Math.floor(finite(visual.activeRecords, 0))),
      memoryMb: memoryBytes > 0 ? Math.round(memoryBytes / 1048576 * 10) / 10 : null
    });
    this.waveSamples.push(sample);
    if (this.waveSamples.length > BOSS_ENCOUNTER_POLICY_V126.lifecycleSampleLimit) this.waveSamples.shift();
  }

  resourceTrendHealthy() {
    if (this.waveSamples.length < 6) return true;
    const count = Math.min(4, Math.floor(this.waveSamples.length / 2));
    const early = this.waveSamples.slice(0, count);
    const late = this.waveSamples.slice(-count);
    const avg = (rows, key) => rows.reduce((sum, row) => sum + finite(row[key], 0), 0) / Math.max(1, rows.length);
    const particleGrowth = avg(late, 'particles') - avg(early, 'particles');
    const recordGrowth = avg(late, 'activeRecords') - avg(early, 'activeRecords');
    const hazardGrowth = avg(late, 'hazards') - avg(early, 'hazards');
    const memoryRowsEarly = early.filter((row) => row.memoryMb !== null);
    const memoryRowsLate = late.filter((row) => row.memoryMb !== null);
    const memoryGrowth = memoryRowsEarly.length && memoryRowsLate.length ? avg(memoryRowsLate, 'memoryMb') - avg(memoryRowsEarly, 'memoryMb') : 0;
    return particleGrowth <= 90 && recordGrowth <= 20 && hazardGrowth <= 8 && memoryGrowth <= 48;
  }

  update(dt, snapshot = {}) {
    const delta = Math.max(0, finite(dt, 0));
    this.elapsed += delta;
    this.layoutElapsed += delta;
    const boss = snapshot.boss || null;
    const bossRatio = boss ? clamp(finite(boss.hp, 0) / Math.max(1, finite(boss.maxHp, 1)), 0, 1) : 1;
    const hazards = snapshotHazards(snapshot.hazards);
    this.updateDamageTrail(delta, bossRatio, Boolean(boss));
    this.sampleWave(snapshot, hazards);

    this.peakHazards = Math.max(this.peakHazards, hazards.total);
    this.peakWarnings = Math.max(this.peakWarnings, hazards.warnings);
    this.peakParticles = Math.max(this.peakParticles, finite(snapshot.particles, 0));
    this.peakProjectiles = Math.max(this.peakProjectiles, finite(snapshot.projectiles, 0));
    this.peakVisualRecords = Math.max(this.peakVisualRecords, finite(this.combatVisual?.diagnostics?.activeRecords, 0));

    const criticalTelegraph = Boolean(boss && (boss.intentUrgency === 'critical' || (hazards.nearestWarning !== null && hazards.nearestWarning <= BOSS_ENCOUNTER_POLICY_V126.criticalWarningTime)));
    if (criticalTelegraph) this.criticalTelegraphs += 1;
    const hazardPressure = hazards.warnings >= BOSS_ENCOUNTER_POLICY_V126.warningPressureThreshold
      ? 'extreme'
      : hazards.warnings >= 4
        ? 'crowded'
        : hazards.warnings > 0
          ? 'active'
          : 'clear';

    if (typeof document !== 'undefined') {
      document.body.classList.toggle('boss-active-v126', Boolean(boss));
      document.body.classList.toggle('boss-critical-v126', criticalTelegraph);
      document.body.classList.toggle('boss-hazard-pressure-v126', hazardPressure === 'crowded' || hazardPressure === 'extreme');
      this.bossHealth?.setAttribute?.('data-hazard-pressure', hazardPressure);
      this.bossHealth?.setAttribute?.('data-boss-phase', String(Math.max(1, Math.floor(finite(boss?.phase, 1)))));
      this.bossIntent?.setAttribute?.('data-v126-critical', criticalTelegraph ? 'true' : 'false');
    }

    if (this.layoutElapsed >= .4) {
      this.layoutElapsed = 0;
      this.measureLayout(false);
    }
    if (this.elapsed < .25) return this.report;
    this.elapsed = 0;

    const lifecycleHealthy = this.resourceTrendHealthy();
    const twentyWaveTargetReached = this.waveSamples.some((sample) => sample.wave >= BOSS_ENCOUNTER_POLICY_V126.waveTarget);
    this.report = Object.freeze({
      id: BOSS_ENCOUNTER_ASSURANCE_V126_ID,
      version: BOSS_ENCOUNTER_POLICY_V126.version,
      build: BOSS_ENCOUNTER_POLICY_V126.build,
      viewportProfile: viewportProfile(),
      bossActive: Boolean(boss),
      bossHpRatio: bossRatio,
      damageTrailRatio: this.damageTrail,
      bossPhase: Math.max(1, Math.floor(finite(boss?.phase, 1))),
      intentUrgency: String(boss?.intentUrgency || 'stable'),
      intentRemaining: Math.max(0, finite(boss?.intentRemaining, 0)),
      hazardPressure,
      hazards,
      criticalTelegraphs: this.criticalTelegraphs,
      layoutChecks: this.layoutChecks,
      layoutCollisions: this.layoutCollisions,
      layoutRecoveries: this.layoutRecoveries,
      collisionActive: this.lastCollision,
      waveSamples: this.waveSamples.length,
      latestWave: this.lastWave,
      twentyWaveTargetReached,
      lifecycleHealthy,
      peakHazards: this.peakHazards,
      peakWarnings: this.peakWarnings,
      peakParticles: this.peakParticles,
      peakProjectiles: this.peakProjectiles,
      peakVisualRecords: this.peakVisualRecords,
      approval: BOSS_ENCOUNTER_POLICY_V126.approval
    });
    if (typeof window !== 'undefined') window.__DOKKAEBI_BOSS_ENCOUNTER_V126__ = this.report;
    return this.report;
  }

  dispose() {
    if (typeof window === 'undefined') return;
    window.removeEventListener('resize', this.resizeHandler);
    window.visualViewport?.removeEventListener?.('resize', this.resizeHandler);
    document.body?.classList?.remove('boss-encounter-assurance-v126', 'boss-active-v126', 'boss-critical-v126', 'boss-hazard-pressure-v126', 'boss-layout-collision-v126', 'boss-cinematic-stack-v126');
  }
}
