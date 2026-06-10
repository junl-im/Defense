import Phaser from 'phaser';

export function isHitZoneDebugEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return new URLSearchParams(window.location.search).has('hit') || window.localStorage.getItem('ksHitDebug') === '1';
  } catch {
    return false;
  }
}

export function addHitZoneDebug(
  scene: Phaser.Scene,
  container: Phaser.GameObjects.Container,
  width: number,
  height: number,
  label: string,
  tint = 0xffdf7a,
  radius = 10
): void {
  if (!isHitZoneDebugEnabled()) return;
  const g = scene.add.graphics();
  g.fillStyle(tint, 0.11);
  g.fillRoundedRect(-width / 2, -height / 2, width, height, radius);
  g.lineStyle(2, tint, 0.82);
  g.strokeRoundedRect(-width / 2, -height / 2, width, height, radius);
  const text = scene.add.text(0, -height / 2 - 10, label, {
    fontFamily: 'monospace',
    fontSize: '9px',
    color: '#fff7c2',
    backgroundColor: '#061833cc',
    padding: { x: 4, y: 2 },
  }).setOrigin(0.5, 1);
  container.add([g, text]);
}
