import Phaser from "phaser";
import { addCoverImage } from "./CodeUiKit";
import { isLowDeviceProfile } from "./PerformanceMode";

export const V225_VERSION_LABEL = "v2.25.0 PREMIUM ART STREAM";

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
  pearl: 0xfff6df,
  sky: 0x91dcff,
  rose: 0xff9ebd,
  mint: 0x9be7bd,
  violet: 0xbca1ff,
  ink: 0x153362,
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
    duration: 220,
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

function breathe(scene: Phaser.Scene, target: Phaser.GameObjects.GameObject, amount = 1.004, delay = 0): void {
  if (!canAnimate()) return;
  scene.tweens.add({
    targets: target,
    scaleX: amount,
    scaleY: amount,
    alpha: "+=0.012",
    duration: 2600,
    delay,
    yoyo: true,
    repeat: -1,
    ease: "Sine.easeInOut",
  });
}

function float(scene: Phaser.Scene, target: Phaser.GameObjects.GameObject, amount = 2, delay = 0): void {
  if (!canAnimate()) return;
  scene.tweens.add({
    targets: target,
    y: `-=${amount}`,
    duration: 2300 + delay * 4,
    delay,
    yoyo: true,
    repeat: -1,
    ease: "Sine.easeInOut",
  });
}

function painterlyWash(scene: Phaser.Scene, depth: number, tone: "login" | "lobby" | "world" | "battle"): void {
  const top = tone === "battle" ? 0x06172f : tone === "world" ? 0x173d78 : 0x0d2d64;
  const warm = tone === "lobby" ? P.gold : tone === "world" ? P.violet : P.rose;
  const g = scene.add.graphics().setDepth(depth);
  g.fillGradientStyle(top, top, warm, P.sky, 0.28, 0.14, 0.08, 0.10);
  g.fillRect(0, 0, 960, 540);
  g.fillStyle(P.pearl, tone === "battle" ? 0.025 : 0.045).fillEllipse(480, 285, 790, 365);
  g.lineStyle(1, 0xffffff, 0.055);
  for (let i = 0; i < 6; i += 1) g.strokeEllipse(480, 285, 300 + i * 86, 130 + i * 42);
}

function tinyBrushLights(scene: Phaser.Scene, depth: number, count: number, area: Phaser.Geom.Rectangle): void {
  const palette = [P.gold, P.sky, P.rose, P.mint, P.violet, 0xffffff];
  const safeCount = isLowDeviceProfile() ? Math.ceil(count * 0.45) : count;
  for (let i = 0; i < safeCount; i += 1) {
    const x = area.x + ((i * 97) % area.width);
    const y = area.y + ((i * 61) % area.height);
    const star = scene.add
      .star(x, y, 5, 1.2, 3.2 + (i % 4), palette[i % palette.length], 0.18)
      .setDepth(depth)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setAlpha(0);
    scene.tweens.add({ targets: star, alpha: 0.18, duration: 240, delay: i * 9 });
    float(scene, star, 1.2 + (i % 2), i * 25);
  }
}

export function addV225LoginArt(scene: Phaser.Scene): void {
  if (has(scene, "v225-login-masterpiece-bg")) {
    addCoverImage(scene, "v225-login-masterpiece-bg", 960, 540, 1).setAlpha(0.92);
  } else painterlyWash(scene, 5, "login");

  const rays = image(scene, "v225-login-painterly-light-rays", 480, 130, 760, 260, 6, 0.45);
  const card = image(scene, "v225-login-premium-card-frame", 480, 352, 482, 298, 22, 0.84);
  const title = image(scene, "v225-login-crystal-title", 480, 169, 336, 126, 35, 0.92);
  const ribbon = image(scene, "v225-login-aurora-vellum-ribbon", 480, 236, 396, 86, 25, 0.64);
  const left = image(scene, "v225-login-corner-floral-left", 166, 452, 154, 154, 38, 0.62);
  const right = image(scene, "v225-login-corner-floral-right", 794, 452, 154, 154, 38, 0.62);
  const fox = image(scene, "v225-login-royal-fox-commander", 286, 430, 98, 98, 43, 0.96);
  const deer = image(scene, "v225-login-luna-deer-oracle", 674, 430, 98, 98, 43, 0.94);

  const buttons = images(scene, [
    ["v225-login-gold-button-frame", 480, 346, 286, 68, 48, 0.62],
    ["v225-login-pearl-button-frame", 480, 394, 286, 68, 48, 0.54],
    ["v225-login-small-button-frame", 413, 439, 136, 46, 48, 0.50],
    ["v225-login-small-button-frame", 547, 439, 136, 46, 48, 0.50],
    ["v225-login-instant-badge", 340, 346, 42, 42, 61, 0.88],
    ["v225-login-cloud-sync-badge", 620, 394, 42, 42, 61, 0.70],
    ["v225-login-gem-divider", 480, 485, 220, 30, 47, 0.46],
  ]);

  scene.add
    .text(480, 168, "원화풍 고속 왕국", {
      fontFamily: "Pretendard, Noto Sans KR, NanumSquareRound, Arial, sans-serif",
      fontSize: "13px",
      fontStyle: "bold",
      color: "#244b88",
      stroke: "#ffffff",
      strokeThickness: 3,
      fixedWidth: 240,
      align: "center",
    })
    .setOrigin(0.5)
    .setDepth(37)
    .setAlpha(0.94);

  [rays, card, title, ribbon, left, right, fox, deer, ...buttons].forEach((sprite, index) => {
    if (!sprite) return;
    if (index < 4) breathe(scene, sprite, 1.003 + index * 0.0005, index * 70);
    else float(scene, sprite, 1.4 + (index % 2), index * 45);
  });
  tinyBrushLights(scene, 7, 18, new Phaser.Geom.Rectangle(128, 76, 704, 140));
}

