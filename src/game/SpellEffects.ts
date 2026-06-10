import Phaser from 'phaser';
import type { EnemyKind } from './types';
import { ENEMIES } from './balance';
import { getBossProfile } from './MonsterIntel';
import { playSfx } from './AudioManager';

function hasTexture(scene: Phaser.Scene, key: string): boolean {
  return scene.textures.exists(key);
}

function addGlow(scene: Phaser.Scene, x: number, y: number, radius: number, color: number, alpha: number, depth = 70): Phaser.GameObjects.Arc {
  const glow = scene.add.circle(x, y, radius, color, alpha).setDepth(depth).setBlendMode(Phaser.BlendModes.ADD);
  scene.tweens.add({ targets: glow, scale: 1.25, alpha: 0, duration: 520, ease: 'Cubic.easeOut', onComplete: () => glow.destroy() });
  return glow;
}

function playSheetFx(scene: Phaser.Scene, key: string, animKey: string, x: number, y: number, scale: number, depth: number): Phaser.GameObjects.Sprite | undefined {
  if (!hasTexture(scene, key)) return undefined;
  const sprite = scene.add.sprite(x, y, key, 0).setScale(scale).setDepth(depth).setBlendMode(Phaser.BlendModes.ADD);
  if (scene.anims.exists(animKey)) sprite.play(animKey);
  scene.time.delayedCall(760, () => sprite.destroy());
  return sprite;
}

export function castPremiumMeteor(scene: Phaser.Scene, x: number, y: number, radius: number, onImpact: () => void): void {
  playSfx(scene, 'sfx_explosion');

  const reticle = scene.add.container(x, y).setDepth(76);
  const outer = scene.add.circle(0, 0, radius, 0xff573b, 0.1).setStrokeStyle(3, 0xffd66b, 0.88);
  const inner = scene.add.circle(0, 0, radius * 0.42, 0xfff0a3, 0.08).setStrokeStyle(2, 0xffffff, 0.42);
  const crossA = scene.add.rectangle(0, 0, radius * 1.9, 3, 0xffd66b, 0.55);
  const crossB = scene.add.rectangle(0, 0, radius * 1.9, 3, 0xffd66b, 0.55).setRotation(Math.PI / 2);
  reticle.add([outer, inner, crossA, crossB]);

  scene.tweens.add({ targets: reticle, scale: 0.58, alpha: 0.95, duration: 210, ease: 'Back.easeIn' });
  scene.tweens.add({ targets: reticle, angle: 90, duration: 230, ease: 'Cubic.easeIn' });

  const comet = scene.add.circle(x - 170, y - 150, 12, 0xfff0a3, 1).setDepth(78).setBlendMode(Phaser.BlendModes.ADD);
  const tail = scene.add.rectangle(x - 205, y - 178, 95, 8, 0xff733b, 0.6).setRotation(0.72).setDepth(77).setBlendMode(Phaser.BlendModes.ADD);
  scene.tweens.add({ targets: [comet, tail], x, y, duration: 230, ease: 'Cubic.easeIn' });

  scene.time.delayedCall(235, () => {
    reticle.destroy();
    comet.destroy();
    tail.destroy();
    onImpact();
    addGlow(scene, x, y, radius * 1.22, 0xffc76b, 0.34, 78);
    playSheetFx(scene, 'fx-meteor-impact-v32', 'fx-meteor-impact-v32-play', x, y, 1.85, 79);
    const ring = scene.add.circle(x, y, radius * 0.42, 0xffffff, 0).setStrokeStyle(4, 0xffefb0, 0.8).setDepth(79).setBlendMode(Phaser.BlendModes.ADD);
    scene.tweens.add({ targets: ring, scale: 2.25, alpha: 0, duration: 360, ease: 'Cubic.easeOut', onComplete: () => ring.destroy() });
    scene.cameras.main.shake(190, 0.007);
  });
}

export function castMercenaryGateFx(scene: Phaser.Scene, x: number, y: number): void {
  playSfx(scene, 'sfx_build');
  addGlow(scene, x, y, 52, 0x7dffb5, 0.22, 72);
  playSheetFx(scene, 'fx-holy-gate-v32', 'fx-holy-gate-v32-play', x, y, 1.25, 73);
  const gate = scene.add.rectangle(x, y - 16, 92, 58, 0x8dffd1, 0.05).setStrokeStyle(3, 0xb9ffd3, 0.56).setDepth(73).setBlendMode(Phaser.BlendModes.ADD);
  scene.tweens.add({ targets: gate, y: y - 28, scaleY: 1.3, alpha: 0, duration: 520, ease: 'Cubic.easeOut', onComplete: () => gate.destroy() });
}

export function castHeroStompPremiumFx(scene: Phaser.Scene, x: number, y: number): void {
  playSfx(scene, 'sfx_hit');
  playSheetFx(scene, 'fx-earth-stomp-v32', 'fx-earth-stomp-v32-play', x, y + 8, 1.35, 74);
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2;
    const rock = scene.add.rectangle(x, y + 8, 8 + (i % 3) * 3, 5, 0x9b7447, 0.85).setRotation(angle).setDepth(74);
    scene.tweens.add({
      targets: rock,
      x: x + Math.cos(angle) * (44 + (i % 3) * 12),
      y: y + 8 + Math.sin(angle) * (28 + (i % 2) * 8),
      alpha: 0,
      angle: Phaser.Math.RadToDeg(angle) + 120,
      duration: 430,
      ease: 'Cubic.easeOut',
      onComplete: () => rock.destroy(),
    });
  }
  scene.cameras.main.shake(120, 0.004);
}

