export const ART_DIRECTION = Object.freeze({
  title: 'NextGen 달빛 야시장 스타일라이즈드 PBR',
  pillars: Object.freeze([
    '현대 모바일 3D 액션 게임처럼 큰 실루엣, 계층화된 의상, 분리된 재질 반응, 월광 림을 하나의 캐릭터 언어로 묶는다.',
    '둥글고 친근한 도깨비와 날카롭고 비대칭인 요괴를 실루엣만으로 구분한다.',
    '조선 야시장·무속·달빛 신앙의 소재를 현대 모바일 액션 가독성으로 단순화한다.',
    '따뜻한 한지 등불과 차가운 월광의 이중 조명을 모든 캐릭터와 환경에 반복한다.',
    '작은 화면에서는 재질 디테일보다 머리·무기·등 장식의 큰 형태와 색 덩어리를 우선한다.'
  ]),
  palette: Object.freeze({
    night: '#120b24', moon: '#d8ddff', lantern: '#ffc86b', spirit: '#63f1dc', curse: '#b36dff', danger: '#ff5f72'
  }),
  materialRules: Object.freeze([
    'LOD0는 Base Color·Normal·ORM·Emissive를 기준으로 하고, 현재 절차형 파츠와 정적 GLB는 동일한 PBR 응답을 사용한다.',
    '베이스는 손으로 빚은 목재·한지·도자기·무광 금속처럼 거칠기 차이를 크게 둔다.',
    '순수 흰색과 순수 검정은 피하고 월광색 또는 자주색을 섞어 게임 배경에 묶는다.',
    '발광부는 전체 면적의 12% 이내로 제한하고 얼굴·무기·공격 시작점에 집중한다.',
    '문양은 1m 거리에서 읽히는 큰 귀면·반달·금줄·부적 형태만 사용한다.'
  ])
});

export const ASSET_LOD_POLICY = Object.freeze({
  near: Object.freeze({ distance: '0–12m', representation: '리깅된 GLB', targetTriangles: '캐릭터 4k–7k / 보스 12k–18k', texture: '캐릭터 1024² KTX2 / 보스 2048² KTX2' }),
  mid: Object.freeze({ distance: '12–24m', representation: '단순화 GLB LOD1', targetTriangles: '캐릭터 1.6k–2.8k / 보스 5k–8k', texture: '512²–1024² KTX2' }),
  far: Object.freeze({ distance: '24m+', representation: '11방향 임포스터 아틀라스', targetTriangles: '2 triangles', texture: '2048² WebP/KTX2 atlas, 11 frames' })
});

export const IMPOSTOR_SPEC = Object.freeze({
  directions: 11,
  angleStepDegrees: 360 / 11,
  frameOrder: Object.freeze(Array.from({ length: 11 }, (_, index) => Math.round(index * 360 / 11 * 100) / 100)),
  capture: Object.freeze({
    camera: 'orthographic',
    elevationDegrees: 18,
    paddingPercent: 8,
    background: 'transparent',
    channels: Object.freeze(['albedo-alpha', 'normal-depth optional']),
    lighting: '중립 월광 key + 약한 warm rim'
  })
});

export const CHARACTER_ASSET_TARGETS = Object.freeze({
  guardian: Object.freeze({
    count: 6,
    requiredAnimations: Object.freeze(['idle', 'move', 'attack', 'hit', 'death', 'skill', 'summon']),
    maxBones: 48,
    maxMaterials: 2,
    nearTriangles: 7000,
    midTriangles: 2800,
    textureSize: 1024
  }),
  monster: Object.freeze({
    count: 4,
    requiredAnimations: Object.freeze(['idle', 'move', 'attack', 'hit', 'death', 'special']),
    maxBones: 36,
    maxMaterials: 2,
    nearTriangles: 5200,
    midTriangles: 2000,
    textureSize: 1024
  }),
  boss: Object.freeze({
    count: 3,
    requiredAnimations: Object.freeze(['idle', 'move', 'attack_a', 'attack_b', 'hit', 'death', 'phase']),
    maxBones: 72,
    maxMaterials: 3,
    nearTriangles: 18000,
    midTriangles: 8000,
    textureSize: 2048
  })
});

export const ENVIRONMENT_ASSET_TARGETS = Object.freeze({
  tileMeters: 8,
  primarySetCount: 8,
  atlasTextureSize: 2048,
  maxMaterialsPerProp: 1,
  budgets: Object.freeze({
    heroLandmarkTriangles: 9000,
    mediumPropTriangles: 2200,
    smallPropTriangles: 600,
    instancedClutterTriangles: 180
  }),
  requiredSets: Object.freeze(['ground', 'sacred-tree', 'monster-gate', 'market-stall', 'lantern', 'jangseung', 'moon-jar', 'clutter'])
});

export const EFFECT_ASSET_TARGETS = Object.freeze({
  projectileAtlasSize: 1024,
  distortion: false,
  maxParticlesMobile: 90,
  maxParticlesDesktop: 180,
  rules: Object.freeze([
    '아군 효과는 속성색 중심, 적 위험 효과는 붉은 외곽선 중심으로 구분한다.',
    '장판 중심은 비워 캐릭터와 바닥 타일을 가리지 않는다.',
    '발사체는 진행 방향 앞쪽이 가장 밝아야 한다.',
    '한 효과는 핵·꼬리·충돌의 3단계만 유지해 모바일 오버드로를 제한한다.'
  ])
});
