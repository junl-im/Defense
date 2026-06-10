# v1.3.0 Login Cinematic Splash Patch

## Goal

The previous code-drawn login UI felt too simple compared with the supplied premium reference art. v1.3.0 changes the first start screen to a cinematic splash composition that preserves the high quality logo, Korean title treatment, ornate login panel, and polished button art from the reference style.

## Changes

- `package.json` version updated to `1.3.0`.
- Added `public/assets/backgrounds/login_splash_v1_3.png`.
- `BootScene` now preloads `v1-login-splash`.
- `MenuScene` now uses the premium splash art as the first screen visual.
- All login controls remain functional through transparent Phaser hit-zones layered over the baked art.
- The old simple code-drawn logo, panel, and button stack is removed from the first start screen.
- A small dynamic status text overlay is kept so Firebase login state and errors are still visible.

## Design Rule Update

For the first start screen only, the screen is image-led to match the requested premium quality. Game logic and clickable areas remain code-driven.

Main menu, world map, combat HUD, and later screens can still use the separated `background art + code UI` system, but the login title screen now prioritizes exact art quality.
