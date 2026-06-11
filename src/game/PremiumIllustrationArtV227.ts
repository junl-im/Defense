import Phaser from "phaser";
import { addCoverImage } from "./CodeUiKit";
import { isLowDeviceProfile } from "./PerformanceMode";

export const V227_VERSION_LABEL = "v2.27.0 ATELIER MICRO OPT";

export type PremiumArtBundle = "login" | "lobby" | "world" | "battle";
export type PremiumAssetDef = { key: string; path: string };

type StageNodeLike = { x: number; y: number; radius?: number };
type BattleTheme = "forest" | "canyon" | "swamp" | "fortress" | string;
type Placement = readonly [
  key: string,
  x: number,
  y: number,
  width: number,
  height: number,
  depth: number,
  alpha?: number,
  tint?: number,
];

export const V227_CORE_ASSET_BUNDLES: Record<PremiumArtBundle, PremiumAssetDef[]> = {
  login: [
    { key: "v227-login-grand-illustration-bg", path: "assets/ui/v2_27/login_grand_illustration_bg_v2_27.png" },
    { key: "v227-login-silk-card-frame", path: "assets/ui/v2_27/login_silk_card_frame_v2_27.png" },
    { key: "v227-login-royal-glass-title", path: "assets/ui/v2_27/login_royal_glass_title_v2_27.png" },
    { key: "v227-login-prism-curtain-lights", path: "assets/ui/v2_27/login_prism_curtain_lights_v2_27.png" },
    { key: "v227-login-start-button-enamel", path: "assets/ui/v2_27/login_start_button_enamel_v2_27.png" },
    { key: "v227-login-cloud-button-opal", path: "assets/ui/v2_27/login_cloud_button_opal_v2_27.png" },
    { key: "v227-login-small-button-ivory", path: "assets/ui/v2_27/login_small_button_ivory_v2_27.png" },
    { key: "v227-login-left-flora-filigree", path: "assets/ui/v2_27/login_left_flora_filigree_v2_27.png" },
    { key: "v227-login-right-flora-filigree", path: "assets/ui/v2_27/login_right_flora_filigree_v2_27.png" },
    { key: "v227-login-mascot-fox-prince", path: "assets/ui/v2_27/login_mascot_fox_prince_v2_27.png" },
    { key: "v227-login-mascot-deer-priestess", path: "assets/ui/v2_27/login_mascot_deer_priestess_v2_27.png" },
    { key: "v227-login-mascot-bluebird-messenger", path: "assets/ui/v2_27/login_mascot_bluebird_messenger_v2_27.png" },
    { key: "v227-login-latency-guard-badge", path: "assets/ui/v2_27/login_latency_guard_badge_v2_27.png" },
    { key: "v227-login-local-boot-badge", path: "assets/ui/v2_27/login_local_boot_badge_v2_27.png" },
    { key: "v227-login-soft-shadow-vignette", path: "assets/ui/v2_27/login_soft_shadow_vignette_v2_27.png" },
    { key: "v227-login-gold-micro-divider", path: "assets/ui/v2_27/login_gold_micro_divider_v2_27.png" },
    { key: "v227-login-palette-glow", path: "assets/ui/v2_27/login_palette_glow_v2_27.png" },
    { key: "v227-login-input-focus-ring", path: "assets/ui/v2_27/login_input_focus_ring_v2_27.png" },
  ],
  lobby: [
    { key: "v227-lobby-grand-hall-bg", path: "assets/ui/v2_27/lobby_grand_hall_bg_v2_27.png" },
    { key: "v227-lobby-gilded-header-banner", path: "assets/ui/v2_27/lobby_gilded_header_banner_v2_27.png" },
    { key: "v227-lobby-nav-silk-frame", path: "assets/ui/v2_27/lobby_nav_silk_frame_v2_27.png" },
    { key: "v227-lobby-profile-glass-card", path: "assets/ui/v2_27/lobby_profile_glass_card_v2_27.png" },
    { key: "v227-lobby-resource-star-medal", path: "assets/ui/v2_27/lobby_resource_star_medal_v2_27.png" },
    { key: "v227-lobby-resource-coin-medal", path: "assets/ui/v2_27/lobby_resource_coin_medal_v2_27.png" },
    { key: "v227-lobby-resource-gem-medal", path: "assets/ui/v2_27/lobby_resource_gem_medal_v2_27.png" },
    { key: "v227-lobby-resource-heart-medal", path: "assets/ui/v2_27/lobby_resource_heart_medal_v2_27.png" },
    { key: "v227-lobby-shop-pavilion", path: "assets/ui/v2_27/lobby_shop_pavilion_v2_27.png" },
    { key: "v227-lobby-quest-codex", path: "assets/ui/v2_27/lobby_quest_codex_v2_27.png" },
    { key: "v227-lobby-mail-crystal-swan", path: "assets/ui/v2_27/lobby_mail_crystal_swan_v2_27.png" },
    { key: "v227-lobby-event-lantern", path: "assets/ui/v2_27/lobby_event_lantern_v2_27.png" },
    { key: "v227-lobby-npc-squirrel-painter", path: "assets/ui/v2_27/lobby_npc_squirrel_painter_v2_27.png" },
    { key: "v227-lobby-npc-bunny-chef", path: "assets/ui/v2_27/lobby_npc_bunny_chef_v2_27.png" },
    { key: "v227-lobby-npc-cat-archmage", path: "assets/ui/v2_27/lobby_npc_cat_archmage_v2_27.png" },
    { key: "v227-lobby-npc-otter-scout", path: "assets/ui/v2_27/lobby_npc_otter_scout_v2_27.png" },
    { key: "v227-lobby-perf-budget-medal", path: "assets/ui/v2_27/lobby_perf_budget_medal_v2_27.png" },
    { key: "v227-lobby-touch-safe-badge", path: "assets/ui/v2_27/lobby_touch_safe_badge_v2_27.png" },
    { key: "v227-lobby-idle-stream-badge", path: "assets/ui/v2_27/lobby_idle_stream_badge_v2_27.png" },
    { key: "v227-lobby-corner-floral-spray", path: "assets/ui/v2_27/lobby_corner_floral_spray_v2_27.png" },
  ],
  world: [
    { key: "v227-world-story-atlas-bg", path: "assets/ui/v2_27/world_story_atlas_bg_v2_27.png" },
    { key: "v227-world-preview-gallery-frame", path: "assets/ui/v2_27/world_preview_gallery_frame_v2_27.png" },
    { key: "v227-world-stage-jewel-ring", path: "assets/ui/v2_27/world_stage_jewel_ring_v2_27.png" },
    { key: "v227-world-route-silk-prism", path: "assets/ui/v2_27/world_route_silk_prism_v2_27.png" },
    { key: "v227-world-boss-castle-gate", path: "assets/ui/v2_27/world_boss_castle_gate_v2_27.png" },
    { key: "v227-world-lock-royal-seal", path: "assets/ui/v2_27/world_lock_royal_seal_v2_27.png" },
    { key: "v227-world-reward-gem-bloom", path: "assets/ui/v2_27/world_reward_gem_bloom_v2_27.png" },
    { key: "v227-world-selected-crown-glow", path: "assets/ui/v2_27/world_selected_crown_glow_v2_27.png" },
    { key: "v227-world-cloud-chapter-card", path: "assets/ui/v2_27/world_cloud_chapter_card_v2_27.png" },
    { key: "v227-world-compass-porcelain", path: "assets/ui/v2_27/world_compass_porcelain_v2_27.png" },
    { key: "v227-world-mist-watercolor", path: "assets/ui/v2_27/world_mist_watercolor_v2_27.png" },
    { key: "v227-world-island-shadow", path: "assets/ui/v2_27/world_island_shadow_v2_27.png" },
    { key: "v227-world-node-crown-micro", path: "assets/ui/v2_27/world_node_crown_micro_v2_27.png" },
    { key: "v227-world-route-spark-dot", path: "assets/ui/v2_27/world_route_spark_dot_v2_27.png" },
    { key: "v227-world-safe-scroll-badge", path: "assets/ui/v2_27/world_safe_scroll_badge_v2_27.png" },
    { key: "v227-world-scroll-edge-left", path: "assets/ui/v2_27/world_scroll_edge_left_v2_27.png" },
    { key: "v227-world-scroll-edge-right", path: "assets/ui/v2_27/world_scroll_edge_right_v2_27.png" },
    { key: "v227-world-stage-focus-halo", path: "assets/ui/v2_27/world_stage_focus_halo_v2_27.png" },
  ],
  battle: [
    { key: "v227-battle-painterly-overlay", path: "assets/ui/v2_27/battle_painterly_overlay_v2_27.png" },
    { key: "v227-battle-top-hud-gilded-frame", path: "assets/ui/v2_27/battle_top_hud_gilded_frame_v2_27.png" },
    { key: "v227-battle-bottom-skill-silk-dock", path: "assets/ui/v2_27/battle_bottom_skill_silk_dock_v2_27.png" },
    { key: "v227-battle-side-vine-left", path: "assets/ui/v2_27/battle_side_vine_left_v2_27.png" },
    { key: "v227-battle-side-vine-right", path: "assets/ui/v2_27/battle_side_vine_right_v2_27.png" },
    { key: "v227-battle-skill-meteor-enamel", path: "assets/ui/v2_27/battle_skill_meteor_enamel_v2_27.png" },
    { key: "v227-battle-skill-guard-enamel", path: "assets/ui/v2_27/battle_skill_guard_enamel_v2_27.png" },
    { key: "v227-battle-skill-hero-enamel", path: "assets/ui/v2_27/battle_skill_hero_enamel_v2_27.png" },
    { key: "v227-battle-combo-prism-badge", path: "assets/ui/v2_27/battle_combo_prism_badge_v2_27.png" },
    { key: "v227-battle-boss-warning-emblem", path: "assets/ui/v2_27/battle_boss_warning_emblem_v2_27.png" },
    { key: "v227-battle-mana-crystal-drop", path: "assets/ui/v2_27/battle_mana_crystal_drop_v2_27.png" },
    { key: "v227-battle-safe-corner-left", path: "assets/ui/v2_27/battle_safe_corner_left_v2_27.png" },
    { key: "v227-battle-safe-corner-right", path: "assets/ui/v2_27/battle_safe_corner_right_v2_27.png" },
    { key: "v227-battle-frame-budget-badge", path: "assets/ui/v2_27/battle_frame_budget_badge_v2_27.png" },
    { key: "v227-battle-target-focus-ring", path: "assets/ui/v2_27/battle_target_focus_ring_v2_27.png" },
    { key: "v227-battle-wave-banner-silk", path: "assets/ui/v2_27/battle_wave_banner_silk_v2_27.png" },
    { key: "v227-battle-reward-petal", path: "assets/ui/v2_27/battle_reward_petal_v2_27.png" },
    { key: "v227-battle-touch-safe-mark", path: "assets/ui/v2_27/battle_touch_safe_mark_v2_27.png" },
  ],
};

