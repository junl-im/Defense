import Phaser from 'phaser';
import type { TowerKind } from './types';
import type { TowerMasteryId } from './TowerMastery';
import { getTowerMastery } from './TowerMastery';
import { playSfx } from './AudioManager';

export type ProjectileTrailVariant = 'arrow' | 'sniper' | 'arcane' | 'hex' | 'shell' | 'shock';

const MASTERY_FLAVORS: Record<TowerMasteryId, { title: string; subtitle: string; keyword: string; color: number }> = {
  archer_longbow: { title: '장궁 초소', subtitle: '폭풍처럼 쏟아지는 장거리 사격', keyword: 'RANGE BURST', color: 0x9dff7a },
  archer_sniper: { title: '저격 감시탑', subtitle: '보스와 비행 적의 약점을 꿰뚫음', keyword: 'TRUE SHOT', color: 0xffe38c },
  mage_arcane: { title: '비전 첨탑', subtitle: '저항을 관통하는 순수 마력', keyword: 'ARCANE PIERCE', color: 0xc8a2ff },
  mage_hex: { title: '저주 오벨리스크', subtitle: '전장을 잠식하는 감속 저주', keyword: 'HEX FIELD', color: 0xff8cff },
  barracks_paladin: { title: '성기사 막사', subtitle: '무너지지 않는 신성 방패 전선', keyword: 'HOLY WALL', color: 0x9ad7ff },
  barracks_assault: { title: '돌격대 막사', subtitle: '전선을 밀어붙이는 강습 진형', keyword: 'CHARGE', color: 0xffb36b },
  artillery_mortar: { title: '대구경 박격포', subtitle: '밀집된 적을 부수는 중심 폭발', keyword: 'HEAVY IMPACT', color: 0xffd36b },
  artillery_shock: { title: '충격포 진지', subtitle: '전장을 멈추는 전격 충격파', keyword: 'SHOCKWAVE', color: 0x8ce8ff },
};

export function showTowerMasteryCinematic(
  scene: Phaser.Scene,
  kind: TowerKind,
  masteryId: TowerMasteryId | undefined,
  trigger: 'unlock' | 'proc' = 'proc'
): void {
  if (!masteryId) return;
  const mastery = getTowerMastery(masteryId);
  const flavor = MASTERY_FLAVORS[masteryId];
  if (!mastery || !flavor) return;

  playSfx(scene, trigger === 'unlock' ? 'sfx_upgrade' : 'sfx_magic');
  const depth = 146;
  const color = flavor.color;
  const cutin = scene.add.container(trigger === 'unlock' ? 480 : 726, trigger === 'unlock' ? 108 : 138)
    .setDepth(depth)
    .setAlpha(0)
    .setScale(trigger === 'unlock' ? 1.08 : 0.92);

  if (scene.textures.exists('ui-tower-cutin-v33')) {
    cutin.add(scene.add.image(0, 0, 'ui-tower-cutin-v33').setDisplaySize(trigger === 'unlock' ? 620 : 400, trigger === 'unlock' ? 145 : 104));
  } else {
    cutin.add(scene.add.rectangle(0, 0, trigger === 'unlock' ? 620 : 400, trigger === 'unlock' ? 122 : 92, 0x0b101b, 0.94).setStrokeStyle(3, color, 0.75));
  }

  const sealX = trigger === 'unlock' ? -245 : -160;
  if (scene.textures.exists('ui-tower-seal-v33')) {
    const seal = scene.add.image(sealX, 0, 'ui-tower-seal-v33').setDisplaySize(trigger === 'unlock' ? 82 : 58, trigger === 'unlock' ? 82 : 58).setTint(color);
    cutin.add(seal);
    scene.tweens.add({ targets: seal, angle: 360, duration: 1700, ease: 'Cubic.easeOut' });
  } else {
    cutin.add(scene.add.circle(sealX, 0, trigger === 'unlock' ? 36 : 25, color, 0.2).setStrokeStyle(2, color, 0.8));
  }

  const icon = scene.add.text(sealX, -4, towerRune(kind), {
    fontSize: trigger === 'unlock' ? '36px' : '25px', color: '#fff7c5', fontStyle: 'bold',
    shadow: { offsetX: 0, offsetY: 3, color: '#000000', blur: 4, fill: true },
  }).setOrigin(0.5);
  const title = scene.add.text(trigger === 'unlock' ? -190 : -118, trigger === 'unlock' ? -30 : -23, flavor.title, {
    fontSize: trigger === 'unlock' ? '29px' : '19px', color: '#fff0bf', fontStyle: 'bold',
    shadow: { offsetX: 0, offsetY: 3, color: '#000000', blur: 3, fill: true },
  }).setOrigin(0, 0.5);
  const subtitle = scene.add.text(trigger === 'unlock' ? -190 : -118, trigger === 'unlock' ? 7 : 5, flavor.subtitle, {
    fontSize: trigger === 'unlock' ? '15px' : '11px', color: '#dbe7ff', fixedWidth: trigger === 'unlock' ? 430 : 280,
  }).setOrigin(0, 0.5);
  const keyword = scene.add.text(trigger === 'unlock' ? 220 : 120, trigger === 'unlock' ? 39 : 30, flavor.keyword, {
    fontSize: trigger === 'unlock' ? '15px' : '11px', color: numberToCss(color),
    fontStyle: 'bold',
  }).setOrigin(0.5);
  cutin.add([icon, title, subtitle, keyword]);

  const flash = scene.add.rectangle(480, 270, 960, 540, color, trigger === 'unlock' ? 0.055 : 0.028).setDepth(depth - 1).setBlendMode(Phaser.BlendModes.ADD);
  scene.tweens.add({ targets: flash, alpha: 0, duration: trigger === 'unlock' ? 280 : 170, onComplete: () => flash.destroy() });
  scene.tweens.add({ targets: cutin, alpha: 1, scale: trigger === 'unlock' ? 1 : 0.88, x: trigger === 'unlock' ? 480 : 700, duration: 160, ease: 'Cubic.easeOut' });
  scene.tweens.add({ targets: cutin, alpha: 0, x: trigger === 'unlock' ? 510 : 748, duration: 260, delay: trigger === 'unlock' ? 1500 : 840, ease: 'Cubic.easeIn', onComplete: () => cutin.destroy() });
}

