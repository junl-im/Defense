import Phaser from 'phaser';

function hasTexture(scene: Phaser.Scene, key: string): boolean {
  return scene.textures.exists(key);
}

function addTextShadow(style: Phaser.Types.GameObjects.Text.TextStyle = {}): Phaser.Types.GameObjects.Text.TextStyle {
  return {
    ...style,
    shadow: { offsetX: 0, offsetY: 3, color: '#000000', blur: 3, fill: true },
  };
}

export function showBattleStartLoading(scene: Phaser.Scene, stageTitle: string, subtitle = '방어선을 전개하는 중'): void {
  const overlay = scene.add.container(480, 270).setDepth(250);
  const blocker = scene.add.rectangle(0, 0, 960, 540, 0x020611, 0.78).setInteractive();
  const vignette = scene.add.rectangle(0, 0, 960, 540, 0x000000, 0.18);
  const frame = hasTexture(scene, 'ui-battle-loading-v42')
    ? scene.add.image(0, 0, 'ui-battle-loading-v42').setDisplaySize(650, 286)
    : scene.add.rectangle(0, 0, 650, 286, 0x121b2a, 0.96).setStrokeStyle(3, 0xf7d36b, 0.45);
  const crest = hasTexture(scene, 'ui-loading-crest-v42')
    ? scene.add.image(0, -82, 'ui-loading-crest-v42').setDisplaySize(102, 102)
    : scene.add.circle(0, -82, 48, 0xb98935, 0.92).setStrokeStyle(3, 0xffefb0, 0.52);
  const title = scene.add.text(0, -16, stageTitle, addTextShadow({ fontSize: '31px', color: '#fff4c2', fontStyle: 'bold' })).setOrigin(0.5);
  const sub = scene.add.text(0, 30, subtitle, addTextShadow({ fontSize: '15px', color: '#d8c39a', fontStyle: 'bold' })).setOrigin(0.5);
  const barBack = scene.add.rectangle(0, 84, 420, 12, 0x060912, 0.92).setStrokeStyle(1, 0xfff0bd, 0.24);
  const bar = scene.add.rectangle(-208, 84, 0, 8, 0xf7d36b, 0.9).setOrigin(0, 0.5);
  overlay.add([blocker, vignette, frame, crest, title, sub, barBack, bar]);
  scene.tweens.add({ targets: crest, angle: 360, duration: 1400, repeat: -1, ease: 'Linear' });
  scene.tweens.add({ targets: bar, displayWidth: 416, duration: 720, ease: 'Cubic.easeOut' });
  scene.tweens.add({ targets: overlay, alpha: 0, delay: 860, duration: 260, onComplete: () => overlay.destroy() });
}

export function addTowerPanelSurface(
  scene: Phaser.Scene,
  panel: Phaser.GameObjects.Container,
  width: number,
  height: number,
  color: number
): void {
  const shadow = scene.add.rectangle(7, 10, width, height, 0x000000, 0.32);
  const bg = hasTexture(scene, 'ui-tower-panel-v42')
    ? scene.add.image(0, 0, 'ui-tower-panel-v42').setDisplaySize(width, height)
    : scene.add.rectangle(0, 0, width, height, 0x09111f, 0.97).setStrokeStyle(3, color, 0.62);
  const top = scene.add.rectangle(0, -height / 2 + 30, width - 34, 50, color, 0.18)
    .setStrokeStyle(1, 0xffffff, 0.16);
  const gem = scene.add.circle(-width / 2 + 32, -height / 2 + 30, 11, color, 0.86)
    .setStrokeStyle(2, 0xfff0bd, 0.45);
  const edge = scene.add.rectangle(0, height / 2 - 24, width - 44, 1, 0xffe9a0, 0.22);
  panel.add([shadow, bg, top, gem, edge]);
}

export function addPremiumPanelGlints(scene: Phaser.Scene, panel: Phaser.GameObjects.Container, width: number, height: number): void {
  const glint = scene.add.rectangle(-width / 2 + 18, -height / 2 + 12, 92, 3, 0xffffff, 0.18).setOrigin(0, 0.5);
  const glint2 = scene.add.rectangle(width / 2 - 120, height / 2 - 15, 82, 2, 0xf7d36b, 0.14).setOrigin(0, 0.5);
  panel.add([glint, glint2]);
  scene.tweens.add({ targets: glint, alpha: { from: 0.12, to: 0.34 }, duration: 950, yoyo: true, repeat: -1 });
}

