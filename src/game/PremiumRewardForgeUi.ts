import Phaser from 'phaser';
import type { CombatRewardResult } from './CombatRewards';
import type { ChestLootResult } from './ArtifactForge';
import { artifactRarityColor, ARTIFACTS, getArtifactDefinition } from './ArtifactForge';
import {
  chestRewardKind,
  createReferenceArtifactIcon,
  createReferenceRewardBadge,
  createRewardContinuityRail,
  installReferenceRewardPipeline,
} from './ReferenceRewardPipeline';

function addText(scene: Phaser.Scene, x: number, y: number, text: string, size: number, color = '#fff4c2', bold = true): Phaser.GameObjects.Text {
  return scene.add.text(x, y, text, {
    fontSize: `${size}px`,
    color,
    fontStyle: bold ? 'bold' : 'normal',
    shadow: { offsetX: 0, offsetY: 2, color: '#000000', blur: 2, fill: true },
  }).setOrigin(0.5);
}

export function showChestOpeningCinematic(scene: Phaser.Scene, reward: CombatRewardResult, loot: ChestLootResult): Phaser.GameObjects.Container {
  installReferenceRewardPipeline(scene, { phase: 'battle-result', delayMs: 40 });
  const root = scene.add.container(480, 270).setDepth(160);
  const shade = scene.add.rectangle(0, 0, 960, 540, 0x03060d, 0.78).setInteractive();
  root.add(shade);

  const panelKey = scene.textures.exists('ui-forge-result-panel-v36') ? 'ui-forge-result-panel-v36' : undefined;
  if (panelKey) root.add(scene.add.image(0, 0, panelKey).setDisplaySize(640, 420));
  else root.add(scene.add.rectangle(0, 0, 640, 420, 0x101722, 0.98).setStrokeStyle(3, 0xf7d36b, 0.62));

  const title = addText(scene, 0, -178, `${reward.medal} ${reward.chestTier} 보급 상자`, 30, '#ffe28a');
  root.add(title);
  const rail = createRewardContinuityRail(scene, -75, -145, ['dust', 'token', 'shard', chestRewardKind(reward.chestTier)], 34, 50).setAlpha(0.88);
  root.add(rail);

  const rewardChest = createReferenceRewardBadge(scene, 0, -72, chestRewardKind(reward.chestTier), 138, { pips: reward.chestTier === 'MYTHIC' ? 5 : reward.chestTier === 'ROYAL' ? 4 : reward.chestTier === 'IRON' ? 3 : 2, selected: true });
  root.add(rewardChest);

  const burst = scene.add.circle(0, -74, 18, 0xfff3a6, 0.32).setScale(0.2);
  root.add(burst);
  scene.tweens.add({ targets: burst, scale: 9.2, alpha: 0, duration: 720, ease: 'Cubic.easeOut' });
  scene.tweens.add({ targets: rewardChest, y: -92, scaleX: 1.08, scaleY: 1.08, duration: 220, yoyo: true, ease: 'Back.easeOut' });
  scene.cameras.main.shake(180, 0.0035);

  const lines = [
    `유물 가루 +${loot.dust}`,
    `왕실 토큰 +${loot.royalTokens}`,
    ...loot.featured.map((id) => `${getArtifactDefinition(id).name} 파편 +${loot.shards[id] ?? 0}`),
  ];

  lines.forEach((line, index) => {
    const itemY = 28 + index * 34;
    const plate = scene.add.rectangle(0, itemY, 500, 27, 0x192332, 0.74).setStrokeStyle(1, 0xffffff, 0.12).setAlpha(0);
    const label = addText(scene, 18, itemY, line, 16, index < 2 ? '#fff4c2' : '#dbe7ff').setAlpha(0);
    const icon = index === 0
      ? createReferenceRewardBadge(scene, -218, itemY, 'dust', 26, { pips: 2 })
      : index === 1
        ? createReferenceRewardBadge(scene, -218, itemY, 'token', 26, { pips: 3 })
        : createReferenceArtifactIcon(scene, -218, itemY, loot.featured[index - 2] ?? loot.featured[0] ?? ARTIFACTS[0].id, 28) ?? createReferenceRewardBadge(scene, -218, itemY, 'shard', 26, { pips: 4 });
    icon.setAlpha(0);
    root.add([plate, icon, label]);
    scene.tweens.add({ targets: [plate, icon, label], alpha: 1, x: { from: -30, to: 0 }, duration: 280, delay: 380 + index * 120, ease: 'Cubic.easeOut' });
  });

  const close = scene.add.rectangle(0, 178, 210, 44, 0x2b6b55, 1).setStrokeStyle(2, 0xffef9a, 0.56).setInteractive({ useHandCursor: true });
  const closeText = addText(scene, 0, 178, '확인', 21, '#ffffff');
  root.add([close, closeText]);
  close.on('pointerdown', () => {
    scene.tweens.add({ targets: root, alpha: 0, scale: 0.96, duration: 180, onComplete: () => root.destroy() });
  });

  root.setScale(0.94).setAlpha(0);
  scene.tweens.add({ targets: root, scale: 1, alpha: 1, duration: 220, ease: 'Back.easeOut' });
  return root;
}

export function createArtifactIcon(scene: Phaser.Scene, x: number, y: number, artifactId: string, size = 58): Phaser.GameObjects.Container {
  const def = ARTIFACTS.find((item) => item.id === artifactId) ?? ARTIFACTS[0];
  const reference = createReferenceArtifactIcon(scene, x, y, def.id, size);
  if (reference) return reference;
  const c = scene.add.container(x, y);
  const color = artifactRarityColor(def.rarity);
  const key = `ui-artifact-${def.id}-v36`;
  if (scene.textures.exists(key)) c.add(scene.add.image(0, 0, key).setDisplaySize(size, size));
  else {
    c.add(scene.add.circle(0, 0, size * 0.48, color, 0.9).setStrokeStyle(2, 0xffffff, 0.28));
    c.add(scene.add.text(0, 0, def.name.slice(0, 1), { fontSize: `${Math.round(size * 0.42)}px`, color: '#101820', fontStyle: 'bold' }).setOrigin(0.5));
  }
  c.add(scene.add.circle(size * 0.34, -size * 0.34, 7, color, 1).setStrokeStyle(1, 0xffffff, 0.3));
  return c;
}
