# v3.7.5 Patch Apply

Apply over v3.7.4 or any earlier v3.7.x working tree. This patch deliberately contains all 14 combat GLB binaries to recover repositories that lost unchanged assets during overlay patching.

```bash
npm run clean:obsolete
npm run verify
npm run build
```

The first verification stage prints an explicit list of every missing or corrupt GLB. A Git LFS pointer file is rejected as corrupt content.
