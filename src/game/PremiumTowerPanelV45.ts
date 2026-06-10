import Phaser from 'phaser';
import { addClickSpark } from './PremiumSkinV44';

export type TowerPanelAction = 'upgrade' | 'boost' | 'target' | 'sell' | 'swap' | 'rally' | 'recruit';

export type TowerPanelData = {
  title: string;
  role: string;
  level: number;
  price?: number;
  refund?: number;
  damage?: number;
  range?: number;
  cooldown?: number;
  actions: Partial<Record<TowerPanelAction, () => void>>;
};

const ACTION_LABELS: Record<TowerPanelAction, string> = {
  upgrade: '업그레이드',
  boost: '긴급 강화',
  target: '타겟 변경',
  sell: '철거',
  swap: '교체',
  rally: '집결지',
  recruit: '병력 보충',
};

const ACTION_TEXTURES: Record<TowerPanelAction, string> = {
  upgrade: 'ui-tower-btn-upgrade-v45',
  boost: 'ui-tower-btn-boost-v45',
  target: 'ui-tower-btn-target-v45',
  sell: 'ui-tower-btn-sell-v45',
  swap: 'ui-tower-btn-swap-v45',
  rally: 'ui-tower-btn-rally-v45',
  recruit: 'ui-tower-btn-rally-v45',
};

export class PremiumTowerPanelV45 {
  private scene: Phaser.Scene;
  private root?: Phaser.GameObjects.Container;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  show(x: number, y: number, data: TowerPanelData): void {
    this.hide();

    const root = this.scene.add.container(x, y).setDepth(900);
    const panel = this.scene.add.image(0, 0, 'ui-tower-panel-premium-v45').setDisplaySize(430, 315);
    root.add(panel);

    root.add(this.scene.add.text(0, -126, data.title, {
      fontSize: '22px',
      fontStyle: 'bold',
      color: '#ffffff',
      stroke: '#16418a',
      strokeThickness: 4,
    }).setOrigin(0.5));

    root.add(this.scene.add.text(0, -94, `${data.role}  Lv.${data.level}`, {
      fontSize: '15px',
      fontStyle: 'bold',
      color: '#274c89',
    }).setOrigin(0.5));

    const stats = [
      ['피해', data.damage ?? 0, 'ui-stat-damage-v45'],
      ['사거리', data.range ?? 0, 'ui-stat-range-v45'],
      ['재장전', data.cooldown ?? 0, 'ui-stat-speed-v45'],
    ] as const;

    stats.forEach((s, i) => {
      const yy = -48 + i * 32;
      root.add(this.scene.add.text(-158, yy, s[0], { fontSize: '13px', color: '#385f9e', fontStyle: 'bold' }).setOrigin(0, 0.5));
      root.add(this.scene.add.image(38, yy, s[2]).setDisplaySize(210, 26));
      root.add(this.scene.add.text(152, yy, `${s[1]}`, { fontSize: '13px', color: '#ffffff', fontStyle: 'bold', stroke: '#1e3f79', strokeThickness: 3 }).setOrigin(0.5));
    });

    const actions = Object.keys(data.actions) as TowerPanelAction[];
    actions.slice(0, 6).forEach((action, index) => {
      const col = index % 2;
      const row = Math.floor(index / 2);
      const bx = col === 0 ? -102 : 102;
      const by = 61 + row * 58;
      const bg = this.scene.add.image(bx, by, ACTION_TEXTURES[action]).setDisplaySize(160, 50).setInteractive({ useHandCursor: true });
      const label = this.scene.add.text(bx, by - 1, ACTION_LABELS[action], {
        fontSize: '15px',
        color: '#ffffff',
        fontStyle: 'bold',
        stroke: '#1c407e',
        strokeThickness: 3,
      }).setOrigin(0.5);

      bg.on('pointerdown', () => {
        addClickSpark(this.scene, x + bx, y + by, 980);
        this.scene.tweens.add({ targets: [bg, label], scaleX: 0.94, scaleY: 0.94, duration: 55, yoyo: true });
        data.actions[action]?.();
      });

      root.add([bg, label]);
    });

    root.setScale(0.94).setAlpha(0);
    this.scene.tweens.add({ targets: root, scaleX: 1, scaleY: 1, alpha: 1, duration: 160, ease: 'Back.easeOut' });
    this.root = root;
  }

  hide(): void {
    if (!this.root) return;
    const root = this.root;
    this.root = undefined;
    this.scene.tweens.add({
      targets: root,
      alpha: 0,
      scaleX: 0.96,
      scaleY: 0.96,
      duration: 120,
      onComplete: () => root.destroy(),
    });
  }
}
