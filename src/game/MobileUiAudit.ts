import Phaser from "phaser";

export type MobileUiAuditReport = {
  scene: string;
  textCount: number;
  smallTextCount: number;
  inputCount: number;
  smallHitCount: number;
  overlappedTextCount: number;
  grade: "good" | "watch" | "risk";
  summary: string;
};

const WIRED_SCENES = new WeakSet<Phaser.Scene>();
const AUDIT_BADGES = new WeakMap<Phaser.Scene, Phaser.GameObjects.Container>();
const LAST_REPORT = new WeakMap<Phaser.Scene, MobileUiAuditReport>();

function query(): URLSearchParams {
  return new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
}

function shouldShowAuditBadge(): boolean {
  const qs = query();
  return qs.has("uiaudit") || qs.has("readabilityaudit") || qs.has("touchaudit") || qs.has("navqa");
}

function auditDisabled(): boolean {
  const qs = query();
  return qs.has("nouiaudit") || qs.has("legacyuiaudit") || qs.has("toydebug");
}

function parseFontSize(text: Phaser.GameObjects.Text): number {
  const style = text.style as unknown as { fontSize?: string | number };
  const value = style.fontSize;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value.replace("px", ""));
    if (Number.isFinite(parsed)) return parsed;
  }
  return 14;
}

function rectFor(item: Phaser.GameObjects.GameObject): Phaser.Geom.Rectangle | undefined {
  const candidate = item as Phaser.GameObjects.GameObject & {
    getBounds?: () => Phaser.Geom.Rectangle;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    displayWidth?: number;
    displayHeight?: number;
  };
  try {
    const bounds = candidate.getBounds?.();
    if (bounds && Number.isFinite(bounds.width) && Number.isFinite(bounds.height)) return bounds;
  } catch {
    // Some destroyed objects can throw while computing bounds.
  }
  const width = Number(candidate.displayWidth ?? candidate.width ?? 0);
  const height = Number(candidate.displayHeight ?? candidate.height ?? 0);
  const x = Number(candidate.x ?? 0) - width / 2;
  const y = Number(candidate.y ?? 0) - height / 2;
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) return undefined;
  return new Phaser.Geom.Rectangle(x, y, width, height);
}


function isEffectivelyVisible(item: Phaser.GameObjects.GameObject): boolean {
  const candidate = item as Phaser.GameObjects.GameObject & {
    visible?: boolean;
    alpha?: number;
    parentContainer?: Phaser.GameObjects.Container | null;
  };
  if (!candidate.active) return false;
  let current: (Phaser.GameObjects.GameObject & { visible?: boolean; alpha?: number; parentContainer?: Phaser.GameObjects.Container | null }) | null | undefined = candidate;
  for (let guard = 0; current && guard < 10; guard += 1) {
    if (current.visible === false) return false;
    if (typeof current.alpha === "number" && current.alpha <= 0.05) return false;
    current = current.parentContainer as typeof current;
  }
  return true;
}

function collect(root: Phaser.Scene | Phaser.GameObjects.Container): Phaser.GameObjects.GameObject[] {
  const list = "children" in root ? root.children.list : root.list;
  const out: Phaser.GameObjects.GameObject[] = [];
  const visit = (item: Phaser.GameObjects.GameObject): void => {
    if (!item.active) return;
    out.push(item);
    const maybeContainer = item as unknown as { list?: Phaser.GameObjects.GameObject[] };
    if (Array.isArray(maybeContainer.list)) maybeContainer.list.forEach(visit);
  };
  list.forEach(visit);
  return out;
}

function countOverlappedText(texts: Phaser.GameObjects.Text[]): number {
  const rects = texts
    .filter((text) => isEffectivelyVisible(text) && !text.name.includes("ks-ui-audit"))
    .map((text) => rectFor(text))
    .filter((rect): rect is Phaser.Geom.Rectangle => Boolean(rect));
  let overlaps = 0;
  for (let i = 0; i < rects.length; i += 1) {
    for (let j = i + 1; j < rects.length; j += 1) {
      const a = rects[i];
      const b = rects[j];
      if (!Phaser.Geom.Rectangle.Overlaps(a, b)) continue;
      const ix = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
      const iy = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
      const area = ix * iy;
      if (area > Math.min(a.width * a.height, b.width * b.height) * 0.18) overlaps += 1;
    }
  }
  return overlaps;
}

function getInputSize(item: Phaser.GameObjects.GameObject): { width: number; height: number } | undefined {
  const candidate = item as Phaser.GameObjects.GameObject & {
    input?: { hitArea?: unknown };
    width?: number;
    height?: number;
    displayWidth?: number;
    displayHeight?: number;
  };
  if (!candidate.input) return undefined;
  const hit = candidate.input.hitArea as { width?: number; height?: number; radius?: number } | undefined;
  if (hit?.radius) return { width: hit.radius * 2, height: hit.radius * 2 };
  const width = Number(hit?.width ?? candidate.displayWidth ?? candidate.width ?? 0);
  const height = Number(hit?.height ?? candidate.displayHeight ?? candidate.height ?? 0);
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) return undefined;
  return { width, height };
}

