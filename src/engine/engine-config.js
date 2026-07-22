export const ENGINE_VERSION = '2.2.0';

export const MOBILE_ENGINE_CONFIG = Object.freeze({
  renderer: {
    mobilePixelRatio: 1.2,
    desktopPixelRatio: 1.65,
    lowEndPixelRatio: 1,
    antialiasMobile: false,
    antialiasDesktop: true,
    shadowsMobile: false,
    shadowsDesktop: true,
    powerPreference: 'high-performance'
  },
  adaptiveQuality: {
    sampleSeconds: 4,
    mediumFps: 48,
    lowFps: 36,
    mediumScale: 0.84,
    lowScale: 0.7,
    recoveryFps: 57,
    recoverySamples: 3,
    lowEffectScale: .48,
    mediumEffectScale: .7,
    mobileEffectScale: .82,
    desktopEffectScale: 1
  },
  assets: {
    textureBudgetLowMB: 64,
    textureBudgetMobileMB: 96,
    textureBudgetDesktopMB: 192,
    preloadTimeoutMs: 12000
  },
  budgets: {
    unitTriangles: 5600,
    enemyTriangles: 3200,
    bossTriangles: 9000,
    staticDrawCalls: 45,
    dynamicDrawCalls: 95,
    pointLightsMobile: 4,
    activeParticlesMobile: 80,
    activeParticlesDesktop: 150,
    activeProjectilesMobile: 56,
    activeProjectilesDesktop: 96,
    activeCoinsMobile: 72,
    activeCoinsDesktop: 120,
    activeEnemiesMobile: 72,
    activeEnemiesDesktop: 120
  },
  world: {
    chunkSize: 24,
    visibleChunkRadius: 1
  }
});
