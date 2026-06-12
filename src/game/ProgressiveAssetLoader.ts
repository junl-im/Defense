import Phaser from "phaser";
import { safeDelayedCall } from "./SceneSafety";
import { allowProgressiveArtBundle, isLowDeviceProfile } from "./PerformanceMode";
import { getMobileRuntimeCaps } from "./MobileRuntimeEngine";
import {
  V227_CORE_ASSET_BUNDLES,
  V227_GALLERY_ASSET_BUNDLES,
} from "./PremiumIllustrationArtV227";

export type ProgressiveArtBundle = "login" | "lobby" | "world" | "battle";
type AssetDef = { key: string; path: string };

function runtimeLockdownActive(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem("ksRuntimeLockdown") === "1" || document.documentElement.classList.contains("ks-runtime-lockdown");
  } catch {
    return document.documentElement.classList.contains("ks-runtime-lockdown");
  }
}

function unsafeArtOverrideEnabled(): boolean {
  if (typeof window === "undefined") return false;
  const query = new URLSearchParams(window.location.search);
  try {
    return query.has("ultraart") || window.localStorage.getItem("ksUnsafeArt") === "1";
  } catch {
    return query.has("ultraart");
  }
}


const CORE_BUNDLES: Record<ProgressiveArtBundle, AssetDef[]> = {
  login: [
    { key: "v225-login-masterpiece-bg", path: "assets/ui/v2_25/login_masterpiece_bg_v2_25.png" },
    { key: "v225-login-premium-card-frame", path: "assets/ui/v2_25/login_premium_card_frame_v2_25.png" },
    { key: "v225-login-crystal-title", path: "assets/ui/v2_25/login_crystal_title_v2_25.png" },
    { key: "v225-login-aurora-vellum-ribbon", path: "assets/ui/v2_25/login_aurora_vellum_ribbon_v2_25.png" },
    { key: "v225-login-gold-button-frame", path: "assets/ui/v2_25/login_gold_button_frame_v2_25.png" },
    { key: "v225-login-pearl-button-frame", path: "assets/ui/v2_25/login_pearl_button_frame_v2_25.png" },
    { key: "v225-login-small-button-frame", path: "assets/ui/v2_25/login_small_button_frame_v2_25.png" },
    { key: "v225-login-royal-fox-commander", path: "assets/ui/v2_25/login_royal_fox_commander_v2_25.png" },
    { key: "v225-login-luna-deer-oracle", path: "assets/ui/v2_25/login_luna_deer_oracle_v2_25.png" },
    { key: "v225-login-painterly-light-rays", path: "assets/ui/v2_25/login_painterly_light_rays_v2_25.png" },
    { key: "v225-login-corner-floral-left", path: "assets/ui/v2_25/login_corner_floral_left_v2_25.png" },
    { key: "v225-login-corner-floral-right", path: "assets/ui/v2_25/login_corner_floral_right_v2_25.png" },
    { key: "v225-login-instant-badge", path: "assets/ui/v2_25/login_instant_badge_v2_25.png" },
    { key: "v225-login-cloud-sync-badge", path: "assets/ui/v2_25/login_cloud_sync_badge_v2_25.png" },
    { key: "v225-login-gem-divider", path: "assets/ui/v2_25/login_gem_divider_v2_25.png" },
  ],
  lobby: [
    { key: "v225-lobby-masterpiece-bg", path: "assets/ui/v2_25/lobby_masterpiece_bg_v2_25.png" },
    { key: "v225-lobby-command-banner", path: "assets/ui/v2_25/lobby_command_banner_v2_25.png" },
    { key: "v225-lobby-nav-velvet-frame", path: "assets/ui/v2_25/lobby_nav_velvet_frame_v2_25.png" },
    { key: "v225-lobby-profile-panel", path: "assets/ui/v2_25/lobby_profile_panel_v2_25.png" },
    { key: "v225-lobby-resource-star", path: "assets/ui/v2_25/lobby_resource_star_v2_25.png" },
    { key: "v225-lobby-resource-gold", path: "assets/ui/v2_25/lobby_resource_gold_v2_25.png" },
    { key: "v225-lobby-resource-gem", path: "assets/ui/v2_25/lobby_resource_gem_v2_25.png" },
    { key: "v225-lobby-resource-heart", path: "assets/ui/v2_25/lobby_resource_heart_v2_25.png" },
    { key: "v225-lobby-shop-atelier", path: "assets/ui/v2_25/lobby_shop_atelier_v2_25.png" },
    { key: "v225-lobby-quest-manuscript", path: "assets/ui/v2_25/lobby_quest_manuscript_v2_25.png" },
    { key: "v225-lobby-mail-swan", path: "assets/ui/v2_25/lobby_mail_swan_v2_25.png" },
    { key: "v225-lobby-event-firefly-lamp", path: "assets/ui/v2_25/lobby_event_firefly_lamp_v2_25.png" },
    { key: "v225-lobby-npc-owl-archivist", path: "assets/ui/v2_25/lobby_npc_owl_archivist_v2_25.png" },
    { key: "v225-lobby-npc-fox-tailor", path: "assets/ui/v2_25/lobby_npc_fox_tailor_v2_25.png" },
    { key: "v225-lobby-npc-cat-alchemist", path: "assets/ui/v2_25/lobby_npc_cat_alchemist_v2_25.png" },
    { key: "v225-lobby-flower-lantern-left", path: "assets/ui/v2_25/lobby_flower_lantern_left_v2_25.png" },
    { key: "v225-lobby-flower-lantern-right", path: "assets/ui/v2_25/lobby_flower_lantern_right_v2_25.png" },
    { key: "v225-lobby-quality-rune", path: "assets/ui/v2_25/lobby_quality_rune_v2_25.png" },
  ],
  world: [
    { key: "v225-world-masterpiece-bg", path: "assets/ui/v2_25/world_masterpiece_bg_v2_25.png" },
    { key: "v225-world-preview-frame", path: "assets/ui/v2_25/world_preview_frame_v2_25.png" },
    { key: "v225-world-stage-ring", path: "assets/ui/v2_25/world_stage_ring_v2_25.png" },
    { key: "v225-world-route-prism", path: "assets/ui/v2_25/world_route_prism_v2_25.png" },
    { key: "v225-world-boss-gate", path: "assets/ui/v2_25/world_boss_gate_v2_25.png" },
    { key: "v225-world-locked-seal", path: "assets/ui/v2_25/world_locked_seal_v2_25.png" },
    { key: "v225-world-reward-bloom", path: "assets/ui/v2_25/world_reward_bloom_v2_25.png" },
    { key: "v225-world-selected-crown", path: "assets/ui/v2_25/world_selected_crown_v2_25.png" },
    { key: "v225-world-cloud-panel", path: "assets/ui/v2_25/world_cloud_panel_v2_25.png" },
    { key: "v225-world-map-compass", path: "assets/ui/v2_25/world_map_compass_v2_25.png" },
    { key: "v225-world-chapter-ribbon", path: "assets/ui/v2_25/world_chapter_ribbon_v2_25.png" },
    { key: "v225-world-mist-wisp", path: "assets/ui/v2_25/world_mist_wisp_v2_25.png" },
    { key: "v225-world-island-shadow", path: "assets/ui/v2_25/world_island_shadow_v2_25.png" },
    { key: "v225-world-star-path-dot", path: "assets/ui/v2_25/world_star_path_dot_v2_25.png" },
  ],
  battle: [
    { key: "v225-battle-painterly-overlay", path: "assets/ui/v2_25/battle_painterly_overlay_v2_25.png" },
    { key: "v225-battle-top-hud-frame", path: "assets/ui/v2_25/battle_top_hud_frame_v2_25.png" },
    { key: "v225-battle-bottom-skill-dock", path: "assets/ui/v2_25/battle_bottom_skill_dock_v2_25.png" },
    { key: "v225-battle-side-vine-left", path: "assets/ui/v2_25/battle_side_vine_left_v2_25.png" },
    { key: "v225-battle-side-vine-right", path: "assets/ui/v2_25/battle_side_vine_right_v2_25.png" },
    { key: "v225-battle-skill-meteor", path: "assets/ui/v2_25/battle_skill_meteor_v2_25.png" },
    { key: "v225-battle-skill-guard", path: "assets/ui/v2_25/battle_skill_guard_v2_25.png" },
    { key: "v225-battle-skill-hero", path: "assets/ui/v2_25/battle_skill_hero_v2_25.png" },
    { key: "v225-battle-combo-badge", path: "assets/ui/v2_25/battle_combo_badge_v2_25.png" },
    { key: "v225-battle-boss-warning", path: "assets/ui/v2_25/battle_boss_warning_v2_25.png" },
    { key: "v225-battle-mana-crystal", path: "assets/ui/v2_25/battle_mana_crystal_v2_25.png" },
    { key: "v225-battle-safe-corner-left", path: "assets/ui/v2_25/battle_safe_corner_left_v2_25.png" },
    { key: "v225-battle-safe-corner-right", path: "assets/ui/v2_25/battle_safe_corner_right_v2_25.png" },
    { key: "v225-battle-wave-banner", path: "assets/ui/v2_25/battle_wave_banner_v2_25.png" },
    { key: "v225-battle-touch-optimized-badge", path: "assets/ui/v2_25/battle_touch_optimized_badge_v2_25.png" },
  ],
};

