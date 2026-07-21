import {
  ART_BIBLE_VERSION,
  SD_CHARACTER_STANDARD,
  MOBILE_TOON_RENDER_STANDARD,
  MOON_MARKET_PALETTE,
  AUTHORED_VIEW_STANDARD,
  CHARACTER_ANIMATION_STANDARD,
  ASSET_PRODUCTION_GATES
} from './art-style-tokens.js';

export const ART_DIRECTION = Object.freeze({
  bibleVersion: ART_BIBLE_VERSION,
  title: '달빛 장터 SD 모바일 카툰',
  benchmarkLanguage: '운빨 디펜스·캐주얼 액션 RPG 계열의 2~2.5등신 모바일 카툰',
  avoid: Object.freeze(['사실적 PBR', '원신형 장신 비율', '브롤스타즈식 서양 카툰 복제', '미세 문양 중심 디자인', '에셋마다 다른 얼굴 규격']),
  pillars: Object.freeze([
    '2~2.5등신, 큰 머리, 작은 몸통, 큰 손발의 동일한 SD 규격을 모든 캐릭터에 적용한다.',
    '카툰 명암 3~4단, 월광 림, 부드러운 접지 그림자와 높은 채도로 작은 모바일 화면에서 즉시 읽힌다.',
    '도깨비·무속·한지·옻칠·장승·달항아리의 한국적 소재를 둥근 큰 형태로 단순화한다.',
    '직업과 적 역할은 머리·무기·대표 장식의 세 실루엣 덩어리로 구분한다.',
    '먼저 주인공 1명과 적 3종으로 품질을 승인한 뒤 동일 규격으로 확장한다.'
  ]),
  proportions: SD_CHARACTER_STANDARD,
  render: MOBILE_TOON_RENDER_STANDARD,
  palette: MOON_MARKET_PALETTE,
  productionGates: ASSET_PRODUCTION_GATES
});

export const ASSET_LOD_POLICY = Object.freeze({
  near: Object.freeze({ distance: '0–11m', representation: '리깅된 SD GLB LOD0', targetTriangles: '주인공 4k–6k / 일반 적 2k–4k / 보스 6k–10k', texture: '주인공·적 1024² / 보스 2048² KTX2' }),
  mid: Object.freeze({ distance: '11–22m', representation: '단순화 SD GLB LOD1', targetTriangles: '주인공 1.8k–3k / 일반 적 1k–1.8k / 보스 3k–5k', texture: '512²–1024² KTX2' }),
  far: Object.freeze({ distance: '22m+', representation: '5방향 원본+미러링 기반 11방향 임포스터', targetTriangles: '2 triangles', texture: '상태별 1024² 또는 2048² KTX2 atlas' })
});

export const IMPOSTOR_SPEC = Object.freeze({
  directions: AUTHORED_VIEW_STANDARD.runtimeDirections,
  authoredDirections: AUTHORED_VIEW_STANDARD.authoredDirections,
  authoredAnglesDegrees: AUTHORED_VIEW_STANDARD.authoredAnglesDegrees,
  angleStepDegrees: 360 / AUTHORED_VIEW_STANDARD.runtimeDirections,
  frameOrder: Object.freeze(Array.from({ length: AUTHORED_VIEW_STANDARD.runtimeDirections }, (_, index) => Math.round(index * 360 / AUTHORED_VIEW_STANDARD.runtimeDirections * 100) / 100)),
  mirrorAuthoredViews: AUTHORED_VIEW_STANDARD.mirroring,
  states: AUTHORED_VIEW_STANDARD.states,
  singleViewStates: AUTHORED_VIEW_STANDARD.singleViewStates,
  capture: Object.freeze({
    camera: AUTHORED_VIEW_STANDARD.captureCamera,
    elevationDegrees: AUTHORED_VIEW_STANDARD.elevationDegrees,
    paddingPercent: 10,
    background: 'transparent',
    anchor: AUTHORED_VIEW_STANDARD.frameAnchor,
    channels: Object.freeze(['albedo-alpha']),
    lighting: '중립 key + 약한 청록 rim + 부드러운 접지 그림자'
  })
});

export const CHARACTER_ASSET_TARGETS = Object.freeze({
  guardian: Object.freeze({
    count: 6,
    requiredAnimations: CHARACTER_ANIMATION_STANDARD.hero,
    maxBones: 42,
    maxMaterials: 3,
    nearTriangles: 6000,
    midTriangles: 3000,
    textureSize: 1024,
    headsTall: SD_CHARACTER_STANDARD.targetHeadsTall
  }),
  monster: Object.freeze({
    count: 4,
    requiredAnimations: CHARACTER_ANIMATION_STANDARD.monster,
    maxBones: 32,
    maxMaterials: 2,
    nearTriangles: 4000,
    midTriangles: 1800,
    textureSize: 1024,
    headsTall: SD_CHARACTER_STANDARD.targetHeadsTall
  }),
  boss: Object.freeze({
    count: 3,
    requiredAnimations: CHARACTER_ANIMATION_STANDARD.boss,
    maxBones: 64,
    maxMaterials: 3,
    nearTriangles: 10000,
    midTriangles: 5000,
    textureSize: 2048,
    headsTall: 2.5
  })
});

export const ENVIRONMENT_ASSET_TARGETS = Object.freeze({
  tileMeters: 8,
  primarySetCount: 8,
  atlasTextureSize: 2048,
  maxMaterialsPerProp: 1,
  budgets: Object.freeze({
    heroLandmarkTriangles: 8000,
    mediumPropTriangles: 1800,
    smallPropTriangles: 500,
    instancedClutterTriangles: 160
  }),
  requiredSets: Object.freeze(['ground', 'sacred-tree', 'monster-gate', 'market-stall', 'lantern', 'jangseung', 'moon-jar', 'clutter']),
  styleRule: '모든 환경은 둥근 모서리, 2단 명암, 큰 색면, 전투 영역보다 낮은 대비를 사용한다.'
});

export const EFFECT_ASSET_TARGETS = Object.freeze({
  projectileAtlasSize: 1024,
  distortion: false,
  maxParticlesMobile: 80,
  maxParticlesDesktop: 150,
  rules: Object.freeze([
    '귀엽고 명확한 핵·꼬리·충돌 3단 구조를 사용한다.',
    '아군 속성색과 적 위험색을 형태와 색으로 동시에 구분한다.',
    '치명타는 별·반달·도깨비불 파편처럼 둥근 큰 도형을 사용한다.',
    '장판 중심은 비워 캐릭터와 바닥을 가리지 않는다.',
    '1초 안에 사라지는 짧고 높은 대비의 애니메이션을 우선한다.'
  ])
});
