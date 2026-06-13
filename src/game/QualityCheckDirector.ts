import Phaser from "phaser";
import { auditMobileSceneUi, type MobileUiAuditReport } from "./MobileUiAudit";
import { getDefenseUiFocusProfile } from "./DefenseUiFocusSystem";

export type QualityCheckGrade = "pass" | "watch" | "risk";

export type QualityCheckItem = {
  label: string;
  status: QualityCheckGrade;
  detail: string;
};

export type QualityCheckCategory = {
  name: "design" | "system" | "feature";
  grade: QualityCheckGrade;
  items: QualityCheckItem[];
};

export type QualityCheckReport = {
  scene: string;
  grade: QualityCheckGrade;
  design: QualityCheckCategory;
  system: QualityCheckCategory;
  feature: QualityCheckCategory;
  summary: string;
  at: number;
};

type BackGuardStatus = {
  mobile: boolean;
  activated: boolean;
  sceneReady: boolean;
  guardArmed: boolean;
  allowExit: boolean;
  currentScene: string;
  isHome: boolean;
  exitModalVisible: boolean;
  lastGuardAt: number;
  lastBackCommandAt: number;
};

declare global {
  interface Window {
    __KINGDOM_SEED_LAST_QUALITY_CHECK__?: QualityCheckReport;
  }
}

const WIRED_SCENES = new WeakSet<Phaser.Scene>();
const PANELS = new WeakMap<Phaser.Scene, Phaser.GameObjects.Container>();
const LAST_REPORT = new WeakMap<Phaser.Scene, QualityCheckReport>();
const PANEL_WIDTH = 284;
const PANEL_HEIGHT = 210;

function query(): URLSearchParams {
  return new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
}

function enabled(): boolean {
  const qs = query();
  return !qs.has("noqualitycheck") && !qs.has("legacyqualitycheck") && !qs.has("toydebug");
}

