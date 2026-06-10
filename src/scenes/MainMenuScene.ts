import Phaser from 'phaser';
import type { User } from 'firebase/auth';
import { playMusic, playSfx } from '../game/AudioManager';
import { STAGE_LIST } from '../game/balance';
import { addCoverImage } from '../game/CodeUiKit';
import { addHitZoneDebug } from '../game/HitZoneDebug';
import type { PlayerSave } from '../services/firebase';

type HotspotTone = 'gold' | 'blue' | 'white' | 'red' | 'green';

type HotspotOptions = {
  x: number;
  y: number;
  width: number;
  height: number;
  radius?: number;
  tone?: HotspotTone;
  onClick: () => void;
};

const TONE_TINT: Record<HotspotTone, number> = {
  gold: 0xffd56c,
  blue: 0x62b8ff,
  white: 0xffffff,
  red: 0xff8a6c,
  green: 0x8be878,
};

export class MainMenuScene extends Phaser.Scene {
  private user!: User;
  private save!: PlayerSave;
  private isReady = false;
  private toastText?: Phaser.GameObjects.Text;
  private toastBack?: Phaser.GameObjects.Graphics;

  constructor() {
    super('MainMenuScene');
  }

  init(data: { user?: User; save?: PlayerSave }): void {
    if (!data.user || !data.save) {
      this.isReady = false;
      return;
    }
    this.user = data.user;
    this.save = data.save;
    this.isReady = true;
  }

  create(): void {
    if (!this.isReady) {
      this.scene.start('MenuScene');
      return;
    }

    playMusic(this, 'bgm_world', 0.20);
    window.addEventListener('kingdom-seed:user-activated', () => playMusic(this, 'bgm_world', 0.20), { once: true });

    this.createIllustrationLedLobby();
    this.createPremiumHitZones();
    this.createSmallStatusToast();

    this.time.delayedCall(0, () => {
      window.dispatchEvent(new CustomEvent('kingdom-seed:scene-ready', { detail: { scene: 'MainMenuScene', version: '2.0', at: Date.now() } }));
    });
  }

