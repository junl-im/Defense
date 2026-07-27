# Patch Apply v1.0.39

1. Extract the patch ZIP.
2. Copy every extracted file and folder directly into the project root.
3. Allow overwrite for matching files.
4. Delete the previous `dist/` directory.
5. Run:

```bash
npm ci
npm run verify:release:v139
npm run build
npm run verify:dist:v134
npm run verify:dist:v135
npm run verify:dist:v136
npm run verify:dist:v137
npm run verify:dist:v138
npm run verify:dist:v139
```

The patch ZIP has no wrapper directory. Its root is the overwrite payload.
