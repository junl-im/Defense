import Phaser from 'phaser';

export const V220_VERSION_LABEL = 'v2.20.0 TOY GARDEN MASS QA';

type StageNodeLike = { x: number; y: number; radius?: number };
type BattleTheme = 'forest' | 'canyon' | 'swamp' | 'fortress' | string;
type Placement = readonly [key: string, x: number, y: number, width: number, height: number, depth: number, alpha?: number, tint?: number];

const GARDEN_GOLD = 0xffd45f;
const GARDEN_BLUE = 0x82d5ff;
const GARDEN_PINK = 0xff94b8;
const GARDEN_GREEN = 0x8ee889;
const GARDEN_CREAM = 0xfff4cf;
const GARDEN_PURPLE = 0xb79aff;

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
    alpha: '+=0.018',
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
    const width = 30 + (i % 4) * 9;
    const tint = palette[i % palette.length];
    const sprite = addImage(scene, key, x, y, width, Math.max(20, width * 0.45), depth, 0.16 + (i % 3) * 0.04, tint);
    if (sprite) {
      sprite.setBlendMode(Phaser.BlendModes.ADD);
      bob(scene, sprite, 2 + (i % 3), 1600 + i * 65, i * 70);
    } else {
      const fallback = scene.add.star(x, y, 5, 2, 5 + (i % 4), tint, 0.20).setDepth(depth).setBlendMode(Phaser.BlendModes.ADD);
      bob(scene, fallback, 2 + (i % 3), 1600 + i * 65, i * 70);
    }
  }
}

function fallbackPanel(scene: Phaser.Scene, x: number, y: number, width: number, height: number, depth: number, tint: number): Phaser.GameObjects.Graphics {
  const g = scene.add.graphics().setDepth(depth);
  g.fillStyle(GARDEN_CREAM, 0.78).fillRoundedRect(x - width / 2, y - height / 2, width, height, Math.min(30, height / 2));
  g.lineStyle(2, tint, 0.66).strokeRoundedRect(x - width / 2, y - height / 2, width, height, Math.min(30, height / 2));
  g.lineStyle(1, 0xffffff, 0.42).strokeRoundedRect(x - width / 2 + 8, y - height / 2 + 8, width - 16, height - 16, Math.max(8, Math.min(22, height / 2 - 8)));
  return g;
}

function themeTint(theme: BattleTheme): number {
  if (theme === 'canyon') return 0xffbf6a;
  if (theme === 'swamp') return GARDEN_GREEN;
  if (theme === 'fortress') return GARDEN_PURPLE;
  return GARDEN_BLUE;
}

export function addV220LoginArt(scene: Phaser.Scene): void {
  const frame = addImage(scene, 'v220-login-card-lace-frame', 480, 353, 414, 272, 19, 0.33);
  if (frame) breathe(scene, frame, 1.004, 3100, 100);

  const crest = addImage(scene, 'v220-login-toy-castle-crest', 480, 182, 226, 120, 31, 0.76);
  if (crest) breathe(scene, crest, 1.007, 2700, 160);

  const arch = addImage(scene, 'v220-dream-cloud-arch', 480, 309, 442, 128, 18, 0.30);
  if (arch) breathe(scene, arch, 1.005, 2900, 80);

  scene.add.text(480, 179, '토이 가든 수비대', {
    fontFamily: 'Pretendard, Noto Sans KR, NanumSquareRound, Arial, sans-serif',
    fontSize: '12px',
    fontStyle: 'bold',
    color: '#2d5e99',
    stroke: '#ffffff',
    strokeThickness: 3,
    align: 'center',
    fixedWidth: 190,
  }).setOrigin(0.5).setDepth(33).setAlpha(0.90);

  const sprites = addMany(scene, [
    ['v220-login-aurora-ribbon', 480, 235, 360, 96, 30, 0.30],
    ['v220-mascot-fox-knight', 282, 444, 72, 72, 36, 0.84],
    ['v220-mascot-moon-kitten', 680, 444, 72, 72, 36, 0.82],
    ['v220-login-quick-crown-charm', 344, 346, 36, 36, 62, 0.78],
    ['v220-login-google-gem-charm', 616, 394, 36, 36, 62, 0.76],
    ['v220-login-email-envelope-charm', 362, 439, 28, 28, 62, 0.70],
    ['v220-login-register-heart-charm', 496, 439, 28, 28, 62, 0.70],
    ['v220-mini-announcement-scroll', 818, 39, 28, 28, 59, 0.63],
    ['v220-mini-support-headset', 872, 39, 28, 28, 59, 0.63],
    ['v220-mini-settings-gearflower', 926, 39, 28, 28, 59, 0.64],
    ['v220-floating-wish-stars', 206, 148, 150, 60, 7, 0.24],
    ['v220-floating-wish-stars', 756, 150, 150, 60, 7, 0.24],
  ]);
  sprites.forEach((sprite, index) => bob(scene, sprite, 2 + (index % 3), 1800 + index * 85, index * 60));

  twinkle(scene, 'v220-floating-wish-stars', new Phaser.Geom.Rectangle(142, 118, 700, 110), 8, 8, [GARDEN_GOLD, GARDEN_BLUE, GARDEN_PINK, GARDEN_GREEN]);
}

