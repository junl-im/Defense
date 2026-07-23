export const ART_BIBLE_VERSION = '2.0.0';
export const ART_STYLE_LOCK_ID = 'DD-ABSOLUTE-ART-BIBLE-2.0';
export const ART_BIBLE_STATUS = 'absolute-locked';

export const ABSOLUTE_STYLE_PROMPT = `MASTER STYLE LOCK — Dokkaebi Defense

AAA Korean Mobile Defense Game Asset, Premium Stylized 3D, Cute Chibi Character (2.3 heads proportion), Korean Folklore Fantasy, Highly Readable Silhouette, Large Expressive Eyes, Rounded Face, Tiny Body, Oversized Weapon, Hand-Painted Stylized PBR, Smooth Materials, Soft Ambient Occlusion, Warm Key Light, Cool Blue Rim Light, High Color Saturation, Bright Value Range, Rounded Beveled Shapes, Mobile Game Ready, Low Poly (6000–10000 triangles), Clean Topology, Orthographic Character Turnaround, White Background, Consistent Art Direction, Cute 70% + Cool 30%, No Photorealism, No Anime Illustration, No Realistic Skin, No Dark Mood, No Gore, No Horror, No Thin Limbs, No Long Neck, No Sharp Edges, No Overly Complex Details.`;

export const ABSOLUTE_NEGATIVE_PROMPT = `realistic skin texture, skin pores, wrinkles, excessive muscles, long legs, long neck, small eyes, photorealism, excessive ornament, complex armor, low saturation, dark lighting, pure black shadow, excessive texture noise, gore, blood, dismemberment, organs, horror mood, thin limbs, sharp edges, anime illustration`;

export const ABSOLUTE_GENRE_LOCK = Object.freeze([
  'Cute Stylized Fantasy',
  '3D Mobile Game',
  'AAA Casual',
  'Korean Fantasy',
  'Stylized PBR',
  'Hand Painted'
]);

export const SD_CHARACTER_STANDARD = Object.freeze({
  targetHeadsTall: 2.3,
  allowedHeadsTall: Object.freeze([2.27, 2.5]),
  headHeightRatio: 0.42,
  allowedHeadHeightRatio: Object.freeze([0.4, 0.44]),
  chestHeightRatio: 0.18,
  waistHeightRatio: 0.15,
  bodyHeightRatio: 0.33,
  legHeightRatio: 0.25,
  eyeWidthToFaceRatio: 0.28,
  eyePosition: 'slightly-below-face-center',
  pupil: 'round-large-gloss',
  eyelashes: 'almost-none',
  nose: 'single-dot',
  defaultMouth: 'small-smile',
  eyeSizeLockedAcrossExpressions: true,
  silhouetteRecognitionSecondsMax: 0.3,
  silhouetteSignatureElements: 3,
  weaponMinCharacterHeightRatio: 0.18,
  weaponMustReadLargerThanBody: true,
  silhouetteRule: '대표 요소 3개만 보아도 0.3초 안에 캐릭터와 직업을 식별해야 한다.',
  sharedParts: Object.freeze(['head', 'face', 'body', 'helmet', 'shoulder', 'weapon', 'accessory', 'back-item', 'hand-l', 'hand-r', 'foot-l', 'foot-r']),
  interchangeableEquipment: Object.freeze(['Helmet', 'Shoulder', 'Weapon', 'Accessory', 'BackItem']),
  topology: Object.freeze({ clean: true, deformationLoops: true, simpleFingers: true, separatedParts: true, roundedBevel: true, sharp90DegreeEdges: false })
});

export const COLOR_STANDARD = Object.freeze({
  maxMainColors: 4,
  distribution: Object.freeze({ primary: 0.6, secondary: 0.25, accent: 0.1, fx: 0.05 }),
  rainbowForbidden: true,
  lowSaturationDominantForbidden: true,
  brightValueRange: true,
  highSaturation: true
});

