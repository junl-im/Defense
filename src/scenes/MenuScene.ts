import Phaser from 'phaser';
import type { User } from 'firebase/auth';
import { playSfx } from '../game/AudioManager';
import { addCoverImage } from '../game/CodeUiKit';
import { addHitZoneDebug } from '../game/HitZoneDebug';
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
      window.dispatchEvent(new CustomEvent('kingdom-seed:scene-ready', { detail: { scene: 'MenuScene', version: '2.0', at: Date.now() } }));
    });

    void this.bootstrapRedirectOrExistingUser();
  }

  private createCinematicSplash(): void {
    const bgKey = this.textures.exists('v1-login-clean-bg') ? 'v1-login-clean-bg' : 'v1-login-polished';
    addCoverImage(this, bgKey, 960, 540, 0);

    const topFade = this.add.graphics().setDepth(2);
    topFade.fillGradientStyle(0x000000, 0x000000, 0x000000, 0x000000, 0.24, 0.24, 0, 0);
    topFade.fillRect(0, 0, 960, 126);

    const logoKey = this.textures.exists('v1-title-logo-clean') ? 'v1-title-logo-clean' : 'ui-title-logo';
    this.add.image(480, 116, logoKey).setDisplaySize(390, 141).setDepth(10);

    if (this.textures.exists('v1-login-panel-v18')) {
      this.add.image(480, 355, 'v1-login-panel-v18').setDisplaySize(430, 300).setDepth(20);
    } else {
      const fallback = this.add.graphics().setDepth(20);
      fallback.fillStyle(0xf6fbff, 0.92).fillRoundedRect(265, 232, 430, 300, 28);
      fallback.lineStyle(4, 0xf1c46a, 0.9).strokeRoundedRect(265, 232, 430, 300, 28);
    }

    this.add.text(480, 257, 'DEFENSE COMMAND', {
      fontSize: '21px',
      color: '#f8fbff',
      align: 'center',
      fixedWidth: 320,
      fontFamily: 'Pretendard, Noto Sans KR, NanumGothic, Malgun Gothic, Arial, sans-serif',
      fontStyle: 'bold',
      stroke: '#17366c',
      strokeThickness: 4,
      shadow: { offsetX: 0, offsetY: 3, color: '#0a2d6a', blur: 4, fill: true },
    }).setOrigin(0.5).setDepth(31);

    this.add.text(480, 282, '전장을 수호할 지휘관으로 입장하세요!', {
      fontSize: '12px',
      color: '#8298b8',
      align: 'center',
      fixedWidth: 320,
      fontFamily: 'Pretendard, Noto Sans KR, NanumGothic, Malgun Gothic, Arial, sans-serif',
      fontStyle: 'bold',
      stroke: '#ffffff',
      strokeThickness: 2,
    }).setOrigin(0.5).setDepth(31);

    const bottomGlow = this.add.ellipse(480, 526, 520, 42, 0x8cdcff, 0.08)
      .setDepth(3)
      .setBlendMode(Phaser.BlendModes.ADD);
    this.tweens.add({ targets: bottomGlow, alpha: 0.14, scaleX: 1.025, duration: 1800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  }

  private createStatusOverlay(): void {
    const statusBack = this.add.graphics().setDepth(52);
    statusBack.fillStyle(0xf7fbff, 0.90);
    statusBack.fillRoundedRect(336, 300, 288, 25, 12);
    statusBack.lineStyle(1, 0xb9d4ef, 0.82);
    statusBack.strokeRoundedRect(336, 300, 288, 25, 12);
    statusBack.lineStyle(1, 0xffffff, 0.58);
    statusBack.strokeRoundedRect(343, 306, 274, 10, 5);

    this.statusText = this.add.text(480, 312, '로그인 확인 중...', {
      fontSize: '11px',
      color: '#2f5f9e',
      align: 'center',
      fixedWidth: 272,
      fontFamily: 'Pretendard, Noto Sans KR, NanumGothic, Malgun Gothic, Arial, sans-serif',
      fontStyle: 'bold',
      stroke: '#ffffff',
      strokeThickness: 2,
    }).setOrigin(0.5).setDepth(53);

    const chip = this.add.graphics().setDepth(53);
    chip.fillStyle(0x071c3e, 0.46).fillRoundedRect(16, 14, 166, 28, 14);
    chip.lineStyle(1, 0xffdc82, 0.45).strokeRoundedRect(16, 14, 166, 28, 14);
    this.add.text(99, 28, 'v2.1.0 CLEAN BATTLE QA', {
      fontSize: '10px',
      color: '#f7fbff',
      fontFamily: 'Pretendard, Noto Sans KR, Arial, sans-serif',
      fontStyle: 'bold',
      shadow: { offsetX: 0, offsetY: 2, color: '#08315f', blur: 3, fill: true },
    }).setOrigin(0.5).setDepth(54).setAlpha(0.92);
  }

  private createLoginHitZones(): void {
    // v1.8: positions match the separated image buttons exactly.
    this.addLoginButton({
      x: 480,
      y: 360,
      width: 304,
      height: 52,
      imageKey: 'v1-login-button-gold-v18',
      label: '빠른 시작',
      icon: '⚔',
      color: '#174080',
      onClick: () => void this.startQuick(),
    });

    this.addLoginButton({
      x: 480,
      y: 416,
      width: 304,
      height: 52,
      imageKey: 'v1-login-button-white-v18',
      label: 'Google 로그인',
      icon: 'G',
      color: '#315f9c',
      onClick: () => void this.startGoogle(),
    });

    this.addLoginButton({
      x: 402,
      y: 470,
      width: 152,
      height: 42,
      imageKey: 'v1-login-button-small-v18',
      label: '이메일 로그인',
      icon: '✉',
      color: '#315f9c',
      small: true,
      onClick: () => void this.startEmailLogin(),
    });

    this.addLoginButton({
      x: 558,
      y: 470,
      width: 152,
      height: 42,
      imageKey: 'v1-login-button-small-v18',
      label: '회원가입',
      icon: '♥',
      color: '#315f9c',
      small: true,
      onClick: () => void this.startEmailRegister(),
    });
  }

  private createUtilityHitZones(): void {
    const utilities = [
      { x: 820, label: '공지사항', icon: '📣', message: '공지사항은 준비 중입니다.' },
      { x: 878, label: '고객센터', icon: '🎧', message: '고객센터는 준비 중입니다.' },
      { x: 930, label: '설정', icon: '⚙', message: '설정 메뉴는 다음 패치에서 연결합니다.' },
    ];
    utilities.forEach((item) => this.addUtilityButton(item.x, 42, item.icon, item.label, () => this.setUtilityStatus(item.message)));
  }

  private addLoginButton(options: {
    x: number;
    y: number;
    width: number;
    height: number;
    imageKey: string;
    label: string;
    icon: string;
    color: string;
    small?: boolean;
    onClick: () => void;
  }): void {
    const c = this.add.container(options.x, options.y).setDepth(60);
    const image = this.textures.exists(options.imageKey)
      ? this.add.image(0, 0, options.imageKey).setDisplaySize(options.width, options.height)
      : this.add.rectangle(0, 0, options.width, options.height, 0xffffff, 0.88).setStrokeStyle(2, 0xdcae62, 0.9);
    const iconBubble = this.add.circle(-options.width / 2 + (options.small ? 24 : 32), 0, options.small ? 15 : 18, 0xffffff, 0.68)
      .setStrokeStyle(1, 0xd2aa66, 0.70);
    const icon = this.add.text(iconBubble.x, 0, options.icon, {
      fontSize: options.small ? '14px' : '18px',
      color: options.icon === '♥' ? '#dd506a' : '#2f6cb3',
      fontFamily: 'Pretendard, Noto Sans KR, Arial, sans-serif',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    const label = this.add.text(options.small ? 10 : 8, 0, options.label, {
      fontSize: options.small ? '14px' : '19px',
      color: options.color,
      align: 'center',
      fontFamily: 'Pretendard, Noto Sans KR, NanumGothic, Malgun Gothic, Arial, sans-serif',
      fontStyle: 'bold',
      stroke: '#ffffff',
      strokeThickness: 2,
      fixedWidth: options.small ? 112 : 210,
    }).setOrigin(0.5);
    const hover = this.add.graphics();
    hover.fillStyle(0xffffff, 0.18).fillRoundedRect(-options.width / 2 + 8, -options.height / 2 + 6, options.width - 16, Math.max(8, options.height * 0.24), options.height * 0.18);
    hover.setAlpha(0);
    const hit = this.add.zone(0, 0, options.width, options.height).setInteractive({ useHandCursor: true });
    c.add([image, iconBubble, icon, label, hover, hit]);
    addHitZoneDebug(this, c, options.width, options.height, options.label, options.small ? 0x7cc7ff : 0xffd56c, Math.min(18, options.height / 2));
    this.wireButtonHit(c, hover, hit, options.onClick);
  }

  private addUtilityButton(x: number, y: number, iconText: string, labelText: string, onClick: () => void): void {
    const c = this.add.container(x, y).setDepth(60);
    const image = this.textures.exists('v1-login-utility-button-v18')
      ? this.add.image(0, 0, 'v1-login-utility-button-v18').setDisplaySize(50, 50)
      : this.add.circle(0, 0, 24, 0x1e5bb6, 0.9).setStrokeStyle(2, 0xffdc82, 0.8);
    const icon = this.add.text(0, -2, iconText, {
      fontSize: '21px',
      color: '#ffffff',
      fontFamily: 'Pretendard, Noto Sans KR, Arial, sans-serif',
      fontStyle: 'bold',
      stroke: '#17366c',
      strokeThickness: 2,
    }).setOrigin(0.5);
    const label = this.add.text(0, 33, labelText, {
      fontSize: '11px',
      color: '#f8fbff',
      fontFamily: 'Pretendard, Noto Sans KR, Arial, sans-serif',
      fontStyle: 'bold',
      stroke: '#17366c',
      strokeThickness: 3,
    }).setOrigin(0.5);
    const hover = this.add.circle(0, 0, 26, 0xffffff, 0.16).setAlpha(0).setBlendMode(Phaser.BlendModes.ADD);
    const hit = this.add.zone(0, 0, 54, 62).setInteractive({ useHandCursor: true });
    c.add([image, hover, icon, label, hit]);
    addHitZoneDebug(this, c, 54, 62, labelText, 0x7cc7ff, 18);
    this.wireButtonHit(c, hover, hit, onClick);
  }

  private wireButtonHit(
    container: Phaser.GameObjects.Container,
    hover: Phaser.GameObjects.GameObject & { alpha: number },
    hit: Phaser.GameObjects.Zone,
    onClick: () => void
  ): void {
    hit.on('pointerover', () => {
      this.tweens.add({ targets: hover, alpha: 1, duration: 120, ease: 'Sine.easeOut' });
      this.tweens.add({ targets: container, scaleX: 1.018, scaleY: 1.018, duration: 120, ease: 'Sine.easeOut' });
    });
    hit.on('pointerout', () => {
      this.tweens.add({ targets: hover, alpha: 0, duration: 120, ease: 'Sine.easeOut' });
      this.tweens.add({ targets: container, scaleX: 1, scaleY: 1, duration: 90, ease: 'Sine.easeOut' });
    });
    hit.on('pointerdown', () => {
      if (this.isTransitioning) return;
      this.tweens.add({ targets: container, scaleX: 0.982, scaleY: 0.982, duration: 52, yoyo: true, ease: 'Quad.easeOut' });
      onClick();
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
