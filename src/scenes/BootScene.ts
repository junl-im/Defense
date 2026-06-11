import Phaser from "phaser";
import type { EnemyKind, TowerKind } from "../game/types";
import { unlockAudio } from "../game/AudioManager";
import { preferFastStartMode } from "../game/PerformanceMode";

const ENEMY_KEYS: EnemyKind[] = [
  "goblin",
  "wolf",
  "brute",
  "bat",
  "orc",
  "shield",
  "shaman",
  "wasp",
  "ogre",
  "spider",
  "specter",
  "troll",
  "raider",
  "gargoyle",
  "warlock",
  "golem",
  "demonlord",
  "cultist",
  "assassin",
  "wyvern",
  "necromancer",
  "abomination",
  "fireImp",
  "hellhound",
  "obsidianKnight",
  "phoenix",
  "dragon",
  "voidling",
  "voidPriest",
  "nightmare",
  "titan",
];

const TOWER_KEYS: TowerKind[] = ["archer", "mage", "barracks", "artillery"];
const TOWER_LEVELS = [1, 2, 3] as const;
const TOWER_MASTERIES = [
  "archer_longbow",
  "archer_sniper",
  "mage_arcane",
  "mage_hex",
  "barracks_paladin",
  "barracks_assault",
  "artillery_mortar",
  "artillery_shock",
] as const;

const BOOT_QUERY = new URLSearchParams(
  typeof window !== "undefined" ? window.location.search : "",
);
const FAST_BOOT = !BOOT_QUERY.has("fullpreload");
const FAST_START_MODE = FAST_BOOT && preferFastStartMode();
const WEBP_ENABLED =
  !BOOT_QUERY.has("png") &&
  (() => {
    try {
      const canvas = document.createElement("canvas");
      return canvas.toDataURL("image/webp").startsWith("data:image/webp");
    } catch {
      return false;
    }
  })();

const WEBP_RASTER_PATTERNS = [
  /assets\/backgrounds\/(login_background_clean_v2_15|login_background_clean_v2_6|login_background_clean_v2_4|main_menu_splash_v2_15|main_menu_splash_v2_6|main_menu_splash_v2_4|worldmap_splash_v2_15|worldmap_splash_v2_1)\.png$/,
  /assets\/maps\/(v2_15|v2_14|v2_13|v2_12|v2_6|v2_4)\/[^/]+\.png$/,
  /assets\/ui\/(v2_2|v2_3|v2_4|v2_6|v2_7|v2_8|v2_9|v2_10|v2_11|v2_12|v2_13|v2_14|v2_15|v2_16|v2_17|v2_18|v2_19|v2_20|v2_21|v2_22|v2_24|v2_25)\/[^/]+\.png$/,
  /assets\/props\/v2_6\/[^/]+\.png$/,
  /assets\/maps\/(stage_card_009|stage_card_010|stage_card_011|stage_card_012|map_stage_009|map_stage_010|map_stage_011|map_stage_012)\.png$/,
  /assets\/units\/(v2_1|v2_4)\/[^/]+\.png$/,
  /assets\/towers\/v2_1\/[^/]+\.png$/,
  /assets\/ui\/title_logo_v1_9\.png$/,
] as const;

const FAST_BOOT_SKIP_PATTERNS = [
  /assets\/backgrounds\/(login_screen_v1_6|login_screen_v1_7|login_splash_v1_3|login_background_v1_2|main_menu_splash_v1_4|main_menu_background_v1_2|worldmap_splash_v1_5|worldmap_background_v1_2)\.png$/,
  /assets\/v1_2\/decor\//,
  /assets\/ui\/(title_background|title_logo|title_logo_compact_v48|login_panel_compact_v48|button_compact_[^/]+_v48|footer_strip_compact_v48|top_chip_compact_v48|title_side_ornaments_v48|title_logo_boutique_v49|login_panel_boutique_v49|button_boutique_[^/]+_v49|footer_strip_boutique_v49|top_chip_boutique_v49|title_ornaments_boutique_v49|jewel_divider_boutique_v49)\.png$/,
  /assets\/effects\/(compact_shimmer_v48|boutique_shimmer_v49)\.png$/,
  /assets\/ui\/(panel_login_ornate|status_plaque|button_primary|button_blue|button_gold|button_red|world_map_painted|world_map_premium_v27|world_map_premium_v28|panel_detail_large|banner_worldmap|stage_card_locked)\.png$/,
  /assets\/maps\/worldmap_premium_v43\.png$/,
] as const;

function canUseWebp(path: string): boolean {
  return (
    WEBP_ENABLED && WEBP_RASTER_PATTERNS.some((pattern) => pattern.test(path))
  );
}

function rasterPath(path: string): string {
  if (!canUseWebp(path)) return path;
  return path.replace(/\.(png|jpg|jpeg)$/i, ".webp");
}

