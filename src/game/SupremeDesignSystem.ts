import Phaser from "phaser";
import { isMobileRuntime, mobileUiScale, preferReducedMotion } from "./PerformanceMode";
import { lowPowerMode } from "./QualityManager";

export const SUPREME_DESIGN_FONT =
  "Pretendard, Noto Sans KR, NanumGothic, Arial, sans-serif";

export type SupremeDesignGrade = "essential" | "balanced" | "supreme" | "accessible";

export type SupremeDesignProfile = {
  enabled: boolean;
  grade: SupremeDesignGrade;
  safe: boolean;
  highContrast: boolean;
  mobile: boolean;
  density: number;
  alpha: number;
  motion: boolean;
  label: string;
};

type SceneDesignState = {
  root: Phaser.GameObjects.Container;
  graphics: Phaser.GameObjects.Graphics;
  badge?: Phaser.GameObjects.Text;
  profile: SupremeDesignProfile;
};

const SCENE_STATES = new WeakMap<Phaser.Scene, SceneDesignState>();
const WIRED_SCENES = new WeakSet<Phaser.Scene>();
let cachedProfile: SupremeDesignProfile | undefined;

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
    // Storage can be blocked in mobile webviews; query flags and classes still work.
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

function prefersHighContrast(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(window.matchMedia?.("(prefers-contrast: more)").matches);
}

function normalizeGrade(value: string | null | undefined): SupremeDesignGrade | undefined {
  if (value === "essential" || value === "balanced" || value === "supreme" || value === "accessible") return value;
  return undefined;
}

function savedGrade(): SupremeDesignGrade | undefined {
  return normalizeGrade(readStorage("ksSupremeDesign"));
}

function designDisabled(): boolean {
  const qs = query();
  return (
    qs.has("nodesignsystem") ||
    qs.has("nosupremedesign") ||
    qs.has("legacydesign") ||
    qs.has("plainui") ||
    qs.has("toydebug")
  );
}

function forcedGrade(): SupremeDesignGrade | undefined {
  const qs = query();
  if (qs.has("essentialdesign") || qs.has("safedesign")) return "essential";
  if (qs.has("accessibledesign") || qs.has("readabledesign") || qs.has("contrastdesign")) return "accessible";
  if (qs.has("supremedesign") || qs.has("prestigedesign") || qs.has("premiumdesign")) return "supreme";
  if (qs.has("balanceddesign")) return "balanced";
  return undefined;
}

function networkSafeHint(): boolean {
  if (typeof navigator === "undefined") return false;
  const nav = navigator as Navigator & {
    connection?: { saveData?: boolean; effectiveType?: string };
    onLine?: boolean;
  };
  const type = nav.connection?.effectiveType ?? "";
  return nav.onLine === false || Boolean(nav.connection?.saveData) || type === "slow-2g" || type === "2g";
}

function tinyViewport(): boolean {
  if (typeof window === "undefined") return false;
  const width = window.visualViewport?.width ?? window.innerWidth;
  const height = window.visualViewport?.height ?? window.innerHeight;
  return Math.min(width, height) <= 390 || Math.max(width, height) <= 740;
}

function rootSafe(): boolean {
  return (
    lowPowerMode() ||
    networkSafeHint() ||
    hasClass("ks-runtime-lockdown") ||
    hasClass("ks-engine-lockdown") ||
    hasClass("ks-auto-rescue-safe") ||
    hasClass("ks-auto-rescue-emergency") ||
    hasClass("ks-adaptive-emergency") ||
    readStorage("ksEmergencyFallback") === "1" ||
    readStorage("ksSafeGfx") === "1"
  );
}

export function refreshSupremeDesignProfile(): SupremeDesignProfile {
  cachedProfile = undefined;
  return getSupremeDesignProfile();
}

