import Phaser from "phaser";
import { isLowDeviceProfile } from "./PerformanceMode";

export const V224_VERSION_LABEL = "v2.24.0 PREMIUM ART PERF QA";

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

const A = {
  gold: 0xffd36c,
  sky: 0x85d8ff,
  rose: 0xff8eb8,
  mint: 0x95edbd,
  violet: 0xb493ff,
  ivory: 0xfff5dd,
  ink: 0x1a315f,
};

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
    .setAlpha(alpha);
  if (tint !== undefined) sprite.setTint(tint);
  return sprite;
}

function images(scene: Phaser.Scene, placements: readonly Placement[]): Phaser.GameObjects.Image[] {
  return placements.flatMap(([key, x, y, width, height, depth, alpha = 1, tint]) => {
    const sprite = image(scene, key, x, y, width, height, depth, alpha, tint);
    return sprite ? [sprite] : [];
  });
}

function canAnimate(): boolean {
  return !isLowDeviceProfile();
}

function slowBreathe(scene: Phaser.Scene, target: Phaser.GameObjects.GameObject, amount = 1.006, delay = 0): void {
  if (!canAnimate()) return;
  scene.tweens.add({
    targets: target,
    scaleX: amount,
    scaleY: amount,
    alpha: "+=0.018",
    duration: 2600,
    delay,
    yoyo: true,
    repeat: -1,
    ease: "Sine.easeInOut",
  });
}

function slowFloat(scene: Phaser.Scene, target: Phaser.GameObjects.GameObject, amount = 3, delay = 0): void {
  if (!canAnimate()) return;
  scene.tweens.add({
    targets: target,
    y: `-=${amount}`,
    duration: 2300 + delay * 5,
    delay,
    yoyo: true,
    repeat: -1,
    ease: "Sine.easeInOut",
  });
}

function addPaintAtmosphere(
  scene: Phaser.Scene,
  depth: number,
  tone: "login" | "lobby" | "world" | "battle",
): void {
  const top = tone === "battle" ? 0x07172f : tone === "world" ? 0x163c77 : 0x102a56;
  const warm = tone === "lobby" ? A.gold : tone === "world" ? A.violet : A.rose;

  const wash = scene.add.graphics().setDepth(depth);
  wash.fillGradientStyle(top, top, warm, A.sky, 0.22, 0.10, 0.08, 0.08);
  wash.fillRect(0, 0, 960, 540);
  wash.fillStyle(A.ivory, tone === "battle" ? 0.035 : 0.055).fillEllipse(480, 278, 760, 360);
  wash.lineStyle(1, 0xffffff, 0.07);
  for (let i = 0; i < 7; i += 1) {
    wash.strokeEllipse(480, 280, 240 + i * 80, 110 + i * 38);
  }
}

function tinyPrisms(scene: Phaser.Scene, depth: number, count: number, area: Phaser.Geom.Rectangle): void {
  const palette = [A.gold, A.sky, A.rose, A.mint, A.violet, 0xffffff];
  for (let i = 0; i < count; i += 1) {
    const x = area.x + ((i * 113) % area.width);
    const y = area.y + ((i * 67) % area.height);
    const size = 2.5 + (i % 4) * 1.2;
    const star = scene.add
      .star(x, y, 5, size * 0.35, size, palette[i % palette.length], 0.22)
      .setDepth(depth)
      .setBlendMode(Phaser.BlendModes.ADD);
    slowFloat(scene, star, 1.5 + (i % 3), i * 37);
  }
}

