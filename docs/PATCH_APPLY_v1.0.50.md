# Apply v1.0.50 Direct Overlay Patch

1. Back up the existing project.
2. Extract the overwrite patch ZIP.
3. Copy the extracted contents directly into the project root and allow matching files to be replaced.
4. Do not copy an additional wrapper directory around the project.
5. Run `npm run clean:obsolete`, `npm run bootstrap:identity:v150`, `npm run sync:generated:ci`, and `npm run verify:release:v150`.
6. Delete an old `dist/`, rebuild with `VITE_BASE_PATH=/Defense/ npm run build`, then run `npm run verify:dist:all`.

The patch manifest records each changed path, byte size, source hash, base hash when known, the received base ZIP hash, and the exact full target ZIP hash. Deleted obsolete root outputs and superseded source-sheet PNGs are listed explicitly. `npm run clean:obsolete` removes them after the overlay is copied.
