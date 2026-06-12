import Phaser from 'phaser';
import type { User } from 'firebase/auth';
import type { PlayerSave } from '../services/localSave';
import { getHeroProfiles, getSelectedHero, setSelectedHero, type HeroId, type HeroProfile } from '../game/HeroLoadout';
import { playMusic, playSfx } from '../game/AudioManager';
import { startRegisteredScene } from "./SceneRegistry";

export class HeroHallScene extends Phaser.Scene {
  private user!: User;
  private save!: PlayerSave;
  private selectedHero = getSelectedHero();
  private statusText?: Phaser.GameObjects.Text;

  constructor() { super('HeroHallScene'); }

  init(data: { user: User; save: PlayerSave }): void {
    this.user = data.user;
    this.save = data.save;
    this.selectedHero = getSelectedHero();
  }

  create(): void {
    playMusic(this, 'bgm_world', 0.2);
    this.drawBackground();
    this.drawHeader();
    this.drawHeroCards();
    this.drawFooter();
  }

  private drawBackground(): void {
    if (this.textures.exists('ui-hero-hall-bg')) this.add.image(480, 270, 'ui-hero-hall-bg').setDisplaySize(960, 540);
    else this.add.rectangle(480, 270, 960, 540, 0x1b1824, 1);
    this.add.rectangle(480, 270, 960, 540, 0x000000, 0.18).setDepth(1);
  }

  private drawHeader(): void {
    this.add.text(480, 42, '영웅 전당', {
      fontSize: '44px', color: '#fff1bf', fontStyle: 'bold', stroke: '#2b1208', strokeThickness: 7,
      shadow: { offsetX: 0, offsetY: 4, color: '#000000', blur: 6, fill: true },
    }).setOrigin(0.5).setDepth(5);
    this.statusText = this.add.text(480, 86, `선택 중: ${this.selectedHero.name} · ${this.selectedHero.role}`, {
      fontSize: '18px', color: '#d9f2ff', fontStyle: 'bold', stroke: '#07131a', strokeThickness: 4,
    }).setOrigin(0.5).setDepth(5);
  }

  private drawHeroCards(): void {
    const heroes = getHeroProfiles();
    heroes.forEach((hero, index) => this.drawHeroCard(hero, 220 + index * 260, 292));
  }

  private drawHeroCard(hero: HeroProfile, x: number, y: number): void {
    const selected = this.selectedHero.id === hero.id;
    const root = this.add.container(x, y).setDepth(10);
    const bg = this.textures.exists('ui-hero-card-v28')
      ? this.add.image(0, 0, 'ui-hero-card-v28').setDisplaySize(232, 316)
      : this.add.rectangle(0, 0, 232, 316, 0x4e2f1b, 0.94).setStrokeStyle(4, 0xffd679, 0.65);
    const portraitKey = hero.id === 'leon' ? 'portrait-knight' : hero.id === 'aria' ? 'portrait-ranger' : 'portrait-mage';
    const portrait = this.textures.exists(portraitKey)
      ? this.add.image(0, -72, portraitKey).setDisplaySize(150, 188)
      : this.add.circle(0, -72, 62, hero.color, 1);
    const name = this.add.text(0, 48, `${hero.name}`, { fontSize: '27px', color: '#fff1bf', fontStyle: 'bold', stroke: '#210b04', strokeThickness: 5 }).setOrigin(0.5);
    const title = this.add.text(0, 77, hero.title, { fontSize: '15px', color: '#cfefff', fontStyle: 'bold', stroke: '#061219', strokeThickness: 3 }).setOrigin(0.5);
    const perks = this.add.text(-88, 105, hero.perks.map((perk) => `• ${perk}`).join('\n'), {
      fontSize: '13px', color: '#fff2c7', lineSpacing: 3, wordWrap: { width: 176 }, fontStyle: 'bold', stroke: '#140704', strokeThickness: 3,
    }).setOrigin(0, 0);
    const selectBg = this.add.rectangle(0, 157, 150, 36, selected ? 0x2f8f55 : 0x7d3b22, 0.92).setStrokeStyle(2, 0xffe29a, 0.58);
    const selectText = this.add.text(0, 157, selected ? '장착 중' : '선택', { fontSize: '17px', color: '#fff7d8', fontStyle: 'bold', stroke: '#190804', strokeThickness: 3 }).setOrigin(0.5);
    const hit = this.add.rectangle(0, 0, 232, 316, 0xffffff, 0.001).setInteractive({ useHandCursor: true });
    root.add([bg, portrait, name, title, perks, selectBg, selectText, hit]);
    if (selected) {
      root.add(this.add.rectangle(0, 0, 242, 326, 0xffffff, 0).setStrokeStyle(4, 0xfff1aa, 0.72));
    }
    hit.on('pointerdown', () => {
      playSfx(this, 'sfx_click');
      setSelectedHero(hero.id as HeroId);
      this.selectedHero = hero;
      this.statusText?.setText(`선택 중: ${hero.name} · ${hero.role}`);
      this.scene.restart({ user: this.user, save: this.save });
    });
    hit.on('pointerover', () => this.tweens.add({ targets: root, scale: 1.035, duration: 110 }));
    hit.on('pointerout', () => this.tweens.add({ targets: root, scale: 1, duration: 110 }));
  }

  private drawFooter(): void {
    this.makeButton(132, 504, '월드맵', () => void startRegisteredScene(this, 'WorldMapScene', { user: this.user, save: this.save }), 164);
    this.makeButton(480, 504, '전투에는 선택 영웅 보너스가 적용됩니다', () => undefined, 360, false);
    this.makeButton(830, 504, '임무 게시판', () => void startRegisteredScene(this, 'MissionBoardScene', { user: this.user, save: this.save }), 188);
  }

  private makeButton(x: number, y: number, label: string, cb: () => void, width = 180, active = true): Phaser.GameObjects.Container {
    const root = this.add.container(x, y).setDepth(20);
    const bg = this.textures.exists('ui-button-elite')
      ? this.add.image(0, 0, 'ui-button-elite').setDisplaySize(width, 44)
      : this.add.rectangle(0, 0, width, 44, 0x7b3422, 0.95).setStrokeStyle(3, 0xffd67a, 0.45);
    const text = this.add.text(0, 0, label, { fontSize: active ? '18px' : '15px', color: '#fff7d8', fontStyle: 'bold', stroke: '#2a1208', strokeThickness: 4 }).setOrigin(0.5);
    root.add([bg, text]);
    if (active) {
      const hit = this.add.rectangle(0, 0, width, 44, 0xffffff, 0.001).setInteractive({ useHandCursor: true });
      root.add(hit);
      hit.on('pointerdown', () => { playSfx(this, 'sfx_click'); cb(); });
      hit.on('pointerover', () => this.tweens.add({ targets: root, scale: 1.04, duration: 90 }));
      hit.on('pointerout', () => this.tweens.add({ targets: root, scale: 1, duration: 90 }));
    }
    return root;
  }
}