export function addV224LoginArt(scene: Phaser.Scene): void {
  addPaintAtmosphere(scene, 4, "login");

  const card = image(scene, "v224-login-painterly-card-frame", 480, 356, 462, 292, 23, 0.66);
  const title = image(scene, "v224-login-glass-title-plaque", 480, 176, 272, 120, 34, 0.88);
  const ribbon = image(scene, "v224-login-aurora-ribbon", 480, 236, 318, 76, 25, 0.54);
  const fox = image(scene, "v224-mascot-royal-fox-knight", 282, 436, 84, 84, 42, 0.92);
  const fawn = image(scene, "v224-mascot-luna-fawn-mage", 678, 436, 84, 84, 42, 0.90);

  const buttonLayers = images(scene, [
    ["v224-login-button-premium-glow", 480, 346, 282, 66, 48, 0.70],
    ["v224-login-google-pearl-button", 480, 394, 282, 66, 48, 0.56],
    ["v224-login-fast-start-badge", 343, 346, 38, 38, 61, 0.86],
    ["v224-login-cloud-save-badge", 617, 394, 38, 38, 61, 0.78],
    ["v224-perf-fast-feather-badge", 934, 38, 28, 28, 61, 0.55],
  ]);

  scene.add
    .text(480, 176, "프리미엄 원화풍 왕국", {
      fontFamily: "Pretendard, Noto Sans KR, NanumSquareRound, Arial, sans-serif",
      fontSize: "12px",
      fontStyle: "bold",
      color: "#244b88",
      stroke: "#ffffff",
      strokeThickness: 3,
      fixedWidth: 222,
      align: "center",
    })
    .setOrigin(0.5)
    .setDepth(36)
    .setAlpha(0.93);

  [card, title, ribbon, fox, fawn, ...buttonLayers].forEach((sprite, index) => {
    if (!sprite) return;
    if (index < 3) slowBreathe(scene, sprite, 1.004 + index * 0.001, index * 90);
    else slowFloat(scene, sprite, 2 + (index % 2), index * 70);
  });

  tinyPrisms(scene, 7, canAnimate() ? 16 : 8, new Phaser.Geom.Rectangle(132, 92, 700, 132));
}

export function addV224LobbyArt(scene: Phaser.Scene, nickname: string, stars: number): void {
  addPaintAtmosphere(scene, 3, "lobby");

  const banner = image(scene, "v224-lobby-painted-command-banner", 480, 112, 430, 104, 17, 0.78);
  const rug = image(scene, "v224-lobby-velvet-nav-rug", 480, 502, 716, 82, 7, 0.62);
  const notice = image(scene, "v224-lobby-storybook-notice-panel", 480, 393, 246, 92, 13, 0.36);

  scene.add
    .text(480, 101, "왕국 원정 본부", {
      fontFamily: "Pretendard, Noto Sans KR, NanumSquareRound, Arial, sans-serif",
      fontSize: "13px",
      fontStyle: "bold",
      color: "#244b88",
      stroke: "#ffffff",
      strokeThickness: 3,
      fixedWidth: 270,
      align: "center",
    })
    .setOrigin(0.5)
    .setDepth(19)
    .setAlpha(0.93);

  scene.add
    .text(480, 124, `${nickname} · 별 ${stars}개 · 빠른 시작 최적화 적용`, {
      fontFamily: "Pretendard, Noto Sans KR, NanumSquareRound, Arial, sans-serif",
      fontSize: "8px",
      fontStyle: "bold",
      color: "#5e6f9e",
      stroke: "#ffffff",
      strokeThickness: 2,
      fixedWidth: 294,
      align: "center",
    })
    .setOrigin(0.5)
    .setDepth(19)
    .setAlpha(0.78);

  const sprites = images(scene, [
    ["v224-lobby-resource-star-relic", 446, 35, 31, 31, 13, 0.92],
    ["v224-lobby-resource-gold-relic", 586, 35, 31, 31, 13, 0.92],
    ["v224-lobby-resource-gem-relic", 716, 35, 31, 31, 13, 0.92],
    ["v224-lobby-resource-heart-relic", 818, 35, 28, 28, 13, 0.68],
    ["v224-lobby-shop-painted-icon", 86, 244, 58, 58, 13, 0.68],
    ["v224-lobby-quest-painted-icon", 858, 109, 54, 54, 13, 0.70],
    ["v224-lobby-mail-painted-icon", 86, 402, 48, 48, 13, 0.66],
    ["v224-lobby-event-painted-icon", 86, 455, 48, 48, 13, 0.66],
    ["v224-npc-royal-cat-librarian", 224, 354, 66, 66, 19, 0.82],
    ["v224-npc-baker-bird-artist", 734, 354, 66, 66, 19, 0.80],
    ["v224-npc-tea-chef-sprite", 480, 427, 60, 60, 18, 0.68],
    ["v224-perf-fast-feather-badge", 905, 84, 28, 28, 14, 0.42],
  ]);

  [banner, rug, notice].forEach((sprite, index) => sprite && slowBreathe(scene, sprite, 1.003 + index * 0.001, index * 120));
  sprites.forEach((sprite, index) => slowFloat(scene, sprite, 1.5 + (index % 3), index * 52));
  tinyPrisms(scene, 6, canAnimate() ? 14 : 7, new Phaser.Geom.Rectangle(152, 70, 654, 84));
}

