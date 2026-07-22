# v3.7.3 Absolute No-SVG Verification Hotfix

## Fixed failure

GitHub Actions could report:

```text
FAIL SVG 에셋 또는 참조 발견:
```

with an empty path. The previous verifier combined file detection and string checks but only printed the file list, so a reference detected in HTML or the manifest produced a blank failure message.

## New policy

The project now rejects:

- any `.svg` file in the deliverable tree
- runtime `.svg` URL/import references
- inline `<svg>` markup
- `data:image/svg+xml` data URIs
- `image/svg+xml` MIME declarations

The verifier reports the exact file, line number, violation type and matched reference.

## Allowed formats

- PNG
- WebP
- KTX2
- GLB/glTF

## Regression coverage

- policy text containing the word `svg` does not cause a false positive
- actual `.svg` paths fail
- inline SVG fails
- actual SVG files fail
- stale SVG files are recursively removed by `preverify` and `prebuild`
