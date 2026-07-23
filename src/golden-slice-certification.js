export const GOLDEN_SLICE_CERTIFICATION_VERSION = '13.0.0';
export const GOLDEN_SLICE_CERTIFICATION_ID = 'DD-GVS-RUNTIME-2026-01';

export const GOLDEN_SLICE_RUNTIME_CERTIFICATION = Object.freeze([
  Object.freeze({
    id: 'GVS-HERO-WARRIOR', category: 'hero', label: '도깨비 전사', status: 'runtime-certified',
    runtimeAsset: 'public/assets/models/player-dokkaebi-warrior-golden-v1.glb',
    presentationAsset: 'public/assets/ip-v10/presentation/characters/hero_dokkaebi_warrior.png',
    silhouetteAsset: 'public/assets/ip-v10/silhouettes/characters/hero_dokkaebi_warrior.png',
    evidence: Object.freeze(['style-lock', 'dna-contract', 'rigged-runtime-model', 'seven-authored-clips-plus-runtime-state-layer', 'transparent-review-derivative', 'silhouette-review-derivative', 'mobile-budget'])
  }),
  Object.freeze({
    id: 'GVS-MONSTER-GRUNT', category: 'monster', label: '일반 요괴', status: 'runtime-certified',
    runtimeAsset: 'public/assets/models/monster-skeleton-candidate-v1.glb',
    presentationAsset: 'public/assets/ip-v10/presentation/monsters/monster_skeleton_guard.png',
    silhouetteAsset: 'public/assets/ip-v10/silhouettes/monsters/monster_skeleton_guard.png',
    evidence: Object.freeze(['cute-cool-lock', 'rigged-runtime-model', 'combat-role', 'status-hit-routing', 'transparent-review-derivative', 'silhouette-review-derivative', 'mobile-budget'])
  }),
  Object.freeze({
    id: 'GVS-BOSS-TIGER', category: 'boss', label: '저승 호랑이', status: 'runtime-certified',
    runtimeAsset: 'public/assets/models/boss-tiger-sd-toon.glb',
    presentationAsset: 'public/assets/ip-v10/presentation/monsters/pet_tiger_guardian.png',
    silhouetteAsset: 'public/assets/ip-v10/silhouettes/monsters/pet_tiger_guardian.png',
    evidence: Object.freeze(['boss-scale-contract', 'phase-runtime', 'break-runtime', 'enrage-runtime', 'telegraph-runtime', 'silhouette-review-derivative', 'mobile-budget'])
  }),
  Object.freeze({
    id: 'GVS-ENV-MOON-MARKET', category: 'environment', label: '도깨비마을 전장', status: 'runtime-certified',
    runtimeAsset: 'src/main.js#createWorld',
    evidence: Object.freeze(['large-shape-language', 'soft-edge-materials', 'warm-key-cool-rim', 'landmark-layout', 'chunk-culling', 'navigation-obstacles', 'scenic-camera-coverage'])
  }),
  Object.freeze({
    id: 'GVS-UI-COMBAT', category: 'ui', label: '전투 HUD', status: 'runtime-certified',
    runtimeAsset: 'index.html#hud',
    evidence: Object.freeze(['gold-border', 'blue-glow', 'rounded-depth', 'drop-shadow', 'hover-105', 'pressed-95', 'six-layout-stress-contract'])
  }),
  Object.freeze({
    id: 'GVS-VFX-COMBAT', category: 'vfx', label: '전투 VFX', status: 'runtime-certified',
    runtimeAsset: 'src/combat-presentation.js',
    presentationAsset: 'public/assets/ip-v10/presentation/vfx/vfx_blue_slash.png',
    evidence: Object.freeze(['outer-inner-glow', 'gradient-noise-minimal', 'round-particle-language', 'reaction-routing', 'boss-telegraph', 'adaptive-particle-budget', 'reduced-motion-support'])
  })
]);

export function summarizeGoldenSliceCertification(entries = GOLDEN_SLICE_RUNTIME_CERTIFICATION) {
  const runtimeCertified = entries.filter((entry) => entry.status === 'runtime-certified').length;
  return Object.freeze({
    version: GOLDEN_SLICE_CERTIFICATION_VERSION,
    certificationId: GOLDEN_SLICE_CERTIFICATION_ID,
    total: entries.length,
    runtimeCertified,
    runtimePassed: runtimeCertified === entries.length,
    productionArtApproved: 0,
    productionArtRequired: entries.length,
    massProductionUnlocked: false,
    distinction: 'Runtime vertical-slice certification is complete; final production-art approval remains locked until final authored deliverables exist.'
  });
}

export const GOLDEN_SLICE_CERTIFICATION_SUMMARY = summarizeGoldenSliceCertification();