const GALLERY_BUNDLES: Record<ProgressiveArtBundle, AssetDef[]> = {
  login: [
    { key: "v225-login-gallery-starlace", path: "assets/ui/v2_25/login_gallery_starlace_v2_25.png" },
    { key: "v225-login-gallery-butterfly", path: "assets/ui/v2_25/login_gallery_butterfly_v2_25.png" },
    { key: "v225-login-gallery-moon_key", path: "assets/ui/v2_25/login_gallery_moon_key_v2_25.png" },
    { key: "v225-login-gallery-rose_medal", path: "assets/ui/v2_25/login_gallery_rose_medal_v2_25.png" },
    { key: "v225-login-gallery-glass_spark", path: "assets/ui/v2_25/login_gallery_glass_spark_v2_25.png" },
    { key: "v225-login-gallery-mini_crown", path: "assets/ui/v2_25/login_gallery_mini_crown_v2_25.png" },
    { key: "v225-login-gallery-satin_knot", path: "assets/ui/v2_25/login_gallery_satin_knot_v2_25.png" },
    { key: "v225-login-gallery-page_corner", path: "assets/ui/v2_25/login_gallery_page_corner_v2_25.png" },
    { key: "v225-login-gallery-tiny_lantern", path: "assets/ui/v2_25/login_gallery_tiny_lantern_v2_25.png" },
    { key: "v225-login-gallery-petal_stream", path: "assets/ui/v2_25/login_gallery_petal_stream_v2_25.png" },
  ],
  lobby: [
    { key: "v225-lobby-gallery-pass_badge", path: "assets/ui/v2_25/lobby_gallery_pass_badge_v2_25.png" },
    { key: "v225-lobby-gallery-guild_crest", path: "assets/ui/v2_25/lobby_gallery_guild_crest_v2_25.png" },
    { key: "v225-lobby-gallery-ranking_cup", path: "assets/ui/v2_25/lobby_gallery_ranking_cup_v2_25.png" },
    { key: "v225-lobby-gallery-settings_gear", path: "assets/ui/v2_25/lobby_gallery_settings_gear_v2_25.png" },
    { key: "v225-lobby-gallery-hero_sigil", path: "assets/ui/v2_25/lobby_gallery_hero_sigil_v2_25.png" },
    { key: "v225-lobby-gallery-codex_book", path: "assets/ui/v2_25/lobby_gallery_codex_book_v2_25.png" },
    { key: "v225-lobby-gallery-forge_hammer", path: "assets/ui/v2_25/lobby_gallery_forge_hammer_v2_25.png" },
    { key: "v225-lobby-gallery-mission_scroll", path: "assets/ui/v2_25/lobby_gallery_mission_scroll_v2_25.png" },
    { key: "v225-lobby-gallery-jewel_tab", path: "assets/ui/v2_25/lobby_gallery_jewel_tab_v2_25.png" },
    { key: "v225-lobby-gallery-painted_coin_stack", path: "assets/ui/v2_25/lobby_gallery_painted_coin_stack_v2_25.png" },
    { key: "v225-lobby-gallery-premium_ticket", path: "assets/ui/v2_25/lobby_gallery_premium_ticket_v2_25.png" },
    { key: "v225-lobby-gallery-season_leaf", path: "assets/ui/v2_25/lobby_gallery_season_leaf_v2_25.png" },
    { key: "v225-shared-gallery-royal_palette_chip", path: "assets/ui/v2_25/shared_gallery_royal_palette_chip_v2_25.png" },
    { key: "v225-shared-gallery-pearl_noise_wash", path: "assets/ui/v2_25/shared_gallery_pearl_noise_wash_v2_25.png" },
    { key: "v225-shared-gallery-gold_leaf_trim", path: "assets/ui/v2_25/shared_gallery_gold_leaf_trim_v2_25.png" },
    { key: "v225-shared-gallery-watercolor_cloud", path: "assets/ui/v2_25/shared_gallery_watercolor_cloud_v2_25.png" },
    { key: "v225-shared-gallery-velvet_shadow", path: "assets/ui/v2_25/shared_gallery_velvet_shadow_v2_25.png" },
    { key: "v225-shared-gallery-ink_outline_spark", path: "assets/ui/v2_25/shared_gallery_ink_outline_spark_v2_25.png" },
    { key: "v225-shared-gallery-crystal_drop", path: "assets/ui/v2_25/shared_gallery_crystal_drop_v2_25.png" },
    { key: "v225-shared-gallery-flower_cluster", path: "assets/ui/v2_25/shared_gallery_flower_cluster_v2_25.png" },
    { key: "v225-shared-gallery-moonberry_leaf", path: "assets/ui/v2_25/shared_gallery_moonberry_leaf_v2_25.png" },
    { key: "v225-shared-gallery-aurora_thread", path: "assets/ui/v2_25/shared_gallery_aurora_thread_v2_25.png" },
    { key: "v225-shared-gallery-paint_smudge", path: "assets/ui/v2_25/shared_gallery_paint_smudge_v2_25.png" },
    { key: "v225-shared-gallery-glass_highlight", path: "assets/ui/v2_25/shared_gallery_glass_highlight_v2_25.png" },
  ],
  world: [
    { key: "v225-world-gallery-forest_token", path: "assets/ui/v2_25/world_gallery_forest_token_v2_25.png" },
    { key: "v225-world-gallery-canyon_token", path: "assets/ui/v2_25/world_gallery_canyon_token_v2_25.png" },
    { key: "v225-world-gallery-swamp_token", path: "assets/ui/v2_25/world_gallery_swamp_token_v2_25.png" },
    { key: "v225-world-gallery-fortress_token", path: "assets/ui/v2_25/world_gallery_fortress_token_v2_25.png" },
    { key: "v225-world-gallery-boss_token", path: "assets/ui/v2_25/world_gallery_boss_token_v2_25.png" },
    { key: "v225-world-gallery-treasure_cache", path: "assets/ui/v2_25/world_gallery_treasure_cache_v2_25.png" },
    { key: "v225-world-gallery-fog_curl", path: "assets/ui/v2_25/world_gallery_fog_curl_v2_25.png" },
    { key: "v225-world-gallery-pin_blue", path: "assets/ui/v2_25/world_gallery_pin_blue_v2_25.png" },
    { key: "v225-world-gallery-pin_gold", path: "assets/ui/v2_25/world_gallery_pin_gold_v2_25.png" },
    { key: "v225-world-gallery-pin_rose", path: "assets/ui/v2_25/world_gallery_pin_rose_v2_25.png" },
    { key: "v225-world-gallery-chapter_lock", path: "assets/ui/v2_25/world_gallery_chapter_lock_v2_25.png" },
    { key: "v225-world-gallery-elite_banner", path: "assets/ui/v2_25/world_gallery_elite_banner_v2_25.png" },
  ],
  battle: [
    { key: "v225-battle-gallery-tower_archer_card", path: "assets/ui/v2_25/battle_gallery_tower_archer_card_v2_25.png" },
    { key: "v225-battle-gallery-tower_mage_card", path: "assets/ui/v2_25/battle_gallery_tower_mage_card_v2_25.png" },
    { key: "v225-battle-gallery-tower_barracks_card", path: "assets/ui/v2_25/battle_gallery_tower_barracks_card_v2_25.png" },
    { key: "v225-battle-gallery-tower_artillery_card", path: "assets/ui/v2_25/battle_gallery_tower_artillery_card_v2_25.png" },
    { key: "v225-battle-gallery-enemy_elite_medal", path: "assets/ui/v2_25/battle_gallery_enemy_elite_medal_v2_25.png" },
    { key: "v225-battle-gallery-boss_cut_in_flare", path: "assets/ui/v2_25/battle_gallery_boss_cut_in_flare_v2_25.png" },
    { key: "v225-battle-gallery-reward_chest_gold", path: "assets/ui/v2_25/battle_gallery_reward_chest_gold_v2_25.png" },
    { key: "v225-battle-gallery-reward_chest_mythic", path: "assets/ui/v2_25/battle_gallery_reward_chest_mythic_v2_25.png" },
    { key: "v225-battle-gallery-pause_orb", path: "assets/ui/v2_25/battle_gallery_pause_orb_v2_25.png" },
    { key: "v225-battle-gallery-speed_orb", path: "assets/ui/v2_25/battle_gallery_speed_orb_v2_25.png" },
    { key: "v225-battle-gallery-sound_orb", path: "assets/ui/v2_25/battle_gallery_sound_orb_v2_25.png" },
    { key: "v225-battle-gallery-upgrade_spark", path: "assets/ui/v2_25/battle_gallery_upgrade_spark_v2_25.png" },
    { key: "v225-battle-gallery-path_flower", path: "assets/ui/v2_25/battle_gallery_path_flower_v2_25.png" },
    { key: "v225-battle-gallery-impact_prism", path: "assets/ui/v2_25/battle_gallery_impact_prism_v2_25.png" },
  ],
};

