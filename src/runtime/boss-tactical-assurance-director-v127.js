export const BOSS_TACTICAL_ASSURANCE_V127_ID = 'DD-BOSS-TACTICAL-ASSURANCE-V127';

export const BOSS_TACTICAL_POLICY_V127 = Object.freeze({
  version: '1.0.27',
  build: 'b24.27',
  waveTarget: 30,
  maxIndicators: 4,
  edgePadding: 42,
  urgentWarningTime: .72,
  cameraAssistHold: .8,
  maxDistanceBonus: 2.8,
  maxFovBonus: 3.2,
  lifecycleSampleLimit: 36,
  approval: Object.freeze({
    protagonistDirectionalRuntime: 'approved',
    protagonistIndependentActionArt: 'derived-provisional',
    bombImpDirectionalArt: 'replacement-pending',
    bombImpRuntime: 'quarantined',
    offscreenHazardRadar: 'approved-runtime',
    bossCameraAssist: 'approved-runtime'
  })
});

const finite = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const average = (rows, key) => rows.reduce((sum, row) => sum + finite(row?.[key], 0), 0) / Math.max(1, rows.length);

export function classifyOffscreenPointV127(ndc = {}, { behind = false, padding = .1 } = {}) {
  let x = finite(ndc.x, 0);
  let y = finite(ndc.y, 0);
  if (behind) {
    x *= -1;
    y *= -1;
  }
  const limit = clamp(1 - Math.max(0, finite(padding, .1)), .55, .96);
  const onScreen = !behind && finite(ndc.z, 0) >= -1 && finite(ndc.z, 0) <= 1 && Math.abs(x) <= limit && Math.abs(y) <= limit;
  if (onScreen) return Object.freeze({ onScreen: true, edge: 'inside', x, y, angle: 0 });
  const scale = Math.max(Math.abs(x) / limit, Math.abs(y) / limit, .0001);
  const edgeX = clamp(x / scale, -limit, limit);
  const edgeY = clamp(y / scale, -limit, limit);
  let edge = 'top';
  if (Math.abs(edgeX) >= Math.abs(edgeY)) edge = edgeX < 0 ? 'left' : 'right';
  else edge = edgeY < 0 ? 'bottom' : 'top';
  return Object.freeze({
    onScreen: false,
    edge,
    x: edgeX,
    y: edgeY,
    angle: Math.atan2(edgeY, edgeX)
  });
}

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

function warningRemaining(hazard) {
  if (!hazard || hazard.phase !== 'warning') return Infinity;
  return Math.max(0, finite(hazard.warning, Infinity));
}

function makeIndicator(index) {
  const node = document.createElement('div');
  node.className = 'offscreen-hazard-indicator-v127';
  node.dataset.indicatorIndex = String(index);
  node.setAttribute('aria-hidden', 'true');
  node.innerHTML = '<span class="offscreen-hazard-arrow-v127">▲</span><b>위험</b><small></small>';
  return node;
}

export default class BossTacticalAssuranceDirectorV127 {
  constructor({ camera = null, player = null, hud = null, bossHealth = null, combatVisual = null } = {}) {
    this.camera = camera;
    this.player = player;
    this.hud = hud;
    this.bossHealth = bossHealth;
    this.combatVisual = combatVisual;
    this.root = null;
    this.indicators = [];
    this.elapsed = 0;
    this.layoutElapsed = 0;
    this.cameraAssistTimer = 0;
    this.cameraAssist = Object.seal({
      active: false,
      distanceBonus: 0,
      fovBonus: 0,
      focusWeight: 0,
      focus: null,
      reason: 'none'
    });
    this.lastWave = 0;
    this.waveSamples = [];
    this.offscreenWarnings = 0;
    this.urgentOffscreenWarnings = 0;
    this.peakOffscreenWarnings = 0;
    this.cameraAssistActivations = 0;
    this.compactHudFrames = 0;
    this.report = Object.freeze({
      id: BOSS_TACTICAL_ASSURANCE_V127_ID,
      version: BOSS_TACTICAL_POLICY_V127.version,
      build: BOSS_TACTICAL_POLICY_V127.build,
      viewportProfile: viewportProfile(),
      bossActive: false,
      offscreenWarnings: 0,
      urgentOffscreenWarnings: 0,
      peakOffscreenWarnings: 0,
      cameraAssistActive: false,
      cameraAssistReason: 'none',
      thirtyWaveTargetReached: false,
      lifecycleHealthy: true,
      approval: BOSS_TACTICAL_POLICY_V127.approval
    });
    this.resizeHandler = () => this.applyViewportProfile();
  }

