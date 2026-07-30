# Patch Notes v1.0.51

## Modern character presentation

Approved character artwork now receives a runtime presentation stack made from contact grounding, a dark depth silhouette, a directional key-light pass, the existing action rim, and bounded motion afterimages. The source artwork is not repainted or reclassified as newly approved final art.

## Quality-aware rendering

Economy, balanced, and cinematic profiles control afterimage count, secondary-layer distance, persistent lighting, and monster-layer suppression. Crowded or sustained-pressure battles automatically remove monster secondary layers before hero, guardian, and boss readability is reduced.

## Transparent atlas quality

Character atlas clones now use premultiplied alpha, stronger alpha thresholds, available anisotropy, sRGB color space, and dithering to reduce bright borders and unstable edges when scaled or rotated.

## PBR character materials

Imported hero, guardian, monster, and boss meshes receive bounded roughness, metalness, environment response, emissive support, and a low-cost soft rim shader. Low-power devices skip the shader injection while retaining safe material bounds.

## Approval boundary

This update adds no new final character-art approvals. Existing approved and provisional asset lineage remains unchanged; the improvement is an engine-side presentation upgrade.

## Repository-root repair revision

The R3 delivery is archive-root flat, removes stale root patch metadata, deletes legacy root `overlay/` without merging it, and verifies that stale `package.json@1.0.46` content cannot downgrade the v1.0.51 identity.


## CI long-session repair R4

- Fixed the v1.0.46 100-wave browser assurance regression observed under SwiftShader.
- Character presentation v1.0.51 is now fail-open per visual record: an optional silhouette, rim, contact-shadow, or afterimage failure disables only that enhancement while the legacy combat-art update remains active.
- Added a deterministic five-window boss load profile for waves 10, 25, 50, 75, and 100. This is QA-only and does not alter the campaign boss schedule at waves 4, 7, and 10.
- Added retained runtime error entries and browser exception details to v1.0.46 failure output.
- Added `verify:long-session-hotfix:v151` to prevent regression of the load profile and presentation fallback contract.

## R5 CI stale-run proof guard

- Adds `DD-V151-LONG-SESSION-R5` source revision marker before dependency installation and before the dist verification chain.
- Verifies SHA-256 for the v1.0.46 long-session runner, v1.0.51 fail-open presentation runtime, QA load profile, workflow, and package scripts.
- A pre-R4 runner now fails immediately instead of spending five minutes producing an indistinguishable historical failure.
- The long-session quality thresholds remain unchanged.

## R6 enemy material lifecycle repair

- Fixes the confirmed wave-10 runtime error `Cannot read properties of null (reading 'material')` from the enemy update stage.
- Imported enemy models now recover their primary renderable from `body`, `Body`, `Torso`, `Chest`, `Pelvis`, `Head`, or the first mesh with a usable material.
- Multi-material meshes are supported; emissive color and intensity changes are applied safely to every usable material.
- All release-critical enemy combat paths now use the lifecycle helper instead of directly reading `enemy.group.userData.body.material`.
- The primary enemy body is resolved before combat-art presentation layers attach, then cached for pooled enemy reuse.
- Adds a dependency-free regression verifier covering null body recovery, unnamed mesh fallback, multi-material mutation, direct-access prohibition, and all three boss GLB body nodes.
- CI source marker advances to `DD-V151-ENEMY-MATERIAL-R6` without relaxing the zero-runtime-error threshold.
