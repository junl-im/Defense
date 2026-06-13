import Phaser from "phaser";
import { mobileUiScale, preferReducedMotion } from "./PerformanceMode";
import { lowPowerMode } from "./QualityManager";
import { PRESTIGE_HUD_FONT } from "./BattleHudPrestige";

function query(): URLSearchParams {
  return new URLSearchParams(
    typeof window !== "undefined" ? window.location.search : "",
  );
}

export function usePrestigeResultUi(): boolean {
  const qs = query();
  return !(qs.has("plainresult") || qs.has("legacyresult") || qs.has("toydebug"));
}

function mix(base: number, add: number, amount: number): number {
  const br = (base >> 16) & 0xff;
  const bg = (base >> 8) & 0xff;
  const bb = base & 0xff;
  const ar = (add >> 16) & 0xff;
  const ag = (add >> 8) & 0xff;
  const ab = add & 0xff;
  const r = Math.round(br + (ar - br) * amount);
  const g = Math.round(bg + (ag - bg) * amount);
  const b = Math.round(bb + (ab - bb) * amount);
  return (r << 16) | (g << 8) | b;
}

export function addPrestigeResultBackdrop(
  scene: Phaser.Scene,
  accent = 0xf7d36b,
  depth = 91.4,
): Phaser.GameObjects.Graphics | undefined {
  if (!usePrestigeResultUi()) return undefined;
  const low = lowPowerMode();
  const g = scene.add.graphics().setDepth(depth);
  g.fillStyle(0x01040a, low ? 0.78 : 0.84).fillRect(0, 0, 960, 540);
  g.fillGradientStyle(0x101923, 0x101923, 0x02050b, 0x02050b, 0.55, 0.55, 0.9, 0.9);
  g.fillRect(0, 0, 960, 540);
  g.fillStyle(mix(accent, 0x000000, 0.68), low ? 0.11 : 0.16).fillRect(0, 66, 960, 128);
  g.fillStyle(0x000000, low ? 0.1 : 0.16).fillRect(0, 418, 960, 122);
  g.lineStyle(1, accent, low ? 0.18 : 0.28).strokeRoundedRect(20, 16, 920, 506, 24);
  g.lineStyle(1, 0x9fe8ff, low ? 0.06 : 0.1).strokeRoundedRect(34, 29, 892, 480, 19);
  g.lineStyle(2, accent, low ? 0.16 : 0.26);
  g.beginPath();
  g.moveTo(42, 54);
  g.lineTo(106, 54);
  g.moveTo(854, 54);
  g.lineTo(918, 54);
  g.moveTo(42, 486);
  g.lineTo(106, 486);
  g.moveTo(854, 486);
  g.lineTo(918, 486);
  g.strokePath();

  if (!low && !preferReducedMotion()) {
    const scan = scene.add
      .rectangle(480, 96, 690, 2, accent, 0.18)
      .setDepth(depth + 0.2)
      .setBlendMode(Phaser.BlendModes.ADD);
    scene.tweens.add({
      targets: scan,
      y: 438,
      alpha: 0.04,
      duration: 3200,
      repeat: -1,
      yoyo: true,
      ease: "Sine.easeInOut",
    });
  }

  return g;
}

export function addPrestigeResultPanel(
  scene: Phaser.Scene,
  x: number,
  y: number,
  width: number,
  height: number,
  accent = 0xf7d36b,
  depth = 92,
): Phaser.GameObjects.Graphics {
  const g = scene.add.graphics().setDepth(depth);
  const left = x - width / 2;
  const top = y - height / 2;
  const deep = mix(accent, 0x000000, 0.78);
  g.fillStyle(0x000000, 0.34).fillRoundedRect(left + 4, top + 7, width, height, 20);
  g.fillStyle(0x070b13, 0.95).fillRoundedRect(left, top, width, height, 20);
  g.fillStyle(deep, 0.76).fillRoundedRect(left + 8, top + 8, width - 16, height - 16, 16);
  g.fillStyle(0xffffff, 0.045).fillRoundedRect(left + 14, top + 12, width - 28, 34, 13);
  g.fillStyle(accent, 0.09).fillRoundedRect(left + 18, top + height - 23, width - 36, 3, 2);
  g.lineStyle(1, accent, 0.28).strokeRoundedRect(left, top, width, height, 20);
  g.lineStyle(1, 0x9fdcff, 0.09).strokeRoundedRect(left + 8, top + 8, width - 16, height - 16, 15);
  return g;
}

