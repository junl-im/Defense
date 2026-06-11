import Phaser from 'phaser';

export const V221_VERSION_LABEL = 'v2.21.0 CANDY KINGDOM MASS QA';

type StageNodeLike = { x: number; y: number; radius?: number };
type BattleTheme = 'forest' | 'canyon' | 'swamp' | 'fortress' | string;
type Placement = readonly [key: string, x: number, y: number, width: number, height: number, depth: number, alpha?: number, tint?: number];

const CANDY_GOLD = 0xffd65f;
const CANDY_BLUE = 0x7fd6ff;
const CANDY_PINK = 0xff91bd;
const CANDY_GREEN = 0x8eea92;
const CANDY_CREAM = 0xfff5d4;
const CANDY_PURPLE = 0xb795ff;
const CANDY_MINT = 0x9af2e0;

function has(scene: Phaser.Scene, key: string): boolean {
  return scene.textures.exists(key);
}

function addImage(
  scene: Phaser.Scene,
  key: string,
  x: number,
  y: number,
  width: number,
  height: number,
  depth: number,
  alpha = 1,
  tint?: number
): Phaser.GameObjects.Image | undefined {
  if (!has(scene, key)) return undefined;
  const sprite = scene.add.image(x, y, key).setDisplaySize(width, height).setDepth(depth).setAlpha(alpha);
  if (tint !== undefined) sprite.setTint(tint);
  return sprite;
}

function addMany(scene: Phaser.Scene, placements: readonly Placement[]): Phaser.GameObjects.Image[] {
  return placements.flatMap(([key, x, y, width, height, depth, alpha = 1, tint]) => {
    const sprite = addImage(scene, key, x, y, width, height, depth, alpha, tint);
    return sprite ? [sprite] : [];
  });
}

function bob(scene: Phaser.Scene, target: Phaser.GameObjects.GameObject, amount = 4, duration = 2200, delay = 0): void {
  scene.tweens.add({
    targets: target,
    y: `-=${amount}`,
    duration,
    delay,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.easeInOut',
  });
}

function breathe(scene: Phaser.Scene, target: Phaser.GameObjects.GameObject, scale = 1.012, duration = 2500, delay = 0): void {
  scene.tweens.add({
    targets: target,
    scaleX: scale,
    scaleY: scale,
    alpha: '+=0.016',
    duration,
    delay,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.easeInOut',
  });
}

function twinkle(scene: Phaser.Scene, key: string, area: Phaser.Geom.Rectangle, count: number, depth: number, palette: readonly number[]): void {
  for (let i = 0; i < count; i += 1) {
    const x = area.x + ((i * 89) % Math.max(1, area.width));
    const y = area.y + ((i * 47) % Math.max(1, area.height));
    const width = 26 + (i % 4) * 8;
    const tint = palette[i % palette.length];
    const sprite = addImage(scene, key, x, y, width, Math.max(20, width * 0.46), depth, 0.14 + (i % 3) * 0.045, tint);
    if (sprite) {
      sprite.setBlendMode(Phaser.BlendModes.ADD);
      bob(scene, sprite, 2 + (i % 3), 1550 + i * 64, i * 62);
    } else {
      const fallback = scene.add.star(x, y, 5, 2, 5 + (i % 4), tint, 0.20).setDepth(depth).setBlendMode(Phaser.BlendModes.ADD);
      bob(scene, fallback, 2 + (i % 3), 1550 + i * 64, i * 62);
    }
  }
}

function fallbackPanel(scene: Phaser.Scene, x: number, y: number, width: number, height: number, depth: number, tint: number): Phaser.GameObjects.Graphics {
  const g = scene.add.graphics().setDepth(depth);
  g.fillStyle(CANDY_CREAM, 0.78).fillRoundedRect(x - width / 2, y - height / 2, width, height, Math.min(30, height / 2));
  g.lineStyle(2, tint, 0.66).strokeRoundedRect(x - width / 2, y - height / 2, width, height, Math.min(30, height / 2));
  g.lineStyle(1, 0xffffff, 0.44).strokeRoundedRect(x - width / 2 + 8, y - height / 2 + 8, width - 16, height - 16, Math.max(8, Math.min(22, height / 2 - 8)));
  return g;
}

function themeTint(theme: BattleTheme): number {
  if (theme === 'canyon') return 0xffbd6a;
  if (theme === 'swamp') return CANDY_GREEN;
  if (theme === 'fortress') return CANDY_PURPLE;
  return CANDY_BLUE;
}