const V226_CORE_BUNDLES: Record<ProgressiveArtBundle, AssetDef[]> = {
  login: [
    { key: "v226-login-atelier-bg", path: "assets/ui/v2_26/login_atelier_bg_v2_26.png" },
    { key: "v226-login-lacquer-card", path: "assets/ui/v2_26/login_lacquer_card_v2_26.png" },
    { key: "v226-login-glass-title-plaque", path: "assets/ui/v2_26/login_glass_title_plaque_v2_26.png" },
    { key: "v226-login-prismatic-rays", path: "assets/ui/v2_26/login_prismatic_rays_v2_26.png" },
    { key: "v226-login-start-button-gold", path: "assets/ui/v2_26/login_start_button_gold_v2_26.png" },
    { key: "v226-login-cloud-button-pearl", path: "assets/ui/v2_26/login_cloud_button_pearl_v2_26.png" },
    { key: "v226-login-small-button-ivory", path: "assets/ui/v2_26/login_small_button_ivory_v2_26.png" },
    { key: "v226-login-left-gold-filigree", path: "assets/ui/v2_26/login_left_gold_filigree_v2_26.png" },
    { key: "v226-login-right-gold-filigree", path: "assets/ui/v2_26/login_right_gold_filigree_v2_26.png" },
    { key: "v226-login-mascot-fox-duke", path: "assets/ui/v2_26/login_mascot_fox_duke_v2_26.png" },
    { key: "v226-login-mascot-deer-mage", path: "assets/ui/v2_26/login_mascot_deer_mage_v2_26.png" },
    { key: "v226-login-latency-shield-badge", path: "assets/ui/v2_26/login_latency_shield_badge_v2_26.png" },
    { key: "v226-login-local-save-badge", path: "assets/ui/v2_26/login_local_save_badge_v2_26.png" },
    { key: "v226-login-micro-gloss-divider", path: "assets/ui/v2_26/login_micro_gloss_divider_v2_26.png" },
  ],
  lobby: [
    { key: "v226-lobby-atelier-bg", path: "assets/ui/v2_26/lobby_atelier_bg_v2_26.png" },
    { key: "v226-lobby-royal-header-banner", path: "assets/ui/v2_26/lobby_royal_header_banner_v2_26.png" },
    { key: "v226-lobby-velvet-nav-frame", path: "assets/ui/v2_26/lobby_velvet_nav_frame_v2_26.png" },
    { key: "v226-lobby-profile-glass-panel", path: "assets/ui/v2_26/lobby_profile_glass_panel_v2_26.png" },
    { key: "v226-lobby-resource-star-relic", path: "assets/ui/v2_26/lobby_resource_star_relic_v2_26.png" },
    { key: "v226-lobby-resource-coin-relic", path: "assets/ui/v2_26/lobby_resource_coin_relic_v2_26.png" },
    { key: "v226-lobby-resource-gem-relic", path: "assets/ui/v2_26/lobby_resource_gem_relic_v2_26.png" },
    { key: "v226-lobby-shop-gilded-stall", path: "assets/ui/v2_26/lobby_shop_gilded_stall_v2_26.png" },
    { key: "v226-lobby-quest-illuminated-book", path: "assets/ui/v2_26/lobby_quest_illuminated_book_v2_26.png" },
    { key: "v226-lobby-mail-crystal-bird", path: "assets/ui/v2_26/lobby_mail_crystal_bird_v2_26.png" },
    { key: "v226-lobby-event-moon-lantern", path: "assets/ui/v2_26/lobby_event_moon_lantern_v2_26.png" },
    { key: "v226-lobby-npc-raccoon-curator", path: "assets/ui/v2_26/lobby_npc_raccoon_curator_v2_26.png" },
    { key: "v226-lobby-npc-rabbit-cartographer", path: "assets/ui/v2_26/lobby_npc_rabbit_cartographer_v2_26.png" },
    { key: "v226-lobby-perf-budget-badge", path: "assets/ui/v2_26/lobby_perf_budget_badge_v2_26.png" },
  ],
  world: [
    { key: "v226-world-atlas-bg", path: "assets/ui/v2_26/world_atlas_bg_v2_26.png" },
    { key: "v226-world-preview-oil-frame", path: "assets/ui/v2_26/world_preview_oil_frame_v2_26.png" },
    { key: "v226-world-stage-gem-ring", path: "assets/ui/v2_26/world_stage_gem_ring_v2_26.png" },
    { key: "v226-world-route-aurora-thread", path: "assets/ui/v2_26/world_route_aurora_thread_v2_26.png" },
    { key: "v226-world-boss-aurora-gate", path: "assets/ui/v2_26/world_boss_aurora_gate_v2_26.png" },
    { key: "v226-world-lock-velvet-seal", path: "assets/ui/v2_26/world_lock_velvet_seal_v2_26.png" },
    { key: "v226-world-reward-crystal-bloom", path: "assets/ui/v2_26/world_reward_crystal_bloom_v2_26.png" },
    { key: "v226-world-selected-crown-glow", path: "assets/ui/v2_26/world_selected_crown_glow_v2_26.png" },
    { key: "v226-world-cloud-chapter-panel", path: "assets/ui/v2_26/world_cloud_chapter_panel_v2_26.png" },
    { key: "v226-world-compass-enamel", path: "assets/ui/v2_26/world_compass_enamel_v2_26.png" },
    { key: "v226-world-chapter-badge", path: "assets/ui/v2_26/world_chapter_badge_v2_26.png" },
    { key: "v226-world-mist-watercolor", path: "assets/ui/v2_26/world_mist_watercolor_v2_26.png" },
    { key: "v226-world-island-soft-shadow", path: "assets/ui/v2_26/world_island_soft_shadow_v2_26.png" },
    { key: "v226-world-node-crown-micro", path: "assets/ui/v2_26/world_node_crown_micro_v2_26.png" },
  ],
  battle: [
    { key: "v226-battle-painterly-overlay", path: "assets/ui/v2_26/battle_painterly_overlay_v2_26.png" },
    { key: "v226-battle-top-hud-lacquer", path: "assets/ui/v2_26/battle_top_hud_lacquer_v2_26.png" },
    { key: "v226-battle-bottom-skill-bar", path: "assets/ui/v2_26/battle_bottom_skill_bar_v2_26.png" },
    { key: "v226-battle-side-vine-left", path: "assets/ui/v2_26/battle_side_vine_left_v2_26.png" },
    { key: "v226-battle-side-vine-right", path: "assets/ui/v2_26/battle_side_vine_right_v2_26.png" },
    { key: "v226-battle-skill-meteor-card", path: "assets/ui/v2_26/battle_skill_meteor_card_v2_26.png" },
    { key: "v226-battle-skill-guard-card", path: "assets/ui/v2_26/battle_skill_guard_card_v2_26.png" },
    { key: "v226-battle-skill-hero-card", path: "assets/ui/v2_26/battle_skill_hero_card_v2_26.png" },
    { key: "v226-battle-combo-crystal-badge", path: "assets/ui/v2_26/battle_combo_crystal_badge_v2_26.png" },
    { key: "v226-battle-boss-cut-warning", path: "assets/ui/v2_26/battle_boss_cut_warning_v2_26.png" },
    { key: "v226-battle-mana-lacquer-drop", path: "assets/ui/v2_26/battle_mana_lacquer_drop_v2_26.png" },
    { key: "v226-battle-safe-corner-left", path: "assets/ui/v2_26/battle_safe_corner_left_v2_26.png" },
    { key: "v226-battle-safe-corner-right", path: "assets/ui/v2_26/battle_safe_corner_right_v2_26.png" },
    { key: "v226-battle-frame-budget-badge", path: "assets/ui/v2_26/battle_frame_budget_badge_v2_26.png" },
  ],
};

