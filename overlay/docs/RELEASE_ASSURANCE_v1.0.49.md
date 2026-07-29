# Release Assurance v1.0.49

The v1.0.49 release gate requires:

- package-canonical generated identity freshness, including root and package-lock metadata;
- pre-install CI identity synchronization and explicit rejection of stale `package.json` versions;
- transactional persistence coalescing, journal recovery, lifecycle flush, and failed-flush retention;
- separation of user recovery copy from bounded developer diagnostics;
- deterministic result presentation extracted from runtime orchestration;
- production-default QA API suppression and explicit-QA opt-in;
- sorted build-input SHA-256 manifest freshness;
- source performance and module-size budgets, with historical release scopes excluding forward modules;
- complete Vite output plus Chromium feature-exposure evidence in CI;
- hash-verified clean source-package staging and direct-root overlay application.

The browser result is written to `logs/qa/v149/feature-exposure-report.json`.

## v145 CI measurement calibration hotfix

The v1.0.49 gate also distinguishes hardware performance from explicitly detected software-renderer CI baselines. Hardware and unknown renderers retain the original absolute frame/long-task limits. SwiftShader/llvmpipe sessions use bounded baseline-relative frame and long-task-rate regression checks, while incomplete or timed-out frame windows always fail. Runtime, WebGL recovery, heap, texture, and geometry limits remain unchanged.
