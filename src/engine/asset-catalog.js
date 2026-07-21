import { CHARACTER_ASSET_TARGETS, ENVIRONMENT_ASSET_TARGETS, EFFECT_ASSET_TARGETS, IMPOSTOR_SPEC } from '../asset-specs.js';

const keyartUrl = new URL('../assets/moon-market-keyart.webp', import.meta.url).href;
const publicAsset = (path) => `${import.meta.env?.BASE_URL || '/'}assets/${path}`;
const groundTextureUrl = publicAsset('textures/moon-market-ground-v1.webp');
const moonFxAtlasUrl = publicAsset('effects/moon-fx-atlas-v1.webp');
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
    sourceWidth: 1024, sourceHeight: 768, estimatedBytes: 1024 * 768 * 4 * 1.333
  }))
]);

const makeCharacterSlot = (id, category) => Object.freeze({
  id,
  category,
  kind: 'model',
  fallback: `procedural-${id}`,
  variants: Object.freeze({}),
  production: CHARACTER_ASSET_TARGETS[category],
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
    shaman: makeCharacterSlot('monster-shaman', 'monster')
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
  characterModels: 14,
  environmentSets: ENVIRONMENT_ASSET_TARGETS.primarySetCount,
  effectFamilies: 8,
  farLodDirections: IMPOSTOR_SPEC.directions,
  formats: Object.freeze(['glb', 'ktx2', 'webp', 'png']),
  integratedPrototypeAssets: 9
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