const V226_GALLERY_BUNDLES: Record<ProgressiveArtBundle, AssetDef[]> = {
  login: [
    { key: "v226-login-gallery-masterpiece-01", path: "assets/ui/v2_26/login_gallery_masterpiece_01_v2_26.png" },
    { key: "v226-login-gallery-masterpiece-02", path: "assets/ui/v2_26/login_gallery_masterpiece_02_v2_26.png" },
    { key: "v226-login-gallery-masterpiece-03", path: "assets/ui/v2_26/login_gallery_masterpiece_03_v2_26.png" },
    { key: "v226-login-gallery-masterpiece-04", path: "assets/ui/v2_26/login_gallery_masterpiece_04_v2_26.png" },
    { key: "v226-login-gallery-masterpiece-05", path: "assets/ui/v2_26/login_gallery_masterpiece_05_v2_26.png" },
    { key: "v226-login-gallery-masterpiece-06", path: "assets/ui/v2_26/login_gallery_masterpiece_06_v2_26.png" },
    { key: "v226-login-gallery-masterpiece-07", path: "assets/ui/v2_26/login_gallery_masterpiece_07_v2_26.png" },
    { key: "v226-login-gallery-masterpiece-08", path: "assets/ui/v2_26/login_gallery_masterpiece_08_v2_26.png" },
    { key: "v226-login-gallery-masterpiece-09", path: "assets/ui/v2_26/login_gallery_masterpiece_09_v2_26.png" },
    { key: "v226-login-gallery-masterpiece-10", path: "assets/ui/v2_26/login_gallery_masterpiece_10_v2_26.png" },
    { key: "v226-login-gallery-masterpiece-11", path: "assets/ui/v2_26/login_gallery_masterpiece_11_v2_26.png" },
    { key: "v226-login-gallery-masterpiece-12", path: "assets/ui/v2_26/login_gallery_masterpiece_12_v2_26.png" },
    { key: "v226-login-gallery-masterpiece-13", path: "assets/ui/v2_26/login_gallery_masterpiece_13_v2_26.png" },
    { key: "v226-login-gallery-masterpiece-14", path: "assets/ui/v2_26/login_gallery_masterpiece_14_v2_26.png" },
  ],
  lobby: [
    { key: "v226-lobby-gallery-masterpiece-01", path: "assets/ui/v2_26/lobby_gallery_masterpiece_01_v2_26.png" },
    { key: "v226-lobby-gallery-masterpiece-02", path: "assets/ui/v2_26/lobby_gallery_masterpiece_02_v2_26.png" },
    { key: "v226-lobby-gallery-masterpiece-03", path: "assets/ui/v2_26/lobby_gallery_masterpiece_03_v2_26.png" },
    { key: "v226-lobby-gallery-masterpiece-04", path: "assets/ui/v2_26/lobby_gallery_masterpiece_04_v2_26.png" },
    { key: "v226-lobby-gallery-masterpiece-05", path: "assets/ui/v2_26/lobby_gallery_masterpiece_05_v2_26.png" },
    { key: "v226-lobby-gallery-masterpiece-06", path: "assets/ui/v2_26/lobby_gallery_masterpiece_06_v2_26.png" },
    { key: "v226-lobby-gallery-masterpiece-07", path: "assets/ui/v2_26/lobby_gallery_masterpiece_07_v2_26.png" },
    { key: "v226-lobby-gallery-masterpiece-08", path: "assets/ui/v2_26/lobby_gallery_masterpiece_08_v2_26.png" },
    { key: "v226-lobby-gallery-masterpiece-09", path: "assets/ui/v2_26/lobby_gallery_masterpiece_09_v2_26.png" },
    { key: "v226-lobby-gallery-masterpiece-10", path: "assets/ui/v2_26/lobby_gallery_masterpiece_10_v2_26.png" },
    { key: "v226-lobby-gallery-masterpiece-11", path: "assets/ui/v2_26/lobby_gallery_masterpiece_11_v2_26.png" },
    { key: "v226-lobby-gallery-masterpiece-12", path: "assets/ui/v2_26/lobby_gallery_masterpiece_12_v2_26.png" },
    { key: "v226-lobby-gallery-masterpiece-13", path: "assets/ui/v2_26/lobby_gallery_masterpiece_13_v2_26.png" },
    { key: "v226-lobby-gallery-masterpiece-14", path: "assets/ui/v2_26/lobby_gallery_masterpiece_14_v2_26.png" },
    { key: "v226-lobby-gallery-masterpiece-15", path: "assets/ui/v2_26/lobby_gallery_masterpiece_15_v2_26.png" },
    { key: "v226-lobby-gallery-masterpiece-16", path: "assets/ui/v2_26/lobby_gallery_masterpiece_16_v2_26.png" },
    { key: "v226-lobby-gallery-masterpiece-17", path: "assets/ui/v2_26/lobby_gallery_masterpiece_17_v2_26.png" },
    { key: "v226-lobby-gallery-masterpiece-18", path: "assets/ui/v2_26/lobby_gallery_masterpiece_18_v2_26.png" },
    { key: "v226-shared-gallery-masterpiece-01", path: "assets/ui/v2_26/shared_gallery_masterpiece_01_v2_26.png" },
    { key: "v226-shared-gallery-masterpiece-02", path: "assets/ui/v2_26/shared_gallery_masterpiece_02_v2_26.png" },
    { key: "v226-shared-gallery-masterpiece-03", path: "assets/ui/v2_26/shared_gallery_masterpiece_03_v2_26.png" },
    { key: "v226-shared-gallery-masterpiece-04", path: "assets/ui/v2_26/shared_gallery_masterpiece_04_v2_26.png" },
    { key: "v226-shared-gallery-masterpiece-05", path: "assets/ui/v2_26/shared_gallery_masterpiece_05_v2_26.png" },
    { key: "v226-shared-gallery-masterpiece-06", path: "assets/ui/v2_26/shared_gallery_masterpiece_06_v2_26.png" },
    { key: "v226-shared-gallery-masterpiece-07", path: "assets/ui/v2_26/shared_gallery_masterpiece_07_v2_26.png" },
    { key: "v226-shared-gallery-masterpiece-08", path: "assets/ui/v2_26/shared_gallery_masterpiece_08_v2_26.png" },
    { key: "v226-shared-gallery-masterpiece-09", path: "assets/ui/v2_26/shared_gallery_masterpiece_09_v2_26.png" },
    { key: "v226-shared-gallery-masterpiece-10", path: "assets/ui/v2_26/shared_gallery_masterpiece_10_v2_26.png" },
    { key: "v226-shared-gallery-masterpiece-11", path: "assets/ui/v2_26/shared_gallery_masterpiece_11_v2_26.png" },
    { key: "v226-shared-gallery-masterpiece-12", path: "assets/ui/v2_26/shared_gallery_masterpiece_12_v2_26.png" },
    { key: "v226-shared-gallery-masterpiece-13", path: "assets/ui/v2_26/shared_gallery_masterpiece_13_v2_26.png" },
    { key: "v226-shared-gallery-masterpiece-14", path: "assets/ui/v2_26/shared_gallery_masterpiece_14_v2_26.png" },
    { key: "v226-shared-gallery-masterpiece-15", path: "assets/ui/v2_26/shared_gallery_masterpiece_15_v2_26.png" },
    { key: "v226-shared-gallery-masterpiece-16", path: "assets/ui/v2_26/shared_gallery_masterpiece_16_v2_26.png" },
  ],
  world: [
    { key: "v226-world-gallery-masterpiece-01", path: "assets/ui/v2_26/world_gallery_masterpiece_01_v2_26.png" },
    { key: "v226-world-gallery-masterpiece-02", path: "assets/ui/v2_26/world_gallery_masterpiece_02_v2_26.png" },
    { key: "v226-world-gallery-masterpiece-03", path: "assets/ui/v2_26/world_gallery_masterpiece_03_v2_26.png" },
    { key: "v226-world-gallery-masterpiece-04", path: "assets/ui/v2_26/world_gallery_masterpiece_04_v2_26.png" },
    { key: "v226-world-gallery-masterpiece-05", path: "assets/ui/v2_26/world_gallery_masterpiece_05_v2_26.png" },
    { key: "v226-world-gallery-masterpiece-06", path: "assets/ui/v2_26/world_gallery_masterpiece_06_v2_26.png" },
    { key: "v226-world-gallery-masterpiece-07", path: "assets/ui/v2_26/world_gallery_masterpiece_07_v2_26.png" },
    { key: "v226-world-gallery-masterpiece-08", path: "assets/ui/v2_26/world_gallery_masterpiece_08_v2_26.png" },
    { key: "v226-world-gallery-masterpiece-09", path: "assets/ui/v2_26/world_gallery_masterpiece_09_v2_26.png" },
    { key: "v226-world-gallery-masterpiece-10", path: "assets/ui/v2_26/world_gallery_masterpiece_10_v2_26.png" },
    { key: "v226-world-gallery-masterpiece-11", path: "assets/ui/v2_26/world_gallery_masterpiece_11_v2_26.png" },
    { key: "v226-world-gallery-masterpiece-12", path: "assets/ui/v2_26/world_gallery_masterpiece_12_v2_26.png" },
    { key: "v226-world-gallery-masterpiece-13", path: "assets/ui/v2_26/world_gallery_masterpiece_13_v2_26.png" },
    { key: "v226-world-gallery-masterpiece-14", path: "assets/ui/v2_26/world_gallery_masterpiece_14_v2_26.png" },
    { key: "v226-world-gallery-masterpiece-15", path: "assets/ui/v2_26/world_gallery_masterpiece_15_v2_26.png" },
    { key: "v226-world-gallery-masterpiece-16", path: "assets/ui/v2_26/world_gallery_masterpiece_16_v2_26.png" },
  ],
  battle: [
    { key: "v226-battle-gallery-masterpiece-01", path: "assets/ui/v2_26/battle_gallery_masterpiece_01_v2_26.png" },
    { key: "v226-battle-gallery-masterpiece-02", path: "assets/ui/v2_26/battle_gallery_masterpiece_02_v2_26.png" },
    { key: "v226-battle-gallery-masterpiece-03", path: "assets/ui/v2_26/battle_gallery_masterpiece_03_v2_26.png" },
    { key: "v226-battle-gallery-masterpiece-04", path: "assets/ui/v2_26/battle_gallery_masterpiece_04_v2_26.png" },
    { key: "v226-battle-gallery-masterpiece-05", path: "assets/ui/v2_26/battle_gallery_masterpiece_05_v2_26.png" },
    { key: "v226-battle-gallery-masterpiece-06", path: "assets/ui/v2_26/battle_gallery_masterpiece_06_v2_26.png" },
    { key: "v226-battle-gallery-masterpiece-07", path: "assets/ui/v2_26/battle_gallery_masterpiece_07_v2_26.png" },
    { key: "v226-battle-gallery-masterpiece-08", path: "assets/ui/v2_26/battle_gallery_masterpiece_08_v2_26.png" },
    { key: "v226-battle-gallery-masterpiece-09", path: "assets/ui/v2_26/battle_gallery_masterpiece_09_v2_26.png" },
    { key: "v226-battle-gallery-masterpiece-10", path: "assets/ui/v2_26/battle_gallery_masterpiece_10_v2_26.png" },
    { key: "v226-battle-gallery-masterpiece-11", path: "assets/ui/v2_26/battle_gallery_masterpiece_11_v2_26.png" },
    { key: "v226-battle-gallery-masterpiece-12", path: "assets/ui/v2_26/battle_gallery_masterpiece_12_v2_26.png" },
    { key: "v226-battle-gallery-masterpiece-13", path: "assets/ui/v2_26/battle_gallery_masterpiece_13_v2_26.png" },
    { key: "v226-battle-gallery-masterpiece-14", path: "assets/ui/v2_26/battle_gallery_masterpiece_14_v2_26.png" },
    { key: "v226-battle-gallery-masterpiece-15", path: "assets/ui/v2_26/battle_gallery_masterpiece_15_v2_26.png" },
    { key: "v226-battle-gallery-masterpiece-16", path: "assets/ui/v2_26/battle_gallery_masterpiece_16_v2_26.png" },
    { key: "v226-battle-gallery-masterpiece-17", path: "assets/ui/v2_26/battle_gallery_masterpiece_17_v2_26.png" },
    { key: "v226-battle-gallery-masterpiece-18", path: "assets/ui/v2_26/battle_gallery_masterpiece_18_v2_26.png" },
  ],
};

