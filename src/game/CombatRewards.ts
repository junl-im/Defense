import Phaser from 'phaser';
import type { StageConfig } from './types';

export type CombatRewardInput = {
  stage: StageConfig;
  score: number;
  lives: number;
  clearTimeMs: number;
  bestKillStreak: number;
  totalLeaks: number;
};

export type CombatRewardResult = {
  medal: 'BRONZE' | 'SILVER' | 'GOLD' | 'LEGEND';
  objectiveCount: number;
  bonusGold: number;
  relicDust: number;
  chestTier: 'WOOD' | 'IRON' | 'ROYAL' | 'MYTHIC';
  lines: string[];
};

export function computeBattleRewards(input: CombatRewardInput): CombatRewardResult {
  const lifeGoal = Math.max(1, Math.ceil(input.stage.maxLives * 0.75));
  const fastGoalMs = input.stage.waves.length * 58000;
  const noLeak = input.totalLeaks === 0;
  const life = input.lives >= lifeGoal;
  const combo = input.bestKillStreak >= 20;
  const fast = input.clearTimeMs <= fastGoalMs;
  const bossClean = input.stage.number >= 4 ? input.lives >= Math.ceil(input.stage.maxLives * 0.5) : true;
  const objectiveCount = [life, noLeak, combo, fast, bossClean].filter(Boolean).length;

  const medal = objectiveCount >= 5 ? 'LEGEND' : objectiveCount >= 4 ? 'GOLD' : objectiveCount >= 3 ? 'SILVER' : 'BRONZE';
  const chestTier = medal === 'LEGEND' ? 'MYTHIC' : medal === 'GOLD' ? 'ROYAL' : medal === 'SILVER' ? 'IRON' : 'WOOD';
  const bonusGold = 20 + input.stage.number * 8 + objectiveCount * 18;
  const relicDust = input.stage.number * 2 + objectiveCount * 4 + (medal === 'LEGEND' ? 8 : 0);

  const lines = [
    `${life ? '★' : '☆'} 생명 ${lifeGoal}+ 보존`,
    `${noLeak ? '★' : '☆'} 누수 없는 방어`,
    `${combo ? '★' : '☆'} 연속 처치 20+`,
    `${fast ? '★' : '☆'} 빠른 클리어`,
  ];
  if (input.stage.number >= 4) lines.push(`${bossClean ? '★' : '☆'} 보스전 생존 안정권`);

  return { medal, objectiveCount, bonusGold, relicDust, chestTier, lines };
}

export function showStageObjectiveBanner(scene: Phaser.Scene, stage: StageConfig): void {
  const y = 154;
  const c = scene.add.container(480, y).setDepth(88);
  const hasArt = scene.textures.exists('ui-objective-ribbon-v35');
  if (hasArt) c.add(scene.add.image(0, 0, 'ui-objective-ribbon-v35').setDisplaySize(540, 66));
  else c.add(scene.add.rectangle(0, 0, 540, 66, 0x110a08, 0.88).setStrokeStyle(2, 0xf7d36b, 0.42));

  const title = scene.add.text(0, -13, `전술 목표 · ${stage.title}`, {
    fontSize: '17px', color: '#fff4c2', fontStyle: 'bold',
    shadow: { offsetX: 0, offsetY: 2, color: '#000000', blur: 2, fill: true }
  }).setOrigin(0.5);
  const subtitle = scene.add.text(0, 12, objectiveHintFor(stage), {
    fontSize: '12px', color: '#dbe7ff', align: 'center', fixedWidth: 500,
    shadow: { offsetX: 0, offsetY: 1, color: '#000000', blur: 1, fill: true }
  }).setOrigin(0.5);
  c.add([title, subtitle]);
  c.setAlpha(0).setScale(0.96);
  scene.tweens.add({ targets: c, alpha: 1, scale: 1, duration: 220, ease: 'Cubic.easeOut' });
  scene.time.delayedCall(3800, () => {
    if (!c.active) return;
    scene.tweens.add({ targets: c, alpha: 0, y: y - 10, duration: 320, ease: 'Cubic.easeIn', onComplete: () => c.destroy() });
  });
}