export const V227_GALLERY_ASSET_BUNDLES: Record<PremiumArtBundle, PremiumAssetDef[]> = {
  login: [
    { key: "v227-login-gallery-masterpiece-01", path: "assets/ui/v2_27/login_gallery_masterpiece_01_v2_27.png" },
    { key: "v227-login-gallery-masterpiece-02", path: "assets/ui/v2_27/login_gallery_masterpiece_02_v2_27.png" },
    { key: "v227-login-gallery-masterpiece-03", path: "assets/ui/v2_27/login_gallery_masterpiece_03_v2_27.png" },
    { key: "v227-login-gallery-masterpiece-04", path: "assets/ui/v2_27/login_gallery_masterpiece_04_v2_27.png" },
    { key: "v227-login-gallery-masterpiece-05", path: "assets/ui/v2_27/login_gallery_masterpiece_05_v2_27.png" },
    { key: "v227-login-gallery-masterpiece-06", path: "assets/ui/v2_27/login_gallery_masterpiece_06_v2_27.png" },
    { key: "v227-login-gallery-masterpiece-07", path: "assets/ui/v2_27/login_gallery_masterpiece_07_v2_27.png" },
    { key: "v227-login-gallery-masterpiece-08", path: "assets/ui/v2_27/login_gallery_masterpiece_08_v2_27.png" },
    { key: "v227-login-gallery-masterpiece-09", path: "assets/ui/v2_27/login_gallery_masterpiece_09_v2_27.png" },
    { key: "v227-login-gallery-masterpiece-10", path: "assets/ui/v2_27/login_gallery_masterpiece_10_v2_27.png" },
    { key: "v227-login-gallery-masterpiece-11", path: "assets/ui/v2_27/login_gallery_masterpiece_11_v2_27.png" },
    { key: "v227-login-gallery-masterpiece-12", path: "assets/ui/v2_27/login_gallery_masterpiece_12_v2_27.png" },
    { key: "v227-login-gallery-masterpiece-13", path: "assets/ui/v2_27/login_gallery_masterpiece_13_v2_27.png" },
    { key: "v227-login-gallery-masterpiece-14", path: "assets/ui/v2_27/login_gallery_masterpiece_14_v2_27.png" },
    { key: "v227-login-gallery-masterpiece-15", path: "assets/ui/v2_27/login_gallery_masterpiece_15_v2_27.png" },
    { key: "v227-login-gallery-masterpiece-16", path: "assets/ui/v2_27/login_gallery_masterpiece_16_v2_27.png" },
    { key: "v227-login-gallery-masterpiece-17", path: "assets/ui/v2_27/login_gallery_masterpiece_17_v2_27.png" },
    { key: "v227-login-gallery-masterpiece-18", path: "assets/ui/v2_27/login_gallery_masterpiece_18_v2_27.png" },
    { key: "v227-login-gallery-masterpiece-19", path: "assets/ui/v2_27/login_gallery_masterpiece_19_v2_27.png" },
    { key: "v227-login-gallery-masterpiece-20", path: "assets/ui/v2_27/login_gallery_masterpiece_20_v2_27.png" },
    { key: "v227-login-gallery-masterpiece-21", path: "assets/ui/v2_27/login_gallery_masterpiece_21_v2_27.png" },
    { key: "v227-login-gallery-masterpiece-22", path: "assets/ui/v2_27/login_gallery_masterpiece_22_v2_27.png" },
    { key: "v227-login-gallery-masterpiece-23", path: "assets/ui/v2_27/login_gallery_masterpiece_23_v2_27.png" },
    { key: "v227-login-gallery-masterpiece-24", path: "assets/ui/v2_27/login_gallery_masterpiece_24_v2_27.png" },
    { key: "v227-shared-micro-detail-01", path: "assets/ui/v2_27/shared_micro_detail_01_v2_27.png" },
    { key: "v227-shared-micro-detail-02", path: "assets/ui/v2_27/shared_micro_detail_02_v2_27.png" },
    { key: "v227-shared-micro-detail-03", path: "assets/ui/v2_27/shared_micro_detail_03_v2_27.png" },
    { key: "v227-shared-micro-detail-04", path: "assets/ui/v2_27/shared_micro_detail_04_v2_27.png" },
    { key: "v227-shared-micro-detail-05", path: "assets/ui/v2_27/shared_micro_detail_05_v2_27.png" },
    { key: "v227-shared-micro-detail-06", path: "assets/ui/v2_27/shared_micro_detail_06_v2_27.png" },
    { key: "v227-shared-micro-detail-07", path: "assets/ui/v2_27/shared_micro_detail_07_v2_27.png" },
    { key: "v227-shared-micro-detail-08", path: "assets/ui/v2_27/shared_micro_detail_08_v2_27.png" },
    { key: "v227-shared-micro-detail-09", path: "assets/ui/v2_27/shared_micro_detail_09_v2_27.png" },
    { key: "v227-shared-micro-detail-10", path: "assets/ui/v2_27/shared_micro_detail_10_v2_27.png" },
    { key: "v227-shared-micro-detail-11", path: "assets/ui/v2_27/shared_micro_detail_11_v2_27.png" },
    { key: "v227-shared-micro-detail-12", path: "assets/ui/v2_27/shared_micro_detail_12_v2_27.png" },
    { key: "v227-shared-micro-detail-13", path: "assets/ui/v2_27/shared_micro_detail_13_v2_27.png" },
    { key: "v227-shared-micro-detail-14", path: "assets/ui/v2_27/shared_micro_detail_14_v2_27.png" },
    { key: "v227-shared-micro-detail-15", path: "assets/ui/v2_27/shared_micro_detail_15_v2_27.png" },
    { key: "v227-shared-micro-detail-16", path: "assets/ui/v2_27/shared_micro_detail_16_v2_27.png" },
    { key: "v227-shared-micro-detail-17", path: "assets/ui/v2_27/shared_micro_detail_17_v2_27.png" },
    { key: "v227-shared-micro-detail-18", path: "assets/ui/v2_27/shared_micro_detail_18_v2_27.png" },
    { key: "v227-shared-micro-detail-19", path: "assets/ui/v2_27/shared_micro_detail_19_v2_27.png" },
    { key: "v227-shared-micro-detail-20", path: "assets/ui/v2_27/shared_micro_detail_20_v2_27.png" },
    { key: "v227-shared-micro-detail-21", path: "assets/ui/v2_27/shared_micro_detail_21_v2_27.png" },
    { key: "v227-shared-micro-detail-22", path: "assets/ui/v2_27/shared_micro_detail_22_v2_27.png" },
    { key: "v227-shared-micro-detail-23", path: "assets/ui/v2_27/shared_micro_detail_23_v2_27.png" },
    { key: "v227-shared-micro-detail-24", path: "assets/ui/v2_27/shared_micro_detail_24_v2_27.png" },
  ],
  lobby: [
    { key: "v227-lobby-gallery-masterpiece-01", path: "assets/ui/v2_27/lobby_gallery_masterpiece_01_v2_27.png" },
    { key: "v227-lobby-gallery-masterpiece-02", path: "assets/ui/v2_27/lobby_gallery_masterpiece_02_v2_27.png" },
    { key: "v227-lobby-gallery-masterpiece-03", path: "assets/ui/v2_27/lobby_gallery_masterpiece_03_v2_27.png" },
    { key: "v227-lobby-gallery-masterpiece-04", path: "assets/ui/v2_27/lobby_gallery_masterpiece_04_v2_27.png" },
    { key: "v227-lobby-gallery-masterpiece-05", path: "assets/ui/v2_27/lobby_gallery_masterpiece_05_v2_27.png" },
    { key: "v227-lobby-gallery-masterpiece-06", path: "assets/ui/v2_27/lobby_gallery_masterpiece_06_v2_27.png" },
    { key: "v227-lobby-gallery-masterpiece-07", path: "assets/ui/v2_27/lobby_gallery_masterpiece_07_v2_27.png" },
    { key: "v227-lobby-gallery-masterpiece-08", path: "assets/ui/v2_27/lobby_gallery_masterpiece_08_v2_27.png" },
    { key: "v227-lobby-gallery-masterpiece-09", path: "assets/ui/v2_27/lobby_gallery_masterpiece_09_v2_27.png" },
    { key: "v227-lobby-gallery-masterpiece-10", path: "assets/ui/v2_27/lobby_gallery_masterpiece_10_v2_27.png" },
    { key: "v227-lobby-gallery-masterpiece-11", path: "assets/ui/v2_27/lobby_gallery_masterpiece_11_v2_27.png" },
    { key: "v227-lobby-gallery-masterpiece-12", path: "assets/ui/v2_27/lobby_gallery_masterpiece_12_v2_27.png" },
    { key: "v227-lobby-gallery-masterpiece-13", path: "assets/ui/v2_27/lobby_gallery_masterpiece_13_v2_27.png" },
    { key: "v227-lobby-gallery-masterpiece-14", path: "assets/ui/v2_27/lobby_gallery_masterpiece_14_v2_27.png" },
    { key: "v227-lobby-gallery-masterpiece-15", path: "assets/ui/v2_27/lobby_gallery_masterpiece_15_v2_27.png" },
    { key: "v227-lobby-gallery-masterpiece-16", path: "assets/ui/v2_27/lobby_gallery_masterpiece_16_v2_27.png" },
    { key: "v227-lobby-gallery-masterpiece-17", path: "assets/ui/v2_27/lobby_gallery_masterpiece_17_v2_27.png" },
    { key: "v227-lobby-gallery-masterpiece-18", path: "assets/ui/v2_27/lobby_gallery_masterpiece_18_v2_27.png" },
    { key: "v227-lobby-gallery-masterpiece-19", path: "assets/ui/v2_27/lobby_gallery_masterpiece_19_v2_27.png" },
    { key: "v227-lobby-gallery-masterpiece-20", path: "assets/ui/v2_27/lobby_gallery_masterpiece_20_v2_27.png" },
    { key: "v227-lobby-gallery-masterpiece-21", path: "assets/ui/v2_27/lobby_gallery_masterpiece_21_v2_27.png" },
    { key: "v227-lobby-gallery-masterpiece-22", path: "assets/ui/v2_27/lobby_gallery_masterpiece_22_v2_27.png" },
    { key: "v227-lobby-gallery-masterpiece-23", path: "assets/ui/v2_27/lobby_gallery_masterpiece_23_v2_27.png" },
    { key: "v227-lobby-gallery-masterpiece-24", path: "assets/ui/v2_27/lobby_gallery_masterpiece_24_v2_27.png" },
    { key: "v227-shared-micro-detail-01", path: "assets/ui/v2_27/shared_micro_detail_01_v2_27.png" },
    { key: "v227-shared-micro-detail-02", path: "assets/ui/v2_27/shared_micro_detail_02_v2_27.png" },
    { key: "v227-shared-micro-detail-03", path: "assets/ui/v2_27/shared_micro_detail_03_v2_27.png" },
    { key: "v227-shared-micro-detail-04", path: "assets/ui/v2_27/shared_micro_detail_04_v2_27.png" },
    { key: "v227-shared-micro-detail-05", path: "assets/ui/v2_27/shared_micro_detail_05_v2_27.png" },
    { key: "v227-shared-micro-detail-06", path: "assets/ui/v2_27/shared_micro_detail_06_v2_27.png" },
    { key: "v227-shared-micro-detail-07", path: "assets/ui/v2_27/shared_micro_detail_07_v2_27.png" },
    { key: "v227-shared-micro-detail-08", path: "assets/ui/v2_27/shared_micro_detail_08_v2_27.png" },
    { key: "v227-shared-micro-detail-09", path: "assets/ui/v2_27/shared_micro_detail_09_v2_27.png" },
    { key: "v227-shared-micro-detail-10", path: "assets/ui/v2_27/shared_micro_detail_10_v2_27.png" },
    { key: "v227-shared-micro-detail-11", path: "assets/ui/v2_27/shared_micro_detail_11_v2_27.png" },
    { key: "v227-shared-micro-detail-12", path: "assets/ui/v2_27/shared_micro_detail_12_v2_27.png" },
    { key: "v227-shared-micro-detail-13", path: "assets/ui/v2_27/shared_micro_detail_13_v2_27.png" },
    { key: "v227-shared-micro-detail-14", path: "assets/ui/v2_27/shared_micro_detail_14_v2_27.png" },
    { key: "v227-shared-micro-detail-15", path: "assets/ui/v2_27/shared_micro_detail_15_v2_27.png" },
    { key: "v227-shared-micro-detail-16", path: "assets/ui/v2_27/shared_micro_detail_16_v2_27.png" },
    { key: "v227-shared-micro-detail-17", path: "assets/ui/v2_27/shared_micro_detail_17_v2_27.png" },
    { key: "v227-shared-micro-detail-18", path: "assets/ui/v2_27/shared_micro_detail_18_v2_27.png" },
    { key: "v227-shared-micro-detail-19", path: "assets/ui/v2_27/shared_micro_detail_19_v2_27.png" },
    { key: "v227-shared-micro-detail-20", path: "assets/ui/v2_27/shared_micro_detail_20_v2_27.png" },
    { key: "v227-shared-micro-detail-21", path: "assets/ui/v2_27/shared_micro_detail_21_v2_27.png" },
    { key: "v227-shared-micro-detail-22", path: "assets/ui/v2_27/shared_micro_detail_22_v2_27.png" },
    { key: "v227-shared-micro-detail-23", path: "assets/ui/v2_27/shared_micro_detail_23_v2_27.png" },
    { key: "v227-shared-micro-detail-24", path: "assets/ui/v2_27/shared_micro_detail_24_v2_27.png" },
  ],
  world: [
    { key: "v227-world-gallery-masterpiece-01", path: "assets/ui/v2_27/world_gallery_masterpiece_01_v2_27.png" },
    { key: "v227-world-gallery-masterpiece-02", path: "assets/ui/v2_27/world_gallery_masterpiece_02_v2_27.png" },
    { key: "v227-world-gallery-masterpiece-03", path: "assets/ui/v2_27/world_gallery_masterpiece_03_v2_27.png" },
    { key: "v227-world-gallery-masterpiece-04", path: "assets/ui/v2_27/world_gallery_masterpiece_04_v2_27.png" },
    { key: "v227-world-gallery-masterpiece-05", path: "assets/ui/v2_27/world_gallery_masterpiece_05_v2_27.png" },
    { key: "v227-world-gallery-masterpiece-06", path: "assets/ui/v2_27/world_gallery_masterpiece_06_v2_27.png" },
    { key: "v227-world-gallery-masterpiece-07", path: "assets/ui/v2_27/world_gallery_masterpiece_07_v2_27.png" },
    { key: "v227-world-gallery-masterpiece-08", path: "assets/ui/v2_27/world_gallery_masterpiece_08_v2_27.png" },
    { key: "v227-world-gallery-masterpiece-09", path: "assets/ui/v2_27/world_gallery_masterpiece_09_v2_27.png" },
    { key: "v227-world-gallery-masterpiece-10", path: "assets/ui/v2_27/world_gallery_masterpiece_10_v2_27.png" },
    { key: "v227-world-gallery-masterpiece-11", path: "assets/ui/v2_27/world_gallery_masterpiece_11_v2_27.png" },
    { key: "v227-world-gallery-masterpiece-12", path: "assets/ui/v2_27/world_gallery_masterpiece_12_v2_27.png" },
    { key: "v227-world-gallery-masterpiece-13", path: "assets/ui/v2_27/world_gallery_masterpiece_13_v2_27.png" },
    { key: "v227-world-gallery-masterpiece-14", path: "assets/ui/v2_27/world_gallery_masterpiece_14_v2_27.png" },
    { key: "v227-world-gallery-masterpiece-15", path: "assets/ui/v2_27/world_gallery_masterpiece_15_v2_27.png" },
    { key: "v227-world-gallery-masterpiece-16", path: "assets/ui/v2_27/world_gallery_masterpiece_16_v2_27.png" },
    { key: "v227-world-gallery-masterpiece-17", path: "assets/ui/v2_27/world_gallery_masterpiece_17_v2_27.png" },
    { key: "v227-world-gallery-masterpiece-18", path: "assets/ui/v2_27/world_gallery_masterpiece_18_v2_27.png" },
    { key: "v227-world-gallery-masterpiece-19", path: "assets/ui/v2_27/world_gallery_masterpiece_19_v2_27.png" },
    { key: "v227-world-gallery-masterpiece-20", path: "assets/ui/v2_27/world_gallery_masterpiece_20_v2_27.png" },
    { key: "v227-world-gallery-masterpiece-21", path: "assets/ui/v2_27/world_gallery_masterpiece_21_v2_27.png" },
    { key: "v227-world-gallery-masterpiece-22", path: "assets/ui/v2_27/world_gallery_masterpiece_22_v2_27.png" },
    { key: "v227-world-gallery-masterpiece-23", path: "assets/ui/v2_27/world_gallery_masterpiece_23_v2_27.png" },
    { key: "v227-world-gallery-masterpiece-24", path: "assets/ui/v2_27/world_gallery_masterpiece_24_v2_27.png" },
    { key: "v227-shared-micro-detail-01", path: "assets/ui/v2_27/shared_micro_detail_01_v2_27.png" },
    { key: "v227-shared-micro-detail-02", path: "assets/ui/v2_27/shared_micro_detail_02_v2_27.png" },
    { key: "v227-shared-micro-detail-03", path: "assets/ui/v2_27/shared_micro_detail_03_v2_27.png" },
    { key: "v227-shared-micro-detail-04", path: "assets/ui/v2_27/shared_micro_detail_04_v2_27.png" },
    { key: "v227-shared-micro-detail-05", path: "assets/ui/v2_27/shared_micro_detail_05_v2_27.png" },
    { key: "v227-shared-micro-detail-06", path: "assets/ui/v2_27/shared_micro_detail_06_v2_27.png" },
    { key: "v227-shared-micro-detail-07", path: "assets/ui/v2_27/shared_micro_detail_07_v2_27.png" },
    { key: "v227-shared-micro-detail-08", path: "assets/ui/v2_27/shared_micro_detail_08_v2_27.png" },
    { key: "v227-shared-micro-detail-09", path: "assets/ui/v2_27/shared_micro_detail_09_v2_27.png" },
    { key: "v227-shared-micro-detail-10", path: "assets/ui/v2_27/shared_micro_detail_10_v2_27.png" },
    { key: "v227-shared-micro-detail-11", path: "assets/ui/v2_27/shared_micro_detail_11_v2_27.png" },
    { key: "v227-shared-micro-detail-12", path: "assets/ui/v2_27/shared_micro_detail_12_v2_27.png" },
    { key: "v227-shared-micro-detail-13", path: "assets/ui/v2_27/shared_micro_detail_13_v2_27.png" },
    { key: "v227-shared-micro-detail-14", path: "assets/ui/v2_27/shared_micro_detail_14_v2_27.png" },
    { key: "v227-shared-micro-detail-15", path: "assets/ui/v2_27/shared_micro_detail_15_v2_27.png" },
    { key: "v227-shared-micro-detail-16", path: "assets/ui/v2_27/shared_micro_detail_16_v2_27.png" },
    { key: "v227-shared-micro-detail-17", path: "assets/ui/v2_27/shared_micro_detail_17_v2_27.png" },
    { key: "v227-shared-micro-detail-18", path: "assets/ui/v2_27/shared_micro_detail_18_v2_27.png" },
    { key: "v227-shared-micro-detail-19", path: "assets/ui/v2_27/shared_micro_detail_19_v2_27.png" },
    { key: "v227-shared-micro-detail-20", path: "assets/ui/v2_27/shared_micro_detail_20_v2_27.png" },
    { key: "v227-shared-micro-detail-21", path: "assets/ui/v2_27/shared_micro_detail_21_v2_27.png" },
    { key: "v227-shared-micro-detail-22", path: "assets/ui/v2_27/shared_micro_detail_22_v2_27.png" },
    { key: "v227-shared-micro-detail-23", path: "assets/ui/v2_27/shared_micro_detail_23_v2_27.png" },
    { key: "v227-shared-micro-detail-24", path: "assets/ui/v2_27/shared_micro_detail_24_v2_27.png" },
  ],
  battle: [
    { key: "v227-battle-gallery-masterpiece-01", path: "assets/ui/v2_27/battle_gallery_masterpiece_01_v2_27.png" },
    { key: "v227-battle-gallery-masterpiece-02", path: "assets/ui/v2_27/battle_gallery_masterpiece_02_v2_27.png" },
    { key: "v227-battle-gallery-masterpiece-03", path: "assets/ui/v2_27/battle_gallery_masterpiece_03_v2_27.png" },
    { key: "v227-battle-gallery-masterpiece-04", path: "assets/ui/v2_27/battle_gallery_masterpiece_04_v2_27.png" },
    { key: "v227-battle-gallery-masterpiece-05", path: "assets/ui/v2_27/battle_gallery_masterpiece_05_v2_27.png" },
    { key: "v227-battle-gallery-masterpiece-06", path: "assets/ui/v2_27/battle_gallery_masterpiece_06_v2_27.png" },
    { key: "v227-battle-gallery-masterpiece-07", path: "assets/ui/v2_27/battle_gallery_masterpiece_07_v2_27.png" },
    { key: "v227-battle-gallery-masterpiece-08", path: "assets/ui/v2_27/battle_gallery_masterpiece_08_v2_27.png" },
    { key: "v227-battle-gallery-masterpiece-09", path: "assets/ui/v2_27/battle_gallery_masterpiece_09_v2_27.png" },
    { key: "v227-battle-gallery-masterpiece-10", path: "assets/ui/v2_27/battle_gallery_masterpiece_10_v2_27.png" },
    { key: "v227-battle-gallery-masterpiece-11", path: "assets/ui/v2_27/battle_gallery_masterpiece_11_v2_27.png" },
    { key: "v227-battle-gallery-masterpiece-12", path: "assets/ui/v2_27/battle_gallery_masterpiece_12_v2_27.png" },
    { key: "v227-battle-gallery-masterpiece-13", path: "assets/ui/v2_27/battle_gallery_masterpiece_13_v2_27.png" },
    { key: "v227-battle-gallery-masterpiece-14", path: "assets/ui/v2_27/battle_gallery_masterpiece_14_v2_27.png" },
    { key: "v227-battle-gallery-masterpiece-15", path: "assets/ui/v2_27/battle_gallery_masterpiece_15_v2_27.png" },
    { key: "v227-battle-gallery-masterpiece-16", path: "assets/ui/v2_27/battle_gallery_masterpiece_16_v2_27.png" },
    { key: "v227-battle-gallery-masterpiece-17", path: "assets/ui/v2_27/battle_gallery_masterpiece_17_v2_27.png" },
    { key: "v227-battle-gallery-masterpiece-18", path: "assets/ui/v2_27/battle_gallery_masterpiece_18_v2_27.png" },
    { key: "v227-battle-gallery-masterpiece-19", path: "assets/ui/v2_27/battle_gallery_masterpiece_19_v2_27.png" },
    { key: "v227-battle-gallery-masterpiece-20", path: "assets/ui/v2_27/battle_gallery_masterpiece_20_v2_27.png" },
    { key: "v227-battle-gallery-masterpiece-21", path: "assets/ui/v2_27/battle_gallery_masterpiece_21_v2_27.png" },
    { key: "v227-battle-gallery-masterpiece-22", path: "assets/ui/v2_27/battle_gallery_masterpiece_22_v2_27.png" },
    { key: "v227-battle-gallery-masterpiece-23", path: "assets/ui/v2_27/battle_gallery_masterpiece_23_v2_27.png" },
    { key: "v227-battle-gallery-masterpiece-24", path: "assets/ui/v2_27/battle_gallery_masterpiece_24_v2_27.png" },
    { key: "v227-shared-micro-detail-01", path: "assets/ui/v2_27/shared_micro_detail_01_v2_27.png" },
    { key: "v227-shared-micro-detail-02", path: "assets/ui/v2_27/shared_micro_detail_02_v2_27.png" },
    { key: "v227-shared-micro-detail-03", path: "assets/ui/v2_27/shared_micro_detail_03_v2_27.png" },
    { key: "v227-shared-micro-detail-04", path: "assets/ui/v2_27/shared_micro_detail_04_v2_27.png" },
    { key: "v227-shared-micro-detail-05", path: "assets/ui/v2_27/shared_micro_detail_05_v2_27.png" },
    { key: "v227-shared-micro-detail-06", path: "assets/ui/v2_27/shared_micro_detail_06_v2_27.png" },
    { key: "v227-shared-micro-detail-07", path: "assets/ui/v2_27/shared_micro_detail_07_v2_27.png" },
    { key: "v227-shared-micro-detail-08", path: "assets/ui/v2_27/shared_micro_detail_08_v2_27.png" },
    { key: "v227-shared-micro-detail-09", path: "assets/ui/v2_27/shared_micro_detail_09_v2_27.png" },
    { key: "v227-shared-micro-detail-10", path: "assets/ui/v2_27/shared_micro_detail_10_v2_27.png" },
    { key: "v227-shared-micro-detail-11", path: "assets/ui/v2_27/shared_micro_detail_11_v2_27.png" },
    { key: "v227-shared-micro-detail-12", path: "assets/ui/v2_27/shared_micro_detail_12_v2_27.png" },
    { key: "v227-shared-micro-detail-13", path: "assets/ui/v2_27/shared_micro_detail_13_v2_27.png" },
    { key: "v227-shared-micro-detail-14", path: "assets/ui/v2_27/shared_micro_detail_14_v2_27.png" },
    { key: "v227-shared-micro-detail-15", path: "assets/ui/v2_27/shared_micro_detail_15_v2_27.png" },
    { key: "v227-shared-micro-detail-16", path: "assets/ui/v2_27/shared_micro_detail_16_v2_27.png" },
    { key: "v227-shared-micro-detail-17", path: "assets/ui/v2_27/shared_micro_detail_17_v2_27.png" },
    { key: "v227-shared-micro-detail-18", path: "assets/ui/v2_27/shared_micro_detail_18_v2_27.png" },
    { key: "v227-shared-micro-detail-19", path: "assets/ui/v2_27/shared_micro_detail_19_v2_27.png" },
    { key: "v227-shared-micro-detail-20", path: "assets/ui/v2_27/shared_micro_detail_20_v2_27.png" },
    { key: "v227-shared-micro-detail-21", path: "assets/ui/v2_27/shared_micro_detail_21_v2_27.png" },
    { key: "v227-shared-micro-detail-22", path: "assets/ui/v2_27/shared_micro_detail_22_v2_27.png" },
    { key: "v227-shared-micro-detail-23", path: "assets/ui/v2_27/shared_micro_detail_23_v2_27.png" },
    { key: "v227-shared-micro-detail-24", path: "assets/ui/v2_27/shared_micro_detail_24_v2_27.png" },
  ],
};

