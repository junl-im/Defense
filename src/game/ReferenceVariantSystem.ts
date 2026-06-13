import Phaser from "phaser";
import { getMobileRuntimeCaps } from "./MobileRuntimeEngine";
import { addReferenceProgressionOrnament, progressionTierFromVariantState } from "./ReferenceProgressionFusion";

/**
 * v2.36.21 Reference Variant System
 *
 * The reference pack is intentionally no-text.  This module adds the missing
 * commercial-game layer around those images: rarity frames, lock veils,
 * selected accents, boss/elite treatment, and tiny no-text pips.  It draws with
 * Phaser primitives, so it does not increase boot weight and can fall back to a
 * cheaper essential style on weak devices.
 */
export type ReferenceVariantCategory = "tower" | "enemy" | "hero" | "skill";
export type ReferenceVariantState =
  | "normal"
  | "selected"
  | "locked"
  | "elite"
  | "boss"
  | "upgrade"
  | "spell";

export type ReferenceArtSlotOptions = {
  x: number;
  y: number;
  width: number;
  height: number;
  textureKey?: string;
  category: ReferenceVariantCategory;
  state?: ReferenceVariantState;
  accent?: number;
  selected?: boolean;
  locked?: boolean;
  pips?: number;
  depth?: number;
  name?: string;
  alpha?: number;
  imageScale?: number;
  noMotion?: boolean;
};

const QUERY = new URLSearchParams(
  typeof window !== "undefined" ? window.location.search : "",
);

