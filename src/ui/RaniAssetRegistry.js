// Rani Kingdom v2.2 — canonical asset registry.
// Every image path is a standalone image originally generated on its own.
// No SVG, no sprite-sheet extraction, no replacement of original GLTF/3D.
export const RANI_ASSET_ROOT='assets/rani/';
export const RANI_RESOURCE_ICONS=Object.freeze({
  gold: RANI_ASSET_ROOT+'ui/icons/rk_icon_resource_gold_v001.webp',
  wood: RANI_ASSET_ROOT+'ui/icons/rk_icon_resource_wood_v001.webp',
  stone:RANI_ASSET_ROOT+'ui/icons/rk_icon_resource_stone_v001.webp',
  food: RANI_ASSET_ROOT+'ui/icons/rk_icon_resource_food_v001.webp',
  population:RANI_ASSET_ROOT+'ui/icons/rk_icon_resource_population_v001.webp',
});
export const RANI_PREPARED_ASSETS=Object.freeze({
  primaryButton:RANI_ASSET_ROOT+'ui/buttons/rk_btn_royal_primary_v001.webp',
  hudPanel:RANI_ASSET_ROOT+'ui/panels/rk_panel_royal_hud_v001.webp',
  houseA:RANI_ASSET_ROOT+'buildings/housing/rk_building_house_a_v001.webp',
  market:RANI_ASSET_ROOT+'buildings/economy/rk_building_market_v001.webp',
  tradeShip:RANI_ASSET_ROOT+'harbor/ships/rk_ship_trade_v001.webp',
});
// Approved high-resolution illustrated UI thumbnails: these are ONLY
// in game UI; original interactive Three.js buildings/harbors stay intact.
export const RANI_GAMEPLAY_ICONS=Object.freeze({
  village: RANI_PREPARED_ASSETS.houseA,
  market: RANI_PREPARED_ASSETS.market,
  port: RANI_PREPARED_ASSETS.tradeShip,
});
export const RANI_PRESERVED_ASSETS=Object.freeze([
  'assets/branding/rani-kingdom-logo.webp',
  'assets/terrain/rani-terrain-atlas.webp',
  'assets/quaternius/barracks-first-age-3.gltf',
  'assets/quaternius/farm-second-age-3.gltf',
  'assets/quaternius/market-first-age-3.gltf',
  'assets/quaternius/town-center-first-age-3.gltf',
]);
export const RANI_ALL_ASSET_PATHS=Object.freeze([
  ...Object.values(RANI_RESOURCE_ICONS),
  ...Object.values(RANI_PREPARED_ASSETS),
  ...RANI_PRESERVED_ASSETS
]);