const C = {
  gold: 0xffd77a,
  pearl: 0xfff3df,
  sky: 0x88ddff,
  rose: 0xff91bd,
  mint: 0x9ce9bf,
  violet: 0xb49cff,
  ink: 0x17366c,
  deep: 0x071b3e,
};

function canAnimate(): boolean {
  return !isLowDeviceProfile();
}

function has(scene: Phaser.Scene, key: string): boolean {
  return scene.textures.exists(key);
}

function image(
  scene: Phaser.Scene,
  key: string,
  x: number,
  y: number,
  width: number,
  height: number,
  depth: number,
  alpha = 1,
  tint?: number,
): Phaser.GameObjects.Image | undefined {
  if (!has(scene, key)) return undefined;
  const sprite = scene.add
    .image(x, y, key)
    .setDisplaySize(width, height)
    .setDepth(depth)
    .setAlpha(0);
  if (tint !== undefined) sprite.setTint(tint);
  scene.tweens.add({ targets: sprite, alpha, duration: 160, ease: "Sine.easeOut" });
  return sprite;
}

function images(scene: Phaser.Scene, placements: readonly Placement[]): Phaser.GameObjects.Image[] {
  return placements.flatMap(([key, x, y, width, height, depth, alpha = 1, tint]) => {
    const sprite = image(scene, key, x, y, width, height, depth, alpha, tint);
    return sprite ? [sprite] : [];
  });
}

