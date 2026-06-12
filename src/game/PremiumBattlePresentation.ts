import Phaser from "phaser";
import { lowPowerMode } from "./QualityManager";
import type { StageConfig } from "./types";

const THEME_PALETTE: Record<
  StageConfig["theme"],
  {
    accent: number;
    glow: number;
    deep: number;
    terrain: number;
    terrain2: number;
    pathGlow: number;
  }
> = {
  forest: {
    accent: 0xb9f47d,
    glow: 0x8ef0a2,
    deep: 0x07120d,
    terrain: 0x1f3f2b,
    terrain2: 0x335f37,
    pathGlow: 0xffdf8a,
  },
  canyon: {
    accent: 0xffc16b,
    glow: 0xff8f57,
    deep: 0x1a0b08,
    terrain: 0x58311f,
    terrain2: 0x8b5030,
    pathGlow: 0xffcf83,
  },
  swamp: {
    accent: 0x94ffd1,
    glow: 0x76e5ff,
    deep: 0x06120f,
    terrain: 0x1d362d,
    terrain2: 0x385546,
    pathGlow: 0xc5ffd8,
  },
  fortress: {
    accent: 0xff9a6e,
    glow: 0xff604c,
    deep: 0x0d0709,
    terrain: 0x29232c,
    terrain2: 0x4a3740,
    pathGlow: 0xffc06c,
  },
};

export type PremiumBuildSpotMetrics = {
  shadowWidth: number;
  shadowHeight: number;
  rimWidth: number;
  rimHeight: number;
  coreWidth: number;
  coreHeight: number;
  premiumPadWidth: number;
  premiumPadHeight: number;
  hitWidth: number;
  hitHeight: number;
  runeSize: string;
  tagWidth: number;
  tagHeight: number;
};

function query(): URLSearchParams {
  return new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
}

export function usePremiumBattlePresentation(): boolean {
  const qs = query();
  return !qs.has("flatbattle") && !qs.has("plainbattle") && !qs.has("toydebug");
}

export function usePremiumBuildSpotRune(): boolean {
  const qs = query();
  return !qs.has("oldspots") && !qs.has("toydebug");
}

export function premiumBuildSpotMetrics(): PremiumBuildSpotMetrics {
  const qs = query();
  const compact = qs.has("compactspots");
  const large = qs.has("largespots") || qs.has("cinematicspots");
  const scale = compact ? 0.92 : large ? 1.12 : 1;
  return {
    shadowWidth: 82 * scale,
    shadowHeight: 25 * scale,
    rimWidth: 78 * scale,
    rimHeight: 45 * scale,
    coreWidth: 62 * scale,
    coreHeight: 35 * scale,
    premiumPadWidth: 74 * scale,
    premiumPadHeight: 54 * scale,
    hitWidth: 96 * scale,
    hitHeight: 78 * scale,
    runeSize: `${Math.round(18 * scale)}px`,
    tagWidth: 74 * scale,
    tagHeight: 18 * scale,
  };
}

/**
 * v2.36.2 Premium Battle Presentation
 *
 * 본 게임 전투 화면이 작은 장난감/스티커 목업처럼 보이지 않게 만드는 정적 연출 레이어다.
 * 대용량 이미지를 추가하지 않고, Phaser Graphics 기반의 넓은 음영/경로 깊이/전장 초점만 보강한다.
 * 반복 파티클이나 무한 트윈은 기본 사용하지 않으므로 첫 시작과 저사양 전투 안정성을 해치지 않는다.
 */
export function installPremiumBattlePresentation(scene: Phaser.Scene, stage: StageConfig): void {
  if (!usePremiumBattlePresentation()) return;

  const low = lowPowerMode();
  const palette = THEME_PALETTE[stage.theme];

  drawTerrainDepth(scene, palette, low);
  drawPremiumPathUnderlay(scene, stage, palette, low);
  drawBattlefieldFocus(scene, stage, palette, low);
  drawSafeAreaCurtains(scene, palette, low);
  drawStageCrest(scene, stage, palette, low);
}

function drawTerrainDepth(
  scene: Phaser.Scene,
  palette: (typeof THEME_PALETTE)[StageConfig["theme"]],
  low: boolean,
): void {
  const g = scene.add.graphics().setDepth(1.18);

  // 상하단을 살짝 눌러 중앙 전투 영역이 넓고 묵직하게 읽히도록 만든다.
  g.fillStyle(palette.deep, low ? 0.12 : 0.18);
  g.fillRect(0, 64, 960, 58);
  g.fillRect(0, 418, 960, 62);

  g.fillStyle(palette.terrain, low ? 0.08 : 0.12);
  g.fillEllipse(210, 166, 430, 146);
  g.fillEllipse(752, 382, 510, 150);
  g.fillStyle(palette.terrain2, low ? 0.055 : 0.085);
  g.fillEllipse(692, 154, 390, 116);
  g.fillEllipse(280, 392, 420, 122);

  // 화면 가장자리 잔물결을 큰 면으로 처리해, 작은 소품이 난립하는 느낌을 줄인다.
  g.lineStyle(1, 0xffffff, low ? 0.035 : 0.055);
  for (let i = 0; i < 5; i += 1) {
    const y = 110 + i * 72;
    g.beginPath();
    g.moveTo(72, y);
    g.lineTo(232, y + (i % 2 === 0 ? 8 : -7));
    g.lineTo(418, y + (i % 2 === 0 ? -4 : 6));
    g.strokePath();
    g.beginPath();
    g.moveTo(548, y + 12);
    g.lineTo(716, y + (i % 2 === 0 ? 1 : 16));
    g.lineTo(888, y + (i % 2 === 0 ? 14 : 3));
    g.strokePath();
  }
}