function panelRequested(): boolean {
  const qs = query();
  return (
    qs.has("qualitycheck") ||
    qs.has("designcheck") ||
    qs.has("systemcheck") ||
    qs.has("featurecheck") ||
    qs.has("checkpanel") ||
    qs.has("qapanel") ||
    qs.has("qahealth") ||
    qs.has("navqa")
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

function storageWritable(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const key = "ksQualityCheckProbe";
    window.localStorage.setItem(key, "1");
    window.localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

function gradeRank(grade: QualityCheckGrade): number {
  return grade === "risk" ? 2 : grade === "watch" ? 1 : 0;
}

function worstGrade(items: QualityCheckItem[]): QualityCheckGrade {
  const max = items.reduce((rank, item) => Math.max(rank, gradeRank(item.status)), 0);
  return max >= 2 ? "risk" : max === 1 ? "watch" : "pass";
}

function overallGrade(categories: QualityCheckCategory[]): QualityCheckGrade {
  const max = categories.reduce((rank, category) => Math.max(rank, gradeRank(category.grade)), 0);
  return max >= 2 ? "risk" : max === 1 ? "watch" : "pass";
}

function item(label: string, status: QualityCheckGrade, detail: string): QualityCheckItem {
  return { label, status, detail };
}

function hasClass(name: string): boolean {
  return Boolean(typeof document !== "undefined" && document.documentElement.classList.contains(name));
}

function viewportSummary(): { status: QualityCheckGrade; detail: string } {
  if (typeof window === "undefined") return { status: "watch", detail: "window unavailable" };
  const width = Math.round(window.visualViewport?.width ?? window.innerWidth);
  const height = Math.round(window.visualViewport?.height ?? window.innerHeight);
  const shortSide = Math.min(width, height);
  if (shortSide < 340) return { status: "risk", detail: `${width}x${height} too narrow` };
  if (shortSide < 390) return { status: "watch", detail: `${width}x${height} compact` };
  return { status: "pass", detail: `${width}x${height}` };
}

function textureAny(scene: Phaser.Scene, keys: string[]): boolean {
  return keys.some((key) => scene.textures.exists(key));
}

function evaluateDesign(scene: Phaser.Scene, ui: MobileUiAuditReport): QualityCheckCategory {
  const focus = getDefenseUiFocusProfile();
  const densityOk = focus.mode === "focus" || focus.mode === "clean" || focus.mode === "essential";
  const rootReadable = hasClass("ks-readable-ui") || hasClass("ks-shell-readable");
  const rootContrast = hasClass("ks-readable-ui-contrast") || hasClass("ks-shell-contrast-ui");
  const items: QualityCheckItem[] = [
    item(
      "text floor",
      ui.smallTextCount === 0 ? "pass" : ui.smallTextCount <= 3 ? "watch" : "risk",
      `${ui.smallTextCount}/${ui.textCount} small`,
    ),
    item(
      "touch floor",
      ui.smallHitCount === 0 ? "pass" : ui.smallHitCount <= 3 ? "watch" : "risk",
      `${ui.smallHitCount}/${ui.inputCount} small`,
    ),
    item(
      "text overlap",
      ui.overlappedTextCount === 0 ? "pass" : ui.overlappedTextCount <= 2 ? "watch" : "risk",
      `${ui.overlappedTextCount} overlaps`,
    ),
    item("ui density", densityOk ? "pass" : "watch", `${focus.mode} mode`),
    item("readability root", rootReadable ? "pass" : "watch", rootReadable ? "active" : "not marked"),
    item("contrast fallback", rootContrast ? "pass" : "watch", rootContrast ? "ready" : "optional"),
  ];
  return { name: "design", grade: worstGrade(items), items };
}

function evaluateSystem(scene: Phaser.Scene): QualityCheckCategory {
  const viewport = viewportSummary();
  const backStatus = typeof window !== "undefined" ? window.__KINGDOM_SEED_BACK_GUARD_STATUS__?.() : undefined;
  const mobile = Boolean(backStatus?.mobile ?? hasClass("is-mobile-webview"));
  const guardStatus: QualityCheckGrade = !mobile ? "pass" : backStatus?.guardArmed ? "pass" : "watch";
  const memory = typeof navigator !== "undefined" ? (navigator as Navigator & { deviceMemory?: number }).deviceMemory : undefined;
  const cores = typeof navigator !== "undefined" ? navigator.hardwareConcurrency : undefined;
  const weakDevice = (typeof memory === "number" && memory <= 2) || (typeof cores === "number" && cores <= 4);
  const connection = typeof navigator !== "undefined" ? (navigator as Navigator & { connection?: { effectiveType?: string; saveData?: boolean } }).connection : undefined;
  const networkLabel = connection?.saveData ? "save-data" : connection?.effectiveType ?? "unknown";
  const networkRisk = connection?.saveData || connection?.effectiveType === "slow-2g" || connection?.effectiveType === "2g";
  const items: QualityCheckItem[] = [
    item("viewport", viewport.status, viewport.detail),
    item("back guard", guardStatus, mobile ? `armed=${Boolean(backStatus?.guardArmed)}` : "desktop/pass"),
    item("scene bridge", typeof window !== "undefined" && window.__KINGDOM_SEED_BACK_NAVIGATOR__ ? "pass" : "watch", backStatus?.currentScene ?? scene.scene.key),
    item("storage", storageWritable() ? "pass" : "risk", storageWritable() ? "local save writable" : "blocked"),
    item("network", networkRisk ? "watch" : "pass", networkLabel),
    item("device tier", weakDevice ? "watch" : "pass", `mem=${memory ?? "?"} cores=${cores ?? "?"}`),
    item("safe fallback", hasClass("ks-adaptive-emergency") || hasClass("ks-engine-lockdown") ? "watch" : "pass", hasClass("ks-adaptive-emergency") ? "emergency" : "normal"),
  ];
  return { name: "system", grade: worstGrade(items), items };
}

function evaluateFeature(scene: Phaser.Scene): QualityCheckCategory {
  const hasReferenceThumb = textureAny(scene, [
    "ks23620-thumb-tower-archer",
    "ks23620-thumb-enemy-goblin",
    "ks23620-thumb-hero-warrior",
    "ks23620-thumb-skill-fireball",
  ]);
  const hasReferenceFull = textureAny(scene, [
    "ks23619-tower-archer",
    "ks23619-enemy-goblin",
    "ks23619-hero-warrior",
    "ks23619-skill-fireball",
  ]);
  const hasReward = textureAny(scene, [
    "ks23624-reward-dust",
    "ks23624-reward-token",
    "ks23624-reward-chest-wood",
  ]);
  const actionFlowAllowed = !query().has("noactionflow") && !query().has("legacyactionflow");
  const items: QualityCheckItem[] = [
    item("reference thumbs", hasReferenceThumb ? "pass" : "watch", hasReferenceThumb ? "loaded" : "idle/fallback"),
    item("reference actors", hasReferenceFull ? "pass" : "watch", hasReferenceFull ? "loaded" : "deferred/fallback"),
    item("reward art", hasReward ? "pass" : "watch", hasReward ? "loaded" : "deferred/fallback"),
    item("action flow", actionFlowAllowed ? "pass" : "watch", actionFlowAllowed ? "enabled" : "legacy"),
    item("quality toggles", readStorage("ksDefenseUiFocus") || readStorage("ksReadableUi") || readStorage("ksSupremeDesignMode") ? "pass" : "watch", "defaults or saved"),
  ];
  return { name: "feature", grade: worstGrade(items), items };
}

function makeReport(scene: Phaser.Scene): QualityCheckReport {
  const ui = auditMobileSceneUi(scene);
  const design = evaluateDesign(scene, ui);
  const system = evaluateSystem(scene);
  const feature = evaluateFeature(scene);
  const grade = overallGrade([design, system, feature]);
  const report: QualityCheckReport = {
    scene: scene.scene.key,
    grade,
    design,
    system,
    feature,
    summary: `${scene.scene.key} ${grade.toUpperCase()} · D:${design.grade} S:${system.grade} F:${feature.grade}`,
    at: Date.now(),
  };
  LAST_REPORT.set(scene, report);
  if (typeof window !== "undefined") {
    window.__KINGDOM_SEED_LAST_QUALITY_CHECK__ = report;
    window.dispatchEvent(new CustomEvent("kingdom-seed:quality-check", { detail: report }));
  }
  return report;
}

function gradeColor(grade: QualityCheckGrade): number {
  if (grade === "pass") return 0x3bdc93;
  if (grade === "watch") return 0xffc861;
  return 0xff6b78;
}

function gradeText(grade: QualityCheckGrade): string {
  return grade === "pass" ? "PASS" : grade === "watch" ? "WATCH" : "RISK";
}

function compactLine(category: QualityCheckCategory): string {
  const risky = category.items.filter((entry) => entry.status !== "pass").slice(0, 2);
  if (risky.length === 0) return `${category.name.toUpperCase()} OK`;
  return risky.map((entry) => `${entry.label}: ${entry.detail}`).join(" · ");
}

function renderPanel(scene: Phaser.Scene, report: QualityCheckReport): void {
  if (!panelRequested()) return;
  const previous = PANELS.get(scene);
  previous?.destroy(true);
  const width = scene.scale?.width ?? 960;
  const height = scene.scale?.height ?? 540;
  const x = Math.max(150, Math.min(width - PANEL_WIDTH / 2 - 10, PANEL_WIDTH / 2 + 12));
  const y = Math.max(126, Math.min(height - PANEL_HEIGHT / 2 - 12, 126));
  const root = scene.add.container(x, y).setDepth(999.9).setScrollFactor(0).setName("ks-quality-check-panel");
  const bg = scene.add.graphics().setName("ks-quality-check-bg");
  bg.fillStyle(0x020712, 0.92).fillRoundedRect(-PANEL_WIDTH / 2, -102, PANEL_WIDTH, PANEL_HEIGHT, 18);
  bg.lineStyle(2, gradeColor(report.grade), 0.94).strokeRoundedRect(-PANEL_WIDTH / 2, -102, PANEL_WIDTH, PANEL_HEIGHT, 18);
  bg.lineStyle(1, 0xffffff, 0.14).strokeRoundedRect(-PANEL_WIDTH / 2 + 6, -96, PANEL_WIDTH - 12, PANEL_HEIGHT - 12, 14);
  const title = scene.add
    .text(-PANEL_WIDTH / 2 + 14, -88, `QA CHECK · ${gradeText(report.grade)}`, {
      fontFamily: "Pretendard, Noto Sans KR, Arial, sans-serif",
      fontSize: "14px",
      fontStyle: "900",
      color: "#f7fbff",
      stroke: "#020611",
      strokeThickness: 3,
    })
    .setOrigin(0, 0.5);
  const sceneLabel = scene.add
    .text(PANEL_WIDTH / 2 - 14, -88, report.scene.replace("Scene", ""), {
      fontFamily: "Pretendard, Noto Sans KR, Arial, sans-serif",
      fontSize: "11px",
      fontStyle: "900",
      color: "#bcd7ff",
      stroke: "#020611",
      strokeThickness: 3,
    })
    .setOrigin(1, 0.5);
  const rows: Phaser.GameObjects.GameObject[] = [];
  [report.design, report.system, report.feature].forEach((category, index) => {
    const yy = -55 + index * 50;
    const chip = scene.add.graphics().setName(`ks-quality-${category.name}-chip`);
    chip.fillStyle(gradeColor(category.grade), 0.18).fillRoundedRect(-PANEL_WIDTH / 2 + 14, yy - 16, 78, 30, 12);
    chip.lineStyle(1, gradeColor(category.grade), 0.62).strokeRoundedRect(-PANEL_WIDTH / 2 + 14, yy - 16, 78, 30, 12);
    const label = scene.add
      .text(-PANEL_WIDTH / 2 + 53, yy - 1, category.name.toUpperCase(), {
        fontFamily: "Pretendard, Noto Sans KR, Arial, sans-serif",
        fontSize: "10px",
        fontStyle: "900",
        color: "#ffffff",
        stroke: "#020611",
        strokeThickness: 3,
      })
      .setOrigin(0.5);
    const grade = scene.add
      .text(-PANEL_WIDTH / 2 + 104, yy - 1, gradeText(category.grade), {
        fontFamily: "Pretendard, Noto Sans KR, Arial, sans-serif",
        fontSize: "11px",
        fontStyle: "900",
        color: category.grade === "pass" ? "#b8ffe2" : category.grade === "watch" ? "#ffe8a8" : "#ffd0d5",
        stroke: "#020611",
        strokeThickness: 3,
      })
      .setOrigin(0, 0.5);
    const detail = scene.add
      .text(-PANEL_WIDTH / 2 + 14, yy + 18, compactLine(category), {
        fontFamily: "Pretendard, Noto Sans KR, Arial, sans-serif",
        fontSize: "10px",
        fontStyle: "800",
        color: "#cfe2ff",
        stroke: "#020611",
        strokeThickness: 3,
        wordWrap: { width: PANEL_WIDTH - 32 },
      })
      .setOrigin(0, 0.5);
    rows.push(chip, label, grade, detail);
  });
  const hint = scene.add
    .text(0, 94, "design / system / feature · tap to refresh", {
      fontFamily: "Pretendard, Noto Sans KR, Arial, sans-serif",
      fontSize: "10px",
      fontStyle: "900",
      color: "#93abc7",
      stroke: "#020611",
      strokeThickness: 3,
    })
    .setOrigin(0.5);
  root.add([bg, title, sceneLabel, ...rows, hint]);
  root.setInteractive(new Phaser.Geom.Rectangle(-PANEL_WIDTH / 2, -102, PANEL_WIDTH, PANEL_HEIGHT), Phaser.Geom.Rectangle.Contains);
  root.on("pointerdown", () => {
    const next = makeReport(scene);
    renderPanel(scene, next);
  });
  PANELS.set(scene, root);
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => root.destroy(true));
}

export function runQualityCheck(scene: Phaser.Scene): QualityCheckReport {
  const report = makeReport(scene);
  renderPanel(scene, report);
  return report;
}

export function installQualityCheckDirector(scene: Phaser.Scene): void {
  if (!enabled() || WIRED_SCENES.has(scene) || typeof window === "undefined") return;
  WIRED_SCENES.add(scene);
  const run = (): void => {
    if (!scene.scene.isActive(scene.scene.key)) return;
    runQualityCheck(scene);
  };
  [420, 1200, 2600].forEach((delay) => scene.time.delayedCall(delay, run));
  const refresh = (): void => {
    scene.time.delayedCall(120, run);
  };
  const windowEvents = [
    "kingdom-seed:readability-refresh",
    "kingdom-seed:ui-focus-refresh",
    "kingdom-seed:viewport-changed",
    "kingdom-seed:back-home-complete",
  ];
  const sceneEvents = [
    "kingdom-seed:reference-asset-pack-ready",
    "kingdom-seed:reference-evolution-ready",
    "kingdom-seed:reference-reward-ready",
  ];
  windowEvents.forEach((eventName) => window.addEventListener(eventName, refresh));
  sceneEvents.forEach((eventName) => scene.events.on(eventName, refresh));
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
    windowEvents.forEach((eventName) => window.removeEventListener(eventName, refresh));
    sceneEvents.forEach((eventName) => scene.events.off(eventName, refresh));
  });
}
