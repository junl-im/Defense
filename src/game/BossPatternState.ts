import Phaser from 'phaser';
import type { EnemyKind } from './types';
import type { Tower } from './Tower';
import type { Soldier } from './Soldier';
import type { Enemy } from './Enemy';
import { ENEMIES } from './balance';
import { spawnImpactRing, spawnFloatingText } from './Effects';
import { playSfx } from './AudioManager';

type BossPatternPayload = {
  kind?: EnemyKind;
  label: string;
  pattern: string;
  x?: number;
  y?: number;
};

export function applyBossPatternState(
  scene: Phaser.Scene,
  payload: BossPatternPayload,
  towers: Tower[],
  mercenaries: Soldier[],
  enemies: Enemy[]
): void {
  if (!payload.kind) return;
  const cfg = ENEMIES[payload.kind];
  const color = cfg?.accentColor ?? 0xff5b4f;
  const x = payload.x ?? 480;
  const y = payload.y ?? 260;

  if (payload.kind === 'demonlord') {
    towers.forEach((tower) => tower.applySuppression(3300, 0.78, 1.36, color, '지옥 장막'));
    showBattlefieldStatus(scene, '지옥 장막', '타워 피해 감소 / 재장전 지연', color);
    return;
  }

  if (payload.kind === 'dragon') {
    towers.forEach((tower) => {
      if (Phaser.Math.Distance.Between(tower.x, tower.y, x, y) < 310) tower.applySuppression(2600, 0.9, 1.24, 0xff6b2a, '화염 공포');
    });
    spawnFireLanes(scene, x, y, 0xff6b2a);
    showBattlefieldStatus(scene, '화염 포효', '가까운 타워 재장전 지연', 0xff6b2a);
    return;
  }

  if (payload.kind === 'titan') {
    towers.forEach((tower) => tower.applySuppression(2400, 0.86, 1.2, 0x88e7ff, '공허 왜곡'));
    enemies.filter((enemy) => enemy.config.threat !== 'boss').forEach((enemy) => enemy.receiveSlow(0.82, 1800));
    showBattlefieldStatus(scene, '공허 왜곡', '타워 재장전 지연 / 잡몹도 순간 응집', 0x88e7ff);
    return;
  }

  if (payload.kind === 'phoenix') {
    towers.filter((tower) => tower.config.kind === 'artillery' || tower.config.kind === 'barracks').forEach((tower) => tower.applySuppression(2400, 0.82, 1.12, 0xffd36b, '재점화 열기'));
    showBattlefieldStatus(scene, '재점화', '포탑/병영 전선 압박', 0xffd36b);
    return;
  }

  if (payload.kind === 'ogre' || payload.kind === 'golem' || payload.kind === 'abomination') {
    stunFrontline(scene, x, y, towers, mercenaries, color);
    showBattlefieldStatus(scene, '지진 강타', '병영 전선 일시 경직', color);
    return;
  }

  if (cfg?.threat === 'boss') {
    towers.forEach((tower) => tower.applySuppression(1800, 0.92, 1.12, color, '보스 압박'));
    showBattlefieldStatus(scene, payload.pattern || '보스 패턴', '짧은 전장 압박 발생', color);
  }
}

function showBattlefieldStatus(scene: Phaser.Scene, title: string, desc: string, color: number): void {
  playSfx(scene, 'sfx_wave');
  const panel = scene.add.container(480, 188).setDepth(142).setAlpha(0).setScale(0.96);
  if (scene.textures.exists('ui-boss-status-v33')) {
    panel.add(scene.add.image(0, 0, 'ui-boss-status-v33').setDisplaySize(520, 92).setTint(color));
  } else {
    panel.add(scene.add.rectangle(0, 0, 520, 86, 0x130912, 0.92).setStrokeStyle(3, color, 0.72));
  }
  panel.add(scene.add.text(0, -20, title, {
    fontSize: '24px', color: '#fff0bf', fontStyle: 'bold',
    shadow: { offsetX: 0, offsetY: 3, color: '#000000', blur: 3, fill: true },
  }).setOrigin(0.5));
  panel.add(scene.add.text(0, 18, desc, { fontSize: '14px', color: '#dbe7ff' }).setOrigin(0.5));
  scene.tweens.add({ targets: panel, alpha: 1, scale: 1, duration: 140, ease: 'Cubic.easeOut' });
  scene.tweens.add({ targets: panel, alpha: 0, y: 158, duration: 260, delay: 1150, ease: 'Cubic.easeIn', onComplete: () => panel.destroy() });
}

function spawnFireLanes(scene: Phaser.Scene, x: number, y: number, color: number): void {
  for (let i = 0; i < 4; i++) {
    const angle = -0.75 + i * 0.5;
    const lane = scene.add.rectangle(x, y, 300, 12, color, 0.22)
      .setRotation(angle)
      .setDepth(66)
      .setBlendMode(Phaser.BlendModes.ADD);
    scene.tweens.add({ targets: lane, scaleX: 1.25, alpha: 0, duration: 680, ease: 'Cubic.easeOut', onComplete: () => lane.destroy() });
  }
  scene.cameras.main.shake(130, 0.0026);
}

function stunFrontline(scene: Phaser.Scene, x: number, y: number, towers: Tower[], mercenaries: Soldier[], color: number): void {
  const durationMs = 1350;
  towers.forEach((tower) => {
    if (tower.config.kind === 'barracks') {
      tower.soldiers.forEach((soldier) => {
        soldier.attackCooldownMs = Math.max(soldier.attackCooldownMs, durationMs);
        spawnFloatingText(scene, soldier.x, soldier.y - 24, '경직', '#ffd36b', 13);
      });
      tower.applySuppression(1800, 0.92, 1.08, color, '전선 흔들림');
    }
  });
  mercenaries.forEach((soldier) => {
    soldier.attackCooldownMs = Math.max(soldier.attackCooldownMs, durationMs);
    spawnFloatingText(scene, soldier.x, soldier.y - 24, '경직', '#ffd36b', 13);
  });
  spawnImpactRing(scene, x, y, 86, color, 0.2, 520);
  scene.cameras.main.shake(180, 0.004);
}
