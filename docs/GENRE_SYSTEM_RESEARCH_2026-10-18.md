# Defense Reboot v0.8 — Long-form runner & reusable genre-system research

Documented 2026-10-18. Scope: lawful study and implementation in Babylon.js. Never import or redistribute commercial Last Survival proprietary Unity C# or art.

## Implemented in the playable repo

- 8 contiguous visual sections across 710 world units, changing environment colors as the player travels.
- 17 paired numeric decisions (positive, multiplier, negative) created from read-only blueprints, reset safely between runs.
- 15 escalating enemy formations totaling 2,554 logical enemies. Reuses up to 135 visible female PNG billboard units per active wave (not one WebGL mesh per enemy).
- 4 breakable barricades, with HP 300 / 480 / 650 / 900, pauses player until breached, preserves cumulative wall damage and destruction count.
- Witch Queen boss arena at final section with 5,000 HP and 3 telegraphed attack patterns.
- Reusable stage progress HUD: zone name, percentage, distance, cumulative kills, wave completions and destroyed barricades. End-of-run summary lists time and destruction.
- Squad loss by pressured waves, variable enemy toughness for rush, elite, and royal wave types.
- Main heroine uses animated 3D GLB; mass crowds use licensed PNG billboard sprites. SVG files, vector icon packages and inline SVG are banned.
- Camera tracks from behind to show progress toward +Z visually above the player.

### Source comparison / acquisition decisions

1. Last Survival 3D Gate Runner (licensed Unity paid complete template)
https://assetstore.unity.com/packages/templates/packs/last-survival-3d-gate-runner-mobile-template-404750
Design checklist: four math operators, automatic firing, enemy portals, 50 level configs/10 rounds, 35 prefabs, bosses, weapon categories, persistent three-upgrade economy, rewards. **Status**: inspected public feature list; NO original binary/code copied. Engine incompatible with Babylon.js and purchase/license needed.

2. CrowdRunner (Babylon.js + TypeScript, public repository)
https://github.com/Corical/CrowdRunner
Technical ideas: gate arch timing, bounded instance crowds, three lanes, queued swipe/touch input, adjustable density/speed, pooled effects. **Status**: public source identified. README says ISC, but the scanned root had no LICENSE file and GitHub license metadata was blank; code adoption deferred pending license confirmation. Engine compatible.

3. More-people-runner (Cocos Creator 3.8.8)
https://github.com/yanghuiloong/More-people-runner
Technical ideas: Boids flocking, spatial hash neighbor indexing, difficulty bands recovery/challenge/grinder, procedural obstacle recycling and aggression. **Status**: conceptual reference only. No LICENSE file or GitHub license metadata verified in repository root. Code must not be copied into Defense.

4. Open Runner (Three.js, MIT)
https://github.com/CollinEMac/open-runner
Technical ideas: recycling finite track geometry, distance-based spawn budget, biome transitions, pickups, speed scaling, settings for slower hardware. **Status**: public MIT-licensed code source verified via GitHub metadata, but no direct source files have been imported into Babylon. If ported later, preserve MIT notice.

5. VOID RUNNER (Three.js, MIT)
https://github.com/mheerspink75/void-runner
Technical ideas: escalating 10-wave mix, enemy spawn budget, limited simultaneous units, combo scoring and HUD kill-feed, pool of VFX, cooldown pickups, complete end-run stats. **Status**: license file verified MIT; concepts reviewed. Browser Babylon port will be original code.

6. Babylon.js Sprite Manager
https://doc.babylonjs.com/features/featuresDeepDive/sprites/sprite_manager/
Technical reference: camera-facing transparent PNGs, sprite sheets and reusable SpriteManager draw batching. **Status**: library already integrated in Defense's female crowds.

## Quality gates

- Source licenses and provider terms must be validated **per asset**.
- Node tests validate length, count, ascending encounter positions and data immutable reset.
- GitHub Actions runs JS tests, SVG ban validation and Vite build on every feature commit.
- Desktop and mobile Playwright uses local-only accelerated clock to check >3-minute simulated stage, four barricades, enemy counts, all waves, boss win, restart and camera facing.
- Public GitHub Pages runs at unaccelerated speed and is HTTP checked for actual assets.
- Software-based SwiftShader FPS is not physical-device FPS.
- 8 themes currently change materials and sky color, not fully unique 3D biomes. New enemy animations, portal FX, boss models and meta upgrades remain future work.

## Next integration candidates (not yet claimed implemented)
- Temporary gate charge-up (shooting barrel changes choice value) and weapon-type selection.
- Adaptive difficulty director with lower enemy density when player army is in recovery.
- Stage card generation from section blueprints, elite vs. small boss variations, coins & permanent upgrades.
- Kill combo feedback (no paid gacha and no intrusive ad dependencies).