export function showArcaneSurge(scene: Phaser.Scene, x: number, y: number, color = 0x8fdcff): void {
  addGlow(scene, x, y, 44, color, 0.16, 69);
  playSheetFx(scene, 'fx-arcane-surge-v32', 'fx-arcane-surge-v32-play', x, y, 1.1, 70);
}

export function openBossArenaRift(scene: Phaser.Scene, kind: EnemyKind): void {
  const cfg = ENEMIES[kind];
  const color = cfg.accentColor ?? 0xff5b4f;
  const overlay = scene.add.container(480, 270).setDepth(64);
  const wash = scene.add.rectangle(0, 0, 960, 540, color, 0.06).setBlendMode(Phaser.BlendModes.ADD);
  const top = scene.add.rectangle(0, -254, 960, 20, color, 0.28).setBlendMode(Phaser.BlendModes.ADD);
  const bottom = scene.add.rectangle(0, 254, 960, 20, color, 0.24).setBlendMode(Phaser.BlendModes.ADD);
  overlay.add([wash, top, bottom]);
  scene.tweens.add({ targets: wash, alpha: 0.015, duration: 1200, yoyo: true, repeat: 2 });
  scene.tweens.add({ targets: [top, bottom], alpha: 0, duration: 2400, delay: 900, onComplete: () => overlay.destroy() });

  for (let i = 0; i < 4; i++) {
    playSheetFx(scene, 'fx-boss-arena-v32', 'fx-boss-arena-v32-play', 190 + i * 190, 86 + (i % 2) * 365, 1.15, 65);
  }
}

export function showBossArenaPattern(scene: Phaser.Scene, payload: { label: string; pattern: string; kind?: EnemyKind }): void {
  const accent = payload.kind ? (ENEMIES[payload.kind].accentColor ?? 0xff5b4f) : 0xff5b4f;
  playSfx(scene, 'sfx_wave');
  const banner = scene.add.container(480, 96).setDepth(129);

  if (scene.textures.exists('ui-boss-pattern-banner-v32')) {
    banner.add(scene.add.image(0, 0, 'ui-boss-pattern-banner-v32').setDisplaySize(760, 170));
  } else {
    banner.add(scene.add.rectangle(0, 0, 760, 126, 0x12080b, 0.94).setStrokeStyle(3, accent, 0.78));
  }

  const profile = payload.kind ? getBossProfile(payload.kind) : undefined;
  const title = scene.add.text(0, -36, payload.label || profile?.title || '보스 패턴', {
    fontSize: '30px', color: '#fff0c2', fontStyle: 'bold',
    shadow: { offsetX: 0, offsetY: 4, color: '#000000', blur: 4, fill: true },
  }).setOrigin(0.5);
  const pattern = scene.add.text(0, 4, payload.pattern, {
    fontSize: '19px', color: '#ffd26b', fontStyle: 'bold',
    shadow: { offsetX: 0, offsetY: 2, color: '#000000', blur: 2, fill: true },
  }).setOrigin(0.5);
  const hint = scene.add.text(0, 38, patternHint(payload.pattern), {
    fontSize: '13px', color: '#dbe7ff', fixedWidth: 640, align: 'center',
  }).setOrigin(0.5);
  banner.add([title, pattern, hint]);
  banner.setAlpha(0).setScale(1.05);
  scene.tweens.add({ targets: banner, alpha: 1, scale: 1, y: 118, duration: 180, ease: 'Cubic.easeOut' });
  scene.tweens.add({ targets: banner, alpha: 0, y: 76, duration: 260, ease: 'Cubic.easeIn', delay: 1400, onComplete: () => banner.destroy() });
  const flash = scene.add.rectangle(480, 270, 960, 540, accent, 0.1).setDepth(127).setBlendMode(Phaser.BlendModes.ADD);
  scene.tweens.add({ targets: flash, alpha: 0, duration: 180, onComplete: () => flash.destroy() });
}

function patternHint(pattern: string): string {
  if (pattern.includes('피해') || pattern.includes('장막')) return '피해 감소 시간에는 병영으로 묶고, 끝나는 순간 메테오/긴급 강화를 집중하세요.';
  if (pattern.includes('회복') || pattern.includes('재점화')) return '재생 패턴입니다. 화력을 분산하지 말고 선두 우선/강적 우선으로 집중하세요.';
  if (pattern.includes('돌진') || pattern.includes('속도')) return '돌파 패턴입니다. 병력 보충과 둔화 최종 진화를 우선 사용하세요.';
  if (pattern.includes('지진')) return '전선 붕괴 패턴입니다. 병영 재보충과 용병 소환으로 시간을 벌어야 합니다.';
  return '보스 패턴 발동. 타워 긴급 강화와 스펠 타이밍을 맞추세요.';
}
