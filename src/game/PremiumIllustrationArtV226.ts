import Phaser from "phaser";
import { addCoverImage } from "./CodeUiKit";
import { isLowDeviceProfile } from "./PerformanceMode";

export const V226_VERSION_LABEL = "v2.26.0 ATELIER PERF ART";

type StageNodeLike = { x: number; y: number; radius?: number };
type BattleTheme = "forest" | "canyon" | "swamp" | "fortress" | string;
type Placement = readonly [
  key: string,
  x: number,
  y: number,
  width: number,
  height: number,
  depth: number,
  alpha?: number,
  tint?: number,
];

const P = {
  gold: 0xffd77a,
  pearl: 0xfff5dd,
  sky: 0x8de5ff,
  rose: 0xff91bd,
  mint: 0x9ce9bf,
  violet: 0xb49cff,
  ink: 0x17366c,
};

function canAnimate(): boolean {
  return !isLowDeviceProfile();
}

function has(scene: Phaser.Scene, key: string): boolean {
  return scene.textures.exists(key);
}

function image(
  scene: Phaser.Scene,
  key: string,
  x: number,
  y: number,
  width: number,
  height: number,
  depth: number,
  alpha = 1,
  tint?: number,
): Phaser.GameObjects.Image | undefined {
  if (!has(scene, key)) return undefined;
  const sprite = scene.add
    .image(x, y, key)
    .setDisplaySize(width, height)
    .setDepth(depth)
    .setAlpha(0);
  if (tint !== undefined) sprite.setTint(tint);
  scene.tweens.add({
    targets: sprite,
    alpha,
    duration: 180,
    ease: "Sine.easeOut",
  });
  return sprite;
}

function images(scene: Phaser.Scene, placements: readonly Placement[]): Phaser.GameObjects.Image[] {
  return placements.flatMap(([key, x, y, width, height, depth, alpha = 1, tint]) => {
    const sprite = image(scene, key, x, y, width, height, depth, alpha, tint);
    return sprite ? [sprite] : [];
  });
}

function breathe(scene: Phaser.Scene, target: Phaser.GameObjects.GameObject, amount = 1.002, delay = 0): void {
  if (!canAnimate()) return;
  scene.tweens.add({
    targets: target,
    scaleX: amount,
    scaleY: amount,
    alpha: "+=0.008",
    duration: 3000,
    delay,
    yoyo: true,
    repeat: -1,
    ease: "Sine.easeInOut",
  });
}

function float(scene: Phaser.Scene, target: Phaser.GameObjects.GameObject, amount = 1.2, delay = 0): void {
  if (!canAnimate()) return;
  scene.tweens.add({
    targets: target,
    y: `-=${amount}`,
    duration: 2600 + delay * 2,
    delay,
    yoyo: true,
    repeat: -1,
    ease: "Sine.easeInOut",
  });
}

function atelierWash(scene: Phaser.Scene, depth: number, tone: "login" | "lobby" | "world" | "battle"): void {
  const top = tone === "battle" ? 0x071936 : tone === "world" ? 0x153b7c : 0x0d2d64;
  const warm = tone === "lobby" ? P.gold : tone === "world" ? P.mint : tone === "battle" ? P.violet : P.rose;
  const g = scene.add.graphics().setDepth(depth);
  g.fillGradientStyle(top, top, warm, P.sky, 0.22, 0.14, 0.055, 0.095);
  g.fillRect(0, 0, 960, 540);
  g.fillStyle(P.pearl, tone === "battle" ? 0.018 : 0.034).fillEllipse(480, 282, 780, 330);
  g.lineStyle(1, 0xffffff, 0.055);
  for (let i = 0; i < 5; i += 1) g.strokeEllipse(480, 282, 260 + i * 96, 100 + i * 46);
}

