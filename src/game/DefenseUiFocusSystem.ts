import Phaser from "phaser";
import { isMobileRuntime, preferReducedMotion } from "./PerformanceMode";

export type DefenseUiFocusMode = "clean" | "focus" | "essential" | "legacy";

export type DefenseUiFocusProfile = {
  enabled: boolean;
  mode: DefenseUiFocusMode;
  compactBattleIntel: boolean;
  decorativeAlpha: number;
  scaffoldAlpha: number;
  label: string;
};

type BattleSecondaryState = {
  scene: Phaser.Scene;
  objects: Phaser.GameObjects.GameObject[];
  root: Phaser.GameObjects.Container;
  label: Phaser.GameObjects.Text;
  expanded: boolean;
  hideTimer?: Phaser.Time.TimerEvent;
};

const WIRED_SCENES = new WeakSet<Phaser.Scene>();
const INSTALLED_SCENES = new WeakSet<Phaser.Scene>();
const BATTLE_STATES = new WeakMap<Phaser.Scene, BattleSecondaryState>();
const FOCUS_STORAGE_KEY = "ksDefenseUiFocus";
let cachedProfile: DefenseUiFocusProfile | undefined;

function query(): URLSearchParams {
  return new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
}

function readStorage(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Storage may be unavailable in restrictive webviews. Query flags still work.
  }
}

function removeStorage(key: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

function hasClass(name: string): boolean {
  if (typeof document === "undefined") return false;
  return document.documentElement.classList.contains(name);
}

function normalizeMode(value: string | null | undefined): DefenseUiFocusMode | undefined {
  if (value === "clean" || value === "focus" || value === "essential" || value === "legacy") return value;
  return undefined;
}

function forcedMode(): DefenseUiFocusMode | undefined {
  const qs = query();
  if (qs.has("legacyclutter") || qs.has("maximalui") || qs.has("fullhud") || qs.has("oldhud")) return "legacy";
  if (qs.has("essentialui") || qs.has("simpleui") || qs.has("lowclutter") || qs.has("minimalui")) return "essential";
  if (qs.has("focusui") || qs.has("battlefocus") || qs.has("onehandui")) return "focus";
  if (qs.has("cleanui") || qs.has("defenseui") || qs.has("uireset") || qs.has("declutterui")) return "clean";
  return undefined;
}

function disabledByQuery(): boolean {
  const qs = query();
  return qs.has("nouifocus") || qs.has("nodeclutter") || qs.has("legacyclutter") || qs.has("toydebug");
}

function tinyViewport(): boolean {
  if (typeof window === "undefined") return false;
  const width = window.visualViewport?.width ?? window.innerWidth;
  const height = window.visualViewport?.height ?? window.innerHeight;
  return Math.min(width, height) <= 390 || Math.max(width, height) <= 740;
}

function applyRootClasses(profile: DefenseUiFocusProfile): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.toggle("ks-defense-ui-focus", profile.enabled);
  root.classList.toggle("ks-defense-ui-clean", profile.enabled && profile.mode === "clean");
  root.classList.toggle("ks-defense-ui-focus-mode", profile.enabled && profile.mode === "focus");
  root.classList.toggle("ks-defense-ui-essential", profile.enabled && profile.mode === "essential");
  root.classList.toggle("ks-defense-ui-legacy", !profile.enabled || profile.mode === "legacy");
  root.style.setProperty("--ks-defense-ui-decor-alpha", profile.decorativeAlpha.toFixed(2));
}

export function getDefenseUiFocusProfile(): DefenseUiFocusProfile {
  if (cachedProfile) return cachedProfile;
  const forced = forcedMode();
  const saved = normalizeMode(readStorage(FOCUS_STORAGE_KEY));
  const emergency = hasClass("ks-adaptive-emergency") || hasClass("ks-engine-lockdown") || hasClass("ks-runtime-lockdown");
  const safe = emergency || hasClass("ks-adaptive-safe-gfx") || hasClass("ks-readable-ui-contrast");
  const disabled = disabledByQuery() || forced === "legacy" || saved === "legacy";
  const mode: DefenseUiFocusMode = disabled
    ? "legacy"
    : forced ?? saved ?? (safe ? "essential" : tinyViewport() || isMobileRuntime() ? "clean" : "clean");
  const enabled = mode !== "legacy";
  const profile: DefenseUiFocusProfile = {
    enabled,
    mode,
    compactBattleIntel: enabled,
    decorativeAlpha: mode === "essential" ? 0.42 : mode === "focus" ? 0.58 : enabled ? 0.7 : 1,
    scaffoldAlpha: mode === "essential" ? 0.62 : mode === "focus" ? 0.74 : enabled ? 0.84 : 1,
    label: enabled ? `ui-${mode}` : "legacy-ui",
  };
  cachedProfile = profile;
  applyRootClasses(profile);
  return profile;
}

export function refreshDefenseUiFocusProfile(): DefenseUiFocusProfile {
  cachedProfile = undefined;
  return getDefenseUiFocusProfile();
}

