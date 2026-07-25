export const STATIC_DEPLOYMENT_GATE_V118 = Object.freeze({
  version: '1.0.18',
  build: 'b24.18',
  policyId: 'DD-STATIC-DEPLOYMENT-GATE-V118',
  sourceVerificationRequiresDist: false,
  postBuildVerificationRequired: true,
  inheritedApprovalRelease: '1.0.17',
  requiredPostBuildCommands: Object.freeze([
    'npm run verify:dist:v117',
    'npm run verify:dist:v118',
    'node scripts/verify-production-bundle-v101.mjs'
  ]),
  approvalBoundary: Object.freeze({
    newFinalDirectionalArtApproved: 0,
    inheritedFinalDirectionalEntities: 1,
    inheritedCitadelStates: 4,
    candidateArtRuntimeApplied: false
  })
});

export function createStaticDeploymentGateReportV118() {
  return Object.freeze({
    ...STATIC_DEPLOYMENT_GATE_V118,
    status: 'source-ready-postbuild-required',
    generatedAt: new Date().toISOString()
  });
}

export default STATIC_DEPLOYMENT_GATE_V118;
