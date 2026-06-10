import Phaser from 'phaser';
import type { User } from 'firebase/auth';
import { playSfx } from '../game/AudioManager';
import { addPremiumButton, addPremiumTitle, addSoftBackdrop } from '../game/PremiumSkinV44';
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
    this.createPremiumBackground();
    this.createTopUtilityHints();
    this.createHeroTitle();
    this.createCommandPanel();
    this.createStatusBar();
    void this.bootstrapRedirectOrExistingUser();
  }

  private createPremiumBackground(): void {
    this.add.image(480, 270, 'ui-title-bg').setDisplaySize(960, 540).setDepth(0);
    addSoftBackdrop(this, 1);

    const sun = this.add.ellipse(616, 89, 260, 124, 0xffffff, 0.16).setDepth(2);
    this.tweens.add({ targets: sun, alpha: 0.25, scaleX: 1.08, scaleY: 1.08, duration: 1800, yoyo: true, repeat: -1 });

    for (let i = 0; i < 28; i++) {
      if (!this.textures.exists('ui-particles')) break;
      const p = this.add.sprite(
        Phaser.Math.Between(70, 890),
        Phaser.Math.Between(52, 500),
        'ui-particles',
        Phaser.Math.Between(0, 3)
      ).setDepth(3).setAlpha(Phaser.Math.FloatBetween(0.1, 0.32)).setScale(Phaser.Math.FloatBetween(0.32, 0.75));

      p.play('ui-particle-glow');
      this.tweens.add({
        targets: p,
        x: p.x + Phaser.Math.Between(-26, 26),
        y: p.y - Phaser.Math.Between(10, 34),
        alpha: Phaser.Math.FloatBetween(0.04, 0.24),
        duration: Phaser.Math.Between(2000, 4600),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }

    this.add.rectangle(480, 526, 960, 42, 0x0a1e3f, 0.42).setDepth(4);
  }

  private createTopUtilityHints(): void {
    const items = [
      { x: 792, icon: '📢', label: '공지사항' },
      { x: 852, icon: '🎧', label: '고객센터' },
      { x: 912, icon: '⚙', label: '설정' },
    ];

    items.forEach((item) => {
      const c = this.add.container(item.x, 44).setDepth(15);
      const circle = this.add.ellipse(0, 0, 44, 44, 0x315fae, 0.76).setStrokeStyle(2, 0xffdf81, 0.95);
      const icon = this.add.text(0, -2, item.icon, { fontSize: '21px' }).setOrigin(0.5);
      const label = this.add.text(0, 33, item.label, {
        fontSize: '10px',
        color: '#ffffff',
        fontStyle: 'bold',
        stroke: '#153066',
        strokeThickness: 3
      }).setOrigin(0.5);
      c.add([circle, icon, label]);
    });

    this.add.text(18, 20, 'v4.4 PREMIUM UI INTEGRATION', {
      fontSize: '12px',
      color: '#eef6ff',
      fontStyle: 'bold',
      backgroundColor: '#09245199',
      padding: { x: 8, y: 4 }
    }).setDepth(16);
  }

  private createHeroTitle(): void {
    addPremiumTitle(this, 480, 112);
    this.add.text(480, 184, '시네마틱 왕국 방어 전략', {
      fontSize: '19px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#144081',
      strokeThickness: 4,
      shadow: { offsetX: 0, offsetY: 3, color: '#000000', blur: 5, fill: true },
    }).setOrigin(0.5).setDepth(22);
  }

  private createCommandPanel(): void {
    this.loginPanel = this.add.container(480, 332).setDepth(30);

    const panel = this.add.image(0, 0, 'ui-login-panel').setDisplaySize(458, 344);
    this.loginPanel.add(panel);

    const header = this.add.text(0, -128, 'DEFENSE COMMAND', {
      fontSize: '25px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#204a94',
      strokeThickness: 5
    }).setOrigin(0.5);
    this.loginPanel.add(header);

    const subtitle = this.add.text(0, -95, '전장을 수호할 지휘관으로 입장하세요!', {
      fontSize: '14px',
      color: '#65789c',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.loginPanel.add(subtitle);

    this.statusText = this.add.text(0, -64, '로그인 상태 확인 중...', {
      fontSize: '13px',
      color: '#3a5d96',
      align: 'center',
      fixedWidth: 360,
      backgroundColor: '#f2f8ffff',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5);
    this.loginPanel.add(this.statusText);

    this.loginPanel.add(addPremiumButton(this, {
      x: 0,
      y: -12,
      width: 340,
      height: 66,
      texture: 'ui-button-primary',
      icon: 'ui-icon-anonymous',
      label: '빠른 시작',
      subLabel: '게스트 지휘관으로 즉시 전장 진입',
      onClick: () => void this.startAnonymous()
    }));

    this.loginPanel.add(addPremiumButton(this, {
      x: 0,
      y: 62,
      width: 340,
      height: 62,
      texture: 'ui-button-blue',
      icon: 'ui-icon-google',
      label: 'Google 로그인',
      subLabel: '계정 연동 후 세이브 유지',
      onClick: () => void this.startGoogle()
    }));

    this.loginPanel.add(addPremiumButton(this, {
      x: -88,
      y: 135,
      width: 160,
      height: 54,
      texture: 'ui-button-gold',
      icon: 'ui-icon-email',
      label: '이메일',
      onClick: () => void this.startEmailLogin()
    }));

    this.loginPanel.add(addPremiumButton(this, {
      x: 88,
      y: 135,
      width: 160,
      height: 54,
      texture: 'ui-button-red',
      icon: 'ui-icon-register',
      label: '회원가입',
      onClick: () => void this.startEmailRegister()
    }));

    this.loginPanel.setAlpha(0).setScale(0.96).setY(346);
    this.tweens.add({ targets: this.loginPanel, alpha: 1, y: 332, scaleX: 1, scaleY: 1, duration: 420, ease: 'Back.easeOut' });
  }

  private createStatusBar(): void {
    this.add.image(480, 506, 'ui-status-plaque').setDisplaySize(560, 70).setDepth(18).setAlpha(0.94);
    this.add.text(480, 504, '영웅 전당 · 유물 제작소 · 타워 진화 · 일일 원정 · 보스 토벌', {
      fontSize: '15px',
      color: '#ffffff',
      align: 'center',
      fontStyle: 'bold',
      fixedWidth: 520,
      stroke: '#183c80',
      strokeThickness: 3
    }).setOrigin(0.5).setDepth(19);
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
      this.statusText.setText('Firebase 로그인 확인 실패. 설정/도메인을 확인하세요.');
    }
  }

  private async startAnonymous(): Promise<void> {
    await this.withLoading(async () => {
      const user = await ensureAnonymousUser();
      const save = await loadOrCreateSave(user);
      this.enterWorldMap(user, save);
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
      this.enterWorldMap(user, save);
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
      this.enterWorldMap(user, save);
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
      this.enterWorldMap(user, save);
    });
  }

  private async withLoading(task: () => Promise<void>): Promise<void> {
    try {
      playSfx(this, 'sfx_click');
      this.statusText.setText('왕국 기록 보관소와 연결 중...');
      await task();
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : '알 수 없는 오류';
      this.statusText.setText(`실패: ${message}`);
    }
  }

  private enterWorldMap(user: User, save: PlayerSave): void {
    this.cameras.main.fadeOut(260, 0, 0, 0);
    this.time.delayedCall(260, () => this.scene.start('WorldMapScene', { user, save }));
  }
}
