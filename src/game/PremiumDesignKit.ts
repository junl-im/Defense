import Phaser from 'phaser';
import { safeDelayedCall } from './SceneSafety';

export type PremiumButtonOptions = {
  x: number;
  y: number;
  width?: number;
  height?: number;
  label: string;
  texture?: string;
  icon?: string;
  subLabel?: string;
  disabled?: boolean;
  onClick?: () => void;
};

export type PremiumPanelOptions = {
  x: number;
  y: number;
  width: number;
  height: number;
  title?: string;
  texture?: string;
  depth?: number;
};

export type CurrencyChipOptions = {
  x: number;
  y: number;
  icon?: string;
  label: string;
  value: string | number;
  width?: number;
};

function has(scene: Phaser.Scene, key?: string): boolean {
  return !!key && scene.textures.exists(key);
}

export function makePremiumButton(scene: Phaser.Scene, options: PremiumButtonOptions): Phaser.GameObjects.Container {
  const width = options.width ?? 190;
  const height = options.height ?? 58;
  const root = scene.add.container(options.x, options.y);
  const bg = has(scene, options.texture)
    ? scene.add.image(0, 0, options.texture!).setDisplaySize(width, height)
    : scene.add.rectangle(0, 0, width, height, 0x8c3f28, 0.96).setStrokeStyle(2, 0xffd66b, 0.95);

  root.add(bg);
  if (has(scene, options.icon)) {
    root.add(scene.add.image(-width / 2 + height / 2 + 8, 0, options.icon!).setDisplaySize(height * 0.62, height * 0.62));
  }

  const labelX = options.icon ? 18 : 0;
  root.add(scene.add.text(labelX, options.subLabel ? -8 : -1, options.label, {
    fontSize: width > 230 ? '20px' : '16px',
    color: options.disabled ? '#9a9586' : '#fff2c2',
    fontStyle: 'bold',
    stroke: '#2b1208',
    strokeThickness: 4,
  }).setOrigin(0.5));

  if (options.subLabel) {
    root.add(scene.add.text(labelX, 17, options.subLabel, {
      fontSize: '11px',
      color: options.disabled ? '#777168' : '#ffe9a8',
      stroke: '#2b1208',
      strokeThickness: 2,
    }).setOrigin(0.5));
  }

  const sheen = scene.add.rectangle(-width * 0.8, 0, 22, height * 1.6, 0xffffff, options.disabled ? 0 : 0.16).setAngle(-18);
  root.add(sheen);
  if (!options.disabled) scene.tweens.add({ targets: sheen, x: width * 0.8, duration: 1800, repeat: -1, repeatDelay: 1600, ease: 'Sine.easeInOut' });

  root.setSize(width, height).setInteractive({ useHandCursor: !options.disabled });
  if (!options.disabled) {
    root.on('pointerover', () => {
      scene.tweens.add({ targets: root, scale: 1.045, duration: 90, ease: 'Sine.easeOut' });
      if (bg instanceof Phaser.GameObjects.Image) bg.setTint(0xfff2b0);
    });
    root.on('pointerout', () => {
      scene.tweens.add({ targets: root, scale: 1, duration: 90, ease: 'Sine.easeOut' });
      if (bg instanceof Phaser.GameObjects.Image) bg.clearTint();
    });
    root.on('pointerdown', () => scene.tweens.add({ targets: root, scale: 0.965, duration: 45, yoyo: true }));
    root.on('pointerup', () => options.onClick?.());
  } else {
    root.setAlpha(0.58);
  }
  return root;
}

