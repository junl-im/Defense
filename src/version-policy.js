export const PUBLIC_GAME_VERSION = '1.0.11';
export const LEGACY_LINEAGE_VERSION = '23.1.0';
export const BUILD_EPOCH = 24;
export const BUILD_REVISION = 11;
export const BUILD_ID = `b${BUILD_EPOCH}.${BUILD_REVISION}`;
export const CACHE_REVISION = `${PUBLIC_GAME_VERSION}-${BUILD_ID}`;
export const VERSION_POLICY_ID = 'DD-VERSION-POLICY-1.0';

export const VERSION_POLICY = Object.freeze({
  id: VERSION_POLICY_ID,
  releaseVersion: PUBLIC_GAME_VERSION,
  lineageVersion: LEGACY_LINEAGE_VERSION,
  buildEpoch: BUILD_EPOCH,
  buildRevision: BUILD_REVISION,
  buildId: BUILD_ID,
  cacheRevision: CACHE_REVISION,
  patchRange: Object.freeze({ min: 0, max: 99 }),
  releaseRules: Object.freeze({
    patch: '기능·기술·성능·버그 수정은 1.0.1부터 1.0.99까지 순차 증가',
    minor: '초대규모 업데이트만 1.1.0, 1.2.0처럼 중간 번호 증가',
    major: '정식 세대 전환 또는 호환성 단절 시에만 첫 번호 증가'
  })
});

export function parseReleaseVersion(value = PUBLIC_GAME_VERSION) {
  const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(String(value).trim());
  if (!match) return null;
  return Object.freeze({ major: Number(match[1]), minor: Number(match[2]), patch: Number(match[3]) });
}

export function isValidReleaseVersion(value = PUBLIC_GAME_VERSION) {
  const parsed = parseReleaseVersion(value);
  return Boolean(parsed && parsed.patch >= 0 && parsed.patch <= 99);
}

export function nextPatchVersion(value = PUBLIC_GAME_VERSION) {
  const parsed = parseReleaseVersion(value);
  if (!parsed) throw new Error(`Invalid release version: ${value}`);
  if (parsed.patch >= 99) return `${parsed.major}.${parsed.minor + 1}.0`;
  return `${parsed.major}.${parsed.minor}.${parsed.patch + 1}`;
}
