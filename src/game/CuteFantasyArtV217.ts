import Phaser from 'phaser';

export const V217_VERSION_LABEL = 'v2.17.0 CUTE MEGA ART QA';

type StageNodeLike = { x: number; y: number; radius?: number };
type BattleTheme = 'forest' | 'canyon' | 'swamp' | 'fortress' | string;

type AssetPlacement = readonly [key: string, x: number, y: number, width: number, height: number, depth: number, alpha?: number, tint?: number];

const SWEET_GOLD = 0xffd66c;
const SWEET_BLUE = 0x86d7ff;
const SWEET_PINK = 0xff9cba;
const SWEET_GREEN = 0x96e884;
const SWEET_CREAM = 0xfff7df;

function exists(scene: Phaser.Scene, key: string): boolean {
  return scene.textures.exists(key);
}

function addImage(scene: Phaser.Scene, key: string, x: number, y: number, width: number, height: number, depth: number, alpha = 1, tint?: number): Phaser.GameObjects.Image | undefined {
  if (!exists(scene, key)) return undefined;
  const image = scene.add.image(x, y, key).setDisplaySize(width, height).setDepth(depth).setAlpha(alpha);
  if (tint !== undefined) image.setTint(tint);
  return image;
}

function addMany(scene: Phaser.Scene, placements: readonly AssetPlacement[]): Phaser.GameObjects.Image[] {
  return placements.flatMap(([key, x, y, width, height, depth, alpha = 1, tint]) => {
    const image = addImage(scene, key, x, y, width, height, depth, alpha, tint);
    return image ? [image] : [];
  });
}

function softPulse(scene: Phaser.Scene, target: Phaser.GameObjects.GameObject, scale = 1.025, duration = 1900, delay = 0): void {
  scene.tweens.add({
    targets: target,
    scaleX: scale,
    scaleY: scale,
    alpha: '+=0.035',
    duration,
    delay,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.easeInOut',
  });
}