export function addV225LobbyArt(scene: Phaser.Scene, nickname: string, stars: number): void {
  if (has(scene, "v225-lobby-masterpiece-bg")) {
    addCoverImage(scene, "v225-lobby-masterpiece-bg", 960, 540, 1).setAlpha(0.86);
  } else painterlyWash(scene, 4, "lobby");

  const banner = image(scene, "v225-lobby-command-banner", 480, 108, 464, 110, 17, 0.82);
  const nav = image(scene, "v225-lobby-nav-velvet-frame", 480, 503, 724, 88, 7, 0.72);
  const profile = image(scene, "v225-lobby-profile-panel", 106, 187, 172, 72, 8, 0.58);
  const lanternL = image(scene, "v225-lobby-flower-lantern-left", 151, 352, 114, 146, 12, 0.48);
  const lanternR = image(scene, "v225-lobby-flower-lantern-right", 809, 352, 114, 146, 12, 0.48);

  scene.add
    .text(480, 100, "왕국 원화 작전실", {
      fontFamily: "Pretendard, Noto Sans KR, NanumSquareRound, Arial, sans-serif",
      fontSize: "14px",
      fontStyle: "bold",
      color: "#244b88",
      stroke: "#ffffff",
      strokeThickness: 3,
      fixedWidth: 286,
      align: "center",
    })
    .setOrigin(0.5)
    .setDepth(19);
  scene.add
    .text(480, 124, `${nickname} · 별 ${stars}개 · 즉시 입장/점진 로딩`, {
      fontFamily: "Pretendard, Noto Sans KR, Arial, sans-serif",
      fontSize: "8px",
      fontStyle: "bold",
      color: "#5e6f9e",
      stroke: "#ffffff",
      strokeThickness: 2,
      fixedWidth: 318,
      align: "center",
    })
    .setOrigin(0.5)
    .setDepth(19)
    .setAlpha(0.82);

  const sprites = images(scene, [
    ["v225-lobby-resource-star", 500, 35, 86, 42, 13, 0.74],
    ["v225-lobby-resource-gold", 638, 35, 86, 42, 13, 0.62],
    ["v225-lobby-resource-gem", 770, 35, 86, 42, 13, 0.62],
    ["v225-lobby-resource-heart", 862, 35, 72, 38, 13, 0.42],
    ["v225-lobby-shop-atelier", 86, 270, 58, 58, 13, 0.62],
    ["v225-lobby-quest-manuscript", 858, 135, 58, 58, 13, 0.62],
    ["v225-lobby-mail-swan", 86, 426, 46, 46, 13, 0.50],
    ["v225-lobby-event-firefly-lamp", 86, 478, 46, 46, 13, 0.50],
    ["v225-lobby-npc-owl-archivist", 240, 356, 76, 76, 18, 0.76],
    ["v225-lobby-npc-fox-tailor", 718, 356, 76, 76, 18, 0.76],
    ["v225-lobby-npc-cat-alchemist", 480, 430, 70, 70, 18, 0.64],
    ["v225-lobby-quality-rune", 906, 84, 36, 36, 14, 0.40],
  ]);

  [banner, nav, profile, lanternL, lanternR].forEach((sprite, index) => sprite && breathe(scene, sprite, 1.003, index * 80));
  sprites.forEach((sprite, index) => float(scene, sprite, 1.2 + (index % 3), index * 42));
  tinyBrushLights(scene, 6, 14, new Phaser.Geom.Rectangle(150, 70, 660, 92));
}

