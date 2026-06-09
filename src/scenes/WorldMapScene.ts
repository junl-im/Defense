import Phaser from 'phaser';
import type { User } from 'firebase/auth';
import { fetchLeaderboard, loadOrCreateSave, type LeaderboardScore, type PlayerSave } from '../services/firebase';
import { STAGE_LIST, getStageConfig } from '../game/balance';
import type { StageConfig, StageId } from '../game/types';
import { playMusic, playSfx } from '../game/AudioManager';

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
  private startButton?: Phaser.GameObjects.Container;
  private startButtonLabel?: Phaser.GameObjects.Text;
  private leftArrow?: Phaser.GameObjects.Container;
  private rightArrow?: Phaser.GameObjects.Container;
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
    this.createHeader();
    this.createCarouselArea();
    this.createDetailPanel();
    this.createFooterControls();
    this.renderCarousel();
    this.renderStageDots();
    this.refreshHeader();
    this.renderStageDetail();
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
    if (this.textures.exists('ui-world-map-bg')) {
      this.add.image(480, 270, 'ui-world-map-bg').setDisplaySize(960, 540).setDepth(0);
    } else {
      this.drawFallbackMap();
    }

    this.add.rectangle(480, 270, 960, 540, 0x06080d, 0.25).setDepth(1);
    this.add.rectangle(480, 49, 960, 98, 0x120905, 0.72).setDepth(3);
    this.add.rectangle(480, 514, 960, 56, 0x120905, 0.82).setStrokeStyle(2, 0xf0c56b, 0.28).setDepth(3);

    const mist = this.add.graphics().setDepth(2);
    for (let i = 0; i < 9; i++) {
      mist.fillStyle(0xffffff, 0.035);
      mist.fillEllipse(Phaser.Math.Between(20, 940), Phaser.Math.Between(110, 470), Phaser.Math.Between(140, 260), Phaser.Math.Between(22, 48));
    }

    for (let i = 0; i < 26; i++) {
      if (!this.textures.exists('ui-particles')) break;
      const particle = this.add.sprite(
        Phaser.Math.Between(45, 920),
        Phaser.Math.Between(85, 465),
        'ui-particles',
        Phaser.Math.Between(0, 3)
      ).setDepth(4).setAlpha(Phaser.Math.FloatBetween(0.08, 0.24)).setScale(Phaser.Math.FloatBetween(0.28, 0.64));
      particle.play('ui-particle-glow');
      this.tweens.add({
        targets: particle,
        y: particle.y - Phaser.Math.Between(12, 32),
        x: particle.x + Phaser.Math.Between(-14, 14),
        alpha: Phaser.Math.FloatBetween(0.04, 0.2),
        duration: Phaser.Math.Between(1800, 3600),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }
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

  private createHeader(): void {
    if (this.textures.exists('ui-banner-worldmap')) {
      this.add.image(480, 45, 'ui-banner-worldmap').setDisplaySize(468, 84).setDepth(10);
    }

    this.titleText = this.add.text(480, 36, 'KINGDOM SEED', {
      fontSize: '39px',
      color: '#ffe38c',
      fontStyle: 'bold',
      stroke: '#2b1208',
      strokeThickness: 7,
      shadow: { offsetX: 0, offsetY: 4, color: '#000000', blur: 5, fill: true },
    }).setOrigin(0.5).setDepth(11);

    this.infoText = this.add.text(480, 85, '', {
      fontSize: '16px',
      color: '#fff1bf',
      align: 'center',
      stroke: '#1d1009',
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(11);
  }

  private createCarouselArea(): void {
    this.add.rectangle(360, 287, 608, 306, 0x000000, 0.26)
      .setStrokeStyle(2, 0xffd67a, 0.2)
      .setDepth(8);
    this.add.text(360, 128, '전장을 좌우로 넘겨 선택하세요', {
      fontSize: '17px',
      color: '#ffe7ad',
      fontStyle: 'bold',
      stroke: '#120706',
      strokeThickness: 4,
    }).setOrigin(0.5).setDepth(12);

    this.cardRoot = this.add.container(360, 278).setDepth(20);

    const hit = this.add.rectangle(360, 278, 620, 300, 0xffffff, 0.001)
      .setInteractive({ useHandCursor: true })
      .setDepth(19);
    hit.on('pointerdown', (pointer: Phaser.Input.Pointer) => this.beginDrag(pointer));
    hit.on('pointermove', (pointer: Phaser.Input.Pointer) => this.moveDrag(pointer));
    hit.on('pointerup', (pointer: Phaser.Input.Pointer) => this.endDrag(pointer));
    hit.on('pointerupoutside', (pointer: Phaser.Input.Pointer) => this.endDrag(pointer));

    this.leftArrow = this.makeArrowButton(43, 278, '‹', () => this.slideBy(-1));
    this.rightArrow = this.makeArrowButton(677, 278, '›', () => this.slideBy(1));
  }

  private createDetailPanel(): void {
    if (this.textures.exists('ui-panel-detail-large')) {
      this.add.image(812, 282, 'ui-panel-detail-large').setDisplaySize(292, 346).setDepth(10);
    } else {
      this.add.rectangle(812, 282, 292, 346, 0xd3aa6b, 0.88).setStrokeStyle(4, 0x5a2d12, 0.5).setDepth(10);
    }

    this.stageDetailText = this.add.text(692, 119, '', {
      fontSize: '15px',
      color: '#35200e',
      align: 'left',
      lineSpacing: 5,
      wordWrap: { width: 242 },
      fontStyle: 'bold',
    }).setOrigin(0, 0).setDepth(15);

    this.leaderboardText = this.add.text(696, 326, '명예의 전당 로딩 중...', {
      fontSize: '14px',
      color: '#2b1b0e',
      align: 'left',
      lineSpacing: 4,
      wordWrap: { width: 236 },
      fontStyle: 'bold',
    }).setOrigin(0, 0).setDepth(15);
  }

  private createFooterControls(): void {
    this.makeImageButton(90, 508, '연구소', 'ui-button-blue', () => this.scene.start('LabScene', { user: this.user, save: this.save }), 136, 42);
    this.makeImageButton(230, 508, '도감', 'ui-button-gold', () => this.scene.start('CodexScene', { user: this.user, save: this.save }), 110, 42);
    this.makeImageButton(382, 508, '기록 새로고침', 'ui-button-primary', () => void this.refreshSaveAndLeaderboard(), 174, 42, 18);
    this.startButton = this.makeImageButton(810, 497, '전투 시작', 'ui-button-red', () => this.startSelectedStage(), 230, 58, 24);
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
  }

  private createStageCard(stage: StageConfig, index: number, distance: number): Phaser.GameObjects.Container {
    const unlocked = this.isStageUnlocked(stage);
    const selected = index === this.selectedIndex;
    const best = this.save.clearedStages[stage.id];
    const abs = Math.abs(distance);
    const card = this.add.container(0, 0);
    const thumbKey = this.stageCardKey(stage.id);

    const shadow = this.add.rectangle(8, 12, CARD_WIDTH, CARD_HEIGHT, 0x000000, selected ? 0.38 : 0.22);
    shadow.setOrigin(0.5).setScale(selected ? 1.02 : 0.93);

    const thumb = this.add.image(0, 0, thumbKey).setDisplaySize(CARD_WIDTH - 28, CARD_HEIGHT - 38);
    thumb.setAlpha(unlocked ? 1 : 0.33);

    const frameKey = unlocked ? 'ui-stage-card-frame' : 'ui-stage-card-locked';
    const frame = this.textures.exists(frameKey)
      ? this.add.image(0, 0, frameKey).setDisplaySize(CARD_WIDTH, CARD_HEIGHT)
      : this.add.rectangle(0, 0, CARD_WIDTH, CARD_HEIGHT, unlocked ? 0x8c6239 : 0x595959, 0.92).setStrokeStyle(4, 0xffd67a, unlocked ? 0.65 : 0.2);

    const shade = this.add.rectangle(0, 0, CARD_WIDTH - 30, CARD_HEIGHT - 40, 0x000000, unlocked ? 0.08 : 0.58);
    const stageRibbon = this.add.rectangle(0, -68, 210, 28, this.stageColor(stage), unlocked ? 0.95 : 0.45).setStrokeStyle(2, 0xffe38c, unlocked ? 0.38 : 0.14);
    const stageNo = this.add.text(0, -69, `STAGE ${stage.number}`, {
      fontSize: '18px',
      color: '#fff2bb',
      fontStyle: 'bold',
      stroke: '#1b0d07',
      strokeThickness: 4,
    }).setOrigin(0.5);

    const title = this.add.text(0, -18, stage.title, {
      fontSize: selected ? '24px' : '21px',
      color: unlocked ? '#ffffff' : '#c7c7c7',
      fontStyle: 'bold',
      stroke: '#1b0d07',
      strokeThickness: 5,
      align: 'center',
    }).setOrigin(0.5);

    const sub = this.add.text(0, 14, stage.subtitle, {
      fontSize: '15px',
      color: unlocked ? '#ffe7ad' : '#aaaaaa',
      fontStyle: 'bold',
      stroke: '#1b0d07',
      strokeThickness: 3,
    }).setOrigin(0.5);

    card.add([shadow, thumb, shade, frame, stageRibbon, stageNo, title, sub]);

    if (!unlocked) {
      const lock = this.textures.exists('ui-icon-lock')
        ? this.add.image(0, 39, 'ui-icon-lock').setScale(0.74)
        : this.add.text(0, 38, '🔒', { fontSize: '30px' }).setOrigin(0.5);
      const lockText = this.add.text(0, 68, 'LOCKED', {
        fontSize: '16px',
        color: '#ff9f9f',
        fontStyle: 'bold',
        stroke: '#1b0d07',
        strokeThickness: 4,
      }).setOrigin(0.5);
      card.add([lock, lockText]);
    } else {
      const stars = best?.bestStars ?? 0;
      for (let i = 0; i < 3; i++) {
        const star = this.textures.exists('ui-icon-star-large')
          ? this.add.image(-36 + i * 36, 62, 'ui-icon-star-large').setScale(0.54).setAlpha(i < stars ? 1 : 0.22)
          : this.add.text(-36 + i * 36, 62, i < stars ? '★' : '☆', { fontSize: '24px', color: '#ffe38c' }).setOrigin(0.5);
        card.add(star);
      }
    }

    const progress = this.add.text(0, 91, this.cardProgressText(stage), {
      fontSize: '13px',
      color: unlocked ? '#fff2bb' : '#a9a9a9',
      fontStyle: 'bold',
      stroke: '#120706',
      strokeThickness: 3,
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

    return card;
  }

  private renderStageDots(): void {
    this.stageDots.forEach((dot) => dot.container.destroy());
    this.stageDots = [];

    const totalWidth = (STAGE_LIST.length - 1) * 68;
    const startX = 360 - totalWidth / 2;
    const y = 455;

    STAGE_LIST.forEach((stage, index) => {
      const unlocked = this.isStageUnlocked(stage);
      const selected = index === this.selectedIndex;
      const x = startX + index * 68;
      const container = this.add.container(x, y).setDepth(24);
      const halo = this.add.circle(0, 0, selected ? 22 : 17, 0xffe38c, selected ? 0.22 : 0.03).setStrokeStyle(selected ? 3 : 1, 0xffe38c, selected ? 0.8 : 0.25);
      const dot = this.add.circle(0, 0, 12, unlocked ? this.stageColor(stage) : 0x575757, 1).setStrokeStyle(2, unlocked ? 0xffe38c : 0xa9a9a9, unlocked ? 0.65 : 0.28);
      const label = this.add.text(0, 0, `${stage.number}`, {
        fontSize: '13px',
        color: '#ffffff',
        fontStyle: 'bold',
        stroke: '#100604',
        strokeThickness: 3,
      }).setOrigin(0.5);
      const hit = this.add.circle(0, 0, 25, 0xffffff, 0.001).setInteractive({ useHandCursor: true });
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
      ? `잠김: Stage ${getStageConfig(stage.unlockRequires).number} 클리어 필요`
      : '입장 가능';
    const bestText = best
      ? `최고점수 ${best.bestScore}\n최고별 ${best.bestStars} / 최고 라이프 ${best.bestLives}`
      : '아직 클리어 기록 없음';

    this.stageDetailText.setText(
      `선택 전장\n` +
      `Stage ${stage.number}. ${stage.title}\n` +
      `${stage.subtitle}\n\n` +
      `난이도: ${stage.difficulty}\n` +
      `웨이브: ${stage.waves.length}\n` +
      `초기 골드: $${stage.startGold}\n\n` +
      `${lockText}\n${bestText}\n\n` +
      `TIP: ${stage.tip}`
    );

    this.startButton?.setAlpha(unlocked ? 1 : 0.58);
    this.startButtonLabel?.setText(unlocked ? '전투 시작' : '잠김');
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
    const shadow = this.add.circle(4, 5, 30, 0x000000, 0.32);
    const base = this.add.circle(0, 0, 31, 0x5b2a16, 0.94).setStrokeStyle(3, 0xffd67a, 0.7);
    const icon = this.add.text(0, -3, label, {
      fontSize: '52px',
      color: '#ffe7ad',
      fontStyle: 'bold',
      stroke: '#1b0d07',
      strokeThickness: 5,
    }).setOrigin(0.5);
    const hit = this.add.circle(0, 0, 38, 0xffffff, 0.001).setInteractive({ useHandCursor: true });
    container.add([shadow, base, icon, hit]);
    hit.on('pointerdown', () => onClick());
    hit.on('pointerover', () => this.tweens.add({ targets: container, scale: 1.08, duration: 90 }));
    hit.on('pointerout', () => this.tweens.add({ targets: container, scale: 1, duration: 90 }));
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
