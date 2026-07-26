export const BATTLEFIELD_VISIBILITY_ASSURANCE_V128_ID = 'DD-BATTLEFIELD-VISIBILITY-ASSURANCE-V128';

export const BATTLEFIELD_VISIBILITY_POLICY_V128 = Object.freeze({
  version: '1.0.28',
  build: 'b24.28',
  waveTarget: 40,
  portraitIndicatorLimit: 3,
  occlusionRadiusScale: .58,
  lifecycleSampleLimit: 48,
  approval: Object.freeze({
    protagonistDirectionalRuntime: 'approved',
    protagonistIndependentActionArt: 'derived-provisional',
    bombImpDirectionalArt: 'replacement-pending',
    bombImpRuntime: 'quarantined',
    occludedHazardVisibility: 'approved-runtime',
    portraitRadarDensity: 'approved-runtime',
    fortyWaveLifecycle: 'approved-verification'
  })
});

const finite = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const average = (rows, key) => rows.reduce((sum, row) => sum + finite(row?.[key], 0), 0) / Math.max(1, rows.length);

export function distancePointToSegmentXZV128(point = {}, start = {}, end = {}) {
  const abx = finite(end.x) - finite(start.x);
  const abz = finite(end.z) - finite(start.z);
  const lengthSq = abx * abx + abz * abz || 1;
  const t = clamp(((finite(point.x) - finite(start.x)) * abx + (finite(point.z) - finite(start.z)) * abz) / lengthSq, 0, 1);
  const x = finite(start.x) + abx * t;
  const z = finite(start.z) + abz * t;
  return Object.freeze({ distance: Math.hypot(finite(point.x) - x, finite(point.z) - z), t });
}

export function assessHazardOcclusionV128(hazard = {}, cameraPosition = {}, occluders = []) {
  const target = hazard?.position;
  if (!target || !cameraPosition) return Object.freeze({ occluded: false, blockerId: '', clearance: Infinity });
  let best = null;
  for (const item of Array.isArray(occluders) ? occluders : []) {
    const position = item?.position;
    if (!position) continue;
    const test = distancePointToSegmentXZV128(position, cameraPosition, target);
    if (test.t <= .08 || test.t >= .92) continue;
    const radius = Math.max(.5, finite(item.radius, 1) * BATTLEFIELD_VISIBILITY_POLICY_V128.occlusionRadiusScale);
    if (test.distance > radius) continue;
    if (!best || test.distance < best.clearance) best = { occluded: true, blockerId: String(item.id || 'prop'), clearance: test.distance, t: test.t };
  }
  return Object.freeze(best || { occluded: false, blockerId: '', clearance: Infinity, t: 0 });
}

export function auditDirectionalCandidateV128(cells = []) {
  const rows = Array.isArray(cells) ? cells : [];
  const expected = 11;
  const hashes = rows.map((row) => String(row?.hash || '')).filter(Boolean);
  const uniqueHashes = new Set(hashes);
  const baselines = rows.map((row) => finite(row?.groundY, NaN)).filter(Number.isFinite);
  const weaponScales = rows.map((row) => finite(row?.weaponScale, NaN)).filter(Number.isFinite);
  const range = (values) => values.length ? Math.max(...values) - Math.min(...values) : Infinity;
  const result = {
    cells: rows.length,
    expected,
    complete: rows.length === expected,
    duplicateDirections: hashes.length - uniqueHashes.size,
    groundRange: range(baselines),
    weaponScaleRange: range(weaponScales)
  };
  result.approved = result.complete && result.duplicateDirections === 0 && result.groundRange <= .08 && result.weaponScaleRange <= .16;
  return Object.freeze(result);
}

function viewportProfileV128() {
  if (typeof window === 'undefined') return 'server';
  const width = Math.max(1, window.visualViewport?.width || window.innerWidth || 1);
  const height = Math.max(1, window.visualViewport?.height || window.innerHeight || 1);
  if (height >= width && width <= 720) return 'mobile-portrait';
  if (height < width && height <= 560) return 'mobile-landscape-short';
  if (width <= 960) return 'tablet';
  return width <= 1440 ? 'desktop-compact' : 'desktop-wide';
}

