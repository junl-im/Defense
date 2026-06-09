import Phaser from 'phaser';
import type { User } from 'firebase/auth';
import { fetchLeaderboard, loadOrCreateSave, type LeaderboardScore, type PlayerSave } from '../services/firebase';
import { STAGE_LIST, getStageConfig } from '../game/balance';
import type { StageConfig, StageId } from '../game/types';
import { playSfx } from '../game/AudioManager';

type StageNodeView = {
  container: Phaser.GameObjects.Container;
  halo: Phaser.GameObjects.Arc;
  marker: Phaser.GameObjects.GameObject;
};

export class WorldMapScene extends Phaser.Scene {
  private user!: User;
  private save!: PlayerSave;
  private infoText!: Phaser.GameObjects.Text;
  private leaderboardText!: Phaser.GameObjects.Text;
  private selectedStage: StageConfig = getStageConfig('stage_001');
  private stageDetailText!: Phaser.GameObjects.Text;
  private startButton?: Phaser.GameObjects.Container;
  private startButtonLabel?: Phaser.GameObjects.Text;
  private stageNodes: StageNodeView[] = [];
  private cardContainer!: Phaser.GameObjects.Container;

  constructor() {
    super('WorldMapScene');
  }

  init(data: { user: User; save: PlayerSave }): void {
    this.user = data.user;
    this.save = data.save;
    this.selectedStage = getStageConfig('stage_001');
  }

  create(): void {
    this.drawBackground();
    this.createHeader();
    this.createRightPanel();
    this.createStageCardArea();
    this.renderStageNodes();

    this.makeImageButton(96, 498, '연구소', 'ui-button-blue', () => this.scene.start('LabScene', { user: this.user, save: this.save }), 146, 44);
    this.makeImageButton(248, 498, '도감', 'ui-button-gold', () => this.scene.start('CodexScene', { user: this.user, save: this.save }), 126, 44);
    this.makeImageButton(404, 498, '기록 새로고침', 'ui-button-primary', () => void this.refreshSaveAndLeaderboard(), 172, 44);
    this.startButton = this.makeImageButton(800, 488, '전투 시작', 'ui-button-red', () => this.startSelectedStage(), 226, 56, 24);
    this.startButtonLabel = this.startButton.getByName('label') as Phaser.GameObjects.Text;

    this.refreshHeader();
    this.renderStageDetail();
    void this.refreshSaveAndLeaderboard();
  }

