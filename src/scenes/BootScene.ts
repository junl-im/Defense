import Phaser from 'phaser';
import type { EnemyKind, TowerKind } from '../game/types';
import { unlockAudio } from '../game/AudioManager';

const ENEMY_KEYS: EnemyKind[] = [
  'goblin', 'wolf', 'brute', 'bat', 'orc', 'shield', 'shaman', 'wasp', 'ogre',
  'spider', 'specter', 'troll', 'raider', 'gargoyle', 'warlock', 'golem', 'demonlord',
  'cultist', 'assassin', 'wyvern', 'necromancer', 'abomination',
  'fireImp', 'hellhound', 'obsidianKnight', 'phoenix', 'dragon',
  'voidling', 'voidPriest', 'nightmare', 'titan'
];

const TOWER_KEYS: TowerKind[] = ['archer', 'mage', 'barracks', 'artillery'];
const TOWER_LEVELS = [1, 2, 3] as const;
const TOWER_MASTERIES = [
  'archer_longbow', 'archer_sniper', 'mage_arcane', 'mage_hex',
  'barracks_paladin', 'barracks_assault', 'artillery_mortar', 'artillery_shock'
] as const;

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

    // v1.3+ screens use premium baked art compositions,
    // with transparent code hit-zones layered above for interaction.
    this.load.image('v1-login-refined', 'assets/backgrounds/login_screen_v1_6.png');
    this.load.image('v1-login-splash', 'assets/backgrounds/login_splash_v1_3.png');
    this.load.image('v1-login-bg', 'assets/backgrounds/login_background_v1_2.png');
    this.load.image('v1-main-menu-splash', 'assets/backgrounds/main_menu_splash_v1_4.png');
    this.load.image('v1-main-menu-bg', 'assets/backgrounds/main_menu_background_v1_2.png');
    this.load.image('v1-worldmap-splash', 'assets/backgrounds/worldmap_splash_v1_5.png');
    this.load.image('v1-worldmap-bg', 'assets/backgrounds/worldmap_background_v1_2.png');
    ['hero_knight','hero_ranger','hero_mage','hero_guardian','hero_druid','tower_crystal','tower_sanctuary','tower_cannon','tower_grove','monster_goblin','monster_orc','monster_wolf','monster_skeleton','monster_dragon'].forEach((asset) => {
      this.load.image(`v1-${asset.replace(/_/g, '-')}`, `assets/v1_2/decor/${asset}_v1_2.png`);
    });

    this.load.image('ui-title-logo-compact-v48', 'assets/ui/title_logo_compact_v48.png');
    this.load.image('ui-login-panel-compact-v48', 'assets/ui/login_panel_compact_v48.png');
    this.load.image('ui-button-compact-gold-v48', 'assets/ui/button_compact_gold_v48.png');
    this.load.image('ui-button-compact-blue-v48', 'assets/ui/button_compact_blue_v48.png');
    this.load.image('ui-button-compact-red-v48', 'assets/ui/button_compact_red_v48.png');
    this.load.image('ui-button-compact-white-v48', 'assets/ui/button_compact_white_v48.png');
    this.load.image('ui-footer-strip-compact-v48', 'assets/ui/footer_strip_compact_v48.png');
    this.load.image('ui-top-chip-compact-v48', 'assets/ui/top_chip_compact_v48.png');
    this.load.image('ui-title-ornaments-v48', 'assets/ui/title_side_ornaments_v48.png');
    this.load.spritesheet('fx-compact-shimmer-v48', 'assets/effects/compact_shimmer_v48.png', { frameWidth: 32, frameHeight: 32 });
    this.load.image('ui-title-logo-boutique-v49', 'assets/ui/title_logo_boutique_v49.png');
    this.load.image('ui-login-panel-boutique-v49', 'assets/ui/login_panel_boutique_v49.png');
    this.load.image('ui-button-boutique-gold-v49', 'assets/ui/button_boutique_gold_v49.png');
    this.load.image('ui-button-boutique-blue-v49', 'assets/ui/button_boutique_blue_v49.png');
    this.load.image('ui-button-boutique-red-v49', 'assets/ui/button_boutique_red_v49.png');
    this.load.image('ui-button-boutique-white-v49', 'assets/ui/button_boutique_white_v49.png');
    this.load.image('ui-footer-strip-boutique-v49', 'assets/ui/footer_strip_boutique_v49.png');
    this.load.image('ui-top-chip-boutique-v49', 'assets/ui/top_chip_boutique_v49.png');
    this.load.image('ui-title-ornaments-boutique-v49', 'assets/ui/title_ornaments_boutique_v49.png');
    this.load.image('ui-jewel-divider-boutique-v49', 'assets/ui/jewel_divider_boutique_v49.png');
    this.load.spritesheet('fx-boutique-shimmer-v49', 'assets/effects/boutique_shimmer_v49.png', { frameWidth: 28, frameHeight: 28 });


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

    this.load.image('ui-panel-premium-v43', 'assets/ui/panel_premium_v43.png');
    this.load.image('ui-modal-frame-v43', 'assets/ui/modal_frame_v43.png');
    this.load.image('ui-button-gold-v43', 'assets/ui/button_gold_v43.png');
    this.load.image('ui-button-blue-v43', 'assets/ui/button_blue_v43.png');
    this.load.image('ui-stage-card-frame-v43', 'assets/ui/stage_card_frame_v43.png');
    this.load.image('ui-world-map-bg-v43', 'assets/maps/worldmap_premium_v43.png');
    this.load.image('ui-fx-spell-burst-v43', 'assets/effects/fx_spell_burst_v43.png');
    this.load.image('ui-fx-reward-glimmer-v43', 'assets/effects/fx_reward_glimmer_v43.png');
    this.load.image('ui-fx-tower-upgrade-v43', 'assets/effects/fx_tower_upgrade_v43.png');


    this.load.image('ui-world-map-bg', 'assets/ui/world_map_painted.png');
    this.load.image('ui-stage-card-frame', 'assets/ui/stage_card_frame.png');
    this.load.image('ui-stage-card-locked', 'assets/ui/stage_card_locked.png');
    this.load.image('ui-panel-detail-large', 'assets/ui/panel_detail_large.png');
    this.load.image('ui-banner-worldmap', 'assets/ui/banner_worldmap.png');
    this.load.image('ui-icon-star-large', 'assets/ui/icon_star_large.png');
    this.load.image('ui-icon-lock', 'assets/ui/icon_lock.png');
    this.load.image('ui-hud-top-panel', 'assets/ui/hud_top_panel.png');
    this.load.image('ui-hud-bottom-panel', 'assets/ui/hud_bottom_panel.png');
    this.load.image('ui-world-map-bg-v27', 'assets/ui/world_map_premium_v27.png');
    this.load.image('ui-panel-obsidian', 'assets/ui/panel_obsidian_gold.png');
    this.load.image('ui-button-elite', 'assets/ui/button_elite.png');
    this.load.image('ui-wave-intel-frame-v31', 'assets/ui/wave_intel_frame_v31.png');
    this.load.image('ui-boss-cutin-frame-v31', 'assets/ui/boss_cutin_frame_v31.png');
    this.load.image('ui-boss-sigil-v31', 'assets/ui/boss_warning_sigil_v31.png');
    this.load.image('ui-tower-card-premium', 'assets/ui/tower_card_premium.png');
    this.load.image('ui-master-badge', 'assets/ui/mastery_badge.png');
    this.load.image('ui-world-map-bg-v28', 'assets/ui/world_map_premium_v28.png');
    this.load.image('ui-world-map-bg-v29', 'assets/ui/world_map_premium_v28.png');
    this.load.image('ui-hero-hall-bg', 'assets/ui/hero_hall_bg.png');
    this.load.image('ui-mission-board-bg', 'assets/ui/mission_board_bg.png');
    this.load.image('ui-glass-panel-v28', 'assets/ui/ui-glass-panel-v28.png');
    this.load.image('ui-hero-card-v28', 'assets/ui/ui-hero-card-v28.png');
    this.load.image('ui-mission-card-v28', 'assets/ui/ui-mission-card-v28.png');
    this.load.image('ui-reward-chest-v28', 'assets/ui/ui-reward-chest-v28.png');
    this.load.image('ui-reward-panel-v35', 'assets/ui/reward_panel_v35.png');
    this.load.image('ui-reward-chest-v35', 'assets/ui/reward_chest_v35.png');
    this.load.image('ui-objective-ribbon-v35', 'assets/ui/objective_ribbon_v35.png');
    this.load.image('ui-medal-bronze-v35', 'assets/ui/medal_bronze_v35.png');
    this.load.image('ui-medal-silver-v35', 'assets/ui/medal_silver_v35.png');
    this.load.image('ui-medal-gold-v35', 'assets/ui/medal_gold_v35.png');
    this.load.image('ui-medal-legend-v35', 'assets/ui/medal_legend_v35.png');

    this.load.image('v1-combat-top-hud', 'assets/ui/v1_6/combat_top_hud_v1_6.png');
    this.load.image('v1-combat-bottom-dock', 'assets/ui/v1_6/combat_bottom_dock_v1_6.png');
    this.load.image('v1-tower-build-menu', 'assets/ui/v1_6/tower_build_menu_v1_6.png');
    this.load.image('v1-tower-build-card', 'assets/ui/v1_6/tower_build_card_v1_6.png');
    this.load.image('v1-tower-command-panel', 'assets/ui/v1_6/tower_command_panel_v1_6.png');
    this.load.image('v1-button-blue', 'assets/ui/v1_6/button_blue_v1_6.png');
    this.load.image('v1-button-gold', 'assets/ui/v1_6/button_gold_v1_6.png');
    this.load.image('v1-button-red', 'assets/ui/v1_6/button_red_v1_6.png');
    this.load.image('v1-button-dark', 'assets/ui/v1_6/button_dark_v1_6.png');
    this.load.image('v1-button-green', 'assets/ui/v1_6/button_green_v1_6.png');

    this.load.image('ui-battle-loading-v42', 'assets/ui/battle_loading_frame_v42.png');
    this.load.image('ui-loading-crest-v42', 'assets/ui/loading_crest_v42.png');
    this.load.image('ui-tower-panel-v42', 'assets/ui/tower_panel_v42.png');
    this.load.image('ui-reward-stage-panel-v42', 'assets/ui/reward_stage_panel_v42.png');
    this.load.image('ui-button-action-v42', 'assets/ui/button_action_v42.png');
    this.load.image('ui-button-blue-v42', 'assets/ui/button_blue_v42.png');
    this.load.image('ui-button-danger-v42', 'assets/ui/button_danger_v42.png');
    this.load.image('ui-reward-chest-glow-v42', 'assets/ui/reward_chest_glow_v42.png');
    this.load.image('ui-tower-action-icons-v42', 'assets/ui/tower_action_icons_v42.png');
    this.load.image('fx-click-burst-v42', 'assets/effects/fx_click_burst_v42.png');
    this.load.image('ui-forge-bg-v36', 'assets/ui/forge_bg_v36.png');
    this.load.image('ui-forge-result-panel-v36', 'assets/ui/forge_result_panel_v36.png');
    this.load.image('ui-forge-detail-panel-v36', 'assets/ui/forge_detail_panel_v36.png');
    this.load.image('ui-forge-resource-panel-v36', 'assets/ui/forge_resource_panel_v36.png');
    this.load.image('ui-chest-wood-v36', 'assets/ui/chest_wood_v36.png');
    this.load.image('ui-chest-iron-v36', 'assets/ui/chest_iron_v36.png');
    this.load.image('ui-chest-royal-v36', 'assets/ui/chest_royal_v36.png');
    this.load.image('ui-chest-mythic-v36', 'assets/ui/chest_mythic_v36.png');
    ['oakLongbow','arcaneCore','captainsBanner','thunderPowder','merchantLedger','sunstoneAmulet','hexedHourglass','royalBulwark','shadowDagger','dragonScale','voidPrism','kingsCrown'].forEach((artifact) => {
      this.load.image(`ui-artifact-${artifact}-v36`, `assets/ui/artifact_${artifact}_v36.png`);
    });
    this.load.image('portrait-knight', 'assets/ui/portrait_knight.png');
    this.load.image('portrait-ranger', 'assets/ui/portrait_ranger.png');
    this.load.image('portrait-mage', 'assets/ui/portrait_mage.png');
    this.load.image('icon-hero-knight', 'assets/icons/icon_hero_knight.png');
    this.load.image('icon-hero-ranger', 'assets/icons/icon_hero_ranger.png');
    this.load.image('icon-hero-mage', 'assets/icons/icon_hero_mage.png');
    this.load.image('icon-reward-chest', 'assets/icons/icon_reward_chest.png');

    this.load.image('map-thumb-stage-001', 'assets/maps/map_stage_001.png');
    this.load.image('map-thumb-stage-002', 'assets/maps/map_stage_002.png');
    this.load.image('map-thumb-stage-003', 'assets/maps/map_stage_003.png');
    this.load.image('map-thumb-stage-004', 'assets/maps/map_stage_004.png');
    this.load.image('map-thumb-stage-005', 'assets/maps/map_stage_005.png');
    this.load.image('map-thumb-stage-006', 'assets/maps/map_stage_006.png');
    this.load.image('map-thumb-stage-007', 'assets/maps/map_stage_007.png');
    this.load.image('map-thumb-stage-008', 'assets/maps/map_stage_008.png');
    this.load.image('map-card-stage-001', 'assets/maps/stage_card_001.png');
    this.load.image('map-card-stage-002', 'assets/maps/stage_card_002.png');
    this.load.image('map-card-stage-003', 'assets/maps/stage_card_003.png');
    this.load.image('map-card-stage-004', 'assets/maps/stage_card_004.png');
    this.load.image('map-card-stage-005', 'assets/maps/stage_card_005.png');
    this.load.image('map-card-stage-006', 'assets/maps/stage_card_006.png');
    this.load.image('map-card-stage-007', 'assets/maps/stage_card_007.png');
    this.load.image('map-card-stage-008', 'assets/maps/stage_card_008.png');
    this.load.image('battle-bg-stage_001', 'assets/maps/battle_stage_001.png');
    this.load.image('battle-bg-stage_002', 'assets/maps/battle_stage_002.png');
    this.load.image('battle-bg-stage_003', 'assets/maps/battle_stage_003.png');
    this.load.image('battle-bg-stage_004', 'assets/maps/battle_stage_004.png');
    this.load.image('battle-bg-stage_005', 'assets/maps/battle_stage_005.png');
    this.load.image('battle-bg-stage_006', 'assets/maps/battle_stage_006.png');
    this.load.image('battle-bg-stage_007', 'assets/maps/battle_stage_007.png');
    this.load.image('battle-bg-stage_008', 'assets/maps/battle_stage_008.png');

    this.load.spritesheet('hero-knight', 'assets/sprites/hero_knight.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('soldier-blue', 'assets/sprites/soldier_blue.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('mercenary-green', 'assets/sprites/mercenary_green.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('projectiles', 'assets/sprites/projectiles.png', { frameWidth: 16, frameHeight: 16 });
    this.load.spritesheet('fx-build-dust', 'assets/effects/fx_build_dust.png', { frameWidth: 64, frameHeight: 64 });
    this.load.spritesheet('fx-upgrade-burst', 'assets/effects/fx_upgrade_burst.png', { frameWidth: 64, frameHeight: 64 });
    this.load.spritesheet('fx-death-poof', 'assets/effects/fx_death_poof.png', { frameWidth: 64, frameHeight: 64 });
    this.load.spritesheet('fx-explosion-burst', 'assets/effects/fx_explosion_burst.png', { frameWidth: 64, frameHeight: 64 });
    this.load.spritesheet('fx-meteor-impact-v32', 'assets/effects/fx_meteor_impact_v32.png', { frameWidth: 96, frameHeight: 96 });
    this.load.spritesheet('fx-arcane-surge-v32', 'assets/effects/fx_arcane_surge_v32.png', { frameWidth: 96, frameHeight: 96 });
    this.load.spritesheet('fx-holy-gate-v32', 'assets/effects/fx_holy_gate_v32.png', { frameWidth: 96, frameHeight: 96 });
    this.load.spritesheet('fx-earth-stomp-v32', 'assets/effects/fx_earth_stomp_v32.png', { frameWidth: 96, frameHeight: 96 });
    this.load.spritesheet('fx-boss-arena-v32', 'assets/effects/fx_boss_arena_v32.png', { frameWidth: 96, frameHeight: 96 });
    this.load.image('ui-spell-meteor-card-v32', 'assets/ui/spell_meteor_card_v32.png');
    this.load.image('ui-spell-mercenary-card-v32', 'assets/ui/spell_mercenary_card_v32.png');
    this.load.image('ui-spell-hero-card-v32', 'assets/ui/spell_hero_card_v32.png');
    this.load.image('ui-boss-pattern-banner-v32', 'assets/ui/boss_pattern_banner_v32.png');
    this.load.image('ui-spell-status-bar-v32', 'assets/ui/spell_status_bar_v32.png');
    this.load.image('ui-tower-cutin-v33', 'assets/ui/tower_cutin_panel_v33.png');
    this.load.image('ui-tower-seal-v33', 'assets/ui/tower_skill_seal_v33.png');
    this.load.image('ui-boss-status-v33', 'assets/ui/boss_status_panel_v33.png');
    this.load.spritesheet('fx-projectile-trail-v33', 'assets/effects/fx_projectile_trail_v33.png', { frameWidth: 96, frameHeight: 32 });
    this.load.spritesheet('fx-tower-impact-v33', 'assets/effects/fx_tower_impact_v33.png', { frameWidth: 96, frameHeight: 96 });

    ENEMY_KEYS.forEach((kind) => {
      this.load.spritesheet(`enemy-${kind}`, `assets/sprites/enemy_${kind}.png`, { frameWidth: 32, frameHeight: 32 });
    });

    TOWER_KEYS.forEach((kind) => {
      this.load.image(`tower-${kind}`, `assets/sprites/tower_${kind}.png`);
      TOWER_LEVELS.forEach((level) => {
        this.load.image(`tower-${kind}-lv${level}`, `assets/sprites/tower_${kind}_lv${level}.png`);
      });
    });

    TOWER_MASTERIES.forEach((mastery) => {
      const kind = mastery.split('_')[0];
      this.load.image(`tower-${kind}-${mastery}`, `assets/sprites/tower_${mastery}.png`);
    });

    this.load.image('ui-panel-parchment', 'assets/ui/panel_parchment.png');

    ['armor','magic','flying','swift','boss','tank','regen','summon'].forEach((trait) => {
      this.load.image(`ui-monster-trait-${trait}`, `assets/ui/monster_trait_${trait}.png`);
    });
    ['ogre','golem','demonlord','phoenix','dragon','titan'].forEach((boss) => {
      this.load.image(`ui-boss-nameplate-${boss}`, `assets/ui/boss_nameplate_${boss}.png`);
    });

    this.load.image('ui-import-button', 'assets/imported/ui/ui_wenrexa_button.png');
    this.load.image('ui-import-panel', 'assets/imported/ui/ui_wenrexa_panel.png');
    this.load.image('ui-import-arrow-left', 'assets/imported/ui/ui_wenrexa_arrow_left.png');
    this.load.image('ui-import-arrow-right', 'assets/imported/ui/ui_wenrexa_arrow_right.png');
    this.load.image('ui-import-medieval-sheet', 'assets/imported/ui/ui_medieval_sheet.png');
    this.load.image('ui-import-circle', 'assets/imported/ui/ui_wenrexa_circle.png');
    this.load.image('import-tiny-soldier-walk', 'assets/imported/characters/tiny_soldier_walk.png');
    this.load.image('import-tiny-orc-walk', 'assets/imported/characters/tiny_orc_walk.png');
    this.load.image('import-loot-adventurer', 'assets/imported/characters/loot_adventurer_32_sheet.png');
    this.load.image('import-infernus-altar', 'assets/imported/tiles/infernus_altar.png');

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
  

    this.load.image('ui-tower-panel-premium-v45', 'assets/ui/tower_panel_premium_v45.png');
    this.load.image('ui-tower-evolution-panel-v45', 'assets/ui/tower_evolution_panel_v45.png');
    this.load.image('ui-reward-open-panel-v45', 'assets/ui/reward_open_panel_v45.png');
    this.load.image('ui-monster-intel-panel-v45', 'assets/ui/monster_intel_panel_v45.png');
    this.load.image('ui-combat-loading-panel-v45', 'assets/ui/combat_loading_panel_v45.png');
    this.load.image('ui-wave-preview-panel-v45', 'assets/ui/wave_preview_panel_v45.png');
    this.load.image('ui-toast-panel-v45', 'assets/ui/toast_panel_v45.png');
    this.load.image('ui-tower-btn-upgrade-v45', 'assets/ui/tower_button_upgrade_v45.png');
    this.load.image('ui-tower-btn-sell-v45', 'assets/ui/tower_button_sell_v45.png');
    this.load.image('ui-tower-btn-swap-v45', 'assets/ui/tower_button_swap_v45.png');
    this.load.image('ui-tower-btn-boost-v45', 'assets/ui/tower_button_boost_v45.png');
    this.load.image('ui-tower-btn-target-v45', 'assets/ui/tower_button_target_v45.png');
    this.load.image('ui-tower-btn-rally-v45', 'assets/ui/tower_button_rally_v45.png');
    this.load.image('ui-reward-open-button-v45', 'assets/ui/reward_open_button_v45.png');
    this.load.image('ui-confirm-button-v45', 'assets/ui/confirm_button_v45.png');
    this.load.image('ui-cancel-button-v45', 'assets/ui/cancel_button_v45.png');
    this.load.image('ui-stat-hp-v45', 'assets/ui/stat_bar_hp_v45.png');
    this.load.image('ui-stat-damage-v45', 'assets/ui/stat_bar_damage_v45.png');
    this.load.image('ui-stat-range-v45', 'assets/ui/stat_bar_range_v45.png');
    this.load.image('ui-stat-speed-v45', 'assets/ui/stat_bar_speed_v45.png');
    this.load.image('ui-tower-role-archer-v45', 'assets/ui/tower_role_archer_v45.png');
    this.load.image('ui-tower-role-mage-v45', 'assets/ui/tower_role_mage_v45.png');
    this.load.image('ui-tower-role-barracks-v45', 'assets/ui/tower_role_barracks_v45.png');
    this.load.image('ui-tower-role-artillery-v45', 'assets/ui/tower_role_artillery_v45.png');

    this.load.image('ui-safe-battle-frame-v46', 'assets/ui/safe_battle_frame_v46.png');
    this.load.image('ui-start-gate-card-v46', 'assets/ui/start_gate_card_v46.png');
    this.load.image('ui-back-guard-card-v46', 'assets/ui/back_guard_card_v46.png');
    this.load.image('ui-tower-click-ring-v46', 'assets/ui/tower_click_ring_v46.png');
    this.load.image('ui-map-edge-shadow-v46', 'assets/ui/map_edge_shadow_v46.png');

    this.load.image('ui-build-menu-frame-v47', 'assets/ui/build_menu_frame_v47.png');
    this.load.image('ui-tower-panel-anchor-v47', 'assets/ui/tower_panel_anchor_v47.png');
    this.load.image('ui-start-loading-card-v47', 'assets/ui/start_loading_card_v47.png');
    this.load.image('ui-guard-exit-card-v47', 'assets/ui/guard_exit_card_v47.png');
    this.load.image('ui-wave-card-refined-v47', 'assets/ui/wave_card_refined_v47.png');
    this.load.image('ui-tower-click-ring-v47', 'assets/ui/tower_click_ring_v47.png');
    this.load.image('ui-panel-anchor-arrow-v47', 'assets/ui/panel_anchor_arrow_v47.png');
    this.load.image('ui-safe-area-overlay-v47', 'assets/ui/safe_area_overlay_v47.png');
    this.load.image('ui-worldmap-bottom-dock-v47', 'assets/ui/worldmap_bottom_dock_v47.png');
    this.load.image('ui-combat-hud-refine-v47', 'assets/ui/combat_hud_refine_v47.png');
    this.load.image('fx-pointer-spark-v47', 'assets/effects/fx_pointer_spark_v47.png');
    for (let i = 1; i <= 4; i += 1) {
      this.load.image(`ui-stage-glow-frame-v47-${i}`, `assets/ui/stage_glow_frame_v47_${i}.png`);
    }


    for (let i = 0; i < 8; i += 1) {
      this.load.image(`fx-reward-open-v45-${i}`, `assets/effects/reward_open_fx_v45_${i}.png`);
    }

    ['armor','magic','flying','swift','boss','tank'].forEach((trait) => {
      this.load.image(`ui-trait-${trait}`, `assets/ui/monster_trait_${trait}.png`);
    });

    ['goblin','wolf','bat','orc','shield','shaman','wasp','ogre','raider','gargoyle','dark_mage','golem','gate_lord','cultist','assassin','wyvern','necromancer','flesh_golem','fire_imp','hellhound','obsidian_knight','phoenix','dragon','voidling','void_priest','nightmare_knight','titan','skeleton','zombie','demon','boss'].forEach((enemy) => {
      this.load.image(`ui-enemy-portrait-${enemy}`, `assets/ui/enemy_portrait_${enemy}.png`);
    });
}

  create(): void {

    if (this.textures.exists('fx-compact-shimmer-v48') && !this.anims.exists('fx-compact-shimmer-v48-anim')) {
      this.anims.create({ key: 'fx-compact-shimmer-v48-anim', frames: this.anims.generateFrameNumbers('fx-compact-shimmer-v48', { start: 0, end: 7 }), frameRate: 8, repeat: -1 });
    }

    if (this.textures.exists('fx-boutique-shimmer-v49') && !this.anims.exists('fx-boutique-shimmer-v49-anim')) {
      this.anims.create({ key: 'fx-boutique-shimmer-v49-anim', frames: this.anims.generateFrameNumbers('fx-boutique-shimmer-v49', { start: 0, end: 7 }), frameRate: 9, repeat: -1 });
    }

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
      { key: 'fx-meteor-impact-v32-play', texture: 'fx-meteor-impact-v32', start: 0, end: 7, frameRate: 22, repeat: 0 },
      { key: 'fx-arcane-surge-v32-play', texture: 'fx-arcane-surge-v32', start: 0, end: 7, frameRate: 20, repeat: 0 },
      { key: 'fx-holy-gate-v32-play', texture: 'fx-holy-gate-v32', start: 0, end: 7, frameRate: 18, repeat: 0 },
      { key: 'fx-earth-stomp-v32-play', texture: 'fx-earth-stomp-v32', start: 0, end: 7, frameRate: 20, repeat: 0 },
      { key: 'fx-boss-arena-v32-play', texture: 'fx-boss-arena-v32', start: 0, end: 7, frameRate: 18, repeat: 0 },
      { key: 'fx-projectile-trail-v33-play', texture: 'fx-projectile-trail-v33', start: 0, end: 5, frameRate: 22, repeat: 0 },
      { key: 'fx-tower-impact-v33-play', texture: 'fx-tower-impact-v33', start: 0, end: 7, frameRate: 22, repeat: 0 },
    ];

    anims.forEach((spec) => this.makeAnim(spec));

    ENEMY_KEYS.forEach((kind) => {
      const directions = [
        { id: 'down', walk: [0, 3], attack: [12, 15], death: [24, 27] },
        { id: 'side', walk: [4, 7], attack: [16, 19], death: [28, 31] },
        { id: 'up', walk: [8, 11], attack: [20, 23], death: [32, 35] },
      ] as const;

      directions.forEach((dir) => {
        this.makeAnim({
          key: `enemy-${kind}-walk-${dir.id}`,
          texture: `enemy-${kind}`,
          start: dir.walk[0],
          end: dir.walk[1],
          frameRate: 7,
          repeat: -1,
        });
        this.makeAnim({
          key: `enemy-${kind}-attack-${dir.id}`,
          texture: `enemy-${kind}`,
          start: dir.attack[0],
          end: dir.attack[1],
          frameRate: 12,
          repeat: -1,
        });
        this.makeAnim({
          key: `enemy-${kind}-death-${dir.id}`,
          texture: `enemy-${kind}`,
          start: dir.death[0],
          end: dir.death[1],
          frameRate: 14,
          repeat: 0,
        });
      });

      this.makeAnim({
        key: `enemy-${kind}-walk`,
        texture: `enemy-${kind}`,
        start: 0,
        end: 3,
        frameRate: 7,
        repeat: -1,
      });
      this.makeAnim({
        key: `enemy-${kind}-attack`,
        texture: `enemy-${kind}`,
        start: 12,
        end: 15,
        frameRate: 12,
        repeat: -1,
      });
      this.makeAnim({
        key: `enemy-${kind}-death`,
        texture: `enemy-${kind}`,
        start: 24,
        end: 27,
        frameRate: 14,
        repeat: 0,
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
