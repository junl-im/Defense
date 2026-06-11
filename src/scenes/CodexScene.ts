import Phaser from 'phaser';
import type { User } from 'firebase/auth';
import { ENEMIES, TOWERS } from '../game/balance';
import type { EnemyConfig, TowerConfig } from '../game/types';
import type { PlayerSave } from '../services/localSave';

export class CodexScene extends Phaser.Scene {
  private user!: User;
  private save!: PlayerSave;
  private mode: 'tower' | 'enemy' = 'tower';
  private enemyPage = 0;
  private content?: Phaser.GameObjects.Container;
  private pageText?: Phaser.GameObjects.Text;

  constructor() {
    super('CodexScene');
  }

  init(data: { user: User; save: PlayerSave }): void {
    this.user = data.user;
    this.save = data.save;
    this.mode = 'tower';
    this.enemyPage = 0;
  }

  create(): void {
    this.drawBackground();
    this.add.text(480, 45, '전술 도감', {
      fontSize: '42px', color: '#f7d36b', fontStyle: 'bold', stroke: '#241006', strokeThickness: 5
    }).setOrigin(0.5);
    this.add.text(480, 84, '타워 역할, 특수 스킬, 적 약점을 확인하고 스테이지에 들어가세요.', {
      fontSize: '17px', color: '#fff1bf', align: 'center', stroke: '#110806', strokeThickness: 3
    }).setOrigin(0.5);

    this.makeButton(190, 123, 170, 38, '타워 도감', () => { this.mode = 'tower'; this.renderContent(); }, 0x284f39);
    this.makeButton(390, 123, 170, 38, '적 도감', () => { this.mode = 'enemy'; this.renderContent(); }, 0x5a3f6b);
    this.makeButton(740, 123, 210, 38, '월드맵으로', () => this.scene.start('WorldMapScene', { user: this.user, save: this.save }), 0x24486b);
    this.makeButton(624, 486, 110, 36, '이전', () => this.turnEnemyPage(-1), 0x3d3a57);
    this.makeButton(756, 486, 110, 36, '다음', () => this.turnEnemyPage(1), 0x3d3a57);
    this.pageText = this.add.text(480, 486, '', { fontSize: '17px', color: '#ffe38c', fontStyle: 'bold' }).setOrigin(0.5);

    this.renderContent();
  }

  private drawBackground(): void {
    this.add.rectangle(480, 270, 960, 540, 0x101820, 1);
    const g = this.add.graphics();
    g.fillStyle(0x16283a, 1).fillRect(0, 0, 960, 540);
    g.fillStyle(0x0b1220, 0.72).fillRoundedRect(42, 102, 876, 390, 20);
    g.lineStyle(2, 0xf7d36b, 0.25).strokeRoundedRect(42, 102, 876, 390, 20);
    for (let i = 0; i < 28; i++) {
      g.fillStyle(i % 2 === 0 ? 0xf7d36b : 0x7cc7ff, 0.04 + (i % 3) * 0.025);
      g.fillCircle(38 + ((i * 83) % 900), 70 + ((i * 47) % 420), 4 + (i % 4));
    }
  }

  private renderContent(): void {
    this.content?.destroy();
    this.content = this.add.container(0, 0);
    if (this.mode === 'tower') this.renderTowerCodex();
    else this.renderEnemyCodex();
  }

  private renderTowerCodex(): void {
    this.pageText?.setText('타워 4종');
    Object.values(TOWERS).forEach((tower, index) => {
      const x = 82 + index * 218;
      this.drawTowerCard(x, 170, tower);
    });
    this.content?.add(this.add.text(480, 435,
      '기본 콤보: 병영으로 적을 묶고 포탑으로 광역 피해를 넣습니다. 방패병/골렘/흑요석 기사는 마법, 공중 적은 궁수와 마법으로 대응하세요.',
      { fontSize: '17px', color: '#f7d36b', align: 'center', wordWrap: { width: 780 }, stroke: '#100807', strokeThickness: 3 }
    ).setOrigin(0.5));
  }

