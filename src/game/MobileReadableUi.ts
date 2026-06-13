import Phaser from "phaser";
import { isMobileRuntime, mobileUiScale } from "./PerformanceMode";
import { applyAdaptiveFallbackRootClasses, installAdaptiveFallbackDirector } from "./AdaptiveFallbackDirector";
import { installAdaptiveRescueOrchestrator } from "./AdaptiveRescueOrchestrator";

export const MOBILE_READABLE_FONT =
  "Pretendard, Noto Sans KR, NanumGothic, Arial, sans-serif";

type ReadabilityProfile = {
  enabled: boolean;
  scale: number;
  minText: number;
  maxText: number;
  minHitWidth: number;
  minHitHeight: number;
  strokeThickness: number;
  shadowBlur: number;
  highContrast: boolean;
  scaffold: boolean;
  label: string;
};

const BASE_TEXT_SIZE = new WeakMap<Phaser.GameObjects.Text, number>();
const BOOSTED_INPUTS = new WeakSet<Phaser.GameObjects.GameObject>();
const SCAFFOLDED_SCENES = new WeakSet<Phaser.Scene>();
const WIRED_SCENES = new WeakSet<Phaser.Scene>();
let cachedProfile: ReadabilityProfile | undefined;

function query(): URLSearchParams {
  return new URLSearchParams(
    typeof window !== "undefined" ? window.location.search : "",
  );
}

function readStorage(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function hasDocumentClass(name: string): boolean {
  if (typeof document === "undefined") return false;
  return document.documentElement.classList.contains(name);
}

function prefersHighContrast(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(window.matchMedia?.("(prefers-contrast: more)").matches);
}

function isTinyViewport(): boolean {
  if (typeof window === "undefined") return false;
  const width = window.visualViewport?.width ?? window.innerWidth;
  const height = window.visualViewport?.height ?? window.innerHeight;
  return Math.min(width, height) <= 390 || Math.max(width, height) <= 760;
}

function forceLargeUi(): boolean {
  const qs = query();
  const saved = readStorage("ksReadableUi");
  return (
    qs.has("largeui") ||
    qs.has("hugeui") ||
    qs.has("clarityui") ||
    qs.has("readableui") ||
    saved === "large" ||
    saved === "huge"
  );
}

function forceHighContrast(): boolean {
  const qs = query();
  const saved = readStorage("ksContrastUi");
  return (
    qs.has("contrastui") ||
    qs.has("highcontrast") ||
    qs.has("fallbackui") ||
    saved === "1" ||
    prefersHighContrast() ||
    hasDocumentClass("ks-runtime-lockdown") ||
    hasDocumentClass("ks-engine-lockdown")
  );
}

function applyRootClass(profile: ReadabilityProfile): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.toggle("ks-readable-ui", profile.enabled);
  root.classList.toggle("ks-readable-ui-large", profile.scale >= 1.28);
  root.classList.toggle("ks-readable-ui-huge", profile.scale >= 1.42);
  root.classList.toggle("ks-readable-ui-contrast", profile.highContrast);
  root.style.setProperty("--ks-readable-ui-scale", profile.scale.toFixed(2));
  root.style.setProperty("--ks-readable-min-hit", `${profile.minHitHeight}px`);
}

export function getMobileReadabilityProfile(): ReadabilityProfile {
  if (cachedProfile) return cachedProfile;
  const qs = query();
  const disabled =
    qs.has("tinyui") ||
    qs.has("compactui") ||
    qs.has("legacyreadability") ||
    qs.has("toydebug");
  const mobile = isMobileRuntime();
  const locked = hasDocumentClass("ks-runtime-lockdown") || hasDocumentClass("ks-engine-lockdown");
  const large = forceLargeUi();
  const highContrast = forceHighContrast();
  const tinyViewport = isTinyViewport();
  const base = Math.max(1, mobileUiScale());
  const manualHuge = qs.has("hugeui") || readStorage("ksReadableUi") === "huge";
  const mobileBoost = mobile ? 1.2 : 1.08;
  const viewportBoost = tinyViewport ? 1.08 : 1;
  const manualBoost = manualHuge ? 1.2 : large ? 1.12 : 1;
  const lockBoost = locked ? 1.1 : 1;
  const scale = disabled
    ? 1
    : Math.max(1.12, Math.min(1.54, base * mobileBoost * viewportBoost * manualBoost * lockBoost));
  cachedProfile = {
    enabled: !disabled,
    scale,
    minText: disabled ? 12 : manualHuge ? 18 : highContrast || locked ? 17 : mobile ? 16 : 15,
    maxText: disabled ? 34 : manualHuge ? 42 : large ? 38 : 36,
    minHitWidth: disabled ? 44 : manualHuge ? 74 : highContrast || locked ? 68 : mobile ? 62 : 56,
    minHitHeight: disabled ? 40 : manualHuge ? 64 : highContrast || locked ? 60 : mobile ? 56 : 50,
    strokeThickness: disabled ? 0 : highContrast || locked ? 5 : 4,
    shadowBlur: disabled ? 0 : highContrast || locked ? 5 : 4,
    highContrast,
    scaffold: !disabled && !qs.has("noscaffold") && !qs.has("plainui"),
    label: disabled ? "legacy" : highContrast ? "high-contrast" : large ? "large" : "mobile-readable",
  };
  applyRootClass(cachedProfile);
  return cachedProfile;
}

