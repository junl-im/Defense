import Phaser from "phaser";
import { preferReducedMotion } from "./PerformanceMode";

export const PRESTIGE_SCENE_FONT =
  "Pretendard, Noto Sans KR, NanumGothic, Arial, sans-serif";

function query(): URLSearchParams {
  return new URLSearchParams(
    typeof window !== "undefined" ? window.location.search : "",
  );
}

export function usePrestigeSceneFrame(): boolean {
  const qs = query();
  return !(
    qs.has("plainui") ||
    qs.has("legacyui") ||
    qs.has("toydebug") ||
    qs.has("plainbattle") ||
    qs.has("flatbattle")
  );
}

function addFrameLines(scene: Phaser.Scene, depth: number, alpha: number): void {
  const g = scene.add.graphics().setDepth(depth);
  g.lineStyle(1, 0xffdf9a, alpha * 0.52);
  g.strokeRoundedRect(12, 10, 936, 520, 18);
  g.lineStyle(1, 0x9bd7ff, alpha * 0.16);
  g.strokeRoundedRect(21, 18, 918, 502, 14);

  g.lineStyle(2, 0xffcf7a, alpha * 0.38);
  g.beginPath();
  g.moveTo(28, 38);
  g.lineTo(76, 38);
  g.moveTo(884, 38);
  g.lineTo(932, 38);
  g.moveTo(28, 502);
  g.lineTo(76, 502);
  g.moveTo(884, 502);
  g.lineTo(932, 502);
  g.strokePath();
}

export function addPrestigeSceneVignette(
  scene: Phaser.Scene,
  variant: "login" | "lobby" | "world",
  depth = 4,
): void {
  if (!usePrestigeSceneFrame()) return;

  const strong = variant === "login" ? 0.34 : variant === "world" ? 0.28 : 0.24;
  const bottom = variant === "login" ? 0.38 : 0.3;
  const g = scene.add.graphics().setDepth(depth);
  g.fillGradientStyle(0x02050d, 0x02050d, 0x02050d, 0x02050d, strong, strong, 0, 0);
  g.fillRect(0, 0, 960, 128);
  g.fillGradientStyle(0x02050d, 0x02050d, 0x02050d, 0x02050d, 0, 0, bottom, bottom);
  g.fillRect(0, 396, 960, 144);
  g.fillStyle(0x02050d, variant === "login" ? 0.1 : 0.14).fillRect(0, 0, 32, 540);
  g.fillStyle(0x02050d, variant === "login" ? 0.1 : 0.14).fillRect(928, 0, 32, 540);

  addFrameLines(scene, depth + 0.1, variant === "login" ? 0.72 : 0.62);
}

export function addLoginPrestigePlate(scene: Phaser.Scene): void {
  if (!usePrestigeSceneFrame()) return;
  const g = scene.add.graphics().setDepth(21);
  g.fillStyle(0x050b16, 0.18).fillRoundedRect(287, 232, 386, 252, 28);
  g.fillStyle(0xffffff, 0.035).fillRoundedRect(303, 244, 354, 34, 15);
  g.fillStyle(0xffd98a, 0.08).fillRect(318, 283, 324, 2);
  g.lineStyle(1, 0xffdf9a, 0.22).strokeRoundedRect(294, 238, 372, 240, 24);
  g.lineStyle(1, 0x9fdcff, 0.12).strokeRoundedRect(306, 249, 348, 218, 19);
}

export function addLobbyCommandPlate(scene: Phaser.Scene): void {
  if (!usePrestigeSceneFrame()) return;
  const g = scene.add.graphics().setDepth(6.5);
  g.fillStyle(0x02060f, 0.36).fillRoundedRect(126, 468, 708, 56, 25);
  g.fillStyle(0x14131c, 0.72).fillRoundedRect(142, 476, 676, 40, 20);
  g.lineStyle(1, 0xffdc82, 0.26).strokeRoundedRect(132, 472, 696, 46, 22);
  g.lineStyle(1, 0x9fe8ff, 0.13).strokeRoundedRect(150, 480, 660, 32, 16);

  scene.add
    .text(480, 464, "COMMAND DECK", {
      fontFamily: PRESTIGE_SCENE_FONT,
      fontSize: "9px",
      fontStyle: "bold",
      color: "#d9c18b",
      fixedWidth: 180,
      align: "center",
      letterSpacing: 1.2,
    })
    .setOrigin(0.5)
    .setDepth(9.2)
    .setAlpha(0.92);
}

export function addWorldIntelPlate(scene: Phaser.Scene): void {
  if (!usePrestigeSceneFrame()) return;
  const g = scene.add.graphics().setDepth(21.2);
  g.fillStyle(0x030811, 0.38).fillRoundedRect(696, 96, 244, 374, 24);
  g.fillStyle(0x0d1420, 0.74).fillRoundedRect(706, 108, 224, 348, 20);
  g.fillStyle(0xffffff, 0.035).fillRoundedRect(718, 120, 200, 92, 14);
  g.fillStyle(0xffdc82, 0.09).fillRect(720, 298, 196, 2);
  g.lineStyle(1, 0xffdc82, 0.24).strokeRoundedRect(700, 100, 236, 366, 22);
  g.lineStyle(1, 0x9fe8ff, 0.1).strokeRoundedRect(713, 113, 210, 340, 18);

  scene.add
    .text(818, 102, "OPERATION INTEL", {
      fontFamily: PRESTIGE_SCENE_FONT,
      fontSize: "9px",
      fontStyle: "bold",
      color: "#dbc48d",
      fixedWidth: 176,
      align: "center",
      letterSpacing: 1.2,
    })
    .setOrigin(0.5)
    .setDepth(24.2)
    .setAlpha(0.96);
}

export function addStaticSignalSweep(
  scene: Phaser.Scene,
  x: number,
  y: number,
  width: number,
  depth: number,
): void {
  if (!usePrestigeSceneFrame() || preferReducedMotion()) return;
  const bar = scene.add
    .rectangle(x - width * 0.42, y, width * 0.16, 2, 0xffe0a4, 0.32)
    .setDepth(depth)
    .setBlendMode(Phaser.BlendModes.ADD);
  scene.tweens.add({
    targets: bar,
    x: x + width * 0.42,
    alpha: 0.08,
    duration: 2600,
    repeat: -1,
    ease: "Sine.easeInOut",
  });
}
