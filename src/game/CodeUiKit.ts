import Phaser from 'phaser';

export type CodeUiTone = 'gold' | 'blue' | 'white' | 'red' | 'green' | 'dark';

type ToneStyle = {
  fill: number;
  fill2: number;
  stroke: number;
  inner: number;
  text: string;
  shadow: number;
};

const TONES: Record<CodeUiTone, ToneStyle> = {
  gold: { fill: 0xe5a94a, fill2: 0xffd77d, stroke: 0x7a4612, inner: 0xfff0b6, text: '#ffffff', shadow: 0x623608 },
  blue: { fill: 0x236ab8, fill2: 0x5cbcff, stroke: 0x12386f, inner: 0xd5f2ff, text: '#ffffff', shadow: 0x0c2a5a },
  white: { fill: 0xf8fbff, fill2: 0xe3f0ff, stroke: 0x8eb4da, inner: 0xffffff, text: '#24528f', shadow: 0x7c9fc7 },
  red: { fill: 0xd35a46, fill2: 0xff8a67, stroke: 0x74311f, inner: 0xffd3bc, text: '#ffffff', shadow: 0x642417 },
  green: { fill: 0x45a968, fill2: 0x95dc78, stroke: 0x235c31, inner: 0xd7ffc8, text: '#ffffff', shadow: 0x164b25 },
  dark: { fill: 0x16345f, fill2: 0x2d5c99, stroke: 0x071a39, inner: 0x98cfff, text: '#ffffff', shadow: 0x071a39 },
};

export type CodePanelOptions = {
  x: number;
  y: number;
  width: number;
  height: number;
  radius?: number;
  depth?: number;
  fill?: number;
  fillAlpha?: number;
  stroke?: number;
  strokeAlpha?: number;
  glow?: number;
  title?: string;
};

export type CodeButtonOptions = {
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  tone?: CodeUiTone;
  fontSize?: number;
  iconText?: string;
  iconKey?: string;
  subLabel?: string;
  depth?: number;
  enabled?: boolean;
  onClick: () => void;
};

export function addCoverImage(scene: Phaser.Scene, key: string, width = 960, height = 540, depth = 0): Phaser.GameObjects.Image | Phaser.GameObjects.Rectangle {
  if (!scene.textures.exists(key)) {
    return scene.add.rectangle(width / 2, height / 2, width, height, 0x91cfff, 1).setDepth(depth);
  }

  const texture = scene.textures.get(key);
  const source = texture.getSourceImage() as { width: number; height: number };
  const scale = Math.max(width / source.width, height / source.height);
  return scene.add.image(width / 2, height / 2, key).setScale(scale).setDepth(depth);
}

export function addSceneVignette(scene: Phaser.Scene, depth = 1, alpha = 0.22): void {
  scene.add.rectangle(480, 270, 960, 540, 0x06152c, alpha).setDepth(depth);
  scene.add.ellipse(480, 230, 780, 440, 0xffffff, 0.055).setDepth(depth + 0.1);
  scene.add.rectangle(480, 514, 960, 52, 0x06152c, alpha + 0.16).setDepth(depth + 0.2);
}

export function addCodePanel(scene: Phaser.Scene, options: CodePanelOptions): Phaser.GameObjects.Container {
  const radius = options.radius ?? 26;
  const c = scene.add.container(options.x, options.y).setDepth(options.depth ?? 10);
  const w = options.width;
  const h = options.height;
  const fill = options.fill ?? 0xf9fbff;
  const fillAlpha = options.fillAlpha ?? 0.88;
  const stroke = options.stroke ?? 0xd7a94b;
  const strokeAlpha = options.strokeAlpha ?? 0.88;

  const shadow = scene.add.graphics();
  shadow.fillStyle(0x06112a, 0.28);
  shadow.fillRoundedRect(-w / 2 + 8, -h / 2 + 12, w, h, radius);

  const glow = scene.add.graphics();
  glow.fillStyle(options.glow ?? 0x89dfff, 0.14);
  glow.fillRoundedRect(-w / 2 - 12, -h / 2 - 10, w + 24, h + 20, radius + 12);

  const body = scene.add.graphics();
  body.fillStyle(fill, fillAlpha);
  body.fillRoundedRect(-w / 2, -h / 2, w, h, radius);
  body.lineStyle(4, stroke, strokeAlpha);
  body.strokeRoundedRect(-w / 2, -h / 2, w, h, radius);
  body.lineStyle(1, 0xffffff, 0.62);
  body.strokeRoundedRect(-w / 2 + 6, -h / 2 + 6, w - 12, h - 12, Math.max(8, radius - 6));

  const shine = scene.add.graphics();
  shine.fillStyle(0xffffff, 0.22);
  shine.fillRoundedRect(-w / 2 + 18, -h / 2 + 14, w - 36, Math.min(40, h * 0.22), Math.max(10, radius - 10));

  c.add([shadow, glow, body, shine]);

  if (options.title) {
    c.add(scene.add.text(0, -h / 2 + 28, options.title, {
      fontSize: '16px',
      color: '#275997',
      fontStyle: 'bold',
      stroke: '#ffffff',
      strokeThickness: 3,
    }).setOrigin(0.5));
  }

  return c;
}

