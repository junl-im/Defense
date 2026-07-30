# Apply v1.0.51 Direct Overlay Patch — CI Overlay Downgrade Repair R3

1. Back up the existing repository.
2. Extract the overwrite patch directly into the repository root and replace matching files.
3. Do not create a `DokkaebiLuckDefense3D_FULL_*` wrapper directory. `package.json`, `src/`, `scripts/`, and `.github/` must remain at the actual repository root.
4. Run the following before committing or triggering Actions:

```bash
node scripts/bootstrap-release-package-v151.mjs
node scripts/clean-obsolete-assets.mjs
node scripts/verify-repository-root-v151.mjs
node -e "const p=require('./package.json'); console.log(p.version, p.dokkaebi?.buildId)"
```

5. Confirm the identity is `1.0.51 b24.51`.
6. Run `npm ci` and `npm run verify:ci`.
7. Build with `VITE_BASE_PATH=/Defense/ npm run build`.
8. Run `REQUIRE_BROWSER_V144=1 REQUIRE_BROWSER_V145=1 REQUIRE_BROWSER_V146=1 REQUIRE_BROWSER_V147=1 REQUIRE_BROWSER_V149=1 REQUIRE_BROWSER_V150=1 REQUIRE_BROWSER_V151=1 npm run verify:dist:all`.

The patch manifest and `DELETE_PATHS.txt` list the six obsolete root metadata paths plus the legacy `overlay/` directory. Repair revision 3 also removes those files during dependency-free bootstrap and CI preflight. Any legacy root `overlay/` directory is deleted without merging so it cannot restore a stale package identity.
