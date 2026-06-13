# v2.36.17 Auto Rescue Fallback Mesh

## Goal

v2.36.16 added manual fallback controls, but real mobile users may hit tiny text, cramped viewport, offline state, memory pressure, or frame drops before they know where the fallback panel is. v2.36.17 adds an automatic rescue mesh that detects those states and applies a safe profile without changing the core boot identity or loading new heavy art.

## What changed

- Added `AdaptiveRescueOrchestrator.ts`.
- Installed the rescue orchestrator through `installSceneReadabilityPass`, so all already-wired scenes get rescue coverage.
- Watches runtime frame health, memory pressure, optional work blocking, offline state, and viewport changes.
- Automatically promotes the runtime to safe fallback when needed:
  - safe graphics
  - large readable UI
  - reduced motion
  - low runtime quality tier
  - optional-work pause
- Escalates to emergency fallback for sustained frame risk or runtime lockdown:
  - huge readable UI
  - high contrast
  - safe graphics
  - reduced motion
  - memory-pressure notification
- Adds a small `AUTO / WATCH` rescue chip when the feature is active or debug is requested.
- Adds shell classes so the first gate also reflects saved auto-rescue settings.
- Safe retry URL now includes fallback suite, autorescue, safe graphics, large UI, contrast UI, and reduced motion flags.

## New query flags

- `?autorescue` forces the automatic rescue mesh on.
- `?rescueui` forces rescue mesh and rescue UI visibility.
- `?rescuepanel` shows the rescue chip/panel for QA.
- `?autorescuedebug` keeps diagnostic chip visible.
- `?noautorescue` disables only the new automatic rescue layer.
- `?legacyrescue` compares against the previous behavior.
- `?norescuechip` keeps automatic rescue active but hides the chip.

## Storage keys

- `ksAdaptiveAutoRescue=1`: auto rescue was activated.
- `ksAdaptiveAutoRescueReason`: last trigger reason.
- `ksAdaptiveAutoRescueAt`: last trigger timestamp.

The feature also cooperates with existing fallback keys:

- `ksSafeGfx`
- `ksReadableUi`
- `ksContrastUi`
- `ksReduceMotion`
- `ksEmergencyFallback`

## Performance policy

- No new heavy images.
- No new atlas.
- No new audio.
- No mandatory boot asset growth.
- Static UI/DOM/Phaser Graphics only.
- Optional work is paused when auto rescue activates.
- Default gameplay remains unchanged on stable devices.

## QA checklist

1. Launch normally and confirm no build/runtime error.
2. Launch with `?autorescue` and confirm root classes/chip activate.
3. Launch with `?rescuepanel` and tap the rescue chip to expand diagnostics.
4. Launch with `?noautorescue` and confirm the new auto rescue layer is disabled.
5. Use browser offline mode and confirm safe fallback state is applied.
6. Use a narrow mobile viewport and confirm readable/safe fallback activates.
7. Confirm `npm ci` and `npm run build` pass.
