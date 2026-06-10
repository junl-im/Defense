import Phaser from 'phaser';

export type CodeUiTone = 'gold' | 'blue' | 'white' | 'red' | 'green' | 'dark';

type ToneStyle = {
  fill: number;
  fill2: number;
  stroke: number;
  inner: number;
  text: string;
  shadow: number;
  spark: number;
};

const TONES: Record<CodeUiTone, ToneStyle> = {
  gold: { fill: 0xd9922e, fill2: 0xffdd78, stroke: 0x6d3c12, inner: 0xfff4bf, text: '#ffffff', shadow: 0x5a310c, spark: 0xfff1a8 },
  blue: { fill: 0x1e62b3, fill2: 0x6fd5ff, stroke: 0x0b2e68, inner: 0xe2fbff, text: '#ffffff', shadow: 0x082657, spark: 0x9eeeff },
  white: { fill: 0xf8fbff, fill2: 0xdff1ff, stroke: 0x7ca4cf, inner: 0xffffff, text: '#24528f', shadow: 0x7c9fc7, spark: 0xffffff },
  red: { fill: 0xc94b3f, fill2: 0xff9267, stroke: 0x692616, inner: 0xffd6bd, text: '#ffffff', shadow: 0x5f2014, spark: 0xffc7a1 },
  green: { fill: 0x3e9e5d, fill2: 0x9ee778, stroke: 0x1e552e, inner: 0xe4ffd2, text: '#ffffff', shadow: 0x173f23, spark: 0xd8ff9f },
  dark: { fill: 0x17345f, fill2: 0x2e68b0, stroke: 0x071a39, inner: 0x98d8ff, text: '#ffffff', shadow: 0x071a39, spark: 0x9eeeff },
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

function rgba(color: number): string {
  return Phaser.Display.Color.IntegerToColor(color).rgba;
}

function addPanelGem(scene: Phaser.Scene, x: number, y: number, color: number, depth?: number): Phaser.GameObjects.Container {
  const c = scene.add.container(x, y);
  if (depth !== undefined) c.setDepth(depth);

  const back = scene.add.graphics();
  back.fillStyle(0x07244f, 0.26);
  back.fillCircle(2, 3, 9);
  back.fillStyle(0xffe7a0, 0.96);
  back.fillCircle(0, 0, 8);
  back.fillStyle(color, 0.92);
  back.fillCircle(0, 0, 5);
  back.fillStyle(0xffffff, 0.62);
  back.fillCircle(-2, -2, 2);
  c.add(back);
  return c;
}

function addTinyStar(scene: Phaser.Scene, x: number, y: number, size: number, color: number, alpha: number): Phaser.GameObjects.Star {
  return scene.add.star(x, y, 4, size * 0.36, size, color, alpha);
}

export function addCoverImage(scene: Phaser.Scene, key: string, width = 960, height = 540, depth = 0): Phaser.GameObjects.Image | Phaser.GameObjects.Rectangle {
  if (!scene.textures.exists(key)) {
    return scene.add.rectangle(width / 2, height / 2, width, height, 0x91cfff, 1).setDepth(depth);
  }

  const texture = scene.textures.get(key);
  texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
  const source = texture.getSourceImage() as { width: number; height: number };
  const scale = Math.max(width / source.width, height / source.height);
  return scene.add.image(width / 2, height / 2, key).setScale(scale).setDepth(depth);
}

export function addSceneVignette(scene: Phaser.Scene, depth = 1, alpha = 0.22): void {
  scene.add.rectangle(480, 270, 960, 540, 0x06152c, alpha).setDepth(depth);
  scene.add.ellipse(480, 210, 850, 430, 0xffffff, 0.055).setDepth(depth + 0.1).setBlendMode(Phaser.BlendModes.ADD);
  scene.add.rectangle(480, 514, 960, 52, 0x06152c, alpha + 0.13).setDepth(depth + 0.2);
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
  const glowColor = options.glow ?? 0x89dfff;

  const shadow = scene.add.graphics();
  shadow.fillStyle(0x06112a, 0.17);
  shadow.fillRoundedRect(-w / 2 + 12, -h / 2 + 16, w, h, radius + 2);
  shadow.fillStyle(0x06112a, 0.16);
  shadow.fillRoundedRect(-w / 2 + 5, -h / 2 + 7, w, h, radius);

  const glow = scene.add.graphics();
  glow.fillStyle(glowColor, 0.095);
  glow.fillRoundedRect(-w / 2 - 18, -h / 2 - 14, w + 36, h + 28, radius + 18);
  glow.fillStyle(0xffffff, 0.055);
  glow.fillRoundedRect(-w / 2 - 5, -h / 2 - 3, w + 10, h + 8, radius + 8);

  const body = scene.add.graphics();
  body.fillStyle(fill, fillAlpha);
  body.fillRoundedRect(-w / 2, -h / 2, w, h, radius);
  body.fillStyle(0xffffff, 0.17);
  body.fillRoundedRect(-w / 2 + 8, -h / 2 + 8, w - 16, Math.max(18, h * 0.22), Math.max(9, radius - 8));
  body.fillStyle(0x0e4b8e, fill === 0x143f7a || fill === 0x183d72 ? 0.10 : 0.045);
  body.fillRoundedRect(-w / 2 + 10, h / 2 - Math.max(30, h * 0.19), w - 20, Math.max(18, h * 0.16), Math.max(8, radius - 12));
  body.lineStyle(5, stroke, strokeAlpha);
  body.strokeRoundedRect(-w / 2, -h / 2, w, h, radius);
  body.lineStyle(2, 0xffffff, Math.min(0.78, strokeAlpha + 0.06));
  body.strokeRoundedRect(-w / 2 + 7, -h / 2 + 7, w - 14, h - 14, Math.max(8, radius - 7));
  body.lineStyle(1, 0x74dfff, 0.26);
  body.strokeRoundedRect(-w / 2 + 13, -h / 2 + 13, w - 26, h - 26, Math.max(8, radius - 13));

  const shine = scene.add.graphics();
  shine.fillStyle(0xffffff, 0.18);
  shine.fillRoundedRect(-w / 2 + 24, -h / 2 + 16, w - 48, Math.min(36, h * 0.19), Math.max(12, radius - 12));
  shine.fillStyle(0xffffff, 0.11);
  shine.fillEllipse(-w * 0.17, -h * 0.22, w * 0.42, h * 0.14);

  c.add([shadow, glow, body, shine]);

  const gemColor = stroke === 0xe3bb54 ? 0x6ee7ff : 0xffda6d;
  const corner = Math.min(14, Math.max(8, radius * 0.45));
  c.add(addPanelGem(scene, -w / 2 + corner, -h / 2 + corner, gemColor));
  c.add(addPanelGem(scene, w / 2 - corner, -h / 2 + corner, gemColor));
  if (w > 180 && h > 70) {
    const leftSpark = addTinyStar(scene, -w / 2 + 32, h / 2 - 22, 8, 0xffffff, 0.30).setAngle(18);
    const rightSpark = addTinyStar(scene, w / 2 - 32, h / 2 - 22, 8, 0xffffff, 0.30).setAngle(-18);
    c.add([leftSpark, rightSpark]);
  }

  if (options.title) {
    const titleBand = scene.add.graphics();
    const y = -h / 2 + 28;
    titleBand.fillStyle(0x1f63ae, 0.92);
    titleBand.fillRoundedRect(-82, y - 16, 164, 32, 14);
    titleBand.fillStyle(0xffffff, 0.17);
    titleBand.fillRoundedRect(-72, y - 12, 144, 12, 7);
    titleBand.lineStyle(2, 0xffdd78, 0.70);
    titleBand.strokeRoundedRect(-82, y - 16, 164, 32, 14);
    c.add(titleBand);
    c.add(scene.add.text(0, y, options.title, {
      fontSize: '16px',
      color: '#fff3bf',
      fontStyle: 'bold',
      stroke: '#14335e',
      strokeThickness: 4,
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
  const r = Math.min(18, Math.max(10, h * 0.40));

  const shadow = scene.add.graphics();
  shadow.fillStyle(0x06112a, enabled ? 0.22 : 0.10);
  shadow.fillRoundedRect(-w / 2 + 5, -h / 2 + 7, w, h, r);

  const aura = scene.add.graphics();
  aura.fillStyle(tone.spark, enabled ? 0.085 : 0.03);
  aura.fillRoundedRect(-w / 2 - 6, -h / 2 - 5, w + 12, h + 10, r + 8);

  const bg = scene.add.graphics();
  bg.fillStyle(tone.fill, enabled ? 0.97 : 0.42);
  bg.fillRoundedRect(-w / 2, -h / 2, w, h, r);
  bg.fillStyle(tone.fill2, enabled ? 0.34 : 0.08);
  bg.fillRoundedRect(-w / 2 + 5, -h / 2 + 5, w - 10, Math.max(11, h * 0.48), r - 3);
  bg.fillStyle(0x06112a, enabled ? 0.10 : 0.05);
  bg.fillRoundedRect(-w / 2 + 6, h / 2 - Math.max(12, h * 0.28), w - 12, Math.max(9, h * 0.20), r - 5);
  bg.lineStyle(3, tone.stroke, enabled ? 0.90 : 0.28);
  bg.strokeRoundedRect(-w / 2, -h / 2, w, h, r);
  bg.lineStyle(1, tone.inner, enabled ? 0.72 : 0.12);
  bg.strokeRoundedRect(-w / 2 + 5, -h / 2 + 5, w - 10, h - 10, Math.max(6, r - 5));
  bg.fillStyle(0xffffff, enabled ? 0.18 : 0.04);
  bg.fillEllipse(-w * 0.18, -h * 0.22, w * 0.42, Math.max(8, h * 0.26));

  const caps = scene.add.graphics();
  caps.fillStyle(0xfff1b6, enabled ? 0.92 : 0.30);
  caps.fillCircle(-w / 2 + 12, 0, Math.min(7, h * 0.18));
  caps.fillCircle(w / 2 - 12, 0, Math.min(7, h * 0.18));
  caps.fillStyle(tone.spark, enabled ? 0.86 : 0.22);
  caps.fillCircle(-w / 2 + 12, 0, Math.min(4, h * 0.12));
  caps.fillCircle(w / 2 - 12, 0, Math.min(4, h * 0.12));

  const hover = scene.add.graphics();
  hover.fillStyle(0xffffff, 0.20);
  hover.fillRoundedRect(-w / 2 + 8, -h / 2 + 6, w - 16, h - 12, Math.max(6, r - 6));
  hover.fillStyle(tone.spark, 0.14);
  hover.fillEllipse(0, 0, w * 0.80, h * 0.70);
  hover.setAlpha(0);

  const hit = scene.add.rectangle(0, 0, w, h, 0xffffff, 0.001)
    .setInteractive({ useHandCursor: enabled });

  const labelX = options.iconText || options.iconKey ? 14 : 0;
  const label = scene.add.text(labelX, options.subLabel ? -7 : 0, options.label, {
    fontSize: `${options.fontSize ?? (w > 190 ? 18 : 14)}px`,
    color: tone.text,
    fontStyle: 'bold',
    align: 'center',
    stroke: rgba(tone.shadow),
    strokeThickness: options.tone === 'white' ? 2 : 4,
  }).setOrigin(0.5).setName('label');

  c.add([shadow, aura, bg, caps, hover, hit]);

  if (options.iconKey && scene.textures.exists(options.iconKey)) {
    const iconSize = Math.min(h - 12, 30);
    const iconBack = scene.add.ellipse(-w / 2 + iconSize / 2 + 14, 0, iconSize + 10, iconSize + 10, 0xffffff, 0.28)
      .setStrokeStyle(2, tone.inner, 0.62);
    const icon = scene.add.image(-w / 2 + iconSize / 2 + 14, 0, options.iconKey).setDisplaySize(iconSize, iconSize);
    c.add([iconBack, icon]);
  } else if (options.iconText) {
    c.add(scene.add.text(-w / 2 + 24, -1, options.iconText, {
      fontSize: `${Math.min(22, h - 12)}px`,
      stroke: rgba(tone.shadow),
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
    scene.tweens.add({ targets: c, scaleX: 1.04, scaleY: 1.04, duration: 110, ease: 'Back.easeOut' });
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

  const glow = scene.add.ellipse(0, 8, 440, 126, 0x8fe8ff, 0.20).setBlendMode(Phaser.BlendModes.ADD);
  const halo = scene.add.ellipse(0, 8, 330, 72, 0xffffff, 0.10).setBlendMode(Phaser.BlendModes.ADD);

  const wings = scene.add.graphics();
  wings.fillStyle(0xffffff, 0.78);
  wings.fillTriangle(-214, 6, -149, -37, -160, 34);
  wings.fillTriangle(-179, 14, -128, -23, -139, 40);
  wings.fillTriangle(214, 6, 149, -37, 160, 34);
  wings.fillTriangle(179, 14, 128, -23, 139, 40);
  wings.lineStyle(3, 0x86c8ff, 0.54);
  wings.strokeTriangle(-214, 6, -149, -37, -160, 34);
  wings.strokeTriangle(214, 6, 149, -37, 160, 34);

  const ribbon = scene.add.graphics();
  ribbon.fillStyle(0x1e63b5, 0.96);
  ribbon.fillRoundedRect(-178, -6, 356, 54, 21);
  ribbon.fillStyle(0x6fd5ff, 0.18);
  ribbon.fillRoundedRect(-163, 0, 326, 18, 10);
  ribbon.lineStyle(5, 0x183b75, 0.88);
  ribbon.strokeRoundedRect(-178, -6, 356, 54, 21);
  ribbon.lineStyle(2, 0xffda6d, 0.82);
  ribbon.strokeRoundedRect(-171, 1, 342, 40, 16);

  const crown = scene.add.graphics();
  crown.fillStyle(0xffc94b, 0.98);
  crown.fillTriangle(-45, -48, -20, -15, -56, -15);
  crown.fillTriangle(0, -64, 26, -15, -26, -15);
  crown.fillTriangle(45, -48, 56, -15, 20, -15);
  crown.fillRoundedRect(-60, -18, 120, 25, 9);
  crown.fillStyle(0xfff0a6, 0.45);
  crown.fillRoundedRect(-44, -12, 88, 8, 4);
  crown.lineStyle(3, 0x70410f, 0.92);
  crown.strokeRoundedRect(-60, -18, 120, 25, 9);
  crown.fillStyle(0x6fe9ff, 0.96);
  crown.fillCircle(0, -17, 6);
  crown.fillStyle(0xff6b7b, 0.92);
  crown.fillCircle(-34, -16, 4);
  crown.fillCircle(34, -16, 4);

  const title = scene.add.text(0, 12, 'KINGDOM', {
    fontSize: '39px',
    color: '#ffe08c',
    fontStyle: 'bold',
    stroke: '#243f7b',
    strokeThickness: 8,
    shadow: { offsetX: 0, offsetY: 4, color: '#000000', blur: 5, fill: true },
  }).setOrigin(0.5);

  const title2 = scene.add.text(0, 44, 'SEED', {
    fontSize: '31px',
    color: '#f7fbff',
    fontStyle: 'bold',
    stroke: '#2453a0',
    strokeThickness: 7,
    shadow: { offsetX: 0, offsetY: 3, color: '#000000', blur: 4, fill: true },
  }).setOrigin(0.5);

  const stars = [
    addTinyStar(scene, -116, -8, 9, 0xfff1a8, 0.72),
    addTinyStar(scene, 116, -8, 9, 0xfff1a8, 0.72),
    addTinyStar(scene, 0, -78, 8, 0xffffff, 0.65),
  ];

  c.add([glow, halo, wings, ribbon, crown, title, title2, ...stars]);
  scene.tweens.add({ targets: glow, alpha: 0.32, scaleX: 1.04, scaleY: 1.08, duration: 1700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  scene.tweens.add({ targets: crown, y: -2, duration: 1900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  stars.forEach((star, index) => {
    scene.tweens.add({ targets: star, angle: index % 2 ? -18 : 18, alpha: 0.32, duration: 1300 + index * 180, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  });
  return c;
}

export function addStatChip(scene: Phaser.Scene, x: number, y: number, label: string, value: string, tone: CodeUiTone = 'blue', depth = 30): Phaser.GameObjects.Container {
  const c = addCodePanel(scene, { x, y, width: 154, height: 34, radius: 16, depth, fill: tone === 'gold' ? 0xfff5d4 : 0xf0f8ff, fillAlpha: 0.84, stroke: TONES[tone].stroke, strokeAlpha: 0.60, glow: TONES[tone].spark });
  c.add(scene.add.text(-56, 0, label, { fontSize: '10px', color: '#46679a', fontStyle: 'bold' }).setOrigin(0, 0.5));
  c.add(scene.add.text(58, 0, value, { fontSize: '14px', color: tone === 'gold' ? '#a45b13' : '#24528f', fontStyle: 'bold', stroke: '#ffffff', strokeThickness: 2 }).setOrigin(1, 0.5));
  return c;
}

export function addClickSpark(scene: Phaser.Scene, x: number, y: number, depth = 1000): void {
  const ring = scene.add.ellipse(x, y, 18, 18, 0xffffff, 0)
    .setStrokeStyle(3, 0xffd66d, 0.9)
    .setDepth(depth);
  const ring2 = scene.add.ellipse(x, y, 26, 26, 0xffffff, 0)
    .setStrokeStyle(2, 0x9eeeff, 0.65)
    .setDepth(depth + 1);
  const dot = scene.add.ellipse(x, y, 8, 8, 0xffffff, 0.75).setDepth(depth + 2);
  for (let i = 0; i < 6; i += 1) {
    const angle = (Math.PI * 2 * i) / 6;
    const spark = addTinyStar(scene, x + Math.cos(angle) * 12, y + Math.sin(angle) * 12, 7, i % 2 ? 0x9eeeff : 0xffd66d, 0.80).setDepth(depth + 3);
    scene.tweens.add({ targets: spark, x: x + Math.cos(angle) * 36, y: y + Math.sin(angle) * 36, alpha: 0, scaleX: 0.4, scaleY: 0.4, duration: 360, ease: 'Cubic.easeOut', onComplete: () => spark.destroy() });
  }
  scene.tweens.add({ targets: ring, scaleX: 3.2, scaleY: 3.2, alpha: 0, duration: 320, ease: 'Cubic.easeOut', onComplete: () => ring.destroy() });
  scene.tweens.add({ targets: ring2, scaleX: 2.4, scaleY: 2.4, alpha: 0, duration: 390, ease: 'Cubic.easeOut', onComplete: () => ring2.destroy() });
  scene.tweens.add({ targets: dot, scaleX: 0.15, scaleY: 0.15, alpha: 0, duration: 220, ease: 'Sine.easeOut', onComplete: () => dot.destroy() });
}

export function addFloatingSparkles(scene: Phaser.Scene, count = 16, depth = 8): void {
  for (let i = 0; i < count; i += 1) {
    const size = Phaser.Math.Between(4, 10);
    const x = Phaser.Math.Between(55, 905);
    const y = Phaser.Math.Between(55, 500);
    const color = Phaser.Math.Between(0, 2) === 0 ? 0xffe59a : Phaser.Math.Between(0, 1) ? 0xffffff : 0x9eeeff;
    const spark = addTinyStar(scene, x, y, size, color, Phaser.Math.FloatBetween(0.18, 0.48)).setDepth(depth).setBlendMode(Phaser.BlendModes.ADD);
    const mote = scene.add.circle(x + Phaser.Math.Between(-12, 12), y + Phaser.Math.Between(-10, 10), Phaser.Math.FloatBetween(1.4, 3.3), color, Phaser.Math.FloatBetween(0.10, 0.26)).setDepth(depth - 0.1).setBlendMode(Phaser.BlendModes.ADD);
    scene.tweens.add({
      targets: spark,
      y: y - Phaser.Math.Between(12, 32),
      angle: Phaser.Math.Between(-28, 28),
      alpha: Phaser.Math.FloatBetween(0.05, 0.34),
      duration: Phaser.Math.Between(2200, 4700),
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
    scene.tweens.add({
      targets: mote,
      y: mote.y - Phaser.Math.Between(8, 26),
      alpha: Phaser.Math.FloatBetween(0.04, 0.20),
      duration: Phaser.Math.Between(2300, 5200),
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }
}
