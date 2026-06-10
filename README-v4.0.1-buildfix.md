# Kingdom Seed v4.0.1 Build Fix

Fixes TypeScript build error in `src/game/PremiumCombatUi.ts`:

- Replaced `sprite.setTintFill(0xffffff)` with `sprite.setTint(0xffffff)`.

Apply by copying the `src/game/PremiumCombatUi.ts` file into your project and running:

```bash
npm run build
```
