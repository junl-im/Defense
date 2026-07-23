export const RUNTIME_BUDGET_MANAGER_VERSION = '1.0.0';

const PROFILE_SCALE = Object.freeze({ cinematic: 1.15, high: 1, balanced: .82, performance: .65 });

export class RuntimeBudgetManager {
  constructor({ config, lowPower = false } = {}) {
    this.config = config || { budgets: {} };
    this.lowPower = lowPower;
    this.pressure = 0;
    this.blocked = { enemies: 0, particles: 0, projectiles: 0, coins: 0 };
    this.lastProfile = 'high';
  }

  update({ profile = 'high', performance = {} } = {}) {
    this.lastProfile = profile;
    const fps = Number(performance.fps || 60);
    const p95 = Number(performance.p95FrameMs || 16.7);
    const severe = Number(performance.severeFramePercent || 0);
    const framePressure = fps < 34 || p95 > 45 || severe > 5 ? 1 : fps < 48 || p95 > 29 ? .55 : 0;
    this.pressure += (framePressure - this.pressure) * .15;
  }

  baseCap(kind) {
    const budgets = this.config.budgets || {};
    const suffix = this.lowPower ? 'Mobile' : 'Desktop';
    const map = {
      enemies: `activeEnemies${suffix}`,
      particles: `activeParticles${suffix}`,
      projectiles: `activeProjectiles${suffix}`,
      coins: `activeCoins${suffix}`
    };
    return Number(budgets[map[kind]] || 60);
  }

  cap(kind, profile = this.lastProfile) {
    const profileScale = PROFILE_SCALE[profile] || 1;
    const pressureScale = 1 - this.pressure * .28;
    return Math.max(8, Math.floor(this.baseCap(kind) * profileScale * pressureScale));
  }

  canSpawn(kind, currentCount, profile = this.lastProfile) {
    const allowed = Number(currentCount || 0) < this.cap(kind, profile);
    if (!allowed) this.blocked[kind] = (this.blocked[kind] || 0) + 1;
    return allowed;
  }

  get diagnostics() {
    return Object.freeze({
      version: RUNTIME_BUDGET_MANAGER_VERSION,
      lowPower: this.lowPower,
      profile: this.lastProfile,
      pressure: Number(this.pressure.toFixed(3)),
      caps: Object.freeze({
        enemies: this.cap('enemies'),
        particles: this.cap('particles'),
        projectiles: this.cap('projectiles'),
        coins: this.cap('coins')
      }),
      blocked: { ...this.blocked }
    });
  }
}

export default RuntimeBudgetManager;
