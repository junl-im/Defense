import Phaser from 'phaser';
import { lowPowerMode } from './QualityManager';
type StageTheme = string;

const THEME_ACCENT: Record<string, number> = {
  forest: 0x82d66f,
  canyon: 0xffa85d,
  swamp: 0x84ffc2,
  fortress: 0xff7d63,
  citadel: 0xd77c88,
  volcano: 0xff6d2d,
  void: 0x9f92ff,
  finale: 0xffd36b,
};

export function drawCinematicCombatFrame(scene: Phaser.Scene, theme: StageTheme | string): void {
  const accent = THEME_ACCENT[theme] ?? 0xffd36b;
  const g = scene.add.graphics().setDepth(69);

  g.fillStyle(0x000000, 0.22);
  g.fillRect(0, 64, 960, 10);
  g.fillRect(0, 466, 960, 12);

  g.lineStyle(2, accent, 0.28);
  g.strokeRoundedRect(8, 72, 944, 396, 18);
  g.lineStyle(1, 0xffffff, 0.10);
  g.strokeRoundedRect(17, 81, 926, 378, 14);

  const cornerSize = 54;
  const corners = [
    [18, 82, 1, 1],
    [942, 82, -1, 1],
    [18, 458, 1, -1],
    [942, 458, -1, -1],
  ] as const;

  corners.forEach(([x, y, sx, sy]) => {
    const c = scene.add.graphics().setDepth(71);
    c.lineStyle(4, accent, 0.46);
    c.beginPath();
    c.moveTo(x, y + sy * cornerSize);
    c.lineTo(x, y);
    c.lineTo(x + sx * cornerSize, y);
    c.strokePath();
    c.lineStyle(1, 0xffffff, 0.22);
    c.beginPath();
    c.moveTo(x + sx * 8, y + sy * (cornerSize - 10));
    c.lineTo(x + sx * 8, y + sy * 8);
    c.lineTo(x + sx * (cornerSize - 10), y + sy * 8);
    c.strokePath();
  });

  // Premium mobile-game style ambient motes. Disabled in safe mode to protect low-end phones.
  if (lowPowerMode()) return;
  for (let i = 0; i < 8; i++) {
    const x = 50 + ((i * 73) % 860);
    const y = 95 + ((i * 41) % 330);
    const dot = scene.add.circle(x, y, 1.2 + (i % 3), accent, 0.14).setDepth(5);
    scene.tweens.add({
      targets: dot,
      y: y - 12 - (i % 4) * 4,
      alpha: 0.03,
      duration: 2600 + i * 90,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }
}

export function addPremiumPlaque(
  scene: Phaser.Scene,
  x: number,
  y: number,
  width: number,
  height: number,
  accent = 0xffd36b,
  depth = 76
): Phaser.GameObjects.Container {
  const c = scene.add.container(x, y).setDepth(depth);
  const shadow = scene.add.rectangle(3, 4, width, height, 0x000000, 0.28).setOrigin(0.5);
  const bg = scene.add.rectangle(0, 0, width, height, 0x15100c, 0.88).setOrigin(0.5);
  bg.setStrokeStyle(2, accent, 0.34);
  const top = scene.add.rectangle(0, -height / 2 + 5, width - 14, 3, 0xffffff, 0.12).setOrigin(0.5);
  const glow = scene.add.rectangle(0, 0, width - 10, height - 10, accent, 0.035).setOrigin(0.5);
  c.add([shadow, bg, glow, top]);
  return c;
}

export function addBuildSpotPreview(scene: Phaser.Scene, x: number, y: number, accent = 0xffd36b): Phaser.GameObjects.Container {
  const c = scene.add.container(x, y).setDepth(18);
  const ring = scene.add.ellipse(0, 0, 92, 46, accent, 0.08).setStrokeStyle(2, accent, 0.24);
  const pulse = scene.add.ellipse(0, 0, 74, 34, accent, 0.05).setStrokeStyle(1, 0xffffff, 0.18);
  const label = scene.add.text(0, 45, '건설 가능', {
    fontSize: '11px', color: '#fff0bd', fontStyle: 'bold',
    shadow: { offsetX: 0, offsetY: 1, color: '#000000', blur: 1, fill: true }
  }).setOrigin(0.5);
  c.add([ring, pulse, label]);
  if (!lowPowerMode()) scene.tweens.add({ targets: pulse, scale: 1.18, alpha: 0.02, duration: 1050, yoyo: true, repeat: -1 });
  return c;
}
