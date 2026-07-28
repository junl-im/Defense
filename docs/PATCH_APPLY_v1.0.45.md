# Patch Apply v1.0.45

- Base: v1.0.44 / b24.44
- Target: v1.0.45 / b24.45
- Mode: 프로젝트 루트 직접 덮어쓰기

```bash
rm -rf dist
npm ci
npm run verify:release:v145
VITE_BASE_PATH=/Defense/ npm run build
REQUIRE_BROWSER_V144=1 REQUIRE_BROWSER_V145=1 npm run verify:dist:all
npm run stage:package:v145
npm run verify:package:v145
npm run create:patch:v145
npm run verify:patch:v145
```

장시간 결과는 `logs/qa/v145/long-session-report.json`, 성능 비교는 `logs/qa/v145/performance-trend-report.json`에 기록된다. 정적 fallback은 v1.0.17~v1.0.43 복구 계약을 확인할 수 있지만 v1.0.44와 v1.0.45 정식 완성 빌드 승인을 받을 수 없다.