export const MATERIAL_STANDARD = Object.freeze({
  skin: Object.freeze({ smooth: true, pores: false, wrinkles: false, realism: false }),
  metal: Object.freeze({ type: 'painted-metal', stylized: true, goldEdge: true, reflection: 'soft' }),
  cloth: Object.freeze({ fabricPattern: 'almost-none', gradient: 'simple' })
});

export const LIGHTING_STANDARD = Object.freeze({
  order: Object.freeze(['warm-key', 'cool-blue-rim', 'soft-ao', 'small-highlight']),
  darkMoodForbidden: true,
  rimColor: '#78bfff',
  shadow: Object.freeze({ type: 'soft', opacity: 0.4, pureBlackForbidden: true }),
  outline: Object.freeze({ policy: 'almost-none', separationMethods: Object.freeze(['ao', 'contrast', 'color-separation']) })
});

export const STYLIZED_PBR_RENDER_STANDARD = Object.freeze({
  materialModel: 'stylized-pbr-hand-painted',
  baseColor: 'hand-painted-large-shapes-simple-gradient',
  pbrMaps: Object.freeze(['baseColor', 'normal-subtle', 'orm-soft', 'emissive-optional']),
  shadingBands: 0,
  softAmbientOcclusion: true,
  realisticSkin: false,
  photorealism: false,
  warmKeyLight: true,
  smallHighlight: true,
  rimLight: Object.freeze({ enabled: true, type: 'cool-blue', strengthMin: 0.08, strengthMax: 0.2, color: '#78bfff' }),
  outline: LIGHTING_STANDARD.outline,
  shadow: Object.freeze({ type: 'soft-contact-plus-soft-cast', opacity: Object.freeze([0.4, 0.4]), blur: 'soft', mobileRealtime: true, pureBlackForbidden: true }),
  color: Object.freeze({ saturation: 'high', values: 'bright', gradients: 'simple', noise: 'minimal', materialCountMax: 4, distribution: COLOR_STANDARD.distribution, rainbowForbidden: true }),
  edge: Object.freeze({ rounded: true, bevel: true, sharp90DegreeForbidden: true }),
  materialPolicy: Object.freeze([
    '피부는 매끄럽고 모공·주름·실사 표현을 금지한다.',
    '금속은 Painted Metal, Gold Edge, Soft Reflection을 사용한다.',
    '천은 패턴을 거의 사용하지 않고 단순 그라데이션으로 표현한다.',
    'Warm Key, Cool Blue Rim, Soft AO, Small Highlight 순서를 유지한다.',
    '아웃라인은 거의 사용하지 않고 AO·대비·색 분리로 형태를 읽힌다.'
  ])
});

// Compatibility export used by existing rendering modules.
export const MOBILE_TOON_RENDER_STANDARD = STYLIZED_PBR_RENDER_STANDARD;

export const MOON_MARKET_PALETTE = Object.freeze({
  inkNight: '#171126', plumShadow: '#32203d', moonCream: '#f4e6c8', lanternGold: '#ffc85c',
  emberCoral: '#ff6b4a', spiritMint: '#5be2c2', frostBlue: '#78bfff', thunderViolet: '#ad7cff',
  dangerRed: '#ff5e6f', jadeGreen: '#55b991', paperIvory: '#ead6a8', lacquerBrown: '#4b2b35'
});

export const AUTHORED_VIEW_STANDARD = Object.freeze({
  authoredDirections: 5,
  authoredAnglesDegrees: Object.freeze([0, 45, 90, 135, 180]),
  runtimeDirections: 11,
  mirroring: true,
  captureCamera: 'orthographic',
  elevationDegrees: 15,
  frameAnchor: 'feet-center',
  background: 'white-for-concept-transparent-for-runtime',
  states: Object.freeze(['idle', 'walk', 'run', 'attack1', 'attack2', 'skill1', 'skill2', 'hit', 'victory', 'spawn']),
  singleViewStates: Object.freeze(['death']),
  rule: 'Front, 45°, Side, 135°, Back의 5개 원본을 제작하고 좌우 반전으로 런타임 방향을 구성한다.'
});