  private drawTowerCard(x: number, y: number, tower: TowerConfig): void {
    const card = this.add.container(x, y);
    const bg = this.add.rectangle(0, 0, 195, 238, 0x0b1220, 0.94).setOrigin(0, 0).setStrokeStyle(2, tower.color, 0.7);
    const icon = this.add.circle(36, 38, 28, tower.color, 1).setStrokeStyle(3, 0xffffff, 0.3);
    const symbol = this.add.text(36, 36, this.towerSymbol(tower.kind), { fontSize: '25px', color: '#101820', fontStyle: 'bold' }).setOrigin(0.5);
    const title = this.add.text(76, 18, tower.label, { fontSize: '22px', color: '#ffffff', fontStyle: 'bold' });
    const desc = this.add.text(17, 78,
      `가격 $${tower.cost}\n사거리 ${tower.range}\n피해 ${tower.damage}\n공중공격 ${tower.canHitFlying ? '가능' : '불가'}\nLv.3: ${tower.maxSkill}\n\n${this.towerTip(tower.kind)}`,
      { fontSize: '14px', color: '#dbe7ff', lineSpacing: 5, wordWrap: { width: 160 } }
    );
    card.add([bg, icon, symbol, title, desc]);
    this.content?.add(card);
  }

  private renderEnemyCodex(): void {
    const enemies = Object.values(ENEMIES);
    const pageSize = 16;
    const totalPages = Math.max(1, Math.ceil(enemies.length / pageSize));
    this.enemyPage = Phaser.Math.Clamp(this.enemyPage, 0, totalPages - 1);
    this.pageText?.setText(`적 도감 ${this.enemyPage + 1}/${totalPages}`);
    enemies.slice(this.enemyPage * pageSize, this.enemyPage * pageSize + pageSize).forEach((enemy, index) => {
      const col = index % 4;
      const row = Math.floor(index / 4);
      this.drawEnemyRow(70 + col * 220, 158 + row * 78, enemy);
    });
  }

  private turnEnemyPage(delta: number): void {
    if (this.mode !== 'enemy') return;
    const total = Math.max(1, Math.ceil(Object.keys(ENEMIES).length / 16));
    this.enemyPage = Phaser.Math.Wrap(this.enemyPage + delta, 0, total);
    this.renderContent();
  }

  private drawEnemyRow(x: number, y: number, enemy: EnemyConfig): void {
    const card = this.add.container(x, y);
    const bg = this.add.rectangle(0, 0, 205, 68, 0x0b1220, 0.91).setOrigin(0, 0).setStrokeStyle(1, enemy.accentColor ?? 0xffffff, 0.45);
    const body = this.add.circle(24, 34, 13 * (enemy.scale ?? 1), enemy.color, 1).setStrokeStyle(2, enemy.accentColor ?? 0xffffff, 0.65);
    const name = this.add.text(50, 8, enemy.label, { fontSize: '15px', color: '#ffffff', fontStyle: 'bold' });
    const stat = this.add.text(50, 30, `HP ${enemy.hp} / 속도 ${enemy.speed}\n약점: ${this.enemyWeakness(enemy)}`, {
      fontSize: '11px', color: '#dbe7ff', lineSpacing: 3
    });
    card.add([bg, body, name, stat]);
    this.content?.add(card);
  }

  private makeButton(x: number, y: number, width: number, height: number, label: string, onClick: () => void, color: number): Phaser.GameObjects.Rectangle {
    const rect = this.add.rectangle(x, y, width, height, color, 1).setStrokeStyle(2, 0xffffff, 0.28).setInteractive({ useHandCursor: true });
    this.add.text(x, y, label, { fontSize: '17px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
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
    if (enemy.threat === 'boss') return '2중 병영 + 메테오';
    if (enemy.flying) return '궁수/마법';
    if (enemy.armor >= 0.45) return '마법/길막';
    if (enemy.magicResist >= 0.45) return '궁수/포탑';
    if (enemy.speed >= 110) return '궁수/감속';
    return '포탑/기본 화력';
  }
}
