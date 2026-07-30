# v1.0.51 Repository Root Repair R2

## Failure signatures

- CI prints `dokkaebi-luck-defense-3d@1.0.46` instead of `@1.0.51`.
- A wrapper directory leaves the actual repository root on an older release.
- CI reaches `verify-repository-root-v151.mjs` while `PATCH_SUMMARY.md`, `PATCH_MANIFEST.json`, `PATCH_MANIFEST_v1.0.23.json`, `README_PATCH.txt`, or `APPLY_KO.txt` still exists at the repository root.

## Root causes

The original full ZIP used a wrapper directory, which could leave the previous repository root active. Repair revision 1 flattened the archive but still ran the strict repository-root verifier before the workflow cleanup step. A repository containing old patch metadata could therefore fail even though `clean:obsolete` knew how to remove the files.

## Repair R2 contract

- The full ZIP remains repository-root flat: `package.json`, `src/`, `scripts/`, and `.github/` are archive-root entries.
- `bootstrap-release-package-v151.mjs` removes the six known stale root metadata paths using Node built-ins before package installation.
- GitHub Actions runs `node scripts/clean-obsolete-assets.mjs` before `verify-repository-root-v151.mjs`.
- `verify-repository-root-v151.mjs` still fails on the wrong release identity, missing root contracts, or a nested full-package directory, but known removable patch metadata is reported as a warning rather than a premature fatal error.
- `verify-ci-root-cleanup-v151.mjs` enforces workflow ordering and executes the cleaner against a temporary repository containing all six stale files.
- The direct-overlay patch still declares all six paths in `DELETE_PATHS.txt` for users who apply deletions explicitly.

## Required post-apply check

```bash
node scripts/bootstrap-release-package-v151.mjs
node scripts/clean-obsolete-assets.mjs
node scripts/verify-repository-root-v151.mjs
node -e "const p=require('./package.json'); console.log(p.version, p.dokkaebi?.buildId)"
```

Expected output includes:

```text
PASS v1.0.51 repository-root identity and layout
1.0.51 b24.51
```
