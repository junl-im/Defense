import Phaser from 'phaser';
import type { EnemyConfig, StageConfig } from './types';
import { spawnImpactRing } from './Effects';
import type { Hero } from './Hero';
import type { Tower } from './Tower';

export type WaveEventId = 'supply' | 'elite' | 'mana' | 'storm' | 'none';

export type WaveEventRuntime = {
  id: WaveEventId;
  title: string;
  subtitle: string;
  iconKey: string;
  enemyHpMultiplier: number;
  enemyRewardMultiplier: number;
  enemySpeedMultiplier: number;
};

const NULL_EVENT: WaveEventRuntime = {
  id: 'none',
  title: '정상 공세',
  subtitle: '기본 웨이브',
  iconKey: 'v2-wave-icon-supply-v26',
  enemyHpMultiplier: 1,
  enemyRewardMultiplier: 1,
  enemySpeedMultiplier: 1,
};

function eventIndex(stage: StageConfig, waveIndex: number): number {
  return Math.abs((stage.number * 17 + waveIndex * 31 + stage.waves.length * 7) % 4);
}

export function resolveWaveEvent(stage: StageConfig, waveIndex: number): WaveEventRuntime {
  // Keep the opening wave readable. From wave 2 onward, add occasional controlled twists.
  if (waveIndex <= 0) return NULL_EVENT;
  const cadence = stage.number >= 9 ? 2 : 3;
  if ((waveIndex + stage.number) % cadence !== 0) return NULL_EVENT;

  const templates: WaveEventRuntime[] = [
    {
      id: 'supply',
      title: '왕실 보급품',
      subtitle: '시작 골드 보급 · 전선 재정비',
      iconKey: 'v2-wave-icon-supply-v26',
      enemyHpMultiplier: 1.00,
      enemyRewardMultiplier: 1.06,
      enemySpeedMultiplier: 1.00,
    },
    {
      id: 'elite',
      title: '정예 선봉대',
      subtitle: '적 체력 증가 · 처치 보상 증가',
      iconKey: 'v2-wave-icon-elite-v26',
      enemyHpMultiplier: stage.number >= 9 ? 1.13 : 1.08,
      enemyRewardMultiplier: 1.18,
      enemySpeedMultiplier: 1.02,
    },
    {
      id: 'mana',
      title: '마력 개화',
      subtitle: '스킬 재사용 시간 일부 회복',
      iconKey: 'v2-wave-icon-mana-v26',
      enemyHpMultiplier: 1.03,
      enemyRewardMultiplier: 1.05,
      enemySpeedMultiplier: 0.98,
    },
    {
      id: 'storm',
      title: '폭풍 행군',
      subtitle: '적 이동 속도 증가 · 긴급 강화 권장',
      iconKey: 'v2-wave-icon-storm-v26',
      enemyHpMultiplier: 1.02,
      enemyRewardMultiplier: 1.12,
      enemySpeedMultiplier: stage.number >= 9 ? 1.11 : 1.07,
    },
  ];
  return templates[eventIndex(stage, waveIndex)];
}

export function applyWaveEventOpening(
  scene: Phaser.Scene,
  stage: StageConfig,
  waveIndex: number,
  towers: Tower[],
  hero: Hero,
  addGold: (amount: number) => void,
  reduceSpellCooldowns: (amountMs: number) => void
): WaveEventRuntime {
  const event = resolveWaveEvent(stage, waveIndex);
  if (event.id === 'none') return event;

  if (event.id === 'supply') {
    addGold(18 + stage.number * 4);
    towers.slice(0, 2).forEach((tower) => tower.activateOverdrive(4200));
  } else if (event.id === 'mana') {
    reduceSpellCooldowns(4500 + stage.number * 120);
    spawnImpactRing(scene, hero.x, hero.y, 70, 0x7ce8ff, 0.18, 520);
  } else if (event.id === 'storm') {
    towers.forEach((tower, index) => {
      if (index % 2 === 0) tower.activateOverdrive(3200);
    });
  }

  showWaveEventCard(scene, event);
  return event;
}

export function mutateEnemyForWaveEvent(config: EnemyConfig, event?: WaveEventRuntime): EnemyConfig {
  if (!event || event.id === 'none') return config;
  return {
    ...config,
    hp: Math.max(1, Math.round(config.hp * event.enemyHpMultiplier)),
    speed: Math.max(8, Math.round(config.speed * event.enemySpeedMultiplier)),
    reward: Math.max(1, Math.round(config.reward * event.enemyRewardMultiplier)),
  };
}

