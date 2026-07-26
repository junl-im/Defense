export const SILHOUETTE_ASSURANCE_V132_ID = 'DD-SILHOUETTE-ASSURANCE-V132';

export const SILHOUETTE_ASSURANCE_POLICY_V132 = Object.freeze({
  version: '1.0.32',
  build: 'b24.32',
  waveTarget: 80,
  silhouetteAssets: 10,
  silhouettePairs: 45,
  actionCells: 66,
  mobileSectorLimit: 3,
  approval: Object.freeze({
    pupuDirectional: 'final-approved-retained',
    pupuIndependentActions: 'derived-provisional',
    bossMonsterSilhouettes: 'audit-approved-no-near-duplicates',
    bombImpDirectional: 'replacement-pending',
    bombImpRuntime: 'quarantined',
    newFinalCharacterArt: 0
  })
});

const finite = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const average = (rows, key) => rows.reduce((sum, row) => sum + finite(row?.[key], 0), 0) / Math.max(1, rows.length);

export function validateSilhouetteAuditV132(audit = {}) {
  const assets = Array.isArray(audit.assets) ? audit.assets : [];
  const pairs = Array.isArray(audit.pairs) ? audit.pairs : [];
  const hashes = assets.map((row) => row.silhouetteHash).filter(Boolean);
  const nearDuplicatePairs = pairs.filter((row) => row.nearDuplicate === true);
  const reviewPairs = pairs.filter((row) => row.review === true);
  return Object.freeze({
    assets: assets.length,
    pairs: pairs.length,
    uniqueSilhouettes: new Set(hashes).size,
    reviewPairs: reviewPairs.length,
    nearDuplicatePairs: nearDuplicatePairs.length,
    highestSimilarity: pairs[0] || null,
    approved: assets.length === SILHOUETTE_ASSURANCE_POLICY_V132.silhouetteAssets
      && pairs.length === SILHOUETTE_ASSURANCE_POLICY_V132.silhouettePairs
      && new Set(hashes).size === assets.length
      && nearDuplicatePairs.length === 0
      && assets.every((row) => row.grid === 32 && /^[a-f0-9]{64}$/.test(row.sourceSha256 || '') && /^[a-f0-9]{64}$/.test(row.silhouetteHash || ''))
  });
}

export function validateActionEvidenceV132(evidence = {}) {
  const cells = Array.isArray(evidence.cells) ? evidence.cells : [];
  const comparisons = Array.isArray(evidence.comparisons) ? evidence.comparisons : [];
  const summary = evidence.summary || {};
  return Object.freeze({
    cells: cells.length,
    comparisons: comparisons.length,
    exactRgbaMatchesAgainstIdle: finite(summary.exactRgbaMatchesAgainstIdle, Infinity),
    minimumMeanRgbaDelta: finite(summary.minimumMeanRgbaDelta, 0),
    distinctRuntimeFrames: summary.distinctRuntimeFrames === true,
    independentOriginalArtApproved: summary.independentOriginalArtApproved === true,
    approvedRuntimeEvidence: cells.length === SILHOUETTE_ASSURANCE_POLICY_V132.actionCells
      && comparisons.length === 55
      && summary.distinctRuntimeFrames === true
      && summary.independentOriginalArtApproved === false
      && summary.approval === 'derived-provisional'
  });
}

const SECTOR_MAP_V132 = Object.freeze({
  left: 'left', 'left-near': 'left', 'front-left': 'left', 'back-left': 'left',
  right: 'right', 'right-near': 'right', 'front-right': 'right', 'back-right': 'right',
  front: 'front', back: 'back'
});

export function compactDangerSectorsV132(rows = [], limit = SILHOUETTE_ASSURANCE_POLICY_V132.mobileSectorLimit) {
  const grouped = new Map();
  for (const row of Array.isArray(rows) ? rows : []) {
    const direction = String(row?.direction || 'front');
    const sector = SECTOR_MAP_V132[direction] || direction;
    const current = grouped.get(sector) || { sector, count: 0, remaining: Infinity, occluded: 0, urgent: false };
    current.count += Math.max(1, Math.floor(finite(row?.count, 1)));
    current.remaining = Math.min(current.remaining, Math.max(0, finite(row?.remaining, Infinity)));
    current.occluded += Math.max(0, Math.floor(finite(row?.occluded, 0)));
    current.urgent ||= current.remaining <= .8;
    grouped.set(sector, current);
  }
  return Object.freeze([...grouped.values()]
    .sort((a, b) => a.remaining - b.remaining || b.count - a.count)
    .slice(0, Math.max(1, Math.floor(finite(limit, 3))))
    .map((row) => Object.freeze(row)));
}

