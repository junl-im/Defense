# Apply v1.0.51 Direct Overlay Patch

1. Back up the existing v1.0.50 project.
2. Extract the overwrite patch directly into the project root and replace matching files.
3. Confirm that `package.json`, `src/`, and `.github/` are at the repository root, not inside a `DokkaebiLuckDefense3D_FULL_*` folder.
4. Run `npm run clean:obsolete`; this removes root `PATCH_SUMMARY.md` and other stale patch metadata.
5. Run `npm run verify:repo-root:v151`.
6. Run `npm run bootstrap:identity:v151` and `npm run sync:generated:ci`.
7. Run `npm run verify:release:v151`.
8. In an environment where `npm ci` can install `three@0.185.1` and `vite@8.1.5`, rebuild with `VITE_BASE_PATH=/Defense/ npm run build`.
9. Run `REQUIRE_BROWSER_V144=1 REQUIRE_BROWSER_V145=1 REQUIRE_BROWSER_V146=1 REQUIRE_BROWSER_V147=1 REQUIRE_BROWSER_V149=1 REQUIRE_BROWSER_V150=1 REQUIRE_BROWSER_V151=1 npm run verify:dist:all`.

Deleted paths are listed in the patch manifest and `DELETE_PATHS.txt`. The patch ZIP has no wrapper directory.

## Repository-root repair revision

The repaired delivery is archive-root flat, removes stale root `PATCH_SUMMARY.md` metadata, and adds `verify:repo-root:v151` to stop nested or stale v1.0.46 repository layouts before verification.

