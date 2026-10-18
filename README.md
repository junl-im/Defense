# Defense Reboot — Anime Crowd Runner (Web)
New game scaffold for `junl-im/Defense`. The previous Dokkaebi Luck Defense code stays recoverable in the original `main` commit history. This clean-tree branch must be reviewed before replacement.

## Direction
- Anime heroine commander / 3D crowd runner / number gates / shooting / giant boss.
- Babylon.js + Vite. Keyboard A/D or arrows, touch drag, button-based start.
- **NO SVG** files, markup, generated SVG, or SVG icons. Graphics: PNG/WebP/KTX2 and GLB/glTF/FBX sources.
- This build is a **mechanical prototype**. Procedural capsule characters are QA stand-ins, NOT final approved character art. Real female models are sourced separately.
- Never embed other commercial games' proprietary code or art; record source, URL, author, license, and hash before adopting third-party binaries.

## Start
```bash
npm install
npm run dev
npm test
npm run build
```

## First approved assets
Place reviewed character GLB at `public/assets/approved/hero.glb` and later `squad.glb`, `boss.glb`; the model loader only attempts a file if it exists. The repository intentionally does **not** ship unverified/undownloaded assets. See `docs/ASSET_MANIFEST.md`.

## PC sync (Windows)
Run `powershell -ExecutionPolicy Bypass -File scripts/sync-windows.ps1` from a terminal. Local target is `D:\K-city-webgame\Defense`. The script refuses dirty Git worktrees and checks out the new remote feature branch; it does not rewrite GitHub main.

## Workflow
- `checks.yml`: pushes/PRs -> install, unit tests, SVG ban check, build, upload dist artifact.
- `pages.yml`: after merge/push to main, build & deploy to GitHub Pages.
- `asset-audit.yml`: weekly/manual metadata audit (links only; no licensed binary redistribution).
- Old project Actions intentionally do not run in this new clean tree.

## Status
Feature branch scaffold / test-run pending GitHub Actions. No Unity premium template code has been copied.