function readStorage(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function referenceVariantSystemEnabled(): boolean {
  if (
    QUERY.has("norefvariants") ||
    QUERY.has("novariantart") ||
    QUERY.has("legacyrefvariants") ||
    QUERY.has("legacyreferenceart") ||
    QUERY.has("toydebug") ||
    readStorage("ksNoReferenceVariants") === "1"
  ) {
    return false;
  }
  return true;
}

export function referenceVariantEssentialMode(): boolean {
  if (
    QUERY.has("essentialrefart") ||
    QUERY.has("saferefart") ||
    QUERY.has("fallbackrefart") ||
    readStorage("ksEmergencyFallback") === "1" ||
    readStorage("ksSafeGfx") === "1" ||
    readStorage("ksSupremeDesignMode") === "essential"
  ) {
    return true;
  }
  const caps = getMobileRuntimeCaps();
  return caps.runtimeLockdown || caps.saveData || caps.networkClass === "slow";
}

export function isReferenceTextureKey(key: string | undefined): boolean {
  return Boolean(key && /^ks236(?:19|20|21)-/.test(key));
}

function categoryAccent(category: ReferenceVariantCategory): number {
  if (category === "tower") return 0xf7d36b;
  if (category === "enemy") return 0xff6a4d;
  if (category === "hero") return 0x7cc7ff;
  return 0x8cffd2;
}

function stateAccent(state: ReferenceVariantState | undefined, fallback: number): number {
  if (state === "boss") return 0xff4f5f;
  if (state === "elite") return 0xb88cff;
  if (state === "selected") return 0xfff1a6;
  if (state === "locked") return 0x8a96a8;
  if (state === "spell") return 0x7cc7ff;
  return fallback;
}

function drawSlotFrame(
  scene: Phaser.Scene,
  width: number,
  height: number,
  accent: number,
  state: ReferenceVariantState | undefined,
  locked: boolean,
  essential: boolean,
): Phaser.GameObjects.Graphics {
  const g = scene.add.graphics();
  const w = width;
  const h = height;
  const r = Math.max(8, Math.min(18, Math.min(w, h) * 0.16));
  const dark = locked ? 0x070a10 : 0x0a1422;
  const inner = locked ? 0x1a2130 : 0x102641;

  g.fillStyle(0x000000, essential ? 0.2 : 0.32);
  g.fillEllipse(0, h * 0.34, w * 0.88, h * 0.18);
  g.fillStyle(dark, locked ? 0.76 : 0.9);
  g.fillRoundedRect(-w / 2, -h / 2, w, h, r);
  g.lineStyle(essential ? 2 : 3, accent, locked ? 0.36 : 0.68);
  g.strokeRoundedRect(-w / 2 + 1, -h / 2 + 1, w - 2, h - 2, r);
  g.fillStyle(inner, locked ? 0.28 : 0.36);
  g.fillRoundedRect(-w / 2 + 6, -h / 2 + 6, w - 12, h - 12, Math.max(6, r - 4));
  g.lineStyle(1, 0xffffff, locked ? 0.12 : 0.18);
  g.strokeRoundedRect(-w / 2 + 7, -h / 2 + 7, w - 14, h - 14, Math.max(5, r - 5));

  if (!essential && state !== "locked") {
    g.fillStyle(0xffffff, 0.1);
    g.fillTriangle(-w / 2 + 12, -h / 2 + 9, w / 2 - 12, -h / 2 + 9, -w / 2 + 12, h / 2 - 12);
    g.fillStyle(accent, state === "boss" ? 0.22 : 0.12);
    g.fillRoundedRect(-w / 2 + 9, -h / 2 + 9, w - 18, Math.max(8, h * 0.16), Math.max(4, r - 8));
  }

  if (state === "boss" || state === "elite") {
    g.lineStyle(essential ? 2 : 3, state === "boss" ? 0xff352c : 0xcaa8ff, essential ? 0.38 : 0.58);
    g.strokeRoundedRect(-w / 2 - 3, -h / 2 - 3, w + 6, h + 6, r + 3);
  }

  return g;
}

function makeFallbackCrest(
  scene: Phaser.Scene,
  width: number,
  height: number,
  accent: number,
  category: ReferenceVariantCategory,
): Phaser.GameObjects.Graphics {
  const g = scene.add.graphics();
  const s = Math.min(width, height);
  g.fillStyle(accent, 0.28);
  if (category === "tower") {
    g.fillTriangle(0, -s * 0.24, -s * 0.24, s * 0.2, s * 0.24, s * 0.2);
    g.fillStyle(0xffffff, 0.16).fillRect(-s * 0.16, -s * 0.02, s * 0.32, s * 0.28);
  } else if (category === "enemy") {
    g.fillCircle(0, -s * 0.02, s * 0.23);
    g.fillTriangle(-s * 0.18, -s * 0.12, -s * 0.08, -s * 0.34, s * 0.02, -s * 0.12);
    g.fillTriangle(s * 0.18, -s * 0.12, s * 0.08, -s * 0.34, -s * 0.02, -s * 0.12);
  } else if (category === "hero") {
    g.fillCircle(0, -s * 0.16, s * 0.12);
    g.fillStyle(accent, 0.36).fillTriangle(0, -s * 0.06, -s * 0.28, s * 0.24, s * 0.28, s * 0.24);
  } else {
    g.fillCircle(0, 0, s * 0.22);
    g.lineStyle(3, 0xffffff, 0.28).strokeCircle(0, 0, s * 0.3);
  }
  return g;
}

function addNoTextPips(
  scene: Phaser.Scene,
  root: Phaser.GameObjects.Container,
  width: number,
  height: number,
  pips: number,
  accent: number,
): void {
  const count = Phaser.Math.Clamp(Math.round(pips), 0, 5);
  if (count <= 0) return;
  const spacing = 8;
  const start = -((count - 1) * spacing) / 2;
  for (let i = 0; i < count; i += 1) {
    root.add(
      scene.add
        .circle(start + i * spacing, height / 2 - 8, 2.8, accent, 0.92)
        .setStrokeStyle(1, 0x0b1220, 0.72),
    );
  }
}

export function createReferenceArtSlot(
  scene: Phaser.Scene,
  options: ReferenceArtSlotOptions,
): Phaser.GameObjects.Container {
  const root = scene.add.container(options.x, options.y).setAlpha(options.alpha ?? 1);
  if (options.name) root.setName(options.name);
  if (options.depth !== undefined) root.setDepth(options.depth);

  if (!referenceVariantSystemEnabled()) {
    if (options.textureKey && scene.textures.exists(options.textureKey)) {
      const image = scene.add.image(0, 0, options.textureKey);
      const ratio = Math.min(
        options.width / Math.max(1, image.width),
        options.height / Math.max(1, image.height),
      ) * (options.imageScale ?? 0.88);
      image.setScale(ratio);
      root.add(image);
    } else {
      root.add(makeFallbackCrest(scene, options.width, options.height, options.accent ?? categoryAccent(options.category), options.category));
    }
    return root;
  }

  const essential = referenceVariantEssentialMode();
  const locked = options.locked === true || options.state === "locked";
  const accent = stateAccent(options.state, options.accent ?? categoryAccent(options.category));
  const frame = drawSlotFrame(scene, options.width, options.height, accent, options.state, locked, essential);
  root.add(frame);

  if (options.textureKey && scene.textures.exists(options.textureKey)) {
    const image = scene.add.image(0, 0, options.textureKey);
    const maxWidth = options.width * (options.category === "skill" ? 0.66 : 0.76);
    const maxHeight = options.height * (options.category === "skill" ? 0.66 : 0.76);
    const ratio = Math.min(maxWidth / Math.max(1, image.width), maxHeight / Math.max(1, image.height));
    image.setScale(ratio * (options.imageScale ?? 1));
    if (locked) image.setAlpha(0.52).setTint(0x9aa6b8);
    root.add(image);
  } else {
    root.add(makeFallbackCrest(scene, options.width, options.height, accent, options.category));
  }

  if (locked) {
    const veil = scene.add.rectangle(0, 0, options.width - 10, options.height - 10, 0x07101d, 0.4);
    root.add(veil);
    root.add(scene.add.rectangle(0, 0, options.width * 0.28, options.height * 0.2, 0x0d1728, 0.78).setStrokeStyle(2, 0xd7e4ff, 0.28));
  }

  if (options.selected || options.state === "selected") {
    root.add(
      scene.add
        .rectangle(0, 0, options.width + 8, options.height + 8, 0xffffff, 0)
        .setStrokeStyle(3, 0xfff1a6, essential ? 0.56 : 0.82),
    );
  }

  addNoTextPips(scene, root, options.width, options.height, options.pips ?? 0, accent);
  addReferenceProgressionOrnament(scene, root, {
    width: options.width,
    height: options.height,
    category: options.category,
    tier: progressionTierFromVariantState(options.state, options.pips ?? 0, options.selected, locked),
    accent,
    pips: options.pips ?? 0,
    locked,
    selected: options.selected || options.state === "selected",
    essential,
    noMotion: options.noMotion,
  });

  if (!essential && !options.noMotion && (options.selected || options.state === "selected" || options.state === "boss")) {
    scene.tweens.add({
      targets: root,
      scale: 1.025,
      duration: options.state === "boss" ? 780 : 980,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  }

  return root;
}

export function createReferenceActorPedestal(
  scene: Phaser.Scene,
  category: ReferenceVariantCategory,
  width: number,
  height: number,
  accent?: number,
): Phaser.GameObjects.Ellipse {
  const safe = referenceVariantEssentialMode();
  return scene.add
    .ellipse(0, height * 0.36, width, Math.max(10, height * 0.18), accent ?? categoryAccent(category), safe ? 0.08 : 0.14)
    .setStrokeStyle(safe ? 1 : 2, accent ?? categoryAccent(category), safe ? 0.22 : 0.36);
}

export function referencePipsForTowerLevel(level: number): number {
  return Phaser.Math.Clamp(level, 1, 5);
}

export function referenceStateForEnemyThreat(threat?: string): ReferenceVariantState {
  if (threat === "boss") return "boss";
  if (threat === "tank" || threat === "support" || threat === "flying") return "elite";
  return "normal";
}

export function referenceVariantDebugSummary(): string {
  if (!referenceVariantSystemEnabled()) return "REFVAR:off";
  return referenceVariantEssentialMode() ? "REFVAR:essential" : "REFVAR:supreme";
}
