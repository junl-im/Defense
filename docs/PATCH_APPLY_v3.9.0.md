# v3.9.0 Patch Apply

Apply over v3.8.0, then run:

```bash
npm run verify
npm run build
```

The patch intentionally includes all 19 combat GLBs, PNG-only PWA icons and manifest, and the v3.9 PNG UI set. This prevents overlay installs from retaining missing runtime assets.

New GLBs are art-review technical candidates, not production-approved final art.
