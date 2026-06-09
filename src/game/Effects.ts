import Phaser from 'phaser';

export type ProjectileStyle = 'arrow' | 'magic' | 'shell' | 'slash' | 'spark';

export function spawnFloatingText(
  scene: Phaser.Scene,
  x: number,
  y: number,
  text: string,
  color = '#ffffff',
  fontSize = 16
): void {
  const label = scene.add.text(x, y, text, {
    fontSize: `${fontSize}px`,
    color,
    fontStyle: 'bold',
    stroke: '#0b1220',
    strokeThickness: 3
  }).setOrigin(0.5).setDepth(95);

  scene.tweens.add({
    targets: label,
    y: y - 34,
    alpha: 0,
    scale: 1.14,
    duration: 640,
    ease: 'Quad.easeOut',
    onComplete: () => label.destroy()
  });
}

export function spawnHitSpark(scene: Phaser.Scene, x: number, y: number, color = 0xfff1c2): void {
  const sparks: Phaser.GameObjects.GameObject[] = [];
  for (let i = 0; i < 7; i++) {
    const angle = (Math.PI * 2 * i) / 7 + Phaser.Math.FloatBetween(-0.22, 0.22);
    const dist = Phaser.Math.Between(14, 28);
    const spark = scene.add.rectangle(x, y, Phaser.Math.Between(4, 8), 2, color, 0.9)
      .setRotation(angle)
      .setDepth(60);
    sparks.push(spark);
    scene.tweens.add({
      targets: spark,
      x: x + Math.cos(angle) * dist,
      y: y + Math.sin(angle) * dist,
      alpha: 0,
      duration: 230,
      ease: 'Quad.easeOut',
      onComplete: () => spark.destroy()
    });
  }
}

export function spawnImpactRing(
  scene: Phaser.Scene,
  x: number,
  y: number,
  radius: number,
  color = 0xfff1c2,
  alpha = 0.22,
  duration = 320
): void {
  const ring = scene.add.circle(x, y, radius * 0.52, color, alpha)
    .setStrokeStyle(2, color, Math.min(0.8, alpha + 0.36))
    .setDepth(58);
  scene.tweens.add({
    targets: ring,
    scale: 1.75,
    alpha: 0,
    duration,
    ease: 'Quad.easeOut',
    onComplete: () => ring.destroy()
  });
}

export function spawnMuzzleFlash(scene: Phaser.Scene, x: number, y: number, color = 0xffffff): void {
  const flash = scene.add.star(x, y, 7, 3, 12, color, 0.86).setDepth(62);
  scene.tweens.add({
    targets: flash,
    scale: 1.55,
    alpha: 0,
    duration: 120,
    onComplete: () => flash.destroy()
  });
}

export function spawnProjectile(
  scene: Phaser.Scene,
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  color: number,
  style: ProjectileStyle,
  duration: number,
  onImpact: () => void
): void {
  let projectile: Phaser.GameObjects.Arc | Phaser.GameObjects.Rectangle | Phaser.GameObjects.Star | Phaser.GameObjects.Ellipse;
  if (style === 'arrow') {
    projectile = scene.add.rectangle(fromX, fromY, 22, 4, color, 1).setStrokeStyle(1, 0x2b1808, 0.55);
  } else if (style === 'shell') {
    projectile = scene.add.circle(fromX, fromY, 7, color, 1).setStrokeStyle(2, 0x1a0e05, 0.55);
  } else if (style === 'slash') {
    projectile = scene.add.ellipse(fromX, fromY, 22, 8, color, 0.82);
  } else if (style === 'spark') {
    projectile = scene.add.star(fromX, fromY, 6, 3, 10, color, 0.92);
  } else {
    projectile = scene.add.circle(fromX, fromY, 7, color, 0.92).setStrokeStyle(2, 0xffffff, 0.35);
  }

  const angle = Phaser.Math.Angle.Between(fromX, fromY, toX, toY);
  projectile.rotation = angle;
  projectile.setDepth(61);

  const glow = scene.add.circle(fromX, fromY, style === 'shell' ? 13 : 10, color, 0.16).setDepth(60);
  scene.tweens.add({
    targets: [projectile, glow],
    x: toX,
    y: toY,
    duration,
    ease: style === 'shell' ? 'Quad.easeIn' : 'Linear',
    onComplete: () => {
      projectile.destroy();
      glow.destroy();
      onImpact();
    }
  });
}

export function spawnWaveBanner(scene: Phaser.Scene, title: string, subtitle: string): void {
  const group = scene.add.container(480, -70).setDepth(98);
  const bg = scene.add.rectangle(0, 0, 620, 72, 0x0b1220, 0.92)
    .setStrokeStyle(2, 0xf7d36b, 0.55);
  const topLine = scene.add.text(0, -13, title, {
    fontSize: '27px',
    color: '#f7d36b',
    fontStyle: 'bold',
    stroke: '#000000',
    strokeThickness: 4
  }).setOrigin(0.5);
  const bottomLine = scene.add.text(0, 20, subtitle, {
    fontSize: '16px',
    color: '#dbe7ff',
    fontStyle: 'bold'
  }).setOrigin(0.5);
  group.add([bg, topLine, bottomLine]);

  scene.tweens.add({ targets: group, y: 86, duration: 260, ease: 'Back.easeOut' });
  scene.time.delayedCall(1450, () => {
    scene.tweens.add({
      targets: group,
      y: -90,
      alpha: 0,
      duration: 260,
      ease: 'Quad.easeIn',
      onComplete: () => group.destroy()
    });
  });
}

export function pulseButton(scene: Phaser.Scene, target: Phaser.GameObjects.GameObject): void {
  scene.tweens.add({
    targets: target,
    scale: 1.06,
    duration: 90,
    yoyo: true,
    ease: 'Quad.easeOut'
  });
}

export function shakeCamera(scene: Phaser.Scene, intensity = 0.004, duration = 120): void {
  const camera = scene.cameras.main;
  if (camera) camera.shake(duration, intensity);
}