function brushDust(scene: Phaser.Scene, depth: number, count: number, area: Phaser.Geom.Rectangle): void {
  const safeCount = isLowDeviceProfile() ? Math.ceil(count * 0.35) : count;
  const palette = [P.gold, P.sky, P.rose, P.mint, P.violet, 0xffffff];
  for (let i = 0; i < safeCount; i += 1) {
    const x = area.x + ((i * 113) % area.width);
    const y = area.y + ((i * 71) % area.height);
    const mote = scene.add
      .star(x, y, 5, 1.1, 2.7 + (i % 3), palette[i % palette.length], 0.12)
      .setDepth(depth)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setAlpha(0);
    scene.tweens.add({ targets: mote, alpha: 0.16, duration: 160, delay: i * 8 });
    float(scene, mote, 0.9 + (i % 2), i * 18);
  }
}

function themeTint(theme: BattleTheme): number | undefined {
  if (theme === "canyon") return 0xffc17c;
  if (theme === "swamp") return P.mint;
  if (theme === "fortress") return P.violet;
  return undefined;
}

export function addV226LoginArt(scene: Phaser.Scene): void {
  if (has(scene, "v226-login-atelier-bg")) {
    addCoverImage(scene, "v226-login-atelier-bg", 960, 540, 2).setAlpha(0.82);
  } else atelierWash(scene, 2, "login");

  const rays = image(scene, "v226-login-prismatic-rays", 480, 152, 740, 250, 7, 0.34);
  const card = image(scene, "v226-login-lacquer-card", 480, 352, 492, 318, 23, 0.62);
  const title = image(scene, "v226-login-glass-title-plaque", 480, 168, 356, 128, 36, 0.78);
  const left = image(scene, "v226-login-left-gold-filigree", 185, 452, 136, 136, 39, 0.45);
  const right = image(scene, "v226-login-right-gold-filigree", 775, 452, 136, 136, 39, 0.45);
  const fox = image(scene, "v226-login-mascot-fox-duke", 290, 431, 100, 100, 44, 0.86);
  const deer = image(scene, "v226-login-mascot-deer-mage", 670, 431, 100, 100, 44, 0.82);
  const pieces = images(scene, [
    ["v226-login-start-button-gold", 480, 346, 292, 70, 49, 0.44],
    ["v226-login-cloud-button-pearl", 480, 394, 292, 70, 49, 0.38],
    ["v226-login-small-button-ivory", 413, 439, 144, 48, 49, 0.34],
    ["v226-login-small-button-ivory", 547, 439, 144, 48, 49, 0.34],
    ["v226-login-latency-shield-badge", 338, 347, 44, 44, 62, 0.82],
    ["v226-login-local-save-badge", 620, 394, 44, 44, 62, 0.72],
    ["v226-login-micro-gloss-divider", 480, 486, 224, 32, 50, 0.34],
  ]);

  scene.add
    .text(480, 166, "ATELIER FAST KINGDOM", {
      fontFamily: "Pretendard, Noto Sans KR, NanumSquareRound, Arial, sans-serif",
      fontSize: "12px",
      fontStyle: "bold",
      color: "#244b88",
      stroke: "#ffffff",
      strokeThickness: 3,
      fixedWidth: 250,
      align: "center",
    })
    .setOrigin(0.5)
    .setDepth(38)
    .setAlpha(0.9);

  [rays, card, title, left, right, fox, deer, ...pieces].forEach((sprite, index) => {
    if (!sprite) return;
    if (index < 3) breathe(scene, sprite, 1.0025, index * 70);
    else float(scene, sprite, 0.9 + (index % 2), index * 35);
  });
  brushDust(scene, 8, 16, new Phaser.Geom.Rectangle(120, 86, 720, 130));
}

