import Phaser from 'phaser';
import type { User } from 'firebase/auth';
import { playSfx } from '../game/AudioManager';
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

type LoginButtonTexture = 'ui-button-primary' | 'ui-button-blue' | 'ui-button-gold' | 'ui-button-red';

type LoginButtonOptions = {
  x: number;
  y: number;
  width: number;
  height: number;
  texture: LoginButtonTexture;
  icon: string;
  label: string;
  subLabel?: string;
  onClick: () => void;
};

export class MenuScene extends Phaser.Scene {
  private statusText!: Phaser.GameObjects.Text;
  private currentUser: User | null = null;
  private currentSave: PlayerSave | null = null;
  private loginPanel!: Phaser.GameObjects.Container;

  constructor() {
    super('MenuScene');
  }

  create(): void {
    this.createBackground();
    this.createTitleArea();
    this.createLoginPanel();
    this.createFooterHints();
    void this.bootstrapRedirectOrExistingUser();
  }

  private createBackground(): void {
    this.add.image(480, 270, 'ui-title-bg').setDisplaySize(960, 540).setDepth(0);
    this.add.rectangle(480, 270, 960, 540, 0x000000, 0.16).setDepth(1);

    for (let i = 0; i < 22; i++) {
      const particle = this.add.sprite(
        Phaser.Math.Between(35, 925),
        Phaser.Math.Between(58, 480),
        'ui-particles',
        Phaser.Math.Between(0, 3)
      ).setDepth(3).setAlpha(Phaser.Math.FloatBetween(0.18, 0.42)).setScale(Phaser.Math.FloatBetween(0.45, 0.9));

      particle.play('ui-particle-glow');
      this.tweens.add({
        targets: particle,
        x: particle.x + Phaser.Math.Between(-18, 18),
        y: particle.y + Phaser.Math.Between(-16, 16),
        alpha: Phaser.Math.FloatBetween(0.08, 0.55),
        duration: Phaser.Math.Between(1600, 3100),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }

    const leftTorch = this.add.sprite(376, 486, 'ui-particles', 1).setDepth(4).setScale(1.3).setAlpha(0.8);
    const rightTorch = this.add.sprite(638, 498, 'ui-particles', 1).setDepth(4).setScale(1.3).setAlpha(0.8);
    leftTorch.play('ui-particle-glow');
    rightTorch.play('ui-particle-glow');
  }

  private createTitleArea(): void {
    const glow = this.add.ellipse(480, 83, 580, 120, 0xf7d36b, 0.1).setDepth(5);
    this.tweens.add({ targets: glow, alpha: 0.18, scaleX: 1.04, duration: 1400, yoyo: true, repeat: -1 });

    this.add.image(480, 84, 'ui-title-logo').setDisplaySize(560, 136).setDepth(6);
    this.add.text(480, 150, '시네마틱 왕국 방어 작전', {
      fontSize: '18px',
      color: '#fff1c2',
      fontStyle: 'bold',
      stroke: '#2a160e',
      strokeThickness: 4
    }).setOrigin(0.5).setDepth(7);

    this.add.text(18, 18, 'v3.7 PREMIUM ART PASS', {
      fontSize: '13px',
      color: '#dbe7ff',
      backgroundColor: '#00000075',
      padding: { x: 8, y: 4 }
    }).setDepth(10);
  }

  private createLoginPanel(): void {
    this.loginPanel = this.add.container(480, 328).setDepth(12);
    const panel = this.add.image(0, 0, 'ui-login-panel').setDisplaySize(450, 360);
    this.loginPanel.add(panel);

    const shield = this.add.image(-178, -132, 'ui-icon-shield').setDisplaySize(46, 46);
    const spark = this.add.image(178, -132, 'ui-icon-spark').setDisplaySize(46, 46);
    this.loginPanel.add([shield, spark]);

    const title = this.add.text(0, -128, '왕국 방위 사령부', {
      fontSize: '26px',
      color: '#2e1b11',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const desc = this.add.text(0, -94, '전장을 수복할 지휘관으로 입장하세요', {
      fontSize: '15px',
      color: '#5a371f',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.loginPanel.add([title, desc]);

    this.statusText = this.add.text(0, -61, '로그인 상태 확인 중...', {
      fontSize: '14px',
      color: '#f9eec9',
      align: 'center',
      fixedWidth: 360,
      backgroundColor: '#2b1a10cc',
      padding: { x: 8, y: 5 }
    }).setOrigin(0.5);
    this.loginPanel.add(this.statusText);

    this.makeArtButton({
      x: 0,
      y: -12,
      width: 330,
      height: 62,
      texture: 'ui-button-primary',
      icon: 'ui-icon-anonymous',
      label: '빠른 시작',
      subLabel: '익명 지휘관으로 월드맵 입장',
      onClick: () => void this.startAnonymous()
    });

    this.makeArtButton({
      x: 0,
      y: 58,
      width: 330,
      height: 62,
      texture: 'ui-button-blue',
      icon: 'ui-icon-google',
      label: 'Google 로그인',
      subLabel: '계정 연동 후 저장 데이터 유지',
      onClick: () => void this.startGoogle()
    });

    this.makeArtButton({
      x: -86,
      y: 132,
      width: 158,
      height: 54,
      texture: 'ui-button-gold',
      icon: 'ui-icon-email',
      label: '이메일 로그인',
      onClick: () => void this.startEmailLogin()
    });

    this.makeArtButton({
      x: 86,
      y: 132,
      width: 158,
      height: 54,
      texture: 'ui-button-red',
      icon: 'ui-icon-register',
      label: '회원가입',
      onClick: () => void this.startEmailRegister()
    });

    this.tweens.add({ targets: this.loginPanel, y: 324, duration: 1600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  }

  private createFooterHints(): void {
    this.add.image(480, 506, 'ui-status-plaque').setDisplaySize(560, 72).setDepth(8).setAlpha(0.92);
    this.add.text(480, 500, '영웅 전당 · 유물 제작소 · 타워 진화 · 일일 원정 · 보스 토벌', {
      fontSize: '15px',
      color: '#fff1c2',
      align: 'center',
      fixedWidth: 520
    }).setOrigin(0.5).setDepth(9);
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
      this.statusText.setText(`${this.currentSave.nickname} 로그인됨. 빠른 시작으로 이어서 플레이하세요.`);
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

  private makeArtButton(options: LoginButtonOptions): void {
    const wrapper = this.add.container(options.x, options.y);
    const hit = this.add.image(0, 0, options.texture).setDisplaySize(options.width, options.height);
    hit.setInteractive({ useHandCursor: true });

    const iconSize = options.height > 58 ? 44 : 34;
    const iconX = -options.width / 2 + iconSize / 2 + 18;
    const icon = this.add.image(iconX, -1, options.icon).setDisplaySize(iconSize, iconSize);

    const labelX = options.width > 200 ? -32 : 14;
    const label = this.add.text(labelX, options.subLabel ? -9 : 0, options.label, {
      fontSize: options.width > 200 ? '21px' : '15px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#2b180d',
      strokeThickness: 3
    }).setOrigin(0.5);

    wrapper.add([hit, icon, label]);

    if (options.subLabel) {
      const sub = this.add.text(labelX, 15, options.subLabel, {
        fontSize: '12px',
        color: '#fff1c2',
        stroke: '#2b180d',
        strokeThickness: 2
      }).setOrigin(0.5);
      wrapper.add(sub);
    }

    hit.on('pointerdown', () => {
      this.tweens.add({ targets: wrapper, scaleX: 0.96, scaleY: 0.96, duration: 70, yoyo: true });
      options.onClick();
    });
    hit.on('pointerover', () => {
      this.tweens.add({ targets: wrapper, scaleX: 1.035, scaleY: 1.035, duration: 120 });
      hit.setTint(0xfff0b3);
    });
    hit.on('pointerout', () => {
      this.tweens.add({ targets: wrapper, scaleX: 1, scaleY: 1, duration: 120 });
      hit.clearTint();
    });

    this.loginPanel.add(wrapper);
  }
}
