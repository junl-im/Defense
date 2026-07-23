DOKKAEBI DEFENSE v13.0.0 OVERWRITE PATCH

Patch: Transparent Arsenal
Base: DokkaebiLuckDefense3D_FULL_v12.0.0
Target: DokkaebiLuckDefense3D_FULL_v13.0.0

APPLY
1. Back up the v12 project.
2. Extract this archive directly into the v12 project root.
3. Allow files to overwrite.
4. Run:
   npm run verify
   npm run build:static
   node scripts/verify-static-dist.mjs

ASSET RESULT
- Source sheets: 10
- Transparent individual crops: 415
- Curated runtime assets: 42
- Runtime-ready 2D assets: 124
- Manual review queue: 291
- Final production 3D approval: 0/6

IMPORTANT
The uploaded sheets used a baked checkerboard, not real transparency.
The v13 pipeline reconstructed alpha and generated padded individual PNG files.
These sprites may be used in the 2D presentation layer, but do not unlock final 3D mass production approval.

FILES
- New: 436
- Overwritten (including patch metadata): 31
- Deleted: 0
- Total patch files: 467
