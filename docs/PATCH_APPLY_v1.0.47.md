# Patch Apply v1.0.47

Base: v1.0.46 / b24.46  
Target: v1.0.47 / b24.47

Copy only the contents of the patch archive's `overlay/` directory into the project root. Do not copy `APPLY_KO.txt` or `PATCH_MANIFEST.json` into the repository.

```bash
rm -rf dist
npm ci
npm run verify:release:v147
npm run verify:ci
VITE_BASE_PATH=/Defense/ npm run build
REQUIRE_BROWSER_V144=1 \
REQUIRE_BROWSER_V145=1 \
REQUIRE_BROWSER_V146=1 \
REQUIRE_BROWSER_V147=1 \
npm run verify:dist:all
```

The optional exact baseline promotion requires the original v1.0.45 Vite `dist-budget-report.json`. Do not substitute a later release report.