export function addCodeButton(scene: Phaser.Scene, options: CodeButtonOptions): Phaser.GameObjects.Container {
  const tone = TONES[options.tone ?? 'blue'];
  const enabled = options.enabled ?? true;
  const c = scene.add.container(options.x, options.y).setDepth(options.depth ?? 30);
  const w = options.width;
  const h = options.height;
  const r = Math.min(18, Math.max(10, h * 0.38));

  const shadow = scene.add.graphics();
  shadow.fillStyle(0x06112a, enabled ? 0.26 : 0.12);
  shadow.fillRoundedRect(-w / 2 + 4, -h / 2 + 6, w, h, r);

  const bg = scene.add.graphics();
  bg.fillStyle(tone.fill, enabled ? 0.96 : 0.42);
  bg.fillRoundedRect(-w / 2, -h / 2, w, h, r);
  bg.fillStyle(tone.fill2, enabled ? 0.28 : 0.08);
  bg.fillRoundedRect(-w / 2 + 4, -h / 2 + 4, w - 8, Math.max(10, h * 0.45), r - 3);
  bg.lineStyle(3, tone.stroke, enabled ? 0.82 : 0.28);
  bg.strokeRoundedRect(-w / 2, -h / 2, w, h, r);
  bg.lineStyle(1, tone.inner, enabled ? 0.62 : 0.12);
  bg.strokeRoundedRect(-w / 2 + 5, -h / 2 + 5, w - 10, h - 10, Math.max(6, r - 5));

  const hover = scene.add.graphics();
  hover.fillStyle(0xffffff, 0.16);
  hover.fillRoundedRect(-w / 2 + 8, -h / 2 + 6, w - 16, h - 12, Math.max(6, r - 6));
  hover.setAlpha(0);

  const hit = scene.add.rectangle(0, 0, w, h, 0xffffff, 0.001)
    .setInteractive({ useHandCursor: enabled });

  const labelX = options.iconText || options.iconKey ? 14 : 0;
  const label = scene.add.text(labelX, options.subLabel ? -7 : 0, options.label, {
    fontSize: `${options.fontSize ?? (w > 190 ? 18 : 14)}px`,
    color: tone.text,
    fontStyle: 'bold',
    align: 'center',
    stroke: Phaser.Display.Color.IntegerToColor(tone.shadow).rgba,
    strokeThickness: options.tone === 'white' ? 2 : 4,
  }).setOrigin(0.5).setName('label');

  c.add([shadow, bg, hover, hit]);

  if (options.iconKey && scene.textures.exists(options.iconKey)) {
    const iconSize = Math.min(h - 12, 30);
    const iconBack = scene.add.ellipse(-w / 2 + iconSize / 2 + 14, 0, iconSize + 8, iconSize + 8, 0xffffff, 0.24);
    const icon = scene.add.image(-w / 2 + iconSize / 2 + 14, 0, options.iconKey).setDisplaySize(iconSize, iconSize);
    c.add([iconBack, icon]);
  } else if (options.iconText) {
    c.add(scene.add.text(-w / 2 + 23, -1, options.iconText, {
      fontSize: `${Math.min(22, h - 12)}px`,
      stroke: Phaser.Display.Color.IntegerToColor(tone.shadow).rgba,
      strokeThickness: 2,
    }).setOrigin(0.5));
  }

  c.add(label);

  if (options.subLabel) {
    c.add(scene.add.text(labelX, 14, options.subLabel, {
      fontSize: '10px',
      color: options.tone === 'white' ? '#4f72a2' : '#edf8ff',
      fontStyle: 'bold',
      stroke: options.tone === 'white' ? '#ffffff' : '#12386f',
      strokeThickness: 2,
    }).setOrigin(0.5));
  }

  if (!enabled) {
    c.setAlpha(0.65);
    return c;
  }

  hit.on('pointerover', () => {
    hover.setAlpha(1);
    scene.tweens.add({ targets: c, scaleX: 1.035, scaleY: 1.035, duration: 110, ease: 'Back.easeOut' });
  });

  hit.on('pointerout', () => {
    hover.setAlpha(0);
    scene.tweens.add({ targets: c, scaleX: 1, scaleY: 1, duration: 120, ease: 'Sine.easeOut' });
  });

  hit.on('pointerdown', () => {
    scene.tweens.add({ targets: c, scaleX: 0.96, scaleY: 0.96, duration: 55, yoyo: true, ease: 'Quad.easeOut' });
    addClickSpark(scene, options.x, options.y, (options.depth ?? 30) + 10);
    options.onClick();
  });

  return c;
}