export default class BattlefieldVisibilityAssuranceDirectorV128 {
  constructor({ tacticalDirector = null, combatVisual = null } = {}) {
    this.tacticalDirector = tacticalDirector;
    this.combatVisual = combatVisual;
    this.summary = null;
    this.lastWave = 0;
    this.waveSamples = [];
    this.occludedFrames = 0;
    this.revealedHazards = 0;
    this.densePortraitFrames = 0;
    this.report = Object.freeze({
      id: BATTLEFIELD_VISIBILITY_ASSURANCE_V128_ID,
      version: BATTLEFIELD_VISIBILITY_POLICY_V128.version,
      build: BATTLEFIELD_VISIBILITY_POLICY_V128.build,
      viewportProfile: viewportProfileV128(),
      occludedWarnings: 0,
      portraitRadarDense: false,
      fortyWaveTargetReached: false,
      lifecycleHealthy: true,
      approval: BATTLEFIELD_VISIBILITY_POLICY_V128.approval
    });
  }

  install() {
    if (typeof document === 'undefined') return this.report;
    document.documentElement.dataset.ddBattlefieldVisibilityV128 = 'ready';
    document.body.classList.add('battlefield-visibility-assurance-v128');
    const radar = document.getElementById('offscreen-hazard-radar-v127') || document.body;
    this.summary = document.getElementById('hazard-density-summary-v128') || document.createElement('div');
    this.summary.id = 'hazard-density-summary-v128';
    this.summary.className = 'hazard-density-summary-v128';
    this.summary.setAttribute('aria-hidden', 'true');
    if (!this.summary.parentNode) radar.appendChild(this.summary);
    window.__DOKKAEBI_BATTLEFIELD_VISIBILITY_V128__ = this.report;
    return this.report;
  }

  setHazardReveal(hazard, occluded) {
    if (!hazard?.group) return;
    hazard.group.userData.occludedWarningV128 = Boolean(occluded);
    const materials = [hazard.fill?.material, hazard.outline?.material, hazard.ring?.material, hazard.core?.material].filter(Boolean);
    for (const material of materials) {
      if (material.userData.v128DepthTest === undefined) material.userData.v128DepthTest = material.depthTest !== false;
      material.depthTest = occluded ? false : material.userData.v128DepthTest;
      material.needsUpdate = true;
    }
    if (occluded && hazard.phase === 'warning') {
      hazard.group.renderOrder = 28;
      hazard.fill.material.opacity = Math.max(hazard.fill.material.opacity, .15);
      hazard.outline.material.opacity = Math.max(hazard.outline.material.opacity, .94);
      hazard.ring.material.opacity = Math.max(hazard.ring.material.opacity, .84);
      hazard.core.material.opacity = Math.max(hazard.core.material.opacity, .88);
    } else {
      hazard.group.renderOrder = 0;
    }
  }

  updateHazardVisibility(hazards = [], camera = null, occluders = []) {
    let occludedWarnings = 0;
    const warningRows = [];
    for (const hazard of Array.isArray(hazards) ? hazards : []) {
      if (!hazard || hazard.phase !== 'warning') {
        if (hazard) this.setHazardReveal(hazard, false);
        continue;
      }
      const assessment = assessHazardOcclusionV128(hazard, camera?.position, occluders);
      this.setHazardReveal(hazard, assessment.occluded);
      if (assessment.occluded) {
        occludedWarnings += 1;
        this.revealedHazards += 1;
      }
      const projection = this.tacticalDirector?.projectHazard?.(hazard) || null;
      if (projection && !projection.onScreen) warningRows.push({ hazard, projection, assessment, remaining: Math.max(0, finite(hazard.warning, Infinity)) });
    }
    warningRows.sort((a, b) => a.remaining - b.remaining || finite(b.hazard?.radius) - finite(a.hazard?.radius));
    const indicators = typeof document === 'undefined' ? [] : Array.from(document.querySelectorAll('.offscreen-hazard-indicator-v127'));
    indicators.forEach((node, index) => {
      const row = warningRows[index];
      node.classList.toggle('occluded-v128', Boolean(row?.assessment?.occluded));
      node.dataset.v128Blocker = row?.assessment?.blockerId || '';
    });
    if (occludedWarnings > 0) this.occludedFrames += 1;
    return { occludedWarnings, warningRows, indicators };
  }