export function refreshMobileReadabilityProfile(): ReadabilityProfile {
  cachedProfile = undefined;
  return getMobileReadabilityProfile();
}


export function toggleReadableFallbackMode(): "normal" | "large" | "huge" {
  if (typeof window === "undefined") return "normal";
  let next: "normal" | "large" | "huge" = "large";
  try {
    const current = window.localStorage.getItem("ksReadableUi");
    next = current === "large" ? "huge" : current === "huge" ? "normal" : "large";
    if (next === "normal") window.localStorage.removeItem("ksReadableUi");
    else window.localStorage.setItem("ksReadableUi", next);
  } catch {
    // Storage may be blocked in restrictive webviews; query flags still work.
  }
  refreshMobileReadabilityProfile();
  window.dispatchEvent(new CustomEvent("kingdom-seed:readability-refresh", { detail: { mode: next, at: Date.now() } }));
  return next;
}

export function toggleHighContrastUi(): boolean {
  if (typeof window === "undefined") return false;
  let enabled = true;
  try {
    enabled = window.localStorage.getItem("ksContrastUi") !== "1";
    if (enabled) window.localStorage.setItem("ksContrastUi", "1");
    else window.localStorage.removeItem("ksContrastUi");
  } catch {
    // ignore storage failures
  }
  refreshMobileReadabilityProfile();
  window.dispatchEvent(new CustomEvent("kingdom-seed:readability-refresh", { detail: { contrast: enabled, at: Date.now() } }));
  return enabled;
}

export function useMobileReadableUi(): boolean {
  return getMobileReadabilityProfile().enabled;
}

export function readableUiScale(): number {
  const profile = getMobileReadabilityProfile();
  return profile.enabled ? profile.scale : 1;
}

export function readableFontSize(size: number, min = 15, max = 34): string {
  const profile = getMobileReadabilityProfile();
  if (!profile.enabled) return `${Math.round(size)}px`;
  const floor = Math.max(min, profile.minText);
  const ceiling = Math.max(floor, Math.min(max, profile.maxText));
  return `${Math.min(ceiling, Math.max(floor, Math.round(size * profile.scale)))}px`;
}

export function readableTextStyle(
  base: Phaser.Types.GameObjects.Text.TextStyle,
  options: { fontSize?: number; min?: number; max?: number; stroke?: string; strokeThickness?: number } = {},
): Phaser.Types.GameObjects.Text.TextStyle {
  const profile = getMobileReadabilityProfile();
  if (!profile.enabled) return base;
  return {
    fontFamily: MOBILE_READABLE_FONT,
    shadow: { offsetX: 0, offsetY: 2, color: "#000000", blur: profile.shadowBlur, fill: true },
    ...base,
    fontSize: readableFontSize(options.fontSize ?? parseStyleFontSize(base.fontSize, 15), options.min ?? profile.minText, options.max ?? profile.maxText),
    stroke: options.stroke ?? String(base.stroke ?? "#020611"),
    strokeThickness: Math.max(options.strokeThickness ?? profile.strokeThickness, Number(base.strokeThickness ?? 0)),
  };
}

export function readableHitSize(width: number, height: number): { width: number; height: number } {
  const profile = getMobileReadabilityProfile();
  if (!profile.enabled) return { width, height };
  const boost = Math.min(1.38, Math.max(1.14, profile.scale));
  return {
    width: Math.max(width, Math.round(width * boost), profile.minHitWidth),
    height: Math.max(height, Math.round(height * Math.min(1.34, boost)), profile.minHitHeight),
  };
}

