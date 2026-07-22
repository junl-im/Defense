import { ART_STYLE_LOCK_ID, ASSET_APPROVAL_STATES, PRODUCTION_ASSET_REQUIREMENTS } from '../art-style-tokens.js';

const GOLDEN_SAMPLE_ID = 'player-dokkaebi-warrior-golden-v1';

const CURRENT_PROTOTYPE_IDS = Object.freeze([
  'guardian-ember-sd-toon', 'guardian-frost-sd-toon', 'guardian-wind-sd-toon', 'guardian-stone-sd-toon', 'guardian-bell-sd-toon', 'guardian-thunder-sd-toon',
  'monster-imp-sd-toon', 'monster-runner-sd-toon',
  'boss-tiger-sd-toon', 'boss-serpent-sd-toon', 'boss-king-sd-toon'
]);

const PROTOTYPE_REASONS = Object.freeze([
  '스켈레탈 Skin 없음',
  '필수 AnimationClip 없음',
  '손그림 BaseColor·Normal·ORM 텍스처 세트 없음',
  'AAA 골든 샘플 아트 리뷰 미승인'
]);

const prototypeEntries = CURRENT_PROTOTYPE_IDS.map((id) => [id, Object.freeze({
  id,
  styleLockId: ART_STYLE_LOCK_ID,
  status: ASSET_APPROVAL_STATES.prototype,
  productionReady: false,
  technicalReady: false,
  displayLabel: '개발용 프로토타입',
  reasons: PROTOTYPE_REASONS
})]);

const reviewEntry = (id, displayLabel, reasons) => [id, Object.freeze({
  id,
  styleLockId: ART_STYLE_LOCK_ID,
  status: ASSET_APPROVAL_STATES.review,
  productionReady: false,
  technicalReady: true,
  displayLabel,
  reasons: Object.freeze(reasons)
})];

export const CURRENT_ASSET_APPROVAL = Object.freeze(Object.fromEntries([
  ...prototypeEntries,
  reviewEntry(GOLDEN_SAMPLE_ID, '골든 샘플 · 아트 리뷰', [
    'Skin 1개와 7개 AnimationClip 기술 검수 통과',
    'BaseColor·Normal·ORM·Emissive 임베디드',
    '실기기 실루엣·표정·손그림 텍스처 아트 디렉터 승인 대기'
  ]),
  reviewEntry('monster-brute-sd-toon', '공용 리그 근접 적 · 아트 리뷰', [
    '공용 휴머노이드 Skin과 7개 AnimationClip 기술 검수 통과',
    'BaseColor·Normal·ORM·Emissive 및 무기·장식 소켓 포함',
    '돌갑옷 실루엣·해머 타격감 실기기 아트 승인 대기'
  ]),
  reviewEntry('monster-shaman-sd-toon', '공용 리그 원거리 적 · 아트 리뷰', [
    '공용 휴머노이드 Skin과 7개 AnimationClip 기술 검수 통과',
    'BaseColor·Normal·ORM·Emissive 및 무기·장식 소켓 포함',
    '도사 모자·부적·주술 발광 실기기 아트 승인 대기'
  ])
]));

export const ASSET_APPROVAL_POLICY = Object.freeze({
  styleLockId: ART_STYLE_LOCK_ID,
  productionRequirements: PRODUCTION_ASSET_REQUIREMENTS,
  currentPrototypeCount: CURRENT_PROTOTYPE_IDS.length,
  currentReviewCount: 3,
  rule: 'production-approved 상태가 아니면 게임 진단과 문서에서 완성 에셋으로 표시하지 않는다.'
});

export function getAssetApproval(id) {
  return CURRENT_ASSET_APPROVAL[id] || Object.freeze({
    id,
    styleLockId: ART_STYLE_LOCK_ID,
    status: ASSET_APPROVAL_STATES.concept,
    productionReady: false,
    displayLabel: '미검수 에셋',
    reasons: Object.freeze(['에셋 승인 레지스트리에 등록되지 않음'])
  });
}

export function isProductionApproved(id) {
  return getAssetApproval(id).status === ASSET_APPROVAL_STATES.approved;
}
