import Phaser from 'phaser';
import type { User } from 'firebase/auth';
import type { PlayerSave } from '../services/localSave';
import { claimMissionReward, consumeRewardChest, getMissionStates, getRewardChestCount, type MissionId } from '../game/MissionBoard';
import { playMusic, playSfx } from '../game/AudioManager';
import { startRegisteredScene } from "./SceneRegistry";
import { installSceneReadabilityPass, improveReadableTextTree, readableFontSize, readableHitSize } from "../game/MobileReadableUi";
import { installSceneGraphicFallback } from "../game/PrestigeGraphicFallback";

export class MissionBoardScene extends Phaser.Scene {
  private user!: User;
  private save!: PlayerSave;
  private chestText?: Phaser.GameObjects.Text;

  constructor() { super('MissionBoardScene'); }

  init(data: { user: User; save: PlayerSave }): void {
    this.user = data.user;
    this.save = data.save;
  }

  create(): void {
    playMusic(this, 'bgm_world', 0.2);
    this.drawBackground();
    installSceneGraphicFallback(this, "mission", 1.2);
    this.drawHeader();
    this.drawMissions();
    this.drawChestPanel();
    this.drawFooter();
    installSceneReadabilityPass(this, { min: 15, strokeThickness: 3 });
  }

  private drawBackground(): void {
    if (this.textures.exists('ui-mission-board-bg')) this.add.image(480, 270, 'ui-mission-board-bg').setDisplaySize(960, 540);
    else this.add.rectangle(480, 270, 960, 540, 0x2f2118, 1);
    this.add.rectangle(480, 270, 960, 540, 0x000000, 0.12).setDepth(1);
  }

  private drawHeader(): void {
    this.add.text(480, 45, '왕국 임무 게시판', {
      fontSize: '42px', color: '#fff1bf', fontStyle: 'bold', stroke: '#2b1208', strokeThickness: 7,
      shadow: { offsetX: 0, offsetY: 4, color: '#000000', blur: 6, fill: true },
    }).setOrigin(0.5).setDepth(5);
    this.add.text(480, 82, '일일/주간 목표를 달성하고 보급 상자를 획득하세요', {
      fontSize: readableFontSize(17, 17, 25), color: '#d8f3ff', fontStyle: 'bold', stroke: '#07131a', strokeThickness: 4,
    }).setOrigin(0.5).setDepth(5);
  }

  private drawMissions(): void {
    const states = getMissionStates(this.save);
    states.forEach((mission, i) => {
      const x = 270 + (i % 2) * 340;
      const y = 152 + Math.floor(i / 2) * 98;
      this.drawMissionCard(x, y, mission);
    });
  }

  private drawMissionCard(x: number, y: number, mission: ReturnType<typeof getMissionStates>[number]): void {
    const root = this.add.container(x, y).setDepth(10);
    const bg = this.textures.exists('ui-mission-card-v28')
      ? this.add.image(0, 0, 'ui-mission-card-v28').setDisplaySize(312, 86)
      : this.add.rectangle(0, 0, 312, 86, 0xbe9051, 0.92).setStrokeStyle(3, 0x5f2f16, 0.45);
    const title = this.add.text(-136, -27, mission.title, { fontSize: readableFontSize(18, 18, 26), color: '#2b160a', fontStyle: 'bold' }).setOrigin(0, 0.5);
    const sub = this.add.text(-136, -5, mission.subtitle, { fontSize: readableFontSize(13, 15, 21), color: '#4a2915', fontStyle: 'bold', wordWrap: { width: 210 } }).setOrigin(0, 0.5);
    const progress = this.add.text(-136, 24, `${mission.progress}/${mission.target}  ·  ${mission.reward}`, { fontSize: readableFontSize(13, 15, 21), color: '#fff7d8', fontStyle: 'bold', stroke: '#1e0c04', strokeThickness: 3 }).setOrigin(0, 0.5);
    const buttonColor = mission.claimed ? 0x353535 : mission.completed ? 0x2f8f55 : 0x6b4b2a;
    const btn = this.add.rectangle(112, 18, 82, 32, buttonColor, 0.95).setStrokeStyle(2, 0xffe29a, 0.5);
    const btnText = this.add.text(112, 18, mission.claimed ? '완료' : mission.completed ? '수령' : '진행중', { fontSize: readableFontSize(13, 15, 21), color: '#fff7d8', fontStyle: 'bold', stroke: '#1b0703', strokeThickness: 3 }).setOrigin(0.5);
    root.add([bg, title, sub, progress, btn, btnText]);
    improveReadableTextTree(root, { min: 15, strokeThickness: 3 });
    if (mission.completed && !mission.claimed) {
      const hit = this.add.rectangle(112, 18, 90, 42, 0xffffff, 0.001).setInteractive({ useHandCursor: true });
      root.add(hit);
      hit.on('pointerdown', () => {
        playSfx(this, 'sfx_upgrade');
        if (claimMissionReward(mission.id as MissionId, this.save)) this.toast(`${mission.reward} 획득!`);
        this.scene.restart({ user: this.user, save: this.save });
      });
    }
  }