function breathe(scene: Phaser.Scene, target: Phaser.GameObjects.GameObject, amount = 1.0018, delay = 0): void {
  if (!canAnimate()) return;
  scene.tweens.add({
    targets: target,
    scaleX: amount,
    scaleY: amount,
    alpha: "+=0.006",
    duration: 3400,
    delay,
    yoyo: true,
    repeat: -1,
    ease: "Sine.easeInOut",
  });
}

function float(scene: Phaser.Scene, target: Phaser.GameObjects.GameObject, amount = 0.85, delay = 0): void {
  if (!canAnimate()) return;
  scene.tweens.add({
    targets: target,
    y: `-=${amount}`,
    duration: 2800 + delay * 2,
    delay,
    yoyo: true,
    repeat: -1,
    ease: "Sine.easeInOut",
  });
}

function painterlyWash(scene: Phaser.Scene, depth: number, tone: "login" | "lobby" | "world" | "battle"): void {
  const warm = tone === "battle" ? C.violet : tone === "world" ? C.mint : tone === "lobby" ? C.gold : C.rose;
  const g = scene.add.graphics().setDepth(depth);
  g.fillGradientStyle(C.deep, C.deep, warm, C.sky, 0.22, 0.16, 0.06, 0.1);
  g.fillRect(0, 0, 960, 540);
  g.fillStyle(C.pearl, tone === "battle" ? 0.014 : 0.028).fillEllipse(480, 270, 820, 360);
  g.lineStyle(1, 0xffffff, 0.045);
  for (let i = 0; i < 6; i += 1) g.strokeEllipse(480, 276, 250 + i * 96, 100 + i * 44);
}