function viewportProfileV132() {
  if (typeof window === 'undefined') return 'server';
  const width = Math.max(1, window.visualViewport?.width || window.innerWidth || 1);
  const height = Math.max(1, window.visualViewport?.height || window.innerHeight || 1);
  if (height >= width && width <= 720) return 'mobile-portrait';
  if (height < width && height <= 560) return 'mobile-landscape-short';
  if (width <= 960) return 'tablet';
  return width <= 1440 ? 'desktop-compact' : 'desktop-wide';
}

const SECTOR_LABEL_V132 = Object.freeze({ left: '좌', right: '우', front: '전', back: '후' });

export default class SilhouetteAssuranceDirectorV132 {
  constructor({ combatVisual = null, refinementDirector = null } = {}) {
    this.combatVisual = combatVisual;
    this.refinementDirector = refinementDirector;
    this.silhouetteAudit = null;
    this.silhouetteResult = null;
    this.actionEvidence = null;
    this.actionResult = null;
    this.registry = null;
    this.samples = [];
    this.lastWave = 0;
    this.sectorNode = null;
    this.report = Object.freeze({
      id: SILHOUETTE_ASSURANCE_V132_ID,
      version: SILHOUETTE_ASSURANCE_POLICY_V132.version,
      build: SILHOUETTE_ASSURANCE_POLICY_V132.build,
      ready: false,
      approval: SILHOUETTE_ASSURANCE_POLICY_V132.approval
    });
  }

  async install() {
    if (typeof document !== 'undefined') {
      document.documentElement.dataset.ddSilhouetteAssuranceV132 = 'ready';
      document.body.classList.add('silhouette-assurance-v132');
      const parent = document.getElementById('offscreen-hazard-radar-v127') || document.body;
      this.sectorNode = document.getElementById('danger-sector-summary-v132') || document.createElement('div');
      this.sectorNode.id = 'danger-sector-summary-v132';
      this.sectorNode.className = 'danger-sector-summary-v132';
      this.sectorNode.setAttribute('aria-live', 'polite');
      this.sectorNode.setAttribute('aria-label', '화면 밖 위험 방향 요약');
      if (!this.sectorNode.parentNode) parent.appendChild(this.sectorNode);
    }
    const load = async (path) => {
      const response = await fetch(path, { cache: 'no-store' });
      if (!response.ok) throw new Error(`asset load failed: ${path}`);
      return response.json();
    };
    try {
      [this.silhouetteAudit, this.actionEvidence, this.registry] = await Promise.all([
        load('./assets/visual-v132/silhouette-audit-v132.json'),
        load('./assets/visual-v132/action-evidence-v132.json'),
        load('./assets/visual-v132/silhouette-assurance-registry-v132.json')
      ]);
      this.silhouetteResult = validateSilhouetteAuditV132(this.silhouetteAudit);
      this.actionResult = validateActionEvidenceV132(this.actionEvidence);
    } catch (error) {
      this.silhouetteResult = Object.freeze({ approved: false, reason: 'audit-load-failed' });
      this.actionResult = Object.freeze({ approvedRuntimeEvidence: false, reason: 'evidence-load-failed' });
    }
    this.publish();
    return this.report;
  }

  sample(snapshot = {}) {
    const wave = Math.max(0, Math.floor(finite(snapshot.wave, 0)));
    if (!wave || wave === this.lastWave) return;
    this.lastWave = wave;
    const memoryBytes = typeof performance !== 'undefined' ? finite(performance.memory?.usedJSHeapSize, 0) : 0;
    const visual = this.combatVisual?.diagnostics || {};
    this.samples.push(Object.freeze({
      wave,
      fps: Math.max(0, finite(snapshot.fps, 0)),
      particles: Math.max(0, Math.floor(finite(snapshot.particles, 0))),
      projectiles: Math.max(0, Math.floor(finite(snapshot.projectiles, 0))),
      hazards: Math.max(0, Math.floor(finite(snapshot.hazards, 0))),
      activeRecords: Math.max(0, Math.floor(finite(visual.activeRecords, 0))),
      memoryMb: memoryBytes > 0 ? Math.round(memoryBytes / 1048576 * 10) / 10 : null
    }));
    if (this.samples.length > 96) this.samples.shift();
  }

