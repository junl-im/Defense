import { CHARACTER_ASSET_TARGETS, ENVIRONMENT_ASSET_TARGETS, EFFECT_ASSET_TARGETS, IMPOSTOR_SPEC } from '../asset-specs.js';
import { getAssetApproval } from './asset-quality.js';
import { HERO_CLASS_ASSET_IDS } from '../hero-classes.js';

const ASSET_REVISION = '6.0.0';
const keyartBaseUrl = new URL('../assets/moon-market-keyart.webp', import.meta.url);
keyartBaseUrl.searchParams.set('v', ASSET_REVISION);
const keyartUrl = keyartBaseUrl.href;
const runtimeBaseUrl = typeof document !== 'undefined' ? new URL('./', document.baseURI).pathname : '/';
const publicAsset = (path) => `${import.meta.env?.BASE_URL || runtimeBaseUrl}assets/${path}?v=${ASSET_REVISION}`;
const groundTextureUrl = publicAsset('textures/moon-market-ground-v1.webp');
const moonFxAtlasUrl = publicAsset('effects/moon-fx-atlas-v1.webp');
export { HERO_CLASS_ASSET_IDS };
export const PLAYER_ASSET_ID = HERO_CLASS_ASSET_IDS.warrior;
export const GUARDIAN_ASSET_IDS = Object.freeze({
  ember: 'guardian-ember-sd-toon', frost: 'guardian-frost-sd-toon', wind: 'guardian-wind-sd-toon',
  stone: 'guardian-stone-sd-toon', bell: 'guardian-bell-sd-toon', thunder: 'guardian-thunder-sd-toon'
});
export const MONSTER_ASSET_IDS = Object.freeze({
  imp: 'monster-imp-sd-toon', runner: 'monster-runner-sd-toon', brute: 'monster-brute-sd-toon', shaman: 'monster-shaman-sd-toon',
  ghost: 'monster-ghost-candidate-v1', skeleton: 'monster-skeleton-candidate-v1', crow: 'monster-crow-candidate-v1'
});
export const BOSS_ASSET_IDS = Object.freeze({
  tiger: 'boss-tiger-sd-toon', serpent: 'boss-serpent-sd-toon', king: 'boss-king-sd-toon'
});

const sdToonModelUrls = Object.freeze({
  ...Object.fromEntries(Object.values(HERO_CLASS_ASSET_IDS).map((id) => [id, publicAsset(`models/${id}.glb`)])),
  ...Object.fromEntries(Object.values(GUARDIAN_ASSET_IDS).map((id) => [id, publicAsset(`models/${id}.glb`)])),
  ...Object.fromEntries(Object.values(MONSTER_ASSET_IDS).map((id) => [id, publicAsset(`models/${id}.glb`)])),
  ...Object.fromEntries(Object.values(BOSS_ASSET_IDS).map((id) => [id, publicAsset(`models/${id}.glb`)]))
});
const impostorUrls = Object.freeze({
  'ember-idle': publicAsset('impostors/guardian/ember-idle-11.webp'),
  'ember-move': publicAsset('impostors/guardian/ember-move-11.webp'),
  'ember-attack': publicAsset('impostors/guardian/ember-attack-11.webp'),
  'imp-idle': publicAsset('impostors/monster/imp-idle-11.webp'),
  'imp-move': publicAsset('impostors/monster/imp-move-11.webp'),
  'imp-attack': publicAsset('impostors/monster/imp-attack-11.webp')
});

export const ASSET_QUALITY_TIERS = Object.freeze(['low', 'medium', 'high']);

export const CORE_ASSET_CATALOG = Object.freeze([
  {
    id: 'moon-market-keyart', kind: 'texture', required: true, retain: false, color: true,
    variants: { low: keyartUrl, medium: keyartUrl, high: keyartUrl },
    sourceWidth: 1600, sourceHeight: 900, estimatedBytes: 1600 * 900 * 4 * 1.333
  },
  {
    id: 'moon-market-ground-v1', kind: 'texture', required: true, retain: true, color: true,
    variants: { low: groundTextureUrl, medium: groundTextureUrl, high: groundTextureUrl },
    sourceWidth: 1024, sourceHeight: 1024, estimatedBytes: 1024 * 1024 * 4 * 1.333
  },
  {
    id: 'moon-fx-atlas-v1', kind: 'texture', required: true, retain: true, color: true,
    variants: { low: moonFxAtlasUrl, medium: moonFxAtlasUrl, high: moonFxAtlasUrl },
    sourceWidth: 1024, sourceHeight: 1024, estimatedBytes: 1024 * 1024 * 4 * 1.333
  },
  ...Object.entries(impostorUrls).map(([key, url]) => ({
    id: `${key}-impostor-v2`, kind: 'texture', required: false, retain: true, color: true,
    variants: { low: url, medium: url, high: url },
    sourceWidth: 768, sourceHeight: 576, estimatedBytes: 768 * 576 * 4 * 1.333
  })),
  ...Object.entries(sdToonModelUrls).map(([id, url]) => ({
    id, kind: 'model', required: false, retain: true,
    variants: { low: url, medium: url, high: url },
    fallback: `procedural-${id}`,
    approval: getAssetApproval(id)
  }))
]);

