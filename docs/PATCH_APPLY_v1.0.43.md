# Patch Apply v1.0.43

1. Extract the patch ZIP.
2. Copy every extracted file and folder directly into the v1.0.42 project root.
3. Replace files when prompted.
4. Delete the old `dist/` directory.
5. Run:

```bash
npm ci
npm run verify:release:v143
npm run build
npm run verify:dist:all
```

The patch archive has no intermediate `APPLY_TO_PROJECT_ROOT` folder.
