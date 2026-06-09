import Phaser from 'phaser';
import type { User } from 'firebase/auth';
import type { PlayerSave } from '../services/firebase';
import { getStageConfig } from '../game/balance';
import {
  ACHIEVEMENTS,
  RELICS,
  RELIC_SLOT_COUNT,
  claimAchievement,
  claimDailyReward,
  equipRelic,
  evaluateAchievement,
  getDailyChallenge,
  getRelic,
  loadMetaState,
  modifierLabel,
  saveMetaState,
  unequipRelic,
  type Achievement,
  type MetaState,
  type Relic,
  type RelicId,
} from '../game/MegaSystems';
import { playSfx } from '../game/AudioManager';

type MetaTab = 'relics' | 'daily' | 'achievements';

export class MetaScene extends Phaser.Scene {
  private user!: User;
  private save!: PlayerSave;
  private state!: MetaState;
  private tab: MetaTab = 'relics';
  private content?: Phaser.GameObjects.Container;
  private headerText?: Phaser.GameObjects.Text;
  private slotText?: Phaser.GameObjects.Text;

  constructor() {
    super('MetaScene');
  }

  init(data: { user: User; save: PlayerSave; tab?: MetaTab }): void {
    this.user = data.user;
    this.save = data.save;
    this.state = loadMetaState(this.user.uid);
    this.tab = data.tab ?? 'relics';
  }

  create(): void {
    this.drawBackground();
    this.createHeader();
    this.createTabs();
    this.render();
  }

  private drawBackground(): void {
    this.add.rectangle(480, 270, 960, 540, 0x080d14, 1);
    if (this.textures.exists('ui-world-map-bg')) {
      this.add.image(480, 270, 'ui-world-map-bg').setDisplaySize(960, 540).setAlpha(0.28);
    }

    const g = this.add.graphics();
    g.fillStyle(0x000000, 0.42).fillRoundedRect(28, 28, 904, 484, 26);
    g.lineStyle(3, 0xf7d36b, 0.35).strokeRoundedRect(28, 28, 904, 484, 26);
    g.fillStyle(0x20150d, 0.82).fillRoundedRect(52, 105, 856, 380, 18);
    g.lineStyle(2, 0xffe39a, 0.18).strokeRoundedRect(52, 105, 856, 380, 18);

    for (let i = 0; i < 22; i++) {
      g.fillStyle(i % 2 === 0 ? 0xf7d36b : 0xa9dbff, 0.04 + (i % 4) * 0.015);
      g.fillCircle(40 + ((i * 97) % 880), 64 + ((i * 53) % 430), 3 + (i % 5));
    }
  }

  private createHeader(): void {
    this.add.text(480, 52, '왕국 전술 본부', {
      fontSize: '42px',
      color: '#ffe38c',
      fontStyle: 'bold',
      stroke: '#2b1208',
      strokeThickness: 7,
      shadow: { offsetX: 0, offsetY: 4, color: '#000000', blur: 5, fill: true },
    }).setOrigin(0.5);

    this.headerText = this.add.text(480, 88, '', {
      fontSize: '16px',
      color: '#fff1bf',
      fontStyle: 'bold',
      stroke: '#170c05',
      strokeThickness: 3,
    }).setOrigin(0.5);

    this.makeButton(820, 55, 155, 42, '월드맵', 0x24486b, () => {
      playSfx(this, 'sfx_click');
      this.scene.start('WorldMapScene', { user: this.user, save: this.save });
    });
  }

  private createTabs(): void {
    this.makeButton(170, 126, 190, 44, '유물 장착', this.tab === 'relics' ? 0xb7742a : 0x3a2a1b, () => {
      this.tab = 'relics';
      this.render();
    });
    this.makeButton(385, 126, 190, 44, '일일 도전', this.tab === 'daily' ? 0xb7742a : 0x3a2a1b, () => {
      this.tab = 'daily';
      this.render();
    });
    this.makeButton(600, 126, 190, 44, '업적 보상', this.tab === 'achievements' ? 0xb7742a : 0x3a2a1b, () => {
      this.tab = 'achievements';
      this.render();
    });
  }