function drawPremiumPathUnderlay(
  scene: Phaser.Scene,
  stage: StageConfig,
  palette: (typeof THEME_PALETTE)[StageConfig["theme"]],
  low: boolean,
): void {
  if (stage.path.length < 2) return;

  const path = stage.path;
  const shadow = scene.add.graphics().setDepth(3.35);
  shadow.lineStyle(low ? 74 : 82, 0x000000, low ? 0.16 : 0.22);
  drawPathLine(shadow, path);

  const aura = scene.add.graphics().setDepth(3.48);
  aura.lineStyle(low ? 58 : 66, palette.accent, low ? 0.035 : 0.06);
  drawPathLine(aura, path);

  const edge = scene.add.graphics().setDepth(4.15);
  edge.lineStyle(low ? 42 : 48, 0x1b120a, low ? 0.30 : 0.38);
  drawPathLine(edge, path);
  edge.lineStyle(2, palette.pathGlow, low ? 0.18 : 0.26);
  drawPathLine(edge, path);

  // 주요 굴곡점에 큰 바닥 그림자만 배치해 길의 체급을 올린다.
  path.forEach((point, index) => {
    if (index === 0 || index === path.length - 1 || index % 2 === 1) {
      scene.add
        .ellipse(point.x, point.y + 18, low ? 82 : 96, low ? 18 : 22, 0x000000, low ? 0.12 : 0.17)
        .setDepth(3.62);
    }
  });
}

function drawPathLine(g: Phaser.GameObjects.Graphics, path: StageConfig["path"]): void {
  g.beginPath();
  g.moveTo(path[0].x, path[0].y);
  path.slice(1).forEach((point) => g.lineTo(point.x, point.y));
  g.strokePath();
}

function drawBattlefieldFocus(
  scene: Phaser.Scene,
  stage: StageConfig,
  palette: (typeof THEME_PALETTE)[StageConfig["theme"]],
  low: boolean,
): void {
  // 타워/몬스터가 작아 보이지 않도록 중앙 액션 영역에 큰 ADD 글로우를 깔아준다.
  scene.add
    .ellipse(480, 272, low ? 720 : 790, low ? 272 : 306, palette.glow, low ? 0.018 : 0.032)
    .setDepth(3.72)
    .setBlendMode(Phaser.BlendModes.ADD);

  for (const spot of stage.spots) {
    if (spot.y < 70 || spot.y > 466) continue;
    scene.add
      .ellipse(spot.x, spot.y + 18, 92, 24, 0x000000, low ? 0.11 : 0.16)
      .setDepth(9.05);
  }
}

function drawSafeAreaCurtains(
  scene: Phaser.Scene,
  palette: (typeof THEME_PALETTE)[StageConfig["theme"]],
  low: boolean,
): void {
  const g = scene.add.graphics().setDepth(68.5);
  g.fillStyle(0x02050c, low ? 0.20 : 0.26);
  g.fillRect(0, 0, 960, 64);
  g.fillRect(0, 480, 960, 60);
  g.lineStyle(2, palette.accent, low ? 0.14 : 0.22);
  g.beginPath();
  g.moveTo(36, 70);
  g.lineTo(924, 70);
  g.strokePath();
  g.beginPath();
  g.moveTo(36, 474);
  g.lineTo(924, 474);
  g.strokePath();
}

function drawStageCrest(
  scene: Phaser.Scene,
  stage: StageConfig,
  palette: (typeof THEME_PALETTE)[StageConfig["theme"]],
  low: boolean,
): void {
  if (query().has("minimalhud")) return;

  const title = scene.add.container(480, 82).setDepth(69.2);
  const bg = scene.add
    .rectangle(0, 0, 270, low ? 28 : 32, 0x07101e, low ? 0.58 : 0.66)
    .setStrokeStyle(1, palette.accent, low ? 0.18 : 0.28);
  const label = scene.add
    .text(0, 0, `STAGE ${stage.number} · ${stage.title}`, {
      fontFamily: "Pretendard, Noto Sans KR, Arial, sans-serif",
      fontSize: low ? "11px" : "12px",
      fontStyle: "bold",
      color: "#fff3c2",
      stroke: "#061020",
      strokeThickness: 2,
    })
    .setOrigin(0.5);
  title.add([bg, label]);
  title.setAlpha(low ? 0.72 : 0.82);
}
