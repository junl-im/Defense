import Phaser from "phaser";
import type { StageConfig } from "./types";
import { lowPowerMode } from "./QualityManager";
import { battleDepthPolishProfile, scaleBattleAlpha, shouldShowGateLabels } from "./BattleDepthPolish";

const THEME_ACCENT: Record<string, number> = {
  forest: 0xa7f06b,
  canyon: 0xffb15d,
  swamp: 0x7cffbd,
  fortress: 0xff7a5c,
  citadel: 0xd77c88,
  volcano: 0xff7a2f,
  void: 0xa79cff,
  finale: 0xffdd75,
};

const THEME_SHADOW: Record<string, number> = {
  forest: 0x07140b,
  canyon: 0x1e0c08,
  swamp: 0x061310,
  fortress: 0x0c0709,
  citadel: 0x0e0710,
  volcano: 0x170705,
  void: 0x060611,
  finale: 0x141007,
};

function query(): URLSearchParams {
  return new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
}

export function premiumStageAccent(theme: string): number {
  return THEME_ACCENT[theme] ?? 0xffd36b;
}

export function shouldUsePremiumBattleComposition(): boolean {
  const qs = query();
  if (qs.has("flatbattle") || qs.has("plainbattle")) return false;
  return true;
}

export function showCompactBuildSpotLabels(): boolean {
  const qs = query();
  return qs.has("buildlabels") || qs.has("tutorialspots");
}

export function premiumBuildSpotScale(): number {
  const qs = query();
  if (qs.has("compactspots")) return 0.94;
  if (qs.has("largespots")) return 1.16;
  return 1.08;
}

/**
 * v2.36.1 Premium Battle Composition
 *
 * 저사양 모바일에서도 유지되는 정적인 전장 구도 레이어다.
 * v2.35.x의 아이콘 목업/작은 라벨 중심 화면을 본 게임 기본값에서 걷어내고,
 * 큰 실루엣, 굵은 전장 프레임, 넓은 터치 포인트가 먼저 보이도록 만든다.
 *
 * 원칙:
 * - BootScene/첫 탭에는 새 에셋을 싣지 않는다.
 * - 저전력 모드에서도 정적인 Graphics 몇 개만 사용한다.
 * - 반복 트윈/파티클은 쓰지 않는다.
 * - `?flatbattle`로 QA용 미니멀 전장을 확인할 수 있다.
 */
export function installPremiumBattleComposition(scene: Phaser.Scene, stage: StageConfig): void {
  if (!shouldUsePremiumBattleComposition()) return;

  const accent = premiumStageAccent(stage.theme);
  const shadow = THEME_SHADOW[stage.theme] ?? 0x08070a;
  const low = lowPowerMode();
  const polish = battleDepthPolishProfile();

  // 맵 가장자리에 무게감을 줘서 960x540 좌표계가 휴대폰에서 작게 뜨는 느낌을 줄인다.
  const frame = scene.add.graphics().setDepth(2.72);
  frame.fillStyle(shadow, scaleBattleAlpha(low ? 0.12 : 0.16, polish.curtainAlphaScale));
  frame.fillRect(0, 64, 960, 34);
  frame.fillRect(0, 444, 960, 36);
  frame.fillRect(0, 64, 30, 416);
  frame.fillRect(930, 64, 30, 416);
  frame.lineStyle(low ? 2 : 3, accent, scaleBattleAlpha(low ? 0.20 : 0.28, polish.curtainAlphaScale));
  frame.strokeRoundedRect(14, 74, 932, 392, 22);
  frame.lineStyle(1, 0xffffff, scaleBattleAlpha(low ? 0.07 : 0.11, polish.curtainAlphaScale));
  frame.strokeRoundedRect(24, 84, 912, 372, 18);

  // 중앙 플레이 영역을 아주 은은하게 띄워, 작은 스티커들이 흩어진 느낌 대신 하나의 전장처럼 보이게 한다.
  scene.add
    .ellipse(480, 268, 840, 346, accent, scaleBattleAlpha(low ? 0.018 : 0.032, polish.pathGlowAlphaScale))
    .setDepth(2.65)
    .setBlendMode(Phaser.BlendModes.ADD);

  // 경로 시작/도착 지점을 단순 원형 오브젝트가 아니라 전술 포털처럼 크게 읽히게 한다.
  const start = stage.path[0];
  const goal = stage.path[stage.path.length - 1];
  const showLabels = shouldShowGateLabels();
  addStaticGate(scene, start.x + 18, start.y, 0x72e8ff, "진입", low, showLabels, polish);
  addStaticGate(scene, goal.x - 18, goal.y, 0xffd36b, "수호핵", low, showLabels, polish);

  // 건설 지점 아래에 큰 바닥 앵커를 먼저 깔아 전장 오브젝트의 체급을 올린다.
  for (const spot of stage.spots) {
    if (spot.y < 58 || spot.y > 482) continue;
    scene.add
      .ellipse(spot.x, spot.y + 8, 86, 32, 0x000000, scaleBattleAlpha(low ? 0.13 : 0.17, polish.buildPadAlphaScale))
      .setDepth(9.3);
    scene.add
      .ellipse(spot.x, spot.y + 1, 78, 28, accent, scaleBattleAlpha(low ? 0.035 : 0.052, polish.buildPadAlphaScale))
      .setStrokeStyle(1, accent, scaleBattleAlpha(low ? 0.10 : 0.16, polish.buildPadAlphaScale))
      .setDepth(9.4);
  }
}

function addStaticGate(
  scene: Phaser.Scene,
  x: number,
  y: number,
  color: number,
  label: string,
  low: boolean,
  showLabel: boolean,
  polish: ReturnType<typeof battleDepthPolishProfile>,
): void {
  scene.add.ellipse(x, y + 14, 84, 24, 0x000000, scaleBattleAlpha(low ? 0.16 : 0.22, polish.pathShadowAlphaScale)).setDepth(7.1);
  scene.add
    .ellipse(x, y, low ? 58 : 68, low ? 32 : 38, color, scaleBattleAlpha(low ? 0.06 : 0.075, polish.pathGlowAlphaScale))
    .setStrokeStyle(low ? 2 : 3, color, scaleBattleAlpha(low ? 0.30 : 0.38, polish.pathGlowAlphaScale))
    .setDepth(7.2)
    .setBlendMode(Phaser.BlendModes.ADD);
  if (!showLabel) return;

  scene.add
    .text(x, y + 31, label, {
      fontSize: low ? "10px" : "11px",
      color: "#fff3c2",
      fontStyle: "bold",
      fontFamily: "Pretendard, Noto Sans KR, Arial, sans-serif",
      shadow: { offsetX: 0, offsetY: 2, color: "#000000", blur: 2, fill: true },
    })
    .setOrigin(0.5)
    .setDepth(7.3)
    .setAlpha(low ? 0.62 : 0.74);
}