  private drawBackground(): void {
    if (this.textures.exists('ui-world-map-bg')) {
      this.add.image(480, 270, 'ui-world-map-bg').setDisplaySize(960, 540).setDepth(0);
    } else {
      this.drawFallbackMap();
    }

    this.add.rectangle(480, 270, 960, 540, 0x000000, 0.12).setDepth(1);
    this.add.rectangle(480, 516, 960, 58, 0x110b09, 0.78).setStrokeStyle(2, 0xf0c56b, 0.25).setDepth(12);

    for (let i = 0; i < 20; i++) {
      const particle = this.add.sprite(
        Phaser.Math.Between(35, 650),
        Phaser.Math.Between(80, 450),
        'ui-particles',
        Phaser.Math.Between(0, 3)
      ).setDepth(3).setAlpha(Phaser.Math.FloatBetween(0.12, 0.28)).setScale(Phaser.Math.FloatBetween(0.35, 0.72));
      particle.play('ui-particle-glow');
      this.tweens.add({
        targets: particle,
        y: particle.y - Phaser.Math.Between(10, 28),
        alpha: Phaser.Math.FloatBetween(0.06, 0.22),
        duration: Phaser.Math.Between(1800, 3400),
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
    g.lineStyle(17, 0x8a6b3f, 1);
    g.beginPath();
    g.moveTo(88, 410);
    g.lineTo(245, 340);
    g.lineTo(455, 282);
    g.lineTo(632, 330);
    g.lineTo(780, 362);
    g.lineTo(900, 252);
    g.lineTo(610, 165);
    g.lineTo(885, 165);
    g.strokePath();
    g.lineStyle(9, 0xc19055, 1);
    g.strokePath();
  }

  private createHeader(): void {
    if (this.textures.exists('ui-banner-worldmap')) {
      this.add.image(480, 45, 'ui-banner-worldmap').setDisplaySize(438, 82).setDepth(15);
    }

    this.add.text(480, 38, 'KINGDOM SEED', {
      fontSize: '42px',
      color: '#ffe38c',
      fontStyle: 'bold',
      stroke: '#2b1208',
      strokeThickness: 6,
      shadow: { offsetX: 0, offsetY: 4, color: '#000000', blur: 5, fill: true },
    }).setOrigin(0.5).setDepth(16);

    this.infoText = this.add.text(480, 88, '', {
      fontSize: '17px',
      color: '#fff1bf',
      align: 'center',
      stroke: '#1d1009',
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(16);
  }

  private createRightPanel(): void {
    if (this.textures.exists('ui-panel-detail-large')) {
      this.add.image(805, 286, 'ui-panel-detail-large').setDisplaySize(318, 346).setDepth(10);
    } else {
      this.add.rectangle(805, 286, 318, 346, 0x0b1220, 0.78).setStrokeStyle(3, 0xf7d36b, 0.35).setDepth(10);
    }

    this.stageDetailText = this.add.text(672, 128, '', {
      fontSize: '16px',
      color: '#3a220f',
      align: 'left',
      lineSpacing: 6,
      wordWrap: { width: 266 },
      fontStyle: 'bold',
    }).setOrigin(0, 0).setDepth(15);

    this.leaderboardText = this.add.text(675, 322, '리더보드 로딩 중...', {
      fontSize: '15px',
      color: '#2b1b0e',
      align: 'left',
      lineSpacing: 5,
      wordWrap: { width: 255 },
      fontStyle: 'bold',
    }).setOrigin(0, 0).setDepth(15);
  }

  private createStageCardArea(): void {
    this.cardContainer = this.add.container(170, 163).setDepth(20);
  }

  private renderStageCard(): void {
    this.cardContainer.removeAll(true);
    const stage = this.selectedStage;
    const unlocked = this.isStageUnlocked(stage);
    const best = this.save.clearedStages[stage.id];
    const thumbKey = this.stageCardKey(stage.id);

    const bg = this.add.image(0, 0, thumbKey).setDisplaySize(246, 132).setAlpha(unlocked ? 1 : 0.36);
    const frameKey = unlocked ? 'ui-stage-card-frame' : 'ui-stage-card-locked';
    const frame = this.add.image(0, 0, frameKey).setDisplaySize(272, 154);
    const tint = this.add.rectangle(0, 0, 246, 132, 0x000000, unlocked ? 0.05 : 0.55);
    const title = this.add.text(0, -54, `Stage ${stage.number}`, {
      fontSize: '22px',
      color: '#ffe38c',
      fontStyle: 'bold',
      stroke: '#1b0d07',
      strokeThickness: 4,
    }).setOrigin(0.5);
    const subtitle = this.add.text(0, -24, stage.title, {
      fontSize: '18px',
      color: unlocked ? '#ffffff' : '#cccccc',
      fontStyle: 'bold',
      stroke: '#1b0d07',
      strokeThickness: 3,
    }).setOrigin(0.5);

    this.cardContainer.add([bg, tint, frame, title, subtitle]);

    if (!unlocked) {
      const lock = this.add.image(0, 18, 'ui-icon-lock').setScale(1.08);
      const lockText = this.add.text(0, 54, '잠김', { fontSize: '18px', color: '#ff9a9a', fontStyle: 'bold', stroke: '#1b0d07', strokeThickness: 3 }).setOrigin(0.5);
      this.cardContainer.add([lock, lockText]);
      return;
    }

    const stars = best?.bestStars ?? 0;
    for (let i = 0; i < 3; i++) {
      const star = this.add.image(-32 + i * 32, 52, 'ui-icon-star-large').setScale(0.58).setAlpha(i < stars ? 1 : 0.27);
      this.cardContainer.add(star);
    }
  }

  private renderStageNodes(): void {
    this.stageNodes.forEach((node) => node.container.destroy());
    this.stageNodes = [];

    const positions: Record<StageId, { x: number; y: number }> = {
      stage_001: { x: 455, y: 282 },
      stage_002: { x: 780, y: 362 },
      stage_003: { x: 610, y: 165 },
      stage_004: { x: 884, y: 168 },
    };

    STAGE_LIST.forEach((stage) => {
      const pos = positions[stage.id];
      const node = this.add.container(pos.x, pos.y).setDepth(8);
      const unlocked = this.isStageUnlocked(stage);
      const best = this.save.clearedStages[stage.id];
      const stars = best?.bestStars ?? 0;
      const selected = this.selectedStage.id === stage.id;
      const color = this.stageColor(stage);
      const halo = this.add.circle(0, 0, selected ? 42 : 34, 0xffe38c, selected ? 0.22 : 0.04).setStrokeStyle(selected ? 4 : 2, selected ? 0xffe38c : 0xffffff, selected ? 0.85 : 0.22);
      const base = this.add.circle(0, 0, 28, unlocked ? color : 0x565656, 1).setStrokeStyle(3, unlocked ? 0xffe38c : 0xaaaaaa, unlocked ? 0.82 : 0.42);
      const marker = this.add.triangle(0, -30, -14, 0, 14, 0, 0, 24, unlocked ? 0xd63d2c : 0x666666, 1).setStrokeStyle(2, 0xffe38c, unlocked ? 0.55 : 0.18);
      const num = this.add.text(0, -2, `${stage.number}`, { fontSize: '22px', color: '#ffffff', fontStyle: 'bold', stroke: '#1b0d07', strokeThickness: 4 }).setOrigin(0.5);
      const starLine = this.add.text(0, 35, `${'★'.repeat(stars)}${'☆'.repeat(3 - stars)}`, { fontSize: '17px', color: unlocked ? '#ffe38c' : '#999999', stroke: '#1b0d07', strokeThickness: 3 }).setOrigin(0.5);
      node.add([halo, marker, base, num, starLine]);

      if (!unlocked) {
        const lock = this.add.image(0, -52, 'ui-icon-lock').setScale(0.55);
        node.add(lock);
      }

      const hit = this.add.circle(0, 0, 48, 0xffffff, 0.001).setInteractive({ useHandCursor: true });
      node.add(hit);
      hit.on('pointerdown', () => this.selectStage(stage));
      hit.on('pointerover', () => {
        this.tweens.add({ targets: node, scale: selected ? 1.05 : 1.1, duration: 100 });
      });
      hit.on('pointerout', () => {
        this.tweens.add({ targets: node, scale: selected ? 1.06 : 1, duration: 100 });
      });

      if (selected) node.setScale(1.06);
      this.stageNodes.push({ container: node, halo, marker });
    });
  }

  private selectStage(stage: StageConfig): void {
    this.selectedStage = stage;
    playSfx(this, 'sfx_click');
    this.renderStageNodes();
    this.renderStageDetail();
    void this.loadLeaderboard(stage.id);
  }

  private refreshHeader(): void {
    const totalBestStars = STAGE_LIST.reduce((sum, stage) => sum + (this.save.clearedStages[stage.id]?.bestStars ?? 0), 0);
    this.infoText.setText(`${this.save.nickname}  |  보유 별 ${this.save.stars}  |  누적 최고 별 ${totalBestStars}/${STAGE_LIST.length * 3}`);
  }

  private renderStageDetail(): void {
    this.renderStageCard();
    const stage = this.selectedStage;
    const best = this.save.clearedStages[stage.id];
    const unlocked = this.isStageUnlocked(stage);
    const lockText = !unlocked && stage.unlockRequires ? `잠김: Stage ${getStageConfig(stage.unlockRequires).number} 클리어 필요` : '입장 가능';
    const bestText = best ? `최고점수 ${best.bestScore}\n최고별 ${best.bestStars} / 최고 라이프 ${best.bestLives}` : '아직 클리어 기록 없음';
    this.stageDetailText.setText(
      `선택 전장\n` +
      `Stage ${stage.number}. ${stage.title}\n` +
      `${stage.subtitle}\n\n난이도: ${stage.difficulty}\n웨이브: ${stage.waves.length}\n초기 골드: $${stage.startGold}\n\n${lockText}\n${bestText}\n\nTIP: ${stage.tip}`
    );
    this.startButton?.setAlpha(unlocked ? 1 : 0.58);
    this.startButtonLabel?.setText(unlocked ? '전투 시작' : '잠김');
  }

  private async refreshSaveAndLeaderboard(): Promise<void> {
    try {
      this.save = await loadOrCreateSave(this.user);
      this.refreshHeader();
      this.renderStageNodes();
      this.renderStageDetail();
      await this.loadLeaderboard(this.selectedStage.id);
    } catch (error) {
      console.error(error);
      this.leaderboardText.setText('리더보드 로드 실패\nFirebase Rules를 확인하세요.');
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
    const lines = scores.map((score, index) => `${index + 1}. ${score.nickname}\n   ${score.score}점 / ♥${score.lives}`).join('\n');
    this.leaderboardText.setText(`오늘의 ${this.selectedStage.title}\n명예의 전당\n\n${lines || '아직 기록 없음'}`);
  }

  private startSelectedStage(): void {
    if (!this.isStageUnlocked(this.selectedStage)) {
      playSfx(this, 'sfx_hit');
      this.stageDetailText.setText(`${this.stageDetailText.text}\n\n먼저 이전 스테이지를 클리어하세요.`);
      return;
    }
    playSfx(this, 'sfx_wave');
    this.cameras.main.fadeOut(220, 0, 0, 0);
    this.time.delayedCall(230, () => {
      this.scene.start('GameScene', { user: this.user, save: this.save, stageId: this.selectedStage.id });
    });
  }

  private isStageUnlocked(stage: StageConfig): boolean {
    if (!stage.unlockRequires) return true;
    return Boolean(this.save.clearedStages[stage.unlockRequires]?.bestStars);
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
    const bg = this.add.image(0, 0, texture).setDisplaySize(width, height);
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
    const key = `map-card-${safeId}`;
    if (this.textures.exists(key)) return key;
    return `map-thumb-${safeId}`;
  }

  private stageColor(stage: StageConfig): number {
    if (stage.theme === 'forest') return 0x2f7d46;
    if (stage.theme === 'canyon') return 0xaa512d;
    if (stage.theme === 'swamp') return 0x3d7f67;
    return 0x8e2f42;
  }
}
