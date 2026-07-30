# v1.0.51 Repository Root Repair

## Failure signature

- CI prints `dokkaebi-luck-defense-3d@1.0.46` instead of `@1.0.51`.
- `verify:ci` starts without `bootstrap:identity:v151`.
- Root hygiene rejects `PATCH_SUMMARY.md`.

## Root cause

The previous full ZIP contained one wrapper directory. Uploading that directory as-is into an existing repository could leave the old v1.0.46 files at the real repository root while placing v1.0.51 below it. The patch deletion contract also did not list legacy root patch metadata.

## Repair contract

- The repaired full ZIP is repository-root flat: `package.json`, `src/`, and `.github/` are archive-root entries.
- `npm run clean:obsolete` removes `PATCH_SUMMARY.md` and other stale patch metadata from the repository root.
- `verify:repo-root:v151` fails early when the root identity is not v1.0.51/b24.51 or a nested full-package directory is detected.
- The overwrite patch declares six stale root paths for deletion and also removes them through the preverify cleanup path.

## Required post-apply check

```bash
node -e "const p=require('./package.json'); console.log(p.version, p.dokkaebi?.buildId)"
npm run clean:obsolete
npm run verify:repo-root:v151
```

Expected identity: `1.0.51 b24.51`.