export function installPremiumButtonFx(scene: Phaser.Scene, target: Phaser.GameObjects.GameObject & { x: number; y: number; on: Function; setAlpha?: (value: number) => unknown }): void {
  const anyTarget = target;
  target.on('pointerdown', () => {
    scene.tweens.add({ targets: target, scaleX: 0.96, scaleY: 0.96, duration: 52, yoyo: true, ease: 'Quad.easeOut' });
    spawnClickBurst(scene, anyTarget.x, anyTarget.y);
  });
  target.on('pointerover', () => {
    if (anyTarget.setAlpha) anyTarget.setAlpha(0.92);
  });
  target.on('pointerout', () => {
    if (anyTarget.setAlpha) anyTarget.setAlpha(1);
  });
}

export function spawnClickBurst(scene: Phaser.Scene, x: number, y: number): void {
  if (hasTexture(scene, 'fx-click-burst-v42')) {
    const burst = scene.add.image(x, y, 'fx-click-burst-v42').setDepth(240).setAlpha(0.85).setScale(0.24);
    scene.tweens.add({ targets: burst, scale: 0.72, alpha: 0, duration: 260, ease: 'Cubic.easeOut', onComplete: () => burst.destroy() });
    return;
  }
  const ring = scene.add.circle(x, y, 8, 0xf7d36b, 0.28).setDepth(240).setStrokeStyle(2, 0xffffff, 0.35);
  scene.tweens.add({ targets: ring, radius: 34, alpha: 0, duration: 260, ease: 'Cubic.easeOut', onComplete: () => ring.destroy() });
}

export function addPremiumChestSpotlight(scene: Phaser.Scene, x: number, y: number): Phaser.GameObjects.Container {
  const group = scene.add.container(x, y).setDepth(93);
  const glow = hasTexture(scene, 'ui-reward-chest-glow-v42')
    ? scene.add.image(0, 0, 'ui-reward-chest-glow-v42').setDisplaySize(250, 150).setAlpha(0.62)
    : scene.add.ellipse(0, 0, 250, 132, 0xf7d36b, 0.12);
  const rays = scene.add.star(0, -6, 12, 54, 118, 0xffe69c, 0.13);
  group.add([rays, glow]);
  scene.tweens.add({ targets: rays, angle: 360, duration: 9200, repeat: -1, ease: 'Linear' });
  scene.tweens.add({ targets: glow, alpha: { from: 0.38, to: 0.8 }, scaleX: 1.04, scaleY: 1.04, duration: 900, yoyo: true, repeat: -1 });
  return group;
}

export function showPremiumChestCharge(scene: Phaser.Scene, x: number, y: number): void {
  const group = scene.add.container(x, y).setDepth(260);
  const dim = scene.add.rectangle(0, 0, 960, 540, 0x020611, 0.42).setInteractive();
  const ring = hasTexture(scene, 'ui-reward-chest-glow-v42')
    ? scene.add.image(0, 0, 'ui-reward-chest-glow-v42').setDisplaySize(310, 190)
    : scene.add.ellipse(0, 0, 310, 190, 0xf7d36b, 0.18);
  const text = scene.add.text(0, 108, '보급 상자 개봉', addTextShadow({ fontSize: '27px', color: '#fff4c2', fontStyle: 'bold' })).setOrigin(0.5);
  group.add([dim, ring, text]);
  scene.tweens.add({ targets: ring, scale: 1.36, alpha: 0, duration: 560, ease: 'Cubic.easeOut' });
  scene.tweens.add({ targets: text, y: 88, alpha: 0, duration: 560, ease: 'Cubic.easeOut' });
  scene.time.delayedCall(600, () => group.destroy());
}

export function showPremiumToast(scene: Phaser.Scene, message: string, tone: 'success' | 'warning' | 'info' = 'info'): void {
  const color = tone === 'success' ? 0x8fdc7a : tone === 'warning' ? 0xffb347 : 0x7cc7ff;
  const toast = scene.add.container(480, 72).setDepth(255).setAlpha(0);
  const bg = scene.add.rectangle(0, 0, 470, 48, 0x07101a, 0.92).setStrokeStyle(2, color, 0.55);
  const gem = scene.add.circle(-212, 0, 9, color, 0.92).setStrokeStyle(2, 0xffffff, 0.32);
  const text = scene.add.text(-190, 0, message, addTextShadow({ fontSize: '16px', color: '#fff4c2', fontStyle: 'bold' })).setOrigin(0, 0.5);
  toast.add([bg, gem, text]);
  scene.tweens.add({ targets: toast, alpha: 1, y: 88, duration: 180, ease: 'Cubic.easeOut' });
  scene.tweens.add({ targets: toast, alpha: 0, y: 66, delay: 1450, duration: 220, onComplete: () => toast.destroy() });
}