  lifecycleHealthy() {
    if (this.samples.length < 16) return true;
    const count = Math.min(12, Math.floor(this.samples.length / 2));
    const early = this.samples.slice(0, count);
    const late = this.samples.slice(-count);
    const earlyFps = early.filter((row) => row.fps > 0);
    const lateFps = late.filter((row) => row.fps > 0);
    const fpsDrop = earlyFps.length && lateFps.length ? average(earlyFps, 'fps') - average(lateFps, 'fps') : 0;
    const particleGrowth = average(late, 'particles') - average(early, 'particles');
    const projectileGrowth = average(late, 'projectiles') - average(early, 'projectiles');
    const hazardGrowth = average(late, 'hazards') - average(early, 'hazards');
    const recordGrowth = average(late, 'activeRecords') - average(early, 'activeRecords');
    const earlyMemory = early.filter((row) => row.memoryMb !== null);
    const lateMemory = late.filter((row) => row.memoryMb !== null);
    const memoryGrowth = earlyMemory.length && lateMemory.length ? average(lateMemory, 'memoryMb') - average(earlyMemory, 'memoryMb') : 0;
    return fpsDrop <= 24 && particleGrowth <= 260 && projectileGrowth <= 64 && hazardGrowth <= 18 && recordGrowth <= 44 && memoryGrowth <= 168;
  }

  renderSectors(sectors = []) {
    if (!this.sectorNode) return;
    const profile = viewportProfileV132();
    const visible = (profile === 'mobile-portrait' || profile === 'mobile-landscape-short') && sectors.length > 0;
    this.sectorNode.classList.toggle('visible', visible);
    this.sectorNode.replaceChildren();
    if (!visible) return;
    for (const row of sectors) {
      const item = document.createElement('span');
      item.className = `danger-sector-v132${row.urgent ? ' urgent' : ''}${row.occluded ? ' occluded' : ''}`;
      item.textContent = `${SECTOR_LABEL_V132[row.sector] || row.sector} ${row.count}`;
      item.title = `${row.remaining.toFixed(1)}초 · 가림 ${row.occluded}`;
      this.sectorNode.appendChild(item);
    }
  }

  publish(extra = {}) {
    this.report = Object.freeze({
      id: SILHOUETTE_ASSURANCE_V132_ID,
      version: SILHOUETTE_ASSURANCE_POLICY_V132.version,
      build: SILHOUETTE_ASSURANCE_POLICY_V132.build,
      viewportProfile: viewportProfileV132(),
      silhouetteAudit: this.silhouetteResult,
      actionEvidence: this.actionResult,
      latestWave: this.lastWave,
      eightyWaveTargetReached: this.lastWave >= SILHOUETTE_ASSURANCE_POLICY_V132.waveTarget,
      lifecycleHealthy: this.lifecycleHealthy(),
      samples: this.samples.slice(),
      approval: SILHOUETTE_ASSURANCE_POLICY_V132.approval,
      ...extra
    });
    if (typeof window !== 'undefined') window.__DOKKAEBI_SILHOUETTE_ASSURANCE_V132__ = this.report;
  }

  update(snapshot = {}) {
    this.sample({
      ...snapshot,
      hazards: Array.isArray(snapshot.hazards) ? snapshot.hazards.length : snapshot.hazards
    });
    const sectors = compactDangerSectorsV132(snapshot.directionGroups || this.refinementDirector?.directionGroups || []);
    this.renderSectors(sectors);
    this.publish({ dangerSectors: sectors });
    return this.report;
  }

  dispose() {
    this.sectorNode?.remove?.();
    this.sectorNode = null;
    if (typeof document !== 'undefined') document.body.classList.remove('silhouette-assurance-v132');
  }
}
