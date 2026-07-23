import { ART_STYLE_LOCK_ID } from './art-style-tokens.js';

export const CHARACTER_DNA_VERSION = '3.0.0';

export const FACE_DNA = Object.freeze({
  headRatio: Object.freeze({ target: 0.42, min: 0.40, max: 0.44 }),
  eyeWidthRatio: 0.28,
  eyeVerticalPlacement: 'slightly-below-center',
  pupilShape: 'round-large-gloss',
  eyelashes: 'minimal',
  nose: 'single-dot',
  mouth: 'small-soft-smile',
  expressionLocks: Object.freeze({ anger: 'eyebrows-only', sadness: 'mouth-only', eyeSizeMutable: false })
});

export const BODY_DNA = Object.freeze({
  head: 0.42,
  chest: 0.18,
  waist: 0.15,
  legs: 0.25,
  longNeck: false,
  longLegs: false,
  thinLimbs: false,
  silhouetteReadSeconds: 0.3
});

export const HAIR_DNA = Object.freeze({
  front: Object.freeze(['rounded-bangs', 'three-to-five-large-clumps', 'clear-forehead-break']),
  back: Object.freeze(['compact-volume', 'neck-clearance', 'no-thin-strands']),
  ornaments: Object.freeze(['one-primary-ornament', 'one-secondary-maximum', 'rounded-bevel'])
});

export const CLASS_DNA = Object.freeze({
  warrior: Object.freeze({ silhouette: ['large-club', 'large-horns', 'wide-shoulders'], weaponScaleMin: 0.24, accent: 'gold' }),
  archer: Object.freeze({ silhouette: ['oversized-bow', 'short-cape', 'feather-knot'], weaponScaleMin: 0.28, accent: 'cyan' }),
  mage: Object.freeze({ silhouette: ['large-orb-staff', 'wide-sleeves', 'floating-talisman'], weaponScaleMin: 0.26, accent: 'violet' }),
  taoist: Object.freeze({ silhouette: ['long-hat', 'talisman', 'long-sleeves'], weaponScaleMin: 0.20, accent: 'jade' }),
  shaman: Object.freeze({ silhouette: ['ritual-fan', 'bell-accessory', 'layered-skirt'], weaponScaleMin: 0.22, accent: 'coral' })
});

export const RARITY_DNA = Object.freeze({
  common: Object.freeze({ paletteSlots: 2, accessoryBudget: 0, fxIntensity: 0, goldEdge: 0 }),
  rare: Object.freeze({ paletteSlots: 3, accessoryBudget: 1, fxIntensity: 0.2, goldEdge: 0.2 }),
  epic: Object.freeze({ paletteSlots: 4, accessoryBudget: 2, fxIntensity: 0.45, goldEdge: 0.45 }),
  legendary: Object.freeze({ paletteSlots: 4, accessoryBudget: 3, fxIntensity: 0.72, goldEdge: 0.72 }),
  mythic: Object.freeze({ paletteSlots: 4, accessoryBudget: 4, fxIntensity: 0.86, goldEdge: 0.86 }),
  immortal: Object.freeze({ paletteSlots: 4, accessoryBudget: 4, fxIntensity: 0.94, goldEdge: 0.94, paletteRule: 'blue-gold-only-no-rainbow' }),
  god: Object.freeze({ paletteSlots: 4, accessoryBudget: 5, fxIntensity: 1, goldEdge: 1, paletteRule: 'gold-primary-blue-rim' })
});

export const EQUIPMENT_DNA = Object.freeze({
  detachableSlots: Object.freeze(['helmet', 'shoulder', 'weapon', 'accessory', 'backItem']),
  requiredSockets: Object.freeze(['HeadSocket', 'ShoulderLSocket', 'ShoulderRSocket', 'WeaponSocket', 'AccessorySocket', 'BackSocket'])
});

export const ANIMATION_DNA = Object.freeze({
  rig: 'humanoid',
  clips: Object.freeze(['Idle', 'Walk', 'Run', 'Attack1', 'Attack2', 'Skill1', 'Skill2', 'Hit', 'Death', 'Victory', 'Spawn']),
  authoredDirections: Object.freeze(['front', '45', 'side', '135', 'back']),
  mirrorHorizontal: true,
  rootMotion: false
});

