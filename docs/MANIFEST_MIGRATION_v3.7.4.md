# PWA Manifest Migration Contract v3.7.4

SVG assets are prohibited. Older repositories may still contain SVG icon entries in
`public/manifest.webmanifest` even after the SVG files themselves were removed.

`clean-obsolete-assets.mjs` therefore performs a content migration:

1. Parse `public/manifest.webmanifest`, `dist/manifest.webmanifest`, and `dist-pages/manifest.webmanifest` when present.
2. Remove objects or values that reference `.svg` or `image/svg+xml`.
3. Replace the `icons` array with the canonical PNG icon set.
4. Write the file only when its normalized content changed.
5. Run the absolute SVG scanner after migration.

This migration is required in both `preverify` and `prebuild` so ZIP overlay updates and old Git working trees converge to the same clean state.