function microDust(scene: Phaser.Scene, depth: number, count: number, area: Phaser.Geom.Rectangle): void {
  const safeCount = isLowDeviceProfile() ? Math.ceil(count * 0.3) : count;
  const palette = [C.gold, C.sky, C.rose, C.mint, C.violet, 0xffffff];
  for (let i = 0; i < safeCount; i += 1) {
    const x = area.x + ((i * 127) % area.width);
    const y = area.y + ((i * 83) % area.height);
    const mote = scene.add
      .star(x, y, 5, 0.9, 2.2 + (i % 3), palette[i % palette.length], 0.1)
      .setDepth(depth)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setAlpha(0);
    scene.tweens.add({ targets: mote, alpha: 0.14, duration: 150, delay: i * 6 });
    float(scene, mote, 0.7 + (i % 2), i * 14);
  }
}

function themeTint(theme: BattleTheme): number | undefined {
  if (theme === "canyon") return 0xffc17c;
  if (theme === "swamp") return C.mint;
  if (theme === "fortress") return C.violet;
  return undefined;
}

export function addV227LoginArt(scene: Phaser.Scene): void {
  if (has(scene, "v227-login-grand-illustration-bg")) {
    addCoverImage(scene, "v227-login-grand-illustration-bg", 960, 540, 2).setAlpha(0.86);
  } else painterlyWash(scene, 2, "login");

  const vignette = image(scene, "v227-login-soft-shadow-vignette", 480, 270, 960, 540, 5, 0.22);
  const rays = image(scene, "v227-login-prism-curtain-lights", 480, 144, 790, 255, 7, 0.34);
  const card = image(scene, "v227-login-silk-card-frame", 480, 351, 500, 320, 23, 0.66);
  const title = image(scene, "v227-login-royal-glass-title", 480, 165, 372, 126, 37, 0.80);
  const glow = image(scene, "v227-login-palette-glow", 480, 352, 610, 330, 21, 0.20);
  const left = image(scene, "v227-login-left-flora-filigree", 184, 452, 144, 144, 40, 0.50);
  const right = image(scene, "v227-login-right-flora-filigree", 776, 452, 144, 144, 40, 0.50);
  const fox = image(scene, "v227-login-mascot-fox-prince", 286, 429, 108, 108, 45, 0.88);
  const deer = image(scene, "v227-login-mascot-deer-priestess", 672, 429, 108, 108, 45, 0.84);
  const bird = image(scene, "v227-login-mascot-bluebird-messenger", 720, 195, 56, 56, 45, 0.62);
  const pieces = images(scene, [
    ["v227-login-start-button-enamel", 480, 346, 304, 72, 50, 0.48],
    ["v227-login-cloud-button-opal", 480, 394, 304, 72, 50, 0.42],
    ["v227-login-small-button-ivory", 413, 439, 150, 49, 50, 0.36],
    ["v227-login-small-button-ivory", 547, 439, 150, 49, 50, 0.36],
    ["v227-login-latency-guard-badge", 338, 347, 46, 46, 62, 0.82],
    ["v227-login-local-boot-badge", 620, 394, 46, 46, 62, 0.76],
    ["v227-login-input-focus-ring", 480, 416, 334, 120, 48, 0.16],
    ["v227-login-gold-micro-divider", 480, 486, 232, 33, 51, 0.40],
  ]);
  scene.add
    .text(480, 165, "ATELIER ROYAL DEFENSE", {
      fontFamily: "Pretendard, Noto Sans KR, NanumSquareRound, Arial, sans-serif",
      fontSize: "12px",
      fontStyle: "bold",
      color: "#244b88",
      stroke: "#ffffff",
      strokeThickness: 3,
      fixedWidth: 270,
      align: "center",
    })
    .setOrigin(0.5)
    .setDepth(39)
    .setAlpha(0.92);
  [vignette, rays, glow, card, title, left, right, fox, deer, bird, ...pieces].forEach((sprite, index) => {
    if (!sprite) return;
    if (index < 5) breathe(scene, sprite, 1.002, index * 60);
    else float(scene, sprite, 0.65 + (index % 3) * 0.12, index * 28);
  });
  microDust(scene, 8, 14, new Phaser.Geom.Rectangle(128, 80, 704, 132));
}

