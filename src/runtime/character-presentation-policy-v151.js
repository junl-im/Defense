export const CHARACTER_PRESENTATION_POLICY_V151 = Object.freeze({
  id: 'DD-MODERN-CHARACTER-PRESENTATION-V151',
  version: '1.0.51',
  buildId: 'b24.51',
  assetApprovalPolicy: 'preserve-approved-source-art',
  rendererLayers: Object.freeze(['contact-shadow', 'depth-silhouette', 'key-light', 'action-rim', 'motion-afterimage']),
  qualityTiers: Object.freeze(['economy', 'balanced', 'cinematic']),
  maxAfterimages: 2,
  noNewFinalArtClaims: true,
  objective: '승인된 캐릭터 원화를 유지하면서 접지감, 깊이, 조명 방향, 액션 잔상과 피격 가독성을 현대식 런타임 표현으로 강화합니다.'
});

export const CHARACTER_PRESENTATION_QUALITY_V151 = Object.freeze({
  economy: Object.freeze({
    afterimages: 0,
    persistentKeyLight: false,
    persistentSilhouette: false,
    maxSecondaryDistance: 18,
    monsterSecondaryDistance: 0,
    shadowOpacity: .22,
    animationSmoothing: .30
  }),
  balanced: Object.freeze({
    afterimages: 1,
    persistentKeyLight: true,
    persistentSilhouette: true,
    maxSecondaryDistance: 28,
    monsterSecondaryDistance: 14,
    shadowOpacity: .28,
    animationSmoothing: .24
  }),
  cinematic: Object.freeze({
    afterimages: 2,
    persistentKeyLight: true,
    persistentSilhouette: true,
    maxSecondaryDistance: 40,
    monsterSecondaryDistance: 22,
    shadowOpacity: .34,
    animationSmoothing: .18
  })
});

export const CHARACTER_CATEGORY_RENDER_V151 = Object.freeze({
  hero: Object.freeze({ outline: .30, key: .12, shadowScale: .62, afterimage: 1, depthOffset: .022 }),
  guardian: Object.freeze({ outline: .25, key: .10, shadowScale: .58, afterimage: .82, depthOffset: .019 }),
  monster: Object.freeze({ outline: .16, key: .045, shadowScale: .52, afterimage: .34, depthOffset: .012 }),
  boss: Object.freeze({ outline: .32, key: .10, shadowScale: .68, afterimage: .90, depthOffset: .024 }),
  core: Object.freeze({ outline: .20, key: .08, shadowScale: .74, afterimage: 0, depthOffset: .018 })
});

export function resolveCharacterPresentationQualityV151({ lowPower = false, qualityTier = 'high' } = {}) {
  if (lowPower || qualityTier === 'low') return CHARACTER_PRESENTATION_QUALITY_V151.economy;
  if (qualityTier === 'medium') return CHARACTER_PRESENTATION_QUALITY_V151.balanced;
  return CHARACTER_PRESENTATION_QUALITY_V151.cinematic;
}
