export const ASSET_REFINEMENT_ASSURANCE_V129_ID = 'DD-ASSET-REFINEMENT-ASSURANCE-V129';

export const ASSET_REFINEMENT_POLICY_V129 = Object.freeze({
  version: '1.0.29',
  build: 'b24.29',
  waveTarget: 50,
  directionCount: 11,
  actionCount: 6,
  uvGuardPixels: .75,
  transparentRgbBleedPixels: 3,
  mobileGroupLimit: 3,
  approval: Object.freeze({
    protagonistDirectionalSource: 'final-approved-v117',
    protagonistDerivedRuntimeAtlas: 'approved-runtime-derived',
    protagonistIndependentActionArt: 'derived-provisional',
    bombImpDirectionalArt: 'replacement-pending',
    bombImpRuntime: 'quarantined',
    newFinalCharacterArt: 0
  })
});

const finite = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const average = (rows, key) => rows.reduce((sum, row) => sum + finite(row?.[key], 0), 0) / Math.max(1, rows.length);

export function directionBucketV129(projection = {}) {
  const x = finite(projection.x, finite(projection.ndcX, 0));
  const y = finite(projection.y, finite(projection.ndcY, 0));
  if (Math.abs(x) < .28 && y < -.2) return 'front';
  if (Math.abs(x) < .28 && y > .2) return 'back';
  if (x < -.55) return y < -.25 ? 'front-left' : y > .25 ? 'back-left' : 'left';
  if (x > .55) return y < -.25 ? 'front-right' : y > .25 ? 'back-right' : 'right';
  return x < 0 ? 'left-near' : 'right-near';
}

export function groupHazardsByDirectionV129(rows = [], limit = ASSET_REFINEMENT_POLICY_V129.mobileGroupLimit) {
  const groups = new Map();
  for (const row of Array.isArray(rows) ? rows : []) {
    const key = directionBucketV129(row?.projection || row || {});
    const remaining = Math.max(0, finite(row?.remaining, Infinity));
    const current = groups.get(key) || { direction: key, count: 0, remaining: Infinity, occluded: 0 };
    current.count += 1;
    current.remaining = Math.min(current.remaining, remaining);
    current.occluded += row?.assessment?.occluded ? 1 : 0;
    groups.set(key, current);
  }
  return Object.freeze([...groups.values()]
    .sort((a, b) => a.remaining - b.remaining || b.count - a.count)
    .slice(0, Math.max(1, Math.floor(finite(limit, 3))))
    .map((row) => Object.freeze(row)));
}

export function validateRefinementProfileV129(profile = {}) {
  const atlases = Array.isArray(profile?.atlases) ? profile.atlases : [];
  const rows = atlases.flatMap((atlas) => Array.isArray(atlas?.cells) ? atlas.cells : []);
  return Object.freeze({
    atlasCount: atlases.length,
    profileCells: rows.length,
    directions: new Set(rows.map((row) => row.direction)).size,
    actions: new Set(rows.map((row) => row.action)).size,
    alphaPreserved: atlases.length > 0 && atlases.every((atlas) => atlas.alphaPreserved === true),
    visiblePixelsPreserved: atlases.length > 0 && atlases.every((atlas) => atlas.visiblePixelsPreserved === true),
    approved: atlases.length === 3
      && rows.length === 198
      && new Set(rows.map((row) => row.direction)).size === 11
      && new Set(rows.map((row) => row.action)).size === 6
      && atlases.every((atlas) => atlas.alphaPreserved === true && atlas.visiblePixelsPreserved === true)
  });
}

function viewportProfileV129() {
  if (typeof window === 'undefined') return 'server';
  const width = Math.max(1, window.visualViewport?.width || window.innerWidth || 1);
  const height = Math.max(1, window.visualViewport?.height || window.innerHeight || 1);
  if (height >= width && width <= 720) return 'mobile-portrait';
  if (height < width && height <= 560) return 'mobile-landscape-short';
  if (width <= 960) return 'tablet';
  return width <= 1440 ? 'desktop-compact' : 'desktop-wide';
}

export default class AssetRefinementAssuranceDirectorV129 {
  constructor({ visibilityDirector = null, tacticalDirector = null, combatVisual = null } = {}) {
    this.visibilityDirector = visibilityDirector;
    this.tacticalDirector = tacticalDirector;
    this.combatVisual = combatVisual;
    this.lastWave = 0;
    this.waveSamples = [];
    this.directionGroups = [];
    this.profile = null;
    this.profileAudit = null;
    this.report = Object.freeze({
      id: ASSET_REFINEMENT_ASSURANCE_V129_ID,
      version: ASSET_REFINEMENT_POLICY_V129.version,
      build: ASSET_REFINEMENT_POLICY_V129.build,
      viewportProfile: viewportProfileV129(),
      fiftyWaveTargetReached: false,
      lifecycleHealthy: true,
      approval: ASSET_REFINEMENT_POLICY_V129.approval
    });
  }

