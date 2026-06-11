import Phaser from 'phaser';
import type { User } from 'firebase/auth';
import {
  getUpgradeCost,
  UPGRADE_META,
  type PlayerSave,
  type UpgradeKey
} from '../services/localSave';

const UPGRADE_KEYS: UpgradeKey[] = ['archerDamage', 'mageDamage', 'barracksHp', 'artillerySplash'];

export class LabScene extends Phaser.Scene {
  private user!: User;
  private save!: PlayerSave;
  private starsText!: Phaser.GameObjects.Text;
  private messageText!: Phaser.GameObjects.Text;
  private rows: Phaser.GameObjects.Container[] = [];

  constructor() {
    super('LabScene');
  }

  init(data: { user: User; save: PlayerSave }): void {
    this.user = data.user;
    this.save = data.save;
  }

  create(): void {
    this.drawBackground();
    this.add.text(480, 56, '연구소', {
      fontSize: '44px',
      color: '#f7d36b',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.starsText = this.add.text(480, 108, '', {
      fontSize: '22px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.messageText = this.add.text(480, 474, '스테이지 클리어로 얻은 별을 투자해 영구 능력치를 올립니다.', {
      fontSize: '17px',
      color: '#dbe7ff',
      align: 'center'
    }).setOrigin(0.5);

    this.makeButton(110, 498, '월드맵', () => this.scene.start('WorldMapScene', { user: this.user, save: this.save }), 160, 42, 0x24486b);
    this.renderRows();
  }

  private drawBackground(): void {
    this.add.rectangle(480, 270, 960, 540, 0x101820, 1);
    const g = this.add.graphics();
    g.fillStyle(0x16283a, 1).fillRect(0, 0, 960, 540);
    g.fillStyle(0x0b1220, 0.7).fillRoundedRect(70, 130, 820, 320, 18);
    g.lineStyle(2, 0xf7d36b, 0.18).strokeRoundedRect(70, 130, 820, 320, 18);
    for (let i = 0; i < 10; i++) {
      g.fillStyle(i % 2 === 0 ? 0x263f59 : 0x1d344a, 0.5);
      g.fillCircle(110 + i * 86, 418 + (i % 3) * 7, 18 + (i % 4) * 2);
    }
    this.add.rectangle(480, 510, 960, 60, 0x0b1220, 0.78);
  }

  private renderRows(): void {
    this.rows.forEach((row) => row.destroy());
    this.rows = [];
    this.starsText.setText(`${this.save.nickname}  |  보유 별 ★ ${this.save.stars}`);

    UPGRADE_KEYS.forEach((key, index) => {
      const y = 165 + index * 72;
      const level = Number(this.save.upgrades[key] ?? 0);
      const meta = UPGRADE_META[key];
      const cost = getUpgradeCost(key, level);
      const row = this.add.container(480, y);
      const bg = this.add.rectangle(0, 0, 760, 58, 0x0b1220, 0.92).setStrokeStyle(2, 0x7cc7ff, 0.24);
      const icon = this.add.circle(-372, 0, 23, this.iconColor(key), 1).setStrokeStyle(2, 0xffffff, 0.28);
      const iconText = this.add.text(-372, 0, this.iconText(key), { fontSize: '18px', color: '#101820', fontStyle: 'bold' }).setOrigin(0.5);
      const title = this.add.text(-335, -17, `${meta.label}  Lv.${level}/${meta.maxLevel}`, {
        fontSize: '19px',
        color: '#f7d36b',
        fontStyle: 'bold'
      });
      const desc = this.add.text(-335, 11, meta.description, {
        fontSize: '15px',
        color: '#dbe7ff'
      });

      for (let i = 0; i < meta.maxLevel; i++) {
        const pip = this.add.circle(155 + i * 28, 0, 9, i < level ? 0xf7d36b : 0x333d49, 1).setStrokeStyle(1, 0xffffff, 0.24);
        row.add(pip);
      }

      const buttonColor = cost === null ? 0x333333 : this.save.stars >= cost ? 0x284f39 : 0x4f2f2f;
      const button = this.add.rectangle(300, 0, 136, 38, buttonColor, 1).setStrokeStyle(2, 0xffffff, 0.25).setInteractive({ useHandCursor: cost !== null });
      const label = cost === null ? '완료' : `연구 ★${cost}`;
      const buttonText = this.add.text(300, 0, label, { fontSize: '17px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);

      if (cost !== null) button.on('pointerdown', () => void this.buyUpgrade(key));

      row.add([bg, icon, iconText, title, desc, button, buttonText]);
      this.rows.push(row);
    });
  }

  private async buyUpgrade(key: UpgradeKey): Promise<void> {
    try {
      this.messageText.setText('연구 저장 중...');
      const { purchasePermanentUpgrade } = await import('../services/firebase');
      this.save = await purchasePermanentUpgrade(this.user, this.save, key);
      this.messageText.setText(`${UPGRADE_META[key].label} 완료!`);
      this.renderRows();
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : '연구 실패';
      this.messageText.setText(message);
    }
  }

  private makeButton(x: number, y: number, label: string, onClick: () => void, width = 160, height = 42, color = 0x24486b): void {
    const rect = this.add.rectangle(x, y, width, height, color, 1).setStrokeStyle(2, 0xffffff, 0.35).setInteractive({ useHandCursor: true });
    this.add.text(x, y, label, { fontSize: '18px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
    rect.on('pointerdown', onClick);
  }

  private iconColor(key: UpgradeKey): number {
    if (key === 'archerDamage') return 0x8fd14f;
    if (key === 'mageDamage') return 0xa970ff;
    if (key === 'barracksHp') return 0x4fa3ff;
    return 0xffb347;
  }

  private iconText(key: UpgradeKey): string {
    if (key === 'archerDamage') return '➶';
    if (key === 'mageDamage') return '✦';
    if (key === 'barracksHp') return '♜';
    return '●';
  }
}
