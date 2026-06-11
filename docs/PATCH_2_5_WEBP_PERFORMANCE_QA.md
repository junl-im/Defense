# v2.5.0 WebP + Performance QA Patch

## Goals
- Use WebP raster assets for current high-quality art while keeping PNG files as fallback.
- Reduce first-entry wait by skipping obsolete splash/background preload and deferring BGM.
- Reduce combat-frame overhead on mobile.
- Keep `?hit=1` hit-zone QA and add `?png=1`, `?fullpreload=1`, `?preloadMusic=1` debug switches.

## Asset loading
- Current v2 art now prefers `.webp` when the browser reports WebP support.
- Legacy v1/v43/v48/v49 title and menu art is skipped during normal boot.
- PNG fallback remains available by opening the game with `?png=1`.
- Full legacy preload can be restored with `?fullpreload=1`.

## First start speed
- Mobile shell now emits `kingdom-seed:user-activated` immediately and performs fullscreen/orientation work in the background.
- BGM is no longer loaded during first boot unless `?preloadMusic=1` is used.
- Missing audio is loaded on demand by `AudioManager`.

## Combat performance
- HUD and spell text refreshes are throttled instead of being rewritten every frame.
- Enemy cleanup no longer creates a copy of the full enemy array every frame.
- Low-power mode reduces battlefield overlay alpha and disables idle waypoint tweens.

## QA notes
- `npx tsc --noEmit` passed.
- `npm run build` may still fail in the container if Rolldown optional native bindings are missing. Run `npm install` locally before build.
