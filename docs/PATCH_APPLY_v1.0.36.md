# Apply v1.0.35 to v1.0.36

1. Copy everything inside `APPLY_TO_PROJECT_ROOT` into the existing project root and overwrite matching files.
2. Run `npm run cleanup:generated:v136` to remove the obsolete generated `dist/` directory.
3. Run `npm run verify:release:v136`.
4. Generate a deployment only when needed with `npm run build:static` and verify it with `npm run verify:dist:v136`.

The patch package also includes Windows and macOS/Linux apply helpers that perform the cleanup automatically.