export function getSupremeDesignProfile(): SupremeDesignProfile {
  if (cachedProfile) return cachedProfile;
  const qs = query();
  const disabled = designDisabled();
  const safe = rootSafe();
  const highContrast =
    qs.has("contrastdesign") ||
    qs.has("highcontrast") ||
    qs.has("contrastui") ||
    prefersHighContrast() ||
    hasClass("ks-readable-ui-contrast") ||
    hasClass("ks-adaptive-contrast") ||
    readStorage("ksContrastUi") === "1";
  const mobile = isMobileRuntime();
  const grade = forcedGrade() ?? savedGrade() ?? (safe ? "essential" : highContrast || tinyViewport() ? "accessible" : "supreme");
  const densityBase = grade === "essential" ? 0.68 : grade === "accessible" ? 0.9 : grade === "balanced" ? 0.84 : 1;
  const density = Math.max(0.58, Math.min(1.12, densityBase * Math.min(1.08, mobileUiScale())));
  const motion = !safe && !preferReducedMotion() && grade !== "essential" && !qs.has("reducemotion") && readStorage("ksReduceMotion") !== "1";
  cachedProfile = {
    enabled: !disabled,
    grade,
    safe,
    highContrast,
    mobile,
    density,
    alpha: highContrast ? 1.12 : safe ? 0.82 : 1,
    motion,
    label: disabled ? "legacy" : `${grade}${safe ? ":safe" : ""}${highContrast ? ":contrast" : ""}`,
  };
  applySupremeDesignRootClasses(cachedProfile);
  return cachedProfile;
}

export function applySupremeDesignRootClasses(profile = getSupremeDesignProfile()): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.toggle("ks-supreme-design", profile.enabled);
  root.classList.toggle("ks-supreme-design-essential", profile.enabled && profile.grade === "essential");
  root.classList.toggle("ks-supreme-design-balanced", profile.enabled && profile.grade === "balanced");
  root.classList.toggle("ks-supreme-design-rich", profile.enabled && profile.grade === "supreme");
  root.classList.toggle("ks-supreme-design-accessible", profile.enabled && profile.grade === "accessible");
  root.classList.toggle("ks-supreme-design-safe", profile.enabled && profile.safe);
  root.classList.toggle("ks-supreme-design-contrast", profile.enabled && profile.highContrast);
  root.style.setProperty("--ks-supreme-design-alpha", profile.alpha.toFixed(2));
  root.style.setProperty("--ks-supreme-design-density", profile.density.toFixed(2));
}

export function toggleSupremeDesignGrade(): SupremeDesignGrade {
  const current = savedGrade();
  const next: SupremeDesignGrade = current === "supreme" ? "accessible" : current === "accessible" ? "essential" : current === "essential" ? "balanced" : "supreme";
  if (next === "balanced") removeStorage("ksSupremeDesign");
  else writeStorage("ksSupremeDesign", next);
  refreshSupremeDesignProfile();
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("kingdom-seed:design-refresh", { detail: { grade: next, at: Date.now() } }));
  }
  return next;
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

function sceneDepth(key: string): number {
  if (key === "GameScene") return 67.55;
  if (key === "WorldMapScene") return 19.05;
  if (key === "MenuScene") return 18.35;
  if (key === "MainMenuScene") return 5.75;
  return 4.45;
}

function sceneAccent(key: string, profile: SupremeDesignProfile): number {
  if (profile.highContrast) return 0xffe391;
  if (key === "GameScene") return 0xffd36f;
  if (key === "WorldMapScene") return 0x93d7ff;
  if (key === "MenuScene") return 0xffdf8f;
  if (key === "MainMenuScene") return 0xb9e8ff;
  return 0xd7c2ff;
}

function drawCornerBrackets(g: Phaser.GameObjects.Graphics, x: number, y: number, w: number, h: number, color: number, alpha: number): void {
  const len = Math.min(58, Math.max(24, w * 0.08));
  g.lineStyle(2, color, alpha);
  g.beginPath();
  g.moveTo(x, y + len);
  g.lineTo(x, y);
  g.lineTo(x + len, y);
  g.moveTo(x + w - len, y);
  g.lineTo(x + w, y);
  g.lineTo(x + w, y + len);
  g.moveTo(x, y + h - len);
  g.lineTo(x, y + h);
  g.lineTo(x + len, y + h);
  g.moveTo(x + w - len, y + h);
  g.lineTo(x + w, y + h);
  g.lineTo(x + w, y + h - len);
  g.strokePath();
}

