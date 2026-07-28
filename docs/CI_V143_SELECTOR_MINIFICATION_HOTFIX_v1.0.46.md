# v1.0.46 CI hotfix: v1.0.43 summon pseudo-element selector portability

## Failure

A valid Vite production build failed `scripts/verify-dist-v143.mjs` with:

`v143 summon visibility CSS contract missing: summon label pseudo-element`

The deployed CSS still contained the summon label behavior. The verifier only
accepted one exact byte sequence:

`#summon-btn[data-summon-visibility-v143=enhanced]::before{`

CSS minifiers may legally shorten `::before` to `:before`, merge selectors that
share declarations, or emit the same selector in more than one rule.

## Fix

- Canonicalize `::before` and `:before` to the same selector form.
- Parse comma-separated selector lists instead of using one `indexOf` lookup.
- Collect all matching declaration blocks, including media-query rules.
- Continue requiring non-empty `content`, `position:absolute`, and
  `pointer-events:none`; the behavioral gate is not weakened.
- Add deterministic fixtures for double-colon, single-colon, grouped selector,
  split media-query, and negative missing-contract cases.

## Apply

Copy `scripts/`, `docs/`, and `package.json` from the hotfix archive directly
into the repository root. Do not create an `overlay/` directory.
