// Pure metadata for the selectively imported CC0 glTF assets.
export const VILLAGE_ART_CATALOG = Object.freeze({
  farm: 'assets/quaternius/farm-second-age-3.gltf',
  market: 'assets/quaternius/market-first-age-3.gltf',
  barracks: 'assets/quaternius/barracks-first-age-3.gltf',
});
export function artBuildingKey(cellKey, rec) {
  return cellKey + '/' + rec.slot + '/' + rec.id;
}
