# v2.36.25 DEFENSE UI HIERARCHY RESET

## Intent

The recent prestige/readability/reference-art patches improved fidelity, but they also pushed too many frames, badges, labels, advisor chips, and decorative layers onto the screen at once. The game started to feel visually noisy instead of deliberate.

This patch switches direction from “add more” to “prioritize and compress”. It follows proven mobile tower-defense UI patterns:

- Keep the battlefield as the primary visual surface.
- Keep always-on HUD to a small set of critical numbers and controls.
- Move secondary tactical details behind an expandable intel chip.
- Preserve accessibility and emergency fallback modes.
- Do not copy another game’s IP, art, layout, or exact assets.

## Competitive UI reference takeaways

- Kingdom Rush emphasizes a clear battlefield, towers/heroes, and a compact control layer rather than persistent panels everywhere.
- Bloons TD 6 works well on touch screens because the main loop is placement, upgrade, and wave management with clean actionable surfaces.
- Arknights-style tactical UI uses strong information hierarchy: battlefield first, deployment/status information second.

These are pattern references only. KingdomSeed keeps its own 2.5D fantasy identity and no-text reference art pipeline.

## Added

### `DefenseUiFocusSystem.ts`

A new global UI hierarchy director that:

- Adds a defense-game style focus profile.
- Applies clean / focus / essential / legacy modes.
- Lowers decorative system alpha when the screen is too busy.
- Adds lightweight scene focus mats without new images.
- Creates a compact battle intel toggle for secondary HUD details.
- Stores user mode in `localStorage` as `ksDefenseUiFocus`.

### Battle HUD declutter

Secondary battle HUD items are now registered into a compact group:

- run modifier chips
- synergy chip
- enemy affix line
- combat advisor line
- tactical order chip
- battle contract chip

By default, the battlefield keeps only the critical top/bottom control layer visible. Secondary tactical data is collapsed behind a small `정보` chip. Tapping it expands the detail layer briefly and then auto-collapses.

### Adaptive fallback panel update

The existing `보기` panel now includes a `정리` button. This cycles UI density:

1. clean
2. focus
3. essential
4. legacy

This gives a fast in-game way to compare the decluttered defense UI against the previous fuller HUD.

### WebShell/class support

The shell now applies defense UI focus classes before Phaser starts, so the first tap screen and boot shell follow the same design direction.

## Query flags

New QA flags:

- `?cleanui`
- `?defenseui`
- `?uireset`
- `?declutterui`
- `?focusui`
- `?battlefocus`
- `?onehandui`
- `?essentialui`
- `?simpleui`
- `?minimalui`
- `?lowclutter`
- `?nouifocus`
- `?nodeclutter`
- `?legacyclutter`
- `?maximalui`
- `?fullhud`
- `?oldhud`

Recommended comparisons:

- default URL
- `?cleanui`
- `?essentialui`
- `?legacyclutter`
- `?fullhud`

## Files changed

- `src/game/DefenseUiFocusSystem.ts`
- `src/game/MobileReadableUi.ts`
- `src/game/AdaptiveFallbackDirector.ts`
- `src/scenes/GameScene.ts`
- `src/platform/WebShell.ts`
- `src/style.css`
- `src/runtime/Version.ts`
- `package.json`
- `package-lock.json`
- `index.html`
- `docs/PATCH_2_36_25_DEFENSE_UI_HIERARCHY_RESET.md`
- `APPLY_PATCH_v2.36.25.txt`

## Safety

- No new large art assets.
- No new atlases.
- No new audio.
- No BootScene preload increase.
- Existing reference-art pipeline remains idle-safe.
- Existing low-end/emergency modes remain compatible.
- Legacy/full HUD can be restored with QA flags.

## Verification

- `npm ci`: passed
- `npm run build`: passed
- Vite build warnings about large Phaser/Firebase chunks remain warnings only.