export function addV220LobbyArt(scene: Phaser.Scene, nickname: string, stars: number): void {
  const rug = addImage(scene, 'v220-bottom-nav-rug', 480, 501, 782, 82, 5, 0.40);
  if (rug) breathe(scene, rug, 1.003, 3200, 90);

  const gate = addImage(scene, 'v220-lobby-garden-gate', 480, 112, 420, 116, 12, 0.58);
  if (gate) breathe(scene, gate, 1.004, 2900, 160);

  scene.add.text(480, 103, '토이 가든 원정 본부', {
    fontFamily: 'Pretendard, Noto Sans KR, NanumSquareRound, Arial, sans-serif',
    fontSize: '12px',
    fontStyle: 'bold',
    color: '#285997',
    stroke: '#ffffff',
    strokeThickness: 3,
    fixedWidth: 270,
    align: 'center',
  }).setOrigin(0.5).setDepth(14).setAlpha(0.86);

  scene.add.text(480, 124, `${nickname} · 별 ${stars}개 · 안정화 대량 패치`, {
    fontFamily: 'Pretendard, Noto Sans KR, NanumSquareRound, Arial, sans-serif',
    fontSize: '8px',
    fontStyle: 'bold',
    color: '#5c75a6',
    stroke: '#ffffff',
    strokeThickness: 2,
    fixedWidth: 270,
    align: 'center',
  }).setOrigin(0.5).setDepth(14).setAlpha(0.78);

  const sprites = addMany(scene, [
    ['v220-lobby-resource-star-nest', 446, 35, 27, 27, 11, 0.82],
    ['v220-lobby-resource-gold-nest', 586, 35, 27, 27, 11, 0.82],
    ['v220-lobby-resource-gem-nest', 716, 35, 27, 27, 11, 0.82],
    ['v220-lobby-resource-heart-nest', 819, 35, 27, 27, 11, 0.58],
    ['v220-lobby-shop-tent', 86, 244, 54, 54, 11, 0.52],
    ['v220-lobby-quest-book', 858, 109, 48, 48, 11, 0.55],
    ['v220-lobby-mail-bird', 86, 402, 42, 42, 11, 0.52],
    ['v220-lobby-event-balloon', 86, 455, 42, 42, 11, 0.52],
    ['v220-lobby-hero-medallion', 154, 188, 40, 40, 11, 0.54],
    ['v220-lobby-tower-medallion', 44, 188, 40, 40, 11, 0.54],
    ['v220-npc-tea-rabbit', 232, 353, 62, 62, 16, 0.78],
    ['v220-npc-baker-bear', 730, 354, 62, 62, 16, 0.76],
    ['v220-npc-seed-fairy', 480, 428, 58, 58, 15, 0.62],
    ['v220-qa-check-badge', 304, 392, 32, 32, 21, 0.66],
    ['v220-touch-safe-badge', 654, 392, 32, 32, 21, 0.66],
    ['v220-performance-feather', 776, 392, 32, 32, 21, 0.54],
    ['v220-soft-divider-sparkles', 480, 164, 178, 58, 8, 0.28],
  ]);
  sprites.forEach((sprite, index) => bob(scene, sprite, 2 + (index % 3), 1760 + index * 80, index * 70));

  twinkle(scene, 'v220-floating-wish-stars', new Phaser.Geom.Rectangle(164, 76, 630, 88), 10, 7, [GARDEN_GOLD, GARDEN_BLUE, GARDEN_PINK]);
}

