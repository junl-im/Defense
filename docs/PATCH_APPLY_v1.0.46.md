# Patch Apply v1.0.46

1. Extract the patch ZIP outside the repository.
2. Copy only the contents of `1.0.46/overlay/` into the project root.
3. Do not copy `APPLY_KO.txt` or `PATCH_MANIFEST.json` into the repository.
4. Run:

```bash
rm -rf dist
npm ci
npm run verify:release:v146
VITE_BASE_PATH=/Defense/ npm run build
REQUIRE_BROWSER_V144=1 REQUIRE_BROWSER_V145=1 REQUIRE_BROWSER_V146=1 npm run verify:dist:all
```
