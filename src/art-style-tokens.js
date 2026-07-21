export const ART_BIBLE_VERSION = '2.0.0';

export const SD_CHARACTER_STANDARD = Object.freeze({
  targetHeadsTall: 2.25,
  allowedHeadsTall: Object.freeze([2.0, 2.5]),
  headHeightRatio: 0.44,
  bodyHeightRatio: 0.34,
  legHeightRatio: 0.22,
  handToHeadRatio: 0.24,
  footToHeadRatio: 0.31,
  eyeWidthToFaceRatio: 0.18,
  eyeGapToEyeWidthRatio: 0.72,
  faceFeatureZone: Object.freeze({ top: 0.38, bottom: 0.72 }),
  silhouetteRule: '머리·무기·대표 장식 3덩어리만 보아도 역할을 구분할 수 있어야 한다.',
  sharedParts: Object.freeze(['head', 'face', 'hair-or-hat', 'body', 'hand-l', 'hand-r', 'foot-l', 'foot-r', 'weapon', 'accessory'])
});

export const MOBILE_TOON_RENDER_STANDARD = Object.freeze({
  shadingBands: 4,
  gradientStops: Object.freeze([48, 116, 188, 255]),
  rimLight: Object.freeze({ enabled: true, strengthMin: 0.16, strengthMax: 0.34, color: '#b8e8ff' }),
  outline: Object.freeze({ policy: 'selective', heroBossOnly: true, widthPercent: Object.freeze([2, 4]), color: '#24152f' }),
  shadow: Object.freeze({ type: 'soft-contact-plus-blob', opacity: Object.freeze([0.2, 0.34]), blur: 'soft', mobileRealtime: false }),
  materialPolicy: Object.freeze([
    'Base Color 중심의 3~4단 카툰 명암을 사용한다.',
    'Normal과 ORM은 보스·대표 환경만 선택적으로 사용한다.',
    '금속은 현실 반사보다 밝은 테두리와 고정 하이라이트로 구분한다.',
    '발광 면적은 캐릭터 화면 면적의 10% 이하로 제한한다.',
    '같은 캐릭터 안에서 재질군은 천·피부·무기·발광의 4종을 넘기지 않는다.'
  ])
});

export const MOON_MARKET_PALETTE = Object.freeze({
  inkNight: '#171126',
  plumShadow: '#32203d',
  moonCream: '#f4e6c8',
  lanternGold: '#ffc85c',
  emberCoral: '#ff6b4a',
  spiritMint: '#5be2c2',
  frostBlue: '#78bfff',
  thunderViolet: '#ad7cff',
  dangerRed: '#ff5e6f',
  jadeGreen: '#55b991',
  paperIvory: '#ead6a8',
  lacquerBrown: '#4b2b35'
});

export const AUTHORED_VIEW_STANDARD = Object.freeze({
  authoredDirections: 5,
  authoredAnglesDegrees: Object.freeze([0, 45, 90, 135, 180]),
  runtimeDirections: 11,
  mirroring: true,
  captureCamera: 'orthographic',
  elevationDegrees: 18,
  frameAnchor: 'feet-center',
  states: Object.freeze(['idle', 'walk', 'attack', 'hit', 'skill']),
  singleViewStates: Object.freeze(['death']),
  rule: '5개 원본 방향을 제작하고 좌우 미러링과 근접 프레임 선택으로 11방향처럼 사용한다.'
});

export const CHARACTER_ANIMATION_STANDARD = Object.freeze({
  hero: Object.freeze(['idle', 'walk', 'run', 'attack', 'skill', 'hit', 'death']),
  monster: Object.freeze(['idle', 'walk', 'attack', 'hit', 'death', 'special']),
  boss: Object.freeze(['idle', 'walk', 'attack-a', 'attack-b', 'skill', 'hit', 'death', 'phase']),
  timing: Object.freeze({
    idleSeconds: Object.freeze([1.8, 2.8]),
    hitSeconds: Object.freeze([0.18, 0.34]),
    deathSeconds: Object.freeze([0.7, 1.2]),
    readableTelegraphSeconds: 0.55
  })
});

export const ASSET_PRODUCTION_GATES = Object.freeze([
  Object.freeze({ id: 'hero', label: '메인 주인공 1종', exit: '7개 필수 모션과 전투·도감 실기기 승인' }),
  Object.freeze({ id: 'enemy-trio', label: '근접·원거리·보스 3종', exit: '실루엣과 공격 예고가 320px 화면에서 구분됨' }),
  Object.freeze({ id: 'environment', label: '바닥·나무·돌·건물', exit: '8m 모듈과 전투 가독성 승인' }),
  Object.freeze({ id: 'ui', label: '전투·상점·강화 UI', exit: '공용 프레임·아이콘·상태색 승인' }),
  Object.freeze({ id: 'vfx', label: '속성·피격·보상 VFX', exit: '핵·꼬리·충돌의 공용 언어 승인' }),
  Object.freeze({ id: 'scale-out', label: '나머지 캐릭터 대량 제작', exit: '승인된 템플릿에서 변형만 허용' })
]);