const DEFAULT_PROGRESSIVE_CORE_CAP: Record<ProgressiveArtBundle, number> = {
  login: 2,
  lobby: 2,
  world: 1,
  battle: 0,
};

type SceneWithProgressiveQueue = Phaser.Scene & {
  __kingdomSeedProgressiveQueue?: Promise<void>;
};

const query = new URLSearchParams(
  typeof window !== "undefined" ? window.location.search : "",
);

let cachedWebpSupport: boolean | undefined;
let globalProgressiveQueue: Promise<void> = Promise.resolve();
const progressiveModuleStartedAt = Date.now();

function supportsWebp(): boolean {
  if (cachedWebpSupport !== undefined) return cachedWebpSupport;
  try {
    const canvas = document.createElement("canvas");
    cachedWebpSupport = canvas.toDataURL("image/webp").startsWith("data:image/webp");
  } catch {
    cachedWebpSupport = false;
  }
  return cachedWebpSupport;
}

function fullArtEnabled(): boolean {
  if (query.has("fullart") || query.has("galleryart")) return true;
  try {
    return window.localStorage.getItem("ksFullArt") === "1";
  } catch {
    return false;
  }
}

function assetUrl(path: string): string {
  const optimized = supportsWebp() ? path.replace(/\.png$/i, ".webp") : path;
  const base = import.meta.env.BASE_URL || "/";
  return `${base.replace(/\/$/, "")}/${optimized}`;
}

