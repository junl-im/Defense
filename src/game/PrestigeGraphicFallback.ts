import Phaser from "phaser";
import { lowPowerMode } from "./QualityManager";
import { isMobileRuntime, mobileUiScale, preferReducedMotion } from "./PerformanceMode";
import type { PathPoint, StageConfig } from "./types";

export type GraphicFallbackVariant =
  | "login"
  | "lobby"
  | "world"
  | "lab"
  | "forge"
  | "codex"
  | "hero"
  | "mission"
  | "meta";

export type GraphicFallbackProfile = {
  enabled: boolean;
  safe: boolean;
  highContrast: boolean;
  density: number;
  alpha: number;
  label: string;
};

function query(): URLSearchParams {
  return new URLSearchParams(
    typeof window !== "undefined" ? window.location.search : "",
  );
}

function hasDocumentClass(name: string): boolean {
  if (typeof document === "undefined") return false;
  return document.documentElement.classList.contains(name);
}

function networkSaveData(): boolean {
  if (typeof navigator === "undefined") return false;
  const nav = navigator as Navigator & {
    connection?: { saveData?: boolean; effectiveType?: string };
  };
  return Boolean(nav.connection?.saveData);
}

function weakNetwork(): boolean {
  if (typeof navigator === "undefined") return false;
  const nav = navigator as Navigator & {
    connection?: { saveData?: boolean; effectiveType?: string };
  };
  const type = nav.connection?.effectiveType;
  return type === "slow-2g" || type === "2g";
}

function applyGraphicRootClass(profile: GraphicFallbackProfile): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.toggle("ks-graphic-fallback", profile.enabled);
  root.classList.toggle("ks-graphic-fallback-safe", profile.enabled && profile.safe);
  root.classList.toggle("ks-graphic-fallback-contrast", profile.enabled && profile.highContrast);
  root.style.setProperty("--ks-graphic-fallback-alpha", profile.alpha.toFixed(2));
}

export function usePrestigeGraphicFallback(): boolean {
  const qs = query();
  if (
    qs.has("plainart") ||
    qs.has("legacygfx") ||
    qs.has("toygfx") ||
    qs.has("nographicfallback") ||
    qs.has("toydebug")
  ) {
    return false;
  }
  return true;
}

