import Phaser from 'phaser';

export type RewardChestTier = 'wood' | 'iron' | 'royal' | 'mythic';

const CHEST_TEXTURE: Record<RewardChestTier, string> = {
  wood: 'ui-reward-chest-wood-v43',
  iron: 'ui-reward-chest-iron-v43',
  royal: 'ui-reward-chest-royal-v43',
  mythic: 'ui-reward-chest-mythic-v43',
};

export class PremiumRewardChestV45 {
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  open(tier: RewardChestTier, rewards: string[], onDone?: () => void): void {
    const root = this.scene.add.container(480, 270).setDepth(1600);
    const dim = this.scene.add.rectangle(0, 0, 960, 540, 0x061022, 0.72).setInteractive();
    const panel = this.scene.add.image(0, 0, 'ui-reward-open-panel-v45').setDisplaySize(650, 430);
    const chest = this.scene.add.image(0, -42, CHEST_TEXTURE[tier]).setDisplaySize(190, 190);
    const title = this.scene.add.text(0, -172, '보급 상자 개봉', {
      fontSize: '28px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#174488',
      strokeThickness: 5,
    }).setOrigin(0.5);
    const rewardText = this.scene.add.text(0, 125, rewards.join('\n'), {
      fontSize: '18px',
      color: '#234a88',
      fontStyle: 'bold',
      align: 'center',
      fixedWidth: 520,
    }).setOrigin(0.5).setAlpha(0);

    root.add([dim, panel, chest, title, rewardText]);

    this.scene.tweens.add({ targets: chest, y: -72, duration: 500, yoyo: true, repeat: 1, ease: 'Sine.easeInOut' });
    for (let i = 0; i < 8; i++) {
      this.scene.time.delayedCall(80 * i, () => {
        const fx = this.scene.add.image(0, -44, `fx-reward-open-v45-${i}`).setDisplaySize(320, 320).setDepth(1601).setAlpha(0.9);
        root.add(fx);
        this.scene.tweens.add({ targets: fx, scaleX: 1.45, scaleY: 1.45, alpha: 0, duration: 460, onComplete: () => fx.destroy() });
      });
    }

    this.scene.time.delayedCall(820, () => {
      rewardText.setAlpha(1);
      this.scene.tweens.add({ targets: rewardText, y: 108, duration: 260, ease: 'Back.easeOut' });
    });

    const close = this.scene.add.image(0, 186, 'ui-confirm-button-v45').setDisplaySize(190, 58).setInteractive({ useHandCursor: true });
    const closeText = this.scene.add.text(0, 184, '확인', { fontSize: '19px', color: '#ffffff', fontStyle: 'bold', stroke: '#16417f', strokeThickness: 4 }).setOrigin(0.5);
    root.add([close, closeText]);

    close.on('pointerdown', () => {
      this.scene.tweens.add({ targets: root, alpha: 0, duration: 160, onComplete: () => { root.destroy(); onDone?.(); } });
    });
  }
}
