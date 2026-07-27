# v1.0.41 Touch Navigation and Loading Retirement

- Root cause of floor-touch failure: CSS enabled `.look-zone` only for `body.playing`, while app-state transitions never synchronized that class.
- `app-state-surface-v141.js` now mirrors every app state to `body.dataset.appState`, `data-map-touch-ready-v141`, and the compatibility `playing` class.
- Look input now has window-level pointer-up/cancel fallback for browsers where pointer capture is lost.
- The old purple logo loading presentation is retired. Its diagnostic nodes remain hidden for progress reporting, but no old mascot, title artwork, or run-entry overlay is rendered.
- Title stays visible while deferred assets finish, then the battle replaces it directly.
- Service-worker identity advances to `1.0.41-b24.41`, causing old shell caches to be removed on activation.