export function improveReadableText(
  text: Phaser.GameObjects.Text,
  options: { min?: number; max?: number; stroke?: string; strokeThickness?: number; shadowBlur?: number } = {},
): Phaser.GameObjects.Text {
  const profile = getMobileReadabilityProfile();
  if (!profile.enabled) return text;
  const base = BASE_TEXT_SIZE.get(text) ?? readTextFontSize(text);
  BASE_TEXT_SIZE.set(text, base);
  const min = Math.max(options.min ?? profile.minText, profile.minText);
  const max = Math.max(min, options.max ?? profile.maxText);
  const next = Math.min(max, Math.max(min, Math.round(base * Math.min(1.24, profile.scale))));
  text.setFontFamily(MOBILE_READABLE_FONT);
  text.setFontSize(`${next}px`);
  text.setStroke(options.stroke ?? "#020611", options.strokeThickness ?? profile.strokeThickness);
  text.setShadow(0, 2, "#000000", options.shadowBlur ?? profile.shadowBlur, true, true);
  maybeSetResolution(text, isMobileRuntime() ? 2 : 1.5);
  // Long in-game notices often blend into busy art. In contrast mode, only add
  // a light backing to long labels so button captions and map markers stay clean.
  if (profile.highContrast && text.text.length >= 12) {
    const style = text.style as unknown as { backgroundColor?: string };
    if (!style.backgroundColor) {
      text.setStyle({ backgroundColor: "#020711d9", padding: { x: 6, y: 3 } });
    }
  }
  return text;
}

export function improveReadableTextTree(
  root: Phaser.Scene | Phaser.GameObjects.Container,
  options: { min?: number; max?: number; stroke?: string; strokeThickness?: number; shadowBlur?: number } = {},
): void {
  const profile = getMobileReadabilityProfile();
  if (!profile.enabled) return;
  const list = isScene(root) ? root.children.list : root.list;
  list.forEach((item) => visit(item, options));
}

export function installSceneReadabilityPass(
  scene: Phaser.Scene,
  options: { min?: number; max?: number; stroke?: string; strokeThickness?: number; shadowBlur?: number; delayMs?: number } = {},
): void {
  applyAdaptiveFallbackRootClasses();
  installAdaptiveFallbackDirector(scene);
  installAdaptiveRescueOrchestrator(scene);
  const profile = getMobileReadabilityProfile();
  if (!profile.enabled) return;
  installSceneLegibilityScaffold(scene);
  wireSceneReadabilityRefresh(scene, options);
  const run = (): void => {
    if (!scene.scene.isActive(scene.scene.key)) return;
    applyRootClass(getMobileReadabilityProfile());
    improveReadableTextTree(scene, options);
  };
  const delays = Array.from(new Set([options.delayMs ?? 0, 120, 360, 760])).filter((d) => d >= 0);
  delays.forEach((delay) => {
    if (delay > 0) scene.time.delayedCall(delay, run);
    else run();
  });
}

function wireSceneReadabilityRefresh(
  scene: Phaser.Scene,
  options: { min?: number; max?: number; stroke?: string; strokeThickness?: number; shadowBlur?: number },
): void {
  if (WIRED_SCENES.has(scene) || typeof window === "undefined") return;
  WIRED_SCENES.add(scene);
  const refresh = (): void => {
    refreshMobileReadabilityProfile();
    if (scene.scene.isActive(scene.scene.key)) improveReadableTextTree(scene, options);
  };
  window.addEventListener("kingdom-seed:readability-refresh", refresh);
  window.addEventListener("kingdom-seed:viewport-changed", refresh);
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
    window.removeEventListener("kingdom-seed:readability-refresh", refresh);
    window.removeEventListener("kingdom-seed:viewport-changed", refresh);
  });
  scene.events.once(Phaser.Scenes.Events.DESTROY, () => {
    window.removeEventListener("kingdom-seed:readability-refresh", refresh);
    window.removeEventListener("kingdom-seed:viewport-changed", refresh);
  });
}

