# v3.7.4 Patch Apply

Apply this patch over a v3.7.3 repository, then run:

```bash
npm run verify
npm run build
```

The first command automatically migrates an old `public/manifest.webmanifest` that still references `icon.svg` or `image/svg+xml`.

The patch also directly includes the corrected PNG-only manifest, so ordinary file overlay updates replace the stale file immediately.

Canonical icons:

- `./icon-192.png`
- `./icon-512.png`
- `./icon-maskable-512.png`

No SVG file, SVG URL, inline SVG, SVG MIME value, or SVG data URI is permitted.