export function toggleDefenseUiFocusMode(): DefenseUiFocusMode {
  const current = normalizeMode(readStorage(FOCUS_STORAGE_KEY)) ?? getDefenseUiFocusProfile().mode;
  const next: DefenseUiFocusMode =
    current === "clean" ? "focus" : current === "focus" ? "essential" : current === "essential" ? "legacy" : "clean";
  if (next === "clean") removeStorage(FOCUS_STORAGE_KEY);
  else writeStorage(FOCUS_STORAGE_KEY, next);
  const profile = refreshDefenseUiFocusProfile();
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("kingdom-seed:ui-focus-refresh", { detail: { mode: profile.mode, at: Date.now() } }));
    window.dispatchEvent(new CustomEvent("kingdom-seed:readability-refresh", { detail: { reason: "ui-focus", mode: profile.mode, at: Date.now() } }));
  }
  return profile.mode;
}

export function useDefenseUiFocus(): boolean {
  return getDefenseUiFocusProfile().enabled;
}

export function installDefenseUiFocusScene(scene: Phaser.Scene): void {
  const profile = getDefenseUiFocusProfile();
  applyRootClasses(profile);
  if (!profile.enabled) return;
  if (!INSTALLED_SCENES.has(scene)) {
    INSTALLED_SCENES.add(scene);
    installSceneFocusMat(scene, profile);
  }
  wireRefresh(scene);
  const run = (): void => {
    if (!scene.scene.isActive(scene.scene.key)) return;
    applyRootClasses(getDefenseUiFocusProfile());
    applyDecorativeBudget(scene);
  };
  [0, 180, 520, 980].forEach((delay) => {
    if (delay === 0) run();
    else scene.time.delayedCall(delay, run);
  });
}