  private drawChestPanel(): void {
    const root = this.add.container(800, 316).setDepth(11);
    const bg = this.textures.exists('ui-glass-panel-v28')
      ? this.add.image(0, 0, 'ui-glass-panel-v28').setDisplaySize(220, 206)
      : this.add.rectangle(0, 0, 220, 206, 0x3a2518, 0.94).setStrokeStyle(3, 0xffd67a, 0.5);
    const chest = this.textures.exists('icon-reward-chest') ? this.add.image(0, -42, 'icon-reward-chest').setDisplaySize(86, 86) : this.add.circle(0, -42, 42, 0xe0a13e, 1);
    this.chestText = this.add.text(0, 22, `보급 상자 x${getRewardChestCount()}`, { fontSize: readableFontSize(19, 19, 27), color: '#fff1bf', fontStyle: 'bold', stroke: '#2b1208', strokeThickness: 5 }).setOrigin(0.5);
    const btn = this.add.rectangle(0, 75, 144, 38, 0x8d3a25, 0.95).setStrokeStyle(2, 0xffe29a, 0.6);
    const text = this.add.text(0, 75, '상자 열기', { fontSize: readableFontSize(17, 17, 25), color: '#fff7d8', fontStyle: 'bold', stroke: '#1b0703', strokeThickness: 3 }).setOrigin(0.5);
    const hit = this.add.rectangle(0, 75, 154, 46, 0xffffff, 0.001).setInteractive({ useHandCursor: true });
    root.add([bg, chest, this.chestText, btn, text, hit]);
    improveReadableTextTree(root, { min: 15, strokeThickness: 3 });
    hit.on('pointerdown', () => {
      playSfx(this, 'sfx_upgrade');
      if (consumeRewardChest()) {
        this.toast('룬 조각 +1 / 골드 부적 획득!');
        this.chestText?.setText(`보급 상자 x${getRewardChestCount()}`);
      } else this.toast('열 수 있는 보급 상자가 없습니다.');
    });
  }

  private drawFooter(): void {
    this.makeButton(126, 504, '월드맵', () => void startRegisteredScene(this, 'WorldMapScene', { user: this.user, save: this.save }), 164);
    this.makeButton(308, 504, '영웅 전당', () => void startRegisteredScene(this, 'HeroHallScene', { user: this.user, save: this.save }), 172);
  }

  private makeButton(x: number, y: number, label: string, cb: () => void, width = 180): Phaser.GameObjects.Container {
    const root = this.add.container(x, y).setDepth(20);
    const bg = this.textures.exists('ui-button-elite')
      ? this.add.image(0, 0, 'ui-button-elite').setDisplaySize(width, 44)
      : this.add.rectangle(0, 0, width, 44, 0x7b3422, 0.95).setStrokeStyle(3, 0xffd67a, 0.45);
    const text = this.add.text(0, 0, label, { fontSize: readableFontSize(18, 18, 26), color: '#fff7d8', fontStyle: 'bold', stroke: '#2a1208', strokeThickness: 4 }).setOrigin(0.5);
    const hit = this.add.rectangle(0, 0, readableHitSize(width, 44).width, readableHitSize(width, 44).height, 0xffffff, 0.001).setInteractive({ useHandCursor: true });
    root.add([bg, text, hit]);
    hit.on('pointerdown', () => { playSfx(this, 'sfx_click'); cb(); });
    return root;
  }

  private toast(text: string): void {
    const label = this.add.text(480, 456, text, { fontSize: readableFontSize(22, 21, 30), color: '#fff1bf', fontStyle: 'bold', stroke: '#2b1208', strokeThickness: 6 }).setOrigin(0.5).setDepth(80);
    this.tweens.add({ targets: label, y: 432, alpha: 0, duration: 1600, ease: 'Sine.easeIn', onComplete: () => label.destroy() });
  }
}
