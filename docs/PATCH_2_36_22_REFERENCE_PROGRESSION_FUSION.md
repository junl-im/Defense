# v2.36.22 Reference Progression Fusion

## Goal

v2.36.19~v2.36.21 brought the user-provided high-quality no-text reference crops into the runtime and wrapped them with no-text variant frames.  v2.36.22 links that art tier to gameplay progression so tower upgrades, research, enemy threat and hero selection read as part of one evolving art pipeline.

## Changes

- Added `src/game/ReferenceProgressionFusion.ts`.
- Added no-text progression ornaments on top of reference art slots:
  - corner rails
  - tier chevrons
  - bottom pips
  - locked cross mark
  - essential low-cost mode for weak devices
- `ReferenceVariantSystem` now automatically fuses progression ornaments into reference slots.
- Tower actors using reference textures now receive a progression halo based on level and mastery.
- Enemy actors using reference textures now receive threat-aware progression halos.
- Hero actors using reference textures now receive a selected-hero progression halo.
- Codex tower cards now reflect permanent research levels in reference slot pips.
- Battle build cards now reflect permanent research levels in reference slot pips.
- Hero Hall reference portraits now distinguish selected and baseline heroes with stronger no-text progression pips.

## Safety Rules

- No new heavy actor art.
- No new atlas.
- No new audio.
- No BootScene preload.
- No text baked into images.
- All progression status is drawn with Phaser primitives around already-loaded no-text art.
- On low-end, Save-Data, slow network, safe graphics or emergency fallback, the system drops to essential static ornaments.
- If reference art does not load, existing 2.5D/code fallback remains intact.

## QA Flags

- `?refprogression` / `?progressionart` for visual review intent.
- `?essentialprogression` / `?safeprogression` / `?fallbackprogression` for low-cost progression ornaments.
- `?norefprogression` / `?noprogressionart` / `?legacyrefprogression` to compare previous v2.36.21 behavior.

Recommended checks:

1. `/`
2. `/?referenceart&refevolution`
3. `/?referenceart&refevolution&essentialprogression`
4. `/?referenceart&refevolution&norefprogression`

## Validation

- `npm ci`
- `npm run build`
- static preview smoke check
