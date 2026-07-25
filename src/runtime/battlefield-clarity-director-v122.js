export const BATTLEFIELD_CLARITY_V122_ID = 'DD-BATTLEFIELD-CLARITY-V122';

export const BATTLEFIELD_CLARITY_POLICY_V122 = Object.freeze({
  version: '1.0.22',
  build: 'b24.22',
  direction: Object.freeze({ idleHoldMs: 110, moveHoldMs: 62, combatHoldMs: 28, actionLockMs: 150 }),
  overlap: Object.freeze({ horizontalNdc: 0.085, verticalNdc: 0.052, maxLanes: 5 }),
  layout: Object.freeze({ bossGap: 10, secondaryGap: 8, compactViewportHeight: 640 }),
  sustainedPressure: Object.freeze({ enterSeconds: 4.5, exitSeconds: 7.5, recoveryFps: 53, pressureFps: 43 })
});

const clamp = (value, min, max) => Math.max(min, Math.min(max, Number(value) || 0));

export default class BattlefieldClarityDirectorV122 {
  constructor({ combatVisual = null, liveCombat = null, hud = null, bossHealth = null } = {}) {
    this.combatVisual = combatVisual;
    this.liveCombat = liveCombat;
    this.hud = hud;
    this.bossHealth = bossHealth;
    this.elapsed = 0;
    this.layoutElapsed = 0;
    this.pressureSeconds = 0;
    this.recoverySeconds = 0;
    this.sustainedPressure = false;
    this.layoutUpdates = 0;
    this.policyUpdates = 0;
    this.observer = null;
    this.viewportHandler = () => this.measureLayout(true);
    this.report = Object.freeze({
      id: BATTLEFIELD_CLARITY_V122_ID,
      version: BATTLEFIELD_CLARITY_POLICY_V122.version,
      build: BATTLEFIELD_CLARITY_POLICY_V122.build,
      sustainedPressure: false,
      compactLayout: false,
      hudBottom: 0,
      bossTop: 0,
      secondaryTop: 0,
      layoutUpdates: 0,
      policyUpdates: 0
    });
  }

  install() {
    if (typeof document === 'undefined') return this.report;
    document.body.classList.add('battlefield-clarity-v122');
    if (typeof ResizeObserver !== 'undefined') {
      this.observer = new ResizeObserver(() => this.measureLayout(true));
      if (this.hud) this.observer.observe(this.hud);
      if (this.bossHealth) this.observer.observe(this.bossHealth);
    }
    window.visualViewport?.addEventListener?.('resize', this.viewportHandler, { passive: true });
    window.addEventListener('resize', this.viewportHandler, { passive: true });
    this.measureLayout(true);
    window.__DOKKAEBI_BATTLEFIELD_CLARITY_V122__ = this.report;
    return this.report;
  }

  measureLayout(force = false) {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    const safeTop = Number.parseFloat(getComputedStyle(root).getPropertyValue('--safe-top')) || 0;
    const viewportHeight = Math.max(1, window.visualViewport?.height || window.innerHeight || 1);
    const hudRect = this.hud && !this.hud.classList.contains('hidden') ? this.hud.getBoundingClientRect() : null;
    const hudBottom = Math.ceil(Math.max(safeTop + 52, hudRect?.bottom || 0));
    const bossHeight = this.bossHealth && !this.bossHealth.classList.contains('hidden')
      ? Math.ceil(this.bossHealth.getBoundingClientRect().height || 64)
      : 64;
    const bossTop = clamp(hudBottom + BATTLEFIELD_CLARITY_POLICY_V122.layout.bossGap, safeTop + 58, viewportHeight * 0.38);
    const secondaryTop = clamp(bossTop + bossHeight + BATTLEFIELD_CLARITY_POLICY_V122.layout.secondaryGap, bossTop + 56, viewportHeight * 0.59);
    const compactLayout = viewportHeight <= BATTLEFIELD_CLARITY_POLICY_V122.layout.compactViewportHeight || secondaryTop > viewportHeight * 0.47;
    root.style.setProperty('--v122-hud-bottom', `${hudBottom}px`);
    root.style.setProperty('--v122-boss-top', `${bossTop}px`);
    root.style.setProperty('--v122-secondary-top', `${secondaryTop}px`);
    document.body.classList.toggle('battlefield-compact-v122', compactLayout);
    if (force || this.report.hudBottom !== hudBottom || this.report.bossTop !== bossTop || this.report.secondaryTop !== secondaryTop) this.layoutUpdates += 1;
    this.report = Object.freeze({ ...this.report, compactLayout, hudBottom, bossTop, secondaryTop, layoutUpdates: this.layoutUpdates });
    if (typeof window !== 'undefined') window.__DOKKAEBI_BATTLEFIELD_CLARITY_V122__ = this.report;
  }

