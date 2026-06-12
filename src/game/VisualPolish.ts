import Phaser from 'phaser';
import { getRenderProfile, lowPowerMode, setQualityTier, setRuntimeQualityTier, type QualityTier } from './QualityManager';

export type StageTheme = 'forest' | 'canyon' | 'swamp' | 'fortress' | string;

type PerfSample = {
  elapsed: number;
  frames: number;
  badWindows: number;
  label?: Phaser.GameObjects.Text;
};

function palette(theme: StageTheme): { glow: number; shadow: number; accent: number; fog: number } {
  if (theme === 'canyon') return { glow: 0xffa85f, shadow: 0x230f0a, accent: 0xf0b35f, fog: 0x512417 };
  if (theme === 'swamp') return { glow: 0xa9ffca, shadow: 0x071512, accent: 0x96c46b, fog: 0x18372e };
  if (theme === 'fortress') return { glow: 0xff664c, shadow: 0x0b0508, accent: 0xffc16b, fog: 0x2c1114 };
  return { glow: 0xc7ff9b, shadow: 0x07140d, accent: 0xe1c06a, fog: 0x173625 };
}

export function drawBattlePolish(scene: Phaser.Scene, theme: StageTheme): void {
  const profile = getRenderProfile();
  const colors = palette(theme);

  const vignette = scene.add.graphics().setDepth(6);
  vignette.fillStyle(0x000000, profile.tier === 'low' ? 0.09 : 0.14);
  vignette.fillRect(0, 64, 960, 18);
  vignette.fillRect(0, 458, 960, 22);
  vignette.fillStyle(colors.shadow, profile.tier === 'high' ? 0.18 : 0.11);
  vignette.fillRect(0, 64, 38, 420);
  vignette.fillRect(922, 64, 38, 420);

  drawOrnateCombatFrame(scene, colors.accent);
  if (lowPowerMode()) return;

  const rays = scene.add.graphics().setDepth(7).setAlpha(profile.tier === 'high' ? 0.2 : 0.13);
  for (let i = 0; i < 6; i++) {
    const x = 70 + i * 165;
    rays.fillStyle(colors.glow, 0.055);
    rays.fillTriangle(x, 64, x + 92, 64, x + 24, 452);
  }

  for (let i = 0; i < profile.ambientMotes; i++) {
    const x = 55 + ((i * 109 + 31) % 850);
    const y = 102 + ((i * 73 + 17) % 330);
    const mote = scene.add.circle(x, y, theme === 'swamp' ? 4 : 3, colors.glow, profile.tier === 'high' ? 0.12 : 0.08).setDepth(8);
    scene.tweens.add({
      targets: mote,
      x: x + Phaser.Math.Between(-10, 10),
      y: y - Phaser.Math.Between(10, 24),
      alpha: 0.015,
      duration: 1500 + i * 95,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }
}

export function drawOrnateCombatFrame(scene: Phaser.Scene, accent = 0xf7d36b): void {
  const g = scene.add.graphics().setDepth(73);
  g.lineStyle(2, accent, 0.42);
  g.strokeRoundedRect(9, 73, 942, 392, 14);
  g.lineStyle(1, 0xffffff, 0.1);
  g.strokeRoundedRect(14, 78, 932, 382, 10);

  const corners = [
    [22, 86, 0],
    [938, 86, Math.PI / 2],
    [938, 448, Math.PI],
    [22, 448, -Math.PI / 2],
  ] as const;

  corners.forEach(([x, y, rot]) => {
    const ornament = scene.add.container(x, y).setDepth(74).setRotation(rot);
    const barA = scene.add.rectangle(18, 0, 36, 4, accent, 0.45).setOrigin(0, 0.5);
    const barB = scene.add.rectangle(0, 18, 4, 36, accent, 0.45).setOrigin(0.5, 0);
    const dot = scene.add.circle(4, 4, 5, accent, 0.5).setStrokeStyle(1, 0xffffff, 0.24);
    ornament.add([barA, barB, dot]);
  });
}

export function installScenePerformanceWatch(scene: Phaser.Scene): void {
  const sample: PerfSample = { elapsed: 0, frames: 0, badWindows: 0 };
  const debug = new URLSearchParams(window.location.search).has('perf');
  if (debug) {
    sample.label = scene.add.text(912, 86, '', {
      fontSize: '12px',
      color: '#a9ffca',
      backgroundColor: '#00000088',
      padding: { x: 5, y: 3 },
    }).setOrigin(1, 0).setDepth(160);
  }

  const updateHandler = (_time: number, delta: number): void => {
    sample.elapsed += delta;
    sample.frames += 1;
    if (sample.elapsed < 1800) return;

    const fps = Math.round((sample.frames * 1000) / sample.elapsed);
    const profile = getRenderProfile();
    sample.label?.setText(`${profile.label} ${fps}fps`);

    if (fps < 34 && profile.tier !== 'low') sample.badWindows += 1;
    else sample.badWindows = Math.max(0, sample.badWindows - 1);

    if (sample.badWindows >= 3) {
      const next: QualityTier = profile.tier === 'high' ? 'medium' : 'low';
      setRuntimeQualityTier(next);
      sample.badWindows = 0;
      sample.label?.setText(`${getRenderProfile().label} auto`);
      scene.events.emit('kingdom-seed:runtime-quality-fallback', getRenderProfile());
      window.dispatchEvent(new CustomEvent('kingdom-seed:memory-pressure', { detail: { reason: 'auto-quality-fallback', fps, at: Date.now() } }));
    }

    sample.elapsed = 0;
    sample.frames = 0;
  };

  scene.events.on(Phaser.Scenes.Events.UPDATE, updateHandler);
  const cleanup = (): void => {
    scene.events.off(Phaser.Scenes.Events.UPDATE, updateHandler);
    sample.label?.destroy();
    sample.label = undefined;
  };
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, cleanup);
  scene.events.once(Phaser.Scenes.Events.DESTROY, cleanup);
}

export function createQualityToggleButton(scene: Phaser.Scene, x: number, y: number): Phaser.GameObjects.Container {
  const profile = getRenderProfile();
  const box = scene.add.container(x, y).setDepth(160);
  const bg = scene.add.rectangle(0, 0, 96, 30, 0x101820, 0.76).setStrokeStyle(1, 0xf7d36b, 0.35);
  const label = scene.add.text(0, 0, `품질 ${profile.label}`, { fontSize: '12px', color: '#fff4c2', fontStyle: 'bold' }).setOrigin(0.5);
  box.add([bg, label]);
  bg.setInteractive({ useHandCursor: true });
  bg.on('pointerdown', () => {
    const current = getRenderProfile().tier;
    const next = current === 'low' ? 'medium' : current === 'medium' ? 'high' : 'low';
    const updated = setQualityTier(next);
    label.setText(`품질 ${updated.label}`);
  });
  return box;
}
