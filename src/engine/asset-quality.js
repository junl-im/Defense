import { ART_STYLE_LOCK_ID, ASSET_APPROVAL_STATES, PRODUCTION_ASSET_REQUIREMENTS } from '../art-style-tokens.js';

const CURRENT_PROTOTYPE_IDS = Object.freeze([
  'player-moon-captain-sd-toon',
  'guardian-ember-sd-toon', 'guardian-frost-sd-toon', 'guardian-wind-sd-toon', 'guardian-stone-sd-toon', 'guardian-bell-sd-toon', 'guardian-thunder-sd-toon',
  'monster-imp-sd-toon', 'monster-runner-sd-toon', 'monster-brute-sd-toon', 'monster-shaman-sd-toon',
  'boss-tiger-sd-toon', 'boss-serpent-sd-toon', 'boss-king-sd-toon'
]);

const PROTOTYPE_REASONS = Object.freeze([
  '스켈레탈 Skin 없음',
  '필수 AnimationClip 없음',
  '손그림 BaseColor·Normal·ORM 텍스처 세트 없음',
  'AAA 골든 샘플 아트 리뷰 미승인'
]);

export const CURRENT_ASSET_APPROVAL = Object.freeze(Object.fromEntries(CURRENT_PROTOTYPE_IDS.map((id) => [id, Object.freeze({
  id,
  styleLockId: ART_STYLE_LOCK_ID,
  status: ASSET_APPROVAL_STATES.prototype,
  productionReady: false,
  displayLabel: '개발용 프로토타입',
  reasons: PROTOTYPE_REASONS
})])));

export const ASSET_APPROVAL_POLICY = Object.freeze({
  styleLockId: ART_STYLE_LOCK_ID,
  productionRequirements: PRODUCTION_ASSET_REQUIREMENTS,
  currentPrototypeCount: CURRENT_PROTOTYPE_IDS.length,
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