export function showWaveEventCard(scene: Phaser.Scene, event: WaveEventRuntime): void {
  const container = scene.add.container(480, 112).setDepth(116).setAlpha(0).setScale(0.96);
  const bg = scene.textures.exists('v2-wave-event-frame-v26')
    ? scene.add.image(0, 0, 'v2-wave-event-frame-v26').setDisplaySize(348, 84)
    : scene.add.rectangle(0, 0, 348, 84, 0x071c3e, 0.86).setStrokeStyle(3, 0xffdc82, 0.75);
  const icon = scene.textures.exists(event.iconKey)
    ? scene.add.image(-132, 0, event.iconKey).setDisplaySize(54, 54)
    : scene.add.circle(-132, 0, 25, 0xffdc82, 0.7);
  const title = scene.add.text(-96, -17, event.title, {
    fontFamily: 'Pretendard, Noto Sans KR, Arial, sans-serif',
    fontSize: '15px',
    fontStyle: 'bold',
    color: '#fff4c2',
    stroke: '#092247',
    strokeThickness: 3,
  }).setOrigin(0, 0.5);
  const subtitle = scene.add.text(-96, 16, event.subtitle, {
    fontFamily: 'Pretendard, Noto Sans KR, Arial, sans-serif',
    fontSize: '10px',
    fontStyle: 'bold',
    color: '#dbe7ff',
    fixedWidth: 220,
  }).setOrigin(0, 0.5);
  container.add([bg, icon, title, subtitle]);
  scene.tweens.add({ targets: container, alpha: 1, scale: 1, y: 104, duration: 180, ease: 'Back.easeOut' });
  scene.time.delayedCall(2100, () => {
    scene.tweens.add({ targets: container, alpha: 0, y: 94, duration: 220, ease: 'Sine.easeIn', onComplete: () => container.destroy() });
  });
}

export function addStageV26Decor(scene: Phaser.Scene, stage: StageConfig): void {
  const isLite = new URLSearchParams(window.location.search).has('lite');
  const propPlan: Record<number, { key: string; x: number; y: number; scale: number; alpha: number }[]> = {
    1: [{ key: 'v2-prop-camp-v26', x: 72, y: 410, scale: 0.72, alpha: 0.68 }, { key: 'v2-prop-banner-v26', x: 884, y: 122, scale: 0.66, alpha: 0.58 }],
    2: [{ key: 'v2-prop-ruin-v26', x: 870, y: 120, scale: 0.70, alpha: 0.62 }],
    3: [{ key: 'v2-prop-portal-v26', x: 872, y: 124, scale: 0.66, alpha: 0.46 }],
    4: [{ key: 'v2-prop-banner-v26', x: 76, y: 124, scale: 0.74, alpha: 0.72 }, { key: 'v2-prop-ruin-v26', x: 842, y: 116, scale: 0.68, alpha: 0.66 }],
    5: [{ key: 'v2-prop-portal-v26', x: 842, y: 132, scale: 0.68, alpha: 0.50 }],
    6: [{ key: 'v2-prop-ruin-v26', x: 82, y: 132, scale: 0.74, alpha: 0.58 }, { key: 'v2-prop-crystal-v26', x: 872, y: 132, scale: 0.68, alpha: 0.54 }],
    7: [{ key: 'v2-prop-portal-v26', x: 80, y: 408, scale: 0.72, alpha: 0.54 }, { key: 'v2-prop-crystal-v26', x: 855, y: 105, scale: 0.74, alpha: 0.60 }],
    8: [{ key: 'v2-prop-banner-v26', x: 82, y: 120, scale: 0.76, alpha: 0.72 }, { key: 'v2-prop-portal-v26', x: 865, y: 118, scale: 0.70, alpha: 0.54 }],
    9: [{ key: 'v2-prop-crystal-v26', x: 78, y: 414, scale: 0.86, alpha: 0.74 }, { key: 'v2-prop-camp-v26', x: 870, y: 410, scale: 0.76, alpha: 0.64 }],
    10: [{ key: 'v2-prop-ruin-v26', x: 82, y: 116, scale: 0.78, alpha: 0.68 }, { key: 'v2-prop-banner-v26', x: 882, y: 120, scale: 0.78, alpha: 0.72 }],
    11: [{ key: 'v2-prop-portal-v26', x: 86, y: 418, scale: 0.82, alpha: 0.62 }, { key: 'v2-prop-crystal-v26', x: 875, y: 112, scale: 0.74, alpha: 0.62 }],
    12: [{ key: 'v2-prop-banner-v26', x: 70, y: 132, scale: 0.82, alpha: 0.75 }, { key: 'v2-prop-portal-v26', x: 868, y: 118, scale: 0.76, alpha: 0.58 }],
  };

  const entries = propPlan[stage.number] ?? [];
  entries.forEach((entry, index) => {
    if (!scene.textures.exists(entry.key)) return;
    const image = scene.add.image(entry.x, entry.y, entry.key)
      .setScale(entry.scale)
      .setAlpha(entry.alpha)
      .setDepth(6)
      .setBlendMode(index % 2 === 0 ? Phaser.BlendModes.NORMAL : Phaser.BlendModes.ADD);
    if (!isLite) {
      scene.tweens.add({ targets: image, y: image.y - 4, alpha: Math.min(0.86, entry.alpha + 0.10), duration: 1800 + index * 260, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    }
  });
}