  private createIllustrationLedLobby(): void {
    const key = this.textures.exists('v1-main-menu-splash-v18') ? 'v1-main-menu-splash-v18' : this.textures.exists('v1-main-menu-splash') ? 'v1-main-menu-splash' : 'v1-main-menu-bg';
    addCoverImage(this, key, 960, 540, 0);

    const topGlow = this.add.rectangle(480, 3, 950, 12, 0xc6efff, 0.18)
      .setDepth(2)
      .setBlendMode(Phaser.BlendModes.ADD);
    const bottomGlow = this.add.ellipse(480, 518, 600, 44, 0x90d7ff, 0.12)
      .setDepth(2)
      .setBlendMode(Phaser.BlendModes.ADD);

    this.tweens.add({ targets: topGlow, alpha: 0.30, duration: 1800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    this.tweens.add({ targets: bottomGlow, alpha: 0.22, scaleX: 1.02, duration: 2200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  }

  private createPremiumHitZones(): void {
    // Bottom primary navigation from the baked premium lobby art.
    this.addHotspot({ x: 203, y: 502, width: 218, height: 58, radius: 25, tone: 'blue', onClick: () => this.goWorldMap() });
    this.addHotspot({ x: 480, y: 501, width: 236, height: 64, radius: 30, tone: 'gold', onClick: () => this.quickBattle() });
    this.addHotspot({ x: 754, y: 502, width: 218, height: 58, radius: 25, tone: 'blue', onClick: () => this.goScene('MissionBoardScene') });

    // Left vertical lobby buttons.
    this.addHotspot({ x: 86, y: 271, width: 128, height: 42, radius: 17, tone: 'white', onClick: () => this.showToast('상점은 원화급 상점 패스에서 연결합니다.') });
    this.addHotspot({ x: 86, y: 323, width: 128, height: 42, radius: 17, tone: 'blue', onClick: () => this.goScene('HeroHallScene') });
    this.addHotspot({ x: 86, y: 375, width: 128, height: 42, radius: 17, tone: 'gold', onClick: () => this.goScene('CodexScene') });
    this.addHotspot({ x: 86, y: 428, width: 128, height: 42, radius: 17, tone: 'white', onClick: () => this.showToast('우편함은 보상/출석 패스에서 연결합니다.') });
    this.addHotspot({ x: 86, y: 480, width: 128, height: 42, radius: 17, tone: 'red', onClick: () => this.goScene('MissionBoardScene') });

    // Right vertical lobby buttons.
    this.addHotspot({ x: 858, y: 135, width: 140, height: 45, radius: 19, tone: 'white', onClick: () => this.goScene('MissionBoardScene') });
    this.addHotspot({ x: 858, y: 194, width: 140, height: 45, radius: 19, tone: 'gold', onClick: () => this.showToast('패스 화면은 다음 원화급 UI 패스에서 제작합니다.') });
    this.addHotspot({ x: 858, y: 253, width: 140, height: 45, radius: 19, tone: 'blue', onClick: () => this.showToast('길드 화면은 추후 연결합니다.') });
    this.addHotspot({ x: 858, y: 313, width: 140, height: 45, radius: 19, tone: 'white', onClick: () => this.showToast('랭킹은 월드맵 명예의 전당에서 먼저 확인하세요.') });
    this.addHotspot({ x: 858, y: 373, width: 140, height: 45, radius: 19, tone: 'blue', onClick: () => this.showToast('설정 메뉴는 별도 팝업으로 분리 예정입니다.') });

    // Top resource buttons / hamburger. They stay interactive even though the visual is baked into the asset.
    this.addHotspot({ x: 440, y: 35, width: 128, height: 34, radius: 16, tone: 'gold', onClick: () => this.showToast(`보유 별 ${this.save.stars}개`) });
    this.addHotspot({ x: 570, y: 35, width: 128, height: 34, radius: 16, tone: 'gold', onClick: () => this.showToast('골드/재화 상세 패널은 상점 패스에서 연결합니다.') });
    this.addHotspot({ x: 704, y: 35, width: 128, height: 34, radius: 16, tone: 'blue', onClick: () => this.showToast('보석 재화는 상점 패스에서 연결합니다.') });
    this.addHotspot({ x: 907, y: 36, width: 54, height: 54, radius: 26, tone: 'white', onClick: () => this.showToast('메뉴 설정은 다음 패치에서 팝업화합니다.') });

    // Profile card hotspot.
    this.addHotspot({ x: 105, y: 189, width: 156, height: 56, radius: 16, tone: 'blue', onClick: () => this.goScene('HeroHallScene') });
  }

  private addHotspot(options: HotspotOptions): void {
    const radius = options.radius ?? Math.min(options.width, options.height) / 2;
    const tint = TONE_TINT[options.tone ?? 'white'];
    const c = this.add.container(options.x, options.y).setDepth(50);

    const hover = this.add.graphics();
    hover.fillStyle(tint, 0.16);
    hover.fillRoundedRect(-options.width / 2, -options.height / 2, options.width, options.height, radius);
    hover.lineStyle(2, 0xffffff, 0.52);
    hover.strokeRoundedRect(-options.width / 2 + 1, -options.height / 2 + 1, options.width - 2, options.height - 2, Math.max(4, radius - 1));
    hover.setAlpha(0);

    const glint = this.add.rectangle(-options.width * 0.18, -options.height * 0.28, options.width * 0.52, Math.max(5, options.height * 0.16), 0xffffff, 0.20)
      .setRotation(-0.09)
      .setAlpha(0);

    const hit = this.add.zone(0, 0, options.width, options.height).setInteractive({ useHandCursor: true });
    c.add([hover, glint, hit]);
    addHitZoneDebug(this, c, options.width, options.height, `hotspot ${Math.round(options.x)},${Math.round(options.y)}`, tint, radius);

    hit.on('pointerover', () => {
      this.tweens.add({ targets: hover, alpha: 1, duration: 115, ease: 'Sine.easeOut' });
      this.tweens.add({ targets: glint, alpha: 1, x: options.width * 0.18, duration: 180, ease: 'Sine.easeOut' });
    });

    hit.on('pointerout', () => {
      this.tweens.add({ targets: hover, alpha: 0, duration: 120, ease: 'Sine.easeOut' });
      this.tweens.add({ targets: glint, alpha: 0, x: -options.width * 0.18, duration: 120, ease: 'Sine.easeOut' });
      this.tweens.add({ targets: c, scaleX: 1, scaleY: 1, duration: 80, ease: 'Sine.easeOut' });
    });

    hit.on('pointerdown', () => {
      this.tweens.add({ targets: c, scaleX: 0.985, scaleY: 0.985, duration: 50, yoyo: true, ease: 'Quad.easeOut' });
      options.onClick();
    });
  }

  private createSmallStatusToast(): void {
    this.toastBack = this.add.graphics().setDepth(80);
    this.toastBack.setAlpha(0);
    this.toastText = this.add.text(480, 459, `${this.save.nickname} 지휘관님, 왕국 방어 준비 완료`, {
      fontSize: '13px',
      color: '#f8fbff',
      fontFamily: 'Inter, Pretendard, Noto Sans KR, Arial, sans-serif',
      fontStyle: 'bold',
      align: 'center',
      stroke: '#17366c',
      strokeThickness: 3,
      fixedWidth: 420,
    }).setOrigin(0.5).setDepth(81).setAlpha(0);

    this.time.delayedCall(450, () => this.showToast(`${this.save.nickname} 지휘관님, 왕국 방어 준비 완료`, 1700));
  }

  private showToast(message: string, holdMs = 1500): void {
    playSfx(this, 'sfx_click');
    if (!this.toastBack || !this.toastText) return;

    this.toastBack.clear();
    this.toastBack.fillStyle(0x071c3e, 0.66);
    this.toastBack.fillRoundedRect(260, 439, 440, 40, 19);
    this.toastBack.lineStyle(2, 0xffdc82, 0.60);
    this.toastBack.strokeRoundedRect(260, 439, 440, 40, 19);
    this.toastBack.lineStyle(1, 0xffffff, 0.28);
    this.toastBack.strokeRoundedRect(265, 444, 430, 30, 15);

    this.toastText.setText(message);
    this.tweens.killTweensOf([this.toastBack, this.toastText]);
    this.toastBack.setAlpha(0);
    this.toastText.setAlpha(0).setY(463);
    this.tweens.add({ targets: [this.toastBack, this.toastText], alpha: 1, duration: 130, ease: 'Sine.easeOut' });
    this.tweens.add({ targets: this.toastText, y: 459, duration: 180, ease: 'Back.easeOut' });
    this.time.delayedCall(holdMs, () => {
      if (!this.toastBack || !this.toastText) return;
      this.tweens.add({ targets: [this.toastBack, this.toastText], alpha: 0, duration: 220, ease: 'Sine.easeIn' });
    });
  }

  private goScene(sceneKey: string): void {
    playSfx(this, 'sfx_click');
    this.scene.start(sceneKey, { user: this.user, save: this.save });
  }

  private goWorldMap(): void {
    this.goScene('WorldMapScene');
  }

  private quickBattle(): void {
    playSfx(this, 'sfx_click');
    const playable = STAGE_LIST.reduce((best, stage) => {
      if (!stage.unlockRequires || this.save.clearedStages[stage.unlockRequires]?.bestStars) return stage;
      return best;
    }, STAGE_LIST[0]);
    this.scene.start('GameScene', { user: this.user, save: this.save, stageId: playable.id });
  }
}