function drawGlassPanel(
  g: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  w: number,
  h: number,
  accent: number,
  profile: SupremeDesignProfile,
): void {
  const a = profile.alpha;
  const deep = mix(accent, 0x020611, 0.78);
  g.fillStyle(0x000000, 0.22 * a).fillRoundedRect(x + 4, y + 7, w, h, 22);
  g.fillStyle(0x06101d, (profile.highContrast ? 0.72 : 0.46) * a).fillRoundedRect(x, y, w, h, 22);
  g.fillStyle(deep, (profile.safe ? 0.18 : 0.28) * a).fillRoundedRect(x + 8, y + 8, w - 16, h - 16, 18);
  g.fillStyle(0xffffff, (profile.safe ? 0.025 : 0.045) * a).fillRoundedRect(x + 14, y + 12, w - 28, Math.min(22, h * 0.22), 10);
  g.lineStyle(1, accent, (profile.highContrast ? 0.42 : 0.23) * a).strokeRoundedRect(x, y, w, h, 22);
  g.lineStyle(1, 0x9fdcff, (profile.safe ? 0.04 : 0.11) * a).strokeRoundedRect(x + 8, y + 8, w - 16, h - 16, 18);
}

function drawGlobalDesignFrame(g: Phaser.GameObjects.Graphics, key: string, profile: SupremeDesignProfile): void {
  const accent = sceneAccent(key, profile);
  const a = profile.alpha;
  const topAlpha = (profile.highContrast ? 0.32 : 0.2) * a;
  const bottomAlpha = (profile.highContrast ? 0.34 : 0.22) * a;
  g.clear();
  g.fillGradientStyle(0x020611, 0x020611, 0x020611, 0x020611, topAlpha, topAlpha, 0, 0);
  g.fillRect(0, 0, 960, 104);
  g.fillGradientStyle(0x020611, 0x020611, 0x020611, 0x020611, 0, 0, bottomAlpha, bottomAlpha);
  g.fillRect(0, 416, 960, 124);
  g.fillStyle(0x020611, (profile.highContrast ? 0.18 : 0.09) * a).fillRect(0, 0, 28, 540);
  g.fillStyle(0x020611, (profile.highContrast ? 0.18 : 0.09) * a).fillRect(932, 0, 28, 540);
  g.lineStyle(1, accent, (profile.highContrast ? 0.34 : 0.18) * a).strokeRoundedRect(12, 10, 936, 520, 22);
  g.lineStyle(1, 0x9fdcff, (profile.safe ? 0.04 : 0.09) * a).strokeRoundedRect(25, 22, 910, 494, 18);
  drawCornerBrackets(g, 20, 18, 920, 504, accent, (profile.highContrast ? 0.42 : 0.28) * a);
}

function drawBattleDesign(g: Phaser.GameObjects.Graphics, profile: SupremeDesignProfile): void {
  const accent = sceneAccent("GameScene", profile);
  drawGlobalDesignFrame(g, "GameScene", profile);
  const a = profile.alpha;
  g.fillStyle(0x020611, (profile.highContrast ? 0.24 : 0.13) * a).fillRoundedRect(12, 66, 936, 360, 18);
  g.lineStyle(1, accent, (profile.highContrast ? 0.24 : 0.13) * a).strokeRoundedRect(18, 72, 924, 348, 16);
  g.fillStyle(0xffe4a0, (profile.safe ? 0.04 : 0.075) * a).fillRoundedRect(36, 78, 888, 2, 1);
  g.fillStyle(0x9fdcff, (profile.safe ? 0.035 : 0.06) * a).fillRoundedRect(36, 410, 888, 2, 1);
}

