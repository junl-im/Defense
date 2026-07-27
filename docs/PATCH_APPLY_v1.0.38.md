# Patch Apply v1.0.38

The distributed patch ZIP is a direct overlay.

1. Extract the ZIP.
2. Copy every extracted file and folder into the existing project root.
3. Choose overwrite for matching files.
4. Delete the old `dist/` directory before rebuilding.
5. Run:

```bash
npm ci
npm run verify:release:v138
npm run build
npm run verify:dist:v123
npm run verify:dist:v124
npm run verify:dist:v135
npm run verify:dist:v136
npm run verify:dist:v137
npm run verify:dist:v138
```
