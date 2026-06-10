import Phaser from 'phaser';
import type { User } from 'firebase/auth';
import { fetchLeaderboard, loadOrCreateSave, type LeaderboardScore, type PlayerSave } from '../services/firebase';
import { STAGE_LIST, getStageConfig } from '../game/balance';
import type { StageConfig, StageId } from '../game/types';
import { playMusic, playSfx } from '../game/AudioManager';
import { addCodeButton, addCodeLogo, addCodePanel, addCoverImage, addFloatingSparkles, addSceneVignette } from '../game/CodeUiKit';

type StageDotView = {
  container: Phaser.GameObjects.Container;
  halo: Phaser.GameObjects.Arc;
  label: Phaser.GameObjects.Text;
};

type DragState = {
  active: boolean;
  startX: number;
  lastX: number;
  moved: boolean;
};

type ClearGrade = {
  label: string;
  color: number;
  accent: number;
  alpha: number;
};

type ChapterStyle = {
  title: string;
  subtitle: string;
  color: number;
  fogColor: number;
};

const CARD_SPACING = 306;
const CARD_WIDTH = 276;
const CARD_HEIGHT = 174;
const SWIPE_THRESHOLD = 72;

export class WorldMapScene extends Phaser.Scene {
  private user!: User;
  private save!: PlayerSave;
  private selectedStage: StageConfig = getStageConfig('stage_001');
  private selectedIndex = 0;

  private infoText!: Phaser.GameObjects.Text;
  private titleText!: Phaser.GameObjects.Text;
  private stageDetailText!: Phaser.GameObjects.Text;
  private leaderboardText!: Phaser.GameObjects.Text;
  private cardRoot!: Phaser.GameObjects.Container;
  private stageDots: StageDotView[] = [];
  private stageDotRail?: Phaser.GameObjects.Graphics;
  private startButton?: Phaser.GameObjects.Container;
  private startButtonLabel?: Phaser.GameObjects.Text;
  private leftArrow?: Phaser.GameObjects.Container;
  private rightArrow?: Phaser.GameObjects.Container;
  private cloudLayer!: Phaser.GameObjects.Container;
  private routeRoot?: Phaser.GameObjects.Container;
  private chapterTitleText!: Phaser.GameObjects.Text;
  private chapterSubText!: Phaser.GameObjects.Text;
  private routeGlow?: Phaser.GameObjects.Arc;
  private drag: DragState = { active: false, startX: 0, lastX: 0, moved: false };

  constructor() {
    super('WorldMapScene');
  }

  init(data: { user: User; save: PlayerSave }): void {
    this.user = data.user;
    this.save = data.save;
    this.selectedIndex = this.findFirstPlayableIndex();
    this.selectedStage = STAGE_LIST[this.selectedIndex] ?? getStageConfig('stage_001');
  }

  create(): void {
    playMusic(this, 'bgm_world', 0.22);
    window.addEventListener('kingdom-seed:user-activated', () => playMusic(this, 'bgm_world', 0.22), { once: true });

    this.drawBackground();
    this.createCloudLayer();
    this.createHeader();
    this.createCarouselArea();
    this.createDetailPanel();
    this.createFooterControls();
    this.renderCarousel();
    this.renderStageDots();
    this.refreshHeader();
    this.renderStageDetail();
    this.updateChapterPresentation(false);
    void this.refreshSaveAndLeaderboard();
  }

  private findFirstPlayableIndex(): number {
    let bestIndex = 0;
    STAGE_LIST.forEach((stage, index) => {
      if (!stage.unlockRequires || this.save.clearedStages[stage.unlockRequires]?.bestStars) {
        bestIndex = index;
      }
    });
    return bestIndex;
  }

  private drawBackground(): void {
    addCoverImage(this, 'v1-worldmap-bg', 960, 540, 0);
    addSceneVignette(this, 1, 0.10);

    // v1.2: background stays as art only. Route, nodes, panels and buttons are code UI.
    this.add.rectangle(480, 270, 960, 540, 0xeaf9ff, 0.026).setDepth(2);
    this.add.rectangle(480, 44, 960, 88, 0x0b376f, 0.42).setDepth(3);
    this.add.rectangle(480, 510, 960, 72, 0x0b376f, 0.52).setDepth(3);
    this.add.ellipse(362, 284, 690, 365, 0xffffff, 0.055).setDepth(4);
    this.add.ellipse(813, 280, 330, 380, 0xffffff, 0.065).setDepth(4);

    const mist = this.add.graphics().setDepth(5);
    for (let i = 0; i < 12; i += 1) {
      mist.fillStyle(0xffffff, 0.038);
      mist.fillEllipse(Phaser.Math.Between(20, 940), Phaser.Math.Between(105, 465), Phaser.Math.Between(130, 250), Phaser.Math.Between(22, 50));
    }

    addFloatingSparkles(this, 18, 7);
  }

  private drawFallbackMap(): void {
    this.add.rectangle(480, 270, 960, 540, 0x102032, 1);
    const g = this.add.graphics();
    g.fillStyle(0x203c2b, 1);
    g.fillEllipse(200, 300, 390, 250);
    g.fillEllipse(500, 315, 460, 280);
    g.fillEllipse(760, 280, 330, 230);
    g.lineStyle(18, 0x6a4a28, 1);
    g.beginPath();
    g.moveTo(96, 385);
    g.lineTo(250, 315);
    g.lineTo(420, 275);
    g.lineTo(582, 316);
    g.lineTo(780, 250);
    g.lineTo(875, 174);
    g.strokePath();
    g.lineStyle(8, 0xc19055, 1);
    g.strokePath();
  }

