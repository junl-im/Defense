# Patch Notes v1.0.43

- Added mobile pointer, pinch, and joystick recovery on backgrounding, page restore, screen rotation, and material `visualViewport` changes.
- Prevented stale captured pointers from blocking later floor taps.
- Added a finger-occlusion-safe `소환` beacon and stronger contrast behavior to the random summon button.
- Added boot, title, and combat-dock DOM snapshot hashes to prevent legacy loading presentation regressions.
- Added a runtime asset reachability report covering source assets, public assets, JSON catalogs, and conservative review candidates.
- Added a Chrome/Chromium browser fixture for pointer recovery and 100-cycle WebGL resource create-delete checks when a browser is available.
- Preserved the v1.0.41 legacy loading retirement and v1.0.42 summon asset approval boundary.
