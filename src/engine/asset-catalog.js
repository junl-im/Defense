import { CACHE_REVISION } from '../version-policy.js';
import { CHARACTER_ASSET_TARGETS, ENVIRONMENT_ASSET_TARGETS, EFFECT_ASSET_TARGETS, IMPOSTOR_SPEC } from '../asset-specs.js';
import { getAssetApproval } from './asset-quality.js';
import { HERO_CLASS_ASSET_IDS } from '../hero-classes.js';

const ASSET_REVISION = CACHE_REVISION;
// const ASSET_REVISION = '23.1.0'; historical lineage marker.
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

export const COMBAT_ART_TEXTURE_IDS = Object.freeze({
  heroes: Object.freeze({
    warrior: 'combat-art-hero-warrior-v109',
    archer: 'combat-art-hero-archer-v109',
    mage: 'combat-art-hero-mage-v109',
    shaman: 'combat-art-hero-shaman-v109',
    taoist: 'combat-art-hero-taoist-v109'
  }),
  guardians: Object.freeze({
    ember: 'combat-art-guardian-ember-v109',
    frost: 'combat-art-guardian-frost-v109',
    wind: 'combat-art-guardian-wind-v109',
    stone: 'combat-art-guardian-stone-v109',
    bell: 'combat-art-guardian-bell-v109',
    thunder: 'combat-art-guardian-thunder-v109'
  }),
  monsters: Object.freeze({
    imp: 'combat-art-monster-imp-v109',
    runner: 'combat-art-monster-runner-v109',
    brute: 'combat-art-monster-brute-v109',
    shaman: 'combat-art-monster-shaman-v109',
    ghost: 'combat-art-monster-ghost-v109',
    skeleton: 'combat-art-monster-skeleton-v109',
    crow: 'combat-art-monster-crow-v109'
  }),
  bosses: Object.freeze({
    tiger: 'combat-art-boss-tiger-v109',
    serpent: 'combat-art-boss-serpent-v109',
    king: 'combat-art-boss-king-v109'
  })
});



export const P0_DIRECTIONAL_ATLAS_IDS = Object.freeze({
  heroes: Object.freeze({ warrior: 'p0-directional-hero-warrior-v112' }),
  guardians: Object.freeze({ ember: 'p0-directional-guardian-ember-v112' }),
  monsters: Object.freeze({ imp: 'p0-directional-monster-imp-v112' }),
  bosses: Object.freeze({ tiger: 'p0-directional-boss-tiger-v112' })
});

export const P0_DIRECTIONAL_ATLAS_SPEC_V112 = Object.freeze({
  directions: 11,
  states: Object.freeze(['idle', 'move', 'attack', 'skill', 'hit', 'death']),
  columns: 11,
  rows: 6,
  authoredDirections: true,
  mirroringAllowed: false,
  atlasCount: 4,
  frameCount: 264
});


export const APPROVED_DIRECTIONAL_ATLAS_IDS_V117 = Object.freeze({
  guardians: Object.freeze({ ember: 'approved-directional-guardian-ember-pupu-v117' })
});

export const APPROVED_DIRECTIONAL_ATLAS_SPEC_V117 = Object.freeze({
  version: '1.0.17', build: 'b24.17', directions: 11, states: 6,
  columns: 11, rows: 6, directionArtApproved: true,
  actionArtApproved: false, actionRowsDerivedProvisional: 5,
  mirroringAllowed: false, runtimeEntitiesApproved: 1
});

export const GUARDIAN_CITADEL_TEXTURE_ID = 'guardian-citadel-art-v110';
export const GUARDIAN_CITADEL_STATE_TEXTURE_IDS_V114 = Object.freeze({
  stable: GUARDIAN_CITADEL_TEXTURE_ID,
  shielded: 'guardian-citadel-shielded-v114',
  cracked: 'guardian-citadel-cracked-v114',
  critical: 'guardian-citadel-critical-v114'
});


