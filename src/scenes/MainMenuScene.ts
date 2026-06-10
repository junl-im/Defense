import Phaser from 'phaser';
import type { User } from 'firebase/auth';
import { playMusic, playSfx } from '../game/AudioManager';
import { STAGE_LIST } from '../game/balance';
import { addCodeButton, addCodeLogo, addCodePanel, addCoverImage, addFloatingSparkles, addSceneVignette, addStatChip } from '../game/CodeUiKit';
import type { PlayerSave } from '../services/firebase';

export class MainMenuScene extends Phaser.Scene {
  private user!: User;
  private save!: PlayerSave;
  private isReady = false;

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

    this.drawBackground();
    this.createHeader();
    this.createCommanderPanel();
    this.createDefenseCommandPanel();
    this.createHeroShowcase();
    this.createBottomDock();

    this.time.delayedCall(0, () => {
      window.dispatchEvent(new CustomEvent('kingdom-seed:scene-ready', { detail: { scene: 'MainMenuScene', version: '1.1', at: Date.now() } }));
    });
  }

  private drawBackground(): void {
    addCoverImage(this, 'v1-main-menu-bg', 960, 540, 0);
    addSceneVignette(this, 1, 0.15);
    this.add.rectangle(480, 270, 960, 540, 0xffffff, 0.018).setDepth(2);
    addFloatingSparkles(this, 18, 6);
  }

  private createHeader(): void {
    addCodeLogo(this, 202, 74, 0.52);

    const topPanel = addCodePanel(this, { x: 662, y: 42, width: 486, height: 52, radius: 22, depth: 20, fill: 0xeff8ff, fillAlpha: 0.74, stroke: 0x6db4ff, strokeAlpha: 0.44 });
    topPanel.add(this.add.text(-214, -7, `환영합니다, ${this.save.nickname}`, {
      fontSize: '15px',
      color: '#24528f',
      fontStyle: 'bold',
      stroke: '#ffffff',
      strokeThickness: 3,
    }).setOrigin(0, 0.5));
    topPanel.add(this.add.text(-214, 12, '오늘도 왕국의 씨앗을 지켜주세요.', {
      fontSize: '10px',
      color: '#4f72a2',
      fontStyle: 'bold',
    }).setOrigin(0, 0.5));

    addCodeButton(this, { x: 850, y: 42, width: 84, height: 34, label: '월드맵', tone: 'blue', iconText: '🗺', fontSize: 12, depth: 23, onClick: () => this.goWorldMap() });
    addCodeButton(this, { x: 930, y: 42, width: 64, height: 34, label: '설정', tone: 'white', iconText: '⚙', fontSize: 11, depth: 23, onClick: () => this.ping('설정은 다음 패치에서 상세 연결합니다.') });
  }

  private createCommanderPanel(): void {
    const clearedCount = Object.values(this.save.clearedStages).filter((stage) => stage.bestStars > 0).length;
    const earnedStars = Object.values(this.save.clearedStages).reduce((sum, stage) => sum + (stage.bestStars || 0), 0);

    const panel = addCodePanel(this, { x: 164, y: 292, width: 270, height: 318, radius: 28, depth: 18, fill: 0xf6fbff, fillAlpha: 0.80, stroke: 0xe3bb54, strokeAlpha: 0.82, title: 'COMMANDER' });
    panel.add(this.add.text(0, -112, this.save.nickname, {
      fontSize: '20px',
      color: '#24528f',
      fontStyle: 'bold',
      stroke: '#ffffff',
      strokeThickness: 4,
    }).setOrigin(0.5));
    panel.add(this.add.text(0, -85, '수호자 프로필', {
      fontSize: '12px',
      color: '#5b76a3',
      fontStyle: 'bold',
    }).setOrigin(0.5));

    addStatChip(this, 164, 238, '보유 별', String(this.save.stars), 'gold', 24);
    addStatChip(this, 164, 279, '획득 별', String(earnedStars), 'gold', 24);
    addStatChip(this, 164, 320, '클리어', `${clearedCount}/${STAGE_LIST.length}`, 'blue', 24);

    this.addDecorImage('v1-tower-sanctuary', 76, 412, 108, 24);
    this.addDecorImage('v1-tower-cannon', 164, 415, 92, 24);
    this.addDecorImage('v1-tower-grove', 250, 414, 100, 24);

    panel.add(this.add.text(0, 116, '타워 연구와 영웅 성장으로\n스테이지를 돌파하세요.', {
      fontSize: '11px',
      color: '#476a9c',
      align: 'center',
      lineSpacing: 3,
      fontStyle: 'bold',
    }).setOrigin(0.5));
  }

  private createDefenseCommandPanel(): void {
    const panel = addCodePanel(this, { x: 654, y: 286, width: 456, height: 318, radius: 30, depth: 18, fill: 0xf8fcff, fillAlpha: 0.82, stroke: 0xe3bb54, strokeAlpha: 0.92, title: 'DEFENSE COMMAND' });
    panel.add(this.add.text(0, -108, '메인 메뉴', {
      fontSize: '24px',
      color: '#24528f',
      fontStyle: 'bold',
      stroke: '#ffffff',
      strokeThickness: 5,
    }).setOrigin(0.5));
    panel.add(this.add.text(0, -78, '배경은 이미지, 로고/버튼/패널은 코드 UI로 분리했습니다.', {
      fontSize: '11px',
      color: '#5b76a3',
      align: 'center',
      fontStyle: 'bold',
    }).setOrigin(0.5));

    this.addMenuCard(500, 266, '캠페인', '스테이지 선택', '🗺', 'blue', () => this.goWorldMap());
    this.addMenuCard(656, 266, '빠른 전투', '다음 전장 입장', '⚔', 'red', () => this.quickBattle());
    this.addMenuCard(812, 266, '영웅 전당', '파티 확인', '🛡', 'gold', () => this.goScene('HeroHallScene'));
    this.addMenuCard(500, 386, '연구소', '영구 업그레이드', '🔬', 'green', () => this.goScene('LabScene'));
    this.addMenuCard(656, 386, '임무', '목표와 보상', '📜', 'white', () => this.goScene('MissionBoardScene'));
    this.addMenuCard(812, 386, '제작소', '유물 제작', '💎', 'blue', () => this.goScene('ArtifactForgeScene'));
  }

  private addMenuCard(x: number, y: number, title: string, subtitle: string, icon: string, tone: 'gold' | 'blue' | 'white' | 'red' | 'green', onClick: () => void): void {
    const card = addCodePanel(this, { x, y, width: 136, height: 92, radius: 18, depth: 25, fill: 0xffffff, fillAlpha: 0.66, stroke: 0x8eb4da, strokeAlpha: 0.42 });
    card.add(this.add.text(0, -25, icon, { fontSize: '24px' }).setOrigin(0.5));
    card.add(this.add.text(0, 2, title, {
      fontSize: '15px',
      color: '#24528f',
      fontStyle: 'bold',
      stroke: '#ffffff',
      strokeThickness: 3,
    }).setOrigin(0.5));
    card.add(this.add.text(0, 23, subtitle, {
      fontSize: '10px',
      color: '#6681a8',
      fontStyle: 'bold',
    }).setOrigin(0.5));
    addCodeButton(this, { x, y: y + 53, width: 104, height: 30, label: '입장', tone, fontSize: 12, depth: 30, onClick });
  }

  private createHeroShowcase(): void {
    const shadow = this.add.ellipse(431, 482, 360, 44, 0x07142c, 0.26).setDepth(13);
    this.tweens.add({ targets: shadow, scaleX: 1.035, alpha: 0.34, duration: 1900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    this.addDecorImage('v1-hero-knight', 366, 421, 182, 14);
    this.addDecorImage('v1-hero-ranger', 444, 427, 164, 15);
    this.addDecorImage('v1-hero-mage', 520, 417, 178, 16);
    this.addDecorImage('v1-hero-druid', 285, 434, 150, 14);
    this.addDecorImage('v1-tower-crystal', 900, 370, 150, 12);
    this.addDecorImage('v1-monster-dragon', 79, 474, 74, 13, true);
    this.addDecorImage('v1-monster-goblin', 878, 482, 76, 13);
  }

  private createBottomDock(): void {
    const dock = addCodePanel(this, { x: 480, y: 508, width: 808, height: 54, radius: 24, depth: 35, fill: 0x143f7a, fillAlpha: 0.78, stroke: 0xe3bb54, strokeAlpha: 0.58 });
    dock.add(this.add.text(-376, 0, 'MENU', {
      fontSize: '11px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#153066',
      strokeThickness: 2,
    }).setOrigin(0, 0.5));

    const items = [
      { x: 178, label: '월드맵', icon: '🗺', tone: 'blue' as const, go: () => this.goWorldMap() },
      { x: 282, label: '영웅', icon: '🛡', tone: 'gold' as const, go: () => this.goScene('HeroHallScene') },
      { x: 386, label: '임무', icon: '📜', tone: 'white' as const, go: () => this.goScene('MissionBoardScene') },
      { x: 490, label: '연구', icon: '🔬', tone: 'green' as const, go: () => this.goScene('LabScene') },
      { x: 594, label: '제작', icon: '💎', tone: 'blue' as const, go: () => this.goScene('ArtifactForgeScene') },
      { x: 698, label: '도감', icon: '📘', tone: 'white' as const, go: () => this.goScene('CodexScene') },
    ];

    items.forEach((item) => addCodeButton(this, { x: item.x, y: 508, width: 88, height: 36, label: item.label, iconText: item.icon, tone: item.tone, fontSize: 11, depth: 42, onClick: item.go }));
    addCodeButton(this, { x: 842, y: 508, width: 150, height: 42, label: '전투 준비', iconText: '⚔', tone: 'red', fontSize: 16, depth: 43, onClick: () => this.goWorldMap() });
  }

  private addDecorImage(key: string, x: number, y: number, maxHeight: number, depth: number, flip = false): void {
    if (!this.textures.exists(key)) return;
    const texture = this.textures.get(key);
    const source = texture.getSourceImage() as { width: number; height: number };
    const image = this.add.image(x, y, key).setDepth(depth).setOrigin(0.5, 1);
    const scale = maxHeight / source.height;
    image.setScale(flip ? -scale : scale, scale);
    this.tweens.add({ targets: image, y: y - 4, duration: Phaser.Math.Between(1800, 2600), yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
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

  private ping(message: string): void {
    playSfx(this, 'sfx_click');
    const toast = addCodePanel(this, { x: 480, y: 126, width: 380, height: 38, radius: 18, depth: 80, fill: 0xf8fcff, fillAlpha: 0.88, stroke: 0x6db4ff, strokeAlpha: 0.52 });
    toast.add(this.add.text(0, 0, message, {
      fontSize: '12px',
      color: '#24528f',
      fontStyle: 'bold',
      align: 'center',
    }).setOrigin(0.5));
    toast.setAlpha(0).setY(112);
    this.tweens.add({ targets: toast, alpha: 1, y: 126, duration: 160, ease: 'Sine.easeOut', yoyo: true, hold: 1200, onComplete: () => toast.destroy() });
  }
}
