import Phaser from 'phaser';

export const V222_VERSION_LABEL = 'v2.22.0 MOONBERRY NURSERY MASS QA';

type StageNodeLike = { x: number; y: number; radius?: number };
type BattleTheme = 'forest' | 'canyon' | 'swamp' | 'fortress' | string;
type Placement = readonly [key: string, x: number, y: number, width: number, height: number, depth: number, alpha?: number, tint?: number];

const MOON_GOLD = 0xffdc7e;
const MOON_BLUE = 0x8edbff;
const MOON_PINK = 0xff9eca;
const MOON_GREEN = 0x91eca0;
const MOON_CREAM = 0xfff7dc;
const MOON_PURPLE = 0xb99cff;
const MOON_MINT = 0xa8f5e6;
const MOON_BERRY = 0xb16de8;

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
    alpha: '+=0.014',
    duration,
    delay,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.easeInOut',
  });
}

function twinkle(scene: Phaser.Scene, key: string, area: Phaser.Geom.Rectangle, count: number, depth: number, palette: readonly number[]): void {
  for (let i = 0; i < count; i += 1) {
    const x = area.x + ((i * 97) % Math.max(1, area.width));
    const y = area.y + ((i * 53) % Math.max(1, area.height));
    const width = 24 + (i % 4) * 8;
    const tint = palette[i % palette.length];
    const sprite = addImage(scene, key, x, y, width, Math.max(18, width * 0.46), depth, 0.13 + (i % 3) * 0.045, tint);
    if (sprite) {
      sprite.setBlendMode(Phaser.BlendModes.ADD);
      bob(scene, sprite, 2 + (i % 3), 1500 + i * 64, i * 58);
    } else {
      const fallback = scene.add.star(x, y, 5, 2, 5 + (i % 4), tint, 0.20).setDepth(depth).setBlendMode(Phaser.BlendModes.ADD);
      bob(scene, fallback, 2 + (i % 3), 1500 + i * 64, i * 58);
    }
  }
}

function fallbackPanel(scene: Phaser.Scene, x: number, y: number, width: number, height: number, depth: number, tint: number): Phaser.GameObjects.Graphics {
  const g = scene.add.graphics().setDepth(depth);
  g.fillStyle(MOON_CREAM, 0.80).fillRoundedRect(x - width / 2, y - height / 2, width, height, Math.min(30, height / 2));
  g.lineStyle(2, tint, 0.68).strokeRoundedRect(x - width / 2, y - height / 2, width, height, Math.min(30, height / 2));
  g.lineStyle(1, 0xffffff, 0.46).strokeRoundedRect(x - width / 2 + 8, y - height / 2 + 8, width - 16, height - 16, Math.max(8, Math.min(22, height / 2 - 8)));
  return g;
}

function themeTint(theme: BattleTheme): number {
  if (theme === 'canyon') return 0xffc17a;
  if (theme === 'swamp') return MOON_GREEN;
  if (theme === 'fortress') return MOON_PURPLE;
  return MOON_BLUE;
}