function drawLoginDesign(g: Phaser.GameObjects.Graphics, profile: SupremeDesignProfile): void {
  const accent = sceneAccent("MenuScene", profile);
  drawGlobalDesignFrame(g, "MenuScene", profile);
  drawGlassPanel(g, 272, 218, 416, 282, accent, profile);
  g.fillStyle(accent, 0.08 * profile.alpha).fillRoundedRect(312, 286, 336, 3, 2);
  g.fillStyle(0x9fdcff, profile.safe ? 0.04 : 0.07).fillRoundedRect(326, 456, 308, 2, 1);
}

function drawLobbyDesign(g: Phaser.GameObjects.Graphics, profile: SupremeDesignProfile): void {
  const accent = sceneAccent("MainMenuScene", profile);
  drawGlobalDesignFrame(g, "MainMenuScene", profile);
  drawGlassPanel(g, 106, 442, 748, 90, accent, profile);
  drawGlassPanel(g, 28, 100, 126, 386, 0xffdb8a, profile);
  drawGlassPanel(g, 806, 100, 126, 326, 0x9fdcff, profile);
  g.fillStyle(0xffffff, profile.safe ? 0.02 : 0.035).fillRoundedRect(182, 94, 596, 52, 18);
}

function drawWorldDesign(g: Phaser.GameObjects.Graphics, profile: SupremeDesignProfile): void {
  const accent = sceneAccent("WorldMapScene", profile);
  drawGlobalDesignFrame(g, "WorldMapScene", profile);
  drawGlassPanel(g, 684, 82, 270, 408, accent, profile);
  g.lineStyle(1, 0x9fdcff, profile.safe ? 0.04 : 0.08);
  for (let x = 72; x <= 600; x += 88) {
    g.beginPath();
    g.moveTo(x, 112);
    g.lineTo(x + 52, 420);
    g.strokePath();
  }
  g.fillStyle(0xffdf9a, profile.safe ? 0.035 : 0.06).fillRoundedRect(54, 90, 560, 3, 2);
  g.fillStyle(0x9fdcff, profile.safe ? 0.03 : 0.05).fillRoundedRect(88, 448, 512, 2, 1);
}

function drawSubSceneDesign(g: Phaser.GameObjects.Graphics, key: string, profile: SupremeDesignProfile): void {
  const accent = sceneAccent(key, profile);
  drawGlobalDesignFrame(g, key, profile);
  drawGlassPanel(g, 24, 84, 912, 374, accent, profile);
  g.fillStyle(0x020611, (profile.highContrast ? 0.34 : 0.22) * profile.alpha).fillRoundedRect(24, 20, 912, 56, 20);
  g.fillStyle(accent, (profile.safe ? 0.05 : 0.08) * profile.alpha).fillRoundedRect(56, 70, 848, 2, 1);
  g.fillStyle(0x9fdcff, (profile.safe ? 0.04 : 0.06) * profile.alpha).fillRoundedRect(58, 466, 844, 2, 1);
}

function sceneTitle(key: string): string {
  if (key === "GameScene") return "BATTLE CLARITY";
  if (key === "MenuScene") return "KINGDOM SEED";
  if (key === "MainMenuScene") return "COMMAND HUB";
  if (key === "WorldMapScene") return "OPERATION MAP";
  if (key === "LabScene") return "RESEARCH DECK";
  if (key === "ArtifactForgeScene") return "ARTIFACT FORGE";
  if (key === "CodexScene") return "FIELD CODEX";
  if (key === "HeroHallScene") return "HERO HALL";
  if (key === "MissionBoardScene") return "MISSION BOARD";
  if (key === "MetaScene") return "META HQ";
  return "PRESTIGE UI";
}