export function addCodeLogo(scene: Phaser.Scene, x: number, y: number, scale = 1): Phaser.GameObjects.Container {
  const c = scene.add.container(x, y).setDepth(25).setScale(scale);

  const glow = scene.add.ellipse(0, 8, 420, 112, 0x8fdfff, 0.18);
  const wing = scene.add.graphics();
  wing.fillStyle(0xffffff, 0.74);
  wing.fillTriangle(-205, 4, -148, -30, -152, 28);
  wing.fillTriangle(205, 4, 148, -30, 152, 28);
  wing.lineStyle(3, 0x97c7ff, 0.5);
  wing.strokeTriangle(-205, 4, -148, -30, -152, 28);
  wing.strokeTriangle(205, 4, 148, -30, 152, 28);

  const crown = scene.add.graphics();
  crown.fillStyle(0xffc84d, 0.95);
  crown.fillTriangle(-38, -43, -18, -13, -50, -13);
  crown.fillTriangle(0, -56, 24, -13, -24, -13);
  crown.fillTriangle(38, -43, 50, -13, 18, -13);
  crown.fillRoundedRect(-56, -16, 112, 23, 8);
  crown.lineStyle(3, 0x7a4612, 0.85);
  crown.strokeRoundedRect(-56, -16, 112, 23, 8);
  crown.fillStyle(0x55d6ff, 0.95);
  crown.fillCircle(0, -16, 6);

  const title = scene.add.text(0, 10, 'KINGDOM SEED', {
    fontSize: '40px',
    color: '#fff1be',
    fontStyle: 'bold',
    stroke: '#203e7d',
    strokeThickness: 8,
    shadow: { offsetX: 0, offsetY: 5, color: '#000000', blur: 5, fill: true },
  }).setOrigin(0.5);

  c.add([glow, wing, crown, title]);
  scene.tweens.add({ targets: glow, alpha: 0.28, scaleX: 1.05, scaleY: 1.08, duration: 1700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  scene.tweens.add({ targets: crown, y: -2, duration: 1900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  return c;
}

export function addStatChip(scene: Phaser.Scene, x: number, y: number, label: string, value: string, tone: CodeUiTone = 'blue', depth = 30): Phaser.GameObjects.Container {
  const c = addCodePanel(scene, { x, y, width: 154, height: 34, radius: 16, depth, fill: tone === 'gold' ? 0xfff5d4 : 0xf0f8ff, fillAlpha: 0.82, stroke: TONES[tone].stroke, strokeAlpha: 0.58 });
  c.add(scene.add.text(-56, 0, label, { fontSize: '10px', color: '#46679a', fontStyle: 'bold' }).setOrigin(0, 0.5));
  c.add(scene.add.text(58, 0, value, { fontSize: '14px', color: tone === 'gold' ? '#a45b13' : '#24528f', fontStyle: 'bold', stroke: '#ffffff', strokeThickness: 2 }).setOrigin(1, 0.5));
  return c;
}

export function addClickSpark(scene: Phaser.Scene, x: number, y: number, depth = 1000): void {
  const ring = scene.add.ellipse(x, y, 18, 18, 0xffffff, 0)
    .setStrokeStyle(3, 0xffd66d, 0.9)
    .setDepth(depth);
  const dot = scene.add.ellipse(x, y, 8, 8, 0xffffff, 0.75).setDepth(depth + 1);
  scene.tweens.add({ targets: ring, scaleX: 3.2, scaleY: 3.2, alpha: 0, duration: 320, ease: 'Cubic.easeOut', onComplete: () => ring.destroy() });
  scene.tweens.add({ targets: dot, scaleX: 0.15, scaleY: 0.15, alpha: 0, duration: 220, ease: 'Sine.easeOut', onComplete: () => dot.destroy() });
}

export function addFloatingSparkles(scene: Phaser.Scene, count = 16, depth = 8): void {
  for (let i = 0; i < count; i += 1) {
    const size = Phaser.Math.Between(4, 9);
    const x = Phaser.Math.Between(55, 905);
    const y = Phaser.Math.Between(55, 500);
    const spark = scene.add.star(x, y, 4, size * 0.4, size, 0xffffff, Phaser.Math.FloatBetween(0.18, 0.44)).setDepth(depth);
    scene.tweens.add({
      targets: spark,
      y: y - Phaser.Math.Between(12, 32),
      angle: Phaser.Math.Between(-20, 20),
      alpha: Phaser.Math.FloatBetween(0.05, 0.3),
      duration: Phaser.Math.Between(2200, 4700),
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }
}
