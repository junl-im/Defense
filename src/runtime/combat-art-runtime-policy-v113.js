export const COMBAT_ART_RUNTIME_POLICY_V113 = Object.freeze({
  version: '1.0.13',
  id: 'DD-COMBAT-ART-RUNTIME-POLICY-V113',
  p0PrototypeRuntimeEnabled: false,
  productionArtRequiredForDirectionalAtlas: true,
  singleCitadelLayer: true,
  singleWorldHealthBar: true,
  preserveApprovedStaticCombatArt: true,
  reason: 'P0 자동 생성 방향 시트는 제작 검토 자료로만 유지하고 실제 전투에서는 승인된 고품질 원화를 사용합니다.'
});

export function canUseP0DirectionalAtlasV113({ productionArtApproved = false } = {}) {
  return COMBAT_ART_RUNTIME_POLICY_V113.p0PrototypeRuntimeEnabled && productionArtApproved === true;
}
