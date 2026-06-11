import Phaser from 'phaser';

type StageLikeNode = { x: number; y: number; radius?: number };
type BattleTheme = 'forest' | 'canyon' | 'swamp' | 'fortress' | string;

const SWEET_BLUE = 0x8fdcff;
const SWEET_GOLD = 0xffd56c;
const SWEET_PINK = 0xff9fb7;
const SWEET_GREEN = 0x9deb8c;

function has(scene: Phaser.Scene, key: string): boolean {
  return scene.textures.exists(key);
}

function addAsset(
  scene: Phaser.Scene,
  key: string,
  x: number,
  y: number,
  width: number,
  height: number,
  depth: number,
  alpha = 1
): Phaser.GameObjects.Image | undefined {
  if (!has(scene, key)) return undefined;
  return scene.add.image(x, y, key).setDisplaySize(width, height).setDepth(depth).setAlpha(alpha);
}

function breathe(scene: Phaser.Scene, target: Phaser.GameObjects.GameObject, amount = 1.035, duration = 1700, delay = 0): void {
  scene.tweens.add({
    targets: target,
    scaleX: amount,
    scaleY: amount,
    alpha: '+=0.04',
    duration,
    delay,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.easeInOut',
  });
}

function bob(scene: Phaser.Scene, target: Phaser.GameObjects.GameObject, offset = 5, duration = 1900, delay = 0): void {
  scene.tweens.add({
    targets: target,
    y: `-=${offset}`,
    duration,
    delay,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.easeInOut',
  });
}

function sparkle(scene: Phaser.Scene, x: number, y: number, size: number, depth: number, delay: number, tint = SWEET_GOLD): void {
  const key = has(scene, 'v2-cute-star-v216') ? 'v2-cute-star-v216' : undefined;
  const star = key
    ? scene.add.image(x, y, key).setDisplaySize(size, size).setDepth(depth).setTint(tint).setAlpha(0.78)
    : scene.add.star(x, y, 5, Math.max(2, size * 0.10), Math.max(5, size * 0.34), tint, 0.78).setDepth(depth);
  star.setBlendMode(Phaser.BlendModes.ADD);
  scene.tweens.add({
    targets: star,
    alpha: 0.24,
    angle: 28,
    scaleX: 0.82,
    scaleY: 0.82,
    duration: 1100 + delay * 70,
    delay,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.easeInOut',
  });
}

function fallbackPill(scene: Phaser.Scene, x: number, y: number, width: number, height: number, depth: number, color: number): Phaser.GameObjects.Graphics {
  const g = scene.add.graphics().setDepth(depth);
  g.fillStyle(0xffffff, 0.82).fillRoundedRect(x - width / 2, y - height / 2, width, height, height / 2);
  g.lineStyle(2, color, 0.72).strokeRoundedRect(x - width / 2, y - height / 2, width, height, height / 2);
  g.lineStyle(1, 0xffffff, 0.55).strokeRoundedRect(x - width / 2 + 5, y - height / 2 + 5, width - 10, height - 10, Math.max(4, height / 2 - 5));
  return g;
}

