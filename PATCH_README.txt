Dokkaebi Luck Defense 3D v23.0.0 Quiet Screen

Base: v22.0.0 Autonomous Moonfront
Apply: extract this ZIP into the project root and overwrite matching files.
Deleted files: none.

Verify:
  npm ci
  npm run verify
  npm run simulate:v2300
  npm run build:static
  node scripts/verify-static-dist.mjs
