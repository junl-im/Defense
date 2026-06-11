import Phaser from 'phaser';

export const V219_VERSION_LABEL = 'v2.19.0 STORYBOOK MASS ART QA';

type StageNodeLike = { x: number; y: number; radius?: number };
type BattleTheme = 'forest' | 'canyon' | 'swamp' | 'fortress' | string;
type Placement = readonly [key: string, x: number, y: number, width: number, height: number, depth: number, alpha?: number, tint?: number];

const STORY_GOLD = 0xffd56c;
const STORY_BLUE = 0x8fdcff;
const STORY_PINK = 0xff9cba;
const STORY_GREEN = 0x96e884;
const STORY_CREAM = 0xfff7df;
const STORY_PURPLE = 0xb09aff;

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
    alpha: '+=0.025',
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
    const width = 34 + (i % 4) * 10;
    const tint = palette[i % palette.length];
    const sprite = addImage(scene, key, x, y, width, Math.max(22, width * 0.55), depth, 0.20 + (i % 3) * 0.045, tint);
    if (sprite) {
      sprite.setBlendMode(Phaser.BlendModes.ADD);
      bob(scene, sprite, 2 + (i % 3), 1650 + i * 70, i * 80);
    } else {
      const fallback = scene.add.star(x, y, 5, 2, 5 + (i % 4), tint, 0.22)
        .setDepth(depth)
        .setBlendMode(Phaser.BlendModes.ADD);
      bob(scene, fallback, 2 + (i % 3), 1650 + i * 70, i * 80);
    }
  }
}

function fallbackPanel(scene: Phaser.Scene, x: number, y: number, width: number, height: number, depth: number, tint: number): Phaser.GameObjects.Graphics {
  const g = scene.add.graphics().setDepth(depth);
  g.fillStyle(STORY_CREAM, 0.76).fillRoundedRect(x - width / 2, y - height / 2, width, height, Math.min(28, height / 2));
  g.lineStyle(2, tint, 0.66).strokeRoundedRect(x - width / 2, y - height / 2, width, height, Math.min(28, height / 2));
  g.lineStyle(1, 0xffffff, 0.38).strokeRoundedRect(x - width / 2 + 7, y - height / 2 + 7, width - 14, height - 14, Math.max(8, Math.min(22, height / 2 - 7)));
  return g;
}

function themeTint(theme: BattleTheme): number {
  if (theme === 'canyon') return 0xffc16b;
  if (theme === 'swamp') return STORY_GREEN;
  if (theme === 'fortress') return STORY_PINK;
  return STORY_BLUE;
}

export function addV219LoginArt(scene: Phaser.Scene): void {
  const arch = addImage(scene, 'v219-login-lantern-arch', 480, 330, 418, 128, 17, 0.40);
  if (arch) breathe(scene, arch, 1.006, 2900, 80);

  const plaque = addImage(scene, 'v219-storybook-title-plaque', 480, 217, 338, 106, 28, 0.76);
  if (plaque) breathe(scene, plaque, 1.006, 2600, 160);

  scene.add.text(480, 214, '스토리북 방어대', {
    fontFamily: 'Pretendard, Noto Sans KR, NanumSquareRound, Arial, sans-serif',
    fontSize: '13px',
    fontStyle: 'bold',
    color: '#285997',
    stroke: '#ffffff',
    strokeThickness: 3,
    align: 'center',
    fixedWidth: 240,
  }).setOrigin(0.5).setDepth(30).setAlpha(0.92);

  const sprites = addMany(scene, [
    ['v219-plush-cloud-backdrop', 247, 172, 164, 70, 6, 0.32],
    ['v219-plush-cloud-backdrop', 724, 174, 150, 64, 6, 0.30],
    ['v219-mascot-sprout-keeper', 286, 430, 78, 78, 35, 0.90],
    ['v219-mascot-cookie-golem', 673, 430, 80, 80, 35, 0.87],
    ['v219-login-button-glow-quick', 336, 346, 42, 42, 61, 0.76],
    ['v219-login-button-glow-google', 624, 394, 42, 42, 61, 0.74],
    ['v219-account-crest', 405, 439, 34, 34, 61, 0.72],
    ['v219-magic-key-badge', 546, 439, 34, 34, 61, 0.72],
    ['v219-lobby-mail-bubble', 818, 39, 32, 32, 58, 0.68],
    ['v219-floating-music-note', 872, 39, 32, 32, 58, 0.64],
    ['v219-settings-wand', 926, 39, 32, 32, 58, 0.68],
    ['v219-heart-leaf-confetti', 480, 486, 150, 82, 34, 0.28],
  ]);
  sprites.forEach((sprite, index) => bob(scene, sprite, 2 + (index % 3), 1850 + index * 90, index * 70));

  twinkle(scene, 'v219-sparkle-bloom-cluster', new Phaser.Geom.Rectangle(140, 116, 690, 108), 9, 7, [STORY_GOLD, STORY_BLUE, STORY_PINK, STORY_GREEN]);
}

