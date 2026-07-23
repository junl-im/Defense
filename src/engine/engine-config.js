export const ENGINE_VERSION = '16.0.0';

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
    desktopEffectScale: 1,
    targetFps: 60,
    telemetryWindowFrames: 240,
    telemetryReportSeconds: 1,
    longFrameMs: 25,
    severeFrameMs: 40,
    p99FrameMs: 50,
    governorBadSamples: 2,
    governorGoodSamples: 3
  },
  assets: {
    textureBudgetLowMB: 64,
    textureBudgetMobileMB: 96,
    textureBudgetDesktopMB: 192,
    preloadTimeoutMs: 12000
  },
  budgets: {
    unitTriangles: 10000,
    enemyTriangles: 9000,
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
    activeEnemiesMobile: 76,
    activeEnemiesDesktop: 128,
    statusEffectsMobile: 96,
    statusEffectsDesktop: 180,
    encounterHistoryEntries: 24,
    elementalReactionsMobile: 72,
    elementalReactionsDesktop: 140,
    bossEscalationStates: 4
  },
  world: {
    chunkSize: 24,
    visibleChunkRadius: 2
  }
});
