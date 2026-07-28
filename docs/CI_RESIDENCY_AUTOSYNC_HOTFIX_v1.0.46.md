# CI Residency Autosync Hotfix v1.0.46

## Problem

`verify:residency:v145` compared committed generated outputs before the CI job had synchronized them. Branch overlays or path-portability changes could therefore leave the JSON/Markdown stale and stop the build before Vite ran.

## Fix

- `verify:ci` deterministically regenerates v1.0.45 residency outputs before the strict cumulative verification chain.
- GitHub Actions now calls `npm run verify:ci`.
- The portable generator and both generated outputs are shipped together.
- Local `npm run verify` remains strict and continues to detect stale outputs unless the developer explicitly generates them.

## Commands

```bash
npm run verify:ci
npm run build
npm run verify:dist:all
```
