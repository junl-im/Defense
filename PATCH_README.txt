Dokkaebi Luck Defense 3D v9.0.0 overwrite patch
Base: user-provided Defense.zip v8.0.0

Extract this archive into the v8 project root and overwrite matching files.
Then run:
  npm run verify
  npm run build:static
  node scripts/verify-static-dist.mjs

The patch does not contain dist, node_modules or .git.
Obsolete SVG and legacy nextgen GLBs are removed automatically by the verification/build cleanup step.