  update(dt, snapshot = {}) {
    const delta = Math.max(0, Number(dt) || 0);
    this.elapsed += delta;
    this.layoutElapsed += delta;
    if (this.layoutElapsed >= 0.33) {
      this.layoutElapsed = 0;
      this.measureLayout(false);
    }

    const live = snapshot.liveCombat || this.liveCombat?.report || {};
    const performance = snapshot.performance || {};
    const fps = Number(performance.fps || snapshot.fps || live.fps || 60);
    const pressureNow = Boolean(live.pressure) || fps < BATTLEFIELD_CLARITY_POLICY_V122.sustainedPressure.pressureFps;
    if (pressureNow) {
      this.pressureSeconds += delta;
      this.recoverySeconds = 0;
    } else if (fps >= BATTLEFIELD_CLARITY_POLICY_V122.sustainedPressure.recoveryFps) {
      this.recoverySeconds += delta;
      this.pressureSeconds = Math.max(0, this.pressureSeconds - delta * 0.7);
    }
    if (!this.sustainedPressure && this.pressureSeconds >= BATTLEFIELD_CLARITY_POLICY_V122.sustainedPressure.enterSeconds) this.sustainedPressure = true;
    if (this.sustainedPressure && this.recoverySeconds >= BATTLEFIELD_CLARITY_POLICY_V122.sustainedPressure.exitSeconds) {
      this.sustainedPressure = false;
      this.pressureSeconds = 0;
    }

    const density = live.density || 'calm';
    const directionHoldScale = this.sustainedPressure ? 1.35 : density === 'extreme' ? 1.18 : density === 'crowded' ? 1.08 : 1;
    this.combatVisual?.setBattlefieldClarityPolicyV122?.({
      sustainedPressure: this.sustainedPressure,
      density,
      directionHoldScale,
      healthLaneSpacing: density === 'extreme' ? 1.28 : density === 'crowded' ? 1.12 : 1,
      suppressMonsterAura: this.sustainedPressure || density === 'extreme'
    });
    this.policyUpdates += 1;

    if (typeof document !== 'undefined') {
      document.body.classList.toggle('battlefield-pressure-v122', this.sustainedPressure);
      document.body.dataset.battlefieldDensityV122 = density;
    }
    this.report = Object.freeze({
      ...this.report,
      sustainedPressure: this.sustainedPressure,
      pressureSeconds: Number(this.pressureSeconds.toFixed(2)),
      recoverySeconds: Number(this.recoverySeconds.toFixed(2)),
      fps: Number(fps.toFixed(1)),
      density,
      policyUpdates: this.policyUpdates
    });
    if (typeof window !== 'undefined') window.__DOKKAEBI_BATTLEFIELD_CLARITY_V122__ = this.report;
    return this.report;
  }

  dispose() {
    this.observer?.disconnect?.();
    window.visualViewport?.removeEventListener?.('resize', this.viewportHandler);
    window.removeEventListener?.('resize', this.viewportHandler);
    if (typeof document !== 'undefined') {
      document.body.classList.remove('battlefield-clarity-v122', 'battlefield-compact-v122', 'battlefield-pressure-v122');
      delete document.body.dataset.battlefieldDensityV122;
      for (const name of ['--v122-hud-bottom', '--v122-boss-top', '--v122-secondary-top']) document.documentElement.style.removeProperty(name);
    }
    if (typeof window !== 'undefined') delete window.__DOKKAEBI_BATTLEFIELD_CLARITY_V122__;
  }
}
