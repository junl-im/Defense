import Phaser from 'phaser';
import type { User } from 'firebase/auth';
import { fetchLeaderboard, loadOrCreateSave, type LeaderboardScore, type PlayerSave } from '../services/firebase';
import { STAGE_LIST, getStageConfig } from '../game/balance';
import type { StageConfig, StageId } from '../game/types';

export class WorldMapScene extends Phaser.Scene {
  private user!: User;
  private save!: PlayerSave;
  private infoText!: Phaser.GameObjects.Text;
  private leaderboardText!: Phaser.GameObjects.Text;
  private selectedStage: StageConfig = getStageConfig('stage_001');
  private stageDetailText!: Phaser.GameObjects.Text;
  private startButton?: Phaser.GameObjects.Rectangle;
  private stageNodes: Phaser.GameObjects.Container[] = [];

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
    this.add.text(480, 48, 'KINGDOM SEED', {
      fontSize: '48px',
      color: '#f7d36b',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(5);

    this.infoText = this.add.text(480, 98, '', {
      fontSize: '18px',
      color: '#dbe7ff',
      align: 'center'
    }).setOrigin(0.5).setDepth(5);

    this.stageDetailText = this.add.text(705, 145, '', {
      fontSize: '17px',
      color: '#ffffff',
      align: 'left',
      lineSpacing: 7,
      wordWrap: { width: 245 }
    }).setOrigin(0, 0).setDepth(5);

    this.leaderboardText = this.add.text(705, 286, '리더보드 로딩 중...', {
      fontSize: '17px',
      color: '#dbe7ff',
      align: 'left',
      lineSpacing: 6,
      wordWrap: { width: 245 }
    }).setOrigin(0, 0).setDepth(5);

    this.renderStageNodes();
    this.makeButton(122, 486, '연구소', () => this.scene.start('LabScene', { user: this.user, save: this.save }), 160, 48, 0x284f39);
    this.makeButton(300, 486, '도감', () => this.scene.start('CodexScene', { user: this.user, save: this.save }), 140, 48, 0x5a3f6b);
    this.makeButton(478, 486, '새로고침', () => void this.refreshSaveAndLeaderboard(), 160, 48, 0x24486b);
    this.startButton = this.makeButton(800, 486, '전투 시작', () => this.startSelectedStage(), 220, 52, 0x9a3c2f);

    this.refreshHeader();
    this.renderStageDetail();
    void this.refreshSaveAndLeaderboard();
  }

  private drawBackground(): void {
    this.add.rectangle(480, 270, 960, 540, 0x102032, 1);

    const g = this.add.graphics();
    g.fillStyle(0x203c2b, 1);
    g.fillEllipse(200, 300, 390, 250);
    g.fillEllipse(500, 315, 460, 280);
    g.fillEllipse(760, 280, 330, 230);
    g.fillStyle(0x7c3f2c, 1);
    g.fillEllipse(790, 360, 280, 170);
    g.fillEllipse(645, 410, 270, 120);

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

    g.fillStyle(0x1d3b33, 1);
    g.fillEllipse(600, 165, 250, 150);
    g.fillStyle(0x34272f, 1);
    g.fillEllipse(884, 168, 220, 130);
    g.fillStyle(0x70a075, 0.16);
    g.fillEllipse(575, 170, 120, 45);

    this.add.rectangle(805, 282, 310, 315, 0x0b1220, 0.72).setStrokeStyle(2, 0xf7d36b, 0.2);
    this.add.rectangle(480, 510, 960, 60, 0x0b1220, 0.78);

    for (let i = 0; i < 24; i++) {
      const x = 50 + ((i * 79) % 580);
      const y = 140 + ((i * 53) % 285);
      this.add.circle(x, y, 11 + (i % 3) * 3, 0x18472b, 1);
      this.add.rectangle(x, y + 14, 5, 15, 0x5a371c, 1);
    }
  }

  private renderStageNodes(): void {
    this.stageNodes.forEach((node) => node.destroy());
    this.stageNodes = [];
    const positions: Record<StageId, { x: number; y: number }> = {
      stage_001: { x: 455, y: 282 },
      stage_002: { x: 780, y: 362 },
      stage_003: { x: 610, y: 165 },
      stage_004: { x: 884, y: 168 }
    };

    STAGE_LIST.forEach((stage) => {
      const pos = positions[stage.id];
      const node = this.add.container(pos.x, pos.y).setDepth(4);
      const unlocked = this.isStageUnlocked(stage);
      const best = this.save.clearedStages[stage.id];
      const stars = best?.bestStars ?? 0;
      const selected = this.selectedStage.id === stage.id;

      const themeColor = stage.theme === 'forest' ? 0x24486b : stage.theme === 'canyon' ? 0x8c4129 : stage.theme === 'swamp' ? 0x2f5a43 : 0x6c1f2a;
      const color = unlocked ? themeColor : 0x444444;
      const ring = this.add.circle(0, 0, selected ? 78 : 68, 0xffffff, selected ? 0.08 : 0).setStrokeStyle(selected ? 4 : 2, selected ? 0xf7d36b : 0xffffff, selected ? 0.8 : 0.22);
      const core = this.add.circle(0, 0, 56, color, 1).setStrokeStyle(4, unlocked ? 0xf7d36b : 0x888888, unlocked ? 0.75 : 0.38);
      const number = this.add.text(0, -18, `Stage ${stage.number}`, { fontSize: '20px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
      const title = this.add.text(0, 12, stage.title, { fontSize: '15px', color: unlocked ? '#dbe7ff' : '#bbbbbb', fontStyle: 'bold' }).setOrigin(0.5);
      const starText = this.add.text(0, 48, `${'★'.repeat(stars)}${'☆'.repeat(3 - stars)}`, { fontSize: '22px', color: unlocked ? '#f7d36b' : '#8f8f8f' }).setOrigin(0.5);
      const lock = unlocked ? undefined : this.add.text(0, -52, 'LOCK', { fontSize: '14px', color: '#ff8080', fontStyle: 'bold' }).setOrigin(0.5);

      node.add([ring, core, number, title, starText]);
      if (lock) node.add(lock);
      core.setInteractive({ useHandCursor: true });
      core.on('pointerdown', () => {
        this.selectedStage = stage;
        this.renderStageNodes();
        this.renderStageDetail();
        void this.loadLeaderboard(stage.id);
      });
      this.stageNodes.push(node);
    });
  }

  private refreshHeader(): void {
    const totalBestStars = STAGE_LIST.reduce((sum, stage) => sum + (this.save.clearedStages[stage.id]?.bestStars ?? 0), 0);
    this.infoText.setText(`${this.save.nickname}  |  보유 별 ${this.save.stars}  |  누적 최고 별 ${totalBestStars}/${STAGE_LIST.length * 3}`);
  }

  private renderStageDetail(): void {
    const stage = this.selectedStage;
    const best = this.save.clearedStages[stage.id];
    const unlocked = this.isStageUnlocked(stage);
    const lockText = !unlocked && stage.unlockRequires ? `잠김: Stage ${getStageConfig(stage.unlockRequires).number} 클리어 필요` : '입장 가능';
    const bestText = best ? `최고점수 ${best.bestScore}\n최고별 ${best.bestStars} / 최고 라이프 ${best.bestLives}` : '아직 클리어 기록 없음';
    this.stageDetailText.setText(
      `선택 스테이지\n` +
      `Stage ${stage.number}. ${stage.title}\n` +
      `${stage.subtitle}\n난이도: ${stage.difficulty}\n웨이브: ${stage.waves.length}\n초기 골드: $${stage.startGold}\n\n${lockText}\n${bestText}\n\nTIP: ${stage.tip}`
    );
    this.startButton?.setFillStyle(unlocked ? 0x9a3c2f : 0x444444, 1);
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
      this.leaderboardText.setText('리더보드 로딩 중...');
      const scores = await fetchLeaderboard(stageId, 5);
      this.renderLeaderboard(scores);
    } catch (error) {
      console.error(error);
      this.leaderboardText.setText('리더보드 로드 실패');
    }
  }

  private renderLeaderboard(scores: LeaderboardScore[]): void {
    const lines = scores.map((score, index) => `${index + 1}. ${score.nickname}\n   ${score.score}점 / ♥${score.lives}`).join('\n');
    this.leaderboardText.setText(`오늘의 ${this.selectedStage.title} 명예의 전당\n\n${lines || '아직 기록 없음'}`);
  }

  private startSelectedStage(): void {
    if (!this.isStageUnlocked(this.selectedStage)) {
      this.stageDetailText.setText(`${this.stageDetailText.text}\n\n먼저 이전 스테이지를 클리어하세요.`);
      return;
    }
    this.scene.start('GameScene', { user: this.user, save: this.save, stageId: this.selectedStage.id });
  }

  private isStageUnlocked(stage: StageConfig): boolean {
    if (!stage.unlockRequires) return true;
    return Boolean(this.save.clearedStages[stage.unlockRequires]?.bestStars);
  }

  private makeButton(x: number, y: number, label: string, onClick: () => void, width = 190, height = 48, color = 0x24486b): Phaser.GameObjects.Rectangle {
    const rect = this.add.rectangle(x, y, width, height, color, 1).setStrokeStyle(2, 0xffffff, 0.35).setInteractive({ useHandCursor: true }).setDepth(9);
    this.add.text(x, y, label, { fontSize: '20px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5).setDepth(10);
    rect.on('pointerdown', onClick);
    rect.on('pointerover', () => rect.setAlpha(0.85));
    rect.on('pointerout', () => rect.setAlpha(1));
    return rect;
  }
}