export function addV225WorldMapArt(scene: Phaser.Scene, stageNodes: readonly StageNodeLike[]): void {
  if (has(scene, "v225-world-masterpiece-bg")) {
    addCoverImage(scene, "v225-world-masterpiece-bg", 960, 540, 1).setAlpha(0.84);
  } else painterlyWash(scene, 3, "world");

  const preview = image(scene, "v225-world-preview-frame", 815, 283, 328, 252, 21, 0.66);
  const cloud = image(scene, "v225-world-cloud-panel", 816, 116, 240, 78, 10, 0.36);
  const compass = image(scene, "v225-world-map-compass", 86, 94, 58, 58, 16, 0.42);
  const chapter = image(scene, "v225-world-chapter-ribbon", 480, 42, 284, 60, 16, 0.46);
  const mist = image(scene, "v225-world-mist-wisp", 428, 270, 240, 120, 5, 0.24);
  [preview, cloud, compass, chapter, mist].forEach((sprite, index) => sprite && breathe(scene, sprite, 1.003, index * 70));

  stageNodes.forEach((node, index) => {
    const radius = node.radius ?? 24;
    const tint = [P.gold, P.sky, P.mint, P.rose, P.violet][index % 5];
    const shadow = image(scene, "v225-world-island-shadow", node.x, node.y + 14, radius * 3, radius * 1.8, 9, 0.20);
    const ring = image(scene, "v225-world-stage-ring", node.x, node.y, radius * 2.42, radius * 2.42, 17, 0.46, tint);
    if (ring && canAnimate()) {
      scene.tweens.add({
        targets: ring,
        scaleX: 1.05,
        scaleY: 1.05,
        alpha: 0.60,
        duration: 1500 + index * 36,
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
      const route = image(scene, "v225-world-route-prism", midX, midY, 118, 34, 11, 0.36);
      route?.setRotation(Phaser.Math.DegToRad(angle));
      if (index % 2 === 0) image(scene, "v225-world-star-path-dot", midX, midY - 18, 22, 22, 13, 0.34);
    }
    if (index % 4 === 0) image(scene, "v225-world-selected-crown", node.x, node.y - radius - 14, 28, 28, 19, 0.48);
    if (index % 5 === 3) image(scene, "v225-world-reward-bloom", node.x + radius + 10, node.y + radius - 4, 26, 26, 19, 0.44);
    if (index % 6 === 5) image(scene, "v225-world-locked-seal", node.x - radius - 9, node.y + radius - 2, 24, 24, 19, 0.38);
  });
  image(scene, "v225-world-boss-gate", 704, 450, 88, 82, 18, 0.56);
  tinyBrushLights(scene, 6, 12, new Phaser.Geom.Rectangle(84, 74, 618, 360));
}

function themeTint(theme: BattleTheme): number | undefined {
  if (theme === "canyon") return 0xffbd7c;
  if (theme === "swamp") return P.mint;
  if (theme === "fortress") return P.violet;
  return undefined;
}

export function addV225BattleArt(scene: Phaser.Scene, theme: BattleTheme): void {
  const tint = themeTint(theme);
  const overlay = image(scene, "v225-battle-painterly-overlay", 480, 270, 960, 540, 4, 0.72, tint);
  const top = image(scene, "v225-battle-top-hud-frame", 480, 38, 780, 66, 35, 0.36, tint);
  const dock = image(scene, "v225-battle-bottom-skill-dock", 480, 507, 712, 86, 34, 0.44, tint);
  const left = image(scene, "v225-battle-side-vine-left", 35, 286, 72, 280, 19, 0.26, tint);
  const right = image(scene, "v225-battle-side-vine-right", 925, 286, 72, 280, 19, 0.26, tint);
  const wave = image(scene, "v225-battle-wave-banner", 480, 82, 240, 54, 44, 0.24, tint);

  const cards = images(scene, [
    ["v225-battle-skill-meteor", 850, 164, 128, 62, 46, 0.48, tint],
    ["v225-battle-skill-guard", 850, 220, 128, 62, 46, 0.44, tint],
    ["v225-battle-skill-hero", 850, 276, 128, 62, 46, 0.44, tint],
    ["v225-battle-combo-badge", 480, 78, 40, 40, 48, 0.34],
    ["v225-battle-boss-warning", 160, 74, 42, 42, 48, 0.30, tint],
    ["v225-battle-mana-crystal", 802, 478, 34, 34, 48, 0.34, tint],
    ["v225-battle-safe-corner-left", 66, 500, 106, 72, 20, 0.18, tint],
    ["v225-battle-safe-corner-right", 894, 500, 106, 72, 20, 0.18, tint],
    ["v225-battle-touch-optimized-badge", 913, 39, 26, 26, 48, 0.22],
  ]);

  [overlay, top, dock, left, right, wave].forEach((sprite, index) => sprite && breathe(scene, sprite, 1.0025, index * 80));
  cards.forEach((sprite, index) => float(scene, sprite, 1.0 + (index % 2), index * 36));
}
