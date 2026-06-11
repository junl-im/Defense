import Phaser from 'phaser';

export const V218_VERSION_LABEL = 'v2.18.0 MASSIVE CUTE ART QA';

type StageNodeLike = { x: number; y: number; radius?: number };
type BattleTheme = 'forest' | 'canyon' | 'swamp' | 'fortress' | string;
type Placement = readonly [key: string, x: number, y: number, width: number, height: number, depth: number, alpha?: number, tint?: number];

const SWEET_GOLD = 0xffd66c;
const SWEET_BLUE = 0x86d7ff;
const SWEET_PINK = 0xff9cba;
const SWEET_GREEN = 0x96e884;
const SOFT_CREAM = 0xfff7df;

function has(scene: Phaser.Scene, key: string): boolean {
  return scene.textures.exists(key);
}

function image(scene: Phaser.Scene, key: string, x: number, y: number, width: number, height: number, depth: number, alpha = 1, tint?: number): Phaser.GameObjects.Image | undefined {
  if (!has(scene, key)) return undefined;
  const sprite = scene.add.image(x, y, key).setDisplaySize(width, height).setDepth(depth).setAlpha(alpha);
  if (tint !== undefined) sprite.setTint(tint);
  return sprite;
}

function many(scene: Phaser.Scene, placements: readonly Placement[]): Phaser.GameObjects.Image[] {
  return placements.flatMap(([key, x, y, width, height, depth, alpha = 1, tint]) => {
    const sprite = image(scene, key, x, y, width, height, depth, alpha, tint);
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

function breathe(scene: Phaser.Scene, target: Phaser.GameObjects.GameObject, scale = 1.018, duration = 2400, delay = 0): void {
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

function shimmer(scene: Phaser.Scene, key: string, area: Phaser.Geom.Rectangle, depth: number, count: number, tint: readonly number[]): void {
  for (let i = 0; i < count; i += 1) {
    const x = area.x + ((i * 73) % Math.max(1, area.width));
    const y = area.y + ((i * 43) % Math.max(1, area.height));
    const width = 42 + (i % 3) * 12;
    const sprite = image(scene, key, x, y, width, Math.max(22, width * 0.56), depth, 0.22 + (i % 3) * 0.045, tint[i % tint.length]);
    if (sprite) {
      sprite.setBlendMode(Phaser.BlendModes.ADD);
      bob(scene, sprite, 2 + (i % 4), 1700 + i * 80, i * 90);
    } else {
      const fallback = scene.add.star(x, y, 5, 2, 5 + (i % 4), tint[i % tint.length], 0.22).setDepth(depth).setBlendMode(Phaser.BlendModes.ADD);
      bob(scene, fallback, 2 + (i % 4), 1700 + i * 80, i * 90);
    }
  }
}

function fallbackPanel(scene: Phaser.Scene, x: number, y: number, width: number, height: number, depth: number, tint: number): Phaser.GameObjects.Graphics {
  const g = scene.add.graphics().setDepth(depth);
  g.fillStyle(0xfff7df, 0.74).fillRoundedRect(x - width / 2, y - height / 2, width, height, 24);
  g.lineStyle(2, tint, 0.66).strokeRoundedRect(x - width / 2, y - height / 2, width, height, 24);
  g.lineStyle(1, 0xffffff, 0.38).strokeRoundedRect(x - width / 2 + 7, y - height / 2 + 7, width - 14, height - 14, 18);
  return g;
}

function themeTint(theme: BattleTheme): number {
  if (theme === 'canyon') return 0xffc16b;
  if (theme === 'swamp') return SWEET_GREEN;
  if (theme === 'fortress') return SWEET_PINK;
  return SWEET_BLUE;
}

export function addV218LoginArt(scene: Phaser.Scene): void {
  const arch = image(scene, 'v218-login-cloud-arch', 480, 327, 402, 128, 18, 0.54);
  if (arch) breathe(scene, arch, 1.006, 2600, 80);

  const ribbon = image(scene, 'v218-nursery-header-ribbon', 480, 214, 300, 70, 27, 0.82);
  if (ribbon) breathe(scene, ribbon, 1.008, 2300, 160);

  const bunny = image(scene, 'v218-mascot-bunny', 278, 430, 76, 82, 34, 0.92);
  const dragon = image(scene, 'v218-mascot-puff-dragon', 684, 432, 82, 75, 34, 0.88);
  if (bunny) bob(scene, bunny, 4, 2300, 120);
  if (dragon) bob(scene, dragon, 5, 2450, 420);

  many(scene, [
    ['v218-login-stamp-quick', 329, 345, 44, 44, 62, 0.88],
    ['v218-login-stamp-google', 631, 394, 42, 42, 62, 0.86],
    ['v218-fairy-house', 105, 458, 78, 74, 8, 0.66],
    ['v218-slime-crown', 854, 456, 70, 62, 8, 0.62],
    ['v218-mail-heart-icon', 818, 39, 32, 32, 59, 0.84],
    ['v218-gmark-soft-icon', 872, 39, 32, 32, 59, 0.82],
    ['v218-settings-cog-soft', 926, 39, 32, 32, 59, 0.82],
    ['v218-tiny-heart-spray', 480, 488, 124, 70, 35, 0.34],
    ['v218-fairy-wing-pair', 480, 258, 88, 62, 29, 0.30, SWEET_BLUE],
  ]).forEach((sprite, index) => bob(scene, sprite, 2 + (index % 3), 1900 + index * 90, index * 80));

  shimmer(scene, 'v218-tiny-star-spray', new Phaser.Geom.Rectangle(150, 126, 660, 94), 7, 8, [SWEET_GOLD, SWEET_BLUE, SWEET_PINK]);
}

export function addV218LobbyArt(scene: Phaser.Scene, nickname: string, stars: number): void {
  const quest = image(scene, 'v218-lobby-quest-scroll', 480, 386, 196, 108, 13, 0.50);
  if (quest) breathe(scene, quest, 1.006, 2700, 180);

  const shop = image(scene, 'v218-lobby-shop-awning', 86, 244, 132, 66, 8, 0.52);
  if (shop) bob(scene, shop, 2, 2300, 120);

  many(scene, [
    ['v218-resource-shell-coin', 448, 35, 30, 30, 10, 0.90],
    ['v218-resource-shell-gem', 586, 35, 30, 30, 10, 0.90],
    ['v218-resource-shell-heart', 716, 35, 30, 30, 10, 0.86],
    ['v218-gold-ticket', 208, 501, 148, 50, 8, 0.40],
    ['v218-blue-ticket', 752, 501, 148, 50, 8, 0.36],
    ['v218-scallop-button-gold', 480, 501, 174, 52, 8, 0.32],
    ['v218-mascot-bunny', 206, 356, 60, 66, 14, 0.82],
    ['v218-mascot-puff-dragon', 754, 354, 68, 62, 14, 0.80],
    ['v218-acorn-shield', 44, 188, 40, 40, 9, 0.70],
    ['v218-little-sword-badge', 166, 188, 40, 40, 9, 0.70],
    ['v218-mobile-thumb-hint', 908, 36, 38, 38, 10, 0.72],
    ['v218-tiny-leaf-spray', 810, 464, 128, 72, 6, 0.28],
  ]).forEach((sprite, index) => bob(scene, sprite, 2 + (index % 3), 1850 + index * 90, index * 80));

  scene.add.text(480, 381, `${nickname} 왕국 확장 중`, {
    fontFamily: 'Pretendard, Noto Sans KR, NanumSquareRound, Arial, sans-serif',
    fontSize: '9px',
    fontStyle: 'bold',
    color: '#f8fbff',
    stroke: '#17366c',
    strokeThickness: 3,
    fixedWidth: 180,
    align: 'center',
  }).setOrigin(0.5).setDepth(15).setAlpha(0.74);

  scene.add.text(480, 397, `누적 별 ${stars}`, {
    fontFamily: 'Pretendard, Noto Sans KR, NanumSquareRound, Arial, sans-serif',
    fontSize: '8px',
    fontStyle: 'bold',
    color: '#fff0b8',
    stroke: '#17366c',
    strokeThickness: 2,
    fixedWidth: 140,
    align: 'center',
  }).setOrigin(0.5).setDepth(15).setAlpha(0.70);

  shimmer(scene, 'v218-tiny-star-spray', new Phaser.Geom.Rectangle(184, 82, 610, 76), 5, 10, [SWEET_GOLD, SWEET_BLUE, SWEET_PINK, SWEET_GREEN]);
}

export function addV218WorldMapArt(scene: Phaser.Scene, stageNodes: readonly StageNodeLike[]): void {
  const previewFrame = image(scene, 'v218-worldmap-preview-frame', 815, 281, 268, 230, 18, 0.72);
  if (previewFrame) breathe(scene, previewFrame, 1.004, 2800, 110);

  stageNodes.forEach((node, index) => {
    const radius = node.radius ?? 24;
    const glow = image(scene, 'v218-selected-stage-glow', node.x, node.y, radius * 2.6, radius * 2.6, 13, 0.26, index % 3 === 0 ? SWEET_GOLD : index % 3 === 1 ? SWEET_BLUE : SWEET_GREEN);
    if (glow) {
      scene.tweens.add({ targets: glow, scaleX: 1.07, scaleY: 1.07, alpha: 0.38, duration: 1300 + index * 60, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    }
    if (index % 3 === 1) {
      const crown = image(scene, 'v218-worldmap-node-crown', node.x, node.y - radius - 13, 30, 30, 26, 0.46, SWEET_GOLD);
      if (crown) bob(scene, crown, 2, 1900 + index * 80, index * 60);
    }
    if (index < stageNodes.length - 1 && index % 2 === 0) {
      const next = stageNodes[index + 1];
      const x = Phaser.Math.Linear(node.x, next.x, 0.5);
      const y = Phaser.Math.Linear(node.y, next.y, 0.5) - 2;
      const bridge = image(scene, 'v218-worldmap-path-bridge', x, y, 58, 38, 12, 0.34, index % 4 === 0 ? SWEET_GOLD : SWEET_BLUE);
      if (bridge) bridge.setRotation(Phaser.Math.Angle.Between(node.x, node.y, next.x, next.y) * 0.16);
    }
  });

  many(scene, [
    ['v218-worldmap-cloud-island', 236, 138, 160, 58, 8, 0.34],
    ['v218-worldmap-cloud-island', 644, 112, 146, 54, 8, 0.30],
    ['v218-mascot-bunny', 132, 153, 54, 60, 14, 0.76],
    ['v218-mascot-puff-dragon', 648, 430, 62, 56, 14, 0.70],
    ['v218-locked-stage-padlock', 878, 424, 34, 34, 28, 0.42],
    ['v218-tiny-leaf-spray', 286, 510, 156, 86, 8, 0.28],
    ['v218-tiny-star-spray', 816, 360, 132, 76, 24, 0.30],
  ]).forEach((sprite, index) => bob(scene, sprite, 2 + (index % 3), 1900 + index * 100, index * 100));

  shimmer(scene, 'v218-tiny-star-spray', new Phaser.Geom.Rectangle(230, 118, 650, 318), 7, 12, [SWEET_GOLD, SWEET_BLUE, SWEET_GREEN]);
}

export function addV218BattleArt(scene: Phaser.Scene, theme: BattleTheme): void {
  const tint = themeTint(theme);

  const hudLace = image(scene, 'v218-battle-hud-lace-top', 480, 62, 306, 70, 66, 0.48, tint);
  if (hudLace) breathe(scene, hudLace, 1.004, 2600, 120);

  image(scene, 'v218-battle-skill-tray', 238, 505, 416, 82, 77, 0.34);
  image(scene, 'v218-battle-wave-flag', 704, 504, 106, 72, 77, 0.34, tint);

  many(scene, [
    ['v218-battle-spell-meteor-orb', 38, 504, 36, 36, 83, 0.52],
    ['v218-battle-spell-guard-orb', 180, 504, 36, 36, 83, 0.50],
    ['v218-battle-spell-hero-orb', 324, 504, 36, 36, 83, 0.50],
    ['v218-battle-corner-leaf', 56, 98, 86, 86, 4, 0.26, tint],
    ['v218-battle-corner-leaf', 906, 424, 86, 86, 4, 0.24, tint],
    ['v218-acorn-shield', 626, 27, 30, 30, 83, 0.50],
    ['v218-progress-bead', 724, 27, 24, 24, 83, 0.48],
    ['v218-mobile-thumb-hint', 888, 27, 28, 28, 83, 0.36],
    ['v218-tiny-heart-spray', 480, 116, 150, 78, 5, 0.18, tint],
  ]).forEach((sprite, index) => {
    if (index >= 3) bob(scene, sprite, 2 + (index % 2), 1700 + index * 90, index * 80);
  });

  shimmer(scene, 'v218-tiny-star-spray', new Phaser.Geom.Rectangle(96, 94, 768, 342), 5, 8, [tint, SWEET_GOLD, SOFT_CREAM]);
}

export function addV218ToastFrame(scene: Phaser.Scene, x: number, y: number, width: number, height: number, depth: number, alpha = 0.90): Phaser.GameObjects.Image | Phaser.GameObjects.Graphics {
  const toast = image(scene, 'v218-toast-marshmallow', x, y, width, height, depth, alpha);
  if (toast) return toast;
  return fallbackPanel(scene, x, y, width, height, depth, SWEET_PINK);
}
