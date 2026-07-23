export const RUNTIME_VISUAL_AUDIT_VERSION = '17.0.0';

export function auditRuntimeVisuals({ spriteDirector, propSystem, cameraProfile, titleScreen, heroOptions, coreObstacleCount = 0 } = {}) {
  const sprite = spriteDirector?.diagnostics || {};
  const props = propSystem?.diagnostics || {};
  const checks = [
    { id: 'atlas-loaded', pass: Boolean(sprite.loaded) && !sprite.failed, detail: sprite.failed ? sprite.lastError || 'atlas load failed' : `${sprite.atlasPages || 0} pages` },
    { id: 'battlefield-sprites', pass: Number(sprite.activeSprites || 0) >= 7, detail: `${sprite.activeSprites || 0} active` },
    { id: 'living-props', pass: Number(props.active || 0) >= 3, detail: `${props.active || 0} active` },
    { id: 'hero-atlas-ui', pass: Number(heroOptions?.querySelectorAll?.('.atlas-sprite')?.length || 0) >= 5, detail: `${heroOptions?.querySelectorAll?.('.atlas-sprite')?.length || 0} cards` },
    { id: 'title-simplified', pass: Boolean(titleScreen?.querySelector?.('.title-primary-actions')) && !titleScreen?.textContent?.includes('ATLAS FRAMES'), detail: 'player-facing title only' },
    { id: 'title-art-v17', pass: Boolean(titleScreen?.querySelector?.('.title-mascot-v17')) && Boolean(titleScreen?.querySelector?.('.title-panel-v17')), detail: 'responsive background + mascot presentation' },
    { id: 'scenic-camera', pass: Number(cameraProfile?.distance || 0) >= 18, detail: `${cameraProfile?.distance || 0} distance` },
    { id: 'core-collision-guard', pass: Number(coreObstacleCount || 0) === 0, detail: `${coreObstacleCount || 0} core collision obstacles` }
  ];
  const warnings = checks.filter((entry) => !entry.pass);
  return Object.freeze({
    version: RUNTIME_VISUAL_AUDIT_VERSION,
    passed: warnings.length === 0,
    passCount: checks.length - warnings.length,
    total: checks.length,
    checks: Object.freeze(checks.map(Object.freeze)),
    warnings: Object.freeze(warnings.map(Object.freeze))
  });
}
