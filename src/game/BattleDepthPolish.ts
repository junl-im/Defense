import { lowPowerMode } from "./QualityManager";

/**
 * v2.36.6 2.5D 다듬기 프로필
 *
 * v2.36.5에서 2.5D 에셋 연결을 복구했지만, 기존 코드맵/프리미엄 그래픽 레이어가
 * 그대로 강하게 남으면 배경 원화 위에 선/라벨/글로우가 겹쳐 조잡하게 보일 수 있다.
 * 이 파일은 2.5D를 기본 전장 톤으로 삼을 때 각 레이어의 투명도와 표시 여부를 한 곳에서 조율한다.
 */
export type BattleDepthPolishProfile = {
  /** 2.5D 스테이지 배경 최종 알파 */
  backgroundAlpha: number;
  /** 깊이 오버레이 최종 알파 */
  depthOverlayAlpha: number;
  /** 배경/오버레이 페이드 시간 */
  fadeMs: number;
  /** 코드로 그린 지형 보정 레이어의 알파 배율 */
  terrainAlphaScale: number;
  /** 코드로 그린 경로 그림자/테두리의 알파 배율 */
  pathShadowAlphaScale: number;
  /** 경로 글로우/액션 포커스의 알파 배율 */
  pathGlowAlphaScale: number;
  /** 건설 패드 바닥 앵커 알파 배율 */
  buildPadAlphaScale: number;
  /** 상하단 커튼/프레임 알파 배율 */
  curtainAlphaScale: number;
  /** 2.5D 모드로 간주되는지 */
  prefers25D: boolean;
};

function query(): URLSearchParams {
  return new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
}

/**
 * 기본 전투는 2.5D 복구를 우선한다. 단, QA/성능 확인용 플랫 모드와 아이콘 목업 모드는 제외한다.
 */
export function prefersRestored25DBattle(): boolean {
  const qs = query();
  if (qs.has("flatbattle") || qs.has("plainbattle") || qs.has("toydebug")) return false;
  if (qs.has("nodepthart") || qs.has("no25d")) return false;
  if (qs.has("iconmock") || qs.has("stickerart")) return false;
  return true;
}

export function battleDepthPolishProfile(): BattleDepthPolishProfile {
  const qs = query();
  const low = lowPowerMode();
  const prefers25D = prefersRestored25DBattle();

  if (!prefers25D) {
    return {
      backgroundAlpha: 0,
      depthOverlayAlpha: 0,
      fadeMs: low ? 300 : 420,
      terrainAlphaScale: 1,
      pathShadowAlphaScale: 1,
      pathGlowAlphaScale: 1,
      buildPadAlphaScale: 1,
      curtainAlphaScale: 1,
      prefers25D: false,
    };
  }

  const raw = qs.has("raw25d");
  const bold = qs.has("bold25d") || qs.has("restore25d") || qs.has("fullart");
  const soft = qs.has("soft25d") || qs.has("polish25d");

  return {
    backgroundAlpha: raw ? 1 : bold ? 0.94 : low ? 0.82 : soft ? 0.86 : 0.9,
    depthOverlayAlpha: raw ? 0.18 : bold ? 0.34 : low ? 0.22 : soft ? 0.24 : 0.28,
    fadeMs: qs.has("instant25d") ? 160 : low ? 360 : 560,
    terrainAlphaScale: raw ? 0.12 : low ? 0.36 : soft ? 0.42 : 0.5,
    pathShadowAlphaScale: raw ? 0.42 : low ? 0.58 : soft ? 0.62 : 0.7,
    pathGlowAlphaScale: raw ? 0.36 : low ? 0.52 : soft ? 0.56 : 0.66,
    buildPadAlphaScale: raw ? 0.52 : low ? 0.72 : 0.82,
    curtainAlphaScale: raw ? 0.55 : low ? 0.72 : 0.82,
    prefers25D: true,
  };
}

export function scaleBattleAlpha(alpha: number, factor: number): number {
  return Math.max(0, Math.min(1, alpha * factor));
}

export function shouldShowBattleCrest(): boolean {
  const qs = query();
  if (qs.has("minimalhud") || qs.has("crestless")) return false;
  // 2.5D 배경을 기본으로 쓰는 경우 상단 HUD와 별도 스테이지 크레스트가 겹쳐 산만해질 수 있다.
  // 필요하면 ?battlecrest 로 다시 켤 수 있다.
  if (prefersRestored25DBattle() && !qs.has("battlecrest")) return false;
  return true;
}

export function shouldShowGateLabels(): boolean {
  const qs = query();
  if (qs.has("gatelabels") || qs.has("tutorialspots")) return true;
  if (qs.has("nogatelabels")) return false;
  // 2.5D 배경 자체에 입구/목표 시각 정보가 있으므로 기본 라벨은 줄인다.
  return !prefersRestored25DBattle();
}
