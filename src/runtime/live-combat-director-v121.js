export const LIVE_COMBAT_V121_ID = 'DD-LIVE-COMBAT-V121';

export const LIVE_COMBAT_POLICY_V121 = Object.freeze({
  version: '1.0.21',
  build: 'b24.21',
  densityBands: Object.freeze({ calm: 18, active: 34, crowded: 58 }),
  healthPolicy: Object.freeze({
    calm: 'all',
    active: 'all-damaged-priority',
    crowded: 'priority-and-damaged',
    extreme: 'priority-only'
  }),
  topHud: Object.freeze({ measuredSafeLane: true, bossRailGap: 8, mobileRows: 2, desktopLanes: 3 }),
  performance: Object.freeze({ p95PressureMs: 31, severePressurePercent: 2.5, recoveryFps: 54 })
});

const clamp = (value, min, max) => Math.max(min, Math.min(max, Number(value) || 0));

function classifyDensity(score) {
  if (score < LIVE_COMBAT_POLICY_V121.densityBands.calm) return 'calm';
  if (score < LIVE_COMBAT_POLICY_V121.densityBands.active) return 'active';
  if (score < LIVE_COMBAT_POLICY_V121.densityBands.crowded) return 'crowded';
  return 'extreme';
}

function findFocusGroup(enemies = []) {
  const alive = enemies.filter((enemy) => enemy?.group && !enemy.dead && enemy.group.visible !== false);
  const boss = alive.find((enemy) => enemy.boss);
  if (boss) return boss.group;
  let focus = null;
  let score = Infinity;
  for (const enemy of alive) {
    const maxHp = Math.max(1, Number(enemy.maxHp || enemy.hp || 1));
    const hpRatio = Math.max(0, Number(enemy.hp || 0)) / maxHp;
    const candidate = hpRatio + (enemy.elite ? -0.2 : 0) + (enemy.group.userData?.targeted ? -0.4 : 0);
    if (candidate < score) {
      score = candidate;
      focus = enemy.group;
    }
  }
  return focus;
}

export default class LiveCombatDirectorV121 {
  constructor({ combatVisual = null, engine = null, hud = null, bossHealth = null } = {}) {
    this.combatVisual = combatVisual;
    this.engine = engine;
    this.hud = hud;
    this.bossHealth = bossHealth;
    this.elapsed = 0;
    this.mode = 'calm';
    this.pressure = false;
    this.changeSerial = 0;
    this.lastScore = 0;
    this.lastBossTop = 0;
    this.samples = 0;
    this.report = {
      id: LIVE_COMBAT_V121_ID,
      version: LIVE_COMBAT_POLICY_V121.version,
      build: LIVE_COMBAT_POLICY_V121.build,
      density: 'calm',
      pressure: false,
      score: 0,
      changes: 0,
      measuredHud: false,
      worldHpPolicy: LIVE_COMBAT_POLICY_V121.healthPolicy.calm
    };
  }

  install() {
    if (typeof document === 'undefined') return;
    document.body.classList.add('live-combat-v121');
    document.body.dataset.combatDensityV121 = this.mode;
    document.documentElement.style.setProperty('--v121-boss-top', '112px');
    window.__DOKKAEBI_LIVE_COMBAT_V121__ = this.report;
  }

