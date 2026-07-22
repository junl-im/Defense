# v3.7.5 Runtime Asset Recovery Hotfix

## Root cause

The v3.7.4 full archive contained all 14 combat GLB files, but the overlay patch contained no GLBs. Repositories that had already lost one or more models therefore stayed incomplete after applying the patch.

## Fix

- The v3.7.5 patch force-includes all 14 combat GLBs, even when their hashes are unchanged from the full archive.
- A new runtime asset inventory records exact byte sizes and SHA-256 hashes.
- Verification now checks file existence, Git LFS pointer contamination, GLB header/version/length, exact size, and SHA-256 before the long project suite begins.
- `verify-asset-readiness.mjs` now reports all missing files instead of crashing on the first `ENOENT`.

## Required recovery command

```bash
npm run verify
npm run build
```

If the repository is missing any combat model, reapply the v3.7.5 patch and commit the restored files under `public/assets/models/`.