export function getGraphicFallbackProfile(): GraphicFallbackProfile {
  const qs = query();
  const forced = qs.has("graphicfallback") || qs.has("paintedfallback") || qs.has("prestigegfx");
  const safe =
    lowPowerMode() ||
    networkSaveData() ||
    weakNetwork() ||
    hasDocumentClass("ks-runtime-lockdown") ||
    hasDocumentClass("ks-engine-lockdown") ||
    qs.has("safegfx") ||
    qs.has("fallbackgfx");
  const highContrast =
    qs.has("contrastgfx") ||
    qs.has("highcontrast") ||
    qs.has("fallbackui") ||
    hasDocumentClass("ks-readable-ui-contrast");
  const mobile = isMobileRuntime();
  const baseDensity = safe ? 0.72 : mobile ? 0.9 : 1;
  const density = Math.max(
    0.58,
    Math.min(1.18, baseDensity * Math.min(1.08, mobileUiScale())),
  );
  const profile = {
    enabled: usePrestigeGraphicFallback() || forced,
    safe,
    highContrast,
    density,
    alpha: highContrast ? 1.14 : safe ? 0.86 : 1,
    label: safe ? "safe-painted-fallback" : "prestige-painted-fallback",
  };
  applyGraphicRootClass(profile);
  return profile;
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

function themePalette(theme: StageConfig["theme"]): {
  deep: number;
  ground: number;
  mid: number;
  rim: number;
  danger: number;
} {
  if (theme === "canyon") {
    return { deep: 0x12090b, ground: 0x4a251c, mid: 0x9a5a35, rim: 0xffc46e, danger: 0xff664d };
  }
  if (theme === "swamp") {
    return { deep: 0x06120f, ground: 0x18362c, mid: 0x45674b, rim: 0x9dffd0, danger: 0x72d3ff };
  }
  if (theme === "fortress") {
    return { deep: 0x090911, ground: 0x241a23, mid: 0x5d4d57, rim: 0xff9c72, danger: 0xff4e64 };
  }
  return { deep: 0x07130d, ground: 0x1f442c, mid: 0x48743b, rim: 0xd3ff86, danger: 0xffc86d };
}

function distanceToPath(x: number, y: number, path: PathPoint[]): number {
  let best = Number.POSITIVE_INFINITY;
  for (let i = 1; i < path.length; i += 1) {
    const a = path[i - 1];
    const b = path[i];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const lenSq = dx * dx + dy * dy;
    const t = lenSq <= 0 ? 0 : Phaser.Math.Clamp(((x - a.x) * dx + (y - a.y) * dy) / lenSq, 0, 1);
    const px = a.x + dx * t;
    const py = a.y + dy * t;
    best = Math.min(best, Phaser.Math.Distance.Between(x, y, px, py));
  }
  return best;
}

function drawPathStroke(
  g: Phaser.GameObjects.Graphics,
  path: PathPoint[],
  color: number,
  width: number,
  alpha: number,
): void {
  if (path.length <= 0) return;
  g.lineStyle(width, color, alpha);
  g.beginPath();
  g.moveTo(path[0].x, path[0].y);
  path.slice(1).forEach((p) => g.lineTo(p.x, p.y));
  g.strokePath();
}

function drawFoundationGem(
  g: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  radius: number,
  fill: number,
  rim: number,
  alpha: number,
): void {
  g.fillStyle(0x000000, 0.22 * alpha).fillEllipse(x + 2, y + 9, radius * 2.2, radius * 0.72);
  g.fillStyle(mix(fill, 0x000000, 0.28), 0.5 * alpha).fillEllipse(x, y + 4, radius * 2.1, radius * 1.1);
  g.lineStyle(2, rim, 0.2 * alpha).strokeEllipse(x, y + 4, radius * 2.18, radius * 1.16);
  g.lineStyle(1, 0xffffff, 0.08 * alpha).strokeEllipse(x, y + 1, radius * 1.55, radius * 0.72);
}

export function installBattleGraphicFallback(
  scene: Phaser.Scene,
  stage: StageConfig,
): void {
  const profile = getGraphicFallbackProfile();
  if (!profile.enabled) return;
  const p = themePalette(stage.theme);
  const density = profile.density;
  const alpha = profile.alpha;

  const backdrop = scene.add.graphics().setDepth(3.18).setName("ks-graphic-battle-fallback-backdrop");
  backdrop.fillStyle(p.deep, 0.18 * alpha).fillRect(0, 58, 960, 428);
  backdrop.fillStyle(mix(p.ground, p.deep, 0.22), 0.16 * alpha).fillRoundedRect(28, 76, 904, 384, 34);
  backdrop.fillStyle(p.rim, 0.025 * alpha).fillEllipse(512, 250, 820, 318);
  backdrop.fillStyle(p.mid, 0.045 * alpha).fillEllipse(188, 154, 430, 126);
  backdrop.fillStyle(p.danger, 0.032 * alpha).fillEllipse(790, 386, 330, 118);

  const contourCount = Math.round(profile.safe ? 8 : 14);
  for (let i = 0; i < contourCount; i += 1) {
    const x = 72 + ((i * 143) % 820);
    const y = 100 + ((i * 89) % 338);
    if (distanceToPath(x, y, stage.path) < 62) continue;
    const w = 80 + (i % 4) * 28;
    const h = 20 + (i % 5) * 9;
    backdrop.fillStyle(i % 2 === 0 ? p.mid : p.rim, (0.026 + (i % 3) * 0.01) * alpha);
    backdrop.fillEllipse(x, y, w * density, h * density);
  }

  const pathArt = scene.add.graphics().setDepth(4.36).setName("ks-graphic-battle-path-rescue");
  drawPathStroke(pathArt, stage.path, 0x000000, profile.highContrast ? 82 : 72, 0.18 * alpha);
  drawPathStroke(pathArt, stage.path, p.deep, profile.highContrast ? 66 : 58, 0.22 * alpha);
  drawPathStroke(pathArt, stage.path, mix(p.rim, 0xffffff, 0.08), profile.highContrast ? 7 : 5, 0.16 * alpha);

  const tactical = scene.add.graphics().setDepth(9.6).setName("ks-graphic-tactical-foundations");
  stage.spots.forEach((spot, index) => {
    const radius = (index % 3 === 0 ? 38 : 34) * density;
    drawFoundationGem(tactical, spot.x, spot.y, radius, p.ground, p.rim, alpha);
    if (!profile.safe && index % 2 === 0) {
      tactical.lineStyle(1, p.rim, 0.09 * alpha);
      tactical.beginPath();
      tactical.moveTo(spot.x - radius * 0.45, spot.y + 3);
      tactical.lineTo(spot.x + radius * 0.45, spot.y + 3);
      tactical.strokePath();
    }
  });

  const gate = scene.add.graphics().setDepth(9.7).setName("ks-graphic-objective-gates");
  const start = stage.path[0];
  const end = stage.path[stage.path.length - 1];
  const gateAlpha = profile.highContrast ? 0.54 : 0.36;
  gate.fillStyle(0x000000, 0.26).fillEllipse(start.x, start.y + 12, 70, 20);
  gate.fillStyle(p.rim, 0.12 * alpha).fillRoundedRect(start.x - 34, start.y - 30, 68, 38, 10);
  gate.lineStyle(2, p.rim, gateAlpha * alpha).strokeRoundedRect(start.x - 34, start.y - 30, 68, 38, 10);
  gate.fillStyle(0x000000, 0.26).fillEllipse(end.x, end.y + 12, 82, 22);
  gate.fillStyle(p.danger, 0.12 * alpha).fillRoundedRect(end.x - 39, end.y - 34, 78, 42, 12);
  gate.lineStyle(2, p.danger, gateAlpha * alpha).strokeRoundedRect(end.x - 39, end.y - 34, 78, 42, 12);

  if (!profile.safe && !preferReducedMotion()) {
    const glint = scene.add
      .rectangle(168, 82, 124, 2, p.rim, 0.18)
      .setDepth(67.15)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setName("ks-graphic-fallback-glint");
    scene.tweens.add({
      targets: glint,
      x: 792,
      alpha: 0.04,
      duration: 3600,
      repeat: -1,
      yoyo: true,
      ease: "Sine.easeInOut",
    });
  }
}

function scenePalette(variant: GraphicFallbackVariant): { deep: number; mid: number; rim: number; accent: number } {
  if (variant === "login") return { deep: 0x041023, mid: 0x17365f, rim: 0xffdf8a, accent: 0x72d9ff };
  if (variant === "world") return { deep: 0x07131c, mid: 0x1f4c4d, rim: 0xffd37b, accent: 0x89ffa9 };
  if (variant === "lobby") return { deep: 0x080b16, mid: 0x2a334a, rim: 0xffd37b, accent: 0x87d9ff };
  if (variant === "forge") return { deep: 0x0d0808, mid: 0x3c1f18, rim: 0xffa85d, accent: 0xffd778 };
  if (variant === "codex") return { deep: 0x07111d, mid: 0x1b334d, rim: 0x87d9ff, accent: 0xffd778 };
  if (variant === "hero") return { deep: 0x071016, mid: 0x1d3440, rim: 0xf7d36b, accent: 0x9df2ff };
  if (variant === "mission") return { deep: 0x120b07, mid: 0x3c2517, rim: 0xffd778, accent: 0xff9478 };
  if (variant === "meta") return { deep: 0x08080d, mid: 0x2c2032, rim: 0xffd778, accent: 0xa9d8ff };
  return { deep: 0x09121d, mid: 0x1f3447, rim: 0xffd778, accent: 0x8bd9ff };
}

export function installSceneGraphicFallback(
  scene: Phaser.Scene,
  variant: GraphicFallbackVariant,
  depth = 1.8,
): void {
  const profile = getGraphicFallbackProfile();
  if (!profile.enabled) return;
  const p = scenePalette(variant);
  const alpha = profile.alpha;
  const g = scene.add.graphics().setDepth(depth).setName(`ks-graphic-${variant}-fallback`);

  g.fillStyle(p.deep, 0.22 * alpha).fillRect(0, 0, 960, 540);
  g.fillStyle(p.mid, (variant === "login" ? 0.16 : 0.12) * alpha).fillEllipse(480, 252, 780, 360);
  g.fillStyle(p.accent, 0.04 * alpha).fillEllipse(190, 132, 330, 118);
  g.fillStyle(p.rim, 0.035 * alpha).fillEllipse(770, 424, 340, 106);

  const frameAlpha = profile.highContrast ? 0.34 : 0.2;
  g.lineStyle(1, p.rim, frameAlpha * alpha).strokeRoundedRect(18, 16, 924, 508, 22);
  g.lineStyle(1, p.accent, 0.11 * alpha).strokeRoundedRect(30, 28, 900, 484, 18);

  const plates = profile.safe ? 5 : 9;
  for (let i = 0; i < plates; i += 1) {
    const x = 78 + ((i * 131) % 808);
    const y = 92 + ((i * 71) % 352);
    const w = 64 + (i % 4) * 26;
    const h = 16 + (i % 3) * 7;
    g.fillStyle(i % 2 === 0 ? p.rim : p.accent, (0.026 + (i % 3) * 0.008) * alpha);
    g.fillRoundedRect(x - w / 2, y - h / 2, w, h, 8);
  }

  if (variant !== "login") {
    g.fillStyle(0x000000, profile.highContrast ? 0.28 : 0.18).fillRect(0, 0, 960, 70);
    g.fillStyle(0x000000, profile.highContrast ? 0.28 : 0.2).fillRect(0, 470, 960, 70);
  }

  if (!profile.safe && !preferReducedMotion() && (variant === "lobby" || variant === "world")) {
    const line = scene.add
      .rectangle(190, variant === "world" ? 96 : 454, 120, 2, p.rim, 0.16)
      .setDepth(depth + 0.12)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setName(`ks-graphic-${variant}-sweep`);
    scene.tweens.add({
      targets: line,
      x: 770,
      alpha: 0.04,
      duration: 3800,
      repeat: -1,
      yoyo: true,
      ease: "Sine.easeInOut",
    });
  }
}
