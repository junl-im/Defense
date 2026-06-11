import Phaser from 'phaser';
import type { User } from 'firebase/auth';
import { STAGE_LIST, getStageConfig } from '../game/balance';
import type { StageConfig, StageId } from '../game/types';
import { playMusicWhenReady, playSfx } from '../game/AudioManager';
import { addCoverImage } from '../game/CodeUiKit';
import { addHitZoneDebug } from '../game/HitZoneDebug';
import { addCuteWorldMapAccents } from '../game/CuteFantasyPolishV216';
import { addV217WorldMapArt } from '../game/CuteFantasyArtV217';
import { addV218WorldMapArt } from '../game/CuteFantasyArtV218';
import { addV219WorldMapArt } from '../game/CuteFantasyArtV219';
import { addV220WorldMapArt } from '../game/CuteFantasyArtV220';
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

type StageNode = {
  id: StageId;
  x: number;
  y: number;
  radius: number;
};

const STAGE_NODES: StageNode[] = [
  { id: 'stage_001', x: 94, y: 390, radius: 24 },
  { id: 'stage_002', x: 178, y: 332, radius: 24 },
  { id: 'stage_003', x: 262, y: 386, radius: 24 },
  { id: 'stage_004', x: 350, y: 292, radius: 24 },
  { id: 'stage_005', x: 442, y: 338, radius: 24 },
  { id: 'stage_006', x: 528, y: 238, radius: 24 },
  { id: 'stage_007', x: 612, y: 310, radius: 24 },
  { id: 'stage_008', x: 694, y: 224, radius: 24 },
  { id: 'stage_009', x: 758, y: 304, radius: 23 },
  { id: 'stage_010', x: 832, y: 210, radius: 23 },
  { id: 'stage_011', x: 862, y: 336, radius: 23 },
  { id: 'stage_012', x: 878, y: 424, radius: 24 },
];

const TONE_TINT: Record<HotspotTone, number> = {
  gold: 0xffd56c,
  blue: 0x62b8ff,
  white: 0xffffff,
  red: 0xff806b,
  green: 0x8be878,
};

export class WorldMapScene extends Phaser.Scene {
  private user!: User;
  private save!: PlayerSave;
  private selectedStage: StageConfig = getStageConfig('stage_001');
  private selectedIndex = 0;
  private previewImage?: Phaser.GameObjects.Image;
  private stageTitleText?: Phaser.GameObjects.Text;
  private stageSubText?: Phaser.GameObjects.Text;
  private stageMetaText?: Phaser.GameObjects.Text;
  private stageStatusText?: Phaser.GameObjects.Text;
  private selectedMarker?: Phaser.GameObjects.Container;
  private toastBack?: Phaser.GameObjects.Graphics;
  private toastText?: Phaser.GameObjects.Text;
  private toastHideTimer?: Phaser.Time.TimerEvent;

  constructor() {
    super('WorldMapScene');
  }

  init(data: { user: User; save: PlayerSave; stageId?: StageId }): void {
    this.user = data.user;
    this.save = data.save;
    const requested = data.stageId ? STAGE_LIST.findIndex((stage) => stage.id === data.stageId) : -1;
    this.selectedIndex = requested >= 0 ? requested : this.findFirstPlayableIndex();
    this.selectedStage = STAGE_LIST[this.selectedIndex] ?? getStageConfig('stage_001');
  }

  create(): void {
    playMusicWhenReady(this, 'bgm_world', 0.22);

    this.createIllustratedWorldMap();
    addCuteWorldMapAccents(this, STAGE_NODES);
    addV217WorldMapArt(this, STAGE_NODES);
    addV218WorldMapArt(this, STAGE_NODES);
    addV219WorldMapArt(this, STAGE_NODES);
    addV220WorldMapArt(this, STAGE_NODES);
    this.createStagePreviewLayer();
    this.createStageNodeHotspots();
    this.createNavigationHotspots();
    this.createToastLayer();
    this.refreshSelectedStage(false);

    this.time.delayedCall(0, () => {
      window.dispatchEvent(new CustomEvent('kingdom-seed:scene-ready', { detail: { scene: 'WorldMapScene', version: '2.20.0', at: Date.now() } }));
    });
  }

  private findFirstPlayableIndex(): number {
    let bestIndex = 0;
    STAGE_LIST.forEach((stage, index) => {
      if (this.isStageUnlocked(stage)) bestIndex = index;
    });
    return bestIndex;
  }

