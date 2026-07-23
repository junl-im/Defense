# PROJECT HANDOFF — CURRENT v17.0.0

- Project: `DokkaebiLuckDefense3D_FULL_v17.0.0`
- Game: `17.0.0`
- Engine: `14.0.0`
- Save schema: `15`

## Current operating state

1. PC and mobile title backgrounds are separate optimized WebP files.
2. The new mascot is an alpha WebP extracted from the uploaded checkerboard image.
3. Original uploaded multi-megabyte PNG files are not shipped at runtime.
4. First screen remains player-facing and contains no patch or engine information.
5. Wave 3 blessing and wave 4 relic transitions have modal visibility guards.
6. WaveFlowGuard restores stalled spawning, completion and post-wave countdown states.
7. Enemy model acquisition failures use an emergency imp fallback or consume the failed slot.
8. The animation loop isolates subsystem exceptions and records runtime errors.
9. Runtime golden slice remains 6/6; final production art remains 0/6.
10. Mass production remains locked.

## Remaining validation

- Ten-wave automated browser run is still required.
- Mobile background resume and long-session thermal QA are still required.
- Final production art approval is not granted by title images or 2D atlas assets.