export function addV219LobbyArt(scene: Phaser.Scene, nickname: string, stars: number): void {
  const navGlow = addImage(scene, 'v219-lobby-bottom-nav-glow', 480, 501, 744, 72, 5, 0.42);
  if (navGlow) breathe(scene, navGlow, 1.004, 3000, 120);

  const banner = addImage(scene, 'v219-lobby-castle-banner', 480, 111, 348, 88, 11, 0.72);
  if (banner) breathe(scene, banner, 1.006, 2700, 220);

  scene.add.text(480, 106, '봉봉 왕국 운영실', {
    fontFamily: 'Pretendard, Noto Sans KR, NanumSquareRound, Arial, sans-serif',
    fontSize: '12px',
    fontStyle: 'bold',
    color: '#285997',
    stroke: '#ffffff',
    strokeThickness: 3,
    fixedWidth: 250,
    align: 'center',
  }).setOrigin(0.5).setDepth(13).setAlpha(0.84);

  scene.add.text(480, 126, `${nickname} · 별 ${stars}개 · 대량 QA`, {
    fontFamily: 'Pretendard, Noto Sans KR, NanumSquareRound, Arial, sans-serif',
    fontSize: '8px',
    fontStyle: 'bold',
    color: '#5c75a6',
    stroke: '#ffffff',
    strokeThickness: 2,
    fixedWidth: 250,
    align: 'center',
  }).setOrigin(0.5).setDepth(13).setAlpha(0.78);

  const sprites = addMany(scene, [
    ['v219-resource-star-shell', 446, 35, 28, 28, 10, 0.86],
    ['v219-resource-coin-shell', 586, 35, 28, 28, 10, 0.86],
    ['v219-resource-gem-shell', 716, 35, 28, 28, 10, 0.86],
    ['v219-lobby-shop-sign', 86, 244, 58, 58, 10, 0.56],
    ['v219-lobby-daily-stamp', 858, 109, 48, 48, 10, 0.58],
    ['v219-lobby-mail-bubble', 86, 402, 44, 44, 10, 0.54],
    ['v219-lobby-event-rosette', 86, 455, 44, 44, 10, 0.54],
    ['v219-lobby-hero-portrait', 154, 188, 42, 42, 10, 0.56],
    ['v219-lobby-tower-portrait', 44, 188, 42, 42, 10, 0.56],
    ['v219-npc-sheep-mage', 230, 356, 64, 64, 15, 0.82],
    ['v219-npc-squirrel-archer', 730, 355, 64, 64, 15, 0.80],
    ['v219-npc-pudding-slime', 480, 431, 56, 56, 14, 0.58],
    ['v219-badge-new', 654, 392, 34, 34, 20, 0.70],
    ['v219-badge-qa', 306, 392, 34, 34, 20, 0.70],
    ['v219-tiny-star-trail', 480, 163, 168, 58, 7, 0.30],
  ]);
  sprites.forEach((sprite, index) => bob(scene, sprite, 2 + (index % 3), 1800 + index * 85, index * 80));

  twinkle(scene, 'v219-sparkle-bloom-cluster', new Phaser.Geom.Rectangle(166, 78, 620, 84), 10, 6, [STORY_GOLD, STORY_BLUE, STORY_PINK]);
}

