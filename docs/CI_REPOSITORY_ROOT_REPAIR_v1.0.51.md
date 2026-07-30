# v1.0.51 Repository Root Repair R3

## Failure reproduced

The repository root was already repaired to `1.0.51 / b24.51`, but a legacy extracted `overlay/` directory still contained `package.json@1.0.46`. The old cleanup policy automatically copied every allowed overlay file into the project root. That action downgraded `package.json` after bootstrap and caused `generate-release-identity-v151.mjs` to refuse the repository.

## Repair R3 contract

- The full ZIP is repository-root flat.
- Bootstrap removes known stale root patch metadata and root `overlay/` before package installation.
- The standalone cleaner independently removes root `overlay/` without reading or copying its contents.
- Cleanup runs before identity generation and repository-root verification.
- The regression test creates root `package.json@1.0.51` plus `overlay/package.json@1.0.46`, verifies bootstrap removal, recreates the fixture, verifies standalone cleaner removal, and confirms that no overlay source is copied.
- `scripts/root-output-policy.mjs` is mandatory in the overwrite patch and patch verifier.

## Expected preflight

```bash
node scripts/bootstrap-release-package-v151.mjs
node scripts/clean-obsolete-assets.mjs
node scripts/generate-release-identity-v151.mjs
node scripts/verify-release-identity-v151.mjs
node scripts/verify-repository-root-v151.mjs
```

Expected output includes:

```text
REMOVE stale accidental root overlay/ (...; automatic merge disabled)
PASS v1.0.51 repository-root identity and layout
```
