# Patch Notes v1.0.44

- Runs mobile layout regression against the complete Vite-built game rather than the isolated v1.0.43 input fixture.
- Captures portrait, landscape, left-handed, and 150% zoom combat screenshots through Chromium DevTools Protocol.
- Requires the actual game to boot and enter combat before summon visibility and touch-layout assertions are accepted.
- Adds measured JavaScript chunk, initial JS/CSS gzip, request-count, and initial texture upload budgets.
- Reviews all 24 conservative v1.0.43 asset candidates and records zero automatic deletion approvals.
- Makes the v1.0.43 CSS deployment gate resilient to comment stripping and common transparent-color minification.
- Preserves mobile pointer recovery, retired legacy loading presentation, and the authored random summon emblem.
- Hardens the Chromium runner with official SwiftShader opt-in flags, bounded CDP/boot timeouts, per-scenario progress, failure screenshots, console/network diagnostics, and race-safe profile cleanup.
- Reports managed-browser localhost blocking as an explicit environment failure instead of timing out or producing an unhandled rejection.
