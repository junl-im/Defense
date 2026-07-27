# Mobile Input Recovery v1.0.43

## Runtime correction

`MobileInputRecoveryV143` observes visibility, page lifecycle, orientation, window resize, and `visualViewport` resize/scroll events. Significant viewport scale, offset, width, or height changes release every active map pointer, clear pinch state, reset the joystick, and cancel stale movement input.

Small mobile-browser address-bar movements below the configured threshold do not continuously reset input. Keyboard openings, pinch zoom, rotation, page restore, and background resume do reset the active gesture state.

## Summon visibility

The random summon action keeps its v1.0.42 authored emblem and adds a top `소환` beacon, higher contrast mode, forced-colors support, left-handed ticket mirroring, mobile minimum size, and landscape-safe label placement.

## Browser gate

`scripts/run-browser-mobile-recovery-v143.mjs` launches Chrome or Chromium when available. The browser fixture exercises pointer reset, viewport and orientation recovery, legacy loading exclusion, and 100 WebGL buffer/texture create-delete cycles. Environments where the installed browser cannot start report a live-browser skip while the deterministic recovery contract remains mandatory.
