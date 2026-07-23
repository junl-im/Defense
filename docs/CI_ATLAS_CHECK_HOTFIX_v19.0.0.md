# CI Atlas Check Hotfix — v19.0.0

## Failure

GitHub Actions stopped during `npm run verify` with:

```text
ModuleNotFoundError: No module named 'PIL'
```

The v14/v15 atlas generators imported Pillow, OpenCV and NumPy at module startup even when invoked with `--check`. Check mode only validates committed manifests, files and SHA-256 hashes, so image-generation dependencies were unnecessary.

## Fix

- Load Pillow, OpenCV and NumPy only when regenerating atlases.
- Keep `--check` dependency-free using only the Python standard library.
- Pin the CI Python runtime to 3.12 with `actions/setup-python`.
- Add `requirements-atlas.txt` for developers who intentionally regenerate atlases.
- Add npm commands:
  - `npm run setup:atlas-python`
  - `npm run generate:runtime-atlas:v14`
  - `npm run generate:runtime-atlas:v15`

## Verification

The following must pass without site packages:

```bash
python -S scripts/generate-runtime-atlases-v14.py --check
python -S scripts/generate-runtime-atlases-v15.py --check
```

Full verification remains:

```bash
npm run verify
```