export const GUARDIAN_CITADEL_STATE_TEXTURE_IDS_V117 = Object.freeze({
  stable: 'guardian-citadel-stable-v117',
  shielded: 'guardian-citadel-shielded-v117',
  cracked: 'guardian-citadel-cracked-v117',
  critical: 'guardian-citadel-critical-v117'
});

const polishedVariantsV114 = (folder, slug) => Object.freeze({
  low: publicAsset(`visual-v114/${folder}/${slug}-low-v114.webp`),
  medium: publicAsset(`visual-v114/${folder}/${slug}-medium-v114.webp`),
  high: publicAsset(`visual-v114/${folder}/${slug}-high-v114.webp`)
});

const combatArtTextureVariantsV114 = Object.freeze({
  [COMBAT_ART_TEXTURE_IDS.heroes.warrior]: polishedVariantsV114('characters', 'hero-warrior'),
  [COMBAT_ART_TEXTURE_IDS.heroes.archer]: polishedVariantsV114('characters', 'hero-archer'),
  [COMBAT_ART_TEXTURE_IDS.heroes.mage]: polishedVariantsV114('characters', 'hero-mage'),
  [COMBAT_ART_TEXTURE_IDS.heroes.shaman]: polishedVariantsV114('characters', 'hero-shaman'),
  [COMBAT_ART_TEXTURE_IDS.heroes.taoist]: polishedVariantsV114('characters', 'hero-taoist'),
  [COMBAT_ART_TEXTURE_IDS.guardians.ember]: polishedVariantsV114('characters', 'guardian-ember'),
  [COMBAT_ART_TEXTURE_IDS.guardians.frost]: polishedVariantsV114('characters', 'guardian-frost'),
  [COMBAT_ART_TEXTURE_IDS.guardians.wind]: polishedVariantsV114('characters', 'guardian-wind'),
  [COMBAT_ART_TEXTURE_IDS.guardians.stone]: polishedVariantsV114('characters', 'guardian-stone'),
  [COMBAT_ART_TEXTURE_IDS.guardians.bell]: polishedVariantsV114('characters', 'guardian-bell'),
  [COMBAT_ART_TEXTURE_IDS.guardians.thunder]: polishedVariantsV114('characters', 'guardian-thunder'),
  [COMBAT_ART_TEXTURE_IDS.monsters.imp]: polishedVariantsV114('characters', 'monster-imp'),
  [COMBAT_ART_TEXTURE_IDS.monsters.runner]: polishedVariantsV114('characters', 'monster-runner'),
  [COMBAT_ART_TEXTURE_IDS.monsters.brute]: polishedVariantsV114('characters', 'monster-brute'),
  [COMBAT_ART_TEXTURE_IDS.monsters.shaman]: polishedVariantsV114('characters', 'monster-shaman'),
  [COMBAT_ART_TEXTURE_IDS.monsters.ghost]: polishedVariantsV114('characters', 'monster-ghost'),
  [COMBAT_ART_TEXTURE_IDS.monsters.skeleton]: polishedVariantsV114('characters', 'monster-skeleton'),
  [COMBAT_ART_TEXTURE_IDS.monsters.crow]: polishedVariantsV114('characters', 'monster-crow'),
  [COMBAT_ART_TEXTURE_IDS.bosses.tiger]: polishedVariantsV114('characters', 'boss-tiger'),
  [COMBAT_ART_TEXTURE_IDS.bosses.serpent]: polishedVariantsV114('characters', 'boss-serpent'),
  [COMBAT_ART_TEXTURE_IDS.bosses.king]: polishedVariantsV114('characters', 'boss-king')
});

const guardianCitadelStateTextureVariantsV114 = Object.freeze({
  [GUARDIAN_CITADEL_STATE_TEXTURE_IDS_V114.stable]: polishedVariantsV114('citadel', 'guardian-citadel-stable'),
  [GUARDIAN_CITADEL_STATE_TEXTURE_IDS_V114.shielded]: polishedVariantsV114('citadel', 'guardian-citadel-shielded'),
  [GUARDIAN_CITADEL_STATE_TEXTURE_IDS_V114.cracked]: polishedVariantsV114('citadel', 'guardian-citadel-cracked'),
  [GUARDIAN_CITADEL_STATE_TEXTURE_IDS_V114.critical]: polishedVariantsV114('citadel', 'guardian-citadel-critical')
});


