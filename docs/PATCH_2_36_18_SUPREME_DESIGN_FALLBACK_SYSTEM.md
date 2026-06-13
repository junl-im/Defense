# v2.36.18 Supreme Design Fallback System

## Goal

v2.36.18 is a large-scale design cohesion and fallback pass. v2.36.13 through v2.36.17 improved readability, graphics fallback, manual fallback controls, and automatic rescue. This patch adds a top-level design system so every major scene shares the same premium visual language while still falling back to safe, accessible, and essential modes on weak mobile devices.

## What changed

- Added `src/game/SupremeDesignSystem.ts`.
- Installs a scene-wide design layer from the existing readability pipeline, so all scenes that already receive the mobile readability pass also receive the premium design frame.
- Adds design grades:
  - `supreme`: richest static premium frame for normal devices.
  - `accessible`: stronger contrast and larger design anchors for cramped/tiny screens.
  - `essential`: low-cost static frame for emergency/low-power/safe graphics mode.
  - `balanced`: default stored reset profile.
- Adds scene-specific premium framing:
  - Battle: clearer battlefield safe lanes and command framing.
  - Login: stronger first-impression prestige plate without replacing the first contact identity.
  - Lobby: command hub frame and side-deck consistency.
  - World map: operation map frame and intel panel hierarchy.
  - Sub-screens: shared header/body/footer framing.
- Adds a `디자인` button to the fallback panel. Users can cycle design grade without hunting for query flags.
- Adds WebShell/root CSS integration so the start gate already reflects the same premium design language before Phaser fully loads.
- Keeps all heavy art out of the boot path.

## New QA / fallback flags

- `?supremedesign` / `?prestigedesign` / `?premiumdesign`: force rich design grade.
- `?accessibledesign` / `?readabledesign` / `?contrastdesign`: force accessible high-readability design grade.
- `?essentialdesign` / `?safedesign`: force lowest-cost design grade.
- `?balanceddesign`: force balanced design profile.
- `?designpanel` / `?supremedebug`: show design grade badge.
- `?nodesignsystem` / `?nosupremedesign` / `?legacydesign`: disable the new design system for comparison.

## Performance and safety

- No new large images.
- No new atlas.
- No new audio.
- No Firebase/PWA/audio boot path changes.
- No heavy art streaming during battle.
- Motion is automatically disabled in low-power, rescue, reduce-motion, and essential design modes.
- Canvas filters remain disabled in safe/low/lockdown profiles.

## Validation

- `npm ci` passes.
- `npm run build` passes.
- Vite preview `/` returns HTTP 200.
- Patch zip excludes `.git`, `node_modules`, `dist`, and temporary files.