export function addCuteLoginAccents(scene: Phaser.Scene): void {
  const leftCloud = addAsset(scene, 'v2-cute-cloud-v216', 255, 150, 142, 74, 8, 0.90);
  const rightCloud = addAsset(scene, 'v2-cute-cloud-v216', 706, 151, 128, 67, 8, 0.82);
  if (leftCloud) bob(scene, leftCloud, 4, 2150, 120);
  if (rightCloud) bob(scene, rightCloud, 5, 2300, 440);

  const ribbon = addAsset(scene, 'v2-cute-ribbon-v216', 480, 214, 270, 57, 26, 0.97);
  if (ribbon) breathe(scene, ribbon, 1.012, 2200, 200);
  else fallbackPill(scene, 480, 214, 270, 44, 26, SWEET_GOLD);

  scene.add.text(480, 214, '말랑 왕국 방어대', {
    fontFamily: 'Pretendard, Noto Sans KR, NanumSquareRound, Arial, sans-serif',
    fontSize: '13px',
    fontStyle: 'bold',
    color: '#285997',
    stroke: '#ffffff',
    strokeThickness: 3,
    fixedWidth: 230,
    align: 'center',
  }).setOrigin(0.5).setDepth(27);

  const stickers = [
    [316, 258, 'v2-cute-star-v216', 38, SWEET_GOLD],
    [644, 258, 'v2-cute-heart-v216', 34, SWEET_PINK],
    [348, 452, 'v2-cute-gem-v216', 30, SWEET_BLUE],
    [612, 452, 'v2-cute-leaf-v216', 28, SWEET_GREEN],
  ] as const;
  stickers.forEach(([x, y, key, size, tint], index) => {
    const image = addAsset(scene, key, x, y, size, size, 32, 0.86);
    if (image) {
      image.setTint(tint);
      bob(scene, image, 3 + index, 1700 + index * 140, index * 130);
    }
  });

  for (let i = 0; i < 9; i += 1) {
    sparkle(scene, 164 + i * 78, 184 + ((i * 17) % 34), 18 + (i % 3) * 4, 7, i * 110, i % 2 ? SWEET_BLUE : SWEET_GOLD);
  }
}

export function addCuteLobbyAccents(scene: Phaser.Scene, nickname: string, stars: number): void {
  const ribbon = addAsset(scene, 'v2-cute-ribbon-v216', 480, 132, 316, 67, 10, 0.96);
  if (ribbon) breathe(scene, ribbon, 1.012, 2400, 180);
  else fallbackPill(scene, 480, 132, 318, 48, 10, SWEET_GOLD);

  scene.add.text(480, 127, '오늘도 반짝 방어 준비 완료', {
    fontFamily: 'Pretendard, Noto Sans KR, NanumSquareRound, Arial, sans-serif',
    fontSize: '14px',
    fontStyle: 'bold',
    color: '#244f8c',
    stroke: '#ffffff',
    strokeThickness: 3,
    align: 'center',
    fixedWidth: 300,
  }).setOrigin(0.5).setDepth(11);
  scene.add.text(480, 148, `${nickname} · 별 ${stars}개`, {
    fontFamily: 'Pretendard, Noto Sans KR, NanumSquareRound, Arial, sans-serif',
    fontSize: '9px',
    fontStyle: 'bold',
    color: '#6f7fa5',
    stroke: '#ffffff',
    strokeThickness: 2,
    align: 'center',
    fixedWidth: 260,
  }).setOrigin(0.5).setDepth(11);

  const left = addAsset(scene, 'v2-cute-tower-badge-v216', 204, 148, 70, 70, 10, 0.95);
  const right = addAsset(scene, 'v2-cute-monster-badge-v216', 756, 149, 70, 70, 10, 0.93);
  if (left) bob(scene, left, 4, 2100, 240);
  if (right) bob(scene, right, 4, 2240, 480);

  const corners = [
    [45, 74, 'v2-cute-cloud-v216', 110, 57],
    [914, 76, 'v2-cute-cloud-v216', 106, 55],
    [226, 438, 'v2-cute-star-v216', 30, 30],
    [734, 438, 'v2-cute-heart-v216', 28, 28],
  ] as const;
  corners.forEach(([x, y, key, w, h], index) => {
    const image = addAsset(scene, key, x, y, w, h, 6, 0.74);
    if (image) bob(scene, image, 3 + index, 1800 + index * 120, index * 160);
  });

  for (let i = 0; i < 12; i += 1) {
    sparkle(scene, 210 + i * 50, 86 + ((i * 31) % 38), 16 + (i % 3) * 3, 5, i * 90, i % 2 ? SWEET_PINK : SWEET_GOLD);
  }
}

