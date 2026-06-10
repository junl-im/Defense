import Phaser from 'phaser';
import type { StageConfig } from './types';
import type { HeroProfile } from './HeroLoadout';
import { heroSelectionSummary } from './HeroLoadout';
import { getRewardChestCount } from './MissionBoard';

export function installBattleDirectorHud(scene: Phaser.Scene, stage: StageConfig, hero: HeroProfile): void {
  const root = scene.add.container(480, 106).setDepth(74).setAlpha(0);
  const bg = scene.add.rectangle(0, 0, 480, 42, 0x120c08, 0.72)
    .setStrokeStyle(2, 0xffd679, 0.34);
  const title = scene.add.text(-218, -11, `지휘관: ${hero.name}`, {
    fontSize: '14px',
    color: '#ffe7ad',
    fontStyle: 'bold',
    stroke: '#170805',
    strokeThickness: 3,
  }).setOrigin(0, 0.5);
  const info = scene.add.text(-218, 10, `${stage.title} · ${heroSelectionSummary()} · 보급상자 ${getRewardChestCount()}`, {
    fontSize: '12px',
    color: '#d7f0ff',
    fontStyle: 'bold',
    stroke: '#07131a',
    strokeThickness: 3,
  }).setOrigin(0, 0.5);
  root.add([bg, title, info]);
  scene.tweens.add({ targets: root, alpha: 1, y: 118, duration: 420, ease: 'Back.easeOut' });
  scene.time.delayedCall(4100, () => scene.tweens.add({ targets: root, alpha: 0, y: 92, duration: 420, onComplete: () => root.destroy() }));
}

export function showPremiumToast(scene: Phaser.Scene, text: string, y = 418): void {
  const root = scene.add.container(480, y).setDepth(100).setAlpha(0).setScale(0.95);
  const bg = scene.add.rectangle(0, 0, 520, 52, 0x2b170d, 0.92).setStrokeStyle(3, 0xffd679, 0.6);
  const label = scene.add.text(0, 0, text, {
    fontSize: '20px',
    color: '#fff2c4',
    fontStyle: 'bold',
    stroke: '#1b0703',
    strokeThickness: 5,
  }).setOrigin(0.5);
  root.add([bg, label]);
  scene.tweens.add({ targets: root, alpha: 1, scale: 1, duration: 180, ease: 'Back.easeOut' });
  scene.time.delayedCall(1500, () => scene.tweens.add({ targets: root, alpha: 0, y: y - 16, duration: 360, onComplete: () => root.destroy() }));
}