export function addPrestigeDebriefHeader(
  scene: Phaser.Scene,
  status: string,
  title: string,
  subtitle: string,
  accent = 0xf7d36b,
  depth = 93,
): void {
  const g = scene.add.graphics().setDepth(depth - 0.2);
  g.fillStyle(0x04070d, 0.96).fillRoundedRect(150, 62, 660, 72, 18);
  g.fillStyle(mix(accent, 0x000000, 0.72), 0.86).fillRoundedRect(160, 70, 640, 56, 14);
  g.fillStyle(0xffffff, 0.055).fillRoundedRect(170, 73, 620, 9, 6);
  g.lineStyle(1, accent, 0.34).strokeRoundedRect(150, 62, 660, 72, 18);

  scene.add
    .text(480, 81, status, {
      fontFamily: PRESTIGE_HUD_FONT,
      fontSize: "11px",
      color: "#d7c497",
      fontStyle: "bold",
      letterSpacing: 2,
      fixedWidth: 520,
      align: "center",
    })
    .setOrigin(0.5)
    .setDepth(depth + 0.1);

  scene.add
    .text(480, 103, title, {
      fontFamily: PRESTIGE_HUD_FONT,
      fontSize: "30px",
      color: "#fff3c4",
      fontStyle: "bold",
      fixedWidth: 600,
      align: "center",
      shadow: { offsetX: 0, offsetY: 3, color: "#000000", blur: 3, fill: true },
    })
    .setOrigin(0.5)
    .setDepth(depth + 0.2);

  scene.add
    .text(480, 124, subtitle, {
      fontFamily: PRESTIGE_HUD_FONT,
      fontSize: "12px",
      color: "#cdd9ef",
      fixedWidth: 600,
      align: "center",
    })
    .setOrigin(0.5)
    .setDepth(depth + 0.2);
}

export function addPrestigeMetricCard(
  scene: Phaser.Scene,
  x: number,
  y: number,
  label: string,
  value: string,
  accent = 0xf7d36b,
  depth = 94,
): void {
  const uiScale = Math.max(1, Math.min(1.13, mobileUiScale()));
  const width = 144;
  const height = 48;
  const left = x - width / 2;
  const top = y - height / 2;
  const g = scene.add.graphics().setDepth(depth - 0.1);
  g.fillStyle(0x000000, 0.28).fillRoundedRect(left + 2, top + 4, width, height, 13);
  g.fillStyle(0x0b111c, 0.96).fillRoundedRect(left, top, width, height, 13);
  g.fillStyle(mix(accent, 0x000000, 0.78), 0.82).fillRoundedRect(left + 5, top + 5, width - 10, height - 10, 10);
  g.fillStyle(0xffffff, 0.055).fillRoundedRect(left + 10, top + 7, width - 20, 6, 4);
  g.lineStyle(1, accent, 0.24).strokeRoundedRect(left, top, width, height, 13);

  scene.add
    .text(x, y - 10, label, {
      fontFamily: PRESTIGE_HUD_FONT,
      fontSize: `${Math.round(9 * uiScale)}px`,
      color: "#cbb78a",
      fontStyle: "bold",
      fixedWidth: width - 16,
      align: "center",
      letterSpacing: 1.1,
    })
    .setOrigin(0.5)
    .setDepth(depth);

  scene.add
    .text(x, y + 9, value, {
      fontFamily: PRESTIGE_HUD_FONT,
      fontSize: `${Math.round(15 * uiScale)}px`,
      color: "#fff8d8",
      fontStyle: "bold",
      fixedWidth: width - 14,
      align: "center",
      shadow: { offsetX: 0, offsetY: 2, color: "#000000", blur: 2, fill: true },
    })
    .setOrigin(0.5)
    .setDepth(depth + 0.1);
}

export function addPrestigeResultSectionTitle(
  scene: Phaser.Scene,
  x: number,
  y: number,
  label: string,
  accent = 0xf7d36b,
  depth = 94,
): void {
  scene.add
    .text(x, y, label, {
      fontFamily: PRESTIGE_HUD_FONT,
      fontSize: "11px",
      color: "#dbc48d",
      fontStyle: "bold",
      fixedWidth: 240,
      align: "center",
      letterSpacing: 1.2,
    })
    .setOrigin(0.5)
    .setDepth(depth);
  scene.add
    .rectangle(x, y + 14, 184, 2, accent, 0.16)
    .setDepth(depth - 0.1);
}

export function prestigeRankLabel(index: number): string {
  if (index === 0) return "RANK 01";
  if (index === 1) return "RANK 02";
  if (index === 2) return "RANK 03";
  return `RANK ${String(index + 1).padStart(2, "0")}`;
}

export function formatCompactTime(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}