function sceneIsLive(scene: Phaser.Scene): boolean {
  return scene.scene.isActive(scene.scene.key);
}

function getProgressiveBundleDefinitions(
  bundle: ProgressiveArtBundle,
  includeGallery: boolean,
): AssetDef[] {
  if (runtimeLockdownActive() && !unsafeArtOverrideEnabled()) return [];
  const core = [
    ...V227_CORE_ASSET_BUNDLES[bundle],
    ...V226_CORE_BUNDLES[bundle],
    ...CORE_BUNDLES[bundle],
  ];
  if (includeGallery) {
    return [
      ...core,
      ...V227_GALLERY_ASSET_BUNDLES[bundle],
      ...V226_GALLERY_BUNDLES[bundle],
      ...GALLERY_BUNDLES[bundle],
    ];
  }

  const cap = Math.min(DEFAULT_PROGRESSIVE_CORE_CAP[bundle], getMobileRuntimeCaps().maxProgressiveAssets);
  if (cap <= 0) return [];
  const lowCap = Math.max(0, Math.ceil(cap * 0.5));
  return core.slice(0, isLowDeviceProfile() ? lowCap : cap);
}

function scheduleIdleTask(task: () => void, timeout = 1800): void {
  if (typeof window === "undefined") {
    task();
    return;
  }
  const idleWindow = window as Window & {
    requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
  };
  if (idleWindow.requestIdleCallback) {
    idleWindow.requestIdleCallback(task, { timeout });
    return;
  }
  window.setTimeout(task, Math.min(timeout, 700));
}