  update(dt, snapshot = {}) {
    this.elapsed += Math.max(0, Number(dt) || 0);
    if (this.elapsed < 0.2) return this.report;
    this.elapsed = 0;
    this.samples += 1;

    const enemies = (snapshot.enemies || []).filter((enemy) => enemy && !enemy.dead);
    const bossCount = enemies.filter((enemy) => enemy.boss).length;
    const regularCount = Math.max(0, enemies.length - bossCount);
    const projectileCount = Math.max(0, Number(snapshot.projectiles || 0));
    const particleCount = Math.max(0, Number(snapshot.particles || 0));
    const hazardCount = Math.max(0, Number(snapshot.hazards || 0));
    const score = regularCount + bossCount * 10 + projectileCount * 0.22 + particleCount * 0.07 + hazardCount * 1.7;
    const nextMode = classifyDensity(score);
    const performance = snapshot.performance || this.engine?.monitor?.snapshot || {};
    const fps = Number(performance.fps || this.engine?.monitor?.lastFps || 60);
    const p95 = Number(performance.p95FrameMs || 16.67);
    const severe = Number(performance.severeFramePercent || 0);
    const pressure = p95 >= LIVE_COMBAT_POLICY_V121.performance.p95PressureMs || severe >= LIVE_COMBAT_POLICY_V121.performance.severePressurePercent || fps < 42;
    const bossActive = bossCount > 0 || Boolean(snapshot.bossActive);
    const focusGroup = findFocusGroup(enemies);

    if (nextMode !== this.mode || pressure !== this.pressure) this.changeSerial += 1;
    this.mode = nextMode;
    this.pressure = pressure;
    this.lastScore = score;

    if (typeof document !== 'undefined') {
      const body = document.body;
      body.dataset.combatDensityV121 = nextMode;
      body.classList.toggle('combat-pressure-v121', pressure);
      body.classList.toggle('combat-boss-active-v121', bossActive);
      const hudRect = this.hud && !this.hud.classList.contains('hidden') ? this.hud.getBoundingClientRect() : null;
      const safeTop = Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--safe-top')) || 0;
      const measuredTop = hudRect ? Math.ceil(hudRect.bottom + 8) : Math.ceil(safeTop + 76);
      const viewportHeight = Math.max(1, window.visualViewport?.height || window.innerHeight || 1);
      const bossTop = clamp(measuredTop, safeTop + 54, Math.max(safeTop + 54, viewportHeight * 0.34));
      document.documentElement.style.setProperty('--v121-boss-top', `${bossTop}px`);
      document.documentElement.style.setProperty('--v121-secondary-top', `${bossTop + (bossActive ? 70 : 8)}px`);
      document.documentElement.style.setProperty('--v121-hp-detail-opacity', nextMode === 'extreme' ? '.72' : nextMode === 'crowded' ? '.84' : '1');
      this.lastBossTop = bossTop;
    }

    this.combatVisual?.setLiveCombatPolicyV121?.({
      densityMode: nextMode,
      pressure,
      bossActive,
      focusGroup
    });

    this.report = Object.freeze({
      id: LIVE_COMBAT_V121_ID,
      version: LIVE_COMBAT_POLICY_V121.version,
      build: LIVE_COMBAT_POLICY_V121.build,
      density: nextMode,
      pressure,
      score: Number(score.toFixed(2)),
      enemies: enemies.length,
      bosses: bossCount,
      projectiles: projectileCount,
      particles: particleCount,
      hazards: hazardCount,
      fps: Number(fps.toFixed(1)),
      p95FrameMs: Number(p95.toFixed(2)),
      changes: this.changeSerial,
      samples: this.samples,
      measuredHud: this.lastBossTop > 0,
      bossTop: this.lastBossTop,
      worldHpPolicy: LIVE_COMBAT_POLICY_V121.healthPolicy[nextMode]
    });
    if (typeof window !== 'undefined') window.__DOKKAEBI_LIVE_COMBAT_V121__ = this.report;
    return this.report;
  }

  dispose() {
    if (typeof document !== 'undefined') {
      document.body.classList.remove('live-combat-v121', 'combat-pressure-v121', 'combat-boss-active-v121');
      delete document.body.dataset.combatDensityV121;
      document.documentElement.style.removeProperty('--v121-boss-top');
      document.documentElement.style.removeProperty('--v121-secondary-top');
      document.documentElement.style.removeProperty('--v121-hp-detail-opacity');
    }
    if (typeof window !== 'undefined') delete window.__DOKKAEBI_LIVE_COMBAT_V121__;
  }
}
