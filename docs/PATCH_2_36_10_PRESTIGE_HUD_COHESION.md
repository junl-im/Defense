# KingdomSeed v2.36.10 Prestige HUD Cohesion

## Goal

v2.36.9 raised the quality of fallback battle actors. v2.36.10 focuses on the next visible source of the "toy / elementary game" impression: the combat HUD and bottom command dock.

The patch keeps the fast boot and mobile safety rules intact. It does not add new heavy images to the boot path and does not stream art during a running wave.

## Changes

- Added `BattleHudPrestige.ts` as a lightweight code-rendered HUD skin.
- Added static premium top/bottom HUD chrome using cheap Phaser Graphics primitives.
- Reworked top resource readouts from emoji/token style into compact premium readout cards.
- Reworked the stage banner into an active theater plate.
- Reworked command buttons and spell cards with subtle framed surfaces.
- Removed emoji-first spell labels in prestige HUD mode.
- Improved wave-intel enemy cards so no-art mode uses threat crests instead of plain circles.
- Preserved debug escape hatches:
  - `?plainhud`
  - `?legacyhud`
  - `?toydebug`
  - `?plainbattle`
  - `?flatbattle`

## Performance Notes

- New HUD polish uses static Graphics/Text only.
- No new images or audio are loaded.
- No infinite tweens are added by this patch.
- The patch is safe for low-end mobile because it changes a small number of HUD primitives only.

## Validation

- `npm ci`
- `npm run build`
- Vite preview HTTP smoke check
