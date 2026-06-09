import Phaser from 'phaser';
import type { User } from 'firebase/auth';
import {
  completePendingRedirectSignIn,
  ensureAnonymousUser,
  loadOrCreateSave,
  loginWithEmail,
  loginWithGoogle,
  registerWithEmail,
  waitForUser,
  type PlayerSave
} from '../services/firebase';

export class MenuScene extends Phaser.Scene {
  private statusText!: Phaser.GameObjects.Text;
  private currentUser: User | null = null;
  private currentSave: PlayerSave | null = null;

  constructor() {
    super('MenuScene');
  }

  create(): void {
    this.add.rectangle(480, 270, 960, 540, 0x101820, 1);
    this.add.text(480, 92, 'KINGDOM SEED', {
      fontSize: '58px',
      color: '#f7d36b',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(480, 148, 'Defense / Firebase web-game2 / GitHub Pages', {
      fontSize: '20px',
      color: '#dbe7ff'
    }).setOrigin(0.5);

    this.statusText = this.add.text(480, 195, '로그인 상태 확인 중...', {
      fontSize: '17px',
      color: '#98a6c2'
    }).setOrigin(0.5);

    this.makeButton(480, 250, '익명으로 바로 시작', () => void this.startAnonymous());
    this.makeButton(480, 312, 'Google 로그인으로 시작', () => void this.startGoogle());
    this.makeButton(480, 374, '이메일 로그인', () => void this.startEmailLogin());
    this.makeButton(480, 436, '이메일 회원가입', () => void this.startEmailRegister());

    this.add.text(480, 500, '게임 안에서: 빈 땅=타워 건설 / 영웅=터치 이동 / 병영=집결지 / 하단 버튼=스펠', {
      fontSize: '16px',
      color: '#b8c7df'
    }).setOrigin(0.5);

    void this.bootstrapRedirectOrExistingUser();
  }

  private async bootstrapRedirectOrExistingUser(): Promise<void> {
    try {
      const redirectUser = await completePendingRedirectSignIn();
      const existing = redirectUser ?? await waitForUser();
      if (!existing) {
        this.statusText.setText('로그인 방식을 선택하세요.');
        return;
      }
      this.currentUser = existing;
      this.currentSave = await loadOrCreateSave(existing);
      this.statusText.setText(`${this.currentSave.nickname} 로그인됨. 버튼을 눌러 시작하세요.`);
    } catch (error) {
      console.error(error);
      this.statusText.setText('Firebase 로그인 확인 실패. 설정/도메인을 확인하세요.');
    }
  }

  private async startAnonymous(): Promise<void> {
    await this.withLoading(async () => {
      const user = await ensureAnonymousUser();
      const save = await loadOrCreateSave(user);
      this.scene.start('GameScene', { user, save });
    });
  }

  private async startGoogle(): Promise<void> {
    await this.withLoading(async () => {
      const user = await loginWithGoogle();
      if (!user) {
        this.statusText.setText('Google 리다이렉트 중입니다. 돌아오면 자동으로 이어집니다.');
        return;
      }
      const save = await loadOrCreateSave(user);
      this.scene.start('GameScene', { user, save });
    });
  }

  private async startEmailLogin(): Promise<void> {
    const email = window.prompt('이메일을 입력하세요.');
    if (!email) return;
    const password = window.prompt('비밀번호를 입력하세요.');
    if (!password) return;

    await this.withLoading(async () => {
      const user = await loginWithEmail(email, password);
      const save = await loadOrCreateSave(user);
      this.scene.start('GameScene', { user, save });
    });
  }

  private async startEmailRegister(): Promise<void> {
    const email = window.prompt('가입할 이메일을 입력하세요.');
    if (!email) return;
    const password = window.prompt('비밀번호를 입력하세요. 6자 이상 권장');
    if (!password) return;

    await this.withLoading(async () => {
      const user = await registerWithEmail(email, password);
      const save = await loadOrCreateSave(user);
      this.scene.start('GameScene', { user, save });
    });
  }

  private async withLoading(task: () => Promise<void>): Promise<void> {
    try {
      this.statusText.setText('Firebase 처리 중...');
      await task();
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : '알 수 없는 오류';
      this.statusText.setText(`실패: ${message}`);
    }
  }

  private makeButton(x: number, y: number, label: string, onClick: () => void): void {
    const rect = this.add.rectangle(x, y, 300, 50, 0x24486b, 1).setStrokeStyle(2, 0x7cc7ff);
    const text = this.add.text(x, y, label, { fontSize: '21px', color: '#ffffff' }).setOrigin(0.5);
    rect.setInteractive({ useHandCursor: true });
    rect.on('pointerdown', onClick);
    rect.on('pointerover', () => rect.setFillStyle(0x315f8a));
    rect.on('pointerout', () => rect.setFillStyle(0x24486b));
    text.setDepth(1);
  }
}