export const CORE_CHARACTER_ANIMATIONS = Object.freeze([
  'idle', 'walk', 'run', 'attack1', 'attack2', 'skill1', 'skill2', 'hit', 'death', 'victory', 'spawn'
]);

export const CHARACTER_ANIMATION_STANDARD = Object.freeze({
  hero: CORE_CHARACTER_ANIMATIONS,
  monster: CORE_CHARACTER_ANIMATIONS,
  boss: CORE_CHARACTER_ANIMATIONS,
  bossOptional: Object.freeze(['phase']),
  timing: Object.freeze({
    idleSeconds: Object.freeze([1.8, 2.8]),
    hitSeconds: Object.freeze([0.18, 0.34]),
    deathSeconds: Object.freeze([0.7, 1.2]),
    readableTelegraphSeconds: 0.55
  })
});

export const CATEGORY_STYLE_RULES = Object.freeze({
  monster: Object.freeze({ cutePercent: 70, coolPercent: 30, grossPercent: 0 }),
  boss: Object.freeze({ playerScale: 2, weaponScale: 3, fxScale: 4 }),
  ui: Object.freeze({ buttonTraits: Object.freeze(['Gold Border', 'Blue Glow', 'Rounded', 'Depth', 'Drop Shadow']), hoverScale: 1.05, pressedScale: 0.95 }),
  icon: Object.freeze({ perspectiveDegrees: 45, softShadow: true, bright: true, oneObject: true, background: false }),
  map: Object.freeze({ largeShape: true, simpleDetail: true, softEdge: true, handPainted: true }),
  vfx: Object.freeze({ outerGlow: true, innerGlow: true, gradient: true, noise: 'minimal', blurPercent: 10, particles: 'round-cute' })
});

export const ASSET_APPROVAL_STATES = Object.freeze({
  concept: 'concept-only',
  prototype: 'prototype-placeholder',
  review: 'art-review',
  approved: 'production-approved',
  rejected: 'rejected'
});

export const PRODUCTION_ASSET_REQUIREMENTS = Object.freeze({
  styleLockId: ART_STYLE_LOCK_ID,
  promptRequired: true,
  turnaroundViews: 5,
  whiteBackgroundConcept: true,
  separatedParts: Object.freeze(['Helmet', 'Shoulder', 'Weapon', 'Accessory', 'BackItem']),
  requiredMaps: Object.freeze(['BaseColor', 'Normal', 'ORM']),
  optionalMaps: Object.freeze(['Emissive']),
  textureSizes: Object.freeze([1024, 2048]),
  triangleRange: Object.freeze([6000, 10000]),
  rig: 'Humanoid',
  requiredAnimations: CORE_CHARACTER_ANIMATIONS,
  rigged: true,
  embeddedAnimationClips: true,
  cleanTopology: true,
  noPhotorealism: true,
  noAnimeIllustration: true,
  noDarkMood: true,
  noGore: true,
  noHorror: true
});

export const ASSET_PRODUCTION_GATES = Object.freeze([
  Object.freeze({ id: 'absolute-lock', label: '절대 아트 바이블 잠금', exit: 'v2.0 잠금 ID·SHA-256·마스터 프롬프트 검증 통과' }),
  Object.freeze({ id: 'character-dna', label: '얼굴·체형·직업 DNA', exit: '42/18/15/25·눈 28%·0.3초 실루엣 승인' }),
  Object.freeze({ id: 'golden-vertical-slice', label: '골든 수직 슬라이스', exit: '주인공·일반 적·보스·환경·HUD·VFX 한 세트 실기기 승인' }),
  Object.freeze({ id: 'technical-production', label: '제작 기술 규격', exit: '6k~10k·1024/2048·Humanoid·11클립·교체 장비 통과' }),
  Object.freeze({ id: 'scale-out', label: '대량 제작', exit: '승인 골든 샘플과 DNA 템플릿에서만 파생' })
]);
