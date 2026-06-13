import Phaser from 'phaser';
import type { User } from 'firebase/auth';
import { ENEMIES, TOWERS } from '../game/balance';
import type { EnemyConfig, TowerConfig } from '../game/types';
import type { PlayerSave } from '../services/localSave';
import { startRegisteredScene } from "./SceneRegistry";
import { installSceneReadabilityPass, improveReadableTextTree, readableFontSize, readableHitSize } from "../game/MobileReadableUi";
import { installSceneGraphicFallback } from "../game/PrestigeGraphicFallback";
import { installReferenceEvolutionPack, resolveReferenceEvolutionEnemyThumb, resolveReferenceEvolutionTowerThumb } from "../game/ReferenceAssetEvolution";
import { createReferenceArtSlot, referenceStateForEnemyThreat } from "../game/ReferenceVariantSystem";
import { towerResearchLevelForKind } from "../game/ReferenceProgressionFusion";

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
    installSceneGraphicFallback(this, "codex", 1.2);
    this.add.text(480, 45, '전술 도감', {
      fontSize: '42px', color: '#f7d36b', fontStyle: 'bold', stroke: '#241006', strokeThickness: 5
    }).setOrigin(0.5);
    this.add.text(480, 84, '타워 역할, 특수 스킬, 적 약점을 확인하고 스테이지에 들어가세요.', {
      fontSize: readableFontSize(17, 17, 25), color: '#fff1bf', align: 'center', stroke: '#110806', strokeThickness: 3
    }).setOrigin(0.5);

    this.makeButton(190, 123, 170, 38, '타워 도감', () => { this.mode = 'tower'; this.renderContent(); }, 0x284f39);
    this.makeButton(390, 123, 170, 38, '적 도감', () => { this.mode = 'enemy'; this.renderContent(); }, 0x5a3f6b);
    this.makeButton(740, 123, 210, 38, '월드맵으로', () => void startRegisteredScene(this, 'WorldMapScene', { user: this.user, save: this.save }), 0x24486b);
    this.makeButton(624, 486, 110, 36, '이전', () => this.turnEnemyPage(-1), 0x3d3a57);
    this.makeButton(756, 486, 110, 36, '다음', () => this.turnEnemyPage(1), 0x3d3a57);
    this.pageText = this.add.text(480, 486, '', { fontSize: readableFontSize(17, 17, 25), color: '#ffe38c', fontStyle: 'bold' }).setOrigin(0.5);

    this.renderContent();
    installReferenceEvolutionPack(this, { phase: "codex", delayMs: 240, categories: ["tower", "enemy"] });
    this.events.on("kingdom-seed:reference-evolution-ready", this.refreshReferenceCodex, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.events.off("kingdom-seed:reference-evolution-ready", this.refreshReferenceCodex, this);
    });
    installSceneReadabilityPass(this, { min: 15, strokeThickness: 3 });
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
    if (this.content) improveReadableTextTree(this.content, { min: 15, strokeThickness: 3 });
  }

  private refreshReferenceCodex(): void {
    if (!this.scene.isActive("CodexScene")) return;
    this.renderContent();
    installSceneReadabilityPass(this, { min: 15, strokeThickness: 3 });
  }

  private renderTowerCodex(): void {
    this.pageText?.setText('타워 4종');
    Object.values(TOWERS).forEach((tower, index) => {
      const x = 82 + index * 218;
      this.drawTowerCard(x, 170, tower);
    });
    this.content?.add(this.add.text(480, 435,
      '기본 콤보: 병영으로 적을 묶고 포탑으로 광역 피해를 넣습니다. 방패병/골렘/흑요석 기사는 마법, 공중 적은 궁수와 마법으로 대응하세요.',
      { fontSize: readableFontSize(17, 17, 25), color: '#f7d36b', align: 'center', wordWrap: { width: 780 }, stroke: '#100807', strokeThickness: 3 }
    ).setOrigin(0.5));
  }

  private drawTowerCard(x: number, y: number, tower: TowerConfig): void {
    const card = this.add.container(x, y);
    const bg = this.add.rectangle(0, 0, 195, 238, 0x0b1220, 0.94).setOrigin(0, 0).setStrokeStyle(2, tower.color, 0.7);
    const thumbKey = resolveReferenceEvolutionTowerThumb(this, tower.kind);
    const researchLevel = towerResearchLevelForKind(this.save?.upgrades, tower.kind);
    const icon = thumbKey
      ? createReferenceArtSlot(this, {
          x: 38,
          y: 42,
          width: 84,
          height: 84,
          textureKey: thumbKey,
          category: "tower",
          state: "upgrade",
          accent: tower.color,
          pips: Math.max(2, 2 + researchLevel),
          selected: researchLevel >= 3,
          noMotion: true,
        })
      : this.add.circle(36, 38, 28, tower.color, 1).setStrokeStyle(3, 0xffffff, 0.3);
    const symbol = thumbKey
      ? undefined
      : this.add.text(36, 36, this.towerSymbol(tower.kind), { fontSize: '25px', color: '#101820', fontStyle: 'bold' }).setOrigin(0.5);
    const title = this.add.text(76, 18, tower.label, { fontSize: readableFontSize(22, 21, 30), color: '#ffffff', fontStyle: 'bold' });
    const desc = this.add.text(17, 78,
      `가격 $${tower.cost}\n사거리 ${tower.range}\n피해 ${tower.damage}\n공중공격 ${tower.canHitFlying ? '가능' : '불가'}\nLv.3: ${tower.maxSkill}\n\n${this.towerTip(tower.kind)}`,
      { fontSize: readableFontSize(14, 15, 22), color: '#dbe7ff', lineSpacing: 5, wordWrap: { width: 160 } }
    );
    card.add([bg, icon, ...(symbol ? [symbol] : []), title, desc]);
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
    const thumbKey = resolveReferenceEvolutionEnemyThumb(this, enemy.kind);
    const body = thumbKey
      ? createReferenceArtSlot(this, {
          x: 27,
          y: 35,
          width: 62,
          height: 62,
          textureKey: thumbKey,
          category: "enemy",
          state: referenceStateForEnemyThreat(enemy.threat),
          accent: enemy.accentColor ?? enemy.color,
          pips: enemy.threat === "boss" ? 5 : enemy.threat === "tank" ? 3 : 1,
          noMotion: true,
        })
      : this.add.circle(24, 34, 13 * (enemy.scale ?? 1), enemy.color, 1).setStrokeStyle(2, enemy.accentColor ?? 0xffffff, 0.65);
    const name = this.add.text(50, 8, enemy.label, { fontSize: readableFontSize(15, 16, 23), color: '#ffffff', fontStyle: 'bold' });
    const stat = this.add.text(50, 30, `HP ${enemy.hp} / 속도 ${enemy.speed}\n약점: ${this.enemyWeakness(enemy)}`, {
      fontSize: readableFontSize(11, 14, 19), color: '#dbe7ff', lineSpacing: 3
    });
    card.add([bg, body, name, stat]);
    this.content?.add(card);
  }

  private makeButton(x: number, y: number, width: number, height: number, label: string, onClick: () => void, color: number): Phaser.GameObjects.Rectangle {
    const rect = this.add.rectangle(x, y, width, height, color, 1).setStrokeStyle(2, 0xffffff, 0.28).setInteractive({ useHandCursor: true });
    this.add.text(x, y, label, { fontSize: readableFontSize(17, 17, 25), color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
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
