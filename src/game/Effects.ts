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

function spawnSheetFx(
  scene: Phaser.Scene,
  textureKey: string,
  animationKey: string,
  x: number,
  y: number,
  scale = 1,
  depth = 70
): void {
  if (!scene.textures.exists(textureKey)) return;
  const fx = scene.add.sprite(x, y, textureKey, 0).setScale(scale).setDepth(depth);
  fx.play(animationKey);
  fx.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => fx.destroy());
}

export function spawnBuildDust(scene: Phaser.Scene, x: number, y: number): void {
  spawnSheetFx(scene, 'fx-build-dust', 'fx-build-dust-play', x, y + 8, 1.12, 68);
  for (let i = 0; i < 8; i++) {
    const angle = -Math.PI + (Math.PI * i) / 7;
    const chip = scene.add.rectangle(x, y + 14, 6, 4, 0xc79c5a, 0.88)
      .setRotation(angle)
      .setDepth(67);
    scene.tweens.add({
      targets: chip,
      x: x + Math.cos(angle) * Phaser.Math.Between(20, 42),
      y: y + 14 + Math.sin(angle) * Phaser.Math.Between(8, 26),
      alpha: 0,
      duration: 380,
      ease: 'Quad.easeOut',
      onComplete: () => chip.destroy()
    });
  }
}

export function spawnUpgradeBurst(scene: Phaser.Scene, x: number, y: number, color = 0xffd36b): void {
  spawnSheetFx(scene, 'fx-upgrade-burst', 'fx-upgrade-burst-play', x, y - 4, 1.2, 72);
  spawnImpactRing(scene, x, y - 2, 42, color, 0.18, 420);
  for (let i = 0; i < 10; i++) {
    const angle = (Math.PI * 2 * i) / 10;
    const gem = scene.add.polygon(x, y - 4, [0, -9, 7, 0, 0, 9, -7, 0], color, 0.86).setDepth(73);
    scene.tweens.add({
      targets: gem,
      x: x + Math.cos(angle) * 44,
      y: y - 4 + Math.sin(angle) * 34,
      scale: 0.2,
      alpha: 0,
      duration: 470,
      ease: 'Quad.easeOut',
      onComplete: () => gem.destroy()
    });
  }
}

export function spawnDeathPoof(scene: Phaser.Scene, x: number, y: number, scale = 1): void {
  spawnSheetFx(scene, 'fx-death-poof', 'fx-death-poof-play', x, y, scale, 76);
}

export function spawnExplosionBurst(scene: Phaser.Scene, x: number, y: number, scale = 1): void {
  spawnSheetFx(scene, 'fx-explosion-burst', 'fx-explosion-burst-play', x, y, scale, 78);
}

export function spawnTowerSkillCutIn(
  scene: Phaser.Scene,
  towerKind: string,
  towerLabel: string,
  skillName: string,
  color = 0xffd36b
): void {
  const width = 960;
  const group = scene.add.container(-width, 270).setDepth(140);
  const veil = scene.add.rectangle(width / 2, 0, width, 540, 0x000000, 0.38);
  const slash = scene.add.polygon(width / 2, 0, [0, -84, 760, -132, 880, 0, 760, 132, 0, 84], color, 0.92)
    .setStrokeStyle(4, 0xfff1c2, 0.6);
  const dark = scene.add.polygon(width / 2, 0, [20, -66, 720, -108, 816, 0, 720, 108, 20, 66], 0x0b1220, 0.92)
    .setStrokeStyle(2, 0xffffff, 0.16);
  const title = scene.add.text(445, -34, towerLabel, {
    fontSize: '28px',
    color: '#fff4c2',
    fontStyle: 'bold',
    stroke: '#2a1007',
    strokeThickness: 5
  }).setOrigin(0, 0.5);
  const skill = scene.add.text(445, 18, skillName, {
    fontSize: '42px',
    color: '#ffffff',
    fontStyle: 'bold',
    stroke: '#000000',
    strokeThickness: 6
  }).setOrigin(0, 0.5);
  const badge = scene.add.circle(365, 0, 54, 0xfff1c2, 0.18).setStrokeStyle(3, 0xfff1c2, 0.85);
  const textureKey = `tower-${towerKind}-lv3`;
  let icon: Phaser.GameObjects.GameObject;
  if (scene.textures.exists(textureKey)) {
    icon = scene.add.image(365, 0, textureKey).setScale(1.5);
  } else {
    icon = scene.add.star(365, 0, 7, 18, 46, color, 0.9).setStrokeStyle(2, 0xfff1c2, 0.8);
  }
  const lineTop = scene.add.rectangle(515, -74, 380, 3, 0xfff1c2, 0.65);
  const lineBottom = scene.add.rectangle(515, 74, 380, 3, 0xfff1c2, 0.65);
  group.add([veil, slash, dark, badge, icon, title, skill, lineTop, lineBottom]);

  scene.tweens.add({
    targets: group,
    x: 0,
    duration: 210,
    ease: 'Cubic.easeOut',
    onComplete: () => {
      scene.time.delayedCall(720, () => {
        scene.tweens.add({
          targets: group,
          x: width,
          alpha: 0,
          duration: 230,
          ease: 'Cubic.easeIn',
          onComplete: () => group.destroy()
        });
      });
    }
  });

  scene.tweens.add({ targets: icon, scale: '+=0.18', duration: 240, yoyo: true, repeat: 2 });
  scene.cameras.main?.shake(120, 0.0025);
}