const approvedDirectionalAtlasVariantsV117 = Object.freeze({
  [APPROVED_DIRECTIONAL_ATLAS_IDS_V117.guardians.ember]: Object.freeze({
    low: publicAsset('visual-v120/directional/hero-pupu-atlas-low-v120.webp'),
    medium: publicAsset('visual-v117/directional/guardian-ember-pupu-atlas-medium-v117.webp'),
    high: publicAsset('visual-v117/directional/guardian-ember-pupu-atlas-high-v117.webp')
  })
});

const guardianCitadelStateTextureVariantsV117 = Object.freeze({
  [GUARDIAN_CITADEL_STATE_TEXTURE_IDS_V117.stable]: Object.freeze({
    low: publicAsset('visual-v117/citadel/guardian-citadel-stable-low-v117.webp'),
    medium: publicAsset('visual-v117/citadel/guardian-citadel-stable-medium-v117.webp'),
    high: publicAsset('visual-v117/citadel/guardian-citadel-stable-high-v117.webp')
  }),
  [GUARDIAN_CITADEL_STATE_TEXTURE_IDS_V117.shielded]: Object.freeze({
    low: publicAsset('visual-v117/citadel/guardian-citadel-shielded-low-v117.webp'),
    medium: publicAsset('visual-v117/citadel/guardian-citadel-shielded-medium-v117.webp'),
    high: publicAsset('visual-v117/citadel/guardian-citadel-shielded-high-v117.webp')
  }),
  [GUARDIAN_CITADEL_STATE_TEXTURE_IDS_V117.cracked]: Object.freeze({
    low: publicAsset('visual-v117/citadel/guardian-citadel-cracked-low-v117.webp'),
    medium: publicAsset('visual-v117/citadel/guardian-citadel-cracked-medium-v117.webp'),
    high: publicAsset('visual-v117/citadel/guardian-citadel-cracked-high-v117.webp')
  }),
  [GUARDIAN_CITADEL_STATE_TEXTURE_IDS_V117.critical]: Object.freeze({
    low: publicAsset('visual-v117/citadel/guardian-citadel-critical-low-v117.webp'),
    medium: publicAsset('visual-v117/citadel/guardian-citadel-critical-medium-v117.webp'),
    high: publicAsset('visual-v117/citadel/guardian-citadel-critical-high-v117.webp')
  })
});


