import Phaser from "phaser";
import { safeDelayedCall } from "./SceneSafety";
import { isLowDeviceProfile } from "./PerformanceMode";

export type ProgressiveArtBundle = "login" | "lobby" | "world" | "battle";
type AssetDef = { key: string; path: string };

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

const query = new URLSearchParams(
  typeof window !== "undefined" ? window.location.search : "",
);

let cachedWebpSupport: boolean | undefined;

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

export function loadProgressiveArtBundle(
  scene: Phaser.Scene,
  bundle: ProgressiveArtBundle,
  onComplete: () => void,
  options: { delayMs?: number; includeGallery?: boolean } = {},
): void {
  const delayMs = options.delayMs ?? 0;
  safeDelayedCall(scene, delayMs, () => {
    if (!sceneIsLive(scene)) return;
    const includeGallery = options.includeGallery ?? (fullArtEnabled() && !isLowDeviceProfile());
    const defs = includeGallery
      ? [...CORE_BUNDLES[bundle], ...GALLERY_BUNDLES[bundle]]
      : CORE_BUNDLES[bundle];
    const missing = defs.filter((asset) => !scene.textures.exists(asset.key));
    if (missing.length === 0) {
      safeDelayedCall(scene, 0, onComplete);
      return;
    }

    const loader = scene.load as Phaser.Loader.LoaderPlugin & {
      maxParallelDownloads?: number;
      isLoading?: () => boolean;
    };
    loader.maxParallelDownloads = isLowDeviceProfile() ? 2 : 3;
    const done = (): void => {
      loader.off("complete", done);
      if (sceneIsLive(scene)) onComplete();
    };
    loader.once("complete", done);
    missing.forEach((asset) => loader.image(asset.key, assetUrl(asset.path)));
    if (!loader.isLoading?.()) loader.start();
  });
}

export function warmProgressiveArtBundle(
  scene: Phaser.Scene,
  bundle: ProgressiveArtBundle,
  options: { delayMs?: number; includeGallery?: boolean } = {},
): void {
  loadProgressiveArtBundle(scene, bundle, () => undefined, options);
}
