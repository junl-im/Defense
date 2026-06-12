# KingdomSeed v2.35.0 Runtime Loop Mobile QA

## Goal
Stabilize weak-network mobile play after the v2.30~v2.34 engine pass without adding heavy art.

## Fixes
- Removed recursive native `resize` dispatch from `WebShell` viewport settling.
  - Previous shells could emit `resize` from inside a resize handler, which can create repeated resize storms in some mobile browsers.
  - v2.35 emits only `kingdom-seed:viewport-changed` for Phaser scale refresh.
- Tightened mobile/lockdown combat delta clamping.
  - Safe mobile engines now use a stronger simulation delta cap to prevent enemy/projectile jumps after frame stalls.
- Added combat spike emergency throttle.
  - Repeated in-battle frame spikes pause optional work, purge optional art textures, and apply runtime low-quality budgets.
- Reduced low-power wave banner and spawn impact FX cost.
  - Low-power mode uses a simpler wave banner.
  - Spawn impact rings are sampled instead of created for every enemy.
- Boot animation registration now skips all enemy animation work when the enemy texture was not loaded in fast boot.
- Render config is safer for low tier.
  - Low tier uses fewer active pointers, smaller WebGL batch size, fewer texture units, and no mipmap regeneration.
- Updated PWA cache version to v2.35.

## Notes
No new art assets were added. This patch focuses on runtime stability and mobile responsiveness.