  updatePortraitDensity(warningRows = [], indicators = []) {
    const profile = viewportProfileV128();
    const dense = profile === 'mobile-portrait' && warningRows.length > BATTLEFIELD_VISIBILITY_POLICY_V128.portraitIndicatorLimit;
    const limit = dense ? BATTLEFIELD_VISIBILITY_POLICY_V128.portraitIndicatorLimit : indicators.length;
    indicators.forEach((node, index) => node.classList.toggle('v128-suppressed', index >= limit));
    if (typeof document !== 'undefined') document.body.classList.toggle('hazard-radar-dense-v128', dense);
    if (dense) this.densePortraitFrames += 1;
    if (this.summary) {
      const overflow = Math.max(0, warningRows.length - limit);
      this.summary.classList.toggle('visible', overflow > 0);
      this.summary.textContent = overflow > 0 ? `+${overflow} 위험` : '';
    }
    return { profile, dense, visibleIndicators: Math.min(limit, warningRows.length) };
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
      hazards: Math.max(0, Math.floor(finite(snapshot.hazards?.length, 0))),
      activeRecords: Math.max(0, Math.floor(finite(visual.activeRecords, 0))),
      memoryMb: memoryBytes > 0 ? Math.round(memoryBytes / 1048576 * 10) / 10 : null
    }));
    if (this.waveSamples.length > BATTLEFIELD_VISIBILITY_POLICY_V128.lifecycleSampleLimit) this.waveSamples.shift();
  }

  lifecycleHealthy() {
    if (this.waveSamples.length < 10) return true;
    const count = Math.min(6, Math.floor(this.waveSamples.length / 2));
    const early = this.waveSamples.slice(0, count);
    const late = this.waveSamples.slice(-count);
    const fpsEarly = early.filter((row) => row.fps > 0);
    const fpsLate = late.filter((row) => row.fps > 0);
    const fpsDrop = fpsEarly.length && fpsLate.length ? average(fpsEarly, 'fps') - average(fpsLate, 'fps') : 0;
    const particleGrowth = average(late, 'particles') - average(early, 'particles');
    const recordGrowth = average(late, 'activeRecords') - average(early, 'activeRecords');
    const memoryEarly = early.filter((row) => row.memoryMb !== null);
    const memoryLate = late.filter((row) => row.memoryMb !== null);
    const memoryGrowth = memoryEarly.length && memoryLate.length ? average(memoryLate, 'memoryMb') - average(memoryEarly, 'memoryMb') : 0;
    return fpsDrop <= 18 && particleGrowth <= 150 && recordGrowth <= 28 && memoryGrowth <= 96;
  }

  update(dt, snapshot = {}) {
    const visibility = this.updateHazardVisibility(snapshot.hazards, snapshot.camera, snapshot.occluders);
    const density = this.updatePortraitDensity(visibility.warningRows, visibility.indicators);
    this.sampleWave(snapshot);
    const report = Object.freeze({
      id: BATTLEFIELD_VISIBILITY_ASSURANCE_V128_ID,
      version: BATTLEFIELD_VISIBILITY_POLICY_V128.version,
      build: BATTLEFIELD_VISIBILITY_POLICY_V128.build,
      viewportProfile: density.profile,
      occludedWarnings: visibility.occludedWarnings,
      occludedFrames: this.occludedFrames,
      revealedHazards: this.revealedHazards,
      portraitRadarDense: density.dense,
      visibleIndicators: density.visibleIndicators,
      densePortraitFrames: this.densePortraitFrames,
      latestWave: this.lastWave,
      fortyWaveTargetReached: this.lastWave >= BATTLEFIELD_VISIBILITY_POLICY_V128.waveTarget,
      lifecycleHealthy: this.lifecycleHealthy(),
      samples: this.waveSamples.slice(),
      approval: BATTLEFIELD_VISIBILITY_POLICY_V128.approval
    });
    this.report = report;
    if (typeof window !== 'undefined') window.__DOKKAEBI_BATTLEFIELD_VISIBILITY_V128__ = report;
    return report;
  }

  dispose() {
    this.summary?.remove?.();
    this.summary = null;
    if (typeof document !== 'undefined') {
      document.body.classList.remove('battlefield-visibility-assurance-v128', 'hazard-radar-dense-v128');
      document.querySelectorAll('.offscreen-hazard-indicator-v127').forEach((node) => node.classList.remove('occluded-v128', 'v128-suppressed'));
    }
  }
}
