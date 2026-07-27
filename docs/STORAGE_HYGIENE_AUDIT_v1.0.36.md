# Storage Hygiene Audit v1.0.36

## Root cause

The v1.0.35 source folder contained a freshly generated `dist/` directory. The static fallback build copied the runtime asset tree from `public/` into `dist/`, creating more than 116 MB of exact path-and-hash duplicates. This generated copy explains the increase from approximately 155 MB to approximately 264 MB in the compressed full package.

## Cleanup boundary

Removed from the full source package:

- `dist/` generated deployment output
- `node_modules/` local dependency directory
- generated `logs/` content except `logs/README.md`
- temporary ZIP and operating-system metadata files

Preserved:

- all runtime assets in `public/`
- all authored and generated production knowledge data in `production/`
- all source code, scripts, documentation, workflows, and release history

No character art, atlas, model, texture, audio catalog, approval registry, or production corpus was deleted.

## Rebuild

Run `npm run build:static` to recreate `dist/`. Run `npm run stage:package:v136` to create a clean source-package staging directory.
