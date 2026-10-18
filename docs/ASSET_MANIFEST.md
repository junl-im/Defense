# Asset acquisition register — 2026-10-18

## Rules
1. All final game art must be licensed and locally verified; no ripped assets, copyrighted anime artwork, or proprietary Unity template dumps.
2. SVG is banned throughout the frontend (including icons, generated markup, data URIs, icon libraries that emit inline SVG).
3. UI is PNG/WebP; 3D characters, enemies, bosses and props are GLB/glTF. Blender/FBX source can be converted after inspection.
4. Distinguish `identified`, `downloadable`, `downloaded`, `approved`, and `integrated`. Identified != downloaded.
5. Download binary assets into gitignored `assets/source` initially; run hash/license/format/poly-count inspection, then explicitly approve.
6. Paid Unity Last Survival template is **reference only**. Its code, artwork, and packages have NOT been imported. Purchasing does not automatically make Unity-specific code runnable in Babylon.js.

## Top priority
- **Quaternius Ultimate Modular Women** — ten swap-ready female characters and 24 animations; CC0 on old pack page; download manually from publisher; inspect textures, proportions and rigs. https://quaternius.com/packs/ultimatemodularwomen.html
- **Quaternius Universal Base Characters** — six humanoid bases and 20 hairstyles; glTF and FBX; CC0 on pack page. https://quaternius.com/packs/universalbasecharacters.html
- **Quaternius Universal Animation Library** — 120+ animations and combat; CC0; standard zip download through itch. https://quaternius.itch.io/universal-animation-library
- **OpenGameArt Low poly anime girl** — .blend, CC0; unrigged, 256 triangles (good only for distant crowd). https://opengameart.org/content/low-poly-anime-girl
- **OpenGameArt Basic Female** — rigged, CC0, 8.5k polygons (subject to independent visual check). https://opengameart.org/content/basic-female-0
- **Kenney UI Pack** — 430 CC0 sprites; PNG buttons and panels. https://kenney.nl/assets/ui-pack
- **Kenney Fantasy Town Kit** — 160 CC0 environment pieces; use for lane, stone walls and stage decorations. https://kenney.nl/assets/fantasy-town-kit
- **Kenney Fantasy UI Borders** — 130+ sprites, CC0. https://kenney-assets.itch.io/fantasy-ui-borders

## Notes
Quaternius posted a new licensing framework for future packs in 2026: re-check the specific pack license at download time, log download date, and keep the license notice. Do not interpret the existence of a source URL as approval. Automated original ZIP download is implemented only for two direct OpenGameArt source links. Binary retrieval from this assistant runtime was blocked, so nothing is represented as already acquired.

## Art production
Initial lead: young adult heroine, stylized anime face, game-friendly silhouette, tasteful futuristic fantasy attire, no school uniform requirement, scalable LOD. Boss must be 4–7× her size with screen-space telegraph, 3 attack phases, readable eye/weapon focus, GPU/light budgets.
