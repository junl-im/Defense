# KingdomSeed v2.36.31 UI UX QUALITY CHECK MATRIX

## Purpose

v2.36.30 added the first integrated QA control panel. v2.36.31 turns that panel into a more practical mobile game check matrix for UI/UX, design, system, and feature readiness.

The goal is not to add more visual clutter. The goal is to make the project easier to judge and improve screen by screen.

## What changed

- Expanded `QualityCheckDirector.ts` from 3 groups to 4 groups:
  - UX
  - Design
  - System
  - Feature
- Added 0-100 quality score to the report and panel.
- Added actionable recommendation lines.
- Added UX checks:
  - primary action flow availability
  - back/navigation intent
  - clutter/text budget
  - touch comfort
  - scene object/input load
  - saved UI/design preferences
  - input overload
- Added design consistency checks:
  - readable UI root
  - contrast fallback
  - supreme design system state
  - visual density mode
- Kept existing system checks:
  - viewport
  - mobile back guard
  - scene bridge
  - localStorage
  - network/save-data
  - device tier
  - safe fallback
- Kept existing feature checks:
  - reference thumbnails
  - reference actor art
  - reward pipeline art
  - action flow
  - saved quality toggles

## New / extended QA options

- `?qualitycheck`
- `?uxcheck`
- `?uicheck`
- `?designcheck`
- `?systemcheck`
- `?featurecheck`
- `?checkpanel`
- `?qapanel`
- `?qahealth`
- `?qacheck`
- `?navqa`

Recommended checks:

- `/`
- `/?qualitycheck`
- `/?uxcheck&designcheck&systemcheck&featurecheck`
- `/?qualitycheck&navqa`
- `/?qualitycheck&referenceart&refevolution&rewardpipeline`
- `/?qualitycheck&essentialui`
- `/?qualitycheck&legacyclutter`

## Runtime output

The latest report is still exposed at:

- `window.__KINGDOM_SEED_LAST_QUALITY_CHECK__`

It now includes:

- `score`
- `ux`
- `design`
- `system`
- `feature`
- `recommendations`

The event is still emitted as:

- `kingdom-seed:quality-check`

## Safety

- No new heavy art.
- No BootScene asset increase.
- No Firebase/PWA/audio timing changes.
- No battle-time heavy art streaming.
- The panel only renders when QA query options are present.
- Normal users still get quiet background checks only.

## Validation

- `npm ci` should pass.
- `npm run build` should pass.
- Vite preview `/` should return HTTP 200.
- Vite preview `/?qualitycheck` should return HTTP 200.
- Vite preview `/?uxcheck&designcheck&systemcheck&featurecheck` should return HTTP 200.
