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
    this.children.removeAll(true);
    this.cameras.main.setBackgroundColor('#87c7ff');
    this.createCleanBackground();
    this.createUtilityButtons();
    this.createCleanTitle();
    this.createCleanLoginPanel();
    this.createFooterStrip();
    this.time.delayedCall(0, () => {
      window.dispatchEvent(new CustomEvent('kingdom-seed:scene-ready', { detail: { scene: 'MenuScene', at: Date.now() } }));
    });
    void this.bootstrapRedirectOrExistingUser();
  }

  private textureKey(primary: string, fallback: string): string {
    return this.textures.exists(primary) ? primary : fallback;
  }

  private createCleanBackground(): void {
    if (this.textures.exists('ui-title-bg')) {
      this.add.image(480, 270, 'ui-title-bg').setDisplaySize(960, 540).setDepth(0);
    } else {
      this.add.rectangle(480, 270, 960, 540, 0x91ccff, 1).setDepth(0);
    }

    addSoftBackdrop(this, 1);
    this.add.rectangle(480, 270, 960, 540, 0xffffff, 0.018).setDepth(2);
    this.add.rectangle(480, 270, 960, 540, 0x061024, 0.10).setDepth(3);

    const focus = this.add.ellipse(480, 235, 420, 310, 0xffffff, 0.055).setDepth(4);
    this.tweens.add({ targets: focus, alpha: 0.105, scaleX: 1.035, scaleY: 1.035, duration: 2100, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    if (this.textures.exists('ui-particles')) {
      for (let i = 0; i < 10; i += 1) {
        const p = this.add.sprite(Phaser.Math.Between(120, 840), Phaser.Math.Between(70, 472), 'ui-particles', Phaser.Math.Between(0, 3))
          .setDepth(5)
          .setAlpha(Phaser.Math.FloatBetween(0.045, 0.13))
          .setScale(Phaser.Math.FloatBetween(0.14, 0.32));
        p.play('ui-particle-glow');
        this.tweens.add({ targets: p, y: p.y - Phaser.Math.Between(8, 22), alpha: Phaser.Math.FloatBetween(0.025, 0.11), duration: Phaser.Math.Between(2600, 5200), yoyo: true, repeat: -1 });
      }
    }
  }

  private createUtilityButtons(): void {
    const topChip = this.textureKey('ui-top-chip-boutique-v49', this.textureKey('ui-top-chip-compact-v48', 'ui-button-blue'));
    const items = [
      { x: 782, icon: '📢', label: '공지' },
      { x: 852, icon: '🎧', label: '문의' },
      { x: 922, icon: '⚙', label: '설정' },
    ];

    items.forEach((item) => {
      const c = this.add.container(item.x, 31).setDepth(20);
      c.add(this.add.image(0, 0, topChip).setDisplaySize(58, 24).setAlpha(0.88));
      c.add(this.add.text(-13, -1, item.icon, { fontSize: '11px' }).setOrigin(0.5));
      c.add(this.add.text(10, -1, item.label, { fontSize: '9px', color: '#ffffff', fontStyle: 'bold', stroke: '#153066', strokeThickness: 2 }).setOrigin(0.5));
    });
  }

  private createCleanTitle(): void {
    const ornamentKey = this.textureKey('ui-title-ornaments-boutique-v49', this.textureKey('ui-title-ornaments-v48', 'ui-status-plaque'));
    this.add.image(480, 83, ornamentKey).setDisplaySize(248, 74).setDepth(13).setAlpha(0.42);

    const logoKey = this.textureKey('ui-title-logo-boutique-v49', this.textureKey('ui-title-logo-compact-v48', 'ui-title-logo'));
    const logo = this.add.image(480, 85, logoKey).setDisplaySize(256, 78).setDepth(18);
    this.tweens.add({ targets: logo, y: 86, duration: 2200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    this.add.text(480, 142, '시네마틱 왕국 방어 전략', {
      fontSize: '12px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#144081',
      strokeThickness: 3,
      shadow: { offsetX: 0, offsetY: 2, color: '#000000', blur: 4, fill: true },
    }).setOrigin(0.5).setDepth(19);
  }

  private createCleanLoginPanel(): void {
    this.loginPanel = this.add.container(480, 314).setDepth(35);

    const panelKey = this.textureKey('ui-login-panel-boutique-v49', this.textureKey('ui-login-panel-compact-v48', 'ui-login-panel'));
    const primaryKey = this.textureKey('ui-button-boutique-gold-v49', this.textureKey('ui-button-compact-gold-v48', 'ui-button-primary'));
    const blueKey = this.textureKey('ui-button-boutique-blue-v49', this.textureKey('ui-button-compact-blue-v48', 'ui-button-blue'));
    const whiteKey = this.textureKey('ui-button-boutique-white-v49', this.textureKey('ui-button-compact-white-v48', 'ui-button-gold'));
    const redKey = this.textureKey('ui-button-boutique-red-v49', this.textureKey('ui-button-compact-red-v48', 'ui-button-red'));

    this.loginPanel.add(this.add.image(0, 0, panelKey).setDisplaySize(304, 190));
    this.loginPanel.add(this.add.text(0, -70, 'LOGIN', { fontSize: '16px', color: '#ffffff', fontStyle: 'bold', stroke: '#174184', strokeThickness: 4 }).setOrigin(0.5));

    this.statusText = this.add.text(0, -47, '로그인 확인 중...', {
      fontSize: '10px',
      color: '#3a5d96',
      align: 'center',
      fixedWidth: 232,
      backgroundColor: '#f2f8ffe6',
      padding: { x: 6, y: 2 }
    }).setOrigin(0.5);
    this.loginPanel.add(this.statusText);

    this.loginPanel.add(addPremiumButton(this, { x: 0, y: -10, width: 226, height: 34, texture: primaryKey, icon: 'ui-icon-anonymous', label: '바로 시작', onClick: () => void this.startAnonymous() }));
    this.loginPanel.add(addPremiumButton(this, { x: 0, y: 32, width: 226, height: 34, texture: blueKey, icon: 'ui-icon-google', label: 'Google 연동', onClick: () => void this.startGoogle() }));
    this.loginPanel.add(addPremiumButton(this, { x: -58, y: 73, width: 106, height: 32, texture: whiteKey, icon: 'ui-icon-email', label: '이메일', onClick: () => void this.startEmailLogin() }));
    this.loginPanel.add(addPremiumButton(this, { x: 58, y: 73, width: 106, height: 32, texture: redKey, icon: 'ui-icon-register', label: '가입', onClick: () => void this.startEmailRegister() }));

    this.loginPanel.setAlpha(0).setScale(0.965).setY(324);
    this.tweens.add({ targets: this.loginPanel, alpha: 1, y: 314, scaleX: 1, scaleY: 1, duration: 280, ease: 'Back.easeOut' });
  }

  private createFooterStrip(): void {
    const stripKey = this.textureKey('ui-footer-strip-boutique-v49', this.textureKey('ui-footer-strip-compact-v48', 'ui-status-plaque'));
    this.add.image(480, 500, stripKey).setDisplaySize(292, 30).setDepth(18).setAlpha(0.90);
    this.add.text(480, 499, '영웅 · 유물 · 타워 진화 · 보스 토벌', {
      fontSize: '9px',
      color: '#ffffff',
      align: 'center',
      fontStyle: 'bold',
      fixedWidth: 310,
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
      this.statusText.setText('로그인 확인 실패. 설정/도메인 확인');
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
    this.cameras.main.fadeOut(180, 255, 255, 255);
    this.time.delayedCall(180, () => this.scene.start('WorldMapScene', { user, save }));
  }
}