function bob(scene: Phaser.Scene, target: Phaser.GameObjects.GameObject, amount = 4, duration = 2100, delay = 0): void {
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

function driftSparkles(scene: Phaser.Scene, depth: number, count: number, area: Phaser.Geom.Rectangle, colors: readonly number[]): void {
  for (let i = 0; i < count; i += 1) {
    const x = area.x + ((i * 67) % Math.max(1, area.width));
    const y = area.y + ((i * 41) % Math.max(1, area.height));
    const size = 10 + (i % 4) * 3;
    const star = addImage(scene, 'v217-sparkle-cluster', x, y, size * 3.0, Math.max(16, size * 1.8), depth, 0.18 + (i % 3) * 0.05, colors[i % colors.length]);
    if (!star) {
      const fallback = scene.add.star(x, y, 5, 2, size * 0.5, colors[i % colors.length], 0.28).setDepth(depth).setBlendMode(Phaser.BlendModes.ADD);
      bob(scene, fallback, 3, 1700 + i * 90, i * 70);
      continue;
    }
    star.setBlendMode(Phaser.BlendModes.ADD);
    bob(scene, star, 3 + (i % 3), 1700 + i * 75, i * 75);
  }
}

function addFallbackPanel(scene: Phaser.Scene, x: number, y: number, width: number, height: number, depth: number, accent: number): Phaser.GameObjects.Graphics {
  const g = scene.add.graphics().setDepth(depth);
  g.fillStyle(0xfff7df, 0.78).fillRoundedRect(x - width / 2, y - height / 2, width, height, 24);
  g.lineStyle(2, accent, 0.65).strokeRoundedRect(x - width / 2, y - height / 2, width, height, 24);
  g.lineStyle(1, 0xffffff, 0.45).strokeRoundedRect(x - width / 2 + 8, y - height / 2 + 8, width - 16, height - 16, 18);
  return g;
}

export function addV217LoginArt(scene: Phaser.Scene): void {
  const banner = addImage(scene, 'v217-title-banner', 480, 204, 334, 84, 25, 0.92);
  if (banner) softPulse(scene, banner, 1.01, 2400, 120);

  const leftFairy = addImage(scene, 'v217-mascot-fairy', 292, 463, 66, 66, 35, 0.92);
  const rightSlime = addImage(scene, 'v217-mascot-slime', 666, 463, 66, 66, 35, 0.90);
  if (leftFairy) bob(scene, leftFairy, 5, 2100, 160);
  if (rightSlime) bob(scene, rightSlime, 4, 2300, 440);

  addMany(scene, [
    ['v217-flower-corner', 80, 478, 94, 94, 7, 0.72],
    ['v217-flower-corner', 882, 474, 94, 94, 7, 0.66],
    ['v217-leaf-vine', 480, 520, 214, 70, 6, 0.62],
    ['v217-gem-cluster', 364, 296, 44, 44, 36, 0.84],
    ['v217-gem-cluster', 596, 296, 44, 44, 36, 0.84],
    ['v217-soft-divider', 480, 232, 214, 20, 35, 0.82],
  ]).forEach((image, index) => bob(scene, image, index % 2 ? 3 : 2, 1800 + index * 140, index * 110));

  driftSparkles(scene, 8, 9, new Phaser.Geom.Rectangle(150, 145, 660, 68), [SWEET_GOLD, SWEET_BLUE, SWEET_PINK]);
}

export function addV217LobbyArt(scene: Phaser.Scene, nickname: string, stars: number): void {
  const featurePanel = addImage(scene, 'v217-dreamy-panel-wide', 480, 392, 354, 104, 12, 0.34);
  if (featurePanel) softPulse(scene, featurePanel, 1.006, 2600, 90);

  const topDivider = addImage(scene, 'v217-soft-divider', 480, 176, 244, 22, 11, 0.72);
  if (topDivider) bob(scene, topDivider, 2, 2100, 220);

  addMany(scene, [
    ['v217-mascot-tower', 246, 354, 64, 64, 13, 0.88],
    ['v217-mascot-fairy', 714, 354, 62, 62, 13, 0.84],
    ['v217-badge-coin', 518, 35, 34, 34, 10, 0.92],
    ['v217-badge-star', 650, 35, 34, 34, 10, 0.92],
    ['v217-badge-heart', 784, 35, 34, 34, 10, 0.90],
    ['v217-flower-corner', 38, 520, 82, 82, 6, 0.52],
    ['v217-leaf-vine', 822, 508, 170, 56, 6, 0.52],
    ['v217-gem-cluster', 145, 175, 42, 42, 9, 0.72],
    ['v217-gem-cluster', 818, 83, 42, 42, 9, 0.70],
  ]).forEach((image, index) => bob(scene, image, 2 + (index % 3), 1900 + index * 100, index * 80));

  const tag = addImage(scene, 'v217-shop-tag', 480, 232, 94, 42, 14, 0.86);
  if (tag) softPulse(scene, tag, 1.02, 1800, 500);
  scene.add.text(480, 232, `별 ${stars}`, {
    fontFamily: 'Pretendard, Noto Sans KR, NanumSquareRound, Arial, sans-serif',
    fontSize: '10px',
    fontStyle: 'bold',
    color: '#284f92',
    stroke: '#ffffff',
    strokeThickness: 3,
    fixedWidth: 80,
    align: 'center',
  }).setOrigin(0.5).setDepth(15).setAlpha(0.94);

  scene.add.text(480, 252, `${nickname}의 말랑 왕국`, {
    fontFamily: 'Pretendard, Noto Sans KR, NanumSquareRound, Arial, sans-serif',
    fontSize: '9px',
    fontStyle: 'bold',
    color: '#f8fbff',
    stroke: '#17366c',
    strokeThickness: 3,
    fixedWidth: 210,
    align: 'center',
  }).setOrigin(0.5).setDepth(15).setAlpha(0.72);

  driftSparkles(scene, 5, 14, new Phaser.Geom.Rectangle(150, 70, 660, 80), [SWEET_GOLD, SWEET_BLUE, SWEET_PINK, SWEET_GREEN]);
}

export function addV217WorldMapArt(scene: Phaser.Scene, stageNodes: readonly StageNodeLike[]): void {
  const preview = addImage(scene, 'v217-dreamy-panel-wide', 815, 282, 246, 216, 19, 0.56);
  if (preview) softPulse(scene, preview, 1.004, 2600, 120);

  stageNodes.forEach((node, index) => {
    const halo = addImage(scene, 'v217-stage-frame', node.x, node.y, (node.radius ?? 24) * 2.55, (node.radius ?? 24) * 2.55, 15, 0.54, index % 4 === 0 ? SWEET_GOLD : index % 4 === 1 ? SWEET_BLUE : index % 4 === 2 ? SWEET_GREEN : SWEET_PINK);
    if (halo) {
      scene.tweens.add({ targets: halo, scaleX: 1.04, scaleY: 1.04, alpha: 0.68, duration: 1500 + index * 70, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    }
    if (index < stageNodes.length - 1) {
      const next = stageNodes[index + 1];
      const dotCount = 2;
      for (let dot = 1; dot <= dotCount; dot += 1) {
        const t = dot / (dotCount + 1);
        const x = Phaser.Math.Linear(node.x, next.x, t);
        const y = Phaser.Math.Linear(node.y, next.y, t);
        addImage(scene, 'v217-stage-route-dot', x, y, 22, 22, 14, 0.36 + dot * 0.06, dot % 2 ? SWEET_BLUE : SWEET_GOLD);
      }
    }
  });

  addMany(scene, [
    ['v217-title-banner', 480, 83, 300, 75, 17, 0.54],
    ['v217-mascot-fairy', 145, 152, 58, 58, 13, 0.74],
    ['v217-mascot-slime', 640, 438, 62, 62, 13, 0.72],
    ['v217-flower-corner', 54, 492, 92, 92, 8, 0.50],
    ['v217-leaf-vine', 284, 508, 196, 64, 8, 0.48],
    ['v217-gem-cluster', 918, 166, 50, 50, 21, 0.76],
    ['v217-soft-divider', 815, 358, 194, 18, 23, 0.68],
  ]).forEach((image, index) => bob(scene, image, 2 + (index % 3), 1900 + index * 130, index * 120));

  driftSparkles(scene, 7, 13, new Phaser.Geom.Rectangle(228, 122, 660, 300), [SWEET_GOLD, SWEET_BLUE, SWEET_GREEN]);
}

export function addV217BattleArt(scene: Phaser.Scene, theme: BattleTheme): void {
  const themeTint = theme === 'canyon' ? 0xffc16b : theme === 'swamp' ? SWEET_GREEN : theme === 'fortress' ? SWEET_PINK : SWEET_BLUE;

  addImage(scene, 'v217-battle-top-badge', 480, 63, 250, 58, 67, 0.52, themeTint);
  addImage(scene, 'v217-battle-bottom-cushion', 238, 504, 368, 72, 78, 0.42);
  addImage(scene, 'v217-wave-hint-panel', 746, 504, 342, 70, 78, 0.32, themeTint);

  addMany(scene, [
    ['v217-spell-card-meteor', 88, 504, 134, 44, 82, 0.52],
    ['v217-spell-card-guard', 232, 504, 134, 44, 82, 0.52],
    ['v217-spell-card-hero', 376, 504, 134, 44, 82, 0.52],
    ['v217-leaf-vine', 121, 79, 150, 48, 4, 0.36, themeTint],
    ['v217-leaf-vine', 836, 432, 150, 48, 4, 0.34, themeTint],
    ['v217-badge-heart', 46, 505, 36, 36, 83, 0.66],
    ['v217-badge-star', 914, 505, 36, 36, 83, 0.66],
    ['v217-alert-badge', 724, 28, 28, 28, 83, 0.44],
  ]).forEach((image, index) => {
    if (index >= 3) bob(scene, image, 2 + (index % 2), 1800 + index * 100, index * 100);
  });

  scene.add.text(480, 63, '말랑 대규모 QA 모드', {
    fontFamily: 'Pretendard, Noto Sans KR, NanumSquareRound, Arial, sans-serif',
    fontSize: '9px',
    fontStyle: 'bold',
    color: '#f8fbff',
    stroke: '#17366c',
    strokeThickness: 3,
    fixedWidth: 220,
    align: 'center',
  }).setOrigin(0.5).setDepth(68).setAlpha(0.62);

  driftSparkles(scene, 5, 8, new Phaser.Geom.Rectangle(85, 95, 790, 330), [themeTint, SWEET_GOLD, SWEET_CREAM]);
}

export function addV217ToastBubble(scene: Phaser.Scene, x: number, y: number, width: number, height: number, depth: number, alpha = 0.94): Phaser.GameObjects.Image | Phaser.GameObjects.Graphics {
  const image = addImage(scene, 'v217-toast-bubble', x, y, width, height, depth, alpha);
  if (image) return image;
  return addFallbackPanel(scene, x, y, width, height, depth, SWEET_GOLD);
}