function enqueueProgressiveLoad(
  scene: Phaser.Scene,
  task: () => Promise<void>,
): void {
  const scoped = scene as SceneWithProgressiveQueue;
  const runScoped = (): Promise<void> => {
    scoped.__kingdomSeedProgressiveQueue = (scoped.__kingdomSeedProgressiveQueue ?? Promise.resolve())
      .then(task)
      .catch((error) => console.warn("Progressive art load skipped:", error));
    return scoped.__kingdomSeedProgressiveQueue;
  };
  globalProgressiveQueue = globalProgressiveQueue
    .then(runScoped)
    .catch((error) => console.warn("Global progressive art queue skipped:", error));
}

function loadMissingAssets(scene: Phaser.Scene, assets: AssetDef[]): Promise<void> {
  if (runtimeLockdownActive() && !unsafeArtOverrideEnabled()) return Promise.resolve();
  const toLoad = assets.filter((asset) => !scene.textures.exists(asset.key));
  if (toLoad.length === 0) return Promise.resolve();
  return new Promise((resolve) => {
    const loader = scene.load as Phaser.Loader.LoaderPlugin & {
      maxParallelDownloads?: number;
      isLoading?: () => boolean;
    };
    const caps = getMobileRuntimeCaps();
    const quietBootWindow = Date.now() - progressiveModuleStartedAt < caps.bootQuietMs;
    loader.maxParallelDownloads = quietBootWindow ? 1 : caps.artParallelDownloads;
    let resolved = false;
    const cleanup = (): void => {
      loader.off("complete", done);
      loader.off("loaderror", failSoft);
    };
    const finish = (): void => {
      if (resolved) return;
      resolved = true;
      cleanup();
      resolve();
    };
    const done = (): void => finish();
    const failSoft = (): void => {
      window.dispatchEvent(new CustomEvent("kingdom-seed:progressive-art-error", { detail: { at: Date.now(), count: toLoad.length } }));
      finish();
    };
    loader.once("complete", done);
    loader.once("loaderror", failSoft);
    window.setTimeout(failSoft, quietBootWindow ? 5200 : 9000);
    toLoad.forEach((asset) => loader.image(asset.key, assetUrl(asset.path)));
    if (!loader.isLoading?.()) loader.start();
  });
}

