import Phaser from 'phaser';
import type { User } from 'firebase/auth';
import { playSfx } from '../game/AudioManager';
import { addCodeButton, addCodeLogo, addCodePanel, addCoverImage, addFloatingSparkles, addSceneVignette } from '../game/CodeUiKit';
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
  private loginPanel!: Phaser.GameObjects.Container;

  constructor() {
    super('MenuScene');
  }

  create(): void {
    this.children.removeAll(true);
    this.cameras.main.setBackgroundColor('#8fd5ff');
    this.createBackgroundLayer();
    this.createTopUtilityBar();
    this.createTitleBlock();
    this.createLoginPanel();
    this.createFooterStrip();

    this.time.delayedCall(0, () => {
      window.dispatchEvent(new CustomEvent('kingdom-seed:scene-ready', { detail: { scene: 'MenuScene', version: '1.2', at: Date.now() } }));
    });

    void this.bootstrapRedirectOrExistingUser();
  }

  private createBackgroundLayer(): void {
    addCoverImage(this, 'v1-login-bg', 960, 540, 0);
    addSceneVignette(this, 1, 0.10);

    const focus = this.add.ellipse(480, 248, 520, 350, 0xffffff, 0.08).setDepth(4);
    this.tweens.add({ targets: focus, alpha: 0.14, scaleX: 1.035, scaleY: 1.035, duration: 2300, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    addFloatingSparkles(this, 14, 6);
  }

  private createTopUtilityBar(): void {
    const versionChip = addCodePanel(this, { x: 94, y: 28, width: 156, height: 28, radius: 14, depth: 18, fill: 0x183d72, fillAlpha: 0.66, stroke: 0x9ed7ff, strokeAlpha: 0.42 });
    versionChip.add(this.add.text(0, 0, 'v1.2.0  HIGH QUALITY ART PASS', {
      fontSize: '10px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#12386f',
      strokeThickness: 2,
    }).setOrigin(0.5));

    addCodeButton(this, { x: 770, y: 31, width: 62, height: 28, label: '공지', iconText: '📢', tone: 'blue', fontSize: 10, depth: 20, onClick: () => this.setUtilityStatus('공지사항은 준비 중입니다.') });
    addCodeButton(this, { x: 844, y: 31, width: 70, height: 28, label: '문의', iconText: '🎧', tone: 'blue', fontSize: 10, depth: 20, onClick: () => this.setUtilityStatus('고객센터는 준비 중입니다.') });
    addCodeButton(this, { x: 922, y: 31, width: 64, height: 28, label: '설정', iconText: '⚙', tone: 'blue', fontSize: 10, depth: 20, onClick: () => this.setUtilityStatus('설정 메뉴는 다음 패치에서 연결합니다.') });
  }

  private setUtilityStatus(message: string): void {
    playSfx(this, 'sfx_click');
    if (this.statusText) {
      this.statusText.setText(message);
    }
  }

  private createTitleBlock(): void {
    addCodeLogo(this, 480, 86, 0.68);
    this.add.text(480, 142, '시네마틱 왕국 방어 전략', {
      fontSize: '14px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#144081',
      strokeThickness: 4,
      shadow: { offsetX: 0, offsetY: 2, color: '#000000', blur: 4, fill: true },
    }).setOrigin(0.5).setDepth(27);
  }

  private createLoginPanel(): void {
    this.loginPanel = this.add.container(480, 318).setDepth(35);
    this.loginPanel.add(addCodePanel(this, { x: 0, y: 0, width: 344, height: 232, radius: 28, fill: 0xfafdff, fillAlpha: 0.86, stroke: 0xe3bb54, strokeAlpha: 0.96, glow: 0x9eeeff, title: 'LOGIN' }));

    this.loginPanel.add(this.add.text(0, -80, 'DEFENSE COMMAND', {
      fontSize: '13px',
      color: '#2e66a4',
      fontStyle: 'bold',
      stroke: '#ffffff',
      strokeThickness: 3,
    }).setOrigin(0.5));

    this.statusText = this.add.text(0, -52, '로그인 확인 중...', {
      fontSize: '11px',
      color: '#3a5d96',
      align: 'center',
      fixedWidth: 250,
      backgroundColor: '#f2f8ffdd',
      padding: { x: 7, y: 3 },
    }).setOrigin(0.5);
    this.loginPanel.add(this.statusText);

    this.loginPanel.add(addCodeButton(this, { x: 0, y: -11, width: 236, height: 38, tone: 'gold', iconKey: 'ui-icon-anonymous', label: '바로 시작', fontSize: 17, onClick: () => void this.startAnonymous() }));
    this.loginPanel.add(addCodeButton(this, { x: 0, y: 36, width: 236, height: 38, tone: 'blue', iconKey: 'ui-icon-google', label: 'Google 연동', fontSize: 16, onClick: () => void this.startGoogle() }));
    this.loginPanel.add(addCodeButton(this, { x: -61, y: 81, width: 112, height: 34, tone: 'white', iconKey: 'ui-icon-email', label: '이메일', fontSize: 13, onClick: () => void this.startEmailLogin() }));
    this.loginPanel.add(addCodeButton(this, { x: 61, y: 81, width: 112, height: 34, tone: 'red', iconKey: 'ui-icon-register', label: '가입', fontSize: 13, onClick: () => void this.startEmailRegister() }));

    this.loginPanel.setAlpha(0).setScale(0.965).setY(330);
    this.tweens.add({ targets: this.loginPanel, alpha: 1, y: 318, scaleX: 1, scaleY: 1, duration: 320, ease: 'Back.easeOut' });
  }

  private createFooterStrip(): void {
    const strip = addCodePanel(this, { x: 480, y: 502, width: 360, height: 36, radius: 18, depth: 18, fill: 0x15477e, fillAlpha: 0.70, stroke: 0xe3bb54, strokeAlpha: 0.56 });
    strip.add(this.add.text(0, 0, '영웅 · 유물 · 타워 진화 · 보스 토벌', {
      fontSize: '11px',
      color: '#ffffff',
      align: 'center',
      fontStyle: 'bold',
      fixedWidth: 340,
      stroke: '#183c80',
      strokeThickness: 3,
    }).setOrigin(0.5));
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
      this.statusText.setText(`${this.currentSave.nickname} · 이어서 가능`);
    } catch (error) {
      console.error(error);
      this.statusText.setText('로그인 확인 실패. 설정/도메인 확인');
    }
  }

  private async startAnonymous(): Promise<void> {
    await this.withLoading(async () => {
      const user = await ensureAnonymousUser();
      const save = await loadOrCreateSave(user);
      this.enterMainMenu(user, save);
    });
  }

  private async startGoogle(): Promise<void> {
    await this.withLoading(async () => {
      const user = await loginWithGoogle();
      if (!user) {
        this.statusText.setText('Google 이동 중...');
        return;
      }
      const save = await loadOrCreateSave(user);
      this.enterMainMenu(user, save);
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
      this.enterMainMenu(user, save);
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
      this.enterMainMenu(user, save);
    });
  }

  private async withLoading(task: () => Promise<void>): Promise<void> {
    try {
      playSfx(this, 'sfx_click');
      this.statusText.setText('왕국 기록 연결 중...');
      await task();
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : '알 수 없는 오류';
      this.statusText.setText(`실패: ${message}`);
    }
  }

  private enterMainMenu(user: User, save: PlayerSave): void {
    this.cameras.main.fadeOut(180, 255, 255, 255);
    this.time.delayedCall(180, () => this.scene.start('MainMenuScene', { user, save }));
  }
}
