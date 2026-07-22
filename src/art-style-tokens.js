export const ART_BIBLE_VERSION = '3.0.0';
export const ART_STYLE_LOCK_ID = 'DD-AAA-CASUAL-SD-PBR-3.0';

export const ABSOLUTE_STYLE_PROMPT = `AAA Mobile Game Asset,
Premium Korean Mobile RPG Defense Game Style,
Cute Stylized 3D Character,
Chibi 2.3 Heads Proportion,
Large Expressive Eyes,
Rounded Face,
Tiny Body,
Soft Rounded Hands,
Simple Fingers,
Short Legs,
High Quality Hand Painted Texture,
Smooth Color Gradient,
No Realistic Skin,
Soft Ambient Occlusion,
Subtle Rim Light,
Clean Topology,
Game Ready,
Low Poly 6k~10k Triangles,
PBR Stylized,
Bright Saturated Colors,
Fantasy Korean Folklore Theme,
Mobile Game Quality,
Consistent Art Style,
Highly Readable Silhouette,
No Noise,
No Photorealism,
No Anime Illustration,
3D Model Concept,
Orthographic View,
Character Turnaround,
White Background`;

export const ABSOLUTE_NEGATIVE_PROMPT = `photorealistic, realistic skin pores, anime illustration, 2D painting, long realistic body, thin limbs, tiny hands, tiny feet, western medieval realism, dark horror, muddy colors, noisy micro details, excessive ornaments, sharp realistic fingers, cinematic depth of field, dramatic perspective, cropped turnaround, inconsistent face, inconsistent proportions, text, watermark, logo`;

export const SD_CHARACTER_STANDARD = Object.freeze({
  targetHeadsTall: 2.3,
  allowedHeadsTall: Object.freeze([2.2, 2.4]),
  headHeightRatio: 0.435,
  bodyHeightRatio: 0.345,
  legHeightRatio: 0.22,
  handToHeadRatio: 0.25,
  footToHeadRatio: 0.32,
  eyeWidthToFaceRatio: 0.2,
  eyeGapToEyeWidthRatio: 0.68,
  faceFeatureZone: Object.freeze({ top: 0.34, bottom: 0.73 }),
  silhouetteRule: '머리·무기·대표 장식의 세 덩어리만 보아도 64px 썸네일에서 역할이 읽혀야 한다.',
  sharedParts: Object.freeze(['head', 'face', 'hair', 'hat', 'body', 'hand-l', 'hand-r', 'foot-l', 'foot-r', 'weapon', 'accessory']),
  topology: Object.freeze({ clean: true, deformationLoops: true, simpleFingers: true, separatedParts: true })
});

export const STYLIZED_PBR_RENDER_STANDARD = Object.freeze({
  materialModel: 'stylized-pbr-hand-painted',
  baseColor: 'high-quality-hand-painted-smooth-gradient',
  pbrMaps: Object.freeze(['baseColor', 'normal-subtle', 'orm-soft', 'emissive-optional']),
  shadingBands: 0,
  softAmbientOcclusion: true,
  realisticSkin: false,
  photorealism: false,
  rimLight: Object.freeze({ enabled: true, type: 'subtle', strengthMin: 0.08, strengthMax: 0.2, color: '#b8e8ff' }),
  outline: Object.freeze({ policy: 'silhouette-first-optional', heroBossOnly: false, widthPercent: Object.freeze([0, 2]), color: '#24152f' }),
  shadow: Object.freeze({ type: 'soft-contact-plus-soft-cast', opacity: Object.freeze([0.16, 0.3]), blur: 'very-soft', mobileRealtime: true }),
  color: Object.freeze({ saturation: 'bright', gradients: 'smooth', noise: 'prohibited', materialCountMax: 4 }),
  materialPolicy: Object.freeze([
    '사진식 피부와 금속 반사를 금지하고 손으로 칠한 Base Color가 형태를 설명해야 한다.',
    'Normal은 큰 주름과 무기 모서리만 보조하며 미세 표면 노이즈를 만들지 않는다.',
    'ORM은 거친 천·가죽·칠목·금속의 큰 재질 차이만 표현한다.',
    'AO는 얼굴을 더럽히지 않는 부드러운 접합 그림자로 제한한다.',
    'Rim Light는 외곽 전체를 두껍게 두르지 않고 달빛 방향에만 은은하게 적용한다.'
  ])
});

// Compatibility export. The project previously imported this name for a pure toon profile.
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
  states: Object.freeze(['idle', 'walk', 'attack', 'hit', 'skill']),
  singleViewStates: Object.freeze(['death']),
  rule: '정면·45도·측면·135도·후면 5개 원본만 승인하고 좌우 미러링으로 10~11방향을 구성한다.'
});

export const CHARACTER_ANIMATION_STANDARD = Object.freeze({
  hero: Object.freeze(['idle', 'walk', 'run', 'attack', 'skill', 'hit', 'death']),
  monster: Object.freeze(['idle', 'walk', 'attack', 'hit', 'death', 'special']),
  boss: Object.freeze(['idle', 'walk', 'attack-a', 'attack-b', 'skill', 'hit', 'death', 'phase']),
  timing: Object.freeze({ idleSeconds: Object.freeze([1.8, 2.8]), hitSeconds: Object.freeze([0.18, 0.34]), deathSeconds: Object.freeze([0.7, 1.2]), readableTelegraphSeconds: 0.55 })
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
  separatedParts: Object.freeze(['Head', 'HairOrHat', 'Body', 'Weapon', 'Accessory']),
  requiredMaps: Object.freeze(['BaseColor', 'Normal', 'ORM']),
  optionalMaps: Object.freeze(['Emissive']),
  rigged: true,
  embeddedAnimationClips: true,
  cleanTopology: true,
  noPhotorealism: true,
  noAnimeIllustration: true
});

export const ASSET_PRODUCTION_GATES = Object.freeze([
  Object.freeze({ id: 'style-lock', label: '절대 스타일 잠금', exit: '절대 프롬프트·비율·재질·팔레트·실루엣 검수 통과' }),
  Object.freeze({ id: 'hero', label: '메인 주인공 1종', exit: '7개 필수 모션·5방향 턴어라운드·실기기 승인' }),
  Object.freeze({ id: 'enemy-trio', label: '근접·원거리·보스 3종', exit: '실루엣과 공격 예고가 320px 화면에서 구분됨' }),
  Object.freeze({ id: 'environment', label: '바닥·나무·돌·건물', exit: '8m 모듈과 전투 가독성 승인' }),
  Object.freeze({ id: 'ui', label: '전투·상점·강화 UI', exit: '공용 프레임·아이콘·상태색 승인' }),
  Object.freeze({ id: 'vfx', label: '속성·피격·보상 VFX', exit: '핵·꼬리·충돌의 공용 언어 승인' }),
  Object.freeze({ id: 'scale-out', label: '나머지 에셋 대량 제작', exit: '승인된 골든 샘플에서만 변형' })
]);