export function addCuteWorldMapAccents(scene: Phaser.Scene, stageNodes: StageLikeNode[]): void {
  const panel = addAsset(scene, 'v2-cute-panel-v216', 815, 224, 236, 150, 20, 0.94);
  if (panel) breathe(scene, panel, 1.006, 2600, 120);

  const titleRibbon = addAsset(scene, 'v2-cute-ribbon-v216', 480, 83, 270, 57, 18, 0.94);
  if (titleRibbon) breathe(scene, titleRibbon, 1.008, 2300, 300);
  scene.add.text(480, 83, '스티커 월드맵', {
    fontFamily: 'Pretendard, Noto Sans KR, NanumSquareRound, Arial, sans-serif',
    fontSize: '13px',
    fontStyle: 'bold',
    color: '#255a91',
    stroke: '#ffffff',
    strokeThickness: 3,
    fixedWidth: 228,
    align: 'center',
  }).setOrigin(0.5).setDepth(19).setAlpha(0.96);

  stageNodes.forEach((node, index) => {
    const pin = addAsset(scene, 'v2-cute-stage-pin-v216', node.x, node.y + 1, (node.radius ?? 24) * 2.14, (node.radius ?? 24) * 2.14, 17, 0.74);
    if (pin) {
      pin.setTint(index % 3 === 0 ? SWEET_GOLD : index % 3 === 1 ? SWEET_BLUE : SWEET_GREEN);
      scene.tweens.add({ targets: pin, y: node.y - 2, duration: 1650 + index * 35, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    }
  });

  const travelDecor = [
    [250, 156, 'v2-cute-cloud-v216', 120, 62],
    [650, 142, 'v2-cute-cloud-v216', 104, 54],
    [698, 392, 'v2-cute-gem-v216', 30, 30],
    [397, 230, 'v2-cute-leaf-v216', 28, 28],
  ] as const;
  travelDecor.forEach(([x, y, key, w, h], index) => {
    const image = addAsset(scene, key, x, y, w, h, 12, 0.68);
    if (image) bob(scene, image, 4 + index, 2200 + index * 180, 180 * index);
  });
}

export function addCuteBattleAccents(scene: Phaser.Scene, theme: BattleTheme): void {
  const themeTint = theme === 'canyon' ? 0xffc16b : theme === 'swamp' ? 0x9deb8c : theme === 'fortress' ? 0xff9fb7 : 0x8fdcff;

  const topRibbon = addAsset(scene, 'v2-cute-ribbon-v216', 480, 62, 210, 44, 68, 0.62);
  if (topRibbon) topRibbon.setTint(themeTint);
  scene.add.text(480, 62, '말랑 전술 모드', {
    fontFamily: 'Pretendard, Noto Sans KR, NanumSquareRound, Arial, sans-serif',
    fontSize: '9px',
    fontStyle: 'bold',
    color: '#f8fbff',
    stroke: '#17366c',
    strokeThickness: 3,
    fixedWidth: 180,
    align: 'center',
  }).setOrigin(0.5).setDepth(69).setAlpha(0.72);

  const left = addAsset(scene, 'v2-cute-tower-badge-v216', 44, 454, 50, 50, 69, 0.78);
  const right = addAsset(scene, 'v2-cute-monster-badge-v216', 916, 454, 50, 50, 69, 0.74);
  if (left) bob(scene, left, 3, 1800, 60);
  if (right) bob(scene, right, 3, 1900, 360);

  const charmPositions = [
    [190, 496, 'v2-cute-star-v216', SWEET_GOLD],
    [288, 496, 'v2-cute-gem-v216', SWEET_BLUE],
    [672, 496, 'v2-cute-heart-v216', SWEET_PINK],
    [770, 496, 'v2-cute-leaf-v216', SWEET_GREEN],
  ] as const;
  charmPositions.forEach(([x, y, key, tint], index) => {
    const item = addAsset(scene, key, x, y, 24, 24, 72, 0.78);
    if (item) {
      item.setTint(tint);
      bob(scene, item, 2 + index * 0.5, 1500 + index * 120, index * 130);
    }
  });

  for (let i = 0; i < 8; i += 1) {
    sparkle(scene, 110 + i * 105, 82 + ((i * 23) % 28), 14 + (i % 2) * 4, 6, i * 95, i % 2 ? themeTint : SWEET_GOLD);
  }
}
