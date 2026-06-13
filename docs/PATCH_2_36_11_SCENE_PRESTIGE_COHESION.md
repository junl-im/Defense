# KingdomSeed v2.36.11 Scene Prestige Cohesion

## Goal

Continue the premium visual lift started in v2.36.9 and v2.36.10 without hurting first-tap speed.
This patch focuses on the screens surrounding combat: first login, lobby, and world map.

The intent is to reduce the remaining toy-like / elementary-game feeling caused by mismatched scene chrome, bright white panels, emoji-forward utility icons, and light-weight map information panels.

## What changed

### Shared lightweight prestige scene frame

Added `src/game/PrestigeSceneFrame.ts`.

It provides shared low-cost Phaser Graphics helpers for:

- static top/bottom vignette and corner frame lines
- login command plate overlay
- lobby command deck plate
- world-map operation intel plate
- optional tiny signal sweep when reduced motion is not preferred

No new large image assets are introduced.
No new art is included in the boot path.
The frame can be disabled with:

- `?plainui`
- `?legacyui`
- `?toydebug`
- `?plainbattle`
- `?flatbattle`

### Login screen polish

- Preserved the existing first-contact identity and layout.
- Added a dark, subtle command plate over the existing login panel to make it less toy-like.
- Changed primary copy to a more tactical tone.
- Replaced emoji-heavy login/utility marks with command-style marks in prestige mode:
  - quick start: `START`
  - email: `@`
  - register: `+`
  - notices/help/settings: `!`, `?`, `SYS`
- Restyled the status pill in prestige mode so it reads like a premium HUD element instead of a white web pill.

### Lobby cohesion

- Added a matching scene vignette and `COMMAND DECK` plate.
- Polished bottom navigation labels:
  - `월드맵 MAP`
  - `전투 배치 BATTLE`
  - `원정 OPS`
- Converted resource readouts away from star emoji-first presentation in prestige mode:
  - `STARS`, `COIN`, `GEM`
- Updated lobby strategy card wording toward tactical/commercial UI language.

### World map cohesion

- Added a matching scene vignette and `OPERATION INTEL` plate.
- Restyled the stage preview panel so the map screen matches the new combat HUD tone.
- Stage detail copy now uses premium operation language in prestige mode:
  - `OP-01`
  - `RATING`
  - `WAVES / LIVES`
  - `READY / LOCKED`
- Kept underlying stage unlocks, hotspots, and scene transitions unchanged.

## Performance policy

- Static Graphics/Text only.
- No new large textures.
- No Firebase/PWA/audio boot-path changes.
- No battle-time art streaming changes.
- Motion is limited and respects reduced-motion mode.
- Existing low-power and fallback behavior remains intact.

## Files changed

- `src/game/PrestigeSceneFrame.ts`
- `src/scenes/MenuScene.ts`
- `src/scenes/MainMenuScene.ts`
- `src/scenes/WorldMapScene.ts`
- `src/runtime/Version.ts`
- `package.json`
- `package-lock.json`
- `index.html`
- `docs/PATCH_2_36_11_SCENE_PRESTIGE_COHESION.md`
- `APPLY_PATCH_v2.36.11.txt`

## Validation

Validated from the integrated v2.36.10 source plus this patch:

- `npm ci` passed
- `npm run build` passed
- Vite preview `/` returned HTTP 200

Known unchanged warning:

- Vite still reports large Phaser/Firebase chunks. This is inherited and does not block the build.
