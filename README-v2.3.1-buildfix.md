# Kingdom Seed v2.3.1 Build Fix

Fixes TypeScript build errors from v2.3 visual overhaul.

## Fixes

- GameScene: build spot type changed from Arc to Ellipse.
- main: removed unsupported top-level Phaser GameConfig resolution property.

## Apply

Copy these files into your project:

- src/scenes/GameScene.ts
- src/main.ts

Then run:

```bash
npm run build
```