export function addV224WorldMapArt(scene: Phaser.Scene, stageNodes: readonly StageNodeLike[]): void {
  addPaintAtmosphere(scene, 2, "world");

  const preview = image(scene, "v224-world-preview-oilpaint-frame", 815, 282, 314, 246, 21, 0.55);
  const cloudPanel = image(scene, "v224-world-cloud-atmosphere-panel", 816, 116, 224, 76, 10, 0.32);
  const bossGate = image(scene, "v224-world-boss-aurora-gate", 698, 449, 78, 70, 18, 0.50);
  [preview, cloudPanel, bossGate].forEach((sprite, index) => sprite && slowBreathe(scene, sprite, 1.003, index * 100));

  stageNodes.forEach((node, index) => {
    const radius = node.radius ?? 24;
    const tint = [A.gold, A.sky, A.mint, A.rose, A.violet][index % 5];
    const ring = image(scene, "v224-world-gem-stage-ring", node.x, node.y + 1, radius * 2.35, radius * 2.35, 17, 0.38, tint);
    if (ring && canAnimate()) {
      scene.tweens.add({
        targets: ring,
        scaleX: 1.055,
        scaleY: 1.055,
        alpha: 0.52,
        duration: 1450 + index * 42,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    }

    if (index < stageNodes.length - 1) {
      const next = stageNodes[index + 1];
      const midX = (node.x + next.x) / 2;
      const midY = (node.y + next.y) / 2;
      const angle = Phaser.Math.RadToDeg(Math.atan2(next.y - node.y, next.x - node.x));
      const route = image(scene, "v224-world-prismatic-route-beads", midX, midY, 112, 30, 11, 0.30);
      route?.setRotation(Phaser.Math.DegToRad(angle));
    }

    if (index % 4 === 0) {
      image(scene, "v224-world-selected-celestial-crown", node.x, node.y - radius - 12, 28, 28, 19, 0.42);
    }
    if (index % 5 === 3) {
      image(scene, "v224-world-reward-painted-bloom", node.x + radius + 10, node.y + radius - 4, 26, 26, 19, 0.40);
    }
    if (index % 6 === 5) {
      image(scene, "v224-world-locked-story-locket", node.x - radius - 9, node.y + radius - 2, 24, 24, 19, 0.34);
    }
  });

  tinyPrisms(scene, 5, canAnimate() ? 12 : 6, new Phaser.Geom.Rectangle(80, 60, 610, 390));
}

function themeTint(theme: BattleTheme): number | undefined {
  if (theme === "canyon") return 0xffbb78;
  if (theme === "swamp") return A.mint;
  if (theme === "fortress") return A.violet;
  return undefined;
}

export function addV224BattleArt(scene: Phaser.Scene, theme: BattleTheme): void {
  addPaintAtmosphere(scene, 4, "battle");
  const tint = themeTint(theme);

  const top = image(scene, "v224-battle-top-oilpaint-lace", 480, 38, 760, 60, 35, 0.30, tint);
  const dock = image(scene, "v224-battle-bottom-painted-skill-dock", 480, 506, 674, 76, 34, 0.38, tint);
  const left = image(scene, "v224-battle-side-vine-left", 35, 285, 68, 286, 19, 0.24, tint);
  const right = image(scene, "v224-battle-side-vine-right", 925, 285, 68, 286, 19, 0.24, tint);

  const cards = images(scene, [
    ["v224-battle-skill-card-meteor-oil", 850, 164, 126, 62, 46, 0.50, tint],
    ["v224-battle-skill-card-guard-oil", 850, 220, 126, 62, 46, 0.46, tint],
    ["v224-battle-skill-card-hero-oil", 850, 276, 126, 62, 46, 0.46, tint],
    ["v224-battle-combo-prism-badge", 480, 78, 42, 42, 48, 0.34],
    ["v224-battle-boss-warning-medal", 160, 74, 40, 40, 48, 0.30, tint],
    ["v224-battle-mana-leaf-crystal", 802, 478, 34, 34, 48, 0.34, tint],
    ["v224-perf-fast-feather-badge", 912, 39, 26, 26, 48, 0.22],
  ]);

  [top, dock, left, right].forEach((sprite, index) => sprite && slowBreathe(scene, sprite, 1.0025, index * 90));
  cards.forEach((sprite, index) => slowFloat(scene, sprite, 1.2 + (index % 2), index * 50));
}