function drawBadge(scene: Phaser.Scene, state: SceneDesignState, key: string): void {
  const qs = query();
  const shouldShow = qs.has("designpanel") || qs.has("supremedebug") || state.profile.grade === "accessible" || state.profile.highContrast;
  if (!shouldShow) {
    state.badge?.setVisible(false);
    return;
  }
  if (!state.badge) {
    const isBattle = key === "GameScene";
    state.badge = scene.add
      .text(isBattle ? 860 : 826, isBattle ? 104 : 58, "", {
        fontFamily: SUPREME_DESIGN_FONT,
        fontSize: "10px",
        fontStyle: "1000",
        color: "#fff0b8",
        stroke: "#020611",
        strokeThickness: 3,
        backgroundColor: "#07101ddd",
        padding: { x: 7, y: 3 },
      })
      .setOrigin(0.5)
      .setDepth(sceneDepth(key) + 3.4);
    state.root.add(state.badge);
  }
  state.badge.setVisible(true);
  state.badge.setText(state.profile.grade === "accessible" ? "ACCESSIBLE" : state.profile.safe ? "SAFE DESIGN" : "SUPREME");
}

function redrawSceneDesign(scene: Phaser.Scene, state: SceneDesignState): void {
  const key = scene.scene.key;
  state.profile = getSupremeDesignProfile();
  if (!state.profile.enabled) {
    state.root.setVisible(false);
    return;
  }
  state.root.setVisible(true);
  const g = state.graphics;
  if (key === "GameScene") drawBattleDesign(g, state.profile);
  else if (key === "MenuScene") drawLoginDesign(g, state.profile);
  else if (key === "MainMenuScene") drawLobbyDesign(g, state.profile);
  else if (key === "WorldMapScene") drawWorldDesign(g, state.profile);
  else drawSubSceneDesign(g, key, state.profile);
  drawBadge(scene, state, key);
}

export function installSupremeDesignSystemScene(scene: Phaser.Scene): void {
  const profile = getSupremeDesignProfile();
  applySupremeDesignRootClasses(profile);
  if (!profile.enabled) return;
  const existing = SCENE_STATES.get(scene);
  if (existing?.root.active && existing.graphics.active) {
    redrawSceneDesign(scene, existing);
    return;
  }

  const key = scene.scene.key;
  const root = scene.add.container(0, 0).setName("ks-supreme-design-system").setDepth(sceneDepth(key));
  const graphics = scene.add.graphics();
  root.add(graphics);
  const state: SceneDesignState = { root, graphics, profile };
  SCENE_STATES.set(scene, state);
  redrawSceneDesign(scene, state);

  if (profile.motion) {
    const accent = sceneAccent(key, profile);
    const sweep = scene.add
      .rectangle(108, key === "GameScene" ? 80 : 66, 128, 2, accent, 0.18)
      .setDepth(sceneDepth(key) + 0.15)
      .setBlendMode(Phaser.BlendModes.ADD);
    root.add(sweep);
    scene.tweens.add({
      targets: sweep,
      x: 852,
      alpha: 0.04,
      duration: key === "GameScene" ? 3600 : 4300,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  }

  if (!WIRED_SCENES.has(scene) && typeof window !== "undefined") {
    WIRED_SCENES.add(scene);
    const refresh = (): void => {
      refreshSupremeDesignProfile();
      const current = SCENE_STATES.get(scene);
      if (current && scene.scene.isActive(scene.scene.key)) redrawSceneDesign(scene, current);
    };
    window.addEventListener("kingdom-seed:design-refresh", refresh);
    window.addEventListener("kingdom-seed:readability-refresh", refresh);
    window.addEventListener("kingdom-seed:auto-rescue", refresh);
    window.addEventListener("kingdom-seed:quality-changed", refresh);
    const cleanup = (): void => {
      window.removeEventListener("kingdom-seed:design-refresh", refresh);
      window.removeEventListener("kingdom-seed:readability-refresh", refresh);
      window.removeEventListener("kingdom-seed:auto-rescue", refresh);
      window.removeEventListener("kingdom-seed:quality-changed", refresh);
    };
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, cleanup);
    scene.events.once(Phaser.Scenes.Events.DESTROY, cleanup);
  }
}
