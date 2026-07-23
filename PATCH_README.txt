DOKKAEBI DEFENSE v17.0.0 OVERWRITE PATCH

Base: v16.0.0 Clear Horizon
Target: v17.0.0 Moon Gate Reborn

1. Stop the development server.
2. Extract this ZIP into the v16 project root and overwrite matching files.
3. Optionally delete paths listed in DELETE_FILES.txt (stale logs only).
4. Run:
   npm run verify
   npm run build:static
   node scripts/verify-static-dist.mjs

If the old title remains, clear site data/service-worker cache and hard refresh.