export function addV222LoginArt(scene: Phaser.Scene): void {
  const frame = addImage(scene, 'v222-login-quilt-window-frame', 480, 352, 438, 288, 21, 0.30);
  if (frame) breathe(scene, frame, 1.004, 3200, 100);

  const title = addImage(scene, 'v222-login-moonberry-title', 480, 181, 246, 128, 35, 0.72);
  if (title) breathe(scene, title, 1.006, 2800, 150);

  const roof = addImage(scene, 'v222-login-pastel-cloud-roof', 480, 297, 454, 124, 18, 0.24);
  if (roof) breathe(scene, roof, 1.004, 3000, 80);

  scene.add.text(480, 177, '문베리 보육 왕국', {
    fontFamily: 'Pretendard, Noto Sans KR, NanumSquareRound, Arial, sans-serif',
    fontSize: '12px',
    fontStyle: 'bold',
    color: '#2e5d9d',
    stroke: '#ffffff',
    strokeThickness: 3,
    align: 'center',
    fixedWidth: 210,
  }).setOrigin(0.5).setDepth(37).setAlpha(0.92);

  const sprites = addMany(scene, [
    ['v222-mascot-owl-sage', 278, 444, 74, 74, 39, 0.80],
    ['v222-mascot-peach-dragon', 682, 444, 74, 74, 39, 0.80],
    ['v222-login-quick-button-gem', 342, 346, 38, 38, 64, 0.80],
    ['v222-login-google-button-gem', 618, 394, 38, 38, 64, 0.78],
    ['v222-login-account-stamp', 362, 439, 30, 30, 64, 0.72],
    ['v222-login-settings-pinwheel', 926, 39, 30, 30, 61, 0.64],
    ['v222-login-safe-input-talisman', 548, 439, 28, 28, 64, 0.64],
    ['v222-ribbon-moon-bow', 480, 235, 128, 72, 32, 0.22],
    ['v222-decor-moon-sprinkle', 206, 148, 150, 60, 7, 0.22],
    ['v222-decor-moon-sprinkle', 756, 150, 150, 60, 7, 0.22],
  ]);
  sprites.forEach((sprite, index) => bob(scene, sprite, 2 + (index % 3), 1760 + index * 82, index * 56));

  twinkle(scene, 'v222-sparkle-moon-dust', new Phaser.Geom.Rectangle(138, 116, 704, 112), 10, 8, [MOON_GOLD, MOON_BLUE, MOON_PINK, MOON_GREEN, MOON_BERRY]);
}

export function addV222LobbyArt(scene: Phaser.Scene, nickname: string, stars: number): void {
  const quilt = addImage(scene, 'v222-lobby-bottom-quilt-arc', 480, 501, 810, 90, 5, 0.33);
  if (quilt) breathe(scene, quilt, 1.003, 3300, 80);

  const banner = addImage(scene, 'v222-lobby-moonberry-banner', 480, 112, 448, 124, 14, 0.52);
  if (banner) breathe(scene, banner, 1.004, 3000, 150);

  scene.add.text(480, 103, '문베리 원정 보육실', {
    fontFamily: 'Pretendard, Noto Sans KR, NanumSquareRound, Arial, sans-serif',
    fontSize: '12px',
    fontStyle: 'bold',
    color: '#2b5798',
    stroke: '#ffffff',
    strokeThickness: 3,
    fixedWidth: 286,
    align: 'center',
  }).setOrigin(0.5).setDepth(16).setAlpha(0.87);

  scene.add.text(480, 124, `${nickname} · 별 ${stars}개 · 씬 안정화/대량 에셋 보강`, {
    fontFamily: 'Pretendard, Noto Sans KR, NanumSquareRound, Arial, sans-serif',
    fontSize: '8px',
    fontStyle: 'bold',
    color: '#5a74a9',
    stroke: '#ffffff',
    strokeThickness: 2,
    fixedWidth: 292,
    align: 'center',
  }).setOrigin(0.5).setDepth(16).setAlpha(0.78);

  const sprites = addMany(scene, [
    ['v222-lobby-resource-star-moonjam', 446, 35, 28, 28, 12, 0.82],
    ['v222-lobby-resource-gold-moonjam', 586, 35, 28, 28, 12, 0.82],
    ['v222-lobby-resource-gem-moonjam', 716, 35, 28, 28, 12, 0.82],
    ['v222-lobby-resource-heart-moonjam', 819, 35, 28, 28, 12, 0.56],
    ['v222-lobby-shop-moon-cart', 86, 244, 56, 56, 12, 0.50],
    ['v222-lobby-quest-bookmark', 858, 109, 50, 50, 12, 0.53],
    ['v222-lobby-mail-owl', 86, 402, 44, 44, 12, 0.50],
    ['v222-lobby-event-lantern', 86, 455, 44, 44, 12, 0.50],
    ['v222-lobby-hero-rosette', 154, 188, 42, 42, 12, 0.53],
    ['v222-lobby-tower-rosette', 44, 188, 42, 42, 12, 0.53],
    ['v222-npc-milk-fox', 226, 354, 63, 63, 18, 0.76],
    ['v222-npc-button-mouse', 733, 354, 63, 63, 18, 0.74],
    ['v222-npc-honeybee-princess', 480, 428, 58, 58, 17, 0.62],
    ['v222-npc-lilypad-frog', 632, 430, 48, 48, 16, 0.50],
    ['v222-lobby-growth-badge', 304, 392, 33, 33, 23, 0.66],
    ['v222-lobby-storage-basket', 654, 392, 33, 33, 23, 0.64],
    ['v222-input-guard-star', 776, 392, 33, 33, 23, 0.55],
    ['v222-lobby-daily-moon-tag', 480, 164, 128, 74, 9, 0.22],
    ['v222-lobby-guild-cushion', 480, 455, 224, 76, 7, 0.12],
    ['v222-performance-windmill', 904, 84, 28, 28, 13, 0.40],
  ]);
  sprites.forEach((sprite, index) => bob(scene, sprite, 2 + (index % 3), 1740 + index * 78, index * 64));

  twinkle(scene, 'v222-sparkle-moon-dust', new Phaser.Geom.Rectangle(164, 76, 630, 88), 11, 7, [MOON_GOLD, MOON_BLUE, MOON_PINK, MOON_MINT, MOON_BERRY]);
}

