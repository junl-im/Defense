import Phaser from 'phaser';

export type MonsterIntelCard = {
  key: string;
  name: string;
  count: number;
  traits: string[];
};

export class PremiumMonsterIntelV45 {
  private scene: Phaser.Scene;
  private root?: Phaser.GameObjects.Container;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  showNextWave(cards: MonsterIntelCard[]): void {
    this.hide();
    const root = this.scene.add.container(727, 132).setDepth(720);
    root.add(this.scene.add.image(0, 0, 'ui-wave-preview-panel-v45').setDisplaySize(392, 158));
    root.add(this.scene.add.text(0, -58, '다음 공세 분석', {
      fontSize: '18px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#16417f',
      strokeThickness: 4,
    }).setOrigin(0.5));

    cards.slice(0, 4).forEach((card, i) => {
      const x = -138 + i * 92;
      const portraitKey = `ui-enemy-portrait-${card.key}`;
      const frame = this.scene.add.rectangle(x, 9, 72, 76, 0xffffff, 0.82).setStrokeStyle(2, 0xe9bd4f, 0.96);
      const portrait = this.scene.textures.exists(portraitKey)
        ? this.scene.add.image(x, -1, portraitKey).setDisplaySize(58, 58)
        : this.scene.add.circle(x, -1, 27, 0x49689e, 0.9);
      const count = this.scene.add.text(x + 23, 32, `x${card.count}`, {
        fontSize: '13px',
        color: '#ffffff',
        fontStyle: 'bold',
        stroke: '#15366e',
        strokeThickness: 3,
      }).setOrigin(0.5);
      root.add([frame, portrait, count]);

      card.traits.slice(0, 2).forEach((trait, ti) => {
        const key = `ui-trait-${trait}`;
        if (!this.scene.textures.exists(key)) return;
        root.add(this.scene.add.image(x - 21 + ti * 21, 37, key).setDisplaySize(18, 18));
      });
    });

    root.setAlpha(0).setY(116);
    this.scene.tweens.add({ targets: root, alpha: 1, y: 132, duration: 180, ease: 'Back.easeOut' });
    this.root = root;
  }

  hide(): void {
    this.root?.destroy();
    this.root = undefined;
  }
}
