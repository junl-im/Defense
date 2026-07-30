# Asset Review v1.0.44

- Contract: DD-ASSET-REVIEW-V144
- Source: DD-RUNTIME-ASSET-REACHABILITY-V143
- Candidates reviewed: 24/24
- Reviewed bytes: 3,209,260
- Deletion approvals: 0

> No candidate may be quarantined or deleted until an explicit follow-up patch changes deleteApproved and provides replacement evidence.

## Dispositions

- `retain-approval-lineage`: 2 files, 213,070 bytes
- `retain-asset-readiness`: 1 files, 74,552 bytes
- `retain-production-candidate`: 6 files, 269,194 bytes
- `retain-runtime-catalog`: 14 files, 2,629,836 bytes
- `retain-runtime-contract`: 1 files, 22,608 bytes

## Reviewed candidates

- `public/assets/models/player-dokkaebi-archer-candidate-v1.glb` — **retain-runtime-catalog** — Model filenames are selected through runtime catalogs and fallback loaders; literal reachability alone is insufficient.
- `public/assets/models/player-dokkaebi-mage-candidate-v1.glb` — **retain-runtime-catalog** — Model filenames are selected through runtime catalogs and fallback loaders; literal reachability alone is insufficient.
- `public/assets/models/monster-brute-sd-toon.glb` — **retain-runtime-catalog** — Model filenames are selected through runtime catalogs and fallback loaders; literal reachability alone is insufficient.
- `public/assets/models/monster-ghost-candidate-v1.glb` — **retain-runtime-catalog** — Model filenames are selected through runtime catalogs and fallback loaders; literal reachability alone is insufficient.
- `public/assets/models/monster-crow-candidate-v1.glb` — **retain-runtime-catalog** — Model filenames are selected through runtime catalogs and fallback loaders; literal reachability alone is insufficient.
- `public/assets/models/monster-shaman-sd-toon.glb` — **retain-runtime-catalog** — Model filenames are selected through runtime catalogs and fallback loaders; literal reachability alone is insufficient.
- `src/assets/title-v120/title-mascot-v120.webp` — **retain-approval-lineage** — The source asset is an explicit presentation approval boundary even when a later approved mascot is active.
- `src/assets/title-v120/title-mascot-lite-v120.webp` — **retain-approval-lineage** — The source asset is an explicit presentation approval boundary even when a later approved mascot is active.
- `public/assets/models/boss-serpent-sd-toon.glb` — **retain-runtime-catalog** — Model filenames are selected through runtime catalogs and fallback loaders; literal reachability alone is insufficient.
- `src/assets/moon-mascot-v1.webp` — **retain-asset-readiness** — The mascot is a mandatory readiness and source-manifest asset retained for fallback and audit coverage.
- `public/assets/models/boss-king-sd-toon.glb` — **retain-runtime-catalog** — Model filenames are selected through runtime catalogs and fallback loaders; literal reachability alone is insufficient.
- `public/assets/models/guardian-bell-sd-toon.glb` — **retain-runtime-catalog** — Model filenames are selected through runtime catalogs and fallback loaders; literal reachability alone is insufficient.
- `public/assets/models/guardian-wind-sd-toon.glb` — **retain-runtime-catalog** — Model filenames are selected through runtime catalogs and fallback loaders; literal reachability alone is insufficient.
- `public/assets/models/guardian-frost-sd-toon.glb` — **retain-runtime-catalog** — Model filenames are selected through runtime catalogs and fallback loaders; literal reachability alone is insufficient.
- `public/assets/models/guardian-thunder-sd-toon.glb` — **retain-runtime-catalog** — Model filenames are selected through runtime catalogs and fallback loaders; literal reachability alone is insufficient.
- `public/assets/models/guardian-stone-sd-toon.glb` — **retain-runtime-catalog** — Model filenames are selected through runtime catalogs and fallback loaders; literal reachability alone is insufficient.
- `public/assets/ui/v390/class-archer.png` — **retain-production-candidate** — Approved raster candidate remains reproducible input and compatibility material for the v3.9 visual pipeline.
- `public/assets/ui/v390/class-mage.png` — **retain-production-candidate** — Approved raster candidate remains reproducible input and compatibility material for the v3.9 visual pipeline.
- `public/assets/ui/v390/enemy-crow.png` — **retain-production-candidate** — Approved raster candidate remains reproducible input and compatibility material for the v3.9 visual pipeline.
- `public/assets/ui/v390/enemy-skeleton.png` — **retain-production-candidate** — Approved raster candidate remains reproducible input and compatibility material for the v3.9 visual pipeline.
- `public/assets/ui/v390/enemy-ghost.png` — **retain-production-candidate** — Approved raster candidate remains reproducible input and compatibility material for the v3.9 visual pipeline.
- `public/assets/models/monster-runner-sd-toon.glb` — **retain-runtime-catalog** — Model filenames are selected through runtime catalogs and fallback loaders; literal reachability alone is insufficient.
- `public/assets/ui/v390/class-warrior.png` — **retain-production-candidate** — Approved raster candidate remains reproducible input and compatibility material for the v3.9 visual pipeline.
- `public/assets/system-v135/runtime-module-shell-v135.json` — **retain-runtime-contract** — The generated module shell is a deployed service-worker and release-integrity contract.
