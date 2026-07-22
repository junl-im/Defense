# v4.1.0 Patch Apply

Apply over a clean v4.0.0 repository.

```bash
npm run verify
npm run build
```

The patch contains the complete 19-GLB combat asset contract, PNG-only PWA manifest, and raster UI safety files in addition to changed source files. `dist/` is intentionally excluded from the patch and must be rebuilt.

## Expected verification markers

- `PASS required combat GLB contract · 19/19 files, headers, sizes and hashes`
- `PASS premium auto-wave intermission panel`
- `PASS premium combat and intermission visual system`
- `PASS 절대 SVG 금지`
