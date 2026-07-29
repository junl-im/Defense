# Patch Apply v1.0.49

Target: v1.0.49 / b24.49

The delivered patch ZIP is a **direct-root cumulative overlay** designed for v1.0.46 or later branches, including mixed partial-patch states where `package.json` remained at 1.0.46. It has no `overlay/` wrapper. Extract it directly into the project root and commit every overwritten file.

```bash
unzip -o Defense_v1.0.49_CUMULATIVE_DIRECT_PATCH.zip -d .
node scripts/generate-release-identity-v149.mjs
npm ci
npm run verify:identity:v149
npm run verify:ci
VITE_BASE_PATH=/Defense/ npm run build
REQUIRE_BROWSER_V144=1 REQUIRE_BROWSER_V145=1 REQUIRE_BROWSER_V146=1 REQUIRE_BROWSER_V147=1 REQUIRE_BROWSER_V149=1 npm run verify:dist:all
```

The first identity line must report `1.0.49 / b24.49 / 1.0.49-b24.49`. A remaining `package=1.0.46` message means the patched `package.json` was not committed or the workflow ran on another branch/commit.
