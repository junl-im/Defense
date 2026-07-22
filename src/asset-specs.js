import {
  ART_BIBLE_VERSION,
  ART_STYLE_LOCK_ID,
  ABSOLUTE_STYLE_PROMPT,
  ABSOLUTE_NEGATIVE_PROMPT,
  SD_CHARACTER_STANDARD,
  STYLIZED_PBR_RENDER_STANDARD,
  MOON_MARKET_PALETTE,
  AUTHORED_VIEW_STANDARD,
  CHARACTER_ANIMATION_STANDARD,
  ASSET_PRODUCTION_GATES,
  PRODUCTION_ASSET_REQUIREMENTS
} from './art-style-tokens.js';

export const ART_DIRECTION = Object.freeze({
  bibleVersion: ART_BIBLE_VERSION,
  styleLockId: ART_STYLE_LOCK_ID,
  title: '도깨비 디펜스 AAA 캐주얼 SD 3D',
  benchmarkLanguage: '운빨 디펜스의 즉시 가독성, 한국 도깨비 수집형 성장, 캐주얼 액션의 부드러운 모바일 3D 품질',
  absolutePrompt: ABSOLUTE_STYLE_PROMPT,
  negativePrompt: ABSOLUTE_NEGATIVE_PROMPT,
  avoid: Object.freeze(['초등 미술식 평면 도형', '무텍스처 절차형 완성품', '사실적 MMORPG 비율', '사진식 피부', '2D 애니 일러스트', '미세 노이즈', '에셋마다 다른 얼굴 규격']),
  pillars: Object.freeze([
    '2.3등신, 큰 표정 눈, 둥근 얼굴, 작은 몸, 큰 손발의 공용 얼굴·체형 규격을 고정한다.',
    '고품질 손그림 텍스처, 부드러운 색 그라데이션, 소프트 AO와 은은한 Rim을 사용한 스타일라이즈드 PBR을 적용한다.',
    '밝고 선명한 색과 굵고 읽기 쉬운 실루엣을 유지하며 사진식 피부·노이즈·과한 미세 장식을 금지한다.',
    '도깨비·도사·갓·부적·한복·호랑이·구미호·해태 등 한국 민담 모티프를 장난감 같은 큰 형태로 단순화한다.',
    '절대 스타일 잠금→주인공 골든 샘플→적 3종→맵→UI→VFX 순서가 승인되기 전 대량 제작을 금지한다.'
  ]),
  proportions: SD_CHARACTER_STANDARD,
  render: STYLIZED_PBR_RENDER_STANDARD,
  palette: MOON_MARKET_PALETTE,
  requirements: PRODUCTION_ASSET_REQUIREMENTS,
  productionGates: ASSET_PRODUCTION_GATES
});

export const ASSET_LOD_POLICY = Object.freeze({
  near: Object.freeze({ distance: '0–11m', representation: '리깅된 AAA SD Stylized PBR GLB LOD0', targetTriangles: '일반 캐릭터 6k–10k / 보스 10k–18k', texture: '1024² BaseColor+Normal+ORM / 보스 2048² 선택' }),
  mid: Object.freeze({ distance: '11–22m', representation: '단순화 GLB LOD1', targetTriangles: '일반 2.5k–5k / 보스 5k–9k', texture: '512²–1024² KTX2' }),
  far: Object.freeze({ distance: '22m+', representation: '5방향 원본+미러링 기반 11방향 임포스터', targetTriangles: '2 triangles', texture: '상태별 KTX2/WebP atlas' })
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
  capture: Object.freeze({ camera: AUTHORED_VIEW_STANDARD.captureCamera, elevationDegrees: AUTHORED_VIEW_STANDARD.elevationDegrees, paddingPercent: 10, background: 'transparent', anchor: AUTHORED_VIEW_STANDARD.frameAnchor, channels: Object.freeze(['albedo-alpha']), lighting: '중립 key + 은은한 월광 rim + 매우 부드러운 접지 그림자' })
});

export const CHARACTER_ASSET_TARGETS = Object.freeze({
  guardian: Object.freeze({ count: 6, requiredAnimations: CHARACTER_ANIMATION_STANDARD.hero, maxBones: 48, maxMaterials: 4, productionTriangles: Object.freeze([6000, 10000]), prototypeMaxTriangles: 5600, midTriangles: 4500, textureSize: 1024, headsTall: SD_CHARACTER_STANDARD.targetHeadsTall }),
  monster: Object.freeze({ count: 4, requiredAnimations: CHARACTER_ANIMATION_STANDARD.monster, maxBones: 40, maxMaterials: 4, productionTriangles: Object.freeze([5000, 9000]), prototypeMaxTriangles: 3200, midTriangles: 3600, textureSize: 1024, headsTall: SD_CHARACTER_STANDARD.targetHeadsTall }),
  boss: Object.freeze({ count: 3, requiredAnimations: CHARACTER_ANIMATION_STANDARD.boss, maxBones: 72, maxMaterials: 5, productionTriangles: Object.freeze([10000, 18000]), prototypeMaxTriangles: 9000, midTriangles: 8000, textureSize: 2048, headsTall: 2.4 })
});

export const ENVIRONMENT_ASSET_TARGETS = Object.freeze({
  tileMeters: 8, primarySetCount: 8, atlasTextureSize: 2048, maxMaterialsPerProp: 3,
  budgets: Object.freeze({ heroLandmarkTriangles: 12000, mediumPropTriangles: 3500, smallPropTriangles: 900, instancedClutterTriangles: 240 }),
  requiredSets: Object.freeze(['ground', 'sacred-tree', 'monster-gate', 'market-stall', 'lantern', 'jangseung', 'moon-jar', 'clutter']),
  styleRule: '둥근 모서리, 손그림 그라데이션, 부드러운 AO, 캐릭터보다 낮은 대비와 채도로 전투를 받친다.'
});

export const EFFECT_ASSET_TARGETS = Object.freeze({
  projectileAtlasSize: 1024, distortion: false, maxParticlesMobile: 80, maxParticlesDesktop: 150,
  rules: Object.freeze(['핵·꼬리·충돌 3단 구조', '큰 형태와 높은 가독성', '부드러운 Glow와 짧은 수명', '투명 배경 스프라이트 시트', '노이즈·연기 과밀·사진식 폭발 금지'])
});