function objectiveHintFor(stage: StageConfig): string {
  if (stage.number <= 2) return '생명 보존과 무누수 클리어를 노리세요. 병영으로 묶고 포탑으로 정리하세요.';
  if (stage.number <= 4) return '보스/장갑 적 대응이 중요합니다. 긴급 강화와 최종 진화를 아껴두세요.';
  if (stage.number <= 6) return '공중·마법 저항·탱커가 섞입니다. 타워 교체와 타겟 우선순위를 활용하세요.';
  return '결전 구간입니다. 유물 보너스, 영웅 스킬, 메테오 타이밍이 승패를 가릅니다.';
}

export function showRewardChestOverlay(
  scene: Phaser.Scene,
  x: number,
  y: number,
  reward: CombatRewardResult
): Phaser.GameObjects.Container {
  const c = scene.add.container(x, y).setDepth(96);
  const panelKey = scene.textures.exists('ui-reward-panel-v35') ? 'ui-reward-panel-v35' : undefined;
  if (panelKey) c.add(scene.add.image(0, 0, panelKey).setDisplaySize(420, 124));
  else c.add(scene.add.rectangle(0, 0, 420, 124, 0x130d09, 0.94).setStrokeStyle(2, medalColor(reward.medal), 0.64));

  const chestKey = scene.textures.exists('ui-reward-chest-v35') ? 'ui-reward-chest-v35' : undefined;
  const chest = chestKey
    ? scene.add.image(-158, -4, chestKey).setDisplaySize(72, 72)
    : scene.add.rectangle(-158, -4, 72, 56, 0x8b5a2b, 1).setStrokeStyle(2, 0xf7d36b, 0.7);
  c.add(chest);

  const medalKey = `ui-medal-${reward.medal.toLowerCase()}-v35`;
  if (scene.textures.exists(medalKey)) c.add(scene.add.image(-86, -34, medalKey).setDisplaySize(42, 42));
  else c.add(scene.add.circle(-86, -34, 19, medalColor(reward.medal), 1).setStrokeStyle(2, 0xffffff, 0.3));

  const title = scene.add.text(-54, -38, `${reward.medal} 보급 상자`, {
    fontSize: '18px', color: '#fff4c2', fontStyle: 'bold',
    shadow: { offsetX: 0, offsetY: 2, color: '#000000', blur: 2, fill: true }
  }).setOrigin(0, 0.5);
  const sub = scene.add.text(-54, -11, `목표 ${reward.objectiveCount}개 달성 · ${reward.chestTier} TIER`, {
    fontSize: '12px', color: '#dbe7ff', fontStyle: 'bold'
  }).setOrigin(0, 0.5);
  const gain = scene.add.text(-54, 21, `보상  +$${reward.bonusGold}   유물 파편 +${reward.relicDust}`, {
    fontSize: '15px', color: '#ffef9a', fontStyle: 'bold'
  }).setOrigin(0, 0.5);
  c.add([title, sub, gain]);

  c.setAlpha(0).setScale(0.92);
  scene.tweens.add({ targets: c, alpha: 1, scale: 1, duration: 260, ease: 'Back.easeOut' });
  scene.tweens.add({ targets: chest, y: '-=5', duration: 560, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  return c;
}

export function rankMedal(index: number): string {
  if (index === 0) return '🥇';
  if (index === 1) return '🥈';
  if (index === 2) return '🥉';
  return '◆';
}

function medalColor(medal: CombatRewardResult['medal']): number {
  if (medal === 'LEGEND') return 0xb86bff;
  if (medal === 'GOLD') return 0xf7d36b;
  if (medal === 'SILVER') return 0xbfd7ff;
  return 0xc48755;
}
