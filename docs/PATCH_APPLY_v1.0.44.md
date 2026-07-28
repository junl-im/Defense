# Patch Apply v1.0.44

## 기준

- Base: v1.0.43 / b24.43
- Target: v1.0.44 / b24.44
- 적용 방식: 패치 ZIP의 내용을 프로젝트 루트에 그대로 덮어쓴다.

## 적용 후 실행

```bash
rm -rf dist
npm ci
npm run verify:release:v144
VITE_BASE_PATH=/Defense/ npm run build
REQUIRE_BROWSER_V144=1 npm run verify:dist:all
npm run create:patch:v144
npm run verify:patch:v144
```

브라우저 매트릭스 결과와 PNG는 `logs/qa/v144/`에 생성된다. CI가 아닌 브라우저 미설치 환경에서는 `REQUIRE_BROWSER_V144=1`을 지정하지 않으면 명확한 SKIP으로 종료한다. 정식 배포 게이트에서는 반드시 1로 설정한다.

## 브라우저 진단

실패 시 `logs/qa/v144/mobile-matrix-report.json`에서 탐색 오류, 콘솔, 런타임 예외, 실패 요청, 부트 진단을 확인한다. `net::ERR_BLOCKED_BY_ADMINISTRATOR`는 프로젝트 오류가 아니라 실행 브라우저의 URL 관리 정책이 loopback HTTP를 차단한 상태이므로, CI 브라우저 정책에서 `http://127.0.0.1:*` 접근을 허용해야 한다.