const makeCharacterSlot = (id, category) => Object.freeze({
  id,
  category,
  kind: 'model',
  fallback: `procedural-${id}`,
  variants: Object.freeze({}),
  production: CHARACTER_ASSET_TARGETS[category],
  approval: getAssetApproval(id),
  impostor: IMPOSTOR_SPEC
});

const makeEnvironmentSlot = (id, className = 'mediumPropTriangles') => Object.freeze({
  id,
  category: 'environment',
  kind: 'model',
  fallback: `procedural-${id}`,
  variants: Object.freeze({}),
  production: Object.freeze({
    targetTriangles: ENVIRONMENT_ASSET_TARGETS.budgets[className],
    maxMaterials: ENVIRONMENT_ASSET_TARGETS.maxMaterialsPerProp,
    atlasTextureSize: ENVIRONMENT_ASSET_TARGETS.atlasTextureSize
  })
});

const makeEffectSlot = (id) => Object.freeze({
  id,
  category: 'effect',
  kind: 'texture',
  fallback: `procedural-${id}`,
  variants: Object.freeze({}),
  production: EFFECT_ASSET_TARGETS
});

export const MODEL_ASSET_SLOTS = Object.freeze({
  player: makeCharacterSlot('player', 'guardian'),
  heroClasses: Object.freeze(Object.fromEntries(Object.entries(HERO_CLASS_ASSET_IDS).map(([id, assetId]) => [id, makeCharacterSlot(assetId, 'guardian')]))),
  guardians: Object.freeze({
    ember: makeCharacterSlot('guardian-ember', 'guardian'),
    frost: makeCharacterSlot('guardian-frost', 'guardian'),
    wind: makeCharacterSlot('guardian-wind', 'guardian'),
    stone: makeCharacterSlot('guardian-stone', 'guardian'),
    bell: makeCharacterSlot('guardian-bell', 'guardian'),
    thunder: makeCharacterSlot('guardian-thunder', 'guardian')
  }),
  monsters: Object.freeze({
    imp: makeCharacterSlot('monster-imp', 'monster'),
    runner: makeCharacterSlot('monster-runner', 'monster'),
    brute: makeCharacterSlot('monster-brute', 'monster'),
    shaman: makeCharacterSlot('monster-shaman', 'monster'),
    ghost: makeCharacterSlot('monster-ghost', 'monster'),
    skeleton: makeCharacterSlot('monster-skeleton', 'monster'),
    crow: makeCharacterSlot('monster-crow', 'monster')
  }),
  bosses: Object.freeze({
    tiger: makeCharacterSlot('boss-tiger', 'boss'),
    serpent: makeCharacterSlot('boss-serpent', 'boss'),
    king: makeCharacterSlot('boss-king', 'boss')
  }),
  environment: Object.freeze({
    sacredTree: makeEnvironmentSlot('sacred-tree', 'heroLandmarkTriangles'),
    monsterGate: makeEnvironmentSlot('monster-gate', 'heroLandmarkTriangles'),
    marketStall: makeEnvironmentSlot('market-stall'),
    lanternPost: makeEnvironmentSlot('lantern-post', 'smallPropTriangles'),
    jangseung: makeEnvironmentSlot('jangseung'),
    moonJar: makeEnvironmentSlot('moon-jar'),
    groundTile: makeEnvironmentSlot('ground-tile', 'smallPropTriangles'),
    marketClutter: makeEnvironmentSlot('market-clutter', 'instancedClutterTriangles')
  }),
  effects: Object.freeze({
    emberOrb: makeEffectSlot('effect-ember-orb'),
    frostOrb: makeEffectSlot('effect-frost-orb'),
    windArrow: makeEffectSlot('effect-wind-arrow'),
    stoneDrop: makeEffectSlot('effect-stone-drop'),
    spiritChain: makeEffectSlot('effect-spirit-chain'),
    thunderMark: makeEffectSlot('effect-thunder-mark'),
    enemyTelegraph: makeEffectSlot('effect-enemy-telegraph'),
    guardianBurst: makeEffectSlot('effect-guardian-burst')
  })
});

export const ASSET_PRODUCTION_SUMMARY = Object.freeze({
  characterModels: 19,
  environmentSets: ENVIRONMENT_ASSET_TARGETS.primarySetCount,
  effectFamilies: 8,
  farLodDirections: IMPOSTOR_SPEC.directions,
  formats: Object.freeze(['glb', 'ktx2', 'webp', 'png']),
  integratedPrototypeAssets: 37,
  productionApprovedCharacterAssets: 0,
  artReviewCharacterAssets: 8,
  prototypeCharacterAssets: 11,
  styleLockId: 'DD-ABSOLUTE-ART-BIBLE-2.0',
  runtimeLegacyStyleLockId: 'DD-AAA-CASUAL-SD-PBR-3.0',
  absoluteArtBibleCompliantCharacterAssets: 0
});

export function selectAssetVariant(entry, tier = 'high') {
  const variants = entry?.variants || {};
  const order = tier === 'low'
    ? ['low', 'medium', 'high']
    : tier === 'medium'
      ? ['medium', 'low', 'high']
      : ['high', 'medium', 'low'];
  for (const key of order) {
    if (variants[key]) return { tier: key, url: variants[key] };
  }
  return { tier: 'none', url: entry?.url || '' };
}