  private render(): void {
    this.content?.destroy();
    this.content = this.add.container(0, 0);
    this.headerText?.setText(`명예 ${this.state.honor}  ·  보유 유물 ${this.state.ownedRelics.length}/${RELICS.length}  ·  장착 ${this.state.equippedRelics.length}/${RELIC_SLOT_COUNT}`);

    if (this.tab === 'relics') this.renderRelics();
    else if (this.tab === 'daily') this.renderDaily();
    else this.renderAchievements();
  }

  private renderRelics(): void {
    this.slotText = this.add.text(480, 164, this.equippedLabel(), {
      fontSize: '18px',
      color: '#ffe38c',
      fontStyle: 'bold',
      stroke: '#1d1009',
      strokeThickness: 4,
    }).setOrigin(0.5);
    this.content?.add(this.slotText);

    RELICS.forEach((relic, index) => {
      const col = index % 4;
      const row = Math.floor(index / 4);
      this.drawRelicCard(86 + col * 212, 195 + row * 94, relic);
    });
  }

  private equippedLabel(): string {
    if (this.state.equippedRelics.length === 0) return '장착 유물 없음';
    return `장착 중: ${this.state.equippedRelics.map((id) => getRelic(id).title).join(' / ')}`;
  }

  private drawRelicCard(x: number, y: number, relic: Relic): void {
    const owned = this.state.ownedRelics.includes(relic.id);
    const equipped = this.state.equippedRelics.includes(relic.id);
    const gradeColor = this.gradeColor(relic.grade);
    const card = this.add.container(x, y);
    const bg = this.add.rectangle(0, 0, 196, 78, owned ? 0x101820 : 0x111111, owned ? 0.94 : 0.72)
      .setOrigin(0, 0)
      .setStrokeStyle(equipped ? 4 : 2, gradeColor, owned ? 0.95 : 0.22)
      .setInteractive({ useHandCursor: owned });
    const gem = this.add.circle(24, 28, 17, gradeColor, owned ? 0.95 : 0.25).setStrokeStyle(2, 0xffffff, owned ? 0.28 : 0.05);
    const title = this.add.text(48, 10, relic.title, { fontSize: '15px', color: owned ? '#ffffff' : '#858585', fontStyle: 'bold' });
    const desc = this.add.text(48, 31, owned ? relic.description : '업적/일일 보상으로 해금', {
      fontSize: '11px',
      color: owned ? '#dbe7ff' : '#777777',
      wordWrap: { width: 132 },
      lineSpacing: 2,
    });
    const tag = this.add.text(14, 56, equipped ? 'EQUIP' : relic.grade.toUpperCase(), {
      fontSize: '10px',
      color: equipped ? '#fff1bf' : '#101820',
      fontStyle: 'bold',
      backgroundColor: equipped ? '#7f311c' : '#f7d36b',
      padding: { x: 4, y: 2 },
    });

    bg.on('pointerdown', () => {
      if (!owned) return;
      playSfx(this, 'sfx_click');
      this.state = equipped ? unequipRelic(this.state, relic.id) : equipRelic(this.state, relic.id);
      this.state = saveMetaState(this.state, this.user.uid);
      this.render();
    });

    card.add([bg, gem, title, desc, tag]);
    this.content?.add(card);
  }

  private renderDaily(): void {
    const challenge = getDailyChallenge();
    const stage = getStageConfig(challenge.stageId);
    const claimed = this.state.claimedDailyKeys.includes(challenge.dateKey);
    const reward = challenge.rewardRelicId ? getRelic(challenge.rewardRelicId) : undefined;

    const title = this.add.text(480, 168, `오늘의 도전 ${challenge.dateKey}`, {
      fontSize: '26px',
      color: '#ffe38c',
      fontStyle: 'bold',
      stroke: '#1a0d06',
      strokeThickness: 5,
    }).setOrigin(0.5);

    const panel = this.add.rectangle(480, 302, 720, 246, 0x0b1220, 0.92).setStrokeStyle(3, 0xf7d36b, 0.38);
    const detail = this.add.text(170, 205,
      `전장: Stage ${stage.number} - ${stage.title}\n난이도: ${stage.difficulty}\n시드: ${challenge.seed}\n보상: ${reward ? reward.title : '명예'} ${claimed ? '(수령 완료)' : ''}\n\n${challenge.modifiers.map((id) => '• ' + modifierLabel(id)).join('\n')}`,
      { fontSize: '18px', color: '#dbe7ff', lineSpacing: 8, wordWrap: { width: 620 } }
    );

    const start = this.makeButton(352, 432, 210, 48, '도전 시작', 0x8f3422, () => {
      playSfx(this, 'sfx_wave');
      this.scene.start('GameScene', { user: this.user, save: this.save, stageId: challenge.stageId, dailyChallenge: challenge });
    });
    const claim = this.makeButton(608, 432, 210, 48, claimed ? '보상 수령 완료' : '오늘 보상 수령', claimed ? 0x333333 : 0x2f6938, () => {
      if (claimed) return;
      playSfx(this, 'sfx_upgrade');
      this.state = claimDailyReward(challenge, this.state);
      this.state = saveMetaState(this.state, this.user.uid);
      this.render();
    });

    this.content?.add([title, panel, detail, start, claim]);
  }

