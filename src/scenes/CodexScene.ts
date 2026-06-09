import Phaser from 'phaser';
import type { User } from 'firebase/auth';
import { ENEMIES, TOWERS } from '../game/balance';
import type { EnemyConfig, TowerConfig } from '../game/types';
import type { PlayerSave } from '../services/firebase';

export class CodexScene extends Phaser.Scene {
  private user!: User;
  private save!: PlayerSave;
  private mode: 'tower' | 'enemy' = 'tower';
  private content?: Phaser.GameObjects.Container;

  constructor() {
    super('CodexScene');
  }

  init(data: { user: User; save: PlayerSave }): void {
    this.user = data.user;
    this.save = data.save;
    this.mode = 'tower';
  }

  create(): void {
    this.drawBackground();
    this.add.text(480, 48, '전술 도감', { fontSize: '46px', color: '#f7d36b', fontStyle: 'bold' }).setOrigin(0.5);
    this.add.text(480, 92, '타워 역할, 특수 스킬, 적 약점을 확인하고 스테이지에 들어가세요.', {
      fontSize: '18px', color: '#dbe7ff', align: 'center'
    }).setOrigin(0.5);

    this.makeButton(220, 132, 190, 42, '타워 도감', () => { this.mode = 'tower'; this.renderContent(); }, 0x284f39);
    this.makeButton(440, 132, 190, 42, '적 도감', () => { this.mode = 'enemy'; this.renderContent(); }, 0x5a3f6b);
    this.makeButton(740, 132, 210, 42, '월드맵으로', () => this.scene.start('WorldMapScene', { user: this.user, save: this.save }), 0x24486b);

    this.renderContent();
  }

  private drawBackground(): void {
    this.add.rectangle(480, 270, 960, 540, 0x101820, 1);
    const g = this.add.graphics();
    g.fillStyle(0x203040, 1).fillRoundedRect(48, 112, 864, 378, 18);
    g.lineStyle(2, 0xf7d36b, 0.28).strokeRoundedRect(48, 112, 864, 378, 18);
    for (let i = 0; i < 20; i++) {
      const x = 40 + ((i * 83) % 900);
      const y = 60 + ((i * 47) % 430);
      this.add.circle(x, y, 4 + (i % 3), 0xf7d36b, 0.05 + (i % 2) * 0.04);
    }
  }

  private renderContent(): void {
    this.content?.destroy();
    this.content = this.add.container(0, 0);
    if (this.mode === 'tower') this.renderTowerCodex();
    else this.renderEnemyCodex();
  }

  private renderTowerCodex(): void {
    const towers = Object.values(TOWERS);
    towers.forEach((tower, index) => {
      const x = 90 + index * 215;
      const y = 198;
      this.drawTowerCard(x, y, tower);
    });

    this.content?.add(this.add.text(480, 438,
      '기본 콤보: 병영으로 적을 묶고 포탑으로 광역 피해를 넣습니다. 방패병/골렘은 마법, 공중 적은 궁수와 마법으로 대응하세요.',
      { fontSize: '18px', color: '#f7d36b', align: 'center', wordWrap: { width: 780 } }
    ).setOrigin(0.5));
  }

  private drawTowerCard(x: number, y: number, tower: TowerConfig): void {
    const card = this.add.container(x, y);
    const bg = this.add.rectangle(0, 0, 190, 210, 0x0b1220, 0.92).setOrigin(0, 0).setStrokeStyle(2, tower.color, 0.6);
    const icon = this.add.circle(36, 38, 27, tower.color, 1).setStrokeStyle(3, 0xffffff, 0.3);
    const symbol = this.add.text(36, 36, this.towerSymbol(tower.kind), { fontSize: '24px', color: '#101820', fontStyle: 'bold' }).setOrigin(0.5);
    const title = this.add.text(76, 20, tower.label, { fontSize: '22px', color: '#ffffff', fontStyle: 'bold' });
    const desc = this.add.text(18, 78,
      `가격 $${tower.cost}\n사거리 ${tower.range}\n피해 ${tower.damage}\n공중공격 ${tower.canHitFlying ? '가능' : '불가'}\nLv.3: ${tower.maxSkill}\n\n${this.towerTip(tower.kind)}`,
      { fontSize: '15px', color: '#dbe7ff', lineSpacing: 5, wordWrap: { width: 156 } }
    );
    card.add([bg, icon, symbol, title, desc]);
    this.content?.add(card);
  }

  private renderEnemyCodex(): void {
    const enemies = Object.values(ENEMIES);
    enemies.forEach((enemy, index) => {
      const col = index % 4;
      const row = Math.floor(index / 4);
      this.drawEnemyRow(86 + col * 215, 184 + row * 82, enemy);
    });
  }

  private drawEnemyRow(x: number, y: number, enemy: EnemyConfig): void {
    const card = this.add.container(x, y);
    const bg = this.add.rectangle(0, 0, 194, 70, 0x0b1220, 0.9).setOrigin(0, 0).setStrokeStyle(1, enemy.accentColor ?? 0xffffff, 0.42);
    const body = this.add.circle(22, 35, 14 * (enemy.scale ?? 1), enemy.color, 1).setStrokeStyle(2, enemy.accentColor ?? 0xffffff, 0.65);
    const name = this.add.text(48, 10, enemy.label, { fontSize: '16px', color: '#ffffff', fontStyle: 'bold' });
    const stat = this.add.text(48, 32, `HP ${enemy.hp} / 속도 ${enemy.speed}\n약점: ${this.enemyWeakness(enemy)}`, {
      fontSize: '12px', color: '#dbe7ff', lineSpacing: 3
    });
    card.add([bg, body, name, stat]);
    this.content?.add(card);
  }

  private makeButton(x: number, y: number, width: number, height: number, label: string, onClick: () => void, color: number): Phaser.GameObjects.Rectangle {
    const rect = this.add.rectangle(x, y, width, height, color, 1).setStrokeStyle(2, 0xffffff, 0.28).setInteractive({ useHandCursor: true });
    this.add.text(x, y, label, { fontSize: '19px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
    rect.on('pointerdown', onClick);
    rect.on('pointerover', () => rect.setAlpha(0.86));
    rect.on('pointerout', () => rect.setAlpha(1));
    return rect;
  }

  private towerSymbol(kind: TowerConfig['kind']): string {
    if (kind === 'archer') return '➶';
    if (kind === 'mage') return '✦';
    if (kind === 'barracks') return '♜';
    return '●';
  }

  private towerTip(kind: TowerConfig['kind']): string {
    if (kind === 'archer') return '저렴하고 빠릅니다. 공중/빠른 적 담당.';
    if (kind === 'mage') return '방어 높은 적에게 강합니다. 단일 고화력.';
    if (kind === 'barracks') return '적을 멈춰 세워 광역 딜 시간을 벌어줍니다.';
    return '뭉친 적을 녹입니다. 공중은 공격하지 못합니다.';
  }

  private enemyWeakness(enemy: EnemyConfig): string {
    if (enemy.flying) return '궁수/마법';
    if (enemy.armor >= 0.35) return '마법/길막';
    if (enemy.magicResist >= 0.45) return '궁수/포탑';
    if (enemy.threat === 'boss') return '병영 2중 전선 + 포탑';
    if (enemy.speed >= 90) return '궁수/감속';
    return '포탑/기본 화력';
  }
}
