# KingdomSeed v2.36.26 - Defense Action Flow Cleanup

## Purpose

v2.36.25 reset the broad UI hierarchy by hiding secondary battle intel behind a compact toggle. v2.36.26 continues that cleanup by adding a single, low-noise decision cue that tells the player what to do next without filling the screen with extra panels.

The goal is to move KingdomSeed closer to a commercial mobile defense game pattern:

- the battlefield stays visible;
- the primary action is obvious;
- secondary systems stay folded until requested;
- warnings appear only when they matter;
- weak devices still use low-cost static UI.

## Added

- `src/game/DefenseActionFlowSystem.ts`
  - Computes the current battle decision state.
  - Shows one compact top-center action chip during idle/prep moments.
  - Auto-hides during active combat unless there is a danger/spell-ready state or QA flag.
  - Lets the player tap the chip to start the next wave when appropriate.
  - Routes low-priority guidance into the action chip instead of repeatedly blocking the center message area.

## Battle flow states

The new action flow can show:

- `STEP 1 / first tower placement`
- `STEP 2 / first wave start`
- `NEXT / between-wave upgrade or start`
- `BOSS PREP / boss preparation`
- `WAVE / active defense`
- `DANGER / low-life warning`
- `CLEAR / result transition`

## Cleanliness rules

- The action flow is one compact chip, not a new permanent panel.
- It does not load images, atlases, audio, fonts, or remote data.
- It uses Phaser Graphics/Text only.
- It follows the existing defense UI focus profile.
- It stays off in legacy/maximal/toy debug modes.
- It avoids combat obstruction by hiding during normal active waves.

## New QA flags

- `?actionflow`
- `?decisionflow`
- `?gameflow`
- `?playflow`
- `?actionflowdebug`
- `?noactionflow`
- `?nodecisionflow`
- `?legacyactionflow`

Recommended checks:

1. Default URL
2. `?actionflow`
3. `?actionflowdebug`
4. `?noactionflow`
5. `?legacyclutter`

## Modified files

- `src/game/DefenseActionFlowSystem.ts`
- `src/scenes/GameScene.ts`
- `src/runtime/Version.ts`
- `package.json`
- `package-lock.json`
- `index.html`
- `docs/PATCH_2_36_26_DEFENSE_ACTION_FLOW_CLEANUP.md`
- `APPLY_PATCH_v2.36.26.txt`

## Validation

- `npm run build` passed.
- Vite preview `/` returned HTTP 200.
- Vite preview `/?actionflow` returned HTTP 200.

The existing Phaser/Firebase chunk-size warnings remain build warnings only.
