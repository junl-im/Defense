import { ART_STYLE_LOCK_ID } from './art-style-tokens.js';
import { CHARACTER_DNA_VERSION } from './character-dna.js';

export const ART_PRODUCTION_GATE_VERSION = '6.0.0';
export const GOLDEN_VERTICAL_SLICE_ID = 'DD-GVS-001';

export const GOLDEN_VERTICAL_SLICE = Object.freeze([
  Object.freeze({ id: 'GVS-HERO-WARRIOR', category: 'hero', label: '도깨비 전사', status: 'dna-locked', completion: 40, required: true }),
  Object.freeze({ id: 'GVS-MONSTER-GRUNT', category: 'monster', label: '일반 요괴', status: 'spec-ready', completion: 28, required: true }),
  Object.freeze({ id: 'GVS-BOSS-TIGER', category: 'boss', label: '저승 호랑이', status: 'spec-ready', completion: 28, required: true }),
  Object.freeze({ id: 'GVS-ENV-MOON-MARKET', category: 'environment', label: '도깨비마을 전장', status: 'runtime-remaster', completion: 48, required: true }),
  Object.freeze({ id: 'GVS-UI-COMBAT', category: 'ui', label: '전투 HUD', status: 'runtime-remaster', completion: 75, required: true }),
  Object.freeze({ id: 'GVS-VFX-COMBAT', category: 'vfx', label: '전투 VFX', status: 'runtime-remaster', completion: 68, required: true })
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
  Object.freeze({ id: 'M5', label: '골든 전사 신규 제작·실기기 승인', status: 'active' }),
  Object.freeze({ id: 'M6', label: '요괴·보스·환경 최종 에셋 교체', status: 'next' }),
  Object.freeze({ id: 'M7', label: '1,130개 승인 DNA 대량 생산', status: 'next' })
]);

export const RUNTIME_ART_POLICY = Object.freeze({
  styleLockId: ART_STYLE_LOCK_ID,
  characterDnaVersion: CHARACTER_DNA_VERSION,
  productionLabelRequiresAllEvidence: true,
  legacyCandidatesAllowedAtRuntime: true,
  legacyCandidatesMustRemainExplicit: true,
  runtimeHarmonizationRequired: true,
  massProductionBlockedUntilGoldenSliceApproved: true,
  approvedStatus: 'production-approved'
});

export function summarizeArtProductionGate(entries = GOLDEN_VERTICAL_SLICE) {
  const approved = entries.filter((entry) => entry.status === RUNTIME_ART_POLICY.approvedStatus).length;
  const inReview = entries.filter((entry) => ['art-review', 'runtime-remaster', 'dna-locked'].includes(entry.status)).length;
  const completion = entries.length ? Math.round(entries.reduce((sum, entry) => sum + Number(entry.completion || 0), 0) / entries.length) : 0;
  const blocked = entries.length - approved;
  return Object.freeze({
    gateVersion: ART_PRODUCTION_GATE_VERSION,
    goldenSliceId: GOLDEN_VERTICAL_SLICE_ID,
    styleLockId: ART_STYLE_LOCK_ID,
    characterDnaVersion: CHARACTER_DNA_VERSION,
    total: entries.length,
    approved,
    inReview,
    blocked,
    completion,
    evidenceCount: ART_APPROVAL_EVIDENCE.length,
    runtimeHarmonizationRequired: true,
    massProductionUnlocked: approved === entries.length
  });
}

export const ART_PRODUCTION_SUMMARY = summarizeArtProductionGate();