export function addV227LobbyArt(scene: Phaser.Scene, nickname: string, stars: number): void {
  if (has(scene, "v227-lobby-grand-hall-bg")) {
    addCoverImage(scene, "v227-lobby-grand-hall-bg", 960, 540, 2).setAlpha(0.76);
  } else painterlyWash(scene, 3, "lobby");
  const banner = image(scene, "v227-lobby-gilded-header-banner", 480, 105, 486, 116, 18, 0.68);
  const nav = image(scene, "v227-lobby-nav-silk-frame", 480, 503, 738, 94, 8, 0.60);
  const profile = image(scene, "v227-lobby-profile-glass-card", 106, 187, 186, 80, 9, 0.48);
  image(scene, "v227-lobby-corner-floral-spray", 878, 465, 104, 104, 10, 0.32);
  scene.add
    .text(480, 98, "왕국 아틀리에 작전실", {
      fontFamily: "Pretendard, Noto Sans KR, NanumSquareRound, Arial, sans-serif",
      fontSize: "14px",
      fontStyle: "bold",
      color: "#244b88",
      stroke: "#ffffff",
      strokeThickness: 3,
      fixedWidth: 320,
      align: "center",
    })
    .setOrigin(0.5)
    .setDepth(21);
  scene.add
    .text(480, 123, `${nickname} · 별 ${stars}개 · idle 스트리밍 보호`, {
      fontFamily: "Pretendard, Noto Sans KR, Arial, sans-serif",
      fontSize: "8px",
      fontStyle: "bold",
      color: "#5e6f9e",
      stroke: "#ffffff",
      strokeThickness: 2,
      fixedWidth: 340,
      align: "center",
    })
    .setOrigin(0.5)
    .setDepth(21)
    .setAlpha(0.86);
  const sprites = images(scene, [
    ["v227-lobby-resource-star-medal", 500, 35, 90, 50, 14, 0.58],
    ["v227-lobby-resource-coin-medal", 638, 35, 90, 50, 14, 0.52],
    ["v227-lobby-resource-gem-medal", 770, 35, 90, 50, 14, 0.52],
    ["v227-lobby-resource-heart-medal", 880, 35, 72, 44, 14, 0.44],
    ["v227-lobby-shop-pavilion", 86, 270, 60, 60, 14, 0.50],
    ["v227-lobby-quest-codex", 858, 135, 60, 60, 14, 0.50],
    ["v227-lobby-mail-crystal-swan", 86, 426, 48, 48, 14, 0.40],
    ["v227-lobby-event-lantern", 86, 478, 48, 48, 14, 0.40],
    ["v227-lobby-npc-squirrel-painter", 242, 358, 74, 74, 19, 0.68],
    ["v227-lobby-npc-bunny-chef", 706, 358, 74, 74, 19, 0.68],
    ["v227-lobby-npc-cat-archmage", 818, 374, 62, 62, 19, 0.56],
    ["v227-lobby-npc-otter-scout", 146, 368, 58, 58, 19, 0.48],
    ["v227-lobby-perf-budget-medal", 906, 84, 34, 34, 15, 0.46],
    ["v227-lobby-touch-safe-badge", 906, 124, 34, 34, 15, 0.36],
    ["v227-lobby-idle-stream-badge", 906, 164, 34, 34, 15, 0.34],
  ]);
  [banner, nav, profile].forEach((sprite, index) => sprite && breathe(scene, sprite, 1.002, index * 70));
  sprites.forEach((sprite, index) => float(scene, sprite, 0.6 + (index % 3) * 0.14, index * 26));
  microDust(scene, 7, 12, new Phaser.Geom.Rectangle(150, 74, 650, 86));
}