  install() {
    if (typeof document === 'undefined') return this.report;
    document.documentElement.dataset.ddBossTacticalV127 = 'ready';
    document.body.classList.add('boss-tactical-assurance-v127');
    this.root = document.getElementById('offscreen-hazard-radar-v127') || document.createElement('div');
    this.root.id = 'offscreen-hazard-radar-v127';
    this.root.className = 'offscreen-hazard-radar-v127';
    this.root.setAttribute('aria-hidden', 'true');
    if (!this.root.parentNode) document.body.appendChild(this.root);
    this.indicators = Array.from({ length: BOSS_TACTICAL_POLICY_V127.maxIndicators }, (_, index) => {
      const node = makeIndicator(index);
      this.root.appendChild(node);
      return node;
    });
    window.addEventListener('resize', this.resizeHandler, { passive: true });
    window.visualViewport?.addEventListener?.('resize', this.resizeHandler, { passive: true });
    this.applyViewportProfile();
    window.__DOKKAEBI_BOSS_TACTICAL_V127__ = this.report;
    return this.report;
  }

  setReferences({ camera, player } = {}) {
    if (camera) this.camera = camera;
    if (player) this.player = player;
  }

  applyViewportProfile() {
    if (typeof document === 'undefined') return 'server';
    const profile = viewportProfile();
    document.documentElement.dataset.v127Viewport = profile;
    document.body.classList.toggle('boss-hud-compact-v127', profile === 'mobile-landscape-short');
    return profile;
  }

  projectHazard(hazard) {
    const position = hazard?.position;
    const camera = this.camera;
    if (!position || !camera || typeof position.clone !== 'function') return null;
    const projected = position.clone().project(camera);
    let behind = false;
    if (typeof camera.getWorldDirection === 'function' && camera.position && typeof position.clone === 'function') {
      const direction = position.clone().sub(camera.position);
      const forward = camera.getWorldDirection(position.clone().set(0, 0, -1));
      behind = direction.dot(forward) <= 0;
    }
    const classified = classifyOffscreenPointV127(projected, { behind, padding: .12 });
    return { ...classified, projected, behind };
  }

  renderIndicators(hazards = []) {
    if (!this.root || !this.indicators.length) return [];
    const width = Math.max(1, window.visualViewport?.width || window.innerWidth || 1);
    const height = Math.max(1, window.visualViewport?.height || window.innerHeight || 1);
    const padding = Math.max(BOSS_TACTICAL_POLICY_V127.edgePadding, Math.min(width, height) * .055);
    const candidates = [];
    for (const hazard of Array.isArray(hazards) ? hazards : []) {
      if (!hazard || hazard.phase !== 'warning') continue;
      const projection = this.projectHazard(hazard);
      if (!projection || projection.onScreen) continue;
      const remaining = warningRemaining(hazard);
      candidates.push({ hazard, projection, remaining });
    }
    candidates.sort((a, b) => a.remaining - b.remaining || finite(b.hazard?.radius, 0) - finite(a.hazard?.radius, 0));
    this.offscreenWarnings = candidates.length;
    this.urgentOffscreenWarnings = candidates.filter((entry) => entry.remaining <= BOSS_TACTICAL_POLICY_V127.urgentWarningTime).length;
    this.peakOffscreenWarnings = Math.max(this.peakOffscreenWarnings, candidates.length);
    this.root.classList.toggle('urgent', this.urgentOffscreenWarnings > 0);
    this.indicators.forEach((node, index) => {
      const entry = candidates[index];
      node.classList.toggle('visible', Boolean(entry));
      if (!entry) return;
      const px = clamp((entry.projection.x * .5 + .5) * width, padding, width - padding);
      const py = clamp((-entry.projection.y * .5 + .5) * height, padding, height - padding);
      node.style.left = `${px}px`;
      node.style.top = `${py}px`;
      node.style.setProperty('--hazard-angle-v127', `${entry.projection.angle + Math.PI / 2}rad`);
      node.dataset.edge = entry.projection.edge;
      node.classList.toggle('critical', entry.remaining <= BOSS_TACTICAL_POLICY_V127.urgentWarningTime);
      const time = node.querySelector('small');
      if (time) time.textContent = `${Math.max(.1, entry.remaining).toFixed(1)}초`;
    });
    return candidates;
  }

