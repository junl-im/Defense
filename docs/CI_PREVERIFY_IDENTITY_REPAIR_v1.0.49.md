# CI pre-verification identity repair — v1.0.49

## Incident

GitHub Actions executed the v1.0.49 runtime and generated identity while `package.json` and `package-lock.json` still reported `1.0.46`. The artifact upload fallback worked, but source verification stopped at the package/runtime identity mismatch.

## Repair

- `scripts/bootstrap-release-package-v149.mjs` atomically repairs supported v1.0.46-v1.0.49 package metadata to v1.0.49.
- The bootstrap also restores required v1.0.48/v1.0.49 npm scripts and the final release-verification tail.
- Generated source/public identity files are synchronized in the same transaction.
- GitHub Actions runs the bootstrap before `npm ci` and asserts package/lock version 1.0.49.
- `verify-project.mjs` and `verify-release-identity-v149.mjs` independently invoke the bootstrap as defense in depth.
- QA artifact directories remain optional and no longer convert an earlier verification failure into a second upload failure.

## Expected CI marker

```text
PASS CI package identity 1.0.49 before npm ci
PASS v1.0.49 pre-verification package bootstrap
PASS package version 1.0.49
PASS 런타임 version 1.0.49
```
