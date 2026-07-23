#!/bin/sh
set -eu
for path in $(cat _patch_info/DELETE_FILES_v19.0.0.txt 2>/dev/null || true); do
  rm -rf -- "$path"
done
printf '%s
' 'v19.0.0 files copied. Run npm run verify and npm run build:static.'
