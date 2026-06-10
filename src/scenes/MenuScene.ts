import Phaser from 'phaser';
import type { User } from 'firebase/auth';
import { playSfx } from '../game/AudioManager';
import { addCoverImage } from '../game/CodeUiKit';
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
  private isTransitioning = false;

  constructor() {
    super('MenuScene');
  }

  create(): void {
    this.children.removeAll(true);
    this.isTransitioning = false;
    this.cameras.main.setBackgroundColor('#8fd5ff');

    this.createCinematicSplash();
    this.createStatusOverlay();
    this.createLoginHitZones();
    this.createUtilityHitZones();

    this.time.delayedCall(0, () => {
      window.dispatchEvent(new CustomEvent('kingdom-seed:scene-ready', { detail: { scene: 'MenuScene', version: '1.6', at: Date.now() } }));
    });

    void this.bootstrapRedirectOrExistingUser();
  }

  private createCinematicSplash(): void {
    const key = this.textures.exists('v1-login-refined')
      ? 'v1-login-refined'
      : this.textures.exists('v1-login-splash')
        ? 'v1-login-splash'
        : 'v1-login-bg';
    addCoverImage(this, key, 960, 540, 0);

    // v1.6: background/logo/panel/buttons are a refined baked art layer,
    // while version text, state text, and hit-zones are controlled by code.
    const bottomGlow = this.add.ellipse(480, 520, 510, 42, 0x8cdcff, 0.08)
      .setDepth(3)
      .setBlendMode(Phaser.BlendModes.ADD);
    this.tweens.add({ targets: bottomGlow, alpha: 0.14, scaleX: 1.025, duration: 1800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  }

  private createStatusOverlay(): void {
    const statusBack = this.add.graphics().setDepth(52);
    statusBack.fillStyle(0xf7fbff, 0.90);
    statusBack.fillRoundedRect(334, 294, 292, 22, 11);
    statusBack.lineStyle(1, 0xb9d4ef, 0.82);
    statusBack.strokeRoundedRect(334, 294, 292, 22, 11);
    statusBack.lineStyle(1, 0xffffff, 0.52);
    statusBack.strokeRoundedRect(339, 299, 282, 12, 6);

    this.statusText = this.add.text(480, 305, '로그인 확인 중...', {
      fontSize: '11px',
      color: '#2f5f9e',
      align: 'center',
      fixedWidth: 276,
      fontFamily: 'Pretendard, Noto Sans KR, NanumGothic, Malgun Gothic, Arial, sans-serif',
      fontStyle: 'bold',
      stroke: '#ffffff',
      strokeThickness: 2,
    }).setOrigin(0.5).setDepth(53);

    this.add.text(18, 18, 'v1.6.0 ART UI PASS', {
      fontSize: '12px',
      color: '#f7fbff',
      fontFamily: 'Pretendard, Noto Sans KR, Arial, sans-serif',
      fontStyle: 'bold',
      shadow: { offsetX: 0, offsetY: 2, color: '#08315f', blur: 3, fill: true },
    }).setDepth(53).setAlpha(0.88);
  }

  private createLoginHitZones(): void {
    // Coordinates are locked to the v1.6 refined login art at 960x540.
    // This fixes the previous mismatch where the visible premium buttons and click areas were offset.
    this.addCinematicHotspot({
      x: 490,
      y: 353,
      width: 292,
      height: 42,
      radius: 22,
      tint: 0xffdf8f,
      onClick: () => void this.startQuick(),
    });

    this.addCinematicHotspot({
      x: 490,
      y: 405,
      width: 292,
      height: 40,
      radius: 22,
      tint: 0xbfdcff,
      onClick: () => void this.startGoogle(),
    });

    this.addCinematicHotspot({
      x: 414,
      y: 456,
      width: 132,
      height: 36,
      radius: 18,
      tint: 0xffffff,
      onClick: () => void this.startEmailLogin(),
    });

    this.addCinematicHotspot({
      x: 566,
      y: 456,
      width: 132,
      height: 36,
      radius: 18,
      tint: 0xffd5dc,
      onClick: () => void this.startEmailRegister(),
    });
  }

  private createUtilityHitZones(): void {
    this.addCinematicHotspot({
      x: 840,
      y: 36,
      width: 50,
      height: 50,
      radius: 25,
      tint: 0xffffff,
      onClick: () => this.setUtilityStatus('공지사항은 준비 중입니다.'),
    });
    this.addCinematicHotspot({
      x: 890,
      y: 36,
      width: 50,
      height: 50,
      radius: 25,
      tint: 0xffffff,
      onClick: () => this.setUtilityStatus('고객센터는 준비 중입니다.'),
    });
    this.addCinematicHotspot({
      x: 940,
      y: 36,
      width: 50,
      height: 50,
      radius: 25,
      tint: 0xffffff,
      onClick: () => this.setUtilityStatus('설정 메뉴는 다음 패치에서 연결합니다.'),
    });
  }

  private addCinematicHotspot(options: {
    x: number;
    y: number;
    width: number;
    height: number;
    radius: number;
    tint: number;
    onClick: () => void;
  }): void {
    const c = this.add.container(options.x, options.y).setDepth(60);
    const hover = this.add.graphics();
    hover.fillStyle(options.tint, 0.12);
    hover.fillRoundedRect(-options.width / 2, -options.height / 2, options.width, options.height, options.radius);
    hover.lineStyle(2, 0xffffff, 0.38);
    hover.strokeRoundedRect(-options.width / 2 + 1, -options.height / 2 + 1, options.width - 2, options.height - 2, Math.max(4, options.radius - 1));
    hover.setAlpha(0);

    const sheen = this.add.graphics();
    sheen.fillStyle(0xffffff, 0.20);
    sheen.fillRoundedRect(-options.width / 2 + 10, -options.height / 2 + 5, options.width - 20, Math.max(6, options.height * 0.26), Math.max(3, options.radius - 5));
    sheen.setAlpha(0);

    const hit = this.add.zone(0, 0, options.width, options.height).setInteractive({ useHandCursor: true });
    c.add([hover, sheen, hit]);

    hit.on('pointerover', () => {
      this.tweens.add({ targets: hover, alpha: 1, duration: 120, ease: 'Sine.easeOut' });
      this.tweens.add({ targets: sheen, alpha: 1, duration: 120, ease: 'Sine.easeOut' });
    });

    hit.on('pointerout', () => {
      this.tweens.add({ targets: hover, alpha: 0, duration: 120, ease: 'Sine.easeOut' });
      this.tweens.add({ targets: sheen, alpha: 0, duration: 120, ease: 'Sine.easeOut' });
      this.tweens.add({ targets: c, scaleX: 1, scaleY: 1, duration: 80, ease: 'Sine.easeOut' });
    });

    hit.on('pointerdown', () => {
      if (this.isTransitioning) return;
      this.tweens.add({ targets: c, scaleX: 0.985, scaleY: 0.985, duration: 52, yoyo: true, ease: 'Quad.easeOut' });
      options.onClick();
    });
  }

  private setUtilityStatus(message: string): void {
    playSfx(this, 'sfx_click');
    if (this.statusText) {
      this.statusText.setText(message);
    }
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
      this.statusText.setText(`${this.currentSave.nickname} 로그인됨. 빠른 시작으로 이어서 플레이하세요!`);
    } catch (error) {
      console.error(error);
      this.statusText.setText('로그인 확인 실패. 설정/도메인 확인');
    }
  }

  private async startQuick(): Promise<void> {
    if (this.currentUser && this.currentSave) {
      playSfx(this, 'sfx_click');
      this.enterMainMenu(this.currentUser, this.currentSave);
      return;
    }

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
    if (this.isTransitioning) return;
    this.isTransitioning = true;
    this.cameras.main.fadeOut(220, 255, 255, 255);
    this.time.delayedCall(220, () => this.scene.start('MainMenuScene', { user, save }));
  }
}
