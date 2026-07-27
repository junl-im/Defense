# Patch Notes v1.0.39

- Fixed `verify:dist:v134` failing on successful Vite builds because `dist/src/main.js` was required.
- Added `scripts/lib/verify-dist-v134-foundation.mjs` with static and Vite deployment modes.
- Added `DIST_DIR` support to `verify-dist-v134.mjs` for isolated regression fixtures.
- Added a Vite fixture with no source tree to the release gate.
- Fixed the v1.0.35 and v1.0.36 gates requiring two cache-revision spellings simultaneously; one valid current revision expression is now sufficient.
- Audited remaining legacy dist verifiers for source-path assumptions and confirmed their bundle fallbacks.
- Made the v1.0.38 gates forward-compatible with v1.0.39.
- Added the v1.0.39 deployment gate to GitHub Actions.
