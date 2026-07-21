export const ENGINE_VERSION = '1.0.6';

export const MOBILE_ENGINE_CONFIG = Object.freeze({
  renderer: {
    mobilePixelRatio: 1.2,
    desktopPixelRatio: 1.65,
    lowEndPixelRatio: 1,
    antialiasMobile: false,
    antialiasDesktop: true,
    shadowsMobile: false,
    shadowsDesktop: false,
    powerPreference: 'high-performance'
  },
  adaptiveQuality: {
    sampleSeconds: 4,
    mediumFps: 48,
    lowFps: 36,
    mediumScale: 0.84,
    lowScale: 0.7,
    recoveryFps: 57,
    recoverySamples: 3
  },
  budgets: {
    unitTriangles: 300,
    enemyTriangles: 500,
    staticDrawCalls: 45,
    dynamicDrawCalls: 95,
    pointLightsMobile: 4,
    activeParticlesMobile: 90,
    activeParticlesDesktop: 180,
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
