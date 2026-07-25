import {
  APPROVED_DIRECTIONAL_ATLAS_IDS_V117,
  APPROVED_DIRECTIONAL_ATLAS_SPEC_V117,
  COMBAT_ART_TEXTURE_IDS,
  GUARDIAN_CITADEL_STATE_TEXTURE_IDS_V117,
  P0_DIRECTIONAL_ATLAS_IDS
} from '../engine/asset-catalog.js';

const approvedDirectional = Object.freeze([
  ...Object.values(APPROVED_DIRECTIONAL_ATLAS_IDS_V117.guardians)
]);
const approvedStatic = Object.freeze([
  ...Object.values(COMBAT_ART_TEXTURE_IDS.heroes),
  ...Object.values(COMBAT_ART_TEXTURE_IDS.guardians),
  ...Object.values(COMBAT_ART_TEXTURE_IDS.monsters),
  ...Object.values(COMBAT_ART_TEXTURE_IDS.bosses)
]);
const approvedCitadel = Object.freeze(Object.values(GUARDIAN_CITADEL_STATE_TEXTURE_IDS_V117));
const quarantined = Object.freeze([
  ...Object.values(P0_DIRECTIONAL_ATLAS_IDS.heroes),
  ...Object.values(P0_DIRECTIONAL_ATLAS_IDS.guardians),
  ...Object.values(P0_DIRECTIONAL_ATLAS_IDS.monsters),
  ...Object.values(P0_DIRECTIONAL_ATLAS_IDS.bosses)
]);

export const ASSET_APPROVAL_PIPELINE_V117 = Object.freeze({
  version: '1.0.17',
  build: 'b24.17',
  id: 'DD-ASSET-APPROVAL-PIPELINE-V117',
  statuses: Object.freeze(['approved', 'direction-approved-action-provisional', 'revise', 'quarantined', 'replacement-pending']),
  gates: Object.freeze([
    'pc-mobile-scale', 'ground-contact', 'silhouette', 'alpha-edge',
    'direction-continuity', 'hit-anchor', 'effect-readability', 'runtime-memory'
  ]),
  approvedStatic,
  approvedDirectional,
  approvedCitadel,
  quarantined,
  directionalSpec: APPROVED_DIRECTIONAL_ATLAS_SPEC_V117,
  runtimeRules: Object.freeze({
    approvedOnly: true,
    independentDirectionArtRequired: true,
    derivedActionRowsMayRunProvisionally: true,
    derivedActionRowsCountAsFinalActionArt: false,
    mirroringAllowed: false,
    oldP0PrototypeRuntimeAllowed: false,
    fallbackToApprovedStaticArt: true
  })
});

export function isApprovedDirectionalAtlasV117(assetId = '') {
  return approvedDirectional.includes(assetId);
}

export function createAssetApprovalReportV117() {
  return Object.freeze({
    version: ASSET_APPROVAL_PIPELINE_V117.version,
    build: ASSET_APPROVAL_PIPELINE_V117.build,
    finalApprovedStatic: approvedStatic.length,
    approvedDirectionalEntities: approvedDirectional.length,
    approvedDirectionalViews: APPROVED_DIRECTIONAL_ATLAS_SPEC_V117.directions,
    provisionalActionRows: APPROVED_DIRECTIONAL_ATLAS_SPEC_V117.actionRowsDerivedProvisional,
    approvedCitadelStates: approvedCitadel.length,
    quarantinedPrototypeAtlases: quarantined.length,
    runtimeAppliedMaximum: approvedStatic.length + approvedDirectional.length + approvedCitadel.length,
    gates: ASSET_APPROVAL_PIPELINE_V117.gates
  });
}