  async install() {
    if (typeof document === 'undefined') return this.report;
    document.documentElement.dataset.ddAssetRefinementV129 = 'ready';
    document.body.classList.add('asset-refinement-assurance-v129');
    try {
      const response = await fetch('./assets/visual-v129/asset-refinement-profile-v129.json', { cache: 'no-store' });
      if (response.ok) {
        this.profile = await response.json();
        this.profileAudit = validateRefinementProfileV129(this.profile);
      }
    } catch {
      this.profileAudit = Object.freeze({ approved: false, reason: 'profile-load-failed' });
    }
    if (typeof window !== 'undefined') window.__DOKKAEBI_ASSET_REFINEMENT_V129__ = this.report;
    return this.report;
  }

  sampleWave(snapshot = {}) {
    const wave = Math.max(0, Math.floor(finite(snapshot.wave, 0)));
    if (!wave || wave === this.lastWave) return;
    this.lastWave = wave;
    const memoryBytes = typeof performance !== 'undefined' ? finite(performance.memory?.usedJSHeapSize, 0) : 0;
    const visual = this.combatVisual?.diagnostics || {};
    this.waveSamples.push(Object.freeze({
      wave,
      fps: Math.max(0, finite(snapshot.fps, finite(snapshot.performance?.fps, 0))),
      particles: Math.max(0, Math.floor(finite(snapshot.particles, 0))),
      projectiles: Math.max(0, Math.floor(finite(snapshot.projectiles, 0))),
      hazards: Math.max(0, Math.floor(Array.isArray(snapshot.hazards) ? snapshot.hazards.length : finite(snapshot.hazards, 0))),
      activeRecords: Math.max(0, Math.floor(finite(visual.activeRecords, 0))),
      memoryMb: memoryBytes > 0 ? Math.round(memoryBytes / 1048576 * 10) / 10 : null
    }));
    if (this.waveSamples.length > 60) this.waveSamples.shift();
  }

  lifecycleHealthy() {
    if (this.waveSamples.length < 12) return true;
    const count = Math.min(8, Math.floor(this.waveSamples.length / 2));
    const early = this.waveSamples.slice(0, count);
    const late = this.waveSamples.slice(-count);
    const fpsEarly = early.filter((row) => row.fps > 0);
    const fpsLate = late.filter((row) => row.fps > 0);
    const fpsDrop = fpsEarly.length && fpsLate.length ? average(fpsEarly, 'fps') - average(fpsLate, 'fps') : 0;
    const particleGrowth = average(late, 'particles') - average(early, 'particles');
    const projectileGrowth = average(late, 'projectiles') - average(early, 'projectiles');
    const recordGrowth = average(late, 'activeRecords') - average(early, 'activeRecords');
    const memoryEarly = early.filter((row) => row.memoryMb !== null);
    const memoryLate = late.filter((row) => row.memoryMb !== null);
    const memoryGrowth = memoryEarly.length && memoryLate.length ? average(memoryLate, 'memoryMb') - average(memoryEarly, 'memoryMb') : 0;
    return fpsDrop <= 20 && particleGrowth <= 180 && projectileGrowth <= 45 && recordGrowth <= 32 && memoryGrowth <= 112;
  }

  update(snapshot = {}) {
    const warningRows = (Array.isArray(snapshot.hazards) ? snapshot.hazards : [])
      .filter((hazard) => hazard?.phase === 'warning')
      .map((hazard) => ({
        hazard,
        projection: this.tacticalDirector?.projectHazard?.(hazard) || {},
        assessment: { occluded: Boolean(hazard?.group?.userData?.occludedWarningV128) },
        remaining: Math.max(0, finite(hazard?.warning, Infinity))
      }))
      .filter((row) => row.projection && row.projection.onScreen === false);
    this.directionGroups = groupHazardsByDirectionV129(warningRows);
    this.sampleWave(snapshot);
    const report = Object.freeze({
      id: ASSET_REFINEMENT_ASSURANCE_V129_ID,
      version: ASSET_REFINEMENT_POLICY_V129.version,
      build: ASSET_REFINEMENT_POLICY_V129.build,
      viewportProfile: viewportProfileV129(),
      profileAudit: this.profileAudit,
      directionGroups: this.directionGroups,
      latestWave: this.lastWave,
      fiftyWaveTargetReached: this.lastWave >= ASSET_REFINEMENT_POLICY_V129.waveTarget,
      lifecycleHealthy: this.lifecycleHealthy(),
      samples: this.waveSamples.slice(),
      approval: ASSET_REFINEMENT_POLICY_V129.approval
    });
    this.report = report;
    if (typeof window !== 'undefined') window.__DOKKAEBI_ASSET_REFINEMENT_V129__ = report;
    return report;
  }

  dispose() {
    if (typeof document !== 'undefined') document.body.classList.remove('asset-refinement-assurance-v129');
  }
}