export function spawnPremiumProjectileTrail(
  scene: Phaser.Scene,
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  color: number,
  variant: ProjectileTrailVariant
): void {
  const angle = Phaser.Math.Angle.Between(fromX, fromY, toX, toY);
  const distance = Phaser.Math.Distance.Between(fromX, fromY, toX, toY);
  const midX = (fromX + toX) / 2;
  const midY = (fromY + toY) / 2;

  const lineWidth = variant === 'shell' || variant === 'shock' ? 8 : variant === 'sniper' ? 5 : 4;
  const alpha = variant === 'hex' || variant === 'arcane' ? 0.52 : 0.42;
  const trail = scene.add.rectangle(fromX, fromY, Math.max(18, distance), lineWidth, color, alpha)
    .setOrigin(0, 0.5)
    .setRotation(angle)
    .setDepth(58)
    .setBlendMode(Phaser.BlendModes.ADD);
  scene.tweens.add({ targets: trail, x: midX, y: midY, scaleX: 0.45, alpha: 0, duration: variant === 'shell' ? 260 : 170, ease: 'Cubic.easeOut', onComplete: () => trail.destroy() });

  if (scene.textures.exists('fx-projectile-trail-v33')) {
    const fx = scene.add.sprite(midX, midY, 'fx-projectile-trail-v33', 0).setDepth(59).setTint(color).setRotation(angle).setScale(variant === 'shell' ? 1.3 : 0.82).setBlendMode(Phaser.BlendModes.ADD);
    if (scene.anims.exists('fx-projectile-trail-v33-play')) fx.play('fx-projectile-trail-v33-play');
    scene.time.delayedCall(420, () => fx.destroy());
  }

  const sparkCount = variant === 'shock' || variant === 'arcane' ? 7 : 4;
  for (let i = 0; i < sparkCount; i++) {
    const t = (i + 1) / (sparkCount + 1);
    const px = Phaser.Math.Linear(fromX, toX, t);
    const py = Phaser.Math.Linear(fromY, toY, t);
    const spark = scene.add.circle(px, py, variant === 'sniper' ? 2.8 : 2.2, color, 0.68).setDepth(60).setBlendMode(Phaser.BlendModes.ADD);
    scene.tweens.add({ targets: spark, y: py + Phaser.Math.Between(-8, 8), alpha: 0, scale: 0.2, duration: 230 + i * 20, onComplete: () => spark.destroy() });
  }
}

export function spawnTowerImpactFinisher(scene: Phaser.Scene, x: number, y: number, color: number, variant: ProjectileTrailVariant): void {
  const radius = variant === 'shell' || variant === 'shock' ? 48 : variant === 'hex' ? 34 : 24;
  if (scene.textures.exists('fx-tower-impact-v33')) {
    const fx = scene.add.sprite(x, y, 'fx-tower-impact-v33', 0).setDepth(72).setTint(color).setScale(radius / 38).setBlendMode(Phaser.BlendModes.ADD);
    if (scene.anims.exists('fx-tower-impact-v33-play')) fx.play('fx-tower-impact-v33-play');
    scene.time.delayedCall(520, () => fx.destroy());
  }
  const ring = scene.add.circle(x, y, radius * 0.42, color, 0).setStrokeStyle(3, color, 0.72).setDepth(73).setBlendMode(Phaser.BlendModes.ADD);
  scene.tweens.add({ targets: ring, scale: 1.8, alpha: 0, duration: 300, ease: 'Cubic.easeOut', onComplete: () => ring.destroy() });
}

function numberToCss(color: number): string {
  return `#${color.toString(16).padStart(6, '0')}`;
}

function towerRune(kind: TowerKind): string {
  if (kind === 'archer') return '➶';
  if (kind === 'mage') return '✦';
  if (kind === 'barracks') return '♜';
  return '●';
}
