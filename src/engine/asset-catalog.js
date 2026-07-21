const keyartUrl = new URL('../assets/moon-market-keyart.webp', import.meta.url).href;

export const ASSET_QUALITY_TIERS = Object.freeze(['low', 'medium', 'high']);

export const CORE_ASSET_CATALOG = Object.freeze([
  {
    id: 'moon-market-keyart',
    kind: 'texture',
    required: true,
    retain: false,
    color: true,
    variants: {
      low: keyartUrl,
      medium: keyartUrl,
      high: keyartUrl
    },
    sourceWidth: 1600,
    sourceHeight: 900,
    estimatedBytes: 1600 * 900 * 4 * 1.333
  }
]);

export const MODEL_ASSET_SLOTS = Object.freeze({
  player: { fallback: 'procedural-player', variants: {} },
  dokkaebi: { fallback: 'procedural-dokkaebi', variants: {} },
  enemy: { fallback: 'procedural-enemy', variants: {} },
  environment: { fallback: 'procedural-market', variants: {} }
});

export function selectAssetVariant(entry, tier = 'high') {
  const variants = entry?.variants || {};
  const order = tier === 'low'
    ? ['low', 'medium', 'high']
    : tier === 'medium'
      ? ['medium', 'low', 'high']
      : ['high', 'medium', 'low'];
  for (const key of order) {
    if (variants[key]) return { tier: key, url: variants[key] };
  }
  return { tier: 'none', url: entry?.url || '' };
}