export function addV221LoginArt(scene: Phaser.Scene): void {
  const frame = addImage(scene, 'v221-login-starlight-window-frame', 480, 352, 426, 282, 20, 0.31);
  if (frame) breathe(scene, frame, 1.004, 3200, 100);

  const title = addImage(scene, 'v221-login-candy-crown-title', 480, 181, 236, 126, 34, 0.72);
  if (title) breathe(scene, title, 1.006, 2800, 150);

  const clouds = addImage(scene, 'v221-login-cozy-cloud-puffs', 480, 304, 448, 124, 18, 0.26);
  if (clouds) breathe(scene, clouds, 1.004, 3000, 80);

  scene.add.text(480, 177, '캔디 왕국 수호단', {
    fontFamily: 'Pretendard, Noto Sans KR, NanumSquareRound, Arial, sans-serif',
    fontSize: '12px',
    fontStyle: 'bold',
    color: '#2e5f9e',
    stroke: '#ffffff',
    strokeThickness: 3,
    align: 'center',
    fixedWidth: 200,
  }).setOrigin(0.5).setDepth(36).setAlpha(0.91);

  const sprites = addMany(scene, [
    ['v221-mascot-panda-guard', 280, 444, 73, 73, 38, 0.82],
    ['v221-mascot-blossom-deer', 680, 444, 73, 73, 38, 0.80],
    ['v221-login-quick-button-charm', 342, 346, 36, 36, 63, 0.78],
    ['v221-login-google-button-charm', 618, 394, 36, 36, 63, 0.76],
    ['v221-login-account-keyring', 362, 439, 28, 28, 63, 0.70],
    ['v221-login-settings-candygear', 926, 39, 28, 28, 60, 0.64],
    ['v221-ribbon-tiny-bow', 480, 235, 124, 70, 31, 0.24],
    ['v221-sparkle-sugar-dust', 206, 148, 150, 60, 7, 0.22],
    ['v221-sparkle-sugar-dust', 756, 150, 150, 60, 7, 0.22],
  ]);
  sprites.forEach((sprite, index) => bob(scene, sprite, 2 + (index % 3), 1780 + index * 84, index * 56));

  twinkle(scene, 'v221-sparkle-sugar-dust', new Phaser.Geom.Rectangle(142, 118, 700, 110), 9, 8, [CANDY_GOLD, CANDY_BLUE, CANDY_PINK, CANDY_GREEN]);
}

export function addV221LobbyArt(scene: Phaser.Scene, nickname: string, stars: number): void {
  const cushion = addImage(scene, 'v221-lobby-bottom-cushion-arc', 480, 501, 800, 88, 5, 0.34);
  if (cushion) breathe(scene, cushion, 1.003, 3300, 80);

  const banner = addImage(scene, 'v221-lobby-royal-candy-banner', 480, 112, 438, 120, 13, 0.52);
  if (banner) breathe(scene, banner, 1.004, 3000, 150);

  scene.add.text(480, 103, '캔디 왕국 작전실', {
    fontFamily: 'Pretendard, Noto Sans KR, NanumSquareRound, Arial, sans-serif',
    fontSize: '12px',
    fontStyle: 'bold',
    color: '#285997',
    stroke: '#ffffff',
    strokeThickness: 3,
    fixedWidth: 276,
    align: 'center',
  }).setOrigin(0.5).setDepth(15).setAlpha(0.86);

  scene.add.text(480, 124, `${nickname} · 별 ${stars}개 · 대량 QA/에셋 정비`, {
    fontFamily: 'Pretendard, Noto Sans KR, NanumSquareRound, Arial, sans-serif',
    fontSize: '8px',
    fontStyle: 'bold',
    color: '#5d76aa',
    stroke: '#ffffff',
    strokeThickness: 2,
    fixedWidth: 282,
    align: 'center',
  }).setOrigin(0.5).setDepth(15).setAlpha(0.78);

  const sprites = addMany(scene, [
    ['v221-lobby-resource-star-jam', 446, 35, 27, 27, 12, 0.82],
    ['v221-lobby-resource-gold-jam', 586, 35, 27, 27, 12, 0.82],
    ['v221-lobby-resource-gem-jam', 716, 35, 27, 27, 12, 0.82],
    ['v221-lobby-resource-heart-jam', 819, 35, 27, 27, 12, 0.56],
    ['v221-lobby-shop-cupcake-booth', 86, 244, 54, 54, 12, 0.50],
    ['v221-lobby-quest-scroll-bow', 858, 109, 48, 48, 12, 0.53],
    ['v221-lobby-mail-pigeon', 86, 402, 42, 42, 12, 0.50],
    ['v221-lobby-event-firefly-jar', 86, 455, 42, 42, 12, 0.50],
    ['v221-lobby-hero-pendant', 154, 188, 40, 40, 12, 0.53],
    ['v221-lobby-tower-pendant', 44, 188, 40, 40, 12, 0.53],
    ['v221-npc-maple-hedgehog', 226, 354, 62, 62, 17, 0.76],
    ['v221-npc-cloud-shepherd', 733, 354, 62, 62, 17, 0.74],
    ['v221-npc-jam-penguin', 480, 428, 58, 58, 16, 0.62],
    ['v221-qa-mobile-badge', 304, 392, 32, 32, 22, 0.66],
    ['v221-memory-clean-badge', 654, 392, 32, 32, 22, 0.64],
    ['v221-input-guard-badge', 776, 392, 32, 32, 22, 0.55],
    ['v221-lobby-daily-bow-tag', 480, 164, 124, 72, 9, 0.22],
    ['v221-storybook-patch-plaque', 480, 455, 220, 74, 7, 0.12],
  ]);
  sprites.forEach((sprite, index) => bob(scene, sprite, 2 + (index % 3), 1760 + index * 78, index * 64));

  twinkle(scene, 'v221-sparkle-sugar-dust', new Phaser.Geom.Rectangle(164, 76, 630, 88), 10, 7, [CANDY_GOLD, CANDY_BLUE, CANDY_PINK, CANDY_MINT]);
}

