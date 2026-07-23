export { ENGINE_VERSION, MOBILE_ENGINE_CONFIG } from './engine-config.js';
export { MobileGameEngine } from './mobile-engine.js';
export { InstanceBatch } from './instance-batch.js';
export { ObjectPool } from './object-pool.js';
export { GeometryBudget, countObjectTriangles } from './geometry-budget.js';
export { BlobShadowSystem } from './blob-shadow-system.js';
export { TextureAtlas } from './texture-atlas.js';
export { WorldChunkManager } from './world-chunk-manager.js';

export { RenderStatsHUD } from './render-stats-hud.js';
export { AdaptiveQualityGovernor, QUALITY_PROFILES, QUALITY_PROFILE_VERSION } from './quality-governor.js';
export { FrameBudgetScheduler } from './frame-budget-scheduler.js';
export { RuntimeBudgetManager, RUNTIME_BUDGET_MANAGER_VERSION } from './runtime-budget-manager.js';

export { AssetPipeline, ASSET_POLICY } from './asset-pipeline.js';

// Compatibility re-export. Runtime entrypoints import asset IDs from asset-catalog.js directly.
export {
  CORE_ASSET_CATALOG,
  MODEL_ASSET_SLOTS,
  ASSET_QUALITY_TIERS,
  ASSET_PRODUCTION_SUMMARY,
  PLAYER_ASSET_ID,
  GUARDIAN_ASSET_IDS,
  MONSTER_ASSET_IDS,
  BOSS_ASSET_IDS,
  selectAssetVariant
} from './asset-catalog.js';
export { DirectionalImpostorSelector, resolveDirectionalFrame, resolveMirroredAuthoredView } from './directional-impostor.js';

export { AnimationStateSystem, CHARACTER_ANIMATION_STATES } from './animation-state-system.js';
