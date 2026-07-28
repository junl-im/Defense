# Next Update v1.0.45

- Add a deterministic long-session harness that advances the complete game through 100 waves while sampling frame time, heap, renderer textures, geometries, and context restore events.
- Add iOS Safari standalone-PWA restore fixtures and Android Chrome address-bar/keyboard viewport traces captured from real devices.
- Split startup and deferred combat assets so the initial texture upload budget measures actual first-frame residency rather than conservative string reachability.
- Add budget trend comparison against the previous approved build and fail unexplained regressions above 5% even when absolute ceilings are not exceeded.
- Convert dynamic runtime asset catalogs to explicit generated reachability edges so retained fallback models no longer appear as conservative review candidates.
