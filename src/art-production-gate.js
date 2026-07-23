import { ART_STYLE_LOCK_ID } from './art-style-tokens.js';
import { CHARACTER_DNA_VERSION } from './character-dna.js';

export const ART_PRODUCTION_GATE_VERSION = '13.0.0';
export const GOLDEN_VERTICAL_SLICE_ID = 'DD-GVS-001';

export const GOLDEN_VERTICAL_SLICE = Object.freeze([
  Object.freeze({ id: 'GVS-HERO-WARRIOR', category: 'hero', label: '도깨비 전사', status: 'runtime-certified', completion: 100, required: true, productionArtApproved: false }),
  Object.freeze({ id: 'GVS-MONSTER-GRUNT', category: 'monster', label: '일반 요괴', status: 'runtime-certified', completion: 100, required: true, productionArtApproved: false }),
  Object.freeze({ id: 'GVS-BOSS-TIGER', category: 'boss', label: '저승 호랑이', status: 'runtime-certified', completion: 100, required: true, productionArtApproved: false }),
  Object.freeze({ id: 'GVS-ENV-MOON-MARKET', category: 'environment', label: '도깨비마을 전장', status: 'runtime-certified', completion: 100, required: true, productionArtApproved: false }),
  Object.freeze({ id: 'GVS-UI-COMBAT', category: 'ui', label: '전투 HUD', status: 'runtime-certified', completion: 100, required: true, productionArtApproved: false }),
  Object.freeze({ id: 'GVS-VFX-COMBAT', category: 'vfx', label: '전투 VFX', status: 'runtime-certified', completion: 100, required: true, productionArtApproved: false })
]);

export const ART_APPROVAL_EVIDENCE = Object.freeze([
  'style-lock-metadata',
  'character-dna-report',
  'art-review-checklist',
  'turnaround-5-view',
  'silhouette-0.3s',
  'palette-60-25-10-5',
  'technical-budget',
  'runtime-device-review',
  'animation-11-clips',
  'equipment-socket-review',
  'art-director-approval'
]);

export const MASSIVE_UPDATE_MILESTONES = Object.freeze([
  Object.freeze({ id: 'M1', label: 'Absolute Art Bible v2.0 코드 잠금', status: 'done' }),
  Object.freeze({ id: 'M2', label: 'Character DNA v3.0 프로덕션 시스템', status: 'done' }),
  Object.freeze({ id: 'M3', label: 'Engine 5.0 런타임 예산·전투 계측', status: 'done' }),
  Object.freeze({ id: 'M4', label: 'Battle Doctrine·상태이상·적응형 웨이브', status: 'done' }),
  Object.freeze({ id: 'M5', label: '원소 반응·신명 기세·보스 광폭화', status: 'done' }),
  Object.freeze({ id: 'M6', label: '970개 파일 감사 · 고해상도 후보 40종 분리', status: 'done' }),
  Object.freeze({ id: 'M7', label: '40종 투명 파생본·실루엣 테스트·리뷰 OS v10', status: 'done' }),
  Object.freeze({ id: 'M8', label: '플레이어 직업 5종·직업 패시브·신화 합류전', status: 'done' }),
  Object.freeze({ id: 'M9', label: '수호 의회 15결속·4막 캠페인·보스 BREAK·장비 단조', status: 'done' }),
  Object.freeze({ id: 'M10', label: '골든 수직 슬라이스 런타임 인증 6/6', status: 'done' }),
  Object.freeze({ id: 'M11', label: '최종 제작 아트 6종 인간 승인', status: 'active' }),
  Object.freeze({ id: 'M12', label: '1,130개 승인 DNA 최종 생산', status: 'next' })
]);

export const RUNTIME_ART_POLICY = Object.freeze({
  styleLockId: ART_STYLE_LOCK_ID,
  characterDnaVersion: CHARACTER_DNA_VERSION,
  productionLabelRequiresAllEvidence: true,
  legacyCandidatesAllowedAtRuntime: true,
  legacyCandidatesMustRemainExplicit: true,
  runtimeHarmonizationRequired: true,
  massConceptGenerationUnlocked: true,
  massProductionBlockedUntilGoldenSliceApproved: true,
  rawFragmentsForbiddenAtRuntime: true,
  referenceCropsForbiddenAsFinalAssets: true,
  highResolutionCandidatesRequireHumanReview: true,
  approvedStatus: 'production-approved'
});

export function summarizeArtProductionGate(entries = GOLDEN_VERTICAL_SLICE) {
  const approved = entries.filter((entry) => entry.status === RUNTIME_ART_POLICY.approvedStatus).length;
  const inReview = entries.filter((entry) => ['art-review', 'runtime-remaster', 'dna-locked', 'runtime-certified'].includes(entry.status)).length;
  const runtimeCertified = entries.filter((entry) => entry.status === 'runtime-certified').length;
  const completion = entries.length ? Math.round(entries.reduce((sum, entry) => sum + Number(entry.completion || 0), 0) / entries.length) : 0;
  const blocked = entries.length - approved;
  return Object.freeze({
    gateVersion: ART_PRODUCTION_GATE_VERSION,
    goldenSliceId: GOLDEN_VERTICAL_SLICE_ID,
    styleLockId: ART_STYLE_LOCK_ID,
    characterDnaVersion: CHARACTER_DNA_VERSION,
    total: entries.length,
    approved,
    runtimeCertified,
    runtimePassed: runtimeCertified === entries.length,
    inReview,
    blocked,
    completion,
    evidenceCount: ART_APPROVAL_EVIDENCE.length,
    runtimeHarmonizationRequired: true,
    massConceptGenerationUnlocked: true,
    conceptAssetCount: 970,
    highResolutionReviewCandidates: 40,
    transparentPresentationDerivatives: 40,
    silhouetteDerivatives: 40,
    uiAndVfxDerivatives: 11,
    playableHeroClasses: 5,
    guardianCouncilSupports: 5,
    guardianCouncilBonds: 15,
    moonfrontCampaignActs: 4,
    bossBreakEnabled: true,
    equipmentForgeMaxLevel: 5,
    referenceCropCount: 101,
    quarantinedFragmentCount: 823,
    sourceAtlasCount: 6,
    productionApprovedAssetCount: 0,
    productionArtApproved: 0,
    productionArtRequired: entries.length,
    massProductionUnlocked: false
  });
}

export const ART_PRODUCTION_SUMMARY = summarizeArtProductionGate();