export function installBattleSecondaryUiFocus(
  scene: Phaser.Scene,
  objects: Phaser.GameObjects.GameObject[],
  options: { x?: number; y?: number; label?: string; summary?: () => string } = {},
): void {
  const profile = getDefenseUiFocusProfile();
  if (!profile.compactBattleIntel || BATTLE_STATES.has(scene)) return;
  const liveObjects = objects.filter((item) => item.active);
  if (liveObjects.length === 0) return;

  liveObjects.forEach((item) => item.setName(item.name || "ks-battle-secondary-ui"));
  const root = scene.add.container(options.x ?? 612, options.y ?? 74).setName("ks-battle-intel-toggle").setDepth(95.4);
  const bg = scene.add.graphics();
  drawPill(bg, -42, -18, 84, 36, profile.mode === "essential" ? 0x111824 : 0x07101e, 0x9bd7ff, 0.86);
  const label = scene.add
    .text(0, 0, options.label ?? "정보", {
      fontFamily: "Pretendard, Noto Sans KR, NanumGothic, Arial, sans-serif",
      fontSize: profile.mode === "essential" ? "15px" : "14px",
      fontStyle: "900",
      color: "#fff4c2",
      stroke: "#020611",
      strokeThickness: 3,
      align: "center",
    })
    .setOrigin(0.5);
  const hit = scene.add.zone(0, 0, 92, 46).setInteractive({ useHandCursor: true });
  root.add([bg, label, hit]);

  const state: BattleSecondaryState = {
    scene,
    objects: liveObjects,
    root,
    label,
    expanded: false,
  };
  BATTLE_STATES.set(scene, state);
  applyBattleSecondaryState(state, false);

  hit.on("pointerdown", () => {
    applyBattleSecondaryState(state, !state.expanded);
    if (state.expanded && options.summary) {
      const text = options.summary();
      if (text) scene.events.emit("kingdom-seed:ui-focus-summary", text);
    }
  });

  if (!preferReducedMotion()) {
    scene.tweens.add({ targets: root, alpha: 0.78, duration: 1200, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
  }

  const cleanup = (): void => {
    state.hideTimer?.remove(false);
    BATTLE_STATES.delete(scene);
  };
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, cleanup);
  scene.events.once(Phaser.Scenes.Events.DESTROY, cleanup);
}

export function markSecondaryUi<T extends Phaser.GameObjects.GameObject>(item: T, bucket?: Phaser.GameObjects.GameObject[]): T {
  item.setName(item.name || "ks-secondary-ui");
  bucket?.push(item);
  return item;
}

function applyBattleSecondaryState(state: BattleSecondaryState, expanded: boolean): void {
  const profile = getDefenseUiFocusProfile();
  state.expanded = expanded;
  state.hideTimer?.remove(false);
  state.hideTimer = undefined;
  const alpha = expanded ? 1 : profile.mode === "essential" ? 0 : 0.08;
  const visible = expanded || profile.mode !== "essential";
  state.objects.forEach((item) => {
    if (!item.active) return;
    setGameObjectVisible(item, visible || expanded);
    setGameObjectAlpha(item, alpha);
  });
  state.label.setText(expanded ? "정보 닫기" : "정보");
  state.root.setAlpha(expanded ? 1 : 0.88);
  if (expanded) {
    state.hideTimer = state.scene.time.delayedCall(5200, () => applyBattleSecondaryState(state, false));
  }
}

function applyDecorativeBudget(scene: Phaser.Scene): void {
  const profile = getDefenseUiFocusProfile();
  if (!profile.enabled) return;
  scene.children.list.forEach((item) => {
    const named = String(item.name ?? "");
    if (named === "ks-supreme-design-system") setGameObjectAlpha(item, profile.decorativeAlpha);
    else if (named === "ks-mobile-legibility-scaffold") setGameObjectAlpha(item, profile.scaffoldAlpha);
    else if (named.startsWith("ks-graphic-") && profile.mode === "essential") setGameObjectAlpha(item, Math.min(getGameObjectAlpha(item), 0.72));
  });
}

function installSceneFocusMat(scene: Phaser.Scene, profile: DefenseUiFocusProfile): void {
  const key = scene.scene.key;
  const g = scene.add.graphics().setName("ks-defense-ui-focus-mat").setDepth(focusDepth(key));
  if (key === "GameScene") {
    g.fillStyle(0x020611, profile.mode === "essential" ? 0.22 : 0.13).fillRect(0, 0, 960, 70);
    g.fillStyle(0x020611, profile.mode === "essential" ? 0.26 : 0.16).fillRect(0, 432, 960, 108);
    g.lineStyle(1, 0xffdf9a, 0.13).strokeRoundedRect(12, 10, 936, 518, 20);
    return;
  }
  if (key === "MainMenuScene") {
    g.fillStyle(0x020611, 0.14).fillRoundedRect(112, 460, 736, 64, 24);
    g.fillGradientStyle(0x020611, 0x020611, 0x020611, 0x020611, 0.16, 0, 0, 0.16).fillRect(0, 84, 960, 364);
    return;
  }
  if (key === "WorldMapScene") {
    g.fillStyle(0x020611, 0.18).fillRoundedRect(686, 84, 266, 402, 24);
    g.fillStyle(0x020611, 0.12).fillRect(0, 464, 960, 76);
    return;
  }
  if (key === "MenuScene") {
    g.fillStyle(0x020611, 0.16).fillRoundedRect(300, 246, 360, 220, 26);
    return;
  }
  g.fillStyle(0x020611, 0.12).fillRect(0, 0, 960, 76);
  g.fillStyle(0x020611, 0.12).fillRect(0, 466, 960, 74);
}

function focusDepth(key: string): number {
  if (key === "GameScene") return 68.65;
  if (key === "MenuScene") return 18.9;
  if (key === "MainMenuScene") return 6.05;
  if (key === "WorldMapScene") return 19.95;
  return 4.65;
}

function drawPill(
  g: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  w: number,
  h: number,
  fill: number,
  stroke: number,
  alpha: number,
): void {
  g.clear();
  g.fillStyle(0x000000, 0.28).fillRoundedRect(x + 2, y + 4, w, h, 16);
  g.fillStyle(fill, alpha).fillRoundedRect(x, y, w, h, 16);
  g.fillStyle(stroke, 0.1).fillRoundedRect(x + 6, y + 5, w - 12, 8, 8);
  g.lineStyle(1, stroke, 0.58).strokeRoundedRect(x, y, w, h, 16);
}

function setGameObjectAlpha(item: Phaser.GameObjects.GameObject, alpha: number): void {
  const target = item as Phaser.GameObjects.GameObject & { setAlpha?: (value: number) => unknown; alpha?: number };
  if (typeof target.setAlpha === "function") target.setAlpha(alpha);
  else target.alpha = alpha;
}

function getGameObjectAlpha(item: Phaser.GameObjects.GameObject): number {
  const target = item as Phaser.GameObjects.GameObject & { alpha?: number };
  return typeof target.alpha === "number" ? target.alpha : 1;
}

function setGameObjectVisible(item: Phaser.GameObjects.GameObject, visible: boolean): void {
  const target = item as Phaser.GameObjects.GameObject & { setVisible?: (value: boolean) => unknown; visible?: boolean };
  if (typeof target.setVisible === "function") target.setVisible(visible);
  else target.visible = visible;
}

function wireRefresh(scene: Phaser.Scene): void {
  if (WIRED_SCENES.has(scene) || typeof window === "undefined") return;
  WIRED_SCENES.add(scene);
  const refresh = (): void => {
    refreshDefenseUiFocusProfile();
    if (!scene.scene.isActive(scene.scene.key)) return;
    applyDecorativeBudget(scene);
    const state = BATTLE_STATES.get(scene);
    if (state) applyBattleSecondaryState(state, state.expanded);
  };
  window.addEventListener("kingdom-seed:ui-focus-refresh", refresh);
  window.addEventListener("kingdom-seed:readability-refresh", refresh);
  window.addEventListener("kingdom-seed:auto-rescue", refresh);
  const cleanup = (): void => {
    window.removeEventListener("kingdom-seed:ui-focus-refresh", refresh);
    window.removeEventListener("kingdom-seed:readability-refresh", refresh);
    window.removeEventListener("kingdom-seed:auto-rescue", refresh);
  };
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, cleanup);
  scene.events.once(Phaser.Scenes.Events.DESTROY, cleanup);
}
