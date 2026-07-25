export const RELEASE_ASSURANCE_V124_ID = 'DD-RELEASE-ASSURANCE-V124';

export const RELEASE_ASSURANCE_POLICY_V124 = Object.freeze({
  version: '1.0.24',
  build: 'b24.24',
  canonicalTitle: '도깨비 럭 디펜스 3D',
  mascot: Object.freeze({ family: 'original-v112', replacementActive: false }),
  directional: Object.freeze({ views: 11, states: Object.freeze(['idle', 'move', 'attack', 'skill', 'hit', 'death']), mirroringAllowed: false }),
  approval: Object.freeze({ directionArt: 'approved', actionRuntimeMapping: 'approved', actionArt: 'derived-provisional' }),
  layout: Object.freeze({ bossGap: 10, secondaryGap: 8, collisionTolerance: 2 }),
  cache: Object.freeze({ prefix: 'dokkaebi-luck-defense-shell-', purgeLegacyPrefixes: Object.freeze(['dokkaebi-shell-', 'dokkaebi-luck-defense-shell-']) })
});

const visible = (node) => Boolean(node && !node.classList?.contains('hidden') && node.getClientRects?.().length);
const clamp = (value, min, max) => Math.max(min, Math.min(max, Number(value) || 0));
const overlapArea = (a, b, tolerance = 0) => {
  if (!a || !b) return 0;
  const width = Math.min(a.right, b.right) - Math.max(a.left, b.left) - tolerance;
  const height = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) - tolerance;
  return width > 0 && height > 0 ? width * height : 0;
};

function emptyDirectionHits() {
  return Array.from({ length: RELEASE_ASSURANCE_POLICY_V124.directional.views }, () => 0);
}

function emptyStateHits() {
  return Object.fromEntries(RELEASE_ASSURANCE_POLICY_V124.directional.states.map((state) => [state, 0]));
}

export default class ReleaseAssuranceDirectorV124 {
  constructor({ combatVisual = null, hud = null, bossHealth = null } = {}) {
    this.combatVisual = combatVisual;
    this.hud = hud;
    this.bossHealth = bossHealth;
    this.elapsed = 0;
    this.layoutElapsed = 0;
    this.serviceWorkerElapsed = 0;
    this.directionHits = emptyDirectionHits();
    this.stateHits = emptyStateHits();
    this.lastDirectionHits = emptyDirectionHits();
    this.lastStateHits = emptyStateHits();
    this.layoutChecks = 0;
    this.collisionCount = 0;
    this.collisionRecoveries = 0;
    this.lastCollision = false;
    this.serviceWorker = { controlled: false, version: '', buildId: '', cacheName: '', current: false };
    this.resizeHandler = () => this.measureLayout(true);
    this.report = Object.freeze({
      id: RELEASE_ASSURANCE_V124_ID,
      version: RELEASE_ASSURANCE_POLICY_V124.version,
      build: RELEASE_ASSURANCE_POLICY_V124.build,
      canonicalTitle: RELEASE_ASSURANCE_POLICY_V124.canonicalTitle,
      mascot: RELEASE_ASSURANCE_POLICY_V124.mascot.family,
      protagonistApproved: false,
      observedDirections: 0,
      observedStates: 0,
      actionRuntimeMapping: RELEASE_ASSURANCE_POLICY_V124.approval.actionRuntimeMapping,
      actionArt: RELEASE_ASSURANCE_POLICY_V124.approval.actionArt,
      collisions: 0,
      collisionActive: false,
      cacheCurrent: false
    });
  }

  install() {
    if (typeof document === 'undefined') return this.report;
    document.title = RELEASE_ASSURANCE_POLICY_V124.canonicalTitle;
    document.documentElement.dataset.ddReleaseAssuranceV124 = 'ready';
    document.body.classList.add('release-assurance-v124');
    const description = document.querySelector('meta[name="description"]');
    if (description) description.content = '푸른 도깨비 수호대와 함께 달빛 장터를 지키는 3D 액션 디펜스';
    window.addEventListener('resize', this.resizeHandler, { passive: true });
    window.visualViewport?.addEventListener?.('resize', this.resizeHandler, { passive: true });
    this.measureLayout(true);
    this.auditServiceWorker();
    window.__DOKKAEBI_RELEASE_ASSURANCE_V124__ = this.report;
    return this.report;
  }

