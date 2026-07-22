# v3.7.4 Manifest SVG Migration Hotfix

## Fixed

- Replaces stale `icon.svg` PWA manifest entries with PNG icons.
- `preverify` and `prebuild` now normalize existing manifests instead of only deleting SVG files.
- The patch explicitly includes `public/manifest.webmanifest`, so overlay installs replace old repository content.
- Manifest migration has a regression test that starts from an SVG-contaminated fixture.
- Absolute SVG prohibition remains active for files, paths, inline markup, MIME values, and data URIs.

## Canonical PWA icons

- `icon-192.png` — 192x192, purpose `any`
- `icon-512.png` — 512x512, purpose `any`
- `icon-maskable-512.png` — 512x512, purpose `maskable`

## CI order

```bash
npm run clean:obsolete
npm run verify
npm run build
```

The cleanup step is idempotent. A repository containing an old SVG manifest entry is migrated before verification.
