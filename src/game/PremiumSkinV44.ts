import Phaser from 'phaser';

export type PremiumButtonOptions = {
  x: number;
  y: number;
  width: number;
  height: number;
  texture: string;
  label: string;
  icon?: string;
  subLabel?: string;
  onClick: () => void;
};

export function addSoftBackdrop(scene: Phaser.Scene, depth = 1): void {
  scene.add.rectangle(480, 270, 960, 540, 0x071020, 0.18).setDepth(depth);
  scene.add.rectangle(480, 270, 960, 540, 0xffffff, 0.04).setDepth(depth + 0.1);
}

export function addPremiumTitle(scene: Phaser.Scene, x: number, y: number): Phaser.GameObjects.Container {
  const c = scene.add.container(x, y).setDepth(20);
  const glow = scene.add.ellipse(0, 0, 570, 156, 0x7eb9ff, 0.18);
  const logo = scene.add.image(0, 0, 'ui-title-logo').setDisplaySize(560, 186);
  c.add([glow, logo]);
  scene.tweens.add({ targets: glow, alpha: 0.28, scaleX: 1.05, scaleY: 1.06, duration: 1500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  return c;
}

export function addPremiumButton(scene: Phaser.Scene, options: PremiumButtonOptions): Phaser.GameObjects.Container {
  const c = scene.add.container(options.x, options.y);
  const bg = scene.add.image(0, 0, options.texture).setDisplaySize(options.width, options.height).setInteractive({ useHandCursor: true });
  const label = scene.add.text(options.icon ? 18 : 0, options.subLabel ? -9 : 0, options.label, {
    fontSize: options.width > 260 ? '22px' : '16px',
    color: '#ffffff',
    fontStyle: 'bold',
    stroke: '#19366d',
    strokeThickness: 4,
  }).setOrigin(0.5);

  c.add(bg);

  if (options.icon) {
    const iconSize = Math.min(48, options.height - 14);
    const icon = scene.add.image(-options.width / 2 + iconSize / 2 + 18, -1, options.icon).setDisplaySize(iconSize, iconSize);
    c.add(icon);
  }

  c.add(label);

  if (options.subLabel) {
    c.add(scene.add.text(options.icon ? 18 : 0, 17, options.subLabel, {
      fontSize: '12px',
      color: '#edf5ff',
      stroke: '#19366d',
      strokeThickness: 3,
    }).setOrigin(0.5));
  }

  bg.on('pointerdown', () => {
    scene.tweens.add({ targets: c, scaleX: 0.955, scaleY: 0.955, duration: 55, yoyo: true, ease: 'Quad.easeOut' });
    addClickSpark(scene, options.x + c.x * 0, options.y + c.y * 0, c.depth + 1);
    options.onClick();
  });

  bg.on('pointerover', () => {
    bg.setTint(0xfff1b8);
    scene.tweens.add({ targets: c, scaleX: 1.035, scaleY: 1.035, duration: 120, ease: 'Back.easeOut' });
  });

  bg.on('pointerout', () => {
    bg.clearTint();
    scene.tweens.add({ targets: c, scaleX: 1, scaleY: 1, duration: 120, ease: 'Sine.easeOut' });
  });

  return c;
}

export function addClickSpark(scene: Phaser.Scene, x: number, y: number, depth = 1000): void {
  const ring = scene.add.ellipse(x, y, 18, 18, 0xffffff, 0).setStrokeStyle(3, 0xffd66d, 0.9).setDepth(depth);
  const dot = scene.add.ellipse(x, y, 8, 8, 0xffffff, 0.75).setDepth(depth + 1);
  scene.tweens.add({ targets: ring, scaleX: 3.4, scaleY: 3.4, alpha: 0, duration: 320, ease: 'Cubic.easeOut', onComplete: () => ring.destroy() });
  scene.tweens.add({ targets: dot, scaleX: 0.15, scaleY: 0.15, alpha: 0, duration: 220, ease: 'Sine.easeOut', onComplete: () => dot.destroy() });
}
