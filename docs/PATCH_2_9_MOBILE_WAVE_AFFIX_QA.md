# v2.9.0 Mobile Wave Affix QA Patch

## Goals
- Keep mobile battle readability high while adding more moment-to-moment variation.
- Reduce accidental tower/build-spot taps.
- Prevent frame spikes from making enemies jump forward.
- Keep text small and compact for phone screens.

## Changes
- Added wave affixes that mutate enemy stats per wave: supply raiders, swift march, iron shell, mana veil, unstable core, and scout split.
- Added a compact battle advisor chip under the top HUD. It shows current wave affix and next-wave tower recommendation.
- Added deterministic affix selection per stage/user/wave so runs feel varied but stable.
- Added build-menu recommendation text using next-wave composition.
- Tightened build spot hit zones from 62x48 to 50x38.
- Tightened installed tower selection halo from 58x76 to 44x58.
- Clamped combat simulation delta during mobile frame spikes to prevent sudden path jumps.
- Reduced ambient map motes automatically in `?lite=1` or `?battery=1` mode.
- Gold HUD now abbreviates large numbers to reduce top-bar crowding.
- Added v2.9 advisor/affix UI images with WebP priority and PNG fallback.

## QA URLs
- `?hit=1` shows hit zones.
- `?lite=1` reduces repeated ambient effects.
- `?battery=1` uses the same low-effect combat delta path.
- `?png=1` checks PNG fallback.

## Verification
- `npx tsc --noEmit` passed.
- `npm run build` could not complete in this container because the local Vite binary has no execute permission. This is the same environment issue as prior patches.
