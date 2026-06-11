# Patch 2.4.0 - Mobile Polish QA

## Goal
Mobile-first refinement pass after v2.3. This patch focuses on touch precision, compact UI, balance pacing, and removal of baked screenshot UI from key visual layers.

## Mobile / Viewport
- Compact first-touch start gate for phones.
- Added `ks-compact-shell` runtime class and CSS variables for consistent small mobile start layout.
- Kept portrait fill behavior while reducing oversized shell text and debug label sizes.

## Combat Touch QA
- Tower selection touch area reduced to the visible tower footprint.
- External tower selection halo reduced from a broad zone to a compact mobile zone.
- Build spot hit zone reduced and debug overlay resized.
- Battlefield safe area updated to match the slimmer top HUD and bottom dock.

## Combat UI
- Top HUD replaced with a slimmer v2.4 frame.
- Bottom skill dock replaced with a slimmer v2.4 frame.
- Stat font sizes, stage label, speed/pause/wave controls, and message toast are smaller for mobile readability.
- Spell dock controls have smaller hit zones and text to avoid crowding.

## Tower Build / Command Panels
- Build menu reduced from 324x214 to 292x196.
- Tower build cards reduced from 134x56 to 122x50.
- Tower command panel reduced from 390-wide to 330-wide.
- Upgrade, overdrive, target, rally, sell, replace, and close buttons resized for compact mobile use.
- Panel clamp logic remains active so popups avoid HUD and bottom dock.

## Balance 1st Pass
- Early-stage start gold and lives increased slightly.
- Stage 1 early waves softened for first-time mobile players.
- Tower prices reduced slightly and early combat value improved.
- Goal: less accidental loss from mobile control learning, while preserving tower-defense pressure.

## Visual Asset QA
- New clean main menu art layer avoids raw screenshot UI dependency.
- Battle backgrounds v2.4 add safe top/bottom readability zones without baking HUD/units into the image.
- Login background/panel/buttons moved to compact v2.4 variants.
- Hero knight v2.4 uses a smaller battlefield footprint.

## QA Commands
- TypeScript check: `npx tsc --noEmit`
- Hit-zone mode: `http://localhost:5173/?hit=1`
- Portrait contain comparison: `http://localhost:5173/?fit=contain&hit=1`
