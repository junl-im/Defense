# Release Assurance v1.0.46

## Scope

- Replay sanitized iOS Safari standalone PWA and Android Chrome viewport traces through the production mobile HUD and input-reset models.
- Simulate a two-release service-worker cache upgrade and prove that client save namespaces are not mutated during controller replacement.
- Observe deterministic real-combat load windows at waves 10, 25, 50, 75, and 100.
- Produce a machine-readable digest naming the first regressing sample, wave, metric, actual value, and limit.
- Export the first v1.0.45 Vite dist measurement candidate without inventing missing historical values. Until approval, the v1.0.44 absolute envelope remains mandatory.

## Approval boundary

A static fallback may preserve the recovery deployment lineage through v1.0.43, but v1.0.46 approval requires `assets/game.js`, `assets/game.css`, the current service worker, and the browser assurance run.