export function addV219WorldMapArt(scene: Phaser.Scene, stageNodes: readonly StageNodeLike[]): void {
  const preview = addImage(scene, 'v219-world-preview-storybook-frame', 815, 282, 286, 236, 17, 0.50);
  if (preview) breathe(scene, preview, 1.003, 3000, 120);

  const compass = addImage(scene, 'v219-world-compass-badge', 690, 118, 46, 46, 25, 0.54);
  if (compass) bob(scene, compass, 3, 2100, 150);

  stageNodes.forEach((node, index) => {
    const radius = node.radius ?? 24;
    const tint = index % 4 === 0 ? STORY_GOLD : index % 4 === 1 ? STORY_BLUE : index % 4 === 2 ? STORY_GREEN : STORY_PINK;
    const bloom = addImage(scene, 'v219-world-node-bloom', node.x, node.y + 2, radius * 2.3, radius * 2.3, 14, 0.28, tint);
    if (bloom) {
      scene.tweens.add({ targets: bloom, scaleX: 1.08, scaleY: 1.08, alpha: 0.42, duration: 1350 + index * 50, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    }
    if (index < stageNodes.length - 1) {
      const next = stageNodes[index + 1];
      const midX = Phaser.Math.Linear(node.x, next.x, 0.5);
      const midY = Phaser.Math.Linear(node.y, next.y, 0.5);
      const route = addImage(scene, index % 2 === 0 ? 'v219-world-route-dotted-ribbon' : 'v219-world-route-ribbon', midX, midY, 74, 32, 12, 0.24, tint);
      if (route) route.setRotation(Phaser.Math.Angle.Between(node.x, node.y, next.x, next.y) * 0.20);
    }
    if (index === stageNodes.length - 1) {
      const gate = addImage(scene, 'v219-world-boss-gate', node.x + 28, node.y - 48, 52, 52, 25, 0.42, STORY_PURPLE);
      if (gate) bob(scene, gate, 2, 2300, 200);
    }
    if (index > 8) {
      addImage(scene, 'v219-world-node-locked-cover', node.x + 18, node.y + 18, 26, 26, 27, 0.36);
    }
  });

  const sprites = addMany(scene, [
    ['v219-world-cloud-trail', 226, 130, 156, 64, 7, 0.28],
    ['v219-world-cloud-trail', 638, 112, 144, 58, 7, 0.26],
    ['v219-world-stage-flag', 148, 157, 44, 44, 24, 0.60],
    ['v219-mascot-sprout-keeper', 124, 154, 50, 50, 15, 0.70],
    ['v219-npc-squirrel-archer', 636, 432, 54, 54, 15, 0.64],
    ['v219-heart-leaf-confetti', 292, 504, 156, 74, 8, 0.22],
    ['v219-tiny-star-trail', 812, 364, 132, 60, 24, 0.22],
  ]);
  sprites.forEach((sprite, index) => bob(scene, sprite, 2 + (index % 3), 1900 + index * 90, index * 90));

  twinkle(scene, 'v219-sparkle-bloom-cluster', new Phaser.Geom.Rectangle(220, 112, 655, 324), 11, 7, [STORY_GOLD, STORY_BLUE, STORY_GREEN]);
}

export function addV219BattleArt(scene: Phaser.Scene, theme: BattleTheme): void {
  const tint = themeTint(theme);

  const top = addImage(scene, 'v219-battle-top-story-lace', 480, 61, 338, 84, 65, 0.34, tint);
  if (top) breathe(scene, top, 1.004, 2800, 120);

  const leftVine = addImage(scene, 'v219-battle-side-mana-vine', 36, 270, 78, 232, 4, 0.18, tint);
  const rightVine = addImage(scene, 'v219-battle-side-mana-vine', 926, 270, 78, 232, 4, 0.16, tint);
  if (rightVine) rightVine.setFlipX(true);
  [leftVine, rightVine].forEach((vine, index) => {
    if (vine) bob(scene, vine, 3, 2500 + index * 200, index * 100);
  });

  const cards = addMany(scene, [
    ['v219-battle-spell-card-meteor', 88, 504, 130, 58, 76, 0.36],
    ['v219-battle-spell-card-guard', 232, 504, 130, 58, 76, 0.34],
    ['v219-battle-spell-card-hero', 376, 504, 130, 58, 76, 0.34],
    ['v219-battle-wave-bookmark', 722, 504, 92, 76, 76, 0.26, tint],
    ['v219-battle-spell-meteor-badge', 37, 504, 34, 34, 83, 0.48],
    ['v219-battle-spell-guard-badge', 180, 504, 34, 34, 83, 0.46],
    ['v219-battle-spell-hero-badge', 324, 504, 34, 34, 83, 0.46],
    ['v219-battle-safe-corner', 58, 96, 70, 70, 5, 0.18, tint],
    ['v219-battle-safe-corner', 902, 424, 70, 70, 5, 0.18, tint],
    ['v219-battle-combo-cookie', 752, 28, 28, 28, 83, 0.42],
    ['v219-progress-story-beads', 626, 28, 28, 28, 83, 0.38],
    ['v219-tutorial-finger-swipe', 890, 28, 28, 28, 83, 0.28],
    ['v219-heart-leaf-confetti', 480, 117, 150, 76, 5, 0.14, tint],
  ]);
  cards.forEach((sprite, index) => {
    if (index >= 4) bob(scene, sprite, 2 + (index % 2), 1700 + index * 80, index * 70);
  });

  scene.add.text(480, 61, '스토리북 전투 QA', {
    fontFamily: 'Pretendard, Noto Sans KR, NanumSquareRound, Arial, sans-serif',
    fontSize: '8px',
    fontStyle: 'bold',
    color: '#f8fbff',
    stroke: '#17366c',
    strokeThickness: 3,
    fixedWidth: 180,
    align: 'center',
  }).setOrigin(0.5).setDepth(66).setAlpha(0.56);

  twinkle(scene, 'v219-sparkle-bloom-cluster', new Phaser.Geom.Rectangle(86, 92, 790, 330), 8, 5, [tint, STORY_GOLD, STORY_CREAM]);
}

export function addV219ToastFrame(scene: Phaser.Scene, x: number, y: number, width: number, height: number, depth: number, alpha = 0.92): Phaser.GameObjects.Image | Phaser.GameObjects.Graphics {
  const toast = addImage(scene, 'v219-toast-storybook', x, y, width, height, depth, alpha);
  if (toast) return toast;
  return fallbackPanel(scene, x, y, width, height, depth, STORY_PINK);
}