  updateCameraAssist(dt, { boss = null, offscreen = [], hazards = [] } = {}) {
    const delta = Math.max(0, finite(dt, 0));
    const urgent = offscreen.find((entry) => entry.remaining <= BOSS_TACTICAL_POLICY_V127.urgentWarningTime) || null;
    let target = null;
    let reason = 'none';
    let distanceBonus = 0;
    let fovBonus = 0;
    let focusWeight = 0;
    if (urgent?.hazard?.position) {
      target = urgent.hazard.position;
      reason = 'offscreen-hazard';
      distanceBonus = BOSS_TACTICAL_POLICY_V127.maxDistanceBonus;
      fovBonus = BOSS_TACTICAL_POLICY_V127.maxFovBonus;
      focusWeight = .18;
      this.cameraAssistTimer = BOSS_TACTICAL_POLICY_V127.cameraAssistHold;
    } else if (boss?.position && boss.intentUrgency === 'critical') {
      target = boss.position;
      reason = 'boss-critical-intent';
      distanceBonus = 1.4;
      fovBonus = 1.8;
      focusWeight = .12;
      this.cameraAssistTimer = BOSS_TACTICAL_POLICY_V127.cameraAssistHold * .75;
    } else if (this.cameraAssistTimer > 0) {
      this.cameraAssistTimer = Math.max(0, this.cameraAssistTimer - delta);
      reason = this.cameraAssist.reason;
      target = this.cameraAssist.focus;
      const retain = clamp(this.cameraAssistTimer / BOSS_TACTICAL_POLICY_V127.cameraAssistHold, 0, 1);
      distanceBonus = this.cameraAssist.distanceBonus * retain;
      fovBonus = this.cameraAssist.fovBonus * retain;
      focusWeight = this.cameraAssist.focusWeight * retain;
    }
    const wasActive = this.cameraAssist.active;
    this.cameraAssist.active = Boolean(reason !== 'none' && (distanceBonus > .05 || focusWeight > .01));
    this.cameraAssist.distanceBonus = clamp(distanceBonus, 0, BOSS_TACTICAL_POLICY_V127.maxDistanceBonus);
    this.cameraAssist.fovBonus = clamp(fovBonus, 0, BOSS_TACTICAL_POLICY_V127.maxFovBonus);
    this.cameraAssist.focusWeight = clamp(focusWeight, 0, .22);
    this.cameraAssist.focus = target || null;
    this.cameraAssist.reason = reason;
    if (!wasActive && this.cameraAssist.active) this.cameraAssistActivations += 1;
    if (!this.cameraAssist.active) {
      this.cameraAssist.reason = 'none';
      this.cameraAssist.focus = null;
    }
    if (typeof document !== 'undefined') {
      document.body.classList.toggle('boss-camera-assist-v127', this.cameraAssist.active);
      document.body.dataset.v127CameraReason = this.cameraAssist.reason;
    }
    return this.cameraAssist;
  }