export function addV220WorldMapArt(scene: Phaser.Scene, stageNodes: readonly StageNodeLike[]): void {
  const preview = addImage(scene, 'v220-world-preview-garden-frame', 815, 282, 292, 240, 18, 0.44);
  if (preview) breathe(scene, preview, 1.0025, 3100, 120);

  const parchment = addImage(scene, 'v220-world-parchment-map-frame', 815, 282, 306, 252, 16, 0.18);
  if (parchment) breathe(scene, parchment, 1.002, 3300, 240);

  const sideCloud = addImage(scene, 'v220-world-side-cloud-curtain', 708, 116, 160, 82, 8, 0.22);
  if (sideCloud) bob(scene, sideCloud, 3, 2400, 130);

  const compass = addImage(scene, 'v220-world-compass-rose', 690, 118, 43, 43, 26, 0.50);
  if (compass) bob(scene, compass, 3, 2100, 150);

  stageNodes.forEach((node, index) => {
    const radius = node.radius ?? 24;
    const tint = index % 4 === 0 ? GARDEN_GOLD : index % 4 === 1 ? GARDEN_BLUE : index % 4 === 2 ? GARDEN_GREEN : GARDEN_PINK;
    const ring = addImage(scene, 'v220-world-node-jelly-ring', node.x, node.y + 1, radius * 2.4, radius * 2.4, 15, 0.28, tint);
    if (ring) {
      scene.tweens.add({ targets: ring, scaleX: 1.08, scaleY: 1.08, alpha: 0.40, duration: 1300 + index * 50, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    }

    if (index < stageNodes.length - 1) {
      const next = stageNodes[index + 1];
      const midX = Phaser.Math.Linear(node.x, next.x, 0.5);
      const midY = Phaser.Math.Linear(node.y, next.y, 0.5);
      const routeKey = index % 2 === 0 ? 'v220-world-route-candy-beads' : 'v220-world-route-leaf-bridge';
      const route = addImage(scene, routeKey, midX, midY, 84, 32, 13, 0.22, tint);
      if (route) route.setRotation(Phaser.Math.Angle.Between(node.x, node.y, next.x, next.y));
    }

    if (index === stageNodes.length - 1) {
      const gate = addImage(scene, 'v220-world-boss-portal-cake', node.x + 28, node.y - 48, 52, 52, 26, 0.40, GARDEN_PURPLE);
      if (gate) bob(scene, gate, 2, 2300, 200);
    }
    if (index === 0) addImage(scene, 'v220-world-current-crown-pop', node.x - 20, node.y - 34, 30, 30, 27, 0.38, GARDEN_GOLD);
    if (index > 8) addImage(scene, 'v220-world-locked-bow', node.x + 18, node.y + 18, 26, 26, 28, 0.32);
  });

  const sprites = addMany(scene, [
    ['v220-world-stage-ticket', 148, 157, 42, 42, 25, 0.54],
    ['v220-mascot-fox-knight', 124, 154, 48, 48, 16, 0.58],
    ['v220-npc-seed-fairy', 636, 432, 52, 52, 16, 0.55],
    ['v220-world-treasure-cart', 250, 506, 42, 42, 15, 0.36],
    ['v220-floating-wish-stars', 812, 364, 132, 60, 25, 0.20],
  ]);
  sprites.forEach((sprite, index) => bob(scene, sprite, 2 + (index % 3), 1900 + index * 90, index * 80));

  twinkle(scene, 'v220-floating-wish-stars', new Phaser.Geom.Rectangle(220, 112, 655, 324), 11, 8, [GARDEN_GOLD, GARDEN_BLUE, GARDEN_GREEN]);
}

export function addV220BattleArt(scene: Phaser.Scene, theme: BattleTheme): void {
  const tint = themeTint(theme);

  const top = addImage(scene, 'v220-battle-top-castle-lace', 480, 60, 376, 92, 66, 0.26, tint);
  if (top) breathe(scene, top, 1.003, 2800, 120);

  const dock = addImage(scene, 'v220-battle-bottom-pillow-dock', 258, 504, 468, 78, 75, 0.20, tint);
  if (dock) breathe(scene, dock, 1.002, 3200, 160);

  const leftRail = addImage(scene, 'v220-battle-left-flower-rail', 34, 270, 76, 228, 4, 0.15, tint);
  const rightRail = addImage(scene, 'v220-battle-right-flower-rail', 926, 270, 76, 228, 4, 0.14, tint);
  if (leftRail) bob(scene, leftRail, 3, 2450, 80);
  if (rightRail) bob(scene, rightRail, 3, 2550, 220);

  const droplets = addImage(scene, 'v220-battle-mana-leaf-droplets', 480, 95, 150, 66, 5, 0.12, tint);
  if (droplets) bob(scene, droplets, 2, 2300, 200);

  const sprites = addMany(scene, [
    ['v220-battle-spell-card-meteor-dream', 88, 504, 132, 56, 77, 0.30],
    ['v220-battle-spell-card-guard-dream', 232, 504, 132, 56, 77, 0.28],
    ['v220-battle-spell-card-hero-dream', 376, 504, 132, 56, 77, 0.28],
    ['v220-battle-wave-teacup', 722, 504, 88, 70, 77, 0.22, tint],
    ['v220-battle-meteor-orb', 37, 504, 32, 32, 84, 0.40],
    ['v220-battle-guard-orb', 180, 504, 32, 32, 84, 0.38],
    ['v220-battle-hero-orb', 324, 504, 32, 32, 84, 0.38],
    ['v220-battle-safe-petal-corner', 58, 96, 66, 66, 5, 0.15, tint],
    ['v220-battle-safe-petal-corner', 902, 424, 66, 66, 5, 0.15, tint],
    ['v220-battle-combo-jelly', 752, 28, 26, 26, 84, 0.34],
    ['v220-battle-build-seed-glow', 626, 28, 26, 26, 84, 0.32],
    ['v220-battle-boss-warning-rosette', 890, 28, 26, 26, 84, 0.26],
    ['v220-reward-rainbow-tray', 818, 472, 146, 52, 72, 0.10, tint],
  ]);
  sprites.forEach((sprite, index) => {
    if (index >= 4) bob(scene, sprite, 1.6 + (index % 3), 1750 + index * 60, index * 55);
  });

  twinkle(scene, 'v220-floating-wish-stars', new Phaser.Geom.Rectangle(86, 92, 790, 330), 8, 5, [tint, GARDEN_GOLD, GARDEN_CREAM]);
}

export function addV220ToastFrame(scene: Phaser.Scene, x: number, y: number, width: number, height: number, depth: number, alpha = 0.92): Phaser.GameObjects.Image | Phaser.GameObjects.Graphics {
  const toast = addImage(scene, 'v220-toast-garden-frame', x, y, width, height, depth, alpha);
  if (toast) return toast;
  return fallbackPanel(scene, x, y, width, height, depth, GARDEN_GREEN);
}
