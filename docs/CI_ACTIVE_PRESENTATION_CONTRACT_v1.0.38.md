# CI Active Presentation Contract v1.0.38

## Problem

`verify:dist:v123` scanned every deployed JavaScript bundle for the old Korean title. The deployed title correction guard intentionally contains the old title as a replacement key, so a valid Vite build was rejected.

## Contract

- Visible branding is validated only on active presentation surfaces:
  - `dist/index.html`
  - `dist/manifest.webmanifest`
- Runtime bundles may contain legacy strings when those strings are required to migrate or replace old DOM text.
- The canonical title must be present in `dist/index.html`.
- The canonical PWA name must be present in the manifest when the manifest is required.
- Legacy branding must not appear in active presentation surfaces.
- The title correction runtime marker `DD-TITLE-PRESENTATION-V123` must remain deployed.
- Approved mascot assets continue to be verified by emitted-file SHA-256 and active path reference.

## Regression fixture

The v1.0.38 release verifier creates a synthetic deployment where:

1. HTML and manifest contain the canonical title.
2. A runtime bundle contains the legacy title as correction data.
3. Active presentation validation must pass.
4. Replacing the HTML title with the legacy title must fail.