  private createCloudLayer(): void {
    this.cloudLayer = this.add.container(480, 270).setDepth(7);

    for (let i = 0; i < 10; i++) {
      const cloud = this.add.ellipse(
        Phaser.Math.Between(-520, 520),
        Phaser.Math.Between(-185, 185),
        Phaser.Math.Between(120, 240),
        Phaser.Math.Between(28, 62),
        0xffffff,
        Phaser.Math.FloatBetween(0.06, 0.14)
      );
      cloud.setScale(Phaser.Math.FloatBetween(0.85, 1.25));
      this.cloudLayer.add(cloud);
      this.tweens.add({
        targets: cloud,
        x: cloud.x + Phaser.Math.Between(-38, 38),
        y: cloud.y + Phaser.Math.Between(-10, 10),
        duration: Phaser.Math.Between(3200, 6400),
        repeat: -1,
        yoyo: true,
        ease: 'Sine.easeInOut',
      });
    }
  }

  private createHeader(): void {
    addCodeLogo(this, 142, 51, 0.34);

    const header = addCodePanel(this, {
      x: 501,
      y: 48,
      width: 530,
      height: 58,
      radius: 24,
      depth: 12,
      fill: 0xf5fbff,
      fillAlpha: 0.78,
      stroke: 0xe3bb54,
      strokeAlpha: 0.62,
      glow: 0x9eeeff,
    });

    this.titleText = this.add.text(0, -10, 'WORLD MAP', {
      fontSize: '22px',
      color: '#24528f',
      fontStyle: 'bold',
      stroke: '#ffffff',
      strokeThickness: 4,
    }).setOrigin(0.5);
    this.infoText = this.add.text(0, 13, '', {
      fontSize: '11px',
      color: '#4f72a2',
      align: 'center',
      fontStyle: 'bold',
      fixedWidth: 470,
    }).setOrigin(0.5);
    header.add([this.titleText, this.infoText]);

    addCodeButton(this, { x: 836, y: 47, width: 92, height: 34, label: '메인', iconText: '🏰', tone: 'blue', fontSize: 12, depth: 18, onClick: () => this.scene.start('MainMenuScene', { user: this.user, save: this.save }) });
    addCodeButton(this, { x: 925, y: 47, width: 62, height: 34, label: '갱신', iconText: '⟳', tone: 'white', fontSize: 11, depth: 18, onClick: () => void this.refreshSaveAndLeaderboard() });
  }

