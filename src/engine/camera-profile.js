export const CAMERA_PROFILE_VERSION = '12.0.0';
export const DEFAULT_CAMERA_PROFILE_ID = 'scenic';

export const CAMERA_PROFILES = Object.freeze({
  scenic: Object.freeze({
    id: 'scenic',
    label: '전장 조망',
    description: '맵과 웨이브 동선을 넓게 보는 기본 시야',
    distance: 19.5,
    pitch: 0.73,
    fov: 52,
    targetHeight: 1.05,
    waveBonus: 0.8,
    bossBonus: 1.35,
    minZoom: 10,
    maxZoom: 28
  }),
  balanced: Object.freeze({
    id: 'balanced',
    label: '균형 시야',
    description: '캐릭터와 전장을 균형 있게 표시',
    distance: 17.25,
    pitch: 0.69,
    fov: 50,
    targetHeight: 1.18,
    waveBonus: 0.45,
    bossBonus: 0.8,
    minZoom: 9.5,
    maxZoom: 26
  }),
  close: Object.freeze({
    id: 'close',
    label: '근접 시야',
    description: '캐릭터 액션을 크게 보는 기존형 시야',
    distance: 15.5,
    pitch: 0.66,
    fov: 49,
    targetHeight: 1.35,
    waveBonus: 0,
    bossBonus: 0.35,
    minZoom: 9,
    maxZoom: 24
  })
});

export const CAMERA_PROFILE_ORDER = Object.freeze(['scenic', 'balanced', 'close']);

export function sanitizeCameraProfileId(value) {
  return Object.hasOwn(CAMERA_PROFILES, value) ? value : DEFAULT_CAMERA_PROFILE_ID;
}

export function getCameraProfile(value = DEFAULT_CAMERA_PROFILE_ID) {
  return CAMERA_PROFILES[sanitizeCameraProfileId(value)];
}

export function cycleCameraProfile(value = DEFAULT_CAMERA_PROFILE_ID) {
  const current = sanitizeCameraProfileId(value);
  const index = CAMERA_PROFILE_ORDER.indexOf(current);
  return CAMERA_PROFILE_ORDER[(index + 1) % CAMERA_PROFILE_ORDER.length];
}

export function resolveCameraDistance(profileId, { waveActive = false, bossActive = false, manualDistance } = {}) {
  const profile = getCameraProfile(profileId);
  const base = Number.isFinite(manualDistance) ? manualDistance : profile.distance;
  return Math.min(profile.maxZoom, base + (waveActive ? profile.waveBonus : 0) + (bossActive ? profile.bossBonus : 0));
}