function shouldFastBootSkip(key: string, path: string): boolean {
  if (!FAST_BOOT) return false;
  if (key.startsWith("bgm_")) return true;

  if (FAST_START_MODE) {
    // v2.23: keep the first tap fast. Cumulative cute-art passes stay in the project,
    // but they are not uploaded to GPU during boot unless the URL has ?fullart.
    if (/assets\/ui\/v2_(16|17|18|19|20|21|22|24|25)\//.test(path)) return true;
    if (
      /assets\/maps\/(map_stage_00[2-9]|map_stage_01[0-2]|stage_card_00[2-9]|stage_card_01[0-2])\.png$/.test(
        path,
      )
    )
      return true;
    if (/assets\/maps\/v2_15\/battle_stage_/.test(path)) return true;
    if (/assets\/props\/v2_6\//.test(path)) return true;
    if (/assets\/ui\/enemy_portrait_/.test(path)) return true;
    if (
      /assets\/ui\/(tower_panel_premium|tower_evolution_panel|reward_open_panel|monster_intel_panel|combat_loading_panel|wave_preview_panel|toast_panel|tower_button_|reward_open_button|confirm_button|cancel_button|stat_bar_|tower_role_)/.test(
        path,
      )
    )
      return true;
    if (/assets\/effects\/reward_open_fx_v45_/.test(path)) return true;
  }

  return FAST_BOOT_SKIP_PATTERNS.some((pattern) => pattern.test(path));
}

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
    super("BootScene");
  }

  preload(): void {
    this.load.setPath(import.meta.env.BASE_URL || "/");
    this.installOptimizedRasterPipeline();

    this.load.image("ui-title-bg", "assets/ui/title_background.png");
    this.load.image("ui-title-logo", "assets/ui/title_logo.png");

    // v1.8: clean separated illustration layers. Background/logo/panels/buttons are image assets; text and hit-zones are code-owned.
    this.load.image(
      "v1-login-clean-bg",
      "assets/backgrounds/login_background_clean_v2_15.png",
    );
    this.load.image("v1-title-logo-clean", "assets/ui/title_logo_v1_9.png");
    this.load.image(
      "v1-login-panel-v18",
      "assets/ui/v2_15/login_panel_v2_15.png",
    );
    this.load.image(
      "v1-login-button-gold-v18",
      "assets/ui/v2_15/login_button_gold_v2_15.png",
    );
    this.load.image(
      "v1-login-button-white-v18",
      "assets/ui/v2_15/login_button_white_v2_15.png",
    );
    this.load.image(
      "v1-login-button-small-v18",
      "assets/ui/v2_15/login_button_small_v2_15.png",
    );
    this.load.image(
      "v1-login-utility-button-v18",
      "assets/ui/v2_15/login_utility_button_v2_15.png",
    );
    this.load.image(
      "v1-main-menu-splash-v18",
      "assets/backgrounds/main_menu_splash_v2_15.png",
    );
    this.load.image(
      "v1-worldmap-splash-v18",
      "assets/backgrounds/worldmap_splash_v2_15.png",
    );

    // v1.3+ screens use premium baked art compositions,
    // with transparent code hit-zones layered above for interaction.
    this.load.image(
      "v1-login-polished",
      "assets/backgrounds/login_screen_v1_7.png",
    );
    this.load.image(
      "v1-login-refined",
      "assets/backgrounds/login_screen_v1_6.png",
    );
    this.load.image(
      "v1-login-splash",
      "assets/backgrounds/login_splash_v1_3.png",
    );
    this.load.image(
      "v1-login-bg",
      "assets/backgrounds/login_background_v1_2.png",
    );
    this.load.image(
      "v1-main-menu-splash",
      "assets/backgrounds/main_menu_splash_v1_4.png",
    );
    this.load.image(
      "v1-main-menu-bg",
      "assets/backgrounds/main_menu_background_v1_2.png",
    );
    this.load.image(
      "v1-worldmap-splash",
      "assets/backgrounds/worldmap_splash_v1_5.png",
    );
    this.load.image(
      "v1-worldmap-bg",
      "assets/backgrounds/worldmap_background_v1_2.png",
    );
    [
      "hero_knight",
      "hero_ranger",
      "hero_mage",
      "hero_guardian",
      "hero_druid",
      "tower_crystal",
      "tower_sanctuary",
      "tower_cannon",
      "tower_grove",
      "monster_goblin",
      "monster_orc",
      "monster_wolf",
      "monster_skeleton",
      "monster_dragon",
    ].forEach((asset) => {
      this.load.image(
        `v1-${asset.replace(/_/g, "-")}`,
        `assets/v1_2/decor/${asset}_v1_2.png`,
      );
    });

    this.load.image(
      "ui-title-logo-compact-v48",
      "assets/ui/title_logo_compact_v48.png",
    );
    this.load.image(
      "ui-login-panel-compact-v48",
      "assets/ui/login_panel_compact_v48.png",
    );
    this.load.image(
      "ui-button-compact-gold-v48",
      "assets/ui/button_compact_gold_v48.png",
    );
    this.load.image(
      "ui-button-compact-blue-v48",
      "assets/ui/button_compact_blue_v48.png",
    );
    this.load.image(
      "ui-button-compact-red-v48",
      "assets/ui/button_compact_red_v48.png",
    );
    this.load.image(
      "ui-button-compact-white-v48",
      "assets/ui/button_compact_white_v48.png",
    );
    this.load.image(
      "ui-footer-strip-compact-v48",
      "assets/ui/footer_strip_compact_v48.png",
    );
    this.load.image(
      "ui-top-chip-compact-v48",
      "assets/ui/top_chip_compact_v48.png",
    );
    this.load.image(
      "ui-title-ornaments-v48",
      "assets/ui/title_side_ornaments_v48.png",
    );
    this.load.spritesheet(
      "fx-compact-shimmer-v48",
      "assets/effects/compact_shimmer_v48.png",
      { frameWidth: 32, frameHeight: 32 },
    );
    this.load.image(
      "ui-title-logo-boutique-v49",
      "assets/ui/title_logo_boutique_v49.png",
    );
    this.load.image(
      "ui-login-panel-boutique-v49",
      "assets/ui/login_panel_boutique_v49.png",
    );
    this.load.image(
      "ui-button-boutique-gold-v49",
      "assets/ui/button_boutique_gold_v49.png",
    );
    this.load.image(
      "ui-button-boutique-blue-v49",
      "assets/ui/button_boutique_blue_v49.png",
    );
    this.load.image(
      "ui-button-boutique-red-v49",
      "assets/ui/button_boutique_red_v49.png",
    );
    this.load.image(
      "ui-button-boutique-white-v49",
      "assets/ui/button_boutique_white_v49.png",
    );
    this.load.image(
      "ui-footer-strip-boutique-v49",
      "assets/ui/footer_strip_boutique_v49.png",
    );
    this.load.image(
      "ui-top-chip-boutique-v49",
      "assets/ui/top_chip_boutique_v49.png",
    );
    this.load.image(
      "ui-title-ornaments-boutique-v49",
      "assets/ui/title_ornaments_boutique_v49.png",
    );
    this.load.image(
      "ui-jewel-divider-boutique-v49",
      "assets/ui/jewel_divider_boutique_v49.png",
    );
    this.load.spritesheet(
      "fx-boutique-shimmer-v49",
      "assets/effects/boutique_shimmer_v49.png",
      { frameWidth: 28, frameHeight: 28 },
    );

    this.load.image("ui-login-panel", "assets/ui/panel_login_ornate.png");
    this.load.image("ui-status-plaque", "assets/ui/status_plaque.png");
    this.load.image("ui-button-primary", "assets/ui/button_primary.png");
    this.load.image("ui-button-blue", "assets/ui/button_blue.png");
    this.load.image("ui-button-gold", "assets/ui/button_gold.png");
    this.load.image("ui-button-red", "assets/ui/button_red.png");
    this.load.image("ui-icon-anonymous", "assets/ui/icon_anonymous.png");
    this.load.image("ui-icon-google", "assets/ui/icon_google.png");
    this.load.image("ui-icon-email", "assets/ui/icon_email.png");
    this.load.image("ui-icon-register", "assets/ui/icon_register.png");
    this.load.image("ui-icon-shield", "assets/ui/icon_shield.png");
    this.load.image("ui-icon-spark", "assets/ui/icon_spark.png");
    this.load.spritesheet("ui-particles", "assets/ui/particles_magic.png", {
      frameWidth: 32,
      frameHeight: 32,
    });

    this.load.image("ui-panel-premium-v43", "assets/ui/panel_premium_v43.png");
    this.load.image("ui-modal-frame-v43", "assets/ui/modal_frame_v43.png");
    this.load.image("ui-button-gold-v43", "assets/ui/button_gold_v43.png");
    this.load.image("ui-button-blue-v43", "assets/ui/button_blue_v43.png");
    this.load.image(
      "ui-stage-card-frame-v43",
      "assets/ui/stage_card_frame_v43.png",
    );
    this.load.image(
      "ui-world-map-bg-v43",
      "assets/maps/worldmap_premium_v43.png",
    );
    this.load.image(
      "ui-fx-spell-burst-v43",
      "assets/effects/fx_spell_burst_v43.png",
    );
    this.load.image(
      "ui-fx-reward-glimmer-v43",
      "assets/effects/fx_reward_glimmer_v43.png",
    );
    this.load.image(
      "ui-fx-tower-upgrade-v43",
      "assets/effects/fx_tower_upgrade_v43.png",
    );

    this.load.image("ui-world-map-bg", "assets/ui/world_map_painted.png");
    this.load.image("ui-stage-card-frame", "assets/ui/stage_card_frame.png");
    this.load.image("ui-stage-card-locked", "assets/ui/stage_card_locked.png");
    this.load.image(
      "ui-panel-detail-large",
      "assets/ui/panel_detail_large.png",
    );
    this.load.image("ui-banner-worldmap", "assets/ui/banner_worldmap.png");
    this.load.image("ui-icon-star-large", "assets/ui/icon_star_large.png");
    this.load.image("ui-icon-lock", "assets/ui/icon_lock.png");
    this.load.image("ui-hud-top-panel", "assets/ui/hud_top_panel.png");
    this.load.image("ui-hud-bottom-panel", "assets/ui/hud_bottom_panel.png");
    this.load.image(
      "ui-world-map-bg-v27",
      "assets/ui/world_map_premium_v27.png",
    );
    this.load.image("ui-panel-obsidian", "assets/ui/panel_obsidian_gold.png");
    this.load.image("ui-button-elite", "assets/ui/button_elite.png");
    this.load.image(
      "ui-wave-intel-frame-v31",
      "assets/ui/wave_intel_frame_v31.png",
    );
    this.load.image(
      "ui-boss-cutin-frame-v31",
      "assets/ui/boss_cutin_frame_v31.png",
    );
    this.load.image(
      "ui-boss-sigil-v31",
      "assets/ui/boss_warning_sigil_v31.png",
    );
    this.load.image(
      "ui-tower-card-premium",
      "assets/ui/tower_card_premium.png",
    );
    this.load.image("ui-master-badge", "assets/ui/mastery_badge.png");
    this.load.image(
      "ui-world-map-bg-v28",
      "assets/ui/world_map_premium_v28.png",
    );
    this.load.image(
      "ui-world-map-bg-v29",
      "assets/ui/world_map_premium_v28.png",
    );
    this.load.image("ui-hero-hall-bg", "assets/ui/hero_hall_bg.png");
    this.load.image("ui-mission-board-bg", "assets/ui/mission_board_bg.png");
    this.load.image("ui-glass-panel-v28", "assets/ui/ui-glass-panel-v28.png");
    this.load.image("ui-hero-card-v28", "assets/ui/ui-hero-card-v28.png");
    this.load.image("ui-mission-card-v28", "assets/ui/ui-mission-card-v28.png");
    this.load.image("ui-reward-chest-v28", "assets/ui/ui-reward-chest-v28.png");
    this.load.image("ui-reward-panel-v35", "assets/ui/reward_panel_v35.png");
    this.load.image("ui-reward-chest-v35", "assets/ui/reward_chest_v35.png");
    this.load.image(
      "ui-objective-ribbon-v35",
      "assets/ui/objective_ribbon_v35.png",
    );
    this.load.image("ui-medal-bronze-v35", "assets/ui/medal_bronze_v35.png");
    this.load.image("ui-medal-silver-v35", "assets/ui/medal_silver_v35.png");
    this.load.image("ui-medal-gold-v35", "assets/ui/medal_gold_v35.png");
    this.load.image("ui-medal-legend-v35", "assets/ui/medal_legend_v35.png");

    this.load.image(
      "v1-combat-top-hud",
      "assets/ui/v2_15/combat_top_hud_v2_15.png",
    );
    this.load.image(
      "v1-combat-bottom-dock",
      "assets/ui/v2_15/combat_bottom_dock_v2_15.png",
    );
    this.load.image(
      "v1-tower-build-menu",
      "assets/ui/v2_15/tower_build_menu_v2_15.png",
    );
    this.load.image(
      "v1-tower-build-card",
      "assets/ui/v2_15/tower_build_card_v2_15.png",
    );
    this.load.image(
      "v1-tower-command-panel",
      "assets/ui/v2_15/tower_command_panel_v2_15.png",
    );
    this.load.image("v1-build-spot", "assets/ui/v2_15/build_spot_v2_15.png");
    this.load.image(
      "v1-target-reticle",
      "assets/ui/v2_3/target_reticle_v2_3.png",
    );
    this.load.image("v1-button-blue", "assets/ui/v2_15/button_blue_v2_15.png");
    this.load.image("v1-button-gold", "assets/ui/v2_15/button_gold_v2_15.png");
    this.load.image("v1-button-red", "assets/ui/v2_15/button_red_v2_15.png");
    this.load.image("v1-button-dark", "assets/ui/v2_15/button_dark_v2_15.png");
    this.load.image(
      "v1-button-green",
      "assets/ui/v2_15/button_green_v2_15.png",
    );

    // v2.2: visual sync / QA overlays. These are clean art layers with no baked text.
    this.load.image(
      "v2-combat-focus-overlay",
      "assets/ui/v2_15/combat_focus_overlay_v2_15.png",
    );
    this.load.image(
      "v2-path-waypoint",
      "assets/ui/v2_2/path_waypoint_v2_2.png",
    );
    this.load.image(
      "v2-tower-selection-ring",
      "assets/ui/v2_15/tower_selection_ring_v2_15.png",
    );
    this.load.image("v2-season-chip", "assets/ui/v2_6/season_chip_v2_6.png");
    this.load.image(
      "v2-strategy-card",
      "assets/ui/v2_6/strategy_card_v2_6.png",
    );
    this.load.image("v2-event-panel", "assets/ui/v2_6/event_panel_v2_6.png");
    this.load.image(
      "v2-synergy-panel",
      "assets/ui/v2_6/synergy_panel_v2_6.png",
    );
    this.load.image("v2-elite-badge", "assets/ui/v2_6/elite_badge_v2_6.png");
    this.load.image("v2-command-aura", "assets/ui/v2_6/command_aura_v2_6.png");

    // v2.9: mobile advisor / wave affix micro UI.
    this.load.image("v2-affix-chip-v29", "assets/ui/v2_9/affix_chip_v2_9.png");
    this.load.image(
      "v2-advisor-panel-v29",
      "assets/ui/v2_9/advisor_panel_v2_9.png",
    );

    // v2.16: cute fantasy art foundation assets. Code keeps text/hit-zones separate for mobile QA.
    this.load.image(
      "v2-cute-panel-v216",
      "assets/ui/v2_16/cute_panel_v2_16.png",
    );
    this.load.image(
      "v2-cute-ribbon-v216",
      "assets/ui/v2_16/cute_ribbon_v2_16.png",
    );
    this.load.image("v2-cute-star-v216", "assets/ui/v2_16/cute_star_v2_16.png");
    this.load.image(
      "v2-cute-heart-v216",
      "assets/ui/v2_16/cute_heart_v2_16.png",
    );
    this.load.image(
      "v2-cute-cloud-v216",
      "assets/ui/v2_16/cute_cloud_v2_16.png",
    );
    this.load.image("v2-cute-gem-v216", "assets/ui/v2_16/cute_gem_v2_16.png");
    this.load.image(
      "v2-cute-stage-pin-v216",
      "assets/ui/v2_16/cute_stage_pin_v2_16.png",
    );
    this.load.image(
      "v2-cute-tower-badge-v216",
      "assets/ui/v2_16/cute_tower_badge_v2_16.png",
    );
    this.load.image(
      "v2-cute-monster-badge-v216",
      "assets/ui/v2_16/cute_monster_badge_v2_16.png",
    );
    this.load.image("v2-cute-leaf-v216", "assets/ui/v2_16/cute_leaf_v2_16.png");

    // v2.17: massive cute fantasy UI kit. These remain text-free and WebP-first through the optimized raster pipeline.
    this.load.image(
      "v217-dreamy-panel-wide",
      "assets/ui/v2_17/dreamy_panel_wide_v2_17.png",
    );
    this.load.image(
      "v217-dreamy-panel-small",
      "assets/ui/v2_17/dreamy_panel_small_v2_17.png",
    );
    this.load.image(
      "v217-checklist-card",
      "assets/ui/v2_17/checklist_card_v2_17.png",
    );
    this.load.image(
      "v217-title-banner",
      "assets/ui/v2_17/title_banner_v2_17.png",
    );
    this.load.image(
      "v217-soft-banner-blue",
      "assets/ui/v2_17/soft_banner_blue_v2_17.png",
    );
    this.load.image(
      "v217-button-gold-squish",
      "assets/ui/v2_17/button_gold_squish_v2_17.png",
    );
    this.load.image(
      "v217-button-blue-squish",
      "assets/ui/v2_17/button_blue_squish_v2_17.png",
    );
    this.load.image("v217-nav-pill", "assets/ui/v2_17/nav_pill_v2_17.png");
    this.load.image(
      "v217-resource-chip",
      "assets/ui/v2_17/resource_chip_v2_17.png",
    );
    this.load.image("v217-shop-tag", "assets/ui/v2_17/shop_tag_v2_17.png");
    this.load.image(
      "v217-stage-frame",
      "assets/ui/v2_17/stage_frame_v2_17.png",
    );
    this.load.image("v217-stage-lock", "assets/ui/v2_17/stage_lock_v2_17.png");
    this.load.image(
      "v217-stage-route-dot",
      "assets/ui/v2_17/stage_route_dot_v2_17.png",
    );
    this.load.image(
      "v217-stage-selected-halo",
      "assets/ui/v2_17/stage_selected_halo_v2_17.png",
    );
    this.load.image(
      "v217-battle-top-badge",
      "assets/ui/v2_17/battle_top_badge_v2_17.png",
    );
    this.load.image(
      "v217-battle-bottom-cushion",
      "assets/ui/v2_17/battle_bottom_cushion_v2_17.png",
    );
    this.load.image(
      "v217-wave-hint-panel",
      "assets/ui/v2_17/wave_hint_panel_v2_17.png",
    );
    this.load.image(
      "v217-toast-bubble",
      "assets/ui/v2_17/toast_bubble_v2_17.png",
    );
    this.load.image(
      "v217-spell-card-meteor",
      "assets/ui/v2_17/spell_card_meteor_v2_17.png",
    );
    this.load.image(
      "v217-spell-card-guard",
      "assets/ui/v2_17/spell_card_guard_v2_17.png",
    );
    this.load.image(
      "v217-spell-card-hero",
      "assets/ui/v2_17/spell_card_hero_v2_17.png",
    );
    this.load.image(
      "v217-mascot-fairy",
      "assets/ui/v2_17/mascot_fairy_v2_17.png",
    );
    this.load.image(
      "v217-mascot-slime",
      "assets/ui/v2_17/mascot_slime_v2_17.png",
    );
    this.load.image(
      "v217-mascot-tower",
      "assets/ui/v2_17/mascot_tower_v2_17.png",
    );
    this.load.image(
      "v217-sparkle-cluster",
      "assets/ui/v2_17/sparkle_cluster_v2_17.png",
    );
    this.load.image(
      "v217-flower-corner",
      "assets/ui/v2_17/flower_corner_v2_17.png",
    );
    this.load.image("v217-leaf-vine", "assets/ui/v2_17/leaf_vine_v2_17.png");
    this.load.image(
      "v217-gem-cluster",
      "assets/ui/v2_17/gem_cluster_v2_17.png",
    );
    this.load.image(
      "v217-soft-divider",
      "assets/ui/v2_17/soft_divider_v2_17.png",
    );
    this.load.image(
      "v217-alert-badge",
      "assets/ui/v2_17/alert_badge_v2_17.png",
    );
    this.load.image("v217-badge-coin", "assets/ui/v2_17/badge_coin_v2_17.png");
    this.load.image("v217-badge-star", "assets/ui/v2_17/badge_star_v2_17.png");
    this.load.image(
      "v217-badge-heart",
      "assets/ui/v2_17/badge_heart_v2_17.png",
    );
    this.load.image("v217-badge-leaf", "assets/ui/v2_17/badge_leaf_v2_17.png");

    // v2.18: massive cute art pass. Text-free PNG sources are automatically swapped to WebP by the optimized raster pipeline.
    this.load.image(
      "v218-plush-modal-frame",
      "assets/ui/v2_18/plush_modal_frame_v2_18.png",
    );
    this.load.image(
      "v218-nursery-header-ribbon",
      "assets/ui/v2_18/nursery_header_ribbon_v2_18.png",
    );
    this.load.image(
      "v218-scallop-button-gold",
      "assets/ui/v2_18/scallop_button_gold_v2_18.png",
    );
    this.load.image(
      "v218-scallop-button-blue",
      "assets/ui/v2_18/scallop_button_blue_v2_18.png",
    );
    this.load.image(
      "v218-scallop-button-pink",
      "assets/ui/v2_18/scallop_button_pink_v2_18.png",
    );
    this.load.image(
      "v218-login-cloud-arch",
      "assets/ui/v2_18/login_cloud_arch_v2_18.png",
    );
    this.load.image(
      "v218-login-stamp-quick",
      "assets/ui/v2_18/login_stamp_quick_v2_18.png",
    );
    this.load.image(
      "v218-login-stamp-google",
      "assets/ui/v2_18/login_stamp_google_v2_18.png",
    );
    this.load.image(
      "v218-fairy-house",
      "assets/ui/v2_18/fairy_house_v2_18.png",
    );
    this.load.image(
      "v218-slime-crown",
      "assets/ui/v2_18/slime_crown_v2_18.png",
    );
    this.load.image(
      "v218-acorn-shield",
      "assets/ui/v2_18/acorn_shield_v2_18.png",
    );
    this.load.image(
      "v218-little-sword-badge",
      "assets/ui/v2_18/little_sword_badge_v2_18.png",
    );
    this.load.image(
      "v218-resource-shell-coin",
      "assets/ui/v2_18/resource_shell_coin_v2_18.png",
    );
    this.load.image(
      "v218-resource-shell-gem",
      "assets/ui/v2_18/resource_shell_gem_v2_18.png",
    );
    this.load.image(
      "v218-resource-shell-heart",
      "assets/ui/v2_18/resource_shell_heart_v2_18.png",
    );
    this.load.image(
      "v218-lobby-quest-scroll",
      "assets/ui/v2_18/lobby_quest_scroll_v2_18.png",
    );
    this.load.image(
      "v218-lobby-shop-awning",
      "assets/ui/v2_18/lobby_shop_awning_v2_18.png",
    );
    this.load.image(
      "v218-worldmap-path-bridge",
      "assets/ui/v2_18/worldmap_path_bridge_v2_18.png",
    );
    this.load.image(
      "v218-worldmap-node-crown",
      "assets/ui/v2_18/worldmap_node_crown_v2_18.png",
    );
    this.load.image(
      "v218-worldmap-preview-frame",
      "assets/ui/v2_18/worldmap_preview_frame_v2_18.png",
    );
    this.load.image(
      "v218-worldmap-cloud-island",
      "assets/ui/v2_18/worldmap_cloud_island_v2_18.png",
    );
    this.load.image(
      "v218-battle-hud-lace-top",
      "assets/ui/v2_18/battle_hud_lace_top_v2_18.png",
    );
    this.load.image(
      "v218-battle-skill-tray",
      "assets/ui/v2_18/battle_skill_tray_v2_18.png",
    );
    this.load.image(
      "v218-battle-wave-flag",
      "assets/ui/v2_18/battle_wave_flag_v2_18.png",
    );
    this.load.image(
      "v218-battle-corner-leaf",
      "assets/ui/v2_18/battle_corner_leaf_v2_18.png",
    );
    this.load.image(
      "v218-battle-spell-meteor-orb",
      "assets/ui/v2_18/battle_spell_meteor_orb_v2_18.png",
    );
    this.load.image(
      "v218-battle-spell-guard-orb",
      "assets/ui/v2_18/battle_spell_guard_orb_v2_18.png",
    );
    this.load.image(
      "v218-battle-spell-hero-orb",
      "assets/ui/v2_18/battle_spell_hero_orb_v2_18.png",
    );
    this.load.image(
      "v218-tiny-star-spray",
      "assets/ui/v2_18/tiny_star_spray_v2_18.png",
    );
    this.load.image(
      "v218-tiny-heart-spray",
      "assets/ui/v2_18/tiny_heart_spray_v2_18.png",
    );
    this.load.image(
      "v218-tiny-leaf-spray",
      "assets/ui/v2_18/tiny_leaf_spray_v2_18.png",
    );
    this.load.image(
      "v218-toast-marshmallow",
      "assets/ui/v2_18/toast_marshmallow_v2_18.png",
    );
    this.load.image(
      "v218-progress-bead",
      "assets/ui/v2_18/progress_bead_v2_18.png",
    );
    this.load.image(
      "v218-selected-stage-glow",
      "assets/ui/v2_18/selected_stage_glow_v2_18.png",
    );
    this.load.image(
      "v218-locked-stage-padlock",
      "assets/ui/v2_18/locked_stage_padlock_v2_18.png",
    );
    this.load.image(
      "v218-fairy-wing-pair",
      "assets/ui/v2_18/fairy_wing_pair_v2_18.png",
    );
    this.load.image(
      "v218-mascot-bunny",
      "assets/ui/v2_18/mascot_bunny_v2_18.png",
    );
    this.load.image(
      "v218-mascot-puff-dragon",
      "assets/ui/v2_18/mascot_puff_dragon_v2_18.png",
    );
    this.load.image(
      "v218-mobile-thumb-hint",
      "assets/ui/v2_18/mobile_thumb_hint_v2_18.png",
    );
    this.load.image(
      "v218-settings-cog-soft",
      "assets/ui/v2_18/settings_cog_soft_v2_18.png",
    );
    this.load.image(
      "v218-mail-heart-icon",
      "assets/ui/v2_18/mail_heart_icon_v2_18.png",
    );
    this.load.image(
      "v218-gmark-soft-icon",
      "assets/ui/v2_18/gmark_soft_icon_v2_18.png",
    );
    this.load.image(
      "v218-gold-ticket",
      "assets/ui/v2_18/gold_ticket_v2_18.png",
    );
    this.load.image(
      "v218-blue-ticket",
      "assets/ui/v2_18/blue_ticket_v2_18.png",
    );

    // v2.19: storybook massive art pass. Transparent UI assets are WebP-swapped by the optimized raster pipeline.
    this.load.image(
      "v219-account-crest",
      "assets/ui/v2_19/account_crest_v2_19.png",
    );
    this.load.image("v219-badge-new", "assets/ui/v2_19/badge_new_v2_19.png");
    this.load.image("v219-badge-qa", "assets/ui/v2_19/badge_qa_v2_19.png");
    this.load.image(
      "v219-battle-build-spot-glow",
      "assets/ui/v2_19/battle_build_spot_glow_v2_19.png",
    );
    this.load.image(
      "v219-battle-combo-cookie",
      "assets/ui/v2_19/battle_combo_cookie_v2_19.png",
    );
    this.load.image(
      "v219-battle-safe-corner",
      "assets/ui/v2_19/battle_safe_corner_v2_19.png",
    );
    this.load.image(
      "v219-battle-side-mana-vine",
      "assets/ui/v2_19/battle_side_mana_vine_v2_19.png",
    );
    this.load.image(
      "v219-battle-spell-card-guard",
      "assets/ui/v2_19/battle_spell_card_guard_v2_19.png",
    );
    this.load.image(
      "v219-battle-spell-card-hero",
      "assets/ui/v2_19/battle_spell_card_hero_v2_19.png",
    );
    this.load.image(
      "v219-battle-spell-card-meteor",
      "assets/ui/v2_19/battle_spell_card_meteor_v2_19.png",
    );
    this.load.image(
      "v219-battle-spell-card-plush",
      "assets/ui/v2_19/battle_spell_card_plush_v2_19.png",
    );
    this.load.image(
      "v219-battle-spell-guard-badge",
      "assets/ui/v2_19/battle_spell_guard_badge_v2_19.png",
    );
    this.load.image(
      "v219-battle-spell-hero-badge",
      "assets/ui/v2_19/battle_spell_hero_badge_v2_19.png",
    );
    this.load.image(
      "v219-battle-spell-meteor-badge",
      "assets/ui/v2_19/battle_spell_meteor_badge_v2_19.png",
    );
    this.load.image(
      "v219-battle-top-story-lace",
      "assets/ui/v2_19/battle_top_story_lace_v2_19.png",
    );
    this.load.image(
      "v219-battle-wave-bookmark",
      "assets/ui/v2_19/battle_wave_bookmark_v2_19.png",
    );
    this.load.image(
      "v219-castle-banner-ribbon",
      "assets/ui/v2_19/castle_banner_ribbon_v2_19.png",
    );
    this.load.image(
      "v219-floating-music-note",
      "assets/ui/v2_19/floating_music_note_v2_19.png",
    );
    this.load.image(
      "v219-heart-leaf-confetti",
      "assets/ui/v2_19/heart_leaf_confetti_v2_19.png",
    );
    this.load.image(
      "v219-lobby-bottom-nav-glow",
      "assets/ui/v2_19/lobby_bottom_nav_glow_v2_19.png",
    );
    this.load.image(
      "v219-lobby-castle-banner",
      "assets/ui/v2_19/lobby_castle_banner_v2_19.png",
    );
    this.load.image(
      "v219-lobby-daily-stamp",
      "assets/ui/v2_19/lobby_daily_stamp_v2_19.png",
    );
    this.load.image(
      "v219-lobby-event-rosette",
      "assets/ui/v2_19/lobby_event_rosette_v2_19.png",
    );
    this.load.image(
      "v219-lobby-hero-portrait",
      "assets/ui/v2_19/lobby_hero_portrait_v2_19.png",
    );
    this.load.image(
      "v219-lobby-mail-bubble",
      "assets/ui/v2_19/lobby_mail_bubble_v2_19.png",
    );
    this.load.image(
      "v219-lobby-shop-sign",
      "assets/ui/v2_19/lobby_shop_sign_v2_19.png",
    );
    this.load.image(
      "v219-lobby-tower-portrait",
      "assets/ui/v2_19/lobby_tower_portrait_v2_19.png",
    );
    this.load.image(
      "v219-login-button-glow-google",
      "assets/ui/v2_19/login_button_glow_google_v2_19.png",
    );
    this.load.image(
      "v219-login-button-glow-quick",
      "assets/ui/v2_19/login_button_glow_quick_v2_19.png",
    );
    this.load.image(
      "v219-login-lantern-arch",
      "assets/ui/v2_19/login_lantern_arch_v2_19.png",
    );
    this.load.image(
      "v219-magic-key-badge",
      "assets/ui/v2_19/magic_key_badge_v2_19.png",
    );
    this.load.image(
      "v219-mascot-cookie-golem",
      "assets/ui/v2_19/mascot_cookie_golem_v2_19.png",
    );
    this.load.image(
      "v219-mascot-sprout-keeper",
      "assets/ui/v2_19/mascot_sprout_keeper_v2_19.png",
    );
    this.load.image(
      "v219-modal-soft-footer",
      "assets/ui/v2_19/modal_soft_footer_v2_19.png",
    );
    this.load.image(
      "v219-npc-pudding-slime",
      "assets/ui/v2_19/npc_pudding_slime_v2_19.png",
    );
    this.load.image(
      "v219-npc-sheep-mage",
      "assets/ui/v2_19/npc_sheep_mage_v2_19.png",
    );
    this.load.image(
      "v219-npc-squirrel-archer",
      "assets/ui/v2_19/npc_squirrel_archer_v2_19.png",
    );
    this.load.image(
      "v219-plush-button-idle",
      "assets/ui/v2_19/plush_button_idle_v2_19.png",
    );
    this.load.image(
      "v219-plush-button-pressed",
      "assets/ui/v2_19/plush_button_pressed_v2_19.png",
    );
    this.load.image(
      "v219-plush-cloud-backdrop",
      "assets/ui/v2_19/plush_cloud_backdrop_v2_19.png",
    );
    this.load.image(
      "v219-progress-story-beads",
      "assets/ui/v2_19/progress_story_beads_v2_19.png",
    );
    this.load.image(
      "v219-resource-coin-shell",
      "assets/ui/v2_19/resource_coin_shell_v2_19.png",
    );
    this.load.image(
      "v219-resource-gem-shell",
      "assets/ui/v2_19/resource_gem_shell_v2_19.png",
    );
    this.load.image(
      "v219-resource-star-shell",
      "assets/ui/v2_19/resource_star_shell_v2_19.png",
    );
    this.load.image(
      "v219-ribbon-tiny-tail",
      "assets/ui/v2_19/ribbon_tiny_tail_v2_19.png",
    );
    this.load.image(
      "v219-settings-wand",
      "assets/ui/v2_19/settings_wand_v2_19.png",
    );
    this.load.image(
      "v219-sparkle-bloom-cluster",
      "assets/ui/v2_19/sparkle_bloom_cluster_v2_19.png",
    );
    this.load.image(
      "v219-storybook-title-plaque",
      "assets/ui/v2_19/storybook_title_plaque_v2_19.png",
    );
    this.load.image(
      "v219-tiny-star-trail",
      "assets/ui/v2_19/tiny_star_trail_v2_19.png",
    );
    this.load.image(
      "v219-toast-storybook",
      "assets/ui/v2_19/toast_storybook_v2_19.png",
    );
    this.load.image(
      "v219-tower-upgrade-sparkle",
      "assets/ui/v2_19/tower_upgrade_sparkle_v2_19.png",
    );
    this.load.image(
      "v219-tutorial-finger-swipe",
      "assets/ui/v2_19/tutorial_finger_swipe_v2_19.png",
    );
    this.load.image(
      "v219-world-boss-gate",
      "assets/ui/v2_19/world_boss_gate_v2_19.png",
    );
    this.load.image(
      "v219-world-cloud-trail",
      "assets/ui/v2_19/world_cloud_trail_v2_19.png",
    );
    this.load.image(
      "v219-world-compass-badge",
      "assets/ui/v2_19/world_compass_badge_v2_19.png",
    );
    this.load.image(
      "v219-world-node-bloom",
      "assets/ui/v2_19/world_node_bloom_v2_19.png",
    );
    this.load.image(
      "v219-world-node-locked-cover",
      "assets/ui/v2_19/world_node_locked_cover_v2_19.png",
    );
    this.load.image(
      "v219-world-preview-storybook-frame",
      "assets/ui/v2_19/world_preview_storybook_frame_v2_19.png",
    );
    this.load.image(
      "v219-world-route-dotted-ribbon",
      "assets/ui/v2_19/world_route_dotted_ribbon_v2_19.png",
    );
    this.load.image(
      "v219-world-route-ribbon",
      "assets/ui/v2_19/world_route_ribbon_v2_19.png",
    );
    this.load.image(
      "v219-world-stage-flag",
      "assets/ui/v2_19/world_stage_flag_v2_19.png",
    );
    this.load.image(
      "v220-battle-boss-warning-rosette",
      "assets/ui/v2_20/battle_boss_warning_rosette_v2_20.png",
    );
    this.load.image(
      "v220-battle-bottom-pillow-dock",
      "assets/ui/v2_20/battle_bottom_pillow_dock_v2_20.png",
    );
    this.load.image(
      "v220-battle-build-seed-glow",
      "assets/ui/v2_20/battle_build_seed_glow_v2_20.png",
    );
    this.load.image(
      "v220-battle-combo-jelly",
      "assets/ui/v2_20/battle_combo_jelly_v2_20.png",
    );
    this.load.image(
      "v220-battle-guard-orb",
      "assets/ui/v2_20/battle_guard_orb_v2_20.png",
    );
    this.load.image(
      "v220-battle-hero-orb",
      "assets/ui/v2_20/battle_hero_orb_v2_20.png",
    );
    this.load.image(
      "v220-battle-left-flower-rail",
      "assets/ui/v2_20/battle_left_flower_rail_v2_20.png",
    );
    this.load.image(
      "v220-battle-mana-leaf-droplets",
      "assets/ui/v2_20/battle_mana_leaf_droplets_v2_20.png",
    );
    this.load.image(
      "v220-battle-meteor-orb",
      "assets/ui/v2_20/battle_meteor_orb_v2_20.png",
    );
    this.load.image(
      "v220-battle-right-flower-rail",
      "assets/ui/v2_20/battle_right_flower_rail_v2_20.png",
    );
    this.load.image(
      "v220-battle-safe-petal-corner",
      "assets/ui/v2_20/battle_safe_petal_corner_v2_20.png",
    );
    this.load.image(
      "v220-battle-spell-card-guard-dream",
      "assets/ui/v2_20/battle_spell_card_guard_dream_v2_20.png",
    );
    this.load.image(
      "v220-battle-spell-card-hero-dream",
      "assets/ui/v2_20/battle_spell_card_hero_dream_v2_20.png",
    );
    this.load.image(
      "v220-battle-spell-card-meteor-dream",
      "assets/ui/v2_20/battle_spell_card_meteor_dream_v2_20.png",
    );
    this.load.image(
      "v220-battle-top-castle-lace",
      "assets/ui/v2_20/battle_top_castle_lace_v2_20.png",
    );
    this.load.image(
      "v220-battle-wave-teacup",
      "assets/ui/v2_20/battle_wave_teacup_v2_20.png",
    );
    this.load.image(
      "v220-bottom-nav-rug",
      "assets/ui/v2_20/bottom_nav_rug_v2_20.png",
    );
    this.load.image(
      "v220-dream-cloud-arch",
      "assets/ui/v2_20/dream_cloud_arch_v2_20.png",
    );
    this.load.image(
      "v220-floating-wish-stars",
      "assets/ui/v2_20/floating_wish_stars_v2_20.png",
    );
    this.load.image(
      "v220-lobby-event-balloon",
      "assets/ui/v2_20/lobby_event_balloon_v2_20.png",
    );
    this.load.image(
      "v220-lobby-garden-gate",
      "assets/ui/v2_20/lobby_garden_gate_v2_20.png",
    );
    this.load.image(
      "v220-lobby-hero-medallion",
      "assets/ui/v2_20/lobby_hero_medallion_v2_20.png",
    );
    this.load.image(
      "v220-lobby-mail-bird",
      "assets/ui/v2_20/lobby_mail_bird_v2_20.png",
    );
    this.load.image(
      "v220-lobby-quest-book",
      "assets/ui/v2_20/lobby_quest_book_v2_20.png",
    );
    this.load.image(
      "v220-lobby-resource-gem-nest",
      "assets/ui/v2_20/lobby_resource_gem_nest_v2_20.png",
    );
    this.load.image(
      "v220-lobby-resource-gold-nest",
      "assets/ui/v2_20/lobby_resource_gold_nest_v2_20.png",
    );
    this.load.image(
      "v220-lobby-resource-heart-nest",
      "assets/ui/v2_20/lobby_resource_heart_nest_v2_20.png",
    );
    this.load.image(
      "v220-lobby-resource-star-nest",
      "assets/ui/v2_20/lobby_resource_star_nest_v2_20.png",
    );
    this.load.image(
      "v220-lobby-shop-tent",
      "assets/ui/v2_20/lobby_shop_tent_v2_20.png",
    );
    this.load.image(
      "v220-lobby-tower-medallion",
      "assets/ui/v2_20/lobby_tower_medallion_v2_20.png",
    );
    this.load.image(
      "v220-login-aurora-ribbon",
      "assets/ui/v2_20/login_aurora_ribbon_v2_20.png",
    );
    this.load.image(
      "v220-login-card-lace-frame",
      "assets/ui/v2_20/login_card_lace_frame_v2_20.png",
    );
    this.load.image(
      "v220-login-email-envelope-charm",
      "assets/ui/v2_20/login_email_envelope_charm_v2_20.png",
    );
    this.load.image(
      "v220-login-google-gem-charm",
      "assets/ui/v2_20/login_google_gem_charm_v2_20.png",
    );
    this.load.image(
      "v220-login-quick-crown-charm",
      "assets/ui/v2_20/login_quick_crown_charm_v2_20.png",
    );
    this.load.image(
      "v220-login-register-heart-charm",
      "assets/ui/v2_20/login_register_heart_charm_v2_20.png",
    );
    this.load.image(
      "v220-login-toy-castle-crest",
      "assets/ui/v2_20/login_toy_castle_crest_v2_20.png",
    );
    this.load.image(
      "v220-mascot-fox-knight",
      "assets/ui/v2_20/mascot_fox_knight_v2_20.png",
    );
    this.load.image(
      "v220-mascot-moon-kitten",
      "assets/ui/v2_20/mascot_moon_kitten_v2_20.png",
    );
    this.load.image(
      "v220-mini-announcement-scroll",
      "assets/ui/v2_20/mini_announcement_scroll_v2_20.png",
    );
    this.load.image(
      "v220-mini-settings-gearflower",
      "assets/ui/v2_20/mini_settings_gearflower_v2_20.png",
    );
    this.load.image(
      "v220-mini-support-headset",
      "assets/ui/v2_20/mini_support_headset_v2_20.png",
    );
    this.load.image(
      "v220-modal-garden-frame",
      "assets/ui/v2_20/modal_garden_frame_v2_20.png",
    );
    this.load.image(
      "v220-npc-baker-bear",
      "assets/ui/v2_20/npc_baker_bear_v2_20.png",
    );
    this.load.image(
      "v220-npc-seed-fairy",
      "assets/ui/v2_20/npc_seed_fairy_v2_20.png",
    );
    this.load.image(
      "v220-npc-tea-rabbit",
      "assets/ui/v2_20/npc_tea_rabbit_v2_20.png",
    );
    this.load.image(
      "v220-performance-feather",
      "assets/ui/v2_20/performance_feather_v2_20.png",
    );
    this.load.image(
      "v220-qa-check-badge",
      "assets/ui/v2_20/qa_check_badge_v2_20.png",
    );
    this.load.image(
      "v220-reward-rainbow-tray",
      "assets/ui/v2_20/reward_rainbow_tray_v2_20.png",
    );
    this.load.image(
      "v220-soft-divider-sparkles",
      "assets/ui/v2_20/soft_divider_sparkles_v2_20.png",
    );
    this.load.image(
      "v220-toast-garden-frame",
      "assets/ui/v2_20/toast_garden_frame_v2_20.png",
    );
    this.load.image(
      "v220-touch-safe-badge",
      "assets/ui/v2_20/touch_safe_badge_v2_20.png",
    );
    this.load.image(
      "v220-world-boss-portal-cake",
      "assets/ui/v2_20/world_boss_portal_cake_v2_20.png",
    );
    this.load.image(
      "v220-world-compass-rose",
      "assets/ui/v2_20/world_compass_rose_v2_20.png",
    );
    this.load.image(
      "v220-world-current-crown-pop",
      "assets/ui/v2_20/world_current_crown_pop_v2_20.png",
    );
    this.load.image(
      "v220-world-locked-bow",
      "assets/ui/v2_20/world_locked_bow_v2_20.png",
    );
    this.load.image(
      "v220-world-node-jelly-ring",
      "assets/ui/v2_20/world_node_jelly_ring_v2_20.png",
    );
    this.load.image(
      "v220-world-parchment-map-frame",
      "assets/ui/v2_20/world_parchment_map_frame_v2_20.png",
    );
    this.load.image(
      "v220-world-preview-garden-frame",
      "assets/ui/v2_20/world_preview_garden_frame_v2_20.png",
    );
    this.load.image(
      "v220-world-route-candy-beads",
      "assets/ui/v2_20/world_route_candy_beads_v2_20.png",
    );
    this.load.image(
      "v220-world-route-leaf-bridge",
      "assets/ui/v2_20/world_route_leaf_bridge_v2_20.png",
    );
    this.load.image(
      "v220-world-side-cloud-curtain",
      "assets/ui/v2_20/world_side_cloud_curtain_v2_20.png",
    );
    this.load.image(
      "v220-world-stage-ticket",
      "assets/ui/v2_20/world_stage_ticket_v2_20.png",
    );
    this.load.image(
      "v220-world-treasure-cart",
      "assets/ui/v2_20/world_treasure_cart_v2_20.png",
    );

    // v2.21 Candy Kingdom massive art/QA overlay assets.
    this.load.image(
      "v221-battle-boss-alert-cookie",
      "assets/ui/v2_21/battle_boss_alert_cookie_v2_21.png",
    );
    this.load.image(
      "v221-battle-bottom-cushion-dock",
      "assets/ui/v2_21/battle_bottom_cushion_dock_v2_21.png",
    );
    this.load.image(
      "v221-battle-build-flower-glow",
      "assets/ui/v2_21/battle_build_flower_glow_v2_21.png",
    );
    this.load.image(
      "v221-battle-combo-macaron",
      "assets/ui/v2_21/battle_combo_macaron_v2_21.png",
    );
    this.load.image(
      "v221-battle-guard-macaron",
      "assets/ui/v2_21/battle_guard_macaron_v2_21.png",
    );
    this.load.image(
      "v221-battle-hero-star-medal",
      "assets/ui/v2_21/battle_hero_star_medal_v2_21.png",
    );
    this.load.image(
      "v221-battle-left-vine-ribbon",
      "assets/ui/v2_21/battle_left_vine_ribbon_v2_21.png",
    );
    this.load.image(
      "v221-battle-mana-dew-chain",
      "assets/ui/v2_21/battle_mana_dew_chain_v2_21.png",
    );
    this.load.image(
      "v221-battle-meteor-lollipop",
      "assets/ui/v2_21/battle_meteor_lollipop_v2_21.png",
    );
    this.load.image(
      "v221-battle-reward-candy-tray",
      "assets/ui/v2_21/battle_reward_candy_tray_v2_21.png",
    );
    this.load.image(
      "v221-battle-right-vine-ribbon",
      "assets/ui/v2_21/battle_right_vine_ribbon_v2_21.png",
    );
    this.load.image(
      "v221-battle-safe-marshmallow-corner",
      "assets/ui/v2_21/battle_safe_marshmallow_corner_v2_21.png",
    );
    this.load.image(
      "v221-battle-spell-card-guard-candy",
      "assets/ui/v2_21/battle_spell_card_guard_candy_v2_21.png",
    );
    this.load.image(
      "v221-battle-spell-card-hero-candy",
      "assets/ui/v2_21/battle_spell_card_hero_candy_v2_21.png",
    );
    this.load.image(
      "v221-battle-spell-card-meteor-candy",
      "assets/ui/v2_21/battle_spell_card_meteor_candy_v2_21.png",
    );
    this.load.image(
      "v221-battle-top-candy-lace",
      "assets/ui/v2_21/battle_top_candy_lace_v2_21.png",
    );
    this.load.image(
      "v221-battle-wave-cupcake-flag",
      "assets/ui/v2_21/battle_wave_cupcake_flag_v2_21.png",
    );
    this.load.image(
      "v221-input-guard-badge",
      "assets/ui/v2_21/input_guard_badge_v2_21.png",
    );
    this.load.image(
      "v221-lobby-bottom-cushion-arc",
      "assets/ui/v2_21/lobby_bottom_cushion_arc_v2_21.png",
    );
    this.load.image(
      "v221-lobby-daily-bow-tag",
      "assets/ui/v2_21/lobby_daily_bow_tag_v2_21.png",
    );
    this.load.image(
      "v221-lobby-event-firefly-jar",
      "assets/ui/v2_21/lobby_event_firefly_jar_v2_21.png",
    );
    this.load.image(
      "v221-lobby-hero-pendant",
      "assets/ui/v2_21/lobby_hero_pendant_v2_21.png",
    );
    this.load.image(
      "v221-lobby-mail-pigeon",
      "assets/ui/v2_21/lobby_mail_pigeon_v2_21.png",
    );
    this.load.image(
      "v221-lobby-quest-scroll-bow",
      "assets/ui/v2_21/lobby_quest_scroll_bow_v2_21.png",
    );
    this.load.image(
      "v221-lobby-resource-gem-jam",
      "assets/ui/v2_21/lobby_resource_gem_jam_v2_21.png",
    );
    this.load.image(
      "v221-lobby-resource-gold-jam",
      "assets/ui/v2_21/lobby_resource_gold_jam_v2_21.png",
    );
    this.load.image(
      "v221-lobby-resource-heart-jam",
      "assets/ui/v2_21/lobby_resource_heart_jam_v2_21.png",
    );
    this.load.image(
      "v221-lobby-resource-star-jam",
      "assets/ui/v2_21/lobby_resource_star_jam_v2_21.png",
    );
    this.load.image(
      "v221-lobby-royal-candy-banner",
      "assets/ui/v2_21/lobby_royal_candy_banner_v2_21.png",
    );
    this.load.image(
      "v221-lobby-shop-cupcake-booth",
      "assets/ui/v2_21/lobby_shop_cupcake_booth_v2_21.png",
    );
    this.load.image(
      "v221-lobby-tower-pendant",
      "assets/ui/v2_21/lobby_tower_pendant_v2_21.png",
    );
    this.load.image(
      "v221-login-account-keyring",
      "assets/ui/v2_21/login_account_keyring_v2_21.png",
    );
    this.load.image(
      "v221-login-candy-crown-title",
      "assets/ui/v2_21/login_candy_crown_title_v2_21.png",
    );
    this.load.image(
      "v221-login-cozy-cloud-puffs",
      "assets/ui/v2_21/login_cozy_cloud_puffs_v2_21.png",
    );
    this.load.image(
      "v221-login-google-button-charm",
      "assets/ui/v2_21/login_google_button_charm_v2_21.png",
    );
    this.load.image(
      "v221-login-quick-button-charm",
      "assets/ui/v2_21/login_quick_button_charm_v2_21.png",
    );
    this.load.image(
      "v221-login-settings-candygear",
      "assets/ui/v2_21/login_settings_candygear_v2_21.png",
    );
    this.load.image(
      "v221-login-starlight-window-frame",
      "assets/ui/v2_21/login_starlight_window_frame_v2_21.png",
    );
    this.load.image(
      "v221-mascot-blossom-deer",
      "assets/ui/v2_21/mascot_blossom_deer_v2_21.png",
    );
    this.load.image(
      "v221-mascot-panda-guard",
      "assets/ui/v2_21/mascot_panda_guard_v2_21.png",
    );
    this.load.image(
      "v221-memory-clean-badge",
      "assets/ui/v2_21/memory_clean_badge_v2_21.png",
    );
    this.load.image(
      "v221-mini-quality-token-01",
      "assets/ui/v2_21/mini_quality_token_01_v2_21.png",
    );
    this.load.image(
      "v221-mini-quality-token-02",
      "assets/ui/v2_21/mini_quality_token_02_v2_21.png",
    );
    this.load.image(
      "v221-mini-quality-token-03",
      "assets/ui/v2_21/mini_quality_token_03_v2_21.png",
    );
    this.load.image(
      "v221-mini-quality-token-04",
      "assets/ui/v2_21/mini_quality_token_04_v2_21.png",
    );
    this.load.image(
      "v221-mini-quality-token-05",
      "assets/ui/v2_21/mini_quality_token_05_v2_21.png",
    );
    this.load.image(
      "v221-mini-quality-token-06",
      "assets/ui/v2_21/mini_quality_token_06_v2_21.png",
    );
    this.load.image(
      "v221-mini-quality-token-07",
      "assets/ui/v2_21/mini_quality_token_07_v2_21.png",
    );
    this.load.image(
      "v221-mini-quality-token-08",
      "assets/ui/v2_21/mini_quality_token_08_v2_21.png",
    );
    this.load.image(
      "v221-modal-candy-frame",
      "assets/ui/v2_21/modal_candy_frame_v2_21.png",
    );
    this.load.image(
      "v221-npc-cloud-shepherd",
      "assets/ui/v2_21/npc_cloud_shepherd_v2_21.png",
    );
    this.load.image(
      "v221-npc-jam-penguin",
      "assets/ui/v2_21/npc_jam_penguin_v2_21.png",
    );
    this.load.image(
      "v221-npc-maple-hedgehog",
      "assets/ui/v2_21/npc_maple_hedgehog_v2_21.png",
    );
    this.load.image(
      "v221-qa-mobile-badge",
      "assets/ui/v2_21/qa_mobile_badge_v2_21.png",
    );
    this.load.image(
      "v221-ribbon-tiny-bow",
      "assets/ui/v2_21/ribbon_tiny_bow_v2_21.png",
    );
    this.load.image(
      "v221-sparkle-sugar-dust",
      "assets/ui/v2_21/sparkle_sugar_dust_v2_21.png",
    );
    this.load.image(
      "v221-storybook-patch-plaque",
      "assets/ui/v2_21/storybook_patch_plaque_v2_21.png",
    );
    this.load.image(
      "v221-toast-candy-frame",
      "assets/ui/v2_21/toast_candy_frame_v2_21.png",
    );
    this.load.image(
      "v221-world-boss-cookie-gate",
      "assets/ui/v2_21/world_boss_cookie_gate_v2_21.png",
    );
    this.load.image(
      "v221-world-caravan-cart",
      "assets/ui/v2_21/world_caravan_cart_v2_21.png",
    );
    this.load.image(
      "v221-world-cloud-banner",
      "assets/ui/v2_21/world_cloud_banner_v2_21.png",
    );
    this.load.image(
      "v221-world-compass-cookie",
      "assets/ui/v2_21/world_compass_cookie_v2_21.png",
    );
    this.load.image(
      "v221-world-current-ribbon-crown",
      "assets/ui/v2_21/world_current_ribbon_crown_v2_21.png",
    );
    this.load.image(
      "v221-world-locked-mitten",
      "assets/ui/v2_21/world_locked_mitten_v2_21.png",
    );
    this.load.image(
      "v221-world-node-lollipop-ring",
      "assets/ui/v2_21/world_node_lollipop_ring_v2_21.png",
    );
    this.load.image(
      "v221-world-preview-candy-frame",
      "assets/ui/v2_21/world_preview_candy_frame_v2_21.png",
    );
    this.load.image(
      "v221-world-reward-flower",
      "assets/ui/v2_21/world_reward_flower_v2_21.png",
    );
    this.load.image(
      "v221-world-route-leaf-stitches",
      "assets/ui/v2_21/world_route_leaf_stitches_v2_21.png",
    );
    this.load.image(
      "v221-world-route-sugar-string",
      "assets/ui/v2_21/world_route_sugar_string_v2_21.png",
    );
    this.load.image(
      "v221-world-side-dream-clouds",
      "assets/ui/v2_21/world_side_dream_clouds_v2_21.png",
    );
    this.load.image(
      "v221-world-stage-flaglet",
      "assets/ui/v2_21/world_stage_flaglet_v2_21.png",
    );

    // v2.22 Moonberry Nursery massive art/QA overlay assets.
    this.load.image(
      "v222-battle-boss-alert-moon",
      "assets/ui/v2_22/battle_boss_alert_moon_v2_22.png",
    );
    this.load.image(
      "v222-battle-bottom-quilt-dock",
      "assets/ui/v2_22/battle_bottom_quilt_dock_v2_22.png",
    );
    this.load.image(
      "v222-battle-build-leaf-glow",
      "assets/ui/v2_22/battle_build_leaf_glow_v2_22.png",
    );
    this.load.image(
      "v222-battle-combo-berry",
      "assets/ui/v2_22/battle_combo_berry_v2_22.png",
    );
    this.load.image(
      "v222-battle-focus-totem",
      "assets/ui/v2_22/battle_focus_totem_v2_22.png",
    );
    this.load.image(
      "v222-battle-guard-badge",
      "assets/ui/v2_22/battle_guard_badge_v2_22.png",
    );
    this.load.image(
      "v222-battle-hero-badge",
      "assets/ui/v2_22/battle_hero_badge_v2_22.png",
    );
    this.load.image(
      "v222-battle-left-flower-ribbon",
      "assets/ui/v2_22/battle_left_flower_ribbon_v2_22.png",
    );
    this.load.image(
      "v222-battle-mana-pearl-chain",
      "assets/ui/v2_22/battle_mana_pearl_chain_v2_22.png",
    );
    this.load.image(
      "v222-battle-meteor-badge",
      "assets/ui/v2_22/battle_meteor_badge_v2_22.png",
    );
    this.load.image(
      "v222-battle-reward-moon-tray",
      "assets/ui/v2_22/battle_reward_moon_tray_v2_22.png",
    );
    this.load.image(
      "v222-battle-right-flower-ribbon",
      "assets/ui/v2_22/battle_right_flower_ribbon_v2_22.png",
    );
    this.load.image(
      "v222-battle-safe-pillow-corner",
      "assets/ui/v2_22/battle_safe_pillow_corner_v2_22.png",
    );
    this.load.image(
      "v222-battle-spell-card-guard-moon",
      "assets/ui/v2_22/battle_spell_card_guard_moon_v2_22.png",
    );
    this.load.image(
      "v222-battle-spell-card-hero-moon",
      "assets/ui/v2_22/battle_spell_card_hero_moon_v2_22.png",
    );
    this.load.image(
      "v222-battle-spell-card-meteor-moon",
      "assets/ui/v2_22/battle_spell_card_meteor_moon_v2_22.png",
    );
    this.load.image(
      "v222-battle-top-moon-lace",
      "assets/ui/v2_22/battle_top_moon_lace_v2_22.png",
    );
    this.load.image(
      "v222-battle-wave-moon-flag",
      "assets/ui/v2_22/battle_wave_moon_flag_v2_22.png",
    );
    this.load.image(
      "v222-decor-berry-blossom",
      "assets/ui/v2_22/decor_berry_blossom_v2_22.png",
    );
    this.load.image(
      "v222-decor-moon-sprinkle",
      "assets/ui/v2_22/decor_moon_sprinkle_v2_22.png",
    );
    this.load.image(
      "v222-decor-quilt-corner",
      "assets/ui/v2_22/decor_quilt_corner_v2_22.png",
    );
    this.load.image(
      "v222-decor-soft-divider",
      "assets/ui/v2_22/decor_soft_divider_v2_22.png",
    );
    this.load.image(
      "v222-input-guard-star",
      "assets/ui/v2_22/input_guard_star_v2_22.png",
    );
    this.load.image(
      "v222-lobby-bottom-quilt-arc",
      "assets/ui/v2_22/lobby_bottom_quilt_arc_v2_22.png",
    );
    this.load.image(
      "v222-lobby-daily-moon-tag",
      "assets/ui/v2_22/lobby_daily_moon_tag_v2_22.png",
    );
    this.load.image(
      "v222-lobby-event-lantern",
      "assets/ui/v2_22/lobby_event_lantern_v2_22.png",
    );
    this.load.image(
      "v222-lobby-growth-badge",
      "assets/ui/v2_22/lobby_growth_badge_v2_22.png",
    );
    this.load.image(
      "v222-lobby-guild-cushion",
      "assets/ui/v2_22/lobby_guild_cushion_v2_22.png",
    );
    this.load.image(
      "v222-lobby-hero-rosette",
      "assets/ui/v2_22/lobby_hero_rosette_v2_22.png",
    );
    this.load.image(
      "v222-lobby-mail-owl",
      "assets/ui/v2_22/lobby_mail_owl_v2_22.png",
    );
    this.load.image(
      "v222-lobby-moonberry-banner",
      "assets/ui/v2_22/lobby_moonberry_banner_v2_22.png",
    );
    this.load.image(
      "v222-lobby-quest-bookmark",
      "assets/ui/v2_22/lobby_quest_bookmark_v2_22.png",
    );
    this.load.image(
      "v222-lobby-resource-gem-moonjam",
      "assets/ui/v2_22/lobby_resource_gem_moonjam_v2_22.png",
    );
    this.load.image(
      "v222-lobby-resource-gold-moonjam",
      "assets/ui/v2_22/lobby_resource_gold_moonjam_v2_22.png",
    );
    this.load.image(
      "v222-lobby-resource-heart-moonjam",
      "assets/ui/v2_22/lobby_resource_heart_moonjam_v2_22.png",
    );
    this.load.image(
      "v222-lobby-resource-star-moonjam",
      "assets/ui/v2_22/lobby_resource_star_moonjam_v2_22.png",
    );
    this.load.image(
      "v222-lobby-shop-moon-cart",
      "assets/ui/v2_22/lobby_shop_moon_cart_v2_22.png",
    );
    this.load.image(
      "v222-lobby-storage-basket",
      "assets/ui/v2_22/lobby_storage_basket_v2_22.png",
    );
    this.load.image(
      "v222-lobby-tower-rosette",
      "assets/ui/v2_22/lobby_tower_rosette_v2_22.png",
    );
    this.load.image(
      "v222-login-account-stamp",
      "assets/ui/v2_22/login_account_stamp_v2_22.png",
    );
    this.load.image(
      "v222-login-cloud-puffs",
      "assets/ui/v2_22/login_cloud_puffs_v2_22.png",
    );
    this.load.image(
      "v222-login-google-button-gem",
      "assets/ui/v2_22/login_google_button_gem_v2_22.png",
    );
    this.load.image(
      "v222-login-moonberry-title",
      "assets/ui/v2_22/login_moonberry_title_v2_22.png",
    );
    this.load.image(
      "v222-login-pastel-cloud-roof",
      "assets/ui/v2_22/login_pastel_cloud_roof_v2_22.png",
    );
    this.load.image(
      "v222-login-quick-button-gem",
      "assets/ui/v2_22/login_quick_button_gem_v2_22.png",
    );
    this.load.image(
      "v222-login-quilt-window-frame",
      "assets/ui/v2_22/login_quilt_window_frame_v2_22.png",
    );
    this.load.image(
      "v222-login-safe-input-talisman",
      "assets/ui/v2_22/login_safe_input_talisman_v2_22.png",
    );
    this.load.image(
      "v222-login-settings-pinwheel",
      "assets/ui/v2_22/login_settings_pinwheel_v2_22.png",
    );
    this.load.image(
      "v222-mascot-owl-sage",
      "assets/ui/v2_22/mascot_owl_sage_v2_22.png",
    );
    this.load.image(
      "v222-mascot-peach-dragon",
      "assets/ui/v2_22/mascot_peach_dragon_v2_22.png",
    );
    this.load.image(
      "v222-mini-moon-quality-token-01",
      "assets/ui/v2_22/mini_moon_quality_token_01_v2_22.png",
    );
    this.load.image(
      "v222-mini-moon-quality-token-02",
      "assets/ui/v2_22/mini_moon_quality_token_02_v2_22.png",
    );
    this.load.image(
      "v222-mini-moon-quality-token-03",
      "assets/ui/v2_22/mini_moon_quality_token_03_v2_22.png",
    );
    this.load.image(
      "v222-mini-moon-quality-token-04",
      "assets/ui/v2_22/mini_moon_quality_token_04_v2_22.png",
    );
    this.load.image(
      "v222-mini-moon-quality-token-05",
      "assets/ui/v2_22/mini_moon_quality_token_05_v2_22.png",
    );
    this.load.image(
      "v222-mini-moon-quality-token-06",
      "assets/ui/v2_22/mini_moon_quality_token_06_v2_22.png",
    );
    this.load.image(
      "v222-mini-moon-quality-token-07",
      "assets/ui/v2_22/mini_moon_quality_token_07_v2_22.png",
    );
    this.load.image(
      "v222-mini-moon-quality-token-08",
      "assets/ui/v2_22/mini_moon_quality_token_08_v2_22.png",
    );
    this.load.image(
      "v222-mini-moon-quality-token-09",
      "assets/ui/v2_22/mini_moon_quality_token_09_v2_22.png",
    );
    this.load.image(
      "v222-mini-moon-quality-token-10",
      "assets/ui/v2_22/mini_moon_quality_token_10_v2_22.png",
    );
    this.load.image(
      "v222-mini-moon-quality-token-11",
      "assets/ui/v2_22/mini_moon_quality_token_11_v2_22.png",
    );
    this.load.image(
      "v222-mini-moon-quality-token-12",
      "assets/ui/v2_22/mini_moon_quality_token_12_v2_22.png",
    );
    this.load.image(
      "v222-modal-moon-frame",
      "assets/ui/v2_22/modal_moon_frame_v2_22.png",
    );
    this.load.image(
      "v222-npc-button-mouse",
      "assets/ui/v2_22/npc_button_mouse_v2_22.png",
    );
    this.load.image(
      "v222-npc-honeybee-princess",
      "assets/ui/v2_22/npc_honeybee_princess_v2_22.png",
    );
    this.load.image(
      "v222-npc-lilypad-frog",
      "assets/ui/v2_22/npc_lilypad_frog_v2_22.png",
    );
    this.load.image(
      "v222-npc-milk-fox",
      "assets/ui/v2_22/npc_milk_fox_v2_22.png",
    );
    this.load.image(
      "v222-performance-windmill",
      "assets/ui/v2_22/performance_windmill_v2_22.png",
    );
    this.load.image(
      "v222-qa-memory-basket",
      "assets/ui/v2_22/qa_memory_basket_v2_22.png",
    );
    this.load.image(
      "v222-qa-scene-lifebuoy",
      "assets/ui/v2_22/qa_scene_lifebuoy_v2_22.png",
    );
    this.load.image(
      "v222-qa-timer-broom",
      "assets/ui/v2_22/qa_timer_broom_v2_22.png",
    );
    this.load.image(
      "v222-qa-touch-paw",
      "assets/ui/v2_22/qa_touch_paw_v2_22.png",
    );
    this.load.image(
      "v222-qa-webp-feather",
      "assets/ui/v2_22/qa_webp_feather_v2_22.png",
    );
    this.load.image(
      "v222-ribbon-moon-bow",
      "assets/ui/v2_22/ribbon_moon_bow_v2_22.png",
    );
    this.load.image(
      "v222-sparkle-moon-dust",
      "assets/ui/v2_22/sparkle_moon_dust_v2_22.png",
    );
    this.load.image(
      "v222-storybook-moon-plaque",
      "assets/ui/v2_22/storybook_moon_plaque_v2_22.png",
    );
    this.load.image(
      "v222-toast-moon-frame",
      "assets/ui/v2_22/toast_moon_frame_v2_22.png",
    );
    this.load.image(
      "v222-world-boss-castle-gate",
      "assets/ui/v2_22/world_boss_castle_gate_v2_22.png",
    );
    this.load.image(
      "v222-world-caravan-pillow",
      "assets/ui/v2_22/world_caravan_pillow_v2_22.png",
    );
    this.load.image(
      "v222-world-cloud-banner",
      "assets/ui/v2_22/world_cloud_banner_v2_22.png",
    );
    this.load.image(
      "v222-world-compass-mooncookie",
      "assets/ui/v2_22/world_compass_mooncookie_v2_22.png",
    );
    this.load.image(
      "v222-world-current-moon-crown",
      "assets/ui/v2_22/world_current_moon_crown_v2_22.png",
    );
    this.load.image(
      "v222-world-locked-pillow-lock",
      "assets/ui/v2_22/world_locked_pillow_lock_v2_22.png",
    );
    this.load.image(
      "v222-world-minimap-scroll",
      "assets/ui/v2_22/world_minimap_scroll_v2_22.png",
    );
    this.load.image(
      "v222-world-node-moonberry-ring",
      "assets/ui/v2_22/world_node_moonberry_ring_v2_22.png",
    );
    this.load.image(
      "v222-world-preview-moon-frame",
      "assets/ui/v2_22/world_preview_moon_frame_v2_22.png",
    );
    this.load.image(
      "v222-world-reward-berry",
      "assets/ui/v2_22/world_reward_berry_v2_22.png",
    );
    this.load.image(
      "v222-world-route-leaf-ribbon",
      "assets/ui/v2_22/world_route_leaf_ribbon_v2_22.png",
    );
    this.load.image(
      "v222-world-route-pearl-string",
      "assets/ui/v2_22/world_route_pearl_string_v2_22.png",
    );
    this.load.image(
      "v222-world-side-clouds",
      "assets/ui/v2_22/world_side_clouds_v2_22.png",
    );
    this.load.image(
      "v222-world-stage-tag",
      "assets/ui/v2_22/world_stage_tag_v2_22.png",
    );


    // v2.24 Premium Illustration fast-start art assets.
    // Keep this set intentionally small: it gives the default fast path painterly quality without restoring the v2.16-v2.22 boot cost.
    ([
      ["v224-battle-boss-warning-medal", "assets/ui/v2_24/battle_boss_warning_medal_v2_24.png"],
      ["v224-battle-bottom-painted-skill-dock", "assets/ui/v2_24/battle_bottom_painted_skill_dock_v2_24.png"],
      ["v224-battle-combo-prism-badge", "assets/ui/v2_24/battle_combo_prism_badge_v2_24.png"],
      ["v224-battle-mana-leaf-crystal", "assets/ui/v2_24/battle_mana_leaf_crystal_v2_24.png"],
      ["v224-battle-side-vine-left", "assets/ui/v2_24/battle_side_vine_left_v2_24.png"],
      ["v224-battle-side-vine-right", "assets/ui/v2_24/battle_side_vine_right_v2_24.png"],
      ["v224-battle-skill-card-guard-oil", "assets/ui/v2_24/battle_skill_card_guard_oil_v2_24.png"],
      ["v224-battle-skill-card-hero-oil", "assets/ui/v2_24/battle_skill_card_hero_oil_v2_24.png"],
      ["v224-battle-skill-card-meteor-oil", "assets/ui/v2_24/battle_skill_card_meteor_oil_v2_24.png"],
      ["v224-battle-top-oilpaint-lace", "assets/ui/v2_24/battle_top_oilpaint_lace_v2_24.png"],
      ["v224-lobby-event-painted-icon", "assets/ui/v2_24/lobby_event_painted_icon_v2_24.png"],
      ["v224-lobby-mail-painted-icon", "assets/ui/v2_24/lobby_mail_painted_icon_v2_24.png"],
      ["v224-lobby-painted-command-banner", "assets/ui/v2_24/lobby_painted_command_banner_v2_24.png"],
      ["v224-lobby-quest-painted-icon", "assets/ui/v2_24/lobby_quest_painted_icon_v2_24.png"],
      ["v224-lobby-resource-gem-relic", "assets/ui/v2_24/lobby_resource_gem_relic_v2_24.png"],
      ["v224-lobby-resource-gold-relic", "assets/ui/v2_24/lobby_resource_gold_relic_v2_24.png"],
      ["v224-lobby-resource-heart-relic", "assets/ui/v2_24/lobby_resource_heart_relic_v2_24.png"],
      ["v224-lobby-resource-star-relic", "assets/ui/v2_24/lobby_resource_star_relic_v2_24.png"],
      ["v224-lobby-shop-painted-icon", "assets/ui/v2_24/lobby_shop_painted_icon_v2_24.png"],
      ["v224-lobby-storybook-notice-panel", "assets/ui/v2_24/lobby_storybook_notice_panel_v2_24.png"],
      ["v224-lobby-velvet-nav-rug", "assets/ui/v2_24/lobby_velvet_nav_rug_v2_24.png"],
      ["v224-login-aurora-ribbon", "assets/ui/v2_24/login_aurora_ribbon_v2_24.png"],
      ["v224-login-button-premium-glow", "assets/ui/v2_24/login_button_premium_glow_v2_24.png"],
      ["v224-login-cloud-save-badge", "assets/ui/v2_24/login_cloud_save_badge_v2_24.png"],
      ["v224-login-fast-start-badge", "assets/ui/v2_24/login_fast_start_badge_v2_24.png"],
      ["v224-login-glass-title-plaque", "assets/ui/v2_24/login_glass_title_plaque_v2_24.png"],
      ["v224-login-google-pearl-button", "assets/ui/v2_24/login_google_pearl_button_v2_24.png"],
      ["v224-login-painterly-card-frame", "assets/ui/v2_24/login_painterly_card_frame_v2_24.png"],
      ["v224-mascot-luna-fawn-mage", "assets/ui/v2_24/mascot_luna_fawn_mage_v2_24.png"],
      ["v224-mascot-royal-fox-knight", "assets/ui/v2_24/mascot_royal_fox_knight_v2_24.png"],
      ["v224-npc-baker-bird-artist", "assets/ui/v2_24/npc_baker_bird_artist_v2_24.png"],
      ["v224-npc-royal-cat-librarian", "assets/ui/v2_24/npc_royal_cat_librarian_v2_24.png"],
      ["v224-npc-tea-chef-sprite", "assets/ui/v2_24/npc_tea_chef_sprite_v2_24.png"],
      ["v224-perf-fast-feather-badge", "assets/ui/v2_24/perf_fast_feather_badge_v2_24.png"],
      ["v224-world-boss-aurora-gate", "assets/ui/v2_24/world_boss_aurora_gate_v2_24.png"],
      ["v224-world-cloud-atmosphere-panel", "assets/ui/v2_24/world_cloud_atmosphere_panel_v2_24.png"],
      ["v224-world-gem-stage-ring", "assets/ui/v2_24/world_gem_stage_ring_v2_24.png"],
      ["v224-world-locked-story-locket", "assets/ui/v2_24/world_locked_story_locket_v2_24.png"],
      ["v224-world-preview-oilpaint-frame", "assets/ui/v2_24/world_preview_oilpaint_frame_v2_24.png"],
      ["v224-world-prismatic-route-beads", "assets/ui/v2_24/world_prismatic_route_beads_v2_24.png"],
      ["v224-world-reward-painted-bloom", "assets/ui/v2_24/world_reward_painted_bloom_v2_24.png"],
      ["v224-world-selected-celestial-crown", "assets/ui/v2_24/world_selected_celestial_crown_v2_24.png"],
    ] as const).forEach(([key, path]) => this.load.image(key, path));

    // v2.10 mobile design polish assets: cleaner compact plates, smaller touch UI, and WebP-first frames.
    this.load.image(
      "v2-mobile-chip-v210",
      "assets/ui/v2_15/mobile_chip_v2_15.png",
    );
    this.load.image(
      "v2-toast-plaque-v210",
      "assets/ui/v2_15/toast_plaque_v2_15.png",
    );
    this.load.image(
      "v2-mini-badge-gold-v211",
      "assets/ui/v2_15/mini_badge_gold_v2_15.png",
    );
    this.load.image(
      "v2-mini-badge-green-v211",
      "assets/ui/v2_15/mini_badge_green_v2_15.png",
    );
    this.load.image(
      "v2-lobby-strategy-card-v210",
      "assets/ui/v2_15/lobby_strategy_card_v2_15.png",
    );
    this.load.image(
      "v2-lobby-side-button-v210",
      "assets/ui/v2_15/lobby_side_button_v2_15.png",
    );
    this.load.image(
      "v2-resource-pill-v210",
      "assets/ui/v2_15/resource_pill_v2_15.png",
    );
    this.load.image(
      "v1-combat-button-blue-v18",
      "assets/ui/v2_15/button_blue_v2_15.png",
    );
    this.load.image(
      "v1-combat-button-gold-v18",
      "assets/ui/v2_15/button_gold_v2_15.png",
    );
    this.load.image(
      "v1-combat-button-green-v18",
      "assets/ui/v2_15/button_green_v2_15.png",
    );
    this.load.image(
      "v1-combat-button-red-v18",
      "assets/ui/v2_15/button_red_v2_15.png",
    );

    // v2.7: tactical order draft UI. All heavy raster assets prefer WebP through the optimized loader.
    this.load.image(
      "v2-order-panel-v27",
      "assets/ui/v2_7/order_panel_v2_7.png",
    );
    this.load.image("v2-order-card-v27", "assets/ui/v2_7/order_card_v2_7.png");
    this.load.image(
      "v2-command-scroll-v27",
      "assets/ui/v2_7/command_scroll_v2_7.png",
    );
    this.load.image(
      "v2-order-icon-gold-v27",
      "assets/ui/v2_7/order_icon_gold_v2_7.png",
    );
    this.load.image(
      "v2-order-icon-engineer-v27",
      "assets/ui/v2_7/order_icon_engineer_v2_7.png",
    );
    this.load.image(
      "v2-order-icon-hero-v27",
      "assets/ui/v2_7/order_icon_hero_v2_7.png",
    );
    this.load.image(
      "v2-order-icon-mana-v27",
      "assets/ui/v2_7/order_icon_mana_v2_7.png",
    );
    this.load.image(
      "v2-order-icon-shield-v27",
      "assets/ui/v2_7/order_icon_shield_v2_7.png",
    );
    this.load.image(
      "v2-order-icon-speed-v27",
      "assets/ui/v2_7/order_icon_speed_v2_7.png",
    );
    this.load.image(
      "v2-order-icon-bow-v27",
      "assets/ui/v2_7/order_icon_bow_v2_7.png",
    );
    this.load.image(
      "v2-order-icon-arcane-v27",
      "assets/ui/v2_7/order_icon_arcane_v2_7.png",
    );
    this.load.image(
      "v2-wave-banner-frame",
      "assets/ui/v2_2/wave_banner_frame_v2_2.png",
    );

    // v2.8: battle contract UI / compact mobile objectives.
    this.load.image(
      "v2-contract-chip",
      "assets/ui/v2_8/contract_chip_v2_8.png",
    );
    this.load.image(
      "v2-contract-panel",
      "assets/ui/v2_8/contract_panel_v2_8.png",
    );
    this.load.image(
      "v2-contract-result-panel",
      "assets/ui/v2_8/contract_result_panel_v2_8.png",
    );
    this.load.image(
      "v2-contract-card-blue",
      "assets/ui/v2_8/contract_card_blue_v2_8.png",
    );
    this.load.image(
      "v2-contract-card-gold",
      "assets/ui/v2_8/contract_card_gold_v2_8.png",
    );
    this.load.image(
      "v2-contract-card-green",
      "assets/ui/v2_8/contract_card_green_v2_8.png",
    );
    this.load.image(
      "v2-contract-icon-kill",
      "assets/ui/v2_8/contract_icon_kill_v2_8.png",
    );
    this.load.image(
      "v2-contract-icon-build",
      "assets/ui/v2_8/contract_icon_build_v2_8.png",
    );
    this.load.image(
      "v2-contract-icon-spell",
      "assets/ui/v2_8/contract_icon_spell_v2_8.png",
    );
    this.load.image(
      "v2-contract-icon-flawless",
      "assets/ui/v2_8/contract_icon_flawless_v2_8.png",
    );
    this.load.image(
      "v2-contract-icon-combo",
      "assets/ui/v2_8/contract_icon_combo_v2_8.png",
    );
    this.load.image(
      "v2-contract-icon-speed",
      "assets/ui/v2_8/contract_icon_speed_v2_8.png",
    );
    this.load.image(
      "v2-mini-chip-gold",
      "assets/ui/v2_8/mini_chip_gold_v2_8.png",
    );
    this.load.image(
      "v2-mini-chip-green",
      "assets/ui/v2_8/mini_chip_green_v2_8.png",
    );

    [
      "goblin",
      "orc",
      "wolf",
      "skeleton",
      "rogue",
      "boar",
      "bat",
      "dragon",
    ].forEach((unit) => {
      this.load.image(
        `v1-enemy-art-${unit}`,
        `assets/units/v2_1/enemy_${unit}_v2_1.png`,
      );
    });
    ["knight", "archer", "mage", "paladin", "druid"].forEach((hero) => {
      this.load.image(
        `v1-hero-art-${hero}`,
        hero === "knight"
          ? "assets/units/v2_4/hero_knight_v2_4.png"
          : `assets/units/v2_1/hero_${hero}_v2_1.png`,
      );
    });

    this.load.image(
      "ui-battle-loading-v42",
      "assets/ui/battle_loading_frame_v42.png",
    );
    this.load.image("ui-loading-crest-v42", "assets/ui/loading_crest_v42.png");
    this.load.image("ui-tower-panel-v42", "assets/ui/tower_panel_v42.png");
    this.load.image(
      "ui-reward-stage-panel-v42",
      "assets/ui/reward_stage_panel_v42.png",
    );
    this.load.image("ui-button-action-v42", "assets/ui/button_action_v42.png");
    this.load.image("ui-button-blue-v42", "assets/ui/button_blue_v42.png");
    this.load.image("ui-button-danger-v42", "assets/ui/button_danger_v42.png");
    this.load.image(
      "ui-reward-chest-glow-v42",
      "assets/ui/reward_chest_glow_v42.png",
    );
    this.load.image(
      "ui-tower-action-icons-v42",
      "assets/ui/tower_action_icons_v42.png",
    );
    this.load.image(
      "fx-click-burst-v42",
      "assets/effects/fx_click_burst_v42.png",
    );
    this.load.image("ui-forge-bg-v36", "assets/ui/forge_bg_v36.png");
    this.load.image(
      "ui-forge-result-panel-v36",
      "assets/ui/forge_result_panel_v36.png",
    );
    this.load.image(
      "ui-forge-detail-panel-v36",
      "assets/ui/forge_detail_panel_v36.png",
    );
    this.load.image(
      "ui-forge-resource-panel-v36",
      "assets/ui/forge_resource_panel_v36.png",
    );
    this.load.image("ui-chest-wood-v36", "assets/ui/chest_wood_v36.png");
    this.load.image("ui-chest-iron-v36", "assets/ui/chest_iron_v36.png");
    this.load.image("ui-chest-royal-v36", "assets/ui/chest_royal_v36.png");
    this.load.image("ui-chest-mythic-v36", "assets/ui/chest_mythic_v36.png");
    [
      "oakLongbow",
      "arcaneCore",
      "captainsBanner",
      "thunderPowder",
      "merchantLedger",
      "sunstoneAmulet",
      "hexedHourglass",
      "royalBulwark",
      "shadowDagger",
      "dragonScale",
      "voidPrism",
      "kingsCrown",
    ].forEach((artifact) => {
      this.load.image(
        `ui-artifact-${artifact}-v36`,
        `assets/ui/artifact_${artifact}_v36.png`,
      );
    });
    this.load.image("portrait-knight", "assets/ui/portrait_knight.png");
    this.load.image("portrait-ranger", "assets/ui/portrait_ranger.png");
    this.load.image("portrait-mage", "assets/ui/portrait_mage.png");
    this.load.image("icon-hero-knight", "assets/icons/icon_hero_knight.png");
    this.load.image("icon-hero-ranger", "assets/icons/icon_hero_ranger.png");
    this.load.image("icon-hero-mage", "assets/icons/icon_hero_mage.png");
    this.load.image("icon-reward-chest", "assets/icons/icon_reward_chest.png");

    this.load.image("map-thumb-stage-001", "assets/maps/map_stage_001.png");
    this.load.image("map-thumb-stage-002", "assets/maps/map_stage_002.png");
    this.load.image("map-thumb-stage-003", "assets/maps/map_stage_003.png");
    this.load.image("map-thumb-stage-004", "assets/maps/map_stage_004.png");
    this.load.image("map-thumb-stage-005", "assets/maps/map_stage_005.png");
    this.load.image("map-thumb-stage-006", "assets/maps/map_stage_006.png");
    this.load.image("map-thumb-stage-007", "assets/maps/map_stage_007.png");
    this.load.image("map-thumb-stage-008", "assets/maps/map_stage_008.png");
    this.load.image("map-thumb-stage-009", "assets/maps/map_stage_009.png");
    this.load.image("map-thumb-stage-010", "assets/maps/map_stage_010.png");
    this.load.image("map-thumb-stage-011", "assets/maps/map_stage_011.png");
    this.load.image("map-thumb-stage-012", "assets/maps/map_stage_012.png");
    this.load.image("map-card-stage-001", "assets/maps/stage_card_001.png");
    this.load.image("map-card-stage-002", "assets/maps/stage_card_002.png");
    this.load.image("map-card-stage-003", "assets/maps/stage_card_003.png");
    this.load.image("map-card-stage-004", "assets/maps/stage_card_004.png");
    this.load.image("map-card-stage-005", "assets/maps/stage_card_005.png");
    this.load.image("map-card-stage-006", "assets/maps/stage_card_006.png");
    this.load.image("map-card-stage-007", "assets/maps/stage_card_007.png");
    this.load.image("map-card-stage-008", "assets/maps/stage_card_008.png");
    this.load.image("map-card-stage-009", "assets/maps/stage_card_009.png");
    this.load.image("map-card-stage-010", "assets/maps/stage_card_010.png");
    this.load.image("map-card-stage-011", "assets/maps/stage_card_011.png");
    this.load.image("map-card-stage-012", "assets/maps/stage_card_012.png");
    this.load.image(
      "battle-bg-stage_001",
      "assets/maps/v2_15/battle_stage_001_v2_15.png",
    );
    this.load.image(
      "battle-bg-stage_002",
      "assets/maps/v2_15/battle_stage_002_v2_15.png",
    );
    this.load.image(
      "battle-bg-stage_003",
      "assets/maps/v2_15/battle_stage_003_v2_15.png",
    );
    this.load.image(
      "battle-bg-stage_004",
      "assets/maps/v2_15/battle_stage_004_v2_15.png",
    );
    this.load.image(
      "battle-bg-stage_005",
      "assets/maps/v2_15/battle_stage_005_v2_15.png",
    );
    this.load.image(
      "battle-bg-stage_006",
      "assets/maps/v2_15/battle_stage_006_v2_15.png",
    );
    this.load.image(
      "battle-bg-stage_007",
      "assets/maps/v2_15/battle_stage_007_v2_15.png",
    );
    this.load.image(
      "battle-bg-stage_008",
      "assets/maps/v2_15/battle_stage_008_v2_15.png",
    );
    this.load.image(
      "battle-bg-stage_009",
      "assets/maps/v2_15/battle_stage_009_v2_15.png",
    );
    this.load.image(
      "battle-bg-stage_010",
      "assets/maps/v2_15/battle_stage_010_v2_15.png",
    );
    this.load.image(
      "battle-bg-stage_011",
      "assets/maps/v2_15/battle_stage_011_v2_15.png",
    );
    this.load.image(
      "battle-bg-stage_012",
      "assets/maps/v2_15/battle_stage_012_v2_15.png",
    );
    this.load.image(
      "v2-wave-event-frame-v26",
      "assets/ui/v2_6/wave_event_frame_v2_6.png",
    );
    this.load.image(
      "v2-wave-icon-supply-v26",
      "assets/ui/v2_6/wave_icon_supply_v2_6.png",
    );
    this.load.image(
      "v2-wave-icon-elite-v26",
      "assets/ui/v2_6/wave_icon_elite_v2_6.png",
    );
    this.load.image(
      "v2-wave-icon-mana-v26",
      "assets/ui/v2_6/wave_icon_mana_v2_6.png",
    );
    this.load.image(
      "v2-wave-icon-storm-v26",
      "assets/ui/v2_6/wave_icon_storm_v2_6.png",
    );
    this.load.image(
      "v2-prop-crystal-v26",
      "assets/props/v2_6/prop_crystal_v2_6.png",
    );
    this.load.image("v2-prop-camp-v26", "assets/props/v2_6/prop_camp_v2_6.png");
    this.load.image(
      "v2-prop-banner-v26",
      "assets/props/v2_6/prop_banner_v2_6.png",
    );
    this.load.image("v2-prop-ruin-v26", "assets/props/v2_6/prop_ruin_v2_6.png");
    this.load.image(
      "v2-prop-portal-v26",
      "assets/props/v2_6/prop_portal_v2_6.png",
    );

    this.load.spritesheet("hero-knight", "assets/sprites/hero_knight.png", {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet("soldier-blue", "assets/sprites/soldier_blue.png", {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet(
      "mercenary-green",
      "assets/sprites/mercenary_green.png",
      { frameWidth: 32, frameHeight: 32 },
    );
    this.load.spritesheet("projectiles", "assets/sprites/projectiles.png", {
      frameWidth: 16,
      frameHeight: 16,
    });
    this.load.spritesheet("fx-build-dust", "assets/effects/fx_build_dust.png", {
      frameWidth: 64,
      frameHeight: 64,
    });
    this.load.spritesheet(
      "fx-upgrade-burst",
      "assets/effects/fx_upgrade_burst.png",
      { frameWidth: 64, frameHeight: 64 },
    );
    this.load.spritesheet("fx-death-poof", "assets/effects/fx_death_poof.png", {
      frameWidth: 64,
      frameHeight: 64,
    });
    this.load.spritesheet(
      "fx-explosion-burst",
      "assets/effects/fx_explosion_burst.png",
      { frameWidth: 64, frameHeight: 64 },
    );
    this.load.spritesheet(
      "fx-meteor-impact-v32",
      "assets/effects/fx_meteor_impact_v32.png",
      { frameWidth: 96, frameHeight: 96 },
    );
    this.load.spritesheet(
      "fx-arcane-surge-v32",
      "assets/effects/fx_arcane_surge_v32.png",
      { frameWidth: 96, frameHeight: 96 },
    );
    this.load.spritesheet(
      "fx-holy-gate-v32",
      "assets/effects/fx_holy_gate_v32.png",
      { frameWidth: 96, frameHeight: 96 },
    );
    this.load.spritesheet(
      "fx-earth-stomp-v32",
      "assets/effects/fx_earth_stomp_v32.png",
      { frameWidth: 96, frameHeight: 96 },
    );
    this.load.spritesheet(
      "fx-boss-arena-v32",
      "assets/effects/fx_boss_arena_v32.png",
      { frameWidth: 96, frameHeight: 96 },
    );
    this.load.image(
      "ui-spell-meteor-card-v32",
      "assets/ui/spell_meteor_card_v32.png",
    );
    this.load.image(
      "ui-spell-mercenary-card-v32",
      "assets/ui/spell_mercenary_card_v32.png",
    );
    this.load.image(
      "ui-spell-hero-card-v32",
      "assets/ui/spell_hero_card_v32.png",
    );
    this.load.image(
      "ui-boss-pattern-banner-v32",
      "assets/ui/boss_pattern_banner_v32.png",
    );
    this.load.image(
      "ui-spell-status-bar-v32",
      "assets/ui/spell_status_bar_v32.png",
    );
    this.load.image(
      "ui-tower-cutin-v33",
      "assets/ui/tower_cutin_panel_v33.png",
    );
    this.load.image("ui-tower-seal-v33", "assets/ui/tower_skill_seal_v33.png");
    this.load.image(
      "ui-boss-status-v33",
      "assets/ui/boss_status_panel_v33.png",
    );
    this.load.spritesheet(
      "fx-projectile-trail-v33",
      "assets/effects/fx_projectile_trail_v33.png",
      { frameWidth: 96, frameHeight: 32 },
    );
    this.load.spritesheet(
      "fx-tower-impact-v33",
      "assets/effects/fx_tower_impact_v33.png",
      { frameWidth: 96, frameHeight: 96 },
    );

    ENEMY_KEYS.forEach((kind) => {
      this.load.spritesheet(
        `enemy-${kind}`,
        `assets/sprites/enemy_${kind}.png`,
        { frameWidth: 32, frameHeight: 32 },
      );
    });

    TOWER_KEYS.forEach((kind) => {
      this.load.image(`tower-${kind}`, `assets/towers/v2_1/tower_${kind}.png`);
      TOWER_LEVELS.forEach((level) => {
        this.load.image(
          `tower-${kind}-lv${level}`,
          `assets/towers/v2_1/tower_${kind}_lv${level}.png`,
        );
      });
    });

    TOWER_MASTERIES.forEach((mastery) => {
      const kind = mastery.split("_")[0];
      this.load.image(
        `tower-${kind}-${mastery}`,
        `assets/towers/v2_1/tower_${mastery}.png`,
      );
    });

    this.load.image("ui-panel-parchment", "assets/ui/panel_parchment.png");

    [
      "armor",
      "magic",
      "flying",
      "swift",
      "boss",
      "tank",
      "regen",
      "summon",
    ].forEach((trait) => {
      this.load.image(
        `ui-monster-trait-${trait}`,
        `assets/ui/monster_trait_${trait}.png`,
      );
    });
    ["ogre", "golem", "demonlord", "phoenix", "dragon", "titan"].forEach(
      (boss) => {
        this.load.image(
          `ui-boss-nameplate-${boss}`,
          `assets/ui/boss_nameplate_${boss}.png`,
        );
      },
    );

    this.load.image(
      "ui-import-button",
      "assets/imported/ui/ui_wenrexa_button.png",
    );
    this.load.image(
      "ui-import-panel",
      "assets/imported/ui/ui_wenrexa_panel.png",
    );
    this.load.image(
      "ui-import-arrow-left",
      "assets/imported/ui/ui_wenrexa_arrow_left.png",
    );
    this.load.image(
      "ui-import-arrow-right",
      "assets/imported/ui/ui_wenrexa_arrow_right.png",
    );
    this.load.image(
      "ui-import-medieval-sheet",
      "assets/imported/ui/ui_medieval_sheet.png",
    );
    this.load.image(
      "ui-import-circle",
      "assets/imported/ui/ui_wenrexa_circle.png",
    );
    this.load.image(
      "import-tiny-soldier-walk",
      "assets/imported/characters/tiny_soldier_walk.png",
    );
    this.load.image(
      "import-tiny-orc-walk",
      "assets/imported/characters/tiny_orc_walk.png",
    );
    this.load.image(
      "import-loot-adventurer",
      "assets/imported/characters/loot_adventurer_32_sheet.png",
    );
    this.load.image(
      "import-infernus-altar",
      "assets/imported/tiles/infernus_altar.png",
    );

    const audioMap: Record<string, string> = {
      sfx_click: "click.wav",
      sfx_build: "build.wav",
      sfx_upgrade: "upgrade.wav",
      sfx_shoot: "shoot.wav",
      sfx_hit: "hit.wav",
      sfx_magic: "magic.wav",
      sfx_explosion: "explosion.wav",
      sfx_wave: "wave.wav",
      sfx_win: "win.wav",
      sfx_lose: "lose.wav",
      bgm_world: "bgm_world.wav",
      bgm_battle: "bgm_battle.wav",
      bgm_boss: "bgm_boss.wav",
      bgm_battle_old: "music_loop.wav",
    };

    Object.entries(audioMap).forEach(([key, file]) => {
      this.load.audio(key, [`assets/audio/${file}`]);
    });

    this.load.image(
      "ui-tower-panel-premium-v45",
      "assets/ui/tower_panel_premium_v45.png",
    );
    this.load.image(
      "ui-tower-evolution-panel-v45",
      "assets/ui/tower_evolution_panel_v45.png",
    );
    this.load.image(
      "ui-reward-open-panel-v45",
      "assets/ui/reward_open_panel_v45.png",
    );
    this.load.image(
      "ui-monster-intel-panel-v45",
      "assets/ui/monster_intel_panel_v45.png",
    );
    this.load.image(
      "ui-combat-loading-panel-v45",
      "assets/ui/combat_loading_panel_v45.png",
    );
    this.load.image(
      "ui-wave-preview-panel-v45",
      "assets/ui/wave_preview_panel_v45.png",
    );
    this.load.image("ui-toast-panel-v45", "assets/ui/toast_panel_v45.png");
    this.load.image(
      "ui-tower-btn-upgrade-v45",
      "assets/ui/tower_button_upgrade_v45.png",
    );
    this.load.image(
      "ui-tower-btn-sell-v45",
      "assets/ui/tower_button_sell_v45.png",
    );
    this.load.image(
      "ui-tower-btn-swap-v45",
      "assets/ui/tower_button_swap_v45.png",
    );
    this.load.image(
      "ui-tower-btn-boost-v45",
      "assets/ui/tower_button_boost_v45.png",
    );
    this.load.image(
      "ui-tower-btn-target-v45",
      "assets/ui/tower_button_target_v45.png",
    );
    this.load.image(
      "ui-tower-btn-rally-v45",
      "assets/ui/tower_button_rally_v45.png",
    );
    this.load.image(
      "ui-reward-open-button-v45",
      "assets/ui/reward_open_button_v45.png",
    );
    this.load.image(
      "ui-confirm-button-v45",
      "assets/ui/confirm_button_v45.png",
    );
    this.load.image("ui-cancel-button-v45", "assets/ui/cancel_button_v45.png");
    this.load.image("ui-stat-hp-v45", "assets/ui/stat_bar_hp_v45.png");
    this.load.image("ui-stat-damage-v45", "assets/ui/stat_bar_damage_v45.png");
    this.load.image("ui-stat-range-v45", "assets/ui/stat_bar_range_v45.png");
    this.load.image("ui-stat-speed-v45", "assets/ui/stat_bar_speed_v45.png");
    this.load.image(
      "ui-tower-role-archer-v45",
      "assets/ui/tower_role_archer_v45.png",
    );
    this.load.image(
      "ui-tower-role-mage-v45",
      "assets/ui/tower_role_mage_v45.png",
    );
    this.load.image(
      "ui-tower-role-barracks-v45",
      "assets/ui/tower_role_barracks_v45.png",
    );
    this.load.image(
      "ui-tower-role-artillery-v45",
      "assets/ui/tower_role_artillery_v45.png",
    );

    this.load.image(
      "ui-safe-battle-frame-v46",
      "assets/ui/safe_battle_frame_v46.png",
    );
    this.load.image(
      "ui-start-gate-card-v46",
      "assets/ui/start_gate_card_v46.png",
    );
    this.load.image(
      "ui-back-guard-card-v46",
      "assets/ui/back_guard_card_v46.png",
    );
    this.load.image(
      "ui-tower-click-ring-v46",
      "assets/ui/tower_click_ring_v46.png",
    );
    this.load.image(
      "ui-map-edge-shadow-v46",
      "assets/ui/map_edge_shadow_v46.png",
    );

    this.load.image(
      "ui-build-menu-frame-v47",
      "assets/ui/build_menu_frame_v47.png",
    );
    this.load.image(
      "ui-tower-panel-anchor-v47",
      "assets/ui/tower_panel_anchor_v47.png",
    );
    this.load.image(
      "ui-start-loading-card-v47",
      "assets/ui/start_loading_card_v47.png",
    );
    this.load.image(
      "ui-guard-exit-card-v47",
      "assets/ui/guard_exit_card_v47.png",
    );
    this.load.image(
      "ui-wave-card-refined-v47",
      "assets/ui/wave_card_refined_v47.png",
    );
    this.load.image(
      "ui-tower-click-ring-v47",
      "assets/ui/tower_click_ring_v47.png",
    );
    this.load.image(
      "ui-panel-anchor-arrow-v47",
      "assets/ui/panel_anchor_arrow_v47.png",
    );
    this.load.image(
      "ui-safe-area-overlay-v47",
      "assets/ui/safe_area_overlay_v47.png",
    );
    this.load.image(
      "ui-worldmap-bottom-dock-v47",
      "assets/ui/worldmap_bottom_dock_v47.png",
    );
    this.load.image(
      "ui-combat-hud-refine-v47",
      "assets/ui/combat_hud_refine_v47.png",
    );
    this.load.image(
      "fx-pointer-spark-v47",
      "assets/effects/fx_pointer_spark_v47.png",
    );
    for (let i = 1; i <= 4; i += 1) {
      this.load.image(
        `ui-stage-glow-frame-v47-${i}`,
        `assets/ui/stage_glow_frame_v47_${i}.png`,
      );
    }

    for (let i = 0; i < 8; i += 1) {
      this.load.image(
        `fx-reward-open-v45-${i}`,
        `assets/effects/reward_open_fx_v45_${i}.png`,
      );
    }

    ["armor", "magic", "flying", "swift", "boss", "tank"].forEach((trait) => {
      this.load.image(
        `ui-trait-${trait}`,
        `assets/ui/monster_trait_${trait}.png`,
      );
    });

    [
      "goblin",
      "wolf",
      "bat",
      "orc",
      "shield",
      "shaman",
      "wasp",
      "ogre",
      "raider",
      "gargoyle",
      "dark_mage",
      "golem",
      "gate_lord",
      "cultist",
      "assassin",
      "wyvern",
      "necromancer",
      "flesh_golem",
      "fire_imp",
      "hellhound",
      "obsidian_knight",
      "phoenix",
      "dragon",
      "voidling",
      "void_priest",
      "nightmare_knight",
      "titan",
      "skeleton",
      "zombie",
      "demon",
      "boss",
    ].forEach((enemy) => {
      this.load.image(
        `ui-enemy-portrait-${enemy}`,
        `assets/ui/enemy_portrait_${enemy}.png`,
      );
    });
  }

  private installOptimizedRasterPipeline(): void {
    const loader = this.load as Phaser.Loader.LoaderPlugin & {
      maxParallelDownloads?: number;
    };
    loader.maxParallelDownloads = FAST_BOOT ? 4 : 6;

    const originalImage = loader.image.bind(loader);
    loader.image = ((
      key:
        | string
        | Phaser.Types.Loader.FileTypes.ImageFileConfig
        | Phaser.Types.Loader.FileTypes.ImageFileConfig[],
      url?: string | string[],
      xhrSettings?: Phaser.Types.Loader.XHRSettingsObject,
    ) => {
      if (typeof key === "string" && typeof url === "string") {
        if (shouldFastBootSkip(key, url)) return loader;
        return originalImage(key, rasterPath(url), xhrSettings);
      }
      return originalImage(key as never, url as never, xhrSettings);
    }) as typeof loader.image;

    const originalSpritesheet = loader.spritesheet.bind(loader);
    loader.spritesheet = ((
      key:
        | string
        | Phaser.Types.Loader.FileTypes.SpriteSheetFileConfig
        | Phaser.Types.Loader.FileTypes.SpriteSheetFileConfig[],
      url?: string,
      frameConfig?: Phaser.Types.Loader.FileTypes.ImageFrameConfig,
      xhrSettings?: Phaser.Types.Loader.XHRSettingsObject,
    ) => {
      if (
        typeof key === "string" &&
        typeof url === "string" &&
        shouldFastBootSkip(key, url)
      )
        return loader;
      return originalSpritesheet(
        key as never,
        url as never,
        frameConfig as never,
        xhrSettings,
      );
    }) as typeof loader.spritesheet;

    const originalAudio = loader.audio.bind(loader);
    loader.audio = ((
      key:
        | string
        | Phaser.Types.Loader.FileTypes.AudioFileConfig
        | Phaser.Types.Loader.FileTypes.AudioFileConfig[],
      urls?: string | string[],
      config?: Phaser.Types.Loader.FileTypes.AudioFileConfig,
      xhrSettings?: Phaser.Types.Loader.XHRSettingsObject,
    ) => {
      if (
        typeof key === "string" &&
        key.startsWith("bgm_") &&
        FAST_BOOT &&
        !BOOT_QUERY.has("preloadMusic")
      )
        return loader;
      return originalAudio(
        key as never,
        urls as never,
        config as never,
        xhrSettings,
      );
    }) as typeof loader.audio;
  }

  create(): void {
    if (
      this.textures.exists("fx-compact-shimmer-v48") &&
      !this.anims.exists("fx-compact-shimmer-v48-anim")
    ) {
      this.anims.create({
        key: "fx-compact-shimmer-v48-anim",
        frames: this.anims.generateFrameNumbers("fx-compact-shimmer-v48", {
          start: 0,
          end: 7,
        }),
        frameRate: 8,
        repeat: -1,
      });
    }

    if (
      this.textures.exists("fx-boutique-shimmer-v49") &&
      !this.anims.exists("fx-boutique-shimmer-v49-anim")
    ) {
      this.anims.create({
        key: "fx-boutique-shimmer-v49-anim",
        frames: this.anims.generateFrameNumbers("fx-boutique-shimmer-v49", {
          start: 0,
          end: 7,
        }),
        frameRate: 9,
        repeat: -1,
      });
    }

    this.createAnimations();
    window.addEventListener(
      "kingdom-seed:user-activated",
      () => unlockAudio(this),
      { once: true },
    );
    this.input.once("pointerdown", () => unlockAudio(this));
    this.scene.start("MenuScene");
  }

  private createAnimations(): void {
    const anims: AnimSpec[] = [
      {
        key: "hero-idle",
        texture: "hero-knight",
        start: 0,
        end: 3,
        frameRate: 5,
        repeat: -1,
      },
      {
        key: "hero-move",
        texture: "hero-knight",
        start: 4,
        end: 7,
        frameRate: 9,
        repeat: -1,
      },
      {
        key: "hero-attack",
        texture: "hero-knight",
        start: 8,
        end: 11,
        frameRate: 14,
        repeat: 0,
      },
      {
        key: "soldier-idle",
        texture: "soldier-blue",
        start: 0,
        end: 3,
        frameRate: 6,
        repeat: -1,
      },
      {
        key: "soldier-move",
        texture: "soldier-blue",
        start: 4,
        end: 7,
        frameRate: 9,
        repeat: -1,
      },
      {
        key: "soldier-attack",
        texture: "soldier-blue",
        start: 8,
        end: 11,
        frameRate: 13,
        repeat: 0,
      },
      {
        key: "mercenary-idle",
        texture: "mercenary-green",
        start: 0,
        end: 3,
        frameRate: 6,
        repeat: -1,
      },
      {
        key: "mercenary-move",
        texture: "mercenary-green",
        start: 4,
        end: 7,
        frameRate: 9,
        repeat: -1,
      },
      {
        key: "mercenary-attack",
        texture: "mercenary-green",
        start: 8,
        end: 11,
        frameRate: 13,
        repeat: 0,
      },
      {
        key: "ui-particle-glow",
        texture: "ui-particles",
        start: 0,
        end: 3,
        frameRate: 4,
        repeat: -1,
      },
      {
        key: "fx-build-dust-play",
        texture: "fx-build-dust",
        start: 0,
        end: 5,
        frameRate: 18,
        repeat: 0,
      },
      {
        key: "fx-upgrade-burst-play",
        texture: "fx-upgrade-burst",
        start: 0,
        end: 7,
        frameRate: 20,
        repeat: 0,
      },
      {
        key: "fx-death-poof-play",
        texture: "fx-death-poof",
        start: 0,
        end: 5,
        frameRate: 18,
        repeat: 0,
      },
      {
        key: "fx-explosion-burst-play",
        texture: "fx-explosion-burst",
        start: 0,
        end: 6,
        frameRate: 20,
        repeat: 0,
      },
      {
        key: "fx-meteor-impact-v32-play",
        texture: "fx-meteor-impact-v32",
        start: 0,
        end: 7,
        frameRate: 22,
        repeat: 0,
      },
      {
        key: "fx-arcane-surge-v32-play",
        texture: "fx-arcane-surge-v32",
        start: 0,
        end: 7,
        frameRate: 20,
        repeat: 0,
      },
      {
        key: "fx-holy-gate-v32-play",
        texture: "fx-holy-gate-v32",
        start: 0,
        end: 7,
        frameRate: 18,
        repeat: 0,
      },
      {
        key: "fx-earth-stomp-v32-play",
        texture: "fx-earth-stomp-v32",
        start: 0,
        end: 7,
        frameRate: 20,
        repeat: 0,
      },
      {
        key: "fx-boss-arena-v32-play",
        texture: "fx-boss-arena-v32",
        start: 0,
        end: 7,
        frameRate: 18,
        repeat: 0,
      },
      {
        key: "fx-projectile-trail-v33-play",
        texture: "fx-projectile-trail-v33",
        start: 0,
        end: 5,
        frameRate: 22,
        repeat: 0,
      },
      {
        key: "fx-tower-impact-v33-play",
        texture: "fx-tower-impact-v33",
        start: 0,
        end: 7,
        frameRate: 22,
        repeat: 0,
      },
    ];

    anims.forEach((spec) => this.makeAnim(spec));

    ENEMY_KEYS.forEach((kind) => {
      const directions = [
        { id: "down", walk: [0, 3], attack: [12, 15], death: [24, 27] },
        { id: "side", walk: [4, 7], attack: [16, 19], death: [28, 31] },
        { id: "up", walk: [8, 11], attack: [20, 23], death: [32, 35] },
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
    if (this.anims.exists(spec.key) || !this.textures.exists(spec.texture))
      return;
    this.anims.create({
      key: spec.key,
      frames: this.anims.generateFrameNumbers(spec.texture, {
        start: spec.start,
        end: spec.end,
      }),
      frameRate: spec.frameRate,
      repeat: spec.repeat,
    });
  }
}