const p0DirectionalAtlasUrls = Object.freeze({
  [P0_DIRECTIONAL_ATLAS_IDS.heroes.warrior]: Object.freeze({
    low: publicAsset('visual-v112/directional/hero-warrior-atlas-low-v112.webp'),
    medium: publicAsset('visual-v112/directional/hero-warrior-atlas-medium-v112.webp'),
    high: publicAsset('visual-v112/directional/hero-warrior-atlas-v112.webp')
  }),
  [P0_DIRECTIONAL_ATLAS_IDS.guardians.ember]: Object.freeze({
    low: publicAsset('visual-v112/directional/guardian-ember-atlas-low-v112.webp'),
    medium: publicAsset('visual-v112/directional/guardian-ember-atlas-medium-v112.webp'),
    high: publicAsset('visual-v112/directional/guardian-ember-atlas-v112.webp')
  }),
  [P0_DIRECTIONAL_ATLAS_IDS.monsters.imp]: Object.freeze({
    low: publicAsset('visual-v112/directional/monster-imp-atlas-low-v112.webp'),
    medium: publicAsset('visual-v112/directional/monster-imp-atlas-medium-v112.webp'),
    high: publicAsset('visual-v112/directional/monster-imp-atlas-v112.webp')
  }),
  [P0_DIRECTIONAL_ATLAS_IDS.bosses.tiger]: Object.freeze({
    low: publicAsset('visual-v112/directional/boss-tiger-atlas-low-v112.webp'),
    medium: publicAsset('visual-v112/directional/boss-tiger-atlas-medium-v112.webp'),
    high: publicAsset('visual-v112/directional/boss-tiger-atlas-v112.webp')
  })
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
  // P0 directional atlases remain in the review library but are intentionally
  // excluded from runtime preload until independent production approval.
  ...Object.entries(approvedDirectionalAtlasVariantsV117).map(([id, variants]) => ({
    id, kind: 'texture', required: false, retain: true, color: true,
    role: 'approved-directional-guardian-v117', variants,
    sourceWidth: 2024, sourceHeight: 1104,
    productionArtApproved: true, runtimeApproved: true,
    directionArtApproved: true, actionArtApproved: false
  })),
  ...Object.entries(guardianCitadelStateTextureVariantsV117).map(([id, variants]) => ({
    id, kind: 'texture', required: false, retain: true, color: true,
    role: 'guardian-citadel-state-v117', variants,
    sourceWidth: 512, sourceHeight: 512,
    productionArtApproved: true, runtimeApproved: true
  })),
  ...Object.entries(combatArtTextureVariantsV114)
    .filter(([id]) => id !== COMBAT_ART_TEXTURE_IDS.guardians.ember)
    .map(([id, variants]) => ({
    id, kind: 'texture', required: false, retain: true, color: true, role: 'combat-art-polished-v114',
    variants,
    sourceWidth: 512, sourceHeight: 512,
    productionArtApproved: true, runtimeApproved: true
  })),
  ...Object.entries(guardianCitadelStateTextureVariantsV114)
    .filter(() => false) // superseded by the approved v117 citadel state set
    .map(([id, variants]) => ({
    id, kind: 'texture', required: false, retain: true, color: true, role: 'guardian-citadel-state-v114',
    variants,
    sourceWidth: 512, sourceHeight: 512,
    productionArtApproved: true, runtimeApproved: true
  })),
  ...Object.entries(sdToonModelUrls).map(([id, url]) => ({
    id, kind: 'model', required: false, retain: true,
    variants: { low: url, medium: url, high: url },
    fallback: `procedural-${id}`,
    approval: getAssetApproval(id)
  }))
]);


const BOOT_ASSET_ID_SET_V115 = new Set([
  ...Object.entries(COMBAT_ART_TEXTURE_IDS.heroes).filter(([key]) => key !== 'warrior').map(([, id]) => id),
  ...Object.entries(COMBAT_ART_TEXTURE_IDS.guardians).filter(([key]) => key !== 'ember').map(([, id]) => id),
  // v1.0.20: one approved atlas replaces both duplicate warrior and ember boot textures.
  APPROVED_DIRECTIONAL_ATLAS_IDS_V117.guardians.ember,
  GUARDIAN_CITADEL_STATE_TEXTURE_IDS_V114.stable
]);

// v1.0.15: title screen opens after only the assets actually visible on the
// first scene are ready. Monsters, bosses, alternate citadel states, impostors
// and GLB models continue in the background and remain available before combat.
export const BOOT_ASSET_CATALOG = Object.freeze(
  CORE_ASSET_CATALOG.filter((entry) => entry.required || BOOT_ASSET_ID_SET_V115.has(entry.id))
);
export const DEFERRED_ASSET_CATALOG = Object.freeze(
  CORE_ASSET_CATALOG.filter((entry) => !BOOT_ASSET_CATALOG.includes(entry))
);
export const ASSET_LOADING_PLAN_V115 = Object.freeze({
  version: '1.0.15',
  build: 'b24.15',
  criticalCount: BOOT_ASSET_CATALOG.length,
  deferredCount: DEFERRED_ASSET_CATALOG.length,
  titleCharacters: Object.freeze([
    ...Object.values(COMBAT_ART_TEXTURE_IDS.heroes),
    ...Object.values(COMBAT_ART_TEXTURE_IDS.guardians)
  ]),
  titleCitadel: GUARDIAN_CITADEL_STATE_TEXTURE_IDS_V114.stable,
  firstScreenPolicy: 'critical-first-idle-deferred',
  fallbackPolicy: 'procedural-safe-until-approved-art-ready'
});

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
