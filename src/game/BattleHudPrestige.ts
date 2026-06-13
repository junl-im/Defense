import Phaser from "phaser";
import { mobileUiScale } from "./PerformanceMode";
import { lowPowerMode } from "./QualityManager";

export const PRESTIGE_HUD_FONT =
  "Pretendard, Noto Sans KR, NanumGothic, Arial, sans-serif";

function query(): URLSearchParams {
  return new URLSearchParams(
    typeof window !== "undefined" ? window.location.search : "",
  );
}

export function usePrestigeCombatHud(): boolean {
  const qs = query();
  if (qs.has("plainhud") || qs.has("legacyhud") || qs.has("toydebug")) {
    return false;
  }
  if (qs.has("plainbattle") || qs.has("flatbattle")) return false;
  return true;
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

export function addPrestigeHudChrome(scene: Phaser.Scene): void {
  if (!usePrestigeCombatHud()) return;
  const low = lowPowerMode();
  const chrome = scene.add.graphics().setDepth(70.35);

  chrome.fillStyle(0x02050a, 0.72).fillRect(0, 0, 960, 62);
  chrome.fillStyle(0x111724, 0.9).fillRoundedRect(14, 6, 932, 46, 16);
  chrome.fillStyle(0x27202a, 0.72).fillRoundedRect(20, 11, 920, 34, 12);
  chrome.fillStyle(0xffdf9a, low ? 0.08 : 0.13).fillRect(30, 12, 900, 2);
  chrome.fillStyle(0xffffff, low ? 0.035 : 0.055).fillRect(34, 18, 892, 5);
  chrome.lineStyle(1, 0xffe0a0, low ? 0.14 : 0.22).strokeRoundedRect(18, 8, 924, 42, 15);
  chrome.lineStyle(1, 0x000000, 0.45).strokeRoundedRect(14, 6, 932, 46, 16);

  chrome.fillStyle(0x02050a, 0.72).fillRect(0, 482, 960, 58);
  chrome.fillStyle(0x111724, 0.92).fillRoundedRect(18, 486, 924, 48, 18);
  chrome.fillStyle(0x2a2231, 0.68).fillRoundedRect(26, 491, 908, 36, 14);
  chrome.fillStyle(0xffdf9a, low ? 0.06 : 0.1).fillRect(44, 491, 872, 2);
  chrome.lineStyle(1, 0xffe0a0, low ? 0.12 : 0.2).strokeRoundedRect(22, 488, 916, 44, 16);

  // Static corner cuts and command separators: cheap, but makes the HUD read like a designed frame.
  chrome.lineStyle(2, 0xffc875, low ? 0.16 : 0.24);
  chrome.beginPath();
  chrome.moveTo(28, 50);
  chrome.lineTo(52, 50);
  chrome.moveTo(908, 50);
  chrome.lineTo(932, 50);
  chrome.moveTo(28, 490);
  chrome.lineTo(52, 490);
  chrome.moveTo(908, 490);
  chrome.lineTo(932, 490);
  chrome.strokePath();
}

export function createPrestigeStatReadout(
  scene: Phaser.Scene,
  x: number,
  width: number,
  label: string,
  mark: string,
  accent: number,
): Phaser.GameObjects.Text {
  const g = scene.add.graphics().setDepth(78.1);
  const left = x - width / 2;
  const y = 31;
  const deep = mix(accent, 0x000000, 0.72);
  const mid = mix(accent, 0xffffff, 0.12);
  const uiScale = Math.max(1, Math.min(1.14, mobileUiScale()));
  const labelSize = Math.round(10 * uiScale);
  const valueSize = Math.round(14 * uiScale);

  g.fillStyle(0x000000, 0.3).fillRoundedRect(left + 2, y - 17, width, 38, 12);
  g.fillStyle(0x0b1019, 0.96).fillRoundedRect(left, y - 20, width, 40, 12);
  g.fillStyle(deep, 0.94).fillRoundedRect(left + 3, y - 17, width - 6, 34, 9);
  g.fillStyle(0xffffff, 0.055).fillRoundedRect(left + 7, y - 15, width - 14, 7, 5);
  g.fillStyle(mid, 0.9).fillRoundedRect(left + 8, y + 10, width - 16, 3, 2);
  g.lineStyle(1, 0xffedc0, 0.22).strokeRoundedRect(left, y - 20, width, 40, 12);

  scene.add
    .text(left + 11, y - 9, label, {
      fontSize: `${labelSize}px`,
      color: "#cdbb91",
      fontStyle: "bold",
      fontFamily: PRESTIGE_HUD_FONT,
      letterSpacing: 0.8,
    })
    .setDepth(79.2);

  scene.add
    .text(left + 11, y + 8, mark, {
      fontSize: `${Math.max(10, labelSize)}px`,
      color: "#11141c",
      fontStyle: "bold",
      fontFamily: PRESTIGE_HUD_FONT,
      backgroundColor: "#ffd98a",
      padding: { x: 4, y: 1 },
    })
    .setOrigin(0, 0.5)
    .setDepth(79.3);

  return scene.add
    .text(left + 40, y + 8, "", {
      fontSize: `${valueSize}px`,
      color: "#fff8d8",
      fontStyle: "bold",
      fontFamily: PRESTIGE_HUD_FONT,
      shadow: { offsetX: 0, offsetY: 2, color: "#000000", blur: 2, fill: true },
    })
    .setOrigin(0, 0.5)
    .setDepth(80.1);
}

export function createPrestigeStageBanner(
  scene: Phaser.Scene,
  label: string,
): Phaser.GameObjects.Text {
  const g = scene.add.graphics().setDepth(78.2);
  g.fillStyle(0x000000, 0.28).fillRoundedRect(360, 11, 224, 38, 13);
  g.fillStyle(0x0c1621, 0.96).fillRoundedRect(356, 8, 228, 40, 14);
  g.fillStyle(0x1d2d29, 0.88).fillRoundedRect(362, 13, 216, 30, 10);
  g.fillStyle(0xffffff, 0.05).fillRoundedRect(370, 15, 200, 6, 4);
  g.lineStyle(1, 0xb8ffaf, 0.22).strokeRoundedRect(356, 8, 228, 40, 14);

  scene.add
    .text(470, 17, "ACTIVE THEATER", {
      fontSize: "9px",
      color: "#b7c8a0",
      fontStyle: "bold",
      fontFamily: PRESTIGE_HUD_FONT,
      letterSpacing: 1.4,
    })
    .setOrigin(0.5)
    .setDepth(79.2);

  return scene.add
    .text(470, 33, label, {
      fontSize: "14px",
      color: "#e9f4ff",
      fontStyle: "bold",
      fixedWidth: 208,
      align: "center",
      fontFamily: PRESTIGE_HUD_FONT,
      shadow: { offsetX: 0, offsetY: 2, color: "#000000", blur: 2, fill: true },
    })
    .setOrigin(0.5)
    .setDepth(80.1);
}

export function addPrestigeCommandFrame(
  scene: Phaser.Scene,
  x: number,
  y: number,
  width: number,
  height: number,
  accent: number,
  depth = 79,
): void {
  const g = scene.add.graphics().setDepth(depth);
  const left = x - width / 2;
  const top = y - height / 2;
  g.fillStyle(0x000000, 0.32).fillRoundedRect(left + 2, top + 4, width, height, 12);
  g.fillStyle(0x0d121b, 0.96).fillRoundedRect(left, top, width, height, 12);
  g.fillStyle(mix(accent, 0x000000, 0.68), 0.82).fillRoundedRect(
    left + 4,
    top + 4,
    width - 8,
    height - 8,
    9,
  );
  g.fillStyle(0xffffff, 0.06).fillRoundedRect(left + 8, top + 5, width - 16, 6, 4);
  g.lineStyle(1, mix(accent, 0xffe0a0, 0.28), 0.28).strokeRoundedRect(
    left,
    top,
    width,
    height,
    12,
  );
}

export function createPrestigeSpellCard(
  scene: Phaser.Scene,
  x: number,
  y: number,
  width: number,
  height: number,
  accent: number,
  caption: string,
): void {
  addPrestigeCommandFrame(scene, x, y, width, height, accent, 80.2);
  scene.add
    .text(x - width / 2 + 14, y - height / 2 + 8, caption, {
      fontSize: "9px",
      color: "#ceb98d",
      fontStyle: "bold",
      fontFamily: PRESTIGE_HUD_FONT,
      letterSpacing: 1.1,
    })
    .setDepth(84.2);
}

export function prestigeActionTextStyle(fontSize = 15): Phaser.Types.GameObjects.Text.TextStyle {
  return {
    fontSize: `${fontSize}px`,
    color: "#fff7d8",
    fontStyle: "bold",
    fontFamily: PRESTIGE_HUD_FONT,
    shadow: { offsetX: 0, offsetY: 2, color: "#000000", blur: 2, fill: true },
  };
}
