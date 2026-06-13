# KingdomSeed v2.36.9 Prestige Visual Lift

## Goal

The game was still reading too much like a toy/prototype when premium actor art was skipped for mobile safety. This patch raises the default battle presentation without adding large boot-time art or changing the first shell identity.

## Changes

- Added `BattlePrestigePolish.ts`.
- Added a cheap static cinematic grade pass for battle scenes.
  - Large shade and highlight primitives only.
  - No new texture downloads.
  - No infinite particle loops.
  - Disabled by `?flatbattle`, `?plainbattle`, or `?toydebug`.
- Remastered procedural fallback actors.
  - Towers no longer rely on simple circles, triangles, and center symbols when image art is unavailable.
  - Enemies get darker 2.5D silhouettes with rim highlights and threat gems instead of cute face-dot blobs.
  - Hero fallback gets a stronger knight silhouette instead of a simple circle + triangle.
- Preserved isolated icon QA behavior.
  - `?iconmock` and `?stickerart` still show the isolated generated art modes honestly.
  - Default battle does not use isolated white-background assets.
- Preserved performance policy.
  - No new required preload assets.
  - No Firebase/audio/PWA behavior changed.
  - No combat-time large art streaming added.
  - The patch is mostly static Phaser Graphics primitives.

## Files

- `src/game/BattlePrestigePolish.ts`
- `src/game/Tower.ts`
- `src/game/Enemy.ts`
- `src/game/Hero.ts`
- `src/scenes/GameScene.ts`
- `src/runtime/Version.ts`
- `package.json`
- `package-lock.json`
- `index.html`

## QA

- `npm run build` passes.
- Large Phaser/Firebase chunk warnings remain existing warnings, not build failures.

## Notes

This patch focuses on the biggest visible weakness in the current mobile-safe default: when actor art is intentionally deferred or skipped, the procedural fallback should still look like a commercial 2.5D defense game rather than a classroom prototype.