  private renderAchievements(): void {
    ACHIEVEMENTS.forEach((achievement, index) => {
      const col = index % 2;
      const row = Math.floor(index / 2);
      this.drawAchievementRow(94 + col * 420, 170 + row * 58, achievement);
    });
  }

  private drawAchievementRow(x: number, y: number, achievement: Achievement): void {
    const done = evaluateAchievement(achievement.id, this.save, this.state);
    const claimed = this.state.claimedAchievements.includes(achievement.id);
    const reward = achievement.rewardRelicId ? getRelic(achievement.rewardRelicId) : undefined;

    const row = this.add.container(x, y);
    const bg = this.add.rectangle(0, 0, 386, 48, done ? 0x102218 : 0x141820, 0.92)
      .setOrigin(0, 0)
      .setStrokeStyle(claimed ? 2 : done ? 3 : 1, done ? 0xf7d36b : 0x627089, done ? 0.72 : 0.32)
      .setInteractive({ useHandCursor: done && !claimed });

    const mark = this.add.text(14, 12, claimed ? '✓' : done ? '!' : '·', {
      fontSize: '22px',
      color: claimed ? '#71ff70' : done ? '#ffe38c' : '#8793a6',
      fontStyle: 'bold',
    });
    const title = this.add.text(44, 7, achievement.title, { fontSize: '16px', color: '#ffffff', fontStyle: 'bold' });
    const desc = this.add.text(44, 27, `${achievement.description} / 보상: ${reward ? reward.title : '명예 +' + achievement.rewardHonor}`, {
      fontSize: '11px',
      color: '#c7d4e8',
    });
    const state = this.add.text(304, 15, claimed ? '수령완료' : done ? '수령' : '진행중', {
      fontSize: '13px',
      color: claimed ? '#71ff70' : done ? '#fff1bf' : '#9aa6b8',
      fontStyle: 'bold',
    });

    bg.on('pointerdown', () => {
      if (!done || claimed) return;
      playSfx(this, 'sfx_upgrade');
      this.state = claimAchievement(achievement.id, this.state);
      this.state = saveMetaState(this.state, this.user.uid);
      this.render();
    });

    row.add([bg, mark, title, desc, state]);
    this.content?.add(row);
  }

  private makeButton(x: number, y: number, width: number, height: number, label: string, color: number, onClick: () => void): Phaser.GameObjects.Container {
    const c = this.add.container(x, y);
    const useImported = this.textures.exists('ui-import-button') && width >= 145;
    const bg = useImported
      ? this.add.image(0, 0, 'ui-import-button').setDisplaySize(width, height)
      : this.add.rectangle(0, 0, width, height, color, 1).setStrokeStyle(2, 0xffe39a, 0.35);
    const hit = this.add.rectangle(0, 0, width, height, 0xffffff, 0.001).setInteractive({ useHandCursor: true });
    const text = this.add.text(0, 0, label, {
      fontSize: '18px',
      color: '#fff4c2',
      fontStyle: 'bold',
      stroke: '#170c05',
      strokeThickness: 4,
    }).setOrigin(0.5);
    hit.on('pointerdown', onClick);
    hit.on('pointerover', () => c.setScale(1.03));
    hit.on('pointerout', () => c.setScale(1));
    c.add([bg, hit, text]);
    return c;
  }

  private gradeColor(grade: Relic['grade']): number {
    if (grade === 'legendary') return 0xff9e3d;
    if (grade === 'epic') return 0xb78cff;
    if (grade === 'rare') return 0x70cfff;
    return 0xf7d36b;
  }
}