export function loadProgressiveArtBundle(
  scene: Phaser.Scene,
  bundle: ProgressiveArtBundle,
  onComplete: () => void,
  options: { delayMs?: number; includeGallery?: boolean } = {},
): void {
  if (runtimeLockdownActive() && !unsafeArtOverrideEnabled()) return;
  if (!allowProgressiveArtBundle(bundle)) return;
  const caps = getMobileRuntimeCaps();
  const delayMs = Math.max(options.delayMs ?? 0, isLowDeviceProfile() ? caps.bootQuietMs : 1800);
  safeDelayedCall(scene, delayMs, () => {
    if (!sceneIsLive(scene)) return;
    const includeGallery = options.includeGallery ?? (fullArtEnabled() && getMobileRuntimeCaps().label === "PREMIUM_ART_ENGINE");
    const defs = getProgressiveBundleDefinitions(bundle, includeGallery);
    if (defs.length === 0) return;
    const missing = defs.filter((asset) => !scene.textures.exists(asset.key));
    if (missing.length === 0) {
      safeDelayedCall(scene, 0, onComplete);
      return;
    }

    scheduleIdleTask(() => {
      if (!sceneIsLive(scene)) return;
      enqueueProgressiveLoad(scene, async () => {
        if (!sceneIsLive(scene)) return;
        await loadMissingAssets(scene, missing);
        if (sceneIsLive(scene)) onComplete();
      });
    }, isLowDeviceProfile() ? 2800 : 1800);
  });
}

export function warmProgressiveArtBundle(
  scene: Phaser.Scene,
  bundle: ProgressiveArtBundle,
  options: { delayMs?: number; includeGallery?: boolean } = {},
): void {
  loadProgressiveArtBundle(scene, bundle, () => undefined, options);
}
