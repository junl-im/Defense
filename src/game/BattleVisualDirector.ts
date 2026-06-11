import Phaser from 'phaser';
import type { StageConfig } from './types';
import { lowPowerMode } from './QualityManager';

// v2.5: mobile-first battlefield safe zones. The top HUD and bottom dock are slimmer now,
// so the active map area is wider without letting skill/tower menus overlap the chrome.
export const BATTLE_SAFE_TOP = 52;
export const BATTLE_SAFE_BOTTOM = 470;
export const BATTLE_SAFE_LEFT = 20;
export const BATTLE_SAFE_RIGHT = 940;

export function isBattlefieldPoint(x: number, y: number): boolean {
  return x >= BATTLE_SAFE_LEFT && x <= BATTLE_SAFE_RIGHT && y >= BATTLE_SAFE_TOP && y <= BATTLE_SAFE_BOTTOM;
}

export function clampToBattlefield(x: number, y: number): { x: number; y: number } {
  return {
    x: Phaser.Math.Clamp(x, BATTLE_SAFE_LEFT, BATTLE_SAFE_RIGHT),
    y: Phaser.Math.Clamp(y, BATTLE_SAFE_TOP, BATTLE_SAFE_BOTTOM),
  };
}

export function installCombatVisualDirector(scene: Phaser.Scene, stage: StageConfig): void {
  const focusKey = 'v2-combat-focus-overlay';
  if (scene.textures.exists(focusKey)) {
    scene.add.image(480, 270, focusKey).setDisplaySize(960, 540).setDepth(5).setAlpha(lowPowerMode() ? 0.20 : 0.34);
  }

  const path = stage.path;
  if (scene.textures.exists('v2-path-waypoint')) {
    path.forEach((point, index) => {
      if (index === 0 || index === path.length - 1 || index % 2 !== 0) return;
      const next = path[Math.min(index + 1, path.length - 1)];
      const angle = Phaser.Math.Angle.Between(point.x, point.y, next.x, next.y);
      const beacon = scene.add.image(point.x, point.y, 'v2-path-waypoint')
        .setDisplaySize(34, 34)
        .setRotation(angle)
        .setDepth(8)
        .setAlpha(0.42)
        .setBlendMode(Phaser.BlendModes.ADD);
      if (!lowPowerMode()) {
        scene.tweens.add({
          targets: beacon,
          alpha: 0.12,
          scale: 1.12,
          duration: 1100 + index * 80,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
        });
      }
    });
  }

  const start = path[0];
  const goal = path[path.length - 1];
  const entry = scene.add.circle(start.x + 34, start.y, 30, 0x72e8ff, 0.07)
    .setStrokeStyle(2, 0x72e8ff, 0.32)
    .setDepth(7)
    .setBlendMode(Phaser.BlendModes.ADD);
  const exit = scene.add.circle(goal.x - 34, goal.y, 32, 0xffd36b, 0.08)
    .setStrokeStyle(2, 0xffd36b, 0.34)
    .setDepth(7)
    .setBlendMode(Phaser.BlendModes.ADD);
  if (!lowPowerMode()) scene.tweens.add({ targets: [entry, exit], alpha: 0.20, scale: 1.14, duration: 1450, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
}
