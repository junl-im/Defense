# v2.3 Design and Performance Notes

## PC / Mobile Shell
- Desktop: no fullscreen request, no orientation lock, no CSS rotation.
- Mobile: fullscreen and landscape lock are still attempted after user activation.
- If mobile browser blocks orientation lock, CSS rotate fallback remains mobile-only.

## Wave Flow
- Waves automatically start after 10 seconds when the field is idle.
- The old `조기 웨이브` label was removed.
- The button now says `진행`, with a countdown such as `진행 8`.
- Manual start during the idle countdown grants `진행 보너스` except before the first wave.

## Build Spot UX
- Empty tower spots now show `건설지` and a hammer mark.
- Selecting a spot opens a tactical build card menu.
- Each tower card shows role + cost:
  - Archer: air / fast enemies
  - Mage: armored enemies
  - Barracks: blocking / front line
  - Artillery: splash damage

## 2.5D Art Pass
- Battle backgrounds were regenerated with painted terrain layers and vignette.
- Enemy sheets were regenerated with shadow, upper highlight, directional walk/attack/death frames.
- Tower level sprites were regenerated with bevels, shadows, and level silhouettes.
- Additional battlefield objects are rendered at runtime with deterministic stage seeding.

## Performance Notes
- The v2.2 quality budget remains active.
- New decorative objects are scene-level static shapes, not per-frame simulations.
- Enemy sprite dimensions remain 32x32 to preserve asset size and mobile performance.