export function addV221WorldMapArt(scene: Phaser.Scene, stageNodes: readonly StageNodeLike[]): void {
  const preview = addImage(scene, 'v221-world-preview-candy-frame', 815, 282, 302, 246, 19, 0.36);
  if (preview) breathe(scene, preview, 1.0025, 3200, 120);

  const cloudBanner = addImage(scene, 'v221-world-cloud-banner', 814, 116, 240, 88, 9, 0.20);
  if (cloudBanner) bob(scene, cloudBanner, 3, 2450, 130);

  const sideClouds = addImage(scene, 'v221-world-side-dream-clouds', 710, 118, 160, 82, 9, 0.18);
  if (sideClouds) bob(scene, sideClouds, 3, 2520, 180);

  const compass = addImage(scene, 'v221-world-compass-cookie', 690, 118, 43, 43, 27, 0.46);
  if (compass) bob(scene, compass, 3, 2100, 150);

  stageNodes.forEach((node, index) => {
    const radius = node.radius ?? 24;
    const tint = index % 5 === 0 ? CANDY_GOLD : index % 5 === 1 ? CANDY_BLUE : index % 5 === 2 ? CANDY_GREEN : index % 5 === 3 ? CANDY_PINK : CANDY_PURPLE;
    const ring = addImage(scene, 'v221-world-node-lollipop-ring', node.x, node.y + 1, radius * 2.32, radius * 2.32, 16, 0.24, tint);
    if (ring) {
      scene.tweens.add({ targets: ring, scaleX: 1.07, scaleY: 1.07, alpha: 0.36, duration: 1320 + index * 48, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    }

    if (index < stageNodes.length - 1) {
      const next = stageNodes[index + 1];
      const midX = Phaser.Math.Linear(node.x, next.x, 0.5);
      const midY = Phaser.Math.Linear(node.y, next.y, 0.5);
      const routeKey = index % 2 === 0 ? 'v221-world-route-sugar-string' : 'v221-world-route-leaf-stitches';
      const route = addImage(scene, routeKey, midX, midY, 88, 32, 14, 0.20, tint);
      if (route) route.setRotation(Phaser.Math.Angle.Between(node.x, node.y, next.x, next.y));
    }

    if (index === stageNodes.length - 1) {
      const gate = addImage(scene, 'v221-world-boss-cookie-gate', node.x + 28, node.y - 48, 52, 52, 27, 0.36, CANDY_PURPLE);
      if (gate) bob(scene, gate, 2, 2320, 210);
    }
    if (index === 0) addImage(scene, 'v221-world-current-ribbon-crown', node.x - 20, node.y - 34, 30, 30, 28, 0.34, CANDY_GOLD);
    if (index > 8) addImage(scene, 'v221-world-locked-mitten', node.x + 18, node.y + 18, 26, 26, 29, 0.30);
  });

  const sprites = addMany(scene, [
    ['v221-world-stage-flaglet', 148, 157, 42, 42, 26, 0.50],
    ['v221-mascot-panda-guard', 124, 154, 48, 48, 17, 0.52],
    ['v221-npc-jam-penguin', 636, 432, 52, 52, 17, 0.51],
    ['v221-world-caravan-cart', 250, 506, 42, 42, 16, 0.34],
    ['v221-world-reward-flower', 604, 506, 38, 38, 16, 0.32],
    ['v221-sparkle-sugar-dust', 812, 364, 132, 60, 26, 0.18],
  ]);
  sprites.forEach((sprite, index) => bob(scene, sprite, 2 + (index % 3), 1900 + index * 88, index * 78));

  twinkle(scene, 'v221-sparkle-sugar-dust', new Phaser.Geom.Rectangle(220, 112, 655, 324), 12, 8, [CANDY_GOLD, CANDY_BLUE, CANDY_GREEN, CANDY_PINK]);
}

export function addV221BattleArt(scene: Phaser.Scene, theme: BattleTheme): void {
  const tint = themeTint(theme);

  const top = addImage(scene, 'v221-battle-top-candy-lace', 480, 60, 392, 94, 67, 0.22, tint);
  if (top) breathe(scene, top, 1.003, 2850, 120);

  const dock = addImage(scene, 'v221-battle-bottom-cushion-dock', 258, 504, 478, 78, 76, 0.18, tint);
  if (dock) breathe(scene, dock, 1.002, 3250, 150);

  const leftRail = addImage(scene, 'v221-battle-left-vine-ribbon', 34, 270, 76, 228, 4, 0.13, tint);
  const rightRail = addImage(scene, 'v221-battle-right-vine-ribbon', 926, 270, 76, 228, 4, 0.12, tint);
  if (leftRail) bob(scene, leftRail, 3, 2460, 80);
  if (rightRail) bob(scene, rightRail, 3, 2560, 220);

  const dew = addImage(scene, 'v221-battle-mana-dew-chain', 480, 95, 154, 66, 5, 0.10, tint);
  if (dew) bob(scene, dew, 2, 2300, 200);

  const sprites = addMany(scene, [
    ['v221-battle-spell-card-meteor-candy', 88, 504, 136, 56, 78, 0.25],
    ['v221-battle-spell-card-guard-candy', 232, 504, 136, 56, 78, 0.24],
    ['v221-battle-spell-card-hero-candy', 376, 504, 136, 56, 78, 0.24],
    ['v221-battle-wave-cupcake-flag', 722, 504, 90, 70, 78, 0.18, tint],
    ['v221-battle-meteor-lollipop', 37, 504, 32, 32, 85, 0.34],
    ['v221-battle-guard-macaron', 180, 504, 32, 32, 85, 0.32],
    ['v221-battle-hero-star-medal', 324, 504, 32, 32, 85, 0.32],
    ['v221-battle-safe-marshmallow-corner', 58, 96, 66, 66, 5, 0.13, tint],
    ['v221-battle-safe-marshmallow-corner', 902, 424, 66, 66, 5, 0.13, tint],
    ['v221-battle-combo-macaron', 752, 28, 26, 26, 85, 0.30],
    ['v221-battle-build-flower-glow', 626, 28, 26, 26, 85, 0.28],
    ['v221-battle-boss-alert-cookie', 890, 28, 26, 26, 85, 0.22],
    ['v221-battle-reward-candy-tray', 818, 472, 146, 52, 73, 0.08, tint],
  ]);
  sprites.forEach((sprite, index) => {
    if (index >= 4) bob(scene, sprite, 1.6 + (index % 3), 1750 + index * 60, index * 55);
  });

  twinkle(scene, 'v221-sparkle-sugar-dust', new Phaser.Geom.Rectangle(86, 92, 790, 330), 9, 5, [tint, CANDY_GOLD, CANDY_CREAM]);
}

export function addV221ToastFrame(scene: Phaser.Scene, x: number, y: number, width: number, height: number, depth: number, alpha = 0.92): Phaser.GameObjects.Image | Phaser.GameObjects.Graphics {
  const toast = addImage(scene, 'v221-toast-candy-frame', x, y, width, height, depth, alpha);
  if (toast) return toast;
  return fallbackPanel(scene, x, y, width, height, depth, CANDY_PINK);
}