export const TECHNICAL_DNA = Object.freeze({
  triangles: Object.freeze({ min: 6000, max: 10000 }),
  textureSizes: Object.freeze([1024, 2048]),
  mainColorLimit: 4,
  paletteDistribution: Object.freeze([60, 25, 10, 5]),
  styleLockId: ART_STYLE_LOCK_ID
});

export function resolveCharacterDNA({ classId = 'warrior', rarity = 'common' } = {}) {
  const classDna = CLASS_DNA[classId] || CLASS_DNA.warrior;
  const rarityDna = RARITY_DNA[rarity] || RARITY_DNA.common;
  return Object.freeze({
    version: CHARACTER_DNA_VERSION,
    styleLockId: ART_STYLE_LOCK_ID,
    classId: CLASS_DNA[classId] ? classId : 'warrior',
    rarity: RARITY_DNA[rarity] ? rarity : 'common',
    face: FACE_DNA,
    body: BODY_DNA,
    hair: HAIR_DNA,
    class: classDna,
    rarityRules: rarityDna,
    equipment: EQUIPMENT_DNA,
    animation: ANIMATION_DNA,
    technical: TECHNICAL_DNA
  });
}

export function validateCharacterDNA(candidate = {}) {
  const failures = [];
  const headRatio = Number(candidate.headRatio);
  const eyeWidthRatio = Number(candidate.eyeWidthRatio);
  const weaponScale = Number(candidate.weaponScale);
  const triangles = Number(candidate.triangles);
  const mainColors = Number(candidate.mainColors);
  const textureSize = Number(candidate.textureSize);
  const clips = Array.isArray(candidate.clips) ? candidate.clips : [];
  const sockets = Array.isArray(candidate.sockets) ? candidate.sockets : [];

  if (!Number.isFinite(headRatio) || headRatio < FACE_DNA.headRatio.min || headRatio > FACE_DNA.headRatio.max) failures.push('head-ratio-40-44');
  if (!Number.isFinite(eyeWidthRatio) || Math.abs(eyeWidthRatio - FACE_DNA.eyeWidthRatio) > 0.015) failures.push('eye-width-28');
  if (!Number.isFinite(weaponScale) || weaponScale < 0.18) failures.push('weapon-min-18');
  if (!Number.isFinite(triangles) || triangles < TECHNICAL_DNA.triangles.min || triangles > TECHNICAL_DNA.triangles.max) failures.push('triangle-budget');
  if (!Number.isFinite(mainColors) || mainColors < 1 || mainColors > TECHNICAL_DNA.mainColorLimit) failures.push('main-color-limit');
  if (!TECHNICAL_DNA.textureSizes.includes(textureSize)) failures.push('texture-size');
  if (!ANIMATION_DNA.clips.every((clip) => clips.includes(clip))) failures.push('animation-clips-11');
  if (!EQUIPMENT_DNA.requiredSockets.every((socket) => sockets.includes(socket))) failures.push('equipment-sockets');
  if (candidate.realisticSkin === true) failures.push('no-realistic-skin');
  if (candidate.darkLighting === true) failures.push('no-dark-lighting');
  if (candidate.sharpEdges === true) failures.push('no-sharp-edges');
  if (candidate.gore === true || candidate.horror === true) failures.push('no-gore-horror');

  return Object.freeze({
    valid: failures.length === 0,
    styleLockId: ART_STYLE_LOCK_ID,
    dnaVersion: CHARACTER_DNA_VERSION,
    failures: Object.freeze(failures)
  });
}

export const CHARACTER_DNA_SUMMARY = Object.freeze({
  version: CHARACTER_DNA_VERSION,
  styleLockId: ART_STYLE_LOCK_ID,
  classCount: Object.keys(CLASS_DNA).length,
  rarityCount: Object.keys(RARITY_DNA).length,
  animationClipCount: ANIMATION_DNA.clips.length,
  equipmentSlotCount: EQUIPMENT_DNA.detachableSlots.length,
  requiredSocketCount: EQUIPMENT_DNA.requiredSockets.length
});
