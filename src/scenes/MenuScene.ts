import Phaser from 'phaser';
import type { User } from 'firebase/auth';
import { playSfx } from '../game/AudioManager';
import { addPremiumButton, addSoftBackdrop } from '../game/PremiumSkinV44';
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
    this.createCompactTitle();
    this.createCompactCommandPanel();
    this.createCompactStatusBar();
    this.time.delayedCall(0, () => {
      window.dispatchEvent(new CustomEvent('kingdom-seed:scene-ready', { detail: { scene: 'MenuScene', at: Date.now() } }));
    });
    void this.bootstrapRedirectOrExistingUser();
  }

  private createPremiumBackground(): void {
    if (this.textures.exists('ui-title-bg')) {
      this.add.image(480, 270, 'ui-title-bg').setDisplaySize(960, 540).setDepth(0);
    } else {
      this.add.rectangle(480, 270, 960, 540, 0x7fbfff, 1).setDepth(0);
      this.add.text(480, 270, 'KINGDOM SEED', { fontSize: '42px', color: '#ffffff', fontStyle: 'bold', stroke: '#1b4b96', strokeThickness: 6 }).setOrigin(0.5).setDepth(1);
    }
    addSoftBackdrop(this, 1);
    this.add.rectangle(480, 270, 960, 540, 0xffffff, 0.035).setDepth(2);
    this.add.rectangle(480, 508, 960, 64, 0x071a38, 0.34).setDepth(3);

    const glow = this.add.ellipse(480, 112, 490, 126, 0x8cc4ff, 0.13).setDepth(4);
    this.tweens.add({ targets: glow, alpha: 0.22, scaleX: 1.04, scaleY: 1.08, duration: 1800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    for (let i = 0; i < 18; i += 1) {
      if (!this.textures.exists('ui-particles')) break;
      const p = this.add.sprite(
        Phaser.Math.Between(82, 878),
        Phaser.Math.Between(54, 500),
        'ui-particles',
        Phaser.Math.Between(0, 3)
      ).setDepth(5).setAlpha(Phaser.Math.FloatBetween(0.08, 0.22)).setScale(Phaser.Math.FloatBetween(0.24, 0.56));
      p.play('ui-particle-glow');
      this.tweens.add({
        targets: p,
        x: p.x + Phaser.Math.Between(-18, 18),
        y: p.y - Phaser.Math.Between(8, 26),
        alpha: Phaser.Math.FloatBetween(0.04, 0.18),
        duration: Phaser.Math.Between(2300, 4700),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
  }

  private createTopUtilityHints(): void {
    const topChip = this.textures.exists('ui-top-chip-compact-v48') ? 'ui-top-chip-compact-v48' : 'ui-button-blue';
    const items = [
      { x: 756, icon: '📢', label: '공지' },
      { x: 836, icon: '🎧', label: '문의' },
      { x: 916, icon: '⚙', label: '설정' },
    ];

    items.forEach((item) => {
      const c = this.add.container(item.x, 31).setDepth(25);
      c.add(this.add.image(0, 0, topChip).setDisplaySize(72, 30).setAlpha(0.92));
      c.add(this.add.text(-18, -1, item.icon, { fontSize: '14px' }).setOrigin(0.5));
      c.add(this.add.text(12, -1, item.label, {
        fontSize: '10px',
        color: '#ffffff',
        fontStyle: 'bold',
        stroke: '#153066',
        strokeThickness: 2
      }).setOrigin(0.5));
    });

    this.add.text(18, 17, 'v4.8 COMPACT PREMIUM', {
      fontSize: '10px',
      color: '#eef6ff',
      fontStyle: 'bold',
      backgroundColor: '#09245188',
      padding: { x: 7, y: 3 }
    }).setDepth(26);
  }

  private createCompactTitle(): void {
    if (this.textures.exists('ui-title-ornaments-v48')) {
      this.add.image(480, 102, 'ui-title-ornaments-v48').setDisplaySize(360, 160).setDepth(17).setAlpha(0.78);
    }

    const logoKey = this.textures.exists('ui-title-logo-compact-v48') ? 'ui-title-logo-compact-v48' : 'ui-title-logo';
    const logo = this.add.image(480, 96, logoKey).setDisplaySize(390, 132).setDepth(22);
    this.tweens.add({ targets: logo, y: 92, duration: 1750, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    this.add.text(480, 165, '작지만 또렷하게 정리한 프리미엄 로그인', {
      fontSize: '14px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#144081',
      strokeThickness: 3,
      shadow: { offsetX: 0, offsetY: 2, color: '#000000', blur: 4, fill: true },
    }).setOrigin(0.5).setDepth(23);

    if (this.textures.exists('fx-compact-shimmer-v48')) {
      for (let i = 0; i < 4; i += 1) {
        const s = this.add.sprite(346 + i * 88, 76 + (i % 2) * 34, 'fx-compact-shimmer-v48').setDepth(24).setScale(0.7).setAlpha(0.72);
        s.play({ key: 'fx-compact-shimmer-v48-anim', repeat: -1, frameRate: 8, startFrame: i % 8 });
      }
    }
  }

  private createCompactCommandPanel(): void {
    this.loginPanel = this.add.container(480, 330).setDepth(40);

    const panelKey = this.textures.exists('ui-login-panel-compact-v48') ? 'ui-login-panel-compact-v48' : 'ui-login-panel';
    const primaryKey = this.textures.exists('ui-button-compact-gold-v48') ? 'ui-button-compact-gold-v48' : 'ui-button-primary';
    const blueKey = this.textures.exists('ui-button-compact-blue-v48') ? 'ui-button-compact-blue-v48' : 'ui-button-blue';
    const whiteKey = this.textures.exists('ui-button-compact-white-v48') ? 'ui-button-compact-white-v48' : 'ui-button-gold';
    const redKey = this.textures.exists('ui-button-compact-red-v48') ? 'ui-button-compact-red-v48' : 'ui-button-red';

    this.loginPanel.add(this.add.image(0, 0, panelKey).setDisplaySize(382, 276));

    this.statusText = this.add.text(0, -83, '로그인 상태 확인 중...', {
      fontSize: '12px',
      color: '#3a5d96',
      align: 'center',
      fixedWidth: 294,
      backgroundColor: '#f2f8ffee',
      padding: { x: 8, y: 4 }
    }).setOrigin(0.5);
    this.loginPanel.add(this.statusText);

    this.loginPanel.add(addPremiumButton(this, {
      x: 0,
      y: -29,
      width: 292,
      height: 50,
      texture: primaryKey,
      icon: 'ui-icon-anonymous',
      label: '바로 시작',
      onClick: () => void this.startAnonymous()
    }));

    this.loginPanel.add(addPremiumButton(this, {
      x: 0,
      y: 29,
      width: 292,
      height: 50,
      texture: blueKey,
      icon: 'ui-icon-google',
      label: 'Google 연동',
      onClick: () => void this.startGoogle()
    }));

    this.loginPanel.add(addPremiumButton(this, {
      x: -74,
      y: 92,
      width: 136,
      height: 44,
      texture: whiteKey,
      icon: 'ui-icon-email',
      label: '이메일',
      onClick: () => void this.startEmailLogin()
    }));

    this.loginPanel.add(addPremiumButton(this, {
      x: 74,
      y: 92,
      width: 136,
      height: 44,
      texture: redKey,
      icon: 'ui-icon-register',
      label: '가입',
      onClick: () => void this.startEmailRegister()
    }));

    this.loginPanel.add(this.add.text(0, 128, '계정 없이도 진행 가능 · 연동 시 저장 유지', {
      fontSize: '11px',
      color: '#5d789e',
      fontStyle: 'bold'
    }).setOrigin(0.5));

    this.loginPanel.setAlpha(0).setScale(0.96).setY(342);
    this.tweens.add({ targets: this.loginPanel, alpha: 1, y: 330, scaleX: 1, scaleY: 1, duration: 330, ease: 'Back.easeOut' });
  }

  private createCompactStatusBar(): void {
    const stripKey = this.textures.exists('ui-footer-strip-compact-v48') ? 'ui-footer-strip-compact-v48' : 'ui-status-plaque';
    this.add.image(480, 505, stripKey).setDisplaySize(420, 48).setDepth(18).setAlpha(0.96);
    this.add.text(480, 504, '영웅 · 유물 · 타워 진화 · 원정 · 보스 토벌', {
      fontSize: '12px',
      color: '#ffffff',
      align: 'center',
      fontStyle: 'bold',
      fixedWidth: 390,
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
      this.statusText.setText(`${this.currentSave.nickname} · 이어서 가능`);
    } catch (error) {
      console.error(error);
      this.statusText.setText('로그인 확인 실패. 설정/도메인을 확인하세요.');
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
        this.statusText.setText('Google 이동 중... 돌아오면 이어집니다.');
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
      this.statusText.setText('왕국 기록 연결 중...');
      await task();
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : '알 수 없는 오류';
      this.statusText.setText(`실패: ${message}`);
    }
  }

  private enterWorldMap(user: User, save: PlayerSave): void {
    this.cameras.main.fadeOut(240, 255, 255, 255);
    this.time.delayedCall(240, () => this.scene.start('WorldMapScene', { user, save }));
  }
}
