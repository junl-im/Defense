import Phaser from 'phaser';
import type { EnemyKind, TowerKind } from '../game/types';
import { unlockAudio } from '../game/AudioManager';

const ENEMY_KEYS: EnemyKind[] = [
  'goblin', 'wolf', 'brute', 'bat', 'orc', 'shield', 'shaman', 'wasp', 'ogre',
  'spider', 'specter', 'troll', 'raider', 'gargoyle', 'warlock', 'golem', 'demonlord'
];

const TOWER_KEYS: TowerKind[] = ['archer', 'mage', 'barracks', 'artillery'];
const TOWER_LEVELS = [1, 2, 3] as const;

type AnimSpec = {
  key: string;
  texture: string;
  start: number;
  end: number;
  frameRate: number;
  repeat: number;
};

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload(): void {
    this.load.setPath(import.meta.env.BASE_URL || '/');

    this.load.image('ui-title-bg', 'assets/ui/title_background.png');
    this.load.image('ui-title-logo', 'assets/ui/title_logo.png');
    this.load.image('ui-login-panel', 'assets/ui/panel_login_ornate.png');
    this.load.image('ui-status-plaque', 'assets/ui/status_plaque.png');
    this.load.image('ui-button-primary', 'assets/ui/button_primary.png');
    this.load.image('ui-button-blue', 'assets/ui/button_blue.png');
    this.load.image('ui-button-gold', 'assets/ui/button_gold.png');
    this.load.image('ui-button-red', 'assets/ui/button_red.png');
    this.load.image('ui-icon-anonymous', 'assets/ui/icon_anonymous.png');
    this.load.image('ui-icon-google', 'assets/ui/icon_google.png');
    this.load.image('ui-icon-email', 'assets/ui/icon_email.png');
    this.load.image('ui-icon-register', 'assets/ui/icon_register.png');
    this.load.image('ui-icon-shield', 'assets/ui/icon_shield.png');
    this.load.image('ui-icon-spark', 'assets/ui/icon_spark.png');
    this.load.spritesheet('ui-particles', 'assets/ui/particles_magic.png', { frameWidth: 32, frameHeight: 32 });

    this.load.image('ui-world-map-bg', 'assets/ui/world_map_painted.png');
    this.load.image('ui-stage-card-frame', 'assets/ui/stage_card_frame.png');
    this.load.image('ui-stage-card-locked', 'assets/ui/stage_card_locked.png');
    this.load.image('ui-panel-detail-large', 'assets/ui/panel_detail_large.png');
    this.load.image('ui-banner-worldmap', 'assets/ui/banner_worldmap.png');
    this.load.image('ui-icon-star-large', 'assets/ui/icon_star_large.png');
    this.load.image('ui-icon-lock', 'assets/ui/icon_lock.png');
    this.load.image('ui-hud-top-panel', 'assets/ui/hud_top_panel.png');
    this.load.image('ui-hud-bottom-panel', 'assets/ui/hud_bottom_panel.png');

    this.load.image('map-thumb-stage-001', 'assets/maps/map_stage_001.png');
    this.load.image('map-thumb-stage-002', 'assets/maps/map_stage_002.png');
    this.load.image('map-thumb-stage-003', 'assets/maps/map_stage_003.png');
    this.load.image('map-thumb-stage-004', 'assets/maps/map_stage_004.png');
    this.load.image('map-card-stage-001', 'assets/maps/stage_card_001.png');
    this.load.image('map-card-stage-002', 'assets/maps/stage_card_002.png');
    this.load.image('map-card-stage-003', 'assets/maps/stage_card_003.png');
    this.load.image('map-card-stage-004', 'assets/maps/stage_card_004.png');
    this.load.image('battle-bg-stage_001', 'assets/maps/battle_stage_001.png');
    this.load.image('battle-bg-stage_002', 'assets/maps/battle_stage_002.png');
    this.load.image('battle-bg-stage_003', 'assets/maps/battle_stage_003.png');
    this.load.image('battle-bg-stage_004', 'assets/maps/battle_stage_004.png');

    this.load.spritesheet('hero-knight', 'assets/sprites/hero_knight.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('soldier-blue', 'assets/sprites/soldier_blue.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('mercenary-green', 'assets/sprites/mercenary_green.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('projectiles', 'assets/sprites/projectiles.png', { frameWidth: 16, frameHeight: 16 });
    this.load.spritesheet('fx-build-dust', 'assets/effects/fx_build_dust.png', { frameWidth: 64, frameHeight: 64 });
    this.load.spritesheet('fx-upgrade-burst', 'assets/effects/fx_upgrade_burst.png', { frameWidth: 64, frameHeight: 64 });
    this.load.spritesheet('fx-death-poof', 'assets/effects/fx_death_poof.png', { frameWidth: 64, frameHeight: 64 });
    this.load.spritesheet('fx-explosion-burst', 'assets/effects/fx_explosion_burst.png', { frameWidth: 64, frameHeight: 64 });

    ENEMY_KEYS.forEach((kind) => {
      this.load.spritesheet(`enemy-${kind}`, `assets/sprites/enemy_${kind}.png`, { frameWidth: 32, frameHeight: 32 });
    });

    TOWER_KEYS.forEach((kind) => {
      this.load.image(`tower-${kind}`, `assets/sprites/tower_${kind}.png`);
      TOWER_LEVELS.forEach((level) => {
        this.load.image(`tower-${kind}-lv${level}`, `assets/sprites/tower_${kind}_lv${level}.png`);
      });
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
      bgm_world: 'bgm_world.wav',
      bgm_battle: 'bgm_battle.wav',
      bgm_boss: 'bgm_boss.wav',
      bgm_battle_old: 'music_loop.wav',
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
    const anims: AnimSpec[] = [
      { key: 'hero-idle', texture: 'hero-knight', start: 0, end: 3, frameRate: 5, repeat: -1 },
      { key: 'hero-move', texture: 'hero-knight', start: 4, end: 7, frameRate: 9, repeat: -1 },
      { key: 'hero-attack', texture: 'hero-knight', start: 8, end: 11, frameRate: 14, repeat: 0 },
      { key: 'soldier-idle', texture: 'soldier-blue', start: 0, end: 3, frameRate: 6, repeat: -1 },
      { key: 'soldier-move', texture: 'soldier-blue', start: 4, end: 7, frameRate: 9, repeat: -1 },
      { key: 'soldier-attack', texture: 'soldier-blue', start: 8, end: 11, frameRate: 13, repeat: 0 },
      { key: 'mercenary-idle', texture: 'mercenary-green', start: 0, end: 3, frameRate: 6, repeat: -1 },
      { key: 'mercenary-move', texture: 'mercenary-green', start: 4, end: 7, frameRate: 9, repeat: -1 },
      { key: 'mercenary-attack', texture: 'mercenary-green', start: 8, end: 11, frameRate: 13, repeat: 0 },
      { key: 'ui-particle-glow', texture: 'ui-particles', start: 0, end: 3, frameRate: 4, repeat: -1 },
      { key: 'fx-build-dust-play', texture: 'fx-build-dust', start: 0, end: 5, frameRate: 18, repeat: 0 },
      { key: 'fx-upgrade-burst-play', texture: 'fx-upgrade-burst', start: 0, end: 7, frameRate: 20, repeat: 0 },
      { key: 'fx-death-poof-play', texture: 'fx-death-poof', start: 0, end: 5, frameRate: 18, repeat: 0 },
      { key: 'fx-explosion-burst-play', texture: 'fx-explosion-burst', start: 0, end: 6, frameRate: 20, repeat: 0 },
    ];

    anims.forEach((spec) => this.makeAnim(spec));

    ENEMY_KEYS.forEach((kind) => {
      this.makeAnim({
        key: `enemy-${kind}-walk`,
        texture: `enemy-${kind}`,
        start: 0,
        end: 3,
        frameRate: 6,
        repeat: -1,
      });
    });
  }

  private makeAnim(spec: AnimSpec): void {
    if (this.anims.exists(spec.key) || !this.textures.exists(spec.texture)) return;
    this.anims.create({
      key: spec.key,
      frames: this.anims.generateFrameNumbers(spec.texture, { start: spec.start, end: spec.end }),
      frameRate: spec.frameRate,
      repeat: spec.repeat,
    });
  }
}
