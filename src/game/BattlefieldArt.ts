import Phaser from 'phaser';
import { lowPowerMode } from './QualityManager';
import type { StageConfig } from './types';

function seeded(seed: number): () => number {
  let value = seed % 2147483647;
  if (value <= 0) value += 2147483646;
  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

function distanceToPath(x: number, y: number, path: StageConfig['path']): number {
  let best = Number.POSITIVE_INFINITY;
  for (let i = 0; i < path.length - 1; i += 1) {
    const a = path[i];
    const b = path[i + 1];
    const vx = b.x - a.x;
    const vy = b.y - a.y;
    const wx = x - a.x;
    const wy = y - a.y;
    const c1 = vx * wx + vy * wy;
    const c2 = vx * vx + vy * vy;
    const t = Phaser.Math.Clamp(c1 / Math.max(1, c2), 0, 1);
    const px = a.x + vx * t;
    const py = a.y + vy * t;
    best = Math.min(best, Phaser.Math.Distance.Between(x, y, px, py));
  }
  return best;
}

function placeable(x: number, y: number, stage: StageConfig): boolean {
  if (y < 74 || y > 456) return false;
  if (distanceToPath(x, y, stage.path) < 68) return false;
  return !stage.spots.some((spot) => Phaser.Math.Distance.Between(x, y, spot.x, spot.y) < 58);
}

function drawIsoRock(scene: Phaser.Scene, x: number, y: number, scale: number, tint: number): void {
  scene.add.ellipse(x + 4, y + 15, 42 * scale, 13 * scale, 0x000000, 0.22).setDepth(6);
  const base = scene.add.polygon(x, y, [
    -19 * scale, 5 * scale,
    -7 * scale, -14 * scale,
    12 * scale, -11 * scale,
    24 * scale, 2 * scale,
    9 * scale, 17 * scale,
    -13 * scale, 17 * scale,
  ], tint, 0.95).setStrokeStyle(1, 0x100c09, 0.36).setDepth(7);
  scene.add.polygon(x - 4 * scale, y - 2 * scale, [
    -12 * scale, 3 * scale,
    -4 * scale, -10 * scale,
    7 * scale, -7 * scale,
    1 * scale, 3 * scale,
  ], 0xffffff, 0.12).setDepth(8);
  scene.add.polygon(x + 8 * scale, y + 8 * scale, [
    -3 * scale, -3 * scale,
    14 * scale, -6 * scale,
    7 * scale, 7 * scale,
    -8 * scale, 8 * scale,
  ], 0x000000, 0.14).setDepth(8);
  base.setData('decor', true);
}

function drawIsoTree(scene: Phaser.Scene, x: number, y: number, scale: number, leaf: number): void {
  scene.add.ellipse(x + 5, y + 20, 48 * scale, 14 * scale, 0x000000, 0.22).setDepth(6);
  scene.add.rectangle(x, y + 10 * scale, 8 * scale, 25 * scale, 0x6a3e1f, 0.98).setDepth(7);
  scene.add.circle(x, y - 6 * scale, 20 * scale, leaf, 0.98).setDepth(9);
  scene.add.circle(x - 13 * scale, y, 14 * scale, leaf, 0.92).setDepth(9);
  scene.add.circle(x + 12 * scale, y + 2 * scale, 15 * scale, leaf, 0.92).setDepth(9);
  scene.add.circle(x - 7 * scale, y - 14 * scale, 10 * scale, 0xffffff, 0.1).setDepth(10);
}

function drawCrate(scene: Phaser.Scene, x: number, y: number, scale: number): void {
  scene.add.ellipse(x + 4, y + 16, 44 * scale, 12 * scale, 0x000000, 0.22).setDepth(6);
  scene.add.rectangle(x, y, 34 * scale, 28 * scale, 0x8a552a, 0.96).setStrokeStyle(2, 0x2a1508, 0.38).setDepth(7);
  scene.add.line(x, y, -15 * scale, -10 * scale, 15 * scale, 10 * scale, 0xf0b36c, 0.38).setLineWidth(3).setDepth(8);
  scene.add.line(x, y, 15 * scale, -10 * scale, -15 * scale, 10 * scale, 0x3a1b0b, 0.3).setLineWidth(3).setDepth(8);
}

function drawInfernalObelisk(scene: Phaser.Scene, x: number, y: number, scale: number): void {
  scene.add.ellipse(x + 5, y + 24, 58 * scale, 18 * scale, 0x000000, 0.25).setDepth(6);
  scene.add.polygon(x, y, [
    -12 * scale, 22 * scale,
    -9 * scale, -22 * scale,
    0, -34 * scale,
    11 * scale, -22 * scale,
    14 * scale, 22 * scale,
  ], 0x2c1a25, 1).setStrokeStyle(2, 0xff5a36, 0.24).setDepth(8);
  scene.add.circle(x, y - 12 * scale, 5 * scale, 0xff8a3a, 0.42).setDepth(9);
}

export function addPremiumBattleObjects(scene: Phaser.Scene, stage: StageConfig): void {
  const rand = seeded(stage.number * 991 + stage.path.length * 17);
  const theme = stage.theme;
  const leaf = theme === 'swamp' ? 0x315b43 : theme === 'canyon' ? 0x8b5032 : theme === 'fortress' ? 0x3b3040 : 0x2f6d3a;
  const rock = theme === 'canyon' ? 0x9c6040 : theme === 'swamp' ? 0x4b5b51 : theme === 'fortress' ? 0x48414a : 0x6c6d61;

  const decorCount = lowPowerMode() ? 12 : 44;
  for (let i = 0; i < decorCount; i += 1) {
    const x = 40 + rand() * 880;
    const y = 84 + rand() * 360;
    if (!placeable(x, y, stage)) continue;
    const scale = 0.65 + rand() * 0.55;
    const pick = rand();
    if (theme === 'fortress' && pick > 0.46) drawInfernalObelisk(scene, x, y, scale * 0.9);
    else if (pick < 0.38 && theme !== 'canyon') drawIsoTree(scene, x, y, scale, leaf);
    else if (pick < 0.7) drawIsoRock(scene, x, y, scale, rock);
    else drawCrate(scene, x, y, scale * 0.85);
  }

  // 길 주변 하이라이트와 2.5D 깊이감.
  if (lowPowerMode()) return;
  for (let i = 0; i < stage.path.length; i += 1) {
    const p = stage.path[i];
    if (i % 2 === 0) {
      scene.add.ellipse(p.x, p.y + 26, 86, 12, 0x000000, 0.08).setDepth(5);
    }
  }
}
