import Phaser from 'phaser';
import type { EnemyKind, TowerKind } from '../game/types';
import { unlockAudio } from '../game/AudioManager';

const ENEMY_KEYS: EnemyKind[] = [
  'goblin', 'wolf', 'brute', 'bat', 'orc', 'shield', 'shaman', 'wasp', 'ogre',
  'spider', 'specter', 'troll', 'raider', 'gargoyle', 'warlock', 'golem', 'demonlord'
];

const TOWER_KEYS: TowerKind[] = ['archer', 'mage', 'barracks', 'artillery'];

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload(): void {
    this.load.setPath(import.meta.env.BASE_URL || '/');

    this.load.spritesheet('hero-knight', 'assets/sprites/hero_knight.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('soldier-blue', 'assets/sprites/soldier_blue.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('mercenary-green', 'assets/sprites/mercenary_green.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('projectiles', 'assets/sprites/projectiles.png', { frameWidth: 16, frameHeight: 16 });

    ENEMY_KEYS.forEach((kind) => {
      this.load.spritesheet(`enemy-${kind}`, `assets/sprites/enemy_${kind}.png`, { frameWidth: 32, frameHeight: 32 });
    });

    TOWER_KEYS.forEach((kind) => {
      this.load.image(`tower-${kind}`, `assets/sprites/tower_${kind}.png`);
    });

    this.load.image('ui-panel-parchment', 'assets/ui/panel_parchment.png');

    const audioMap: Record<string, string> = {
      sfx_click: 'click.wav',
      sfx_build: 'build.wav',
      sfx_upgrade: 'upgrade.wav',
      sfx_shoot: 'shoot.wav',
      sfx_hit: 'hit.wav',
      sfx_magic: 'magic.wav',
      sfx_explosion: 'explosion.wav',
      sfx_wave: 'wave.wav',
      sfx_win: 'win.wav',
      sfx_lose: 'lose.wav',
      bgm_battle: 'music_loop.wav',
    };

    Object.entries(audioMap).forEach(([key, file]) => {
      this.load.audio(key, [`assets/audio/${file}`]);
    });
  }

  create(): void {
    this.createAnimations();
    window.addEventListener('kingdom-seed:user-activated', () => unlockAudio(this), { once: true });
    this.input.once('pointerdown', () => unlockAudio(this));
    this.scene.start('MenuScene');
  }

  private createAnimations(): void {
    this.anims.create({ key: 'hero-idle', frames: this.anims.generateFrameNumbers('hero-knight', { start: 0, end: 3 }), frameRate: 5, repeat: -1 });
    this.anims.create({ key: 'soldier-idle', frames: this.anims.generateFrameNumbers('soldier-blue', { start: 0, end: 3 }), frameRate: 6, repeat: -1 });
    this.anims.create({ key: 'mercenary-idle', frames: this.anims.generateFrameNumbers('mercenary-green', { start: 0, end: 3 }), frameRate: 6, repeat: -1 });

    ENEMY_KEYS.forEach((kind) => {
      this.anims.create({
        key: `enemy-${kind}-walk`,
        frames: this.anims.generateFrameNumbers(`enemy-${kind}`, { start: 0, end: 3 }),
        frameRate: 6,
        repeat: -1,
      });
    });
  }
}