export function auditMobileSceneUi(scene: Phaser.Scene): MobileUiAuditReport {
  const root = typeof document !== "undefined" ? document.documentElement : undefined;
  const huge = Boolean(root?.classList.contains("ks-readable-ui-huge") || root?.classList.contains("ks-shell-huge-ui"));
  const large = huge || Boolean(root?.classList.contains("ks-readable-ui-large") || root?.classList.contains("ks-shell-large-ui"));
  const contrast = Boolean(root?.classList.contains("ks-readable-ui-contrast") || root?.classList.contains("ks-shell-contrast-ui"));
  const essential = Boolean(root?.classList.contains("ks-defense-ui-essential") || root?.classList.contains("ks-adaptive-emergency"));
  const objects = collect(scene);
  const visibleObjects = objects.filter(isEffectivelyVisible);
  const texts = visibleObjects.filter((item): item is Phaser.GameObjects.Text => item instanceof Phaser.GameObjects.Text);
  const textFloor = huge ? 17 : large || contrast ? 16 : essential ? 14 : 15;
  const smallTextCount = texts.filter((text) => parseFontSize(text) < textFloor).length;
  const inputSizes = visibleObjects.map(getInputSize).filter((item): item is { width: number; height: number } => Boolean(item));
  const hitFloorW = huge ? 62 : large || contrast ? 56 : essential ? 48 : 52;
  const hitFloorH = huge ? 56 : large || contrast ? 50 : essential ? 44 : 46;
  const smallHitCount = inputSizes.filter((size) => size.width < hitFloorW || size.height < hitFloorH).length;
  const overlappedTextCount = countOverlappedText(texts);
  const riskScore = smallTextCount * 2 + smallHitCount + overlappedTextCount * 3;
  const grade: MobileUiAuditReport["grade"] = riskScore <= 3 ? "good" : riskScore <= 10 ? "watch" : "risk";
  const report: MobileUiAuditReport = {
    scene: scene.scene.key,
    textCount: texts.length,
    smallTextCount,
    inputCount: inputSizes.length,
    smallHitCount,
    overlappedTextCount,
    grade,
    summary: `${scene.scene.key} ${grade.toUpperCase()} · text ${smallTextCount}/${texts.length} · touch ${smallHitCount}/${inputSizes.length} · overlap ${overlappedTextCount}`,
  };
  LAST_REPORT.set(scene, report);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("kingdom-seed:ui-audit", { detail: { ...report, at: Date.now() } }));
  }
  return report;
}

function renderAuditBadge(scene: Phaser.Scene, report: MobileUiAuditReport): void {
  if (!shouldShowAuditBadge()) return;
  const old = AUDIT_BADGES.get(scene);
  old?.destroy(true);
  const color = report.grade === "good" ? 0x1d7f52 : report.grade === "watch" ? 0x9a6a13 : 0x8e2234;
  const canvasWidth = scene.scale?.width ?? 960;
  const root = scene.add.container(Math.min(canvasWidth - 110, 840), 20).setName("ks-ui-audit-badge").setDepth(999.8).setScrollFactor(0);
  const bg = scene.add.graphics().setName("ks-ui-audit-bg");
  bg.fillStyle(0x020611, 0.9).fillRoundedRect(-92, -12, 184, 36, 14);
  bg.lineStyle(2, color, 0.92).strokeRoundedRect(-92, -12, 184, 36, 14);
  const label = scene.add
    .text(0, 6, report.summary.replace(scene.scene.key, "UI"), {
      fontFamily: "Pretendard, Noto Sans KR, Arial, sans-serif",
      fontSize: "11px",
      fontStyle: "900",
      color: "#f7fbff",
      stroke: "#020611",
      strokeThickness: 3,
      align: "center",
    })
    .setOrigin(0.5);
  root.add([bg, label]);
  AUDIT_BADGES.set(scene, root);
  root.setAlpha(0.92);
  root.setInteractive(new Phaser.Geom.Rectangle(-92, -12, 184, 36), Phaser.Geom.Rectangle.Contains);
  root.on("pointerdown", () => {
    const latest = LAST_REPORT.get(scene) ?? report;
    label.setText(latest.summary.replace(scene.scene.key, "UI"));
  });
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => root.destroy(true));
}

export function installMobileUiAudit(scene: Phaser.Scene): void {
  if (auditDisabled()) return;
  if (WIRED_SCENES.has(scene)) return;
  WIRED_SCENES.add(scene);
  const run = (): void => {
    if (!scene.scene.isActive(scene.scene.key)) return;
    const report = auditMobileSceneUi(scene);
    renderAuditBadge(scene, report);
  };
  [220, 820, 1600].forEach((delay) => scene.time.delayedCall(delay, run));
  const refresh = (): void => {
    scene.time.delayedCall(120, run);
  };
  window.addEventListener("kingdom-seed:readability-refresh", refresh);
  window.addEventListener("kingdom-seed:ui-focus-refresh", refresh);
  window.addEventListener("kingdom-seed:viewport-changed", refresh);
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
    window.removeEventListener("kingdom-seed:readability-refresh", refresh);
    window.removeEventListener("kingdom-seed:ui-focus-refresh", refresh);
    window.removeEventListener("kingdom-seed:viewport-changed", refresh);
  });
}