export function makePremiumPanel(scene: Phaser.Scene, options: PremiumPanelOptions): Phaser.GameObjects.Container {
  const root = scene.add.container(options.x, options.y).setDepth(options.depth ?? 100);
  const bg = has(scene, options.texture)
    ? scene.add.image(0, 0, options.texture!).setDisplaySize(options.width, options.height)
    : scene.add.rectangle(0, 0, options.width, options.height, 0x111b2b, 0.94).setStrokeStyle(3, 0xf6d879, 0.85);
  root.add(bg);
  const glow = scene.add.rectangle(0, -options.height * 0.47, options.width * 0.78, 3, 0xffdf8c, 0.34);
  root.add(glow);
  scene.tweens.add({ targets: glow, alpha: 0.72, duration: 1300, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

  if (options.title) {
    root.add(scene.add.text(0, -options.height / 2 + 28, options.title, {
      fontSize: '20px',
      color: '#fff1bd',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5));
  }
  root.setAlpha(0).setScale(0.97);
  scene.tweens.add({ targets: root, alpha: 1, scale: 1, duration: 160, ease: 'Back.easeOut' });
  return root;
}

export function makePremiumToast(scene: Phaser.Scene, message: string, y = 108): Phaser.GameObjects.Container {
  const root = scene.add.container(480, y).setDepth(2500);
  const bg = has(scene, 'ui-status-plaque')
    ? scene.add.image(0, 0, 'ui-status-plaque').setDisplaySize(560, 62)
    : scene.add.rectangle(0, 0, 520, 46, 0x0b121d, 0.88).setStrokeStyle(2, 0xffd66b, 0.6);
  const text = scene.add.text(0, 0, message, {
    fontSize: '17px',
    color: '#fff1c2',
    fontStyle: 'bold',
    stroke: '#000000',
    strokeThickness: 3,
  }).setOrigin(0.5);
  root.add([bg, text]);
  root.setAlpha(0).setScale(0.96);
  scene.tweens.add({ targets: root, alpha: 1, scale: 1, duration: 160, ease: 'Back.easeOut' });
  safeDelayedCall(scene, 1600, () => {
    if (!root.active) return;
    scene.tweens.add({ targets: root, alpha: 0, y: y - 10, duration: 180, onComplete: () => root.destroy() });
  }, { canRun: () => root.active });
  return root;
}

export function makeCurrencyChip(scene: Phaser.Scene, options: CurrencyChipOptions): Phaser.GameObjects.Container {
  const width = options.width ?? 150;
  const root = scene.add.container(options.x, options.y);
  const bg = scene.add.rectangle(0, 0, width, 42, 0x0b111d, 0.86).setStrokeStyle(2, 0xf6d879, 0.6);
  root.add(bg);
  if (has(scene, options.icon)) root.add(scene.add.image(-width / 2 + 21, 0, options.icon!).setDisplaySize(26, 26));
  root.add(scene.add.text(options.icon ? -width / 2 + 42 : -width / 2 + 16, -7, options.label, { fontSize: '10px', color: '#e7c985', fontStyle: 'bold' }).setOrigin(0, 0.5));
  root.add(scene.add.text(options.icon ? -width / 2 + 42 : -width / 2 + 16, 9, `${options.value}`, { fontSize: '17px', color: '#fff4c7', fontStyle: 'bold', stroke: '#000', strokeThickness: 3 }).setOrigin(0, 0.5));
  return root;
}

export function makePremiumTooltip(scene: Phaser.Scene, x: number, y: number, title: string, body: string): Phaser.GameObjects.Container {
  const root = scene.add.container(x, y).setDepth(3200);
  const bg = has(scene, 'tooltip-gold-v40')
    ? scene.add.image(0, 0, 'tooltip-gold-v40').setDisplaySize(360, 110)
    : scene.add.rectangle(0, 0, 340, 96, 0x0c121e, 0.94).setStrokeStyle(2, 0xffd66b, 0.8);
  root.add(bg);
  root.add(scene.add.text(0, -24, title, { fontSize: '17px', color: '#fff1bd', fontStyle: 'bold', stroke: '#000', strokeThickness: 3 }).setOrigin(0.5));
  root.add(scene.add.text(0, 14, body, { fontSize: '12px', color: '#e7d6a9', align: 'center', wordWrap: { width: 290 } }).setOrigin(0.5));
  root.setAlpha(0).setScale(0.94);
  scene.tweens.add({ targets: root, alpha: 1, scale: 1, duration: 120, ease: 'Back.easeOut' });
  return root;
}

export function addPremiumEdgeLight(scene: Phaser.Scene, theme: string): Phaser.GameObjects.Container {
  const root = scene.add.container(0, 0).setDepth(980);
  const color = theme === 'volcano' ? 0xff7542 : theme === 'void' ? 0x9b7cff : theme === 'swamp' ? 0x80ffb0 : 0xffd66b;
  const top = scene.add.rectangle(480, 0, 960, 6, color, 0.38);
  const bottom = scene.add.rectangle(480, 540, 960, 8, color, 0.18);
  const left = scene.add.rectangle(0, 270, 6, 540, color, 0.16);
  const right = scene.add.rectangle(960, 270, 6, 540, color, 0.16);
  root.add([top, bottom, left, right]);
  scene.tweens.add({ targets: [top, bottom, left, right], alpha: '+=0.12', duration: 1800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  return root;
}

export function addLuxuryFloatingDust(scene: Phaser.Scene, depth = 8, count = 28): Phaser.GameObjects.Container {
  const root = scene.add.container(0, 0).setDepth(depth);
  for (let i = 0; i < count; i += 1) {
    const dot = scene.add.circle(Phaser.Math.Between(20, 940), Phaser.Math.Between(40, 510), Phaser.Math.FloatBetween(1.2, 3.4), 0xffe4a3, Phaser.Math.FloatBetween(0.08, 0.22));
    root.add(dot);
    scene.tweens.add({
      targets: dot,
      x: dot.x + Phaser.Math.Between(-28, 28),
      y: dot.y + Phaser.Math.Between(-20, 20),
      alpha: Phaser.Math.FloatBetween(0.04, 0.28),
      duration: Phaser.Math.Between(1800, 4200),
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }
  return root;
}

export function addSafeAreaFrame(scene: Phaser.Scene, depth = 2990): Phaser.GameObjects.Container {
  const root = scene.add.container(0, 0).setDepth(depth);
  const top = scene.add.rectangle(480, 10, 900, 3, 0xffd66b, 0.18);
  const bottom = scene.add.rectangle(480, 530, 900, 3, 0xffd66b, 0.12);
  const left = scene.add.rectangle(10, 270, 3, 500, 0xffd66b, 0.1);
  const right = scene.add.rectangle(950, 270, 3, 500, 0xffd66b, 0.1);
  root.add([top, bottom, left, right]);
  return root;
}

export function playScreenWipe(scene: Phaser.Scene, onMidpoint?: () => void): Phaser.GameObjects.Image {
  const key = scene.textures.exists('screen-transition-v39') ? 'screen-transition-v39' : 'screen-transition-v40';
  const wipe = scene.add.image(-620, 270, key).setDepth(5000).setAlpha(0.95).setDisplaySize(1180, 650);
  scene.tweens.add({
    targets: wipe,
    x: 1580,
    duration: 620,
    ease: 'Cubic.easeInOut',
    onUpdate: (_tween, target) => {
      if ((target as Phaser.GameObjects.Image).x > 470 && onMidpoint) {
        const fn = onMidpoint;
        onMidpoint = undefined;
        fn();
      }
    },
    onComplete: () => wipe.destroy(),
  });
  return wipe;
}

export function premiumPulse(scene: Phaser.Scene, target: Phaser.GameObjects.GameObject, scale = 1.06): void {
  scene.tweens.add({ targets: target, scale, duration: 90, yoyo: true, ease: 'Sine.easeOut' });
}
