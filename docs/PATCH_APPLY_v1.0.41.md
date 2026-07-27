# v1.0.41 Paste-Overwrite Patch

1. Extract the patch ZIP.
2. Copy every extracted file and folder into the existing project root.
3. Replace files when prompted.
4. Delete the old `dist/` folder before rebuilding.
5. Run `npm ci`, `npm run verify:release:v141`, `npm run build`, and `npm run verify:dist:all`.

The ZIP has no wrapper directory and is intended for direct root overwrite.
