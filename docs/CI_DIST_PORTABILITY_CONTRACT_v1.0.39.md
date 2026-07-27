# CI Dist Portability Contract v1.0.39

## Problem

Vite production output does not preserve authored source paths such as `dist/src/main.js`. Runtime modules and CSS are emitted under `dist/assets/` with transformed names. A deployment verifier must validate deployed behavior and stable markers, not require the authored directory structure.

## Contract

- Public files copied by Vite may be required by their stable paths.
- Runtime JavaScript and CSS must support two modes:
  - static fallback: `dist/src/**`
  - Vite production: `dist/assets/**/*.js` and `dist/assets/**/*.css`
- A verifier may not require `dist/src/**` unconditionally.
- Stable runtime strings, CSS custom properties, asset hashes, and active references are valid deployment evidence.
- Minifier-sensitive local variable names must not be the only evidence.

## v1.0.34 foundation evidence

The portable v1.0.34 gate verifies:

- current version and service-worker identity
- mobile HUD runtime deployment
- `--mobile-visual-bottom-v23`
- late mount recovery state
- emergency HUD class behavior
- 44px touch target and focus-visible CSS
- absence of obsolete root artifacts

A regression fixture intentionally contains no `dist/src` directory and must pass as a Vite deployment.

## Cache identity

Vite may retain either the release-style revision (`release-v139-b24-39`) or the package-style revision (`1.0.39-b24.39`). A verifier accepts any current, internally consistent revision expression instead of requiring every spelling simultaneously.