export function addV226LobbyArt(scene: Phaser.Scene, nickname: string, stars: number): void {
  if (has(scene, "v226-lobby-atelier-bg")) {
    addCoverImage(scene, "v226-lobby-atelier-bg", 960, 540, 2).setAlpha(0.74);
  } else atelierWash(scene, 3, "lobby");

  const banner = image(scene, "v226-lobby-royal-header-banner", 480, 106, 470, 112, 18, 0.64);
  const nav = image(scene, "v226-lobby-velvet-nav-frame", 480, 503, 728, 92, 8, 0.56);
  const profile = image(scene, "v226-lobby-profile-glass-panel", 106, 187, 178, 76, 9, 0.46);
  scene.add
    .text(480, 98, "아틀리에 왕국 작전실", {
      fontFamily: "Pretendard, Noto Sans KR, NanumSquareRound, Arial, sans-serif",
      fontSize: "14px",
      fontStyle: "bold",
      color: "#244b88",
      stroke: "#ffffff",
      strokeThickness: 3,
      fixedWidth: 300,
      align: "center",
    })
    .setOrigin(0.5)
    .setDepth(20);
  scene.add
    .text(480, 123, `${nickname} · 별 ${stars}개 · 프레임 예산 보호`, {
      fontFamily: "Pretendard, Noto Sans KR, Arial, sans-serif",
      fontSize: "8px",
      fontStyle: "bold",
      color: "#5e6f9e",
      stroke: "#ffffff",
      strokeThickness: 2,
      fixedWidth: 320,
      align: "center",
    })
    .setOrigin(0.5)
    .setDepth(20)
    .setAlpha(0.84);

  const sprites = images(scene, [
    ["v226-lobby-resource-star-relic", 500, 35, 88, 48, 14, 0.56],
    ["v226-lobby-resource-coin-relic", 638, 35, 88, 48, 14, 0.50],
    ["v226-lobby-resource-gem-relic", 770, 35, 88, 48, 14, 0.50],
    ["v226-lobby-shop-gilded-stall", 86, 270, 58, 58, 14, 0.48],
    ["v226-lobby-quest-illuminated-book", 858, 135, 58, 58, 14, 0.48],
    ["v226-lobby-mail-crystal-bird", 86, 426, 46, 46, 14, 0.38],
    ["v226-lobby-event-moon-lantern", 86, 478, 46, 46, 14, 0.38],
    ["v226-lobby-npc-raccoon-curator", 250, 358, 74, 74, 19, 0.66],
    ["v226-lobby-npc-rabbit-cartographer", 708, 358, 74, 74, 19, 0.66],
    ["v226-lobby-perf-budget-badge", 906, 84, 34, 34, 15, 0.42],
  ]);
  [banner, nav, profile].forEach((sprite, index) => sprite && breathe(scene, sprite, 1.0025, index * 75));
  sprites.forEach((sprite, index) => float(scene, sprite, 0.8 + (index % 3) * 0.2, index * 32));
  brushDust(scene, 7, 12, new Phaser.Geom.Rectangle(160, 72, 640, 85));
}