  private createCarouselArea(): void {
    addCodePanel(this, {
      x: 360,
      y: 292,
      width: 640,
      height: 328,
      radius: 30,
      depth: 8,
      fill: 0xf8fcff,
      fillAlpha: 0.58,
      stroke: 0x6db4ff,
      strokeAlpha: 0.34,
      glow: 0x9eeeff,
    });

    this.chapterTitleText = this.add.text(360, 113, '', {
      fontSize: '22px',
      color: '#24528f',
      fontStyle: 'bold',
      stroke: '#ffffff',
      strokeThickness: 5,
      shadow: { offsetX: 0, offsetY: 2, color: '#1c4b83', blur: 3, fill: true },
    }).setOrigin(0.5).setDepth(13);

    this.chapterSubText = this.add.text(360, 140, '스와이프하여 캠페인을 지휘하세요', {
      fontSize: '13px',
      color: '#476a9c',
      fontStyle: 'bold',
      stroke: '#ffffff',
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(13);

    this.cardRoot = this.add.container(360, 282).setDepth(20);

    const hit = this.add.rectangle(360, 282, 620, 308, 0xffffff, 0.001)
      .setInteractive({ useHandCursor: true })
      .setDepth(19);
    hit.on('pointerdown', (pointer: Phaser.Input.Pointer) => this.beginDrag(pointer));
    hit.on('pointermove', (pointer: Phaser.Input.Pointer) => this.moveDrag(pointer));
    hit.on('pointerup', (pointer: Phaser.Input.Pointer) => this.endDrag(pointer));
    hit.on('pointerupoutside', (pointer: Phaser.Input.Pointer) => this.endDrag(pointer));

    this.leftArrow = this.makeArrowButton(47, 282, '‹', () => this.slideBy(-1));
    this.rightArrow = this.makeArrowButton(673, 282, '›', () => this.slideBy(1));
  }

  private createDetailPanel(): void {
    addCodePanel(this, {
      x: 812,
      y: 286,
      width: 292,
      height: 344,
      radius: 28,
      depth: 10,
      fill: 0xf8fcff,
      fillAlpha: 0.82,
      stroke: 0xe3bb54,
      strokeAlpha: 0.84,
      glow: 0x9eeeff,
      title: 'STAGE INTEL',
    });

    this.addDecorImage('v1-tower-crystal', 914, 197, 88, 14);
    this.addDecorImage('v1-monster-goblin', 718, 430, 66, 14, true);

    this.stageDetailText = this.add.text(688, 128, '', {
      fontSize: '13px',
      color: '#264d7c',
      align: 'left',
      lineSpacing: 4,
      wordWrap: { width: 244 },
      fontStyle: 'bold',
    }).setOrigin(0, 0).setDepth(15);

    const board = addCodePanel(this, {
      x: 812,
      y: 401,
      width: 244,
      height: 112,
      radius: 20,
      depth: 14,
      fill: 0xffffff,
      fillAlpha: 0.62,
      stroke: 0x6db4ff,
      strokeAlpha: 0.36,
    });
    board.add(this.add.text(0, -42, '명예의 전당', {
      fontSize: '13px',
      color: '#24528f',
      fontStyle: 'bold',
      stroke: '#ffffff',
      strokeThickness: 3,
    }).setOrigin(0.5));

    this.leaderboardText = this.add.text(696, 376, '기록 로딩 중...', {
      fontSize: '11px',
      color: '#416593',
      align: 'left',
      lineSpacing: 3,
      wordWrap: { width: 232 },
      fontStyle: 'bold',
    }).setOrigin(0, 0).setDepth(16);
  }

  private createFooterControls(): void {
    addCodePanel(this, {
      x: 480,
      y: 508,
      width: 902,
      height: 58,
      radius: 24,
      depth: 24,
      fill: 0x143f7a,
      fillAlpha: 0.76,
      stroke: 0xe3bb54,
      strokeAlpha: 0.56,
    });

    const dockItems = [
      { x: 72, label: '메인', icon: '🏰', tone: 'blue' as const, go: () => this.scene.start('MainMenuScene', { user: this.user, save: this.save }) },
      { x: 166, label: '영웅', icon: '🛡', tone: 'gold' as const, go: () => this.scene.start('HeroHallScene', { user: this.user, save: this.save }) },
      { x: 260, label: '임무', icon: '📜', tone: 'white' as const, go: () => this.scene.start('MissionBoardScene', { user: this.user, save: this.save }) },
      { x: 360, label: '연구', icon: '🔬', tone: 'green' as const, go: () => this.scene.start('LabScene', { user: this.user, save: this.save }) },
      { x: 460, label: '제작', icon: '💎', tone: 'blue' as const, go: () => this.scene.start('ArtifactForgeScene', { user: this.user, save: this.save }) },
      { x: 560, label: '도감', icon: '📘', tone: 'white' as const, go: () => this.scene.start('CodexScene', { user: this.user, save: this.save }) },
      { x: 660, label: '갱신', icon: '⟳', tone: 'blue' as const, go: () => void this.refreshSaveAndLeaderboard() },
    ];

    dockItems.forEach((item) => addCodeButton(this, {
      x: item.x,
      y: 508,
      width: 84,
      height: 36,
      label: item.label,
      iconText: item.icon,
      tone: item.tone,
      fontSize: 11,
      depth: 32,
      onClick: () => { playSfx(this, 'sfx_click'); item.go(); },
    }));

    this.startButton = addCodeButton(this, { x: 826, y: 508, width: 210, height: 46, label: '전투 시작', iconText: '⚔', tone: 'red', fontSize: 20, depth: 34, onClick: () => this.startSelectedStage() });
    this.startButtonLabel = this.startButton.getByName('label') as Phaser.GameObjects.Text;
  }

  private renderCarousel(): void {
    this.cardRoot.removeAll(true);
    this.cardRoot.x = 360;

    STAGE_LIST.forEach((stage, index) => {
      const distance = index - this.selectedIndex;
      const card = this.createStageCard(stage, index, distance);
      card.x = distance * CARD_SPACING;
      this.cardRoot.add(card);
    });

    this.updateArrowState();
    this.updateChapterPresentation(false);
  }

  private createStageCard(stage: StageConfig, index: number, distance: number): Phaser.GameObjects.Container {
    const unlocked = this.isStageUnlocked(stage);
    const selected = index === this.selectedIndex;
    const best = this.save.clearedStages[stage.id];
    const grade = this.clearGrade(best?.bestStars ?? 0);
    const abs = Math.abs(distance);
    const card = this.add.container(0, 0);
    const thumbKey = this.stageCardKey(stage.id);
    const themeColor = this.stageColor(stage);

    const shadow = this.add.graphics();
    shadow.fillStyle(0x06112a, selected ? 0.34 : 0.22);
    shadow.fillRoundedRect(-CARD_WIDTH / 2 + 8, -CARD_HEIGHT / 2 + 12, CARD_WIDTH, CARD_HEIGHT, 28);

    const aura = this.add.graphics();
    aura.fillStyle(grade.color, selected ? grade.alpha + 0.12 : grade.alpha * 0.58);
    aura.fillRoundedRect(-CARD_WIDTH / 2 - 12, -CARD_HEIGHT / 2 - 10, CARD_WIDTH + 24, CARD_HEIGHT + 20, 34);

    const body = this.add.graphics();
    body.fillStyle(0xf8fcff, unlocked ? 0.92 : 0.58);
    body.fillRoundedRect(-CARD_WIDTH / 2, -CARD_HEIGHT / 2, CARD_WIDTH, CARD_HEIGHT, 26);
    body.lineStyle(selected ? 5 : 3, selected ? 0xffd66d : 0x6db4ff, selected ? 0.94 : 0.42);
    body.strokeRoundedRect(-CARD_WIDTH / 2, -CARD_HEIGHT / 2, CARD_WIDTH, CARD_HEIGHT, 26);
    body.lineStyle(1, 0xffffff, 0.72);
    body.strokeRoundedRect(-CARD_WIDTH / 2 + 7, -CARD_HEIGHT / 2 + 7, CARD_WIDTH - 14, CARD_HEIGHT - 14, 20);

    const thumb = this.add.image(0, -13, thumbKey).setDisplaySize(CARD_WIDTH - 30, 112);
    thumb.setAlpha(unlocked ? 1 : 0.38);

    const thumbGloss = this.add.graphics();
    thumbGloss.fillStyle(0xffffff, unlocked ? 0.18 : 0.06);
    thumbGloss.fillRoundedRect(-CARD_WIDTH / 2 + 20, -CARD_HEIGHT / 2 + 16, CARD_WIDTH - 40, 38, 16);

    const thumbFrame = this.add.graphics();
    thumbFrame.lineStyle(3, 0xffffff, 0.54);
    thumbFrame.strokeRoundedRect(-CARD_WIDTH / 2 + 15, -CARD_HEIGHT / 2 + 14, CARD_WIDTH - 30, 112, 18);
    thumbFrame.lineStyle(2, themeColor, unlocked ? 0.45 : 0.12);
    thumbFrame.strokeRoundedRect(-CARD_WIDTH / 2 + 19, -CARD_HEIGHT / 2 + 18, CARD_WIDTH - 38, 104, 14);

    const bottom = this.add.graphics();
    bottom.fillStyle(0xffffff, unlocked ? 0.82 : 0.42);
    bottom.fillRoundedRect(-CARD_WIDTH / 2 + 13, 35, CARD_WIDTH - 26, 60, 18);
    bottom.lineStyle(2, 0x8eb4da, unlocked ? 0.26 : 0.10);
    bottom.strokeRoundedRect(-CARD_WIDTH / 2 + 13, 35, CARD_WIDTH - 26, 60, 18);

    const stageRibbon = this.add.graphics();
    stageRibbon.fillStyle(themeColor, unlocked ? 0.96 : 0.46);
    stageRibbon.fillRoundedRect(-76, -84, 152, 30, 13);
    stageRibbon.lineStyle(2, 0xffe38c, unlocked ? 0.58 : 0.18);
    stageRibbon.strokeRoundedRect(-76, -84, 152, 30, 13);

    const stageNo = this.add.text(0, -69, `STAGE ${stage.number}`, {
      fontSize: '16px',
      color: '#fff2bb',
      fontStyle: 'bold',
      stroke: '#14335e',
      strokeThickness: 4,
    }).setOrigin(0.5);

    const title = this.add.text(0, 46, stage.title, {
      fontSize: selected ? '21px' : '19px',
      color: unlocked ? '#24528f' : '#8a97a6',
      fontStyle: 'bold',
      stroke: '#ffffff',
      strokeThickness: 4,
      align: 'center',
    }).setOrigin(0.5);

    const sub = this.add.text(0, 67, stage.subtitle, {
      fontSize: '11px',
      color: unlocked ? '#4f72a2' : '#9aa7b5',
      fontStyle: 'bold',
      stroke: '#ffffff',
      strokeThickness: 2,
    }).setOrigin(0.5);

    card.add([shadow, aura, body, thumb, thumbGloss, thumbFrame, bottom, stageRibbon, stageNo, title, sub]);

    if (best?.bestStars) {
      const clearRibbon = this.add.graphics();
      clearRibbon.fillStyle(grade.color, 0.94);
      clearRibbon.fillRoundedRect(-128, -74, 84, 24, 10);
      clearRibbon.lineStyle(2, grade.accent, 0.74);
      clearRibbon.strokeRoundedRect(-128, -74, 84, 24, 10);
      clearRibbon.setAngle(-8);
      const clearText = this.add.text(-86, -62, grade.label, {
        fontSize: '11px',
        color: '#fff8d7',
        fontStyle: 'bold',
        stroke: '#14335e',
        strokeThickness: 3,
      }).setOrigin(0.5).setAngle(-8);
      card.add([clearRibbon, clearText]);
    }

    if (this.stageHasBoss(stage)) {
      card.add(this.makeBossBadge(104, 38, stage, unlocked));
    }

    if (!unlocked) {
      const lockFog = this.add.rectangle(0, -13, CARD_WIDTH - 30, 112, 0x06112a, 0.54);
      const lock = this.textures.exists('ui-icon-lock')
        ? this.add.image(0, -10, 'ui-icon-lock').setScale(0.62)
        : this.add.text(0, -8, '🔒', { fontSize: '28px' }).setOrigin(0.5);
      const lockText = this.add.text(0, 16, 'LOCKED', {
        fontSize: '14px',
        color: '#ffb0a5',
        fontStyle: 'bold',
        stroke: '#14335e',
        strokeThickness: 4,
      }).setOrigin(0.5);
      card.add([lockFog, lock, lockText]);
    } else {
      const stars = best?.bestStars ?? 0;
      for (let i = 0; i < 3; i += 1) {
        const star = this.textures.exists('ui-icon-star-large')
          ? this.add.image(-34 + i * 34, 86, 'ui-icon-star-large').setScale(0.43).setAlpha(i < stars ? 1 : 0.24)
          : this.add.text(-34 + i * 34, 86, i < stars ? '★' : '☆', { fontSize: '22px', color: '#e5a94a' }).setOrigin(0.5);
        card.add(star);
      }
    }

    const progress = this.add.text(0, 18, this.cardProgressText(stage), {
      fontSize: '11px',
      color: unlocked ? '#416593' : '#9aa7b5',
      fontStyle: 'bold',
      stroke: '#ffffff',
      strokeThickness: 2,
    }).setOrigin(0.5);
    card.add(progress);

    const hit = this.add.rectangle(0, 0, CARD_WIDTH, CARD_HEIGHT, 0xffffff, 0.001).setInteractive({ useHandCursor: true });
    hit.on('pointerdown', () => {
      this.drag.moved = false;
    });
    hit.on('pointerup', () => {
      if (this.drag.moved) return;
      if (index !== this.selectedIndex) {
        this.slideToIndex(index);
      } else if (unlocked) {
        this.startSelectedStage();
      } else {
        this.renderLockedNudge(stage);
      }
    });
    card.add(hit);

    const targetScale = selected ? 1 : 0.82;
    card.setScale(targetScale);
    card.setAlpha(abs > 1 ? 0.18 : selected ? 1 : 0.52);

    if (selected) {
      this.tweens.add({ targets: aura, alpha: 0.70, duration: 1200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    }

    return card;
  }

  private renderStageDots(): void {
    this.stageDots.forEach((dot) => dot.container.destroy());
    this.stageDotRail?.destroy();
    this.stageDots = [];

    const totalWidth = (STAGE_LIST.length - 1) * 58;
    const startX = 360 - totalWidth / 2;
    const y = 455;

    const rail = this.add.graphics().setDepth(23);
    this.stageDotRail = rail;
    rail.lineStyle(5, 0xffffff, 0.36);
    rail.beginPath();
    rail.moveTo(startX, y);
    rail.lineTo(startX + totalWidth, y);
    rail.strokePath();
    rail.lineStyle(2, 0x6db4ff, 0.34);
    rail.beginPath();
    rail.moveTo(startX, y);
    rail.lineTo(startX + totalWidth, y);
    rail.strokePath();

    STAGE_LIST.forEach((stage, index) => {
      const unlocked = this.isStageUnlocked(stage);
      const selected = index === this.selectedIndex;
      const x = startX + index * 58;
      const container = this.add.container(x, y).setDepth(24);
      const halo = this.add.circle(0, 0, selected ? 19 : 15, selected ? 0xffd66d : 0xffffff, selected ? 0.28 : 0.06).setStrokeStyle(selected ? 3 : 1, selected ? 0xffd66d : 0xffffff, selected ? 0.92 : 0.28);
      const dot = this.add.circle(0, 0, 10, unlocked ? this.stageColor(stage) : 0x9aa7b5, unlocked ? 1 : 0.72).setStrokeStyle(2, unlocked ? 0xfff0b6 : 0xffffff, unlocked ? 0.72 : 0.36);
      const label = this.add.text(0, 0, `${stage.number}`, {
        fontSize: '11px',
        color: '#ffffff',
        fontStyle: 'bold',
        stroke: '#14335e',
        strokeThickness: 3,
      }).setOrigin(0.5);
      const hit = this.add.circle(0, 0, 22, 0xffffff, 0.001).setInteractive({ useHandCursor: true });
      container.add([halo, dot, label, hit]);
      hit.on('pointerdown', () => this.slideToIndex(index));
      this.stageDots.push({ container, halo, label });
    });
  }

  private renderStageDetail(): void {
    const stage = this.selectedStage;
    const best = this.save.clearedStages[stage.id];
    const unlocked = this.isStageUnlocked(stage);
    const lockText = !unlocked && stage.unlockRequires
      ? `잠김 · Stage ${getStageConfig(stage.unlockRequires).number} 클리어 필요`
      : '입장 가능';
    const bestText = best
      ? `BEST ${best.bestScore}점 · ★${best.bestStars} · ♥${best.bestLives}`
      : '아직 클리어 기록 없음';

    this.stageDetailText.setText(
      `Stage ${stage.number}. ${stage.title}\n` +
      `${stage.subtitle}\n\n` +
      `챕터  ${this.chapterStyle(stage).title.replace(' · ', '\n       ')}\n` +
      `등급  ${this.clearGrade(best?.bestStars ?? 0).label}\n` +
      `보스  ${this.stageBossName(stage) || '없음'}\n` +
      `난이도 ${stage.difficulty}\n` +
      `웨이브 ${stage.waves.length} · 시작 골드 $${stage.startGold}\n\n` +
      `${lockText}\n${bestText}\n\n` +
      `TIP. ${stage.tip}`
    );

    this.startButton?.setAlpha(unlocked ? 1 : 0.58);
    this.startButtonLabel?.setText(unlocked ? '전투 시작' : '잠김');
    this.updateChapterPresentation(false);
    this.renderRouteOverlay();
  }

  private renderRouteOverlay(): void {
    this.routeRoot?.destroy();
    this.routeRoot = this.add.container(0, 0).setDepth(6);

    const points = [
      { x: 94, y: 390 },
      { x: 200, y: 334 },
      { x: 304, y: 384 },
      { x: 416, y: 293 },
      { x: 529, y: 336 },
      { x: 628, y: 259 },
      { x: 739, y: 306 },
      { x: 858, y: 219 },
    ];

    const path = this.add.graphics();
    path.lineStyle(10, 0x06112a, 0.22);
    path.beginPath();
    path.moveTo(points[0].x, points[0].y);
    points.slice(1).forEach((point) => path.lineTo(point.x, point.y));
    path.strokePath();
    path.lineStyle(6, 0xffe38c, 0.78);
    path.beginPath();
    path.moveTo(points[0].x, points[0].y);
    points.slice(1).forEach((point) => path.lineTo(point.x, point.y));
    path.strokePath();
    path.lineStyle(2, 0x9eeeff, 0.72);
    path.beginPath();
    path.moveTo(points[0].x, points[0].y);
    points.slice(1).forEach((point) => path.lineTo(point.x, point.y));
    path.strokePath();
    this.routeRoot.add(path);

    points.forEach((point, index) => {
      const stage = STAGE_LIST[index];
      const unlocked = stage ? this.isStageUnlocked(stage) : false;
      const selected = index === this.selectedIndex;
      const node = this.add.container(point.x, point.y).setDepth(7);
      const glow = this.add.circle(0, 0, selected ? 31 : 24, selected ? 0x9eeeff : 0xffffff, selected ? 0.26 : 0.09);
      const outer = this.add.circle(0, 0, selected ? 22 : 18, unlocked ? 0xfff0b6 : 0x8796a5, unlocked ? 0.92 : 0.50).setStrokeStyle(3, 0x14335e, unlocked ? 0.74 : 0.32);
      const inner = this.add.circle(0, 0, selected ? 14 : 11, unlocked ? 0x236ab8 : 0x647382, unlocked ? 1 : 0.72).setStrokeStyle(2, 0xffffff, 0.78);
      const label = this.add.text(0, 0, String(index + 1), {
        fontSize: selected ? '15px' : '12px',
        color: '#ffffff',
        fontStyle: 'bold',
        stroke: '#14335e',
        strokeThickness: 3,
      }).setOrigin(0.5);
      const hit = this.add.circle(0, 0, 29, 0xffffff, 0.001).setInteractive({ useHandCursor: true });
      node.add([glow, outer, inner, label, hit]);
      hit.on('pointerdown', () => this.slideToIndex(index));
      if (selected) {
        this.tweens.add({ targets: glow, scaleX: 1.22, scaleY: 1.22, alpha: 0.36, duration: 1200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      }
      this.routeRoot?.add(node);
    });

    const travel = this.add.circle(points[this.selectedIndex].x, points[this.selectedIndex].y, 5, 0xffffff, 0.88)
      .setStrokeStyle(2, 0x9eeeff, 0.72);
    this.routeRoot.add(travel);
    this.tweens.add({ targets: travel, scaleX: 1.8, scaleY: 1.8, alpha: 0.2, duration: 820, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  }

  private beginDrag(pointer: Phaser.Input.Pointer): void {
    this.drag.active = true;
    this.drag.startX = pointer.x;
    this.drag.lastX = pointer.x;
    this.drag.moved = false;
    this.tweens.killTweensOf(this.cardRoot);
  }

  private moveDrag(pointer: Phaser.Input.Pointer): void {
    if (!this.drag.active) return;
    const dx = Phaser.Math.Clamp(pointer.x - this.drag.startX, -145, 145);
    this.cardRoot.x = 360 + dx;
    if (Math.abs(dx) > 12) this.drag.moved = true;
    this.drag.lastX = pointer.x;
  }

  private endDrag(pointer: Phaser.Input.Pointer): void {
    if (!this.drag.active) return;
    this.drag.active = false;
    const dx = pointer.x - this.drag.startX;
    if (Math.abs(dx) > SWIPE_THRESHOLD) {
      this.slideBy(dx < 0 ? 1 : -1);
      return;
    }
    this.snapCardsBack();
  }

  private slideBy(delta: number): void {
    this.slideToIndex(this.selectedIndex + delta);
  }

  private slideToIndex(index: number): void {
    const nextIndex = Phaser.Math.Clamp(index, 0, STAGE_LIST.length - 1);
    if (nextIndex === this.selectedIndex) {
      playSfx(this, 'sfx_hit');
      this.snapCardsBack();
      return;
    }

    const direction = nextIndex > this.selectedIndex ? -1 : 1;
    playSfx(this, 'sfx_click');
    this.sweepClouds(direction);
    this.tweens.add({
      targets: this.cardRoot,
      x: 360 + direction * 210,
      alpha: 0.68,
      duration: 120,
      ease: 'Cubic.easeIn',
      onComplete: () => {
        this.selectedIndex = nextIndex;
        this.selectedStage = STAGE_LIST[this.selectedIndex];
        this.renderCarousel();
        this.renderStageDots();
        this.renderStageDetail();
        this.updateChapterPresentation(true);
        void this.loadLeaderboard(this.selectedStage.id);
        this.cardRoot.x = 360 - direction * 210;
        this.cardRoot.alpha = 0.68;
        this.tweens.add({ targets: this.cardRoot, x: 360, alpha: 1, duration: 210, ease: 'Back.easeOut' });
      },
    });
  }

  private snapCardsBack(): void {
    this.tweens.add({ targets: this.cardRoot, x: 360, alpha: 1, duration: 140, ease: 'Sine.easeOut' });
  }

  private updateArrowState(): void {
    this.leftArrow?.setAlpha(this.selectedIndex > 0 ? 1 : 0.36);
    this.rightArrow?.setAlpha(this.selectedIndex < STAGE_LIST.length - 1 ? 1 : 0.36);
  }

  private async refreshSaveAndLeaderboard(): Promise<void> {
    try {
      this.save = await loadOrCreateSave(this.user);
      this.refreshHeader();
      this.renderCarousel();
      this.renderStageDots();
      this.renderStageDetail();
      await this.loadLeaderboard(this.selectedStage.id);
    } catch (error) {
      console.error(error);
      this.leaderboardText.setText('명예의 전당 로드 실패\nFirebase Rules를 확인하세요.');
    }
  }

  private async loadLeaderboard(stageId: StageId): Promise<void> {
    try {
      this.leaderboardText.setText('명예의 전당 로딩 중...');
      const scores = await fetchLeaderboard(stageId, 5);
      this.renderLeaderboard(scores);
    } catch (error) {
      console.error(error);
      this.leaderboardText.setText('명예의 전당 로드 실패');
    }
  }

  private renderLeaderboard(scores: LeaderboardScore[]): void {
    const lines = scores
      .map((score, index) => `${index + 1}. ${score.nickname}\n   ${score.score}점 / ♥${score.lives}`)
      .join('\n');
    this.leaderboardText.setText(`오늘의 ${this.selectedStage.title}\n명예의 전당\n\n${lines || '아직 기록 없음'}`);
  }

  private refreshHeader(): void {
    const totalBestStars = STAGE_LIST.reduce((sum, stage) => sum + (this.save.clearedStages[stage.id]?.bestStars ?? 0), 0);
    this.infoText.setText(`${this.save.nickname}  |  보유 별 ${this.save.stars}  |  누적 최고 별 ${totalBestStars}/${STAGE_LIST.length * 3}`);
  }

  private startSelectedStage(): void {
    if (!this.isStageUnlocked(this.selectedStage)) {
      this.renderLockedNudge(this.selectedStage);
      return;
    }

    playSfx(this, 'sfx_wave');
    this.cameras.main.fadeOut(220, 0, 0, 0);
    this.time.delayedCall(230, () => {
      this.scene.start('GameScene', { user: this.user, save: this.save, stageId: this.selectedStage.id });
    });
  }

  private renderLockedNudge(stage: StageConfig): void {
    playSfx(this, 'sfx_hit');
    const required = stage.unlockRequires ? getStageConfig(stage.unlockRequires).number : 1;
    const toast = this.add.text(360, 416, `Stage ${required}을 먼저 클리어해야 합니다`, {
      fontSize: '21px',
      color: '#ffb0a5',
      fontStyle: 'bold',
      stroke: '#240704',
      strokeThickness: 5,
    }).setOrigin(0.5).setDepth(80);
    this.tweens.add({ targets: toast, y: 398, alpha: 0, duration: 1500, ease: 'Sine.easeIn', onComplete: () => toast.destroy() });
  }

  private isStageUnlocked(stage: StageConfig): boolean {
    if (!stage.unlockRequires) return true;
    return Boolean(this.save.clearedStages[stage.unlockRequires]?.bestStars);
  }

  private cardProgressText(stage: StageConfig): string {
    const best = this.save.clearedStages[stage.id];
    if (!this.isStageUnlocked(stage)) return '이전 전장 클리어 필요';
    if (!best) return `${stage.waves.length} WAVES  ·  미도전`;
    return `${stage.waves.length} WAVES  ·  BEST ${best.bestScore}`;
  }

  private makeArrowButton(x: number, y: number, label: string, onClick: () => void): Phaser.GameObjects.Container {
    const container = this.add.container(x, y).setDepth(26);
    const shadow = this.add.circle(4, 6, 31, 0x06112a, 0.28);
    const glow = this.add.circle(0, 0, 36, 0x9eeeff, 0.12);
    const base = this.add.circle(0, 0, 31, 0xf8fcff, 0.82).setStrokeStyle(4, 0xe3bb54, 0.78);
    const inner = this.add.circle(0, 0, 23, 0x236ab8, 0.88).setStrokeStyle(2, 0xffffff, 0.48);
    const icon = this.add.text(0, -4, label, {
      fontSize: '48px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#14335e',
      strokeThickness: 5,
    }).setOrigin(0.5);
    const hit = this.add.circle(0, 0, 39, 0xffffff, 0.001).setInteractive({ useHandCursor: true });
    container.add([shadow, glow, base, inner, icon, hit]);
    hit.on('pointerdown', () => { playSfx(this, 'sfx_click'); onClick(); });
    hit.on('pointerover', () => this.tweens.add({ targets: container, scale: 1.08, duration: 90, ease: 'Back.easeOut' }));
    hit.on('pointerout', () => this.tweens.add({ targets: container, scale: 1, duration: 90, ease: 'Sine.easeOut' }));
    this.tweens.add({ targets: glow, scaleX: 1.15, scaleY: 1.15, alpha: 0.22, duration: 1600, repeat: -1, yoyo: true, ease: 'Sine.easeInOut' });
    return container;
  }

  private makeImageButton(
    x: number,
    y: number,
    label: string,
    texture: 'ui-button-primary' | 'ui-button-blue' | 'ui-button-gold' | 'ui-button-red',
    onClick: () => void,
    width = 180,
    height = 48,
    fontSize = 20
  ): Phaser.GameObjects.Container {
    const container = this.add.container(x, y).setDepth(30);
    const bg = this.textures.exists(texture)
      ? this.add.image(0, 0, texture).setDisplaySize(width, height)
      : this.add.rectangle(0, 0, width, height, 0x7b3422, 0.95).setStrokeStyle(3, 0xffd67a, 0.45);
    const text = this.add.text(0, 0, label, {
      fontSize: `${fontSize}px`,
      color: '#fff7d8',
      fontStyle: 'bold',
      stroke: '#2a1208',
      strokeThickness: 4,
    }).setOrigin(0.5).setName('label');
    const hit = this.add.rectangle(0, 0, width, height, 0xffffff, 0.001).setInteractive({ useHandCursor: true });
    container.add([bg, text, hit]);
    hit.on('pointerdown', () => { playSfx(this, 'sfx_click'); onClick(); });
    hit.on('pointerover', () => this.tweens.add({ targets: container, scale: 1.04, duration: 90 }));
    hit.on('pointerout', () => this.tweens.add({ targets: container, scale: 1, duration: 90 }));
    return container;
  }


  private addDecorImage(key: string, x: number, y: number, maxHeight: number, depth: number, flip = false): void {
    if (!this.textures.exists(key)) return;
    const texture = this.textures.get(key);
    const source = texture.getSourceImage() as { width: number; height: number };
    const image = this.add.image(x, y, key).setDepth(depth).setOrigin(0.5, 1);
    const scale = maxHeight / source.height;
    image.setScale(flip ? -scale : scale, scale);
    image.setAlpha(0.94);
    this.tweens.add({ targets: image, y: y - 4, duration: Phaser.Math.Between(1800, 2600), yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  }

  private clearGrade(stars: number): ClearGrade {
    if (stars >= 3) return { label: 'LEGEND', color: 0xd4a62a, accent: 0xffef9f, alpha: 0.34 };
    if (stars === 2) return { label: 'HEROIC', color: 0x9aa7bd, accent: 0xe7efff, alpha: 0.27 };
    if (stars === 1) return { label: 'CLEAR', color: 0x9b5b2d, accent: 0xffc27a, alpha: 0.22 };
    return { label: 'UNCLEARED', color: 0x1f1a16, accent: 0x7f6b4b, alpha: 0.08 };
  }

  private stageHasBoss(stage: StageConfig): boolean {
    return Boolean(this.stageBossName(stage));
  }

  private stageBossName(stage: StageConfig): string {
    if (stage.id === 'stage_002') return '오우거';
    if (stage.id === 'stage_003') return '늪 트롤';
    if (stage.id === 'stage_004') return '관문 군주';
    if (stage.id === 'stage_005') return '살점 괴물';
    if (stage.id === 'stage_006') return '화산룡';
    if (stage.id === 'stage_007') return '공허 거신';
    if (stage.id === 'stage_008') return '삼중 보스';
    return '';
  }

  private makeBossBadge(x: number, y: number, stage: StageConfig, unlocked: boolean): Phaser.GameObjects.Container {
    const badge = this.add.container(x, y);
    const base = this.add.circle(0, 0, 24, unlocked ? 0x8e1f1f : 0x363636, unlocked ? 0.94 : 0.58)
      .setStrokeStyle(3, unlocked ? 0xffd67a : 0x9a9a9a, unlocked ? 0.78 : 0.22);
    const horns = [
      this.add.triangle(-17, -18, 0, 12, 14, 0, 4, 30, unlocked ? 0xffd67a : 0x777777, unlocked ? 0.86 : 0.38).setAngle(-18),
      this.add.triangle(17, -18, 0, 12, 14, 0, 4, 30, unlocked ? 0xffd67a : 0x777777, unlocked ? 0.86 : 0.38).setAngle(18),
    ];
    const icon = this.add.text(0, -2, 'B', {
      fontSize: '22px',
      color: '#fff4c2',
      fontStyle: 'bold',
      stroke: '#280807',
      strokeThickness: 4,
    }).setOrigin(0.5);
    const label = this.add.text(0, 28, 'BOSS', {
      fontSize: '10px',
      color: unlocked ? '#ffe8a3' : '#aaaaaa',
      fontStyle: 'bold',
      stroke: '#160605',
      strokeThickness: 3,
    }).setOrigin(0.5);
    badge.add([horns[0], horns[1], base, icon, label]);
    return badge;
  }

  private chapterStyle(stage: StageConfig): ChapterStyle {
    if (stage.id === 'stage_001') return { title: 'CHAPTER I · 숲의 입구', subtitle: '왕국 변방을 지키는 첫 전선', color: 0x2f7d46, fogColor: 0xb9f5cf };
    if (stage.id === 'stage_002') return { title: 'CHAPTER II · 붉은 협곡', subtitle: '오크 부대가 협곡을 따라 진격합니다', color: 0xaa512d, fogColor: 0xffd19a };
    if (stage.id === 'stage_003') return { title: 'CHAPTER III · 그림자 늪지', subtitle: '저항과 공포, 은신한 괴물의 늪', color: 0x3d7f67, fogColor: 0xb8fff0 };
    if (stage.id === 'stage_004') return { title: 'CHAPTER IV · 마왕의 관문', subtitle: '보스 웨이브가 기다리는 최종 방어선', color: 0x8e2f42, fogColor: 0xffb7c8 };
    if (stage.id === 'stage_005') return { title: 'CHAPTER V · 검은 성채', subtitle: '광신도와 강령술사의 야간 공성전', color: 0x6e2f48, fogColor: 0xff9fba };
    if (stage.id === 'stage_006') return { title: 'CHAPTER VI · 용의 화산', subtitle: '불사조와 화산룡이 하늘을 막습니다', color: 0xc75c26, fogColor: 0xffdc91 };
    if (stage.id === 'stage_007') return { title: 'CHAPTER VII · 공허의 탑', subtitle: '균열 너머에서 압도적인 파도가 밀려옵니다', color: 0x5548a7, fogColor: 0xa8f4ff };
    return { title: 'FINAL CHAPTER · 왕의 최후 방어선', subtitle: '모든 보스가 한 전장에 집결합니다', color: 0x9d1f2f, fogColor: 0xfff1a6 };
  }

  private updateChapterPresentation(animated: boolean): void {
    if (!this.chapterTitleText || !this.chapterSubText) return;
    const chapter = this.chapterStyle(this.selectedStage);
    this.chapterTitleText.setText(chapter.title).setColor(this.colorToCss(chapter.color));
    this.chapterSubText.setText(chapter.subtitle);

    this.routeGlow?.destroy();
    this.routeGlow = this.add.circle(360, 278, 172, chapter.color, 0.08)
      .setStrokeStyle(3, chapter.fogColor, 0.18)
      .setDepth(9);

    if (animated) {
      this.cameras.main.pan(480 + Phaser.Math.Between(-8, 8), 270 + Phaser.Math.Between(-5, 5), 280, 'Sine.easeInOut', true);
      this.cameras.main.zoomTo(1.018, 120, 'Sine.easeOut', true);
      this.time.delayedCall(140, () => this.cameras.main.zoomTo(1, 180, 'Sine.easeInOut', true));
      this.tweens.add({ targets: [this.chapterTitleText, this.chapterSubText], y: '-=6', alpha: 0.62, duration: 90, yoyo: true, ease: 'Sine.easeOut' });
    }
  }

  private sweepClouds(direction: number): void {
    if (!this.cloudLayer) return;
    const startX = 480 + direction * 470;
    const endX = 480 - direction * 470;
    const sweep = this.add.container(startX, 270).setDepth(75);
    for (let i = 0; i < 8; i++) {
      sweep.add(this.add.ellipse(
        Phaser.Math.Between(-160, 160),
        Phaser.Math.Between(-150, 150),
        Phaser.Math.Between(150, 280),
        Phaser.Math.Between(38, 80),
        0xffffff,
        Phaser.Math.FloatBetween(0.1, 0.24)
      ));
    }
    this.tweens.add({
      targets: sweep,
      x: endX,
      alpha: 0.12,
      duration: 430,
      ease: 'Cubic.easeInOut',
      onComplete: () => sweep.destroy(),
    });
  }

  private colorToCss(color: number): string {
    return `#${color.toString(16).padStart(6, '0')}`;
  }

  private stageCardKey(stageId: StageId): string {
    const safeId = stageId.replace('_', '-');
    const cardKey = `map-card-${safeId}`;
    if (this.textures.exists(cardKey)) return cardKey;
    const thumbKey = `map-thumb-${safeId}`;
    if (this.textures.exists(thumbKey)) return thumbKey;
    return 'ui-title-bg';
  }

  private stageColor(stage: StageConfig): number {
    if (stage.theme === 'forest') return 0x2f7d46;
    if (stage.theme === 'canyon') return 0xaa512d;
    if (stage.theme === 'swamp') return 0x3d7f67;
    return 0x8e2f42;
  }
}
