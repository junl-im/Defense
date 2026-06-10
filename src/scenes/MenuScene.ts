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
    this.createBoutiqueTitle();
    this.createBoutiqueCommandPanel();
    this.createBoutiqueStatusBar();
    this.time.delayedCall(0, () => {
      window.dispatchEvent(new CustomEvent('kingdom-seed:scene-ready', { detail: { scene: 'MenuScene', at: Date.now() } }));
    });
    void this.bootstrapRedirectOrExistingUser();
  }

  private textureKey(primary: string, fallback: string): string {
    return this.textures.exists(primary) ? primary : fallback;
  }

  private createPremiumBackground(): void {
    if (this.textures.exists('ui-title-bg')) {
      this.add.image(480, 270, 'ui-title-bg').setDisplaySize(960, 540).setDepth(0);
    } else {
      this.add.rectangle(480, 270, 960, 540, 0x7fbfff, 1).setDepth(0);
      this.add.text(480, 270, 'KINGDOM SEED', { fontSize: '42px', color: '#ffffff', fontStyle: 'bold', stroke: '#1b4b96', strokeThickness: 6 }).setOrigin(0.5).setDepth(1);
    }

    addSoftBackdrop(this, 1);
    this.add.rectangle(480, 270, 960, 540, 0xffffff, 0.026).setDepth(2);
    this.add.rectangle(480, 516, 960, 48, 0x071a38, 0.28).setDepth(3);

    const glow = this.add.ellipse(480, 91, 410, 104, 0x8cc4ff, 0.11).setDepth(4);
    this.tweens.add({ targets: glow, alpha: 0.19, scaleX: 1.035, scaleY: 1.055, duration: 1850, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    for (let i = 0; i < 14; i += 1) {
      if (!this.textures.exists('ui-particles')) break;
      const p = this.add.sprite(
        Phaser.Math.Between(96, 864),
        Phaser.Math.Between(58, 488),
        'ui-particles',
        Phaser.Math.Between(0, 3)
      ).setDepth(5).setAlpha(Phaser.Math.FloatBetween(0.06, 0.18)).setScale(Phaser.Math.FloatBetween(0.18, 0.44));
      p.play('ui-particle-glow');
      this.tweens.add({
        targets: p,
        x: p.x + Phaser.Math.Between(-14, 14),
        y: p.y - Phaser.Math.Between(6, 20),
        alpha: Phaser.Math.FloatBetween(0.03, 0.15),
        duration: Phaser.Math.Between(2500, 5000),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
  }

  private createTopUtilityHints(): void {
    const topChip = this.textureKey('ui-top-chip-boutique-v49', this.textureKey('ui-top-chip-compact-v48', 'ui-button-blue'));
    const items = [
      { x: 770, icon: '📢', label: '공지' },
      { x: 842, icon: '🎧', label: '문의' },
      { x: 914, icon: '⚙', label: '설정' },
    ];

    items.forEach((item) => {
      const c = this.add.container(item.x, 29).setDepth(25);
      c.add(this.add.image(0, 0, topChip).setDisplaySize(62, 26).setAlpha(0.92));
      c.add(this.add.text(-14, -1, item.icon, { fontSize: '12px' }).setOrigin(0.5));
      c.add(this.add.text(10, -1, item.label, {
        fontSize: '9px',
        color: '#ffffff',
        fontStyle: 'bold',
        stroke: '#153066',
        strokeThickness: 2
      }).setOrigin(0.5));
    });

    this.add.text(18, 15, 'PREMIUM ART PASS', {
      fontSize: '9px',
      color: '#eef6ff',
      fontStyle: 'bold',
      backgroundColor: '#09245177',
      padding: { x: 6, y: 3 }
    }).setDepth(26);
  }

  private createBoutiqueTitle(): void {
    const ornamentKey = this.textureKey('ui-title-ornaments-boutique-v49', this.textureKey('ui-title-ornaments-v48', 'ui-status-plaque'));
    this.add.image(480, 82, ornamentKey).setDisplaySize(286, 96).setDepth(17).setAlpha(0.58);

    const logoKey = this.textureKey('ui-title-logo-boutique-v49', this.textureKey('ui-title-logo-compact-v48', 'ui-title-logo'));
    const logo = this.add.image(480, 82, logoKey).setDisplaySize(300, 102).setDepth(22);
    this.tweens.add({ targets: logo, y: 83, duration: 1900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    if (this.textures.exists('ui-jewel-divider-boutique-v49')) {
      this.add.image(480, 142, 'ui-jewel-divider-boutique-v49').setDisplaySize(116, 17).setDepth(23).setAlpha(0.88);
    }

    this.add.text(480, 150, '프리미엄 왕국 방어 로비', {
      fontSize: '12px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#144081',
      strokeThickness: 3,
      shadow: { offsetX: 0, offsetY: 2, color: '#000000', blur: 4, fill: true },
    }).setOrigin(0.5).setDepth(23);

    const shimmerKey = this.textures.exists('fx-boutique-shimmer-v49') ? 'fx-boutique-shimmer-v49' : 'fx-compact-shimmer-v48';
    const animKey = this.textures.exists('fx-boutique-shimmer-v49') ? 'fx-boutique-shimmer-v49-anim' : 'fx-compact-shimmer-v48-anim';
    if (this.textures.exists(shimmerKey) && this.anims.exists(animKey)) {
      for (let i = 0; i < 3; i += 1) {
        const s = this.add.sprite(382 + i * 49, 67 + (i % 2) * 28, shimmerKey).setDepth(24).setScale(0.62).setAlpha(0.72);
        s.play({ key: animKey, repeat: -1, frameRate: 8, startFrame: i % 8 });
      }
    }
  }

  private createBoutiqueCommandPanel(): void {
    this.loginPanel = this.add.container(480, 316).setDepth(40);

    const panelKey = this.textureKey('ui-login-panel-boutique-v49', this.textureKey('ui-login-panel-compact-v48', 'ui-login-panel'));
    const primaryKey = this.textureKey('ui-button-boutique-gold-v49', this.textureKey('ui-button-compact-gold-v48', 'ui-button-primary'));
    const blueKey = this.textureKey('ui-button-boutique-blue-v49', this.textureKey('ui-button-compact-blue-v48', 'ui-button-blue'));
    const whiteKey = this.textureKey('ui-button-boutique-white-v49', this.textureKey('ui-button-compact-white-v48', 'ui-button-gold'));
    const redKey = this.textureKey('ui-button-boutique-red-v49', this.textureKey('ui-button-compact-red-v48', 'ui-button-red'));

    this.loginPanel.add(this.add.image(0, 0, panelKey).setDisplaySize(318, 214));

    this.statusText = this.add.text(0, -63, '로그인 확인 중...', {
      fontSize: '11px',
      color: '#3a5d96',
      align: 'center',
      fixedWidth: 248,
      backgroundColor: '#f2f8ffdd',
      padding: { x: 7, y: 3 }
    }).setOrigin(0.5);
    this.loginPanel.add(this.statusText);

    this.loginPanel.add(addPremiumButton(this, {
      x: 0,
      y: -18,
      width: 238,
      height: 38,
      texture: primaryKey,
      icon: 'ui-icon-anonymous',
      label: '바로 시작',
      onClick: () => void this.startAnonymous()
    }));

    this.loginPanel.add(addPremiumButton(this, {
      x: 0,
      y: 28,
      width: 238,
      height: 38,
      texture: blueKey,
      icon: 'ui-icon-google',
      label: 'Google 연동',
      onClick: () => void this.startGoogle()
    }));

    this.loginPanel.add(addPremiumButton(this, {
      x: -61,
      y: 74,
      width: 112,
      height: 35,
      texture: whiteKey,
      icon: 'ui-icon-email',
      label: '이메일',
      onClick: () => void this.startEmailLogin()
    }));

    this.loginPanel.add(addPremiumButton(this, {
      x: 61,
      y: 74,
      width: 112,
      height: 35,
      texture: redKey,
      icon: 'ui-icon-register',
      label: '가입',
      onClick: () => void this.startEmailRegister()
    }));

    this.loginPanel.add(this.add.text(0, 99, '게스트 진행 가능 · 연동 시 저장 유지', {
      fontSize: '10px',
      color: '#5d789e',
      fontStyle: 'bold'
    }).setOrigin(0.5));

    this.loginPanel.setAlpha(0).setScale(0.965).setY(326);
    this.tweens.add({ targets: this.loginPanel, alpha: 1, y: 316, scaleX: 1, scaleY: 1, duration: 310, ease: 'Back.easeOut' });
  }

  private createBoutiqueStatusBar(): void {
    const stripKey = this.textureKey('ui-footer-strip-boutique-v49', this.textureKey('ui-footer-strip-compact-v48', 'ui-status-plaque'));
    this.add.image(480, 505, stripKey).setDisplaySize(342, 36).setDepth(18).setAlpha(0.94);
    this.add.text(480, 504, '영웅 · 유물 · 타워 진화 · 보스 토벌', {
      fontSize: '10px',
      color: '#ffffff',
      align: 'center',
      fontStyle: 'bold',
      fixedWidth: 350,
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
        this.statusText.setText('Google 이동 중...');
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
    this.cameras.main.fadeOut(220, 255, 255, 255);
    this.time.delayedCall(220, () => this.scene.start('WorldMapScene', { user, save }));
  }
}
