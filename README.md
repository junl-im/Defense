> Current improvement patch: **v1.0.43 / b24.43** - Mobile Input Recovery & Browser Gate

# Dokkaebi Luck Defense 3D

## v1.0.43 key changes

- Releases stale map pointers, pinch state, and joystick capture after backgrounding, page restore, rotation, and significant visual viewport changes.
- Keeps small address-bar movements below the reset threshold while recovering from keyboard, zoom, and orientation geometry changes.
- Adds a finger-occlusion-safe summon beacon, stronger contrast mode, forced-colors support, and left-handed ticket mirroring.
- Adds deterministic input recovery verification and an optional Chrome/Chromium browser fixture with 100 WebGL resource create-delete cycles.
- Adds hashed boot/title/combat presentation snapshots so the retired legacy loading screen cannot silently return.
- Generates a conservative runtime asset reachability report: directly referenced assets are separated from manual review candidates without automatic deletion.
- Advances the service-worker cache to `1.0.43-b24.43`.
- The mandatory handoff history rule remains enforced.

## Commands

```bash
npm run verify:mobile-input:v143
npm run verify:browser:v143
npm run verify:reachability:v143
npm run verify:presentation:v143
npm run verify:release:v143
npm run build
npm run verify:dist:all
npm run stage:package:v143
npm run verify:package:v143
npm run create:patch:v143
npm run verify:patch:v143
```

For environments without installed Vite dependencies, `npm run build:static` remains available.

## Preserved release foundations

- v1.0.12 cross-platform visual foundation
- v1.0.17 approved asset boundary
- v1.0.20 11-direction hero runtime
- v1.0.29 derived atlas refinement
- v1.0.31 asset lineage audit
- v1.0.32 silhouette and 80-wave verification
- v1.0.33 boss identity and 90-wave stability
- v1.0.34 mobile HUD recovery
- v1.0.35 runtime lifecycle, offline shell, accessibility, and 100-wave checks
- v1.0.36 clean source packaging and generated-output exclusion
- v1.0.37-v1.0.39 Vite/static deployment portability
- v1.0.40 audit source-sheet deployment boundary
- v1.0.41 full-map touch input and legacy loading retirement
- v1.0.42 random summon control and edge-safe authored UI asset
- v1.0.43 mobile input recovery, presentation snapshots, and runtime asset reachability
