# KINGDOM SLG (Defense repository reboot)

A playable **single-player 3D kingdom-building strategy game** for the browser, based on [Hexkingdom by Aleksandr (Leks2000)](https://github.com/Leks2000/Hexkingdom).

**Play**: https://junl-im.github.io/Defense/

## Implemented systems

- 3D hexagonal maps, animated building growth, field placement and frontier expansion.
- Economy: wood, stone, food, gold, influence, production, trading and caravans.
- Research and technologies; kingdom tiers and building unlocks.
- Army recruitment, border battles, enemy expansion and raids.
- Automatic local browser saves, game restart, desktop and touchscreen controls.

**Not implemented**: online accounts, server-hosted saves, guilds, PvP matchmaking, simultaneous online wars, paid monetization. This is not a fully finished commercial SLG.

## Run locally

```bash
python -m http.server 8123
# open http://localhost:8123/
```

Three.js `0.160.0` is loaded using a version-pinned jsDelivr URL from the original page. A network connection is currently required. No package install or build needed to run.

## QA and deployment

```bash
npm test
```

The source checks run on each push to `main`, then GitHub Actions deploys the static folder to Pages.

## License, credits and change notice

- Original **MIT** license (c) 2026 Aleksandr (Leks2000), preserved in [LICENSE](LICENSE).
- Original upstream: https://github.com/Leks2000/Hexkingdom
- Modified in this repository: site branding, SVG-free icon rendering, deployment policy and QA.
- Temporary emoji pictograms are used in place of original inline SVG icons until verified PNG/WebP assets are prepared.
- Former Defense projects are preserved as `archive/dokkaebi-defense-20261018` and `archive/anime-crowd-runner-20261018` branches.
- GPL/AGPL games such as TravianZ and Pillage First! are references, not code combined into this project.