export function addV222WorldMapArt(scene: Phaser.Scene, stageNodes: readonly StageNodeLike[]): void {
  const preview = addImage(scene, 'v222-world-preview-moon-frame', 815, 282, 310, 250, 20, 0.36);
  if (preview) breathe(scene, preview, 1.0025, 3200, 120);

  const cloudBanner = addImage(scene, 'v222-world-cloud-banner', 814, 116, 246, 90, 9, 0.20);
  if (cloudBanner) bob(scene, cloudBanner, 3, 2450, 130);

  const sideClouds = addImage(scene, 'v222-world-side-clouds', 710, 118, 164, 84, 9, 0.18);
  if (sideClouds) bob(scene, sideClouds, 3, 2520, 180);

  const compass = addImage(scene, 'v222-world-compass-mooncookie', 690, 118, 44, 44, 28, 0.46);
  if (compass) bob(scene, compass, 3, 2100, 150);

  stageNodes.forEach((node, index) => {
    const radius = node.radius ?? 24;
    const tint = index % 5 === 0 ? MOON_GOLD : index % 5 === 1 ? MOON_BLUE : index % 5 === 2 ? MOON_GREEN : index % 5 === 3 ? MOON_PINK : MOON_PURPLE;
    const ring = addImage(scene, 'v222-world-node-moonberry-ring', node.x, node.y + 1, radius * 2.34, radius * 2.34, 17, 0.23, tint);
    if (ring) {
      scene.tweens.add({ targets: ring, scaleX: 1.07, scaleY: 1.07, alpha: 0.36, duration: 1300 + index * 48, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    }

    if (index < stageNodes.length - 1) {
      const next = stageNodes[index + 1];
      const midX = Phaser.Math.Linear(node.x, next.x, 0.5);
      const midY = Phaser.Math.Linear(node.y, next.y, 0.5);
      const routeKey = index % 2 === 0 ? 'v222-world-route-pearl-string' : 'v222-world-route-leaf-ribbon';
      const route = addImage(scene, routeKey, midX, midY, 90, 32, 15, 0.20, tint);
      if (route) route.setRotation(Phaser.Math.Angle.Between(node.x, node.y, next.x, next.y));
    }

    if (index === stageNodes.length - 1) {
      const gate = addImage(scene, 'v222-world-boss-castle-gate', node.x + 28, node.y - 48, 54, 54, 28, 0.36, MOON_PURPLE);
      if (gate) bob(scene, gate, 2, 2320, 210);
    }
    if (index === 0) addImage(scene, 'v222-world-current-moon-crown', node.x - 2, node.y - 47, 36, 36, 29, 0.44, MOON_GOLD);
    if (index % 4 === 2) addImage(scene, 'v222-world-reward-berry', node.x + 30, node.y + 26, 24, 24, 24, 0.30, tint);
    if (index % 5 === 3) addImage(scene, 'v222-world-stage-tag', node.x - 31, node.y + 26, 38, 26, 20, 0.16, tint);
  });

  const sprites = addMany(scene, [
    ['v222-world-locked-pillow-lock', 142, 319, 42, 42, 28, 0.26],
    ['v222-world-caravan-pillow', 306, 418, 48, 48, 15, 0.22],
    ['v222-world-minimap-scroll', 166, 112, 138, 70, 7, 0.12],
    ['v222-decor-soft-divider', 815, 424, 142, 38, 22, 0.12],
  ]);
  sprites.forEach((sprite, index) => bob(scene, sprite, 2 + (index % 2), 2100 + index * 120, index * 80));
}

export function addV222BattleArt(scene: Phaser.Scene, theme: BattleTheme): void {
  const tint = themeTint(theme);
  const top = addImage(scene, 'v222-battle-top-moon-lace', 480, 31, 408, 70, 76, 0.19, tint);
  if (top) breathe(scene, top, 1.0025, 3000, 80);

  const bottom = addImage(scene, 'v222-battle-bottom-quilt-dock', 214, 503, 586, 74, 76, 0.22, tint);
  if (bottom) breathe(scene, bottom, 1.002, 3200, 120);

  const sprites = addMany(scene, [
    ['v222-battle-left-flower-ribbon', 12, 270, 44, 292, 4, 0.16, tint],
    ['v222-battle-right-flower-ribbon', 948, 270, 44, 292, 4, 0.16, tint],
    ['v222-battle-bottom-quilt-dock', 812, 502, 260, 68, 72, 0.10, tint],
    ['v222-battle-spell-card-meteor-moon', 70, 505, 86, 45, 84, 0.23],
    ['v222-battle-spell-card-guard-moon', 214, 505, 86, 45, 84, 0.22],
    ['v222-battle-spell-card-hero-moon', 358, 505, 86, 45, 84, 0.22],
    ['v222-battle-mana-pearl-chain', 480, 506, 130, 52, 82, 0.18, tint],
    ['v222-battle-wave-moon-flag', 722, 504, 92, 72, 78, 0.18, tint],
    ['v222-battle-meteor-badge', 37, 504, 33, 33, 85, 0.34],
    ['v222-battle-guard-badge', 180, 504, 33, 33, 85, 0.32],
    ['v222-battle-hero-badge', 324, 504, 33, 33, 85, 0.32],
    ['v222-battle-safe-pillow-corner', 58, 96, 68, 68, 5, 0.13, tint],
    ['v222-battle-safe-pillow-corner', 902, 424, 68, 68, 5, 0.13, tint],
    ['v222-battle-combo-berry', 752, 28, 27, 27, 85, 0.30],
    ['v222-battle-build-leaf-glow', 626, 28, 27, 27, 85, 0.28],
    ['v222-battle-boss-alert-moon', 890, 28, 27, 27, 85, 0.22],
    ['v222-battle-focus-totem', 844, 474, 34, 34, 80, 0.16, tint],
    ['v222-battle-reward-moon-tray', 818, 472, 148, 54, 73, 0.08, tint],
  ]);
  sprites.forEach((sprite, index) => {
    if (index >= 3) bob(scene, sprite, 1.6 + (index % 3), 1740 + index * 58, index * 52);
  });

  twinkle(scene, 'v222-sparkle-moon-dust', new Phaser.Geom.Rectangle(86, 92, 790, 330), 10, 5, [tint, MOON_GOLD, MOON_CREAM, MOON_BERRY]);
}

export function addV222ToastFrame(scene: Phaser.Scene, x: number, y: number, width: number, height: number, depth: number, alpha = 0.92): Phaser.GameObjects.Image | Phaser.GameObjects.Graphics {
  const toast = addImage(scene, 'v222-toast-moon-frame', x, y, width, height, depth, alpha);
  if (toast) return toast;
  return fallbackPanel(scene, x, y, width, height, depth, MOON_BERRY);
}