function installSceneLegibilityScaffold(scene: Phaser.Scene): void {
  const profile = getMobileReadabilityProfile();
  if (!profile.scaffold || SCAFFOLDED_SCENES.has(scene)) return;
  SCAFFOLDED_SCENES.add(scene);
  const key = scene.scene.key;
  const alpha = profile.highContrast ? 0.28 : 0.18;
  const edge = profile.highContrast ? 0.38 : 0.22;
  const g = scene.add.graphics().setName("ks-mobile-legibility-scaffold");

  if (key === "GameScene") {
    g.setDepth(69.45);
    g.fillStyle(0x020611, alpha).fillRect(0, 0, 960, 132);
    g.fillStyle(0x020611, Math.min(0.42, alpha + 0.08)).fillRect(0, 424, 960, 116);
    g.fillGradientStyle(0x020611, 0x020611, 0x020611, 0x020611, edge, 0, 0, edge);
    g.fillRect(0, 70, 960, 360);
    g.lineStyle(1, 0xffdf9a, profile.highContrast ? 0.24 : 0.13);
    g.strokeRoundedRect(10, 7, 940, 526, 18);
    return;
  }

  if (key === "MenuScene") {
    g.setDepth(19.15);
    g.fillStyle(0x020611, profile.highContrast ? 0.52 : 0.34).fillRoundedRect(282, 230, 396, 258, 26);
    g.fillStyle(0x020611, 0.22).fillRect(0, 0, 960, 78);
    g.fillStyle(0x020611, 0.2).fillRect(0, 462, 960, 78);
    g.lineStyle(1, 0xffdf9a, 0.22).strokeRoundedRect(292, 240, 376, 238, 24);
    return;
  }

  if (key === "MainMenuScene") {
    g.setDepth(6.25);
    g.fillStyle(0x020611, profile.highContrast ? 0.34 : 0.22).fillRect(0, 0, 960, 96);
    g.fillStyle(0x020611, profile.highContrast ? 0.42 : 0.28).fillRoundedRect(112, 450, 736, 82, 28);
    g.lineStyle(1, 0xffdf9a, 0.18).strokeRoundedRect(120, 456, 720, 68, 24);
    return;
  }

  if (key === "WorldMapScene") {
    g.setDepth(20.15);
    g.fillStyle(0x020611, profile.highContrast ? 0.38 : 0.26).fillRoundedRect(690, 88, 258, 392, 26);
    g.fillStyle(0x020611, profile.highContrast ? 0.3 : 0.18).fillRect(0, 0, 960, 76);
    g.fillStyle(0x020611, profile.highContrast ? 0.32 : 0.2).fillRect(0, 472, 960, 68);
    g.lineStyle(1, 0xffdf9a, 0.18).strokeRoundedRect(698, 98, 238, 368, 22);
    return;
  }

  g.setDepth(4.85);
  g.fillStyle(0x020611, profile.highContrast ? 0.3 : 0.18).fillRect(0, 0, 960, 82);
  g.fillStyle(0x020611, profile.highContrast ? 0.32 : 0.2).fillRect(0, 462, 960, 78);
  g.lineStyle(1, 0xffdf9a, profile.highContrast ? 0.2 : 0.12).strokeRoundedRect(14, 10, 932, 520, 18);
}

function visit(
  item: Phaser.GameObjects.GameObject,
  options: { min?: number; max?: number; stroke?: string; strokeThickness?: number; shadowBlur?: number },
): void {
  if (item instanceof Phaser.GameObjects.Text) improveReadableText(item, options);
  improveInteractiveTarget(item);
  const maybeContainer = item as unknown as { list?: Phaser.GameObjects.GameObject[] };
  if (Array.isArray(maybeContainer.list)) maybeContainer.list.forEach((child) => visit(child, options));
}

function improveInteractiveTarget(item: Phaser.GameObjects.GameObject): void {
  const profile = getMobileReadabilityProfile();
  if (!profile.enabled || BOOSTED_INPUTS.has(item)) return;
  const candidate = item as Phaser.GameObjects.GameObject & {
    input?: { hitArea?: unknown };
    width?: number;
    height?: number;
    displayWidth?: number;
    displayHeight?: number;
    setSize?: (width: number, height: number) => unknown;
  };
  if (!candidate.input) return;
  BOOSTED_INPUTS.add(item);
  const currentWidth = Number(candidate.displayWidth ?? candidate.width ?? 0);
  const currentHeight = Number(candidate.displayHeight ?? candidate.height ?? 0);
  if (!Number.isFinite(currentWidth) || !Number.isFinite(currentHeight) || currentWidth <= 0 || currentHeight <= 0) return;
  const next = readableHitSize(currentWidth, currentHeight);
  const hit = candidate.input.hitArea as { width?: number; height?: number; x?: number; y?: number } | undefined;
  if (hit && typeof hit.width === "number" && typeof hit.height === "number") {
    hit.width = Math.max(hit.width, next.width);
    hit.height = Math.max(hit.height, next.height);
  }
  if (item instanceof Phaser.GameObjects.Zone) {
    item.setSize(next.width, next.height);
  }
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
