import Phaser from "phaser";
import { isMobileRuntime, mobileUiScale } from "./PerformanceMode";

export const MOBILE_READABLE_FONT =
  "Pretendard, Noto Sans KR, NanumGothic, Arial, sans-serif";

function query(): URLSearchParams {
  return new URLSearchParams(
    typeof window !== "undefined" ? window.location.search : "",
  );
}

export function useMobileReadableUi(): boolean {
  const qs = query();
  return !(qs.has("tinyui") || qs.has("compactui") || qs.has("legacyreadability") || qs.has("toydebug"));
}

export function readableUiScale(): number {
  if (!useMobileReadableUi()) return 1;
  const base = Math.max(1, mobileUiScale());
  const mobileBoost = isMobileRuntime() ? 1.14 : 1.06;
  return Math.max(1.08, Math.min(1.34, base * mobileBoost));
}

export function readableFontSize(size: number, min = 15, max = 34): string {
  if (!useMobileReadableUi()) return `${Math.round(size)}px`;
  return `${Math.min(max, Math.max(min, Math.round(size * readableUiScale())))}px`;
}

export function readableTextStyle(
  base: Phaser.Types.GameObjects.Text.TextStyle,
  options: { fontSize?: number; min?: number; max?: number; stroke?: string; strokeThickness?: number } = {},
): Phaser.Types.GameObjects.Text.TextStyle {
  if (!useMobileReadableUi()) return base;
  return {
    fontFamily: MOBILE_READABLE_FONT,
    shadow: { offsetX: 0, offsetY: 2, color: "#000000", blur: 3, fill: true },
    ...base,
    fontSize: readableFontSize(options.fontSize ?? parseStyleFontSize(base.fontSize, 15), options.min ?? 15, options.max ?? 34),
    stroke: options.stroke ?? String(base.stroke ?? "#020611"),
    strokeThickness: Math.max(options.strokeThickness ?? 3, Number(base.strokeThickness ?? 0)),
  };
}

export function readableHitSize(width: number, height: number): { width: number; height: number } {
  if (!useMobileReadableUi()) return { width, height };
  const scale = readableUiScale();
  return {
    width: Math.max(width, Math.round(width * Math.min(1.16, scale)), 54),
    height: Math.max(height, Math.round(height * Math.min(1.24, scale)), 48),
  };
}

export function improveReadableText(
  text: Phaser.GameObjects.Text,
  options: { min?: number; max?: number; stroke?: string; strokeThickness?: number; shadowBlur?: number } = {},
): Phaser.GameObjects.Text {
  if (!useMobileReadableUi()) return text;
  const current = readTextFontSize(text);
  const min = options.min ?? (isMobileRuntime() ? 15 : 14);
  const max = options.max ?? 34;
  const next = Math.min(max, Math.max(min, Math.round(current * 1.06)));
  text.setFontFamily(MOBILE_READABLE_FONT);
  text.setFontSize(`${next}px`);
  text.setStroke(options.stroke ?? "#020611", options.strokeThickness ?? 3);
  text.setShadow(0, 2, "#000000", options.shadowBlur ?? 3, true, true);
  maybeSetResolution(text, isMobileRuntime() ? 2 : 1.5);
  return text;
}

export function improveReadableTextTree(
  root: Phaser.Scene | Phaser.GameObjects.Container,
  options: { min?: number; max?: number; stroke?: string; strokeThickness?: number; shadowBlur?: number } = {},
): void {
  if (!useMobileReadableUi()) return;
  const list = isScene(root) ? root.children.list : root.list;
  list.forEach((item) => visit(item, options));
}

export function installSceneReadabilityPass(
  scene: Phaser.Scene,
  options: { min?: number; max?: number; stroke?: string; strokeThickness?: number; shadowBlur?: number; delayMs?: number } = {},
): void {
  if (!useMobileReadableUi()) return;
  const run = (): void => {
    if (!scene.scene.isActive(scene.scene.key)) return;
    improveReadableTextTree(scene, options);
  };
  const delay = options.delayMs ?? 0;
  if (delay > 0) scene.time.delayedCall(delay, run);
  else run();
}

function visit(
  item: Phaser.GameObjects.GameObject,
  options: { min?: number; max?: number; stroke?: string; strokeThickness?: number; shadowBlur?: number },
): void {
  if (item instanceof Phaser.GameObjects.Text) improveReadableText(item, options);
  const maybeContainer = item as unknown as { list?: Phaser.GameObjects.GameObject[] };
  if (Array.isArray(maybeContainer.list)) maybeContainer.list.forEach((child) => visit(child, options));
}

function isScene(root: Phaser.Scene | Phaser.GameObjects.Container): root is Phaser.Scene {
  return "children" in root;
}

function readTextFontSize(text: Phaser.GameObjects.Text): number {
  const style = text.style as unknown as { fontSize?: string | number };
  return parseStyleFontSize(style.fontSize, 14);
}

function parseStyleFontSize(value: string | number | undefined, fallback: number): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value.replace("px", ""));
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function maybeSetResolution(text: Phaser.GameObjects.Text, value: number): void {
  const candidate = text as Phaser.GameObjects.Text & {
    setResolution?: (resolution: number) => Phaser.GameObjects.Text;
  };
  candidate.setResolution?.(value);
}
