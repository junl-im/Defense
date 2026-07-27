> Current improvement patch: **v1.0.36 / b24.36** - storage hygiene and clean source packaging

# Dokkaebi Luck Defense 3D

## v1.0.36 key changes

- Confirmed that the size increase was caused by generated `dist` output copying more than 116 MB of `public` assets.
- Full source ZIPs now exclude `dist`, `node_modules`, and generated `logs` content.
- Runtime assets under `public`, authored production data under `production`, source code, documentation, and verification scripts remain intact.
- Added storage footprint auditing, clean package staging, package verification, and safe generated-output cleanup commands.
- The patch deletes the generated `dist/` directory after applying updated source files.
- The mandatory handoff history rule remains enforced.

## Commands

```bash
npm run audit:storage:v136
npm run verify:release:v136
npm run stage:package:v136
npm run verify:package:v136
npm run build:static
npm run verify:dist:v136
npm run create:patch:v136
npm run verify:patch:v136
```

`dist/` is a reproducible deployment artifact. It is intentionally omitted from the full source ZIP and can be regenerated with `npm run build:static`.

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
