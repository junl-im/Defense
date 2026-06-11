# v2.15.0 Design Polish / Mobile QA

## Goal
v2.14.1 restored the first screen after the boot-blackout issue. v2.15 keeps that safety, then resumes visual polish with a mobile-first rule: clear art, smaller readable UI, and hit zones that stay close to the visible asset.

## Art / Asset Updates
- Added `public/assets/ui/v2_15/` PNG + WebP set.
- Added `public/assets/maps/v2_15/` 12 battle backgrounds with HUD/dock readability bands.
- Added v2.15 login, main menu, and world map background variants.
- Boot loader now prefers v2.15 WebP assets while preserving PNG fallback through `?png=1`.

## Mobile Layout QA
- Start gate remains visible and bright enough after the v2.14.1 hotfix, but is trimmed to reduce clutter.
- Login button positions and utility button hit zones were tightened to match the visible artwork.
- Main menu bottom navigation and toast frame were made slightly smaller.

## Combat UI QA
- Top HUD and bottom dock display sizes reduced.
- Battlefield safe area adjusted to use more play space while keeping UI guards intact.
- Build spot and tower hit zones were tightened again.
- Build menu and tower command panel were reduced to better fit small screens.
- Tactical order cards and overlay were compacted to avoid covering too much of the battlefield.

## Validation
- `npx tsc --noEmit` passed.
- `npm run build` still requires a local `npm install` because this container is missing Rolldown's optional native binding.
