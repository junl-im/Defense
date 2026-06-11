# Patch 2.13 - Design Polish / Mobile Compact QA

## Goals
- Keep the premium illustration style while reducing mobile clutter.
- Make tower/build touch zones closer to the visible art.
- Keep HUD and dock readable without blocking the playfield.
- Continue WebP-first image usage with PNG fallback.

## Changes
- Added v2.13 compact UI asset set under `public/assets/ui/v2_13` with PNG/WebP pairs.
- Added v2.13 battle background variants for 12 stages with clearer lane readability and safer HUD/dock bands.
- Tightened build spot hit zone to 28x20 and tower selection hit zone to 24x32.
- Reduced Tower internal interactive ellipse so decorative art/glow no longer becomes a large click target.
- Reduced tower build popup, tower command panel, panel button sizes and several combat text sizes.
- Updated mobile start shell text and card scale for small phone screens.
- Updated package version to 2.13.0.

## QA URLs
- `?hit=1` shows hit zones.
- `?png=1` forces PNG fallback.
- `?lite=1` or `?battery=1` checks reduced effect mode.
