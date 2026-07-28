# CI Root Overlay Recovery Hotfix v1.0.46

## Failure

`verify-root-hygiene.mjs` rejected a repository containing `overlay/` at the project root.
This happens when a patch wrapper directory is copied instead of copying only its contents.

## Resolution

`root-output-policy.mjs` now recognizes a valid accidental direct-overlay wrapper during
`clean:obsolete`, merges only approved project paths into the repository root, and removes
the wrapper before the strict hygiene gate runs.

Safety rules:

- only known project root files and authored source directories are accepted;
- symbolic links are rejected;
- unknown top-level overlay entries are rejected;
- the normal root hygiene allowlist remains unchanged;
- repeated runs are idempotent after the wrapper is removed.

## Verification

The release was tested with the previous residency autosync patch left under `overlay/`.
Eight patch files were promoted, `overlay/` was removed, root hygiene passed, and the full
`npm run verify:ci` chain completed successfully.
