# Defense Reboot v0.7 — siege-barricade and portrait-camera pass

Date: 2026-10-18. Development takes place only in `feat/anime-crowd-reboot-v0`; previous `main` remains unchanged. Do not merge until manual visual/art-direction QA is approved.

## Implemented game mechanics

- A 300 HP wooden/iron barricade spans the full lane at z=62. The heroine stops at z=58.8 while it remains intact.
- Automatic squad fire damage is deterministic, population-dependent, and frame-time-capped to 350 ms. A surviving heroine keeps base DPS even if the squad is empty.
- Animated breaking planks, an in-world decreasing digit indicator, and an SVG-free responsive top HUD show obstruction status.
- After destruction the heroine proceeds through the breached path and can reach the existing three-pattern Witch boss fight.
- Restart restores the wall HP, its meshes/labels, score, and combat state.
- Tests cover blocking, damage arithmetic, stronger squads, FPS cap, and reset behavior indirectly through browser QA.

## Visual fidelity / performance

- Portrait/mobile camera is pulled back separately so the player can see the gate and wall simultaneously.
- Original Kenney `tree.glb` had unsupported embedded textures under Chromium software WebGL. Low-polygon evergreen scene geometry replaces the failing tree path. Other licensed props remain.
- Characters remain licensed Quaternius animated GLBs and transparent PNG impostors. No SVG has been added.
- These are functional and stylized placeholders relative to the desired final dating-sim art direction; further art design remains necessary.

## Quality assurance

- The GitHub Actions pipeline runs Node unit tests, SVG policy checks, Vite build and a desktop/mobile headless WebGL playthrough.
- QA explicitly asserts: player stops at the wall, wall HP falls, exactly 300 points of damage are dealt, wall HP reaches zero, heroine enters boss arena, defeats the boss and wins, restart restores wall HP to 300.
- The GitHub Actions QA environment runs Chromium with SwiftShader (software renderer); its FPS must not be mistaken for device hardware performance.
- Stage 1 completeness does not mean the game is release-ready.