  sampleWave(snapshot = {}) {
    const wave = Math.max(0, Math.floor(finite(snapshot.wave, 0)));
    if (!wave || wave === this.lastWave) return;
    this.lastWave = wave;
    const memoryBytes = typeof performance !== 'undefined' ? finite(performance.memory?.usedJSHeapSize, 0) : 0;
    const visual = this.combatVisual?.diagnostics || {};
    this.waveSamples.push(Object.freeze({
      wave,
      enemies: Math.max(0, Math.floor(finite(snapshot.enemies, 0))),
      particles: Math.max(0, Math.floor(finite(snapshot.particles, 0))),
      projectiles: Math.max(0, Math.floor(finite(snapshot.projectiles, 0))),
      hazards: Math.max(0, Math.floor(finite(snapshot.hazards?.length, 0))),
      activeRecords: Math.max(0, Math.floor(finite(visual.activeRecords, 0))),
      memoryMb: memoryBytes > 0 ? Math.round(memoryBytes / 1048576 * 10) / 10 : null
    }));
    if (this.waveSamples.length > BOSS_TACTICAL_POLICY_V127.lifecycleSampleLimit) this.waveSamples.shift();
  }

  lifecycleHealthy() {
    if (this.waveSamples.length < 8) return true;
    const count = Math.min(5, Math.floor(this.waveSamples.length / 2));
    const early = this.waveSamples.slice(0, count);
    const late = this.waveSamples.slice(-count);
    const particleGrowth = average(late, 'particles') - average(early, 'particles');
    const projectileGrowth = average(late, 'projectiles') - average(early, 'projectiles');
    const recordGrowth = average(late, 'activeRecords') - average(early, 'activeRecords');
    const memoryEarly = early.filter((row) => row.memoryMb !== null);
    const memoryLate = late.filter((row) => row.memoryMb !== null);
    const memoryGrowth = memoryEarly.length && memoryLate.length ? average(memoryLate, 'memoryMb') - average(memoryEarly, 'memoryMb') : 0;
    return particleGrowth <= 120 && projectileGrowth <= 48 && recordGrowth <= 24 && memoryGrowth <= 64;
  }

  update(dt, snapshot = {}) {
    const delta = Math.max(0, finite(dt, 0));
    this.elapsed += delta;
    this.layoutElapsed += delta;
    if (snapshot.camera || snapshot.player) this.setReferences({ camera: snapshot.camera, player: snapshot.player });
    const offscreen = this.renderIndicators(snapshot.hazards);
    const boss = snapshot.boss || null;
    this.updateCameraAssist(delta, { boss, offscreen, hazards: snapshot.hazards });
    this.sampleWave(snapshot);
    const profile = this.applyViewportProfile();
    if (profile === 'mobile-landscape-short' && boss) this.compactHudFrames += 1;
    const report = Object.freeze({
      id: BOSS_TACTICAL_ASSURANCE_V127_ID,
      version: BOSS_TACTICAL_POLICY_V127.version,
      build: BOSS_TACTICAL_POLICY_V127.build,
      viewportProfile: profile,
      bossActive: Boolean(boss),
      offscreenWarnings: this.offscreenWarnings,
      urgentOffscreenWarnings: this.urgentOffscreenWarnings,
      peakOffscreenWarnings: this.peakOffscreenWarnings,
      cameraAssistActive: this.cameraAssist.active,
      cameraAssistReason: this.cameraAssist.reason,
      cameraAssistActivations: this.cameraAssistActivations,
      compactHudFrames: this.compactHudFrames,
      latestWave: this.lastWave,
      thirtyWaveTargetReached: this.lastWave >= BOSS_TACTICAL_POLICY_V127.waveTarget,
      lifecycleHealthy: this.lifecycleHealthy(),
      samples: this.waveSamples.slice(),
      approval: BOSS_TACTICAL_POLICY_V127.approval
    });
    this.report = report;
    if (typeof window !== 'undefined') window.__DOKKAEBI_BOSS_TACTICAL_V127__ = report;
    return report;
  }

  getCameraDirective() {
    return this.cameraAssist;
  }

  dispose() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', this.resizeHandler);
      window.visualViewport?.removeEventListener?.('resize', this.resizeHandler);
    }
    this.root?.remove?.();
    this.root = null;
    this.indicators = [];
  }
}