export function addV227WorldMapArt(scene: Phaser.Scene, stageNodes: readonly StageNodeLike[]): void {
  if (has(scene, "v227-world-story-atlas-bg")) {
    addCoverImage(scene, "v227-world-story-atlas-bg", 960, 540, 2).setAlpha(0.68);
  } else painterlyWash(scene, 2, "world");
  const preview = image(scene, "v227-world-preview-gallery-frame", 815, 283, 336, 260, 22, 0.56);
  const cloud = image(scene, "v227-world-cloud-chapter-card", 816, 116, 246, 80, 11, 0.30);
  const compass = image(scene, "v227-world-compass-porcelain", 86, 94, 58, 58, 17, 0.38);
  const mist = image(scene, "v227-world-mist-watercolor", 428, 270, 250, 124, 6, 0.18);
  image(scene, "v227-world-safe-scroll-badge", 120, 478, 42, 42, 20, 0.30);
  image(scene, "v227-world-scroll-edge-left", 28, 276, 62, 242, 7, 0.18);
  image(scene, "v227-world-scroll-edge-right", 932, 276, 62, 242, 7, 0.18);
  [preview, cloud, compass, mist].forEach((sprite, index) => sprite && breathe(scene, sprite, 1.002, index * 55));
  stageNodes.forEach((node, index) => {
    const radius = node.radius ?? 24;
    const tint = [C.gold, C.sky, C.mint, C.rose, C.violet][index % 5];
    image(scene, "v227-world-island-shadow", node.x, node.y + 14, radius * 3.1, radius * 1.7, 10, 0.15, tint);
    const ring = image(scene, "v227-world-stage-jewel-ring", node.x, node.y, radius * 2.62, radius * 2.62, 18, 0.42, tint);
    if (ring && canAnimate()) {
      scene.tweens.add({ targets: ring, scaleX: 1.04, scaleY: 1.04, alpha: 0.54, duration: 1650 + index * 38, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
    }
    if (index < stageNodes.length - 1) {
      const next = stageNodes[index + 1];
      const midX = (node.x + next.x) / 2;
      const midY = (node.y + next.y) / 2;
      const angle = Phaser.Math.RadToDeg(Math.atan2(next.y - node.y, next.x - node.x));
      const route = image(scene, "v227-world-route-silk-prism", midX, midY, 120, 34, 12, 0.30);
      route?.setRotation(Phaser.Math.DegToRad(angle));
      if (index % 2 === 0) image(scene, "v227-world-route-spark-dot", midX, midY - 17, 18, 18, 13, 0.28, tint);
    }
    if (index % 4 === 0) image(scene, "v227-world-node-crown-micro", node.x, node.y - radius - 13, 26, 26, 20, 0.38);
    if (index % 5 === 3) image(scene, "v227-world-reward-gem-bloom", node.x + radius + 9, node.y + radius - 3, 27, 27, 20, 0.38);
    if (index % 6 === 5) image(scene, "v227-world-lock-royal-seal", node.x - radius - 8, node.y + radius - 2, 25, 25, 20, 0.32);
  });
  image(scene, "v227-world-boss-castle-gate", 704, 450, 88, 84, 19, 0.50);
  image(scene, "v227-world-selected-crown-glow", 478, 72, 74, 54, 21, 0.24);
  image(scene, "v227-world-stage-focus-halo", 480, 300, 350, 180, 5, 0.08);
  microDust(scene, 7, 10, new Phaser.Geom.Rectangle(92, 74, 610, 360));
}

export function addV227BattleArt(scene: Phaser.Scene, theme: BattleTheme): void {
  const tint = themeTint(theme);
  const overlay = image(scene, "v227-battle-painterly-overlay", 480, 270, 960, 540, 5, 0.50, tint);
  const top = image(scene, "v227-battle-top-hud-gilded-frame", 480, 38, 790, 70, 36, 0.32, tint);
  const dock = image(scene, "v227-battle-bottom-skill-silk-dock", 480, 507, 716, 90, 35, 0.36, tint);
  const left = image(scene, "v227-battle-side-vine-left", 34, 286, 68, 276, 20, 0.18, tint);
  const right = image(scene, "v227-battle-side-vine-right", 926, 286, 68, 276, 20, 0.18, tint);
  const cards = images(scene, [
    ["v227-battle-skill-meteor-enamel", 850, 164, 130, 64, 47, 0.38, tint],
    ["v227-battle-skill-guard-enamel", 850, 220, 130, 64, 47, 0.34, tint],
    ["v227-battle-skill-hero-enamel", 850, 276, 130, 64, 47, 0.34, tint],
    ["v227-battle-combo-prism-badge", 480, 78, 40, 40, 49, 0.30],
    ["v227-battle-boss-warning-emblem", 160, 74, 44, 44, 49, 0.26, tint],
    ["v227-battle-mana-crystal-drop", 802, 478, 34, 34, 49, 0.29, tint],
    ["v227-battle-safe-corner-left", 66, 500, 104, 70, 21, 0.15, tint],
    ["v227-battle-safe-corner-right", 894, 500, 104, 70, 21, 0.15, tint],
    ["v227-battle-frame-budget-badge", 913, 39, 25, 25, 49, 0.20],
    ["v227-battle-target-focus-ring", 480, 290, 164, 108, 12, 0.08, tint],
    ["v227-battle-wave-banner-silk", 480, 80, 190, 48, 48, 0.16, tint],
    ["v227-battle-reward-petal", 720, 472, 34, 34, 48, 0.18],
    ["v227-battle-touch-safe-mark", 742, 40, 26, 26, 48, 0.18],
  ]);
  [overlay, top, dock, left, right].forEach((sprite, index) => sprite && breathe(scene, sprite, 1.0016, index * 65));
  cards.forEach((sprite, index) => float(scene, sprite, 0.55 + (index % 2) * 0.22, index * 24));
}
