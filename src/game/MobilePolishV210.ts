import Phaser from 'phaser';
import { lowPowerMode } from './QualityManager';

export const V210_BUILD_HIT = { width: 58, height: 48, radius: 20 } as const;
export const V210_TOWER_HIT = { width: 58, height: 66, offsetY: -16, radius: 21 } as const;
export const V210_BUILD_MENU = { width: 342, height: 188, cardWidth: 142, cardHeight: 48 } as const;
export const V210_TOWER_PANEL = { width: 338, compactOffset: 174 } as const;

export function mobileTextV210(size: number, color = '#f7fbff', fixedWidth?: number): Phaser.Types.GameObjects.Text.TextStyle {
  return {
    fontFamily: 'Pretendard, Noto Sans KR, NanumGothic, Arial, sans-serif',
    fontSize: `${size}px`,
    color,
    fontStyle: 'bold',
    fixedWidth,
    shadow: { offsetX: 0, offsetY: 1, color: '#00152d', blur: 2, fill: true },
  };
}

export function installV210BattlePolish(scene: Phaser.Scene): void {
  const lite = lowPowerMode() || new URLSearchParams(window.location.search).has('lite') || new URLSearchParams(window.location.search).has('battery');
  const depth = 71;
  const topLine = scene.add.rectangle(480, 46, 700, 1, 0x9fe8ff, 0.15).setDepth(depth).setBlendMode(Phaser.BlendModes.ADD);
  const bottomLine = scene.add.rectangle(480, 471, 660, 1, 0xffdf8a, 0.10).setDepth(depth).setBlendMode(Phaser.BlendModes.ADD);
  const leftRail = scene.add.rectangle(9, 270, 2, 336, 0x7bdcff, 0.10).setDepth(6).setBlendMode(Phaser.BlendModes.ADD);
  const rightRail = scene.add.rectangle(951, 270, 2, 336, 0xffd46b, 0.08).setDepth(6).setBlendMode(Phaser.BlendModes.ADD);
  if (!lite) {
    scene.tweens.add({ targets: [topLine, bottomLine], alpha: '+=0.10', duration: 1350, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    scene.tweens.add({ targets: [leftRail, rightRail], alpha: '+=0.06', duration: 1800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  }
}

export function addV210ToastPlate(scene: Phaser.Scene, x: number, y: number, width = 360, height = 32): Phaser.GameObjects.Image | Phaser.GameObjects.Rectangle {
  if (scene.textures.exists('v2-toast-plaque-v210')) {
    return scene.add.image(x, y, 'v2-toast-plaque-v210').setDisplaySize(width, height).setDepth(89).setAlpha(0.96);
  }
  return scene.add.rectangle(x, y, width, height, 0x071c3e, 0.72).setDepth(89).setStrokeStyle(1, 0xffdc82, 0.56);
}

export function shortMetricV210(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `${(value / 1_000_000).toFixed(abs >= 10_000_000 ? 0 : 1)}M`;
  if (abs >= 10_000) return `${Math.round(value / 1000)}K`;
  if (abs >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return `${value}`;
}
