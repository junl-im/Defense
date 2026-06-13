# v2.36.23 Reference Encounter Director

Build label: `REFERENCE ENCOUNTER DIRECTOR`

## Goal

v2.36.19~v2.36.22 established the user-provided no-text reference pack, thumbnail tier, variant frames and progression fusion.  v2.36.23 pushes that pipeline into real battle readability: wave intel and boss cut-ins now use the same no-text reference art whenever it has been safely loaded.

## What changed

- Added `src/game/ReferenceEncounterDirector.ts`.
- Wave preview enemy portraits can now use v2.36.20 reference enemy thumbnails.
- Boss cut-ins can now use reference enemy portraits when available.
- Battle reference evolution loading now includes the lightweight enemy thumbnail tier, still idle-only.
- Reference asset ready events refresh the wave preview, so newly loaded no-text art appears without scene restart.
- Existing enemy spritesheet and threat crest fallbacks remain intact.

## Runtime safety

- No new large source art.
- No new atlas.
- No new sound.
- No BootScene preload.
- The new director does not start loaders; it only consumes already-loaded reference thumbnails.
- Enemy thumbnails in battle are loaded only through the existing idle-safe evolution loader.
- Save-Data, slow network, runtime lockdown and emergency modes still skip or downshift the reference pipeline.
- If a reference portrait is unavailable, the previous sprite/crest path is used.

## New QA flags

- `?norefencounter` disables encounter portrait routing.
- `?noencounterart` disables encounter portrait routing.
- `?legacyencounterart` compares against the previous wave intel/boss cut-in path.
- `?essentialencounter` forces low-cost static encounter presentation.
- `?safeencounter` forces safe encounter presentation.
- `?fallbackencounter` forces fallback encounter presentation.

Recommended comparison:

1. Default URL.
2. `?referenceart&refevolution`.
3. `?referenceart&refevolution&essentialencounter`.
4. `?norefencounter`.

## Files changed

- `src/game/ReferenceEncounterDirector.ts`
- `src/game/PremiumCombatUi.ts`
- `src/scenes/GameScene.ts`
- `src/runtime/Version.ts`
- `package.json`
- `package-lock.json`
- `index.html`
- `docs/PATCH_2_36_23_REFERENCE_ENCOUNTER_DIRECTOR.md`
- `APPLY_PATCH_v2.36.23.txt`