  private createIllustratedWorldMap(): void {
    const key = this.textures.exists('v1-worldmap-splash-v18') ? 'v1-worldmap-splash-v18' : this.textures.exists('v1-worldmap-splash') ? 'v1-worldmap-splash' : 'v1-worldmap-bg';
    addCoverImage(this, key, 960, 540, 0);

    const dust = this.add.container(0, 0).setDepth(5);
    for (let i = 0; i < 18; i += 1) {
      const sparkle = this.add.star(
        Phaser.Math.Between(270, 910),
        Phaser.Math.Between(105, 430),
        4,
        1.4,
        4.4,
        Phaser.Display.Color.GetColor(255, 238, 150),
        Phaser.Math.FloatBetween(0.16, 0.36)
      ).setBlendMode(Phaser.BlendModes.ADD);
      dust.add(sparkle);
      this.tweens.add({
        targets: sparkle,
        alpha: Phaser.Math.FloatBetween(0.05, 0.22),
        scale: Phaser.Math.FloatBetween(0.75, 1.38),
        duration: Phaser.Math.Between(1200, 2500),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }
  }

  private createStagePreviewLayer(): void {
    this.previewImage = this.add.image(815, 222, this.stageCardTextureKey(this.selectedStage.id))
      .setDisplaySize(198, 128)
      .setDepth(22)
      .setAlpha(0.98);

    this.stageTitleText = this.add.text(715, 318, '', {
      fontFamily: 'NanumSquareRound, Pretendard, Noto Sans KR, Arial, sans-serif',
      fontSize: '20px',
      fontStyle: 'bold',
      color: '#214f94',
      stroke: '#ffffff',
      strokeThickness: 4,
      fixedWidth: 205,
      align: 'left',
    }).setDepth(24);

    this.stageSubText = this.add.text(715, 346, '', {
      fontFamily: 'NanumSquareRound, Pretendard, Noto Sans KR, Arial, sans-serif',
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#53719e',
      stroke: '#ffffff',
      strokeThickness: 3,
      fixedWidth: 205,
      align: 'left',
    }).setDepth(24);

    this.stageMetaText = this.add.text(715, 386, '', {
      fontFamily: 'NanumSquareRound, Pretendard, Noto Sans KR, Arial, sans-serif',
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#365f9c',
      stroke: '#ffffff',
      strokeThickness: 3,
      lineSpacing: 4,
      fixedWidth: 215,
      align: 'left',
    }).setDepth(24);

    this.stageStatusText = this.add.text(284, 111, '', {
      fontFamily: 'NanumSquareRound, Pretendard, Noto Sans KR, Arial, sans-serif',
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#f7fbff',
      stroke: '#113c87',
      strokeThickness: 4,
      fixedWidth: 386,
      align: 'center',
    }).setOrigin(0, 0.5).setDepth(24);

    this.add.text(707, 118, 'ACT II  원정 루트 개방', {
      fontFamily: 'NanumSquareRound, Pretendard, Noto Sans KR, Arial, sans-serif',
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#fff3b8',
      stroke: '#0b356f',
      strokeThickness: 3,
      fixedWidth: 225,
      align: 'center',
    }).setDepth(24);

    this.selectedMarker = this.add.container(0, 0).setDepth(26);
    const outer = this.add.circle(0, 0, 27, 0x7ce8ff, 0.22).setBlendMode(Phaser.BlendModes.ADD);
    const ring = this.add.circle(0, 0, 22, 0xffffff, 0).setStrokeStyle(4, 0xfff0a6, 0.94);
    const inner = this.add.circle(0, 0, 14, 0x2d75d6, 0.16).setStrokeStyle(2, 0xffffff, 0.84);
    const label = this.add.text(0, -42, '선택', {
      fontFamily: 'NanumSquareRound, Pretendard, Noto Sans KR, Arial, sans-serif',
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#fff3b8',
      stroke: '#0b356f',
      strokeThickness: 3,
    }).setOrigin(0.5);
    this.selectedMarker.add([outer, ring, inner, label]);
    this.tweens.add({ targets: outer, scale: 1.28, alpha: 0.40, duration: 1050, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    this.tweens.add({ targets: ring, angle: 360, duration: 6200, repeat: -1, ease: 'Linear' });
  }

  private createStageNodeHotspots(): void {
    STAGE_NODES.forEach((node) => {
      const stage = STAGE_LIST.find((candidate) => candidate.id === node.id);
      if (!stage) return;
      this.addHotspot({
        x: node.x,
        y: node.y,
        width: node.radius * 2,
        height: node.radius * 2,
        radius: node.radius,
        tone: this.isStageUnlocked(stage) ? 'gold' : 'white',
        onClick: () => this.selectStage(stage.id),
      });
    });

    // v1.5 background has a beautiful left campaign panel; these two invisible slots
    // keep the early stages selectable even when the map nodes are partially under the panel art.
    this.addHotspot({ x: 131, y: 213, width: 190, height: 44, radius: 12, tone: 'gold', onClick: () => this.selectStage('stage_001') });
    this.addHotspot({ x: 131, y: 269, width: 190, height: 44, radius: 12, tone: 'blue', onClick: () => this.selectStage('stage_002') });
  }

  private createNavigationHotspots(): void {
    this.addHotspot({ x: 889, y: 83, width: 100, height: 38, radius: 19, tone: 'blue', onClick: () => this.scene.start('MainMenuScene', { user: this.user, save: this.save }) });
    this.addHotspot({ x: 818, y: 480, width: 226, height: 50, radius: 24, tone: 'red', onClick: () => this.startSelectedStage() });

    const nav = [
      { x: 54, scene: 'MainMenuScene', message: '' },
      { x: 145, scene: 'HeroHallScene', message: '' },
      { x: 236, scene: 'MissionBoardScene', message: '' },
      { x: 327, scene: 'LabScene', message: '' },
      { x: 418, scene: 'ArtifactForgeScene', message: '' },
      { x: 509, scene: 'CodexScene', message: '' },
      { x: 600, scene: '', message: '월드맵 정보를 새로고침했습니다.' },
    ];

    nav.forEach((item) => this.addHotspot({
      x: item.x,
      y: 509,
      width: 72,
      height: 32,
      radius: 15,
      tone: 'white',
      onClick: () => {
        if (item.scene.length > 0) {
          this.scene.start(item.scene, { user: this.user, save: this.save });
        } else {
          this.showToast(item.message);
        }
      },
    }));

    this.addHotspot({ x: 720, y: 39, width: 126, height: 36, radius: 18, tone: 'blue', onClick: () => this.showToast(`보유 별: ${this.save.stars}개`) });
    this.addHotspot({ x: 839, y: 39, width: 126, height: 36, radius: 18, tone: 'gold', onClick: () => this.showToast('골드 재화 패널은 상점 패스에서 연결합니다.') });
  }

  private addHotspot(options: HotspotOptions): void {
    const radius = options.radius ?? Math.min(options.width, options.height) / 2;
    const tint = TONE_TINT[options.tone ?? 'white'];
    const container = this.add.container(options.x, options.y).setDepth(70);
    const hover = this.add.graphics();
    hover.fillStyle(tint, 0.12);
    hover.fillRoundedRect(-options.width / 2, -options.height / 2, options.width, options.height, radius);
    hover.lineStyle(2, 0xffffff, 0.50);
    hover.strokeRoundedRect(-options.width / 2 + 1, -options.height / 2 + 1, options.width - 2, options.height - 2, Math.max(3, radius - 1));
    hover.setAlpha(0);
    const shine = this.add.rectangle(-options.width * 0.26, -options.height * 0.22, options.width * 0.50, Math.max(4, options.height * 0.15), 0xffffff, 0.16)
      .setRotation(-0.15)
      .setAlpha(0)
      .setBlendMode(Phaser.BlendModes.ADD);
    const hit = this.add.zone(0, 0, options.width, options.height).setInteractive({ useHandCursor: true });
    container.add([hover, shine, hit]);
    addHitZoneDebug(this, container, options.width, options.height, `hotspot ${Math.round(options.x)},${Math.round(options.y)}`, tint, radius);

    hit.on('pointerover', () => {
      this.tweens.add({ targets: hover, alpha: 1, duration: 90, ease: 'Sine.easeOut' });
      this.tweens.add({ targets: shine, alpha: 1, x: options.width * 0.18, duration: 180, ease: 'Sine.easeOut' });
    });
    hit.on('pointerout', () => {
      this.tweens.add({ targets: hover, alpha: 0, duration: 120, ease: 'Sine.easeOut' });
      this.tweens.add({ targets: shine, alpha: 0, x: -options.width * 0.26, duration: 120, ease: 'Sine.easeOut' });
      this.tweens.add({ targets: container, scaleX: 1, scaleY: 1, duration: 80, ease: 'Sine.easeOut' });
    });
    hit.on('pointerdown', () => {
      playSfx(this, 'sfx_click');
      this.tweens.add({ targets: container, scaleX: 0.985, scaleY: 0.985, duration: 48, yoyo: true, ease: 'Quad.easeOut' });
      options.onClick();
    });
  }

  private createToastLayer(): void {
    this.toastBack = this.add.graphics().setDepth(90).setAlpha(0);
    this.toastText = this.add.text(480, 458, '', {
      fontFamily: 'NanumSquareRound, Pretendard, Noto Sans KR, Arial, sans-serif',
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#f8fbff',
      stroke: '#17366c',
      strokeThickness: 3,
      align: 'center',
      fixedWidth: 500,
    }).setOrigin(0.5).setDepth(91).setAlpha(0);
  }

  private selectStage(stageId: StageId): void {
    const nextIndex = STAGE_LIST.findIndex((stage) => stage.id === stageId);
    if (nextIndex < 0) return;

    const nextStage = STAGE_LIST[nextIndex];
    if (!this.isStageUnlocked(nextStage)) {
      this.selectedStage = nextStage;
      this.selectedIndex = nextIndex;
      this.refreshSelectedStage(true);
      this.showToast(this.lockedMessage(nextStage));
      return;
    }

    this.selectedStage = nextStage;
    this.selectedIndex = nextIndex;
    this.refreshSelectedStage(true);
  }

  private refreshSelectedStage(animated: boolean): void {
    const stage = this.selectedStage;
    const unlocked = this.isStageUnlocked(stage);
    const best = this.save.clearedStages[stage.id];
    const stars = best?.bestStars ?? 0;
    const stageNode = STAGE_NODES.find((node) => node.id === stage.id) ?? STAGE_NODES[0];
    const textureKey = this.stageCardTextureKey(stage.id);

    this.previewImage?.setTexture(textureKey).setAlpha(unlocked ? 0.98 : 0.45);
    if (animated && this.previewImage) {
      this.previewImage.setScale(0.92);
      this.tweens.add({ targets: this.previewImage, scaleX: 1, scaleY: 1, duration: 170, ease: 'Back.easeOut' });
    }

    this.stageTitleText?.setText(`STAGE ${stage.number}  ${stage.title}`);
    this.stageSubText?.setText(stage.subtitle);
    this.stageMetaText?.setText([
      `별 기록  ${'★'.repeat(stars)}${'☆'.repeat(Math.max(0, 3 - stars))}`,
      `웨이브  ${stage.waves.length}   생명  ${stage.maxLives}`,
      unlocked ? '입장 가능  방어 준비 완료' : '잠김  이전 스테이지 클리어 필요',
    ].join('\n'));
    this.stageStatusText?.setText(unlocked ? `${stage.title} 작전 선택됨` : `${stage.title} 은 아직 잠겨 있습니다`);

    this.selectedMarker?.setPosition(stageNode.x, stageNode.y);
    this.selectedMarker?.setAlpha(unlocked ? 1 : 0.55);
    if (animated && this.selectedMarker) {
      this.selectedMarker.setScale(0.78);
      this.tweens.add({ targets: this.selectedMarker, scaleX: 1, scaleY: 1, duration: 210, ease: 'Back.easeOut' });
    }
  }

  private stageCardTextureKey(stageId: StageId): string {
    const key = `map-card-${stageId.replace('_', '-')}`;
    return this.textures.exists(key) ? key : 'map-card-stage-001';
  }

  private isStageUnlocked(stage: StageConfig): boolean {
    return !stage.unlockRequires || Boolean(this.save.clearedStages[stage.unlockRequires]?.bestStars);
  }

  private lockedMessage(stage: StageConfig): string {
    if (!stage.unlockRequires) return '입장 가능한 스테이지입니다.';
    const required = getStageConfig(stage.unlockRequires);
    return `${required.title}을 먼저 클리어해야 ${stage.title}이 열립니다.`;
  }

  private startSelectedStage(): void {
    if (!this.isStageUnlocked(this.selectedStage)) {
      this.showToast(this.lockedMessage(this.selectedStage));
      return;
    }
    if (!this.scene.isActive('WorldMapScene')) return;
    this.scene.start('GameScene', { user: this.user, save: this.save, stageId: this.selectedStage.id });
  }

  private showToast(message: string, holdMs = 1500): void {
    if (!this.scene.isActive('WorldMapScene') || !this.toastBack || !this.toastText) return;

    this.toastBack.clear();
    this.toastBack.fillStyle(0x071c3e, 0.70);
    this.toastBack.fillRoundedRect(220, 438, 520, 40, 19);
    this.toastBack.lineStyle(2, 0xffdc82, 0.72);
    this.toastBack.strokeRoundedRect(220, 438, 520, 40, 19);
    this.toastBack.lineStyle(1, 0xffffff, 0.30);
    this.toastBack.strokeRoundedRect(225, 443, 510, 30, 15);

    this.toastText.setText(message);
    this.toastHideTimer?.remove(false);
    this.tweens.killTweensOf([this.toastBack, this.toastText]);
    this.toastBack.setAlpha(0);
    this.toastText.setAlpha(0).setY(463);
    this.tweens.add({ targets: [this.toastBack, this.toastText], alpha: 1, duration: 130, ease: 'Sine.easeOut' });
    this.tweens.add({ targets: this.toastText, y: 458, duration: 180, ease: 'Back.easeOut' });
    this.toastHideTimer = this.time.delayedCall(holdMs, () => {
      if (!this.scene.isActive('WorldMapScene') || !this.toastBack || !this.toastText) return;
      this.tweens.add({ targets: [this.toastBack, this.toastText], alpha: 0, duration: 220, ease: 'Sine.easeIn' });
      this.toastHideTimer = undefined;
    });
  }
}
