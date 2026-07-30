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