  async auditServiceWorker() {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return this.serviceWorker;
    const worker = navigator.serviceWorker.controller;
    this.serviceWorker.controlled = Boolean(worker);
    if (!worker || typeof MessageChannel === 'undefined') return this.serviceWorker;
    const result = await new Promise((resolve) => {
      const channel = new MessageChannel();
      const timer = setTimeout(() => resolve(null), 1600);
      channel.port1.onmessage = (event) => { clearTimeout(timer); resolve(event.data || null); };
      try { worker.postMessage({ type: 'DOKKAEBI_GET_VERSION' }, [channel.port2]); }
      catch { clearTimeout(timer); resolve(null); }
    });
    if (result) {
      this.serviceWorker.version = String(result.version || '');
      this.serviceWorker.buildId = String(result.buildId || '');
      this.serviceWorker.cacheName = String(result.cacheName || '');
      this.serviceWorker.current = this.serviceWorker.version === RELEASE_ASSURANCE_POLICY_V124.version
        && this.serviceWorker.buildId === RELEASE_ASSURANCE_POLICY_V124.build;
    }
    return this.serviceWorker;
  }

  readDirectionalUsage() {
    const diagnostics = this.combatVisual?.diagnostics || {};
    const hits = Array.isArray(diagnostics.protagonistDirectionHitsV124) ? diagnostics.protagonistDirectionHitsV124 : emptyDirectionHits();
    const states = diagnostics.protagonistStateHitsV124 || emptyStateHits();
    this.directionHits = hits.map((value, index) => Math.max(this.directionHits[index] || 0, Number(value) || 0));
    for (const state of RELEASE_ASSURANCE_POLICY_V124.directional.states) {
      this.stateHits[state] = Math.max(this.stateHits[state] || 0, Number(states[state]) || 0);
    }
    return {
      approved: Number(diagnostics.approvedProtagonistRecordsV124 || 0) > 0,
      fallback: Number(diagnostics.protagonistFallbackSelectionsV124 || 0),
      observedDirections: this.directionHits.filter((value) => value > 0).length,
      observedStates: Object.values(this.stateHits).filter((value) => value > 0).length
    };
  }

  measureLayout(force = false) {
    if (typeof document === 'undefined') return { collision: false };
    const root = document.documentElement;
    const viewportHeight = Math.max(1, window.visualViewport?.height || window.innerHeight || 1);
    const safeTop = Number.parseFloat(getComputedStyle(root).getPropertyValue('--safe-top')) || 0;
    const hudRect = visible(this.hud) ? this.hud.getBoundingClientRect() : null;
    const bossRect = visible(this.bossHealth) ? this.bossHealth.getBoundingClientRect() : null;
    const baseBossTop = Math.ceil(Math.max(safeTop + 58, (hudRect?.bottom || safeTop + 52) + RELEASE_ASSURANCE_POLICY_V124.layout.bossGap));
    const bossTop = clamp(baseBossTop, safeTop + 58, viewportHeight * 0.40);
    const bossHeight = Math.ceil(bossRect?.height || 68);
    const secondaryTop = clamp(bossTop + bossHeight + RELEASE_ASSURANCE_POLICY_V124.layout.secondaryGap, bossTop + 56, viewportHeight * 0.64);
    root.style.setProperty('--v124-boss-top', `${bossTop}px`);
    root.style.setProperty('--v124-secondary-top', `${secondaryTop}px`);

    const secondaryNodes = ['#luck-meter', '#synergy-panel', '#unit-strip', '#moon-omen', '#run-seed-chip', '#stage-chip', '#council-chip', '#wave-trial']
      .map((selector) => document.querySelector(selector)).filter(visible);
    let collision = overlapArea(hudRect, bossRect, RELEASE_ASSURANCE_POLICY_V124.layout.collisionTolerance) > 0;
    if (bossRect) collision ||= secondaryNodes.some((node) => overlapArea(bossRect, node.getBoundingClientRect(), RELEASE_ASSURANCE_POLICY_V124.layout.collisionTolerance) > 0);
    document.body.classList.toggle('hud-collision-guard-v124', collision);
    this.layoutChecks += 1;
    if (collision) this.collisionCount += 1;
    if (this.lastCollision && !collision) this.collisionRecoveries += 1;
    this.lastCollision = collision;
    return { collision, bossTop, secondaryTop, layoutChecks: this.layoutChecks, force };
  }

