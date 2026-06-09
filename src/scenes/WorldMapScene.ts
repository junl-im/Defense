import Phaser from 'phaser';
import type { User } from 'firebase/auth';
import { fetchLeaderboard, loadOrCreateSave, type LeaderboardScore, type PlayerSave } from '../services/firebase';
import { MAX_LIVES, STAGE_ID } from '../game/balance';

export class WorldMapScene extends Phaser.Scene {
  private user!: User;
  private save!: PlayerSave;
  private infoText!: Phaser.GameObjects.Text;
  private leaderboardText!: Phaser.GameObjects.Text;

  constructor() {
    super('WorldMapScene');
  }

  init(data: { user: User; save: PlayerSave }): void {
    this.user = data.user;
    this.save = data.save;
  }

  create(): void {
    this.drawBackground();
    this.add.text(480, 54, 'KINGDOM SEED', {
      fontSize: '48px',
      color: '#f7d36b',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.infoText = this.add.text(480, 104, '', {
      fontSize: '18px',
      color: '#dbe7ff',
      align: 'center'
    }).setOrigin(0.5);

    this.makeStageNode(480, 275);
    this.makeButton(160, 486, '연구소', () => this.scene.start('LabScene', { user: this.user, save: this.save }), 190, 48, 0x284f39);
    this.makeButton(390, 486, '새로고침', () => void this.refreshSaveAndLeaderboard(), 190, 48, 0x24486b);
    this.makeButton(800, 486, '전투 시작', () => this.scene.start('GameScene', { user: this.user, save: this.save }), 220, 52, 0x9a3c2f);

    this.leaderboardText = this.add.text(704, 170, '리더보드 로딩 중...', {
      fontSize: '18px',
      color: '#ffffff',
      align: 'left',
      lineSpacing: 8,
      wordWrap: { width: 220 }
    }).setOrigin(0.5, 0);

    this.refreshHeader();
    void this.refreshSaveAndLeaderboard();
  }

  private drawBackground(): void {
    this.add.rectangle(480, 270, 960, 540, 0x102032, 1);

    const g = this.add.graphics();
    g.fillStyle(0x203c2b, 1);
    g.fillEllipse(210, 285, 360, 230);
    g.fillEllipse(490, 300, 430, 270);
    g.fillEllipse(735, 265, 330, 220);

    g.lineStyle(18, 0x8a6b3f, 1);
    g.beginPath();
    g.moveTo(90, 405);
    g.lineTo(255, 340);
    g.lineTo(480, 275);
    g.lineTo(690, 315);
    g.lineTo(880, 220);
    g.strokePath();

    this.add.rectangle(480, 510, 960, 60, 0x0b1220, 0.75);
  }

  private makeStageNode(x: number, y: number): void {
    const best = this.save.clearedStages[STAGE_ID];
    const stars = best?.bestStars ?? 0;

    this.add.circle(x, y, 70, 0x24486b, 1).setStrokeStyle(5, 0xf7d36b, 0.85);
    this.add.text(x, y - 18, 'Stage 001', { fontSize: '22px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
    this.add.text(x, y + 16, '숲길 방어전', { fontSize: '18px', color: '#dbe7ff' }).setOrigin(0.5);
    this.add.text(x, y + 56, `${'★'.repeat(stars)}${'☆'.repeat(3 - stars)}`, { fontSize: '24px', color: '#f7d36b' }).setOrigin(0.5);

    const ring = this.add.circle(x, y, 82, 0xffffff, 0).setStrokeStyle(2, 0xffffff, 0.18).setInteractive({ useHandCursor: true });
    ring.on('pointerdown', () => this.scene.start('GameScene', { user: this.user, save: this.save }));
  }

  private refreshHeader(): void {
    const best = this.save.clearedStages[STAGE_ID];
    const bestText = best ? `최고점수 ${best.bestScore} / 최고별 ${best.bestStars}` : '아직 클리어 기록 없음';
    this.infoText.setText(`${this.save.nickname}  |  보유 별 ${this.save.stars}  |  ${bestText}`);
  }

  private async refreshSaveAndLeaderboard(): Promise<void> {
    try {
      this.save = await loadOrCreateSave(this.user);
      this.refreshHeader();
      const scores = await fetchLeaderboard(STAGE_ID, 5);
      this.renderLeaderboard(scores);
    } catch (error) {
      console.error(error);
      this.leaderboardText.setText('리더보드 로드 실패\nFirebase Rules를 확인하세요.');
    }
  }

  private renderLeaderboard(scores: LeaderboardScore[]): void {
    const lines = scores.map((score, index) => `${index + 1}. ${score.nickname}\n   ${score.score}점 / ♥${score.lives}`).join('\n');
    this.leaderboardText.setText(`오늘의 명예의 전당\n\n${lines || '아직 기록 없음'}`);
  }

  private makeButton(x: number, y: number, label: string, onClick: () => void, width = 190, height = 48, color = 0x24486b): void {
    const rect = this.add.rectangle(x, y, width, height, color, 1).setStrokeStyle(2, 0xffffff, 0.35).setInteractive({ useHandCursor: true });
    this.add.text(x, y, label, { fontSize: '20px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
    rect.on('pointerdown', onClick);
    rect.on('pointerover', () => rect.setAlpha(0.85));
    rect.on('pointerout', () => rect.setAlpha(1));
  }
}