export function addV226WorldMapArt(scene: Phaser.Scene, stageNodes: readonly StageNodeLike[]): void {
  if (has(scene, "v226-world-atlas-bg")) {
    addCoverImage(scene, "v226-world-atlas-bg", 960, 540, 2).setAlpha(0.66);
  } else atelierWash(scene, 2, "world");

  const preview = image(scene, "v226-world-preview-oil-frame", 815, 283, 332, 258, 22, 0.52);
  const cloud = image(scene, "v226-world-cloud-chapter-panel", 816, 116, 242, 78, 11, 0.28);
  const compass = image(scene, "v226-world-compass-enamel", 86, 94, 58, 58, 17, 0.36);
  const chapter = image(scene, "v226-world-chapter-badge", 480, 42, 292, 62, 17, 0.34);
  const mist = image(scene, "v226-world-mist-watercolor", 428, 270, 240, 120, 6, 0.18);
  [preview, cloud, compass, chapter, mist].forEach((sprite, index) => sprite && breathe(scene, sprite, 1.0025, index * 55));

  stageNodes.forEach((node, index) => {
    const radius = node.radius ?? 24;
    const tint = [P.gold, P.sky, P.mint, P.rose, P.violet][index % 5];
    const shadow = image(scene, "v226-world-island-soft-shadow", node.x, node.y + 14, radius * 3.05, radius * 1.7, 10, 0.14, tint);
    const ring = image(scene, "v226-world-stage-gem-ring", node.x, node.y, radius * 2.55, radius * 2.55, 18, 0.38, tint);
    if (ring && canAnimate()) {
      scene.tweens.add({
        targets: ring,
        scaleX: 1.045,
        scaleY: 1.045,
        alpha: 0.52,
        duration: 1600 + index * 42,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    }
    shadow?.setTint(tint);
    if (index < stageNodes.length - 1) {
      const next = stageNodes[index + 1];
      const midX = (node.x + next.x) / 2;
      const midY = (node.y + next.y) / 2;
      const angle = Phaser.Math.RadToDeg(Math.atan2(next.y - node.y, next.x - node.x));
      const route = image(scene, "v226-world-route-aurora-thread", midX, midY, 118, 34, 12, 0.28);
      route?.setRotation(Phaser.Math.DegToRad(angle));
    }
    if (index % 4 === 0) image(scene, "v226-world-node-crown-micro", node.x, node.y - radius - 13, 26, 26, 20, 0.36);
    if (index % 5 === 3) image(scene, "v226-world-reward-crystal-bloom", node.x + radius + 9, node.y + radius - 3, 26, 26, 20, 0.36);
    if (index % 6 === 5) image(scene, "v226-world-lock-velvet-seal", node.x - radius - 8, node.y + radius - 2, 24, 24, 20, 0.30);
  });
  image(scene, "v226-world-boss-aurora-gate", 704, 450, 86, 82, 19, 0.46);
  brushDust(scene, 7, 10, new Phaser.Geom.Rectangle(90, 74, 610, 360));
}

export function addV226BattleArt(scene: Phaser.Scene, theme: BattleTheme): void {
  const tint = themeTint(theme);
  const overlay = image(scene, "v226-battle-painterly-overlay", 480, 270, 960, 540, 5, 0.52, tint);
  const top = image(scene, "v226-battle-top-hud-lacquer", 480, 38, 776, 68, 36, 0.30, tint);
  const dock = image(scene, "v226-battle-bottom-skill-bar", 480, 507, 706, 88, 35, 0.34, tint);
  const left = image(scene, "v226-battle-side-vine-left", 34, 286, 68, 276, 20, 0.18, tint);
  const right = image(scene, "v226-battle-side-vine-right", 926, 286, 68, 276, 20, 0.18, tint);
  const cards = images(scene, [
    ["v226-battle-skill-meteor-card", 850, 164, 128, 62, 47, 0.36, tint],
    ["v226-battle-skill-guard-card", 850, 220, 128, 62, 47, 0.32, tint],
    ["v226-battle-skill-hero-card", 850, 276, 128, 62, 47, 0.32, tint],
    ["v226-battle-combo-crystal-badge", 480, 78, 38, 38, 49, 0.28],
    ["v226-battle-boss-cut-warning", 160, 74, 42, 42, 49, 0.24, tint],
    ["v226-battle-mana-lacquer-drop", 802, 478, 32, 32, 49, 0.27, tint],
    ["v226-battle-safe-corner-left", 66, 500, 102, 70, 21, 0.14, tint],
    ["v226-battle-safe-corner-right", 894, 500, 102, 70, 21, 0.14, tint],
    ["v226-battle-frame-budget-badge", 913, 39, 24, 24, 49, 0.18],
  ]);
  [overlay, top, dock, left, right].forEach((sprite, index) => sprite && breathe(scene, sprite, 1.0018, index * 70));
  cards.forEach((sprite, index) => float(scene, sprite, 0.7 + (index % 2) * 0.25, index * 28));
}