  update(dt, snapshot = {}) {
    const delta = Math.max(0, Number(dt) || 0);
    this.elapsed += delta;
    this.layoutElapsed += delta;
    this.serviceWorkerElapsed += delta;
    if (this.layoutElapsed >= 0.4) {
      this.layoutElapsed = 0;
      this.measureLayout(false);
    }
    if (this.serviceWorkerElapsed >= 15) {
      this.serviceWorkerElapsed = 0;
      this.auditServiceWorker();
    }
    if (this.elapsed < 0.25) return this.report;
    this.elapsed = 0;

    const direction = this.readDirectionalUsage();
    const titleCorrect = typeof document === 'undefined' || document.title === RELEASE_ASSURANCE_POLICY_V124.canonicalTitle;
    document?.body?.classList?.toggle('protagonist-direction-fallback-v124', !direction.approved || direction.fallback > 0);
    this.report = Object.freeze({
      id: RELEASE_ASSURANCE_V124_ID,
      version: RELEASE_ASSURANCE_POLICY_V124.version,
      build: RELEASE_ASSURANCE_POLICY_V124.build,
      canonicalTitle: RELEASE_ASSURANCE_POLICY_V124.canonicalTitle,
      titleCorrect,
      mascot: RELEASE_ASSURANCE_POLICY_V124.mascot.family,
      protagonistApproved: direction.approved,
      protagonistFallbackSelections: direction.fallback,
      directionArt: RELEASE_ASSURANCE_POLICY_V124.approval.directionArt,
      actionRuntimeMapping: RELEASE_ASSURANCE_POLICY_V124.approval.actionRuntimeMapping,
      actionArt: RELEASE_ASSURANCE_POLICY_V124.approval.actionArt,
      observedDirections: direction.observedDirections,
      observedStates: direction.observedStates,
      directionHits: [...this.directionHits],
      stateHits: { ...this.stateHits },
      gameplayState: String(snapshot.state || ''),
      layoutChecks: this.layoutChecks,
      collisions: this.collisionCount,
      collisionRecoveries: this.collisionRecoveries,
      collisionActive: this.lastCollision,
      cacheControlled: this.serviceWorker.controlled,
      cacheVersion: this.serviceWorker.version,
      cacheBuildId: this.serviceWorker.buildId,
      cacheName: this.serviceWorker.cacheName,
      cacheCurrent: this.serviceWorker.current
    });
    if (typeof window !== 'undefined') window.__DOKKAEBI_RELEASE_ASSURANCE_V124__ = this.report;
    return this.report;
  }

  dispose() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', this.resizeHandler);
      window.visualViewport?.removeEventListener?.('resize', this.resizeHandler);
      delete window.__DOKKAEBI_RELEASE_ASSURANCE_V124__;
    }
    if (typeof document !== 'undefined') {
      document.body.classList.remove('release-assurance-v124', 'hud-collision-guard-v124', 'protagonist-direction-fallback-v124');
      delete document.documentElement.dataset.ddReleaseAssuranceV124;
      document.documentElement.style.removeProperty('--v124-boss-top');
      document.documentElement.style.removeProperty('--v124-secondary-top');
    }
  }
}
