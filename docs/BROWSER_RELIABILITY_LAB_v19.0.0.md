# Browser Reliability Lab v19.0.0

## 목적

Ten-Wave Reliability v18의 전투 상태 복구 위에 브라우저 자체의 부팅, 캐시, 페이지 수명주기, WebGL 컨텍스트, 장시간 작업과 메모리 변화를 감시하는 계층을 추가한다.

## 런타임 감시

- 부팅 완료 시간
- 스크립트 오류와 미처리 Promise
- 이미지·모듈 등 리소스 로딩 실패
- WebGL context lost / restored
- 페이지 숨김·복귀와 BFCache 복원
- 온라인·오프라인 전환
- 120ms 이상 Long Task
- 지원 브라우저의 JS Heap 사용량
- DOM 노드, 드로콜, 삼각형, 텍스처, 전투 개체 수 표본

진단 저장 키는 `dokkaebi-browser-reliability-v19`이다. F7은 즉시 표본을 저장하며 F6 통합 진단에도 전체 보고서가 포함된다.

## 캐시 구조

v18까지의 매 접속 전체 캐시 삭제 방식을 제거했다. v19 서비스 워커는 `dokkaebi-shell-v19.0.0` 캐시를 사용한다.

- HTML 내비게이션: network first, 실패 시 캐시
- 이미지·GLB: cache first, 검색 파라미터 무시 복구
- JS·CSS·JSON: network first, 실패 시 캐시
- 이전 `dokkaebi-shell-*` 캐시만 활성화 시 정리
- `DOKKAEBI_GET_VERSION` 메시지로 실행 버전 확인
- `DOKKAEBI_PURGE` 메시지로 명시적 복구
- 자동 unregister·강제 navigate 루프 금지

## 자동화 API

게임 부팅 후 `window.__DOKKAEBI_TEST_API__`가 제공된다.

- `snapshot()`
- `startRun()`
- `startWave()`
- `chooseRecommendedReward()`
- `reliabilityReport()`

브라우저 자동화 도구가 내부 객체를 직접 수정하지 않고 공개된 테스트 계약만 사용할 수 있다.

## 브라우저 실행 검사

```bash
npm run browserlab:v1900
```

검사는 정적 배포본을 로컬 HTTP 서버로 열고 Chromium에서 다음을 확인한다.

1. index/style/main/타이틀 이미지의 실제 HTTP 로딩
2. DOM 타이틀·시작 버튼 계약
3. Cache API put/match/delete
4. 서비스 워커 버전 응답
5. 실제 게임 페이지 부팅 또는 컨테이너 GPU 차단 원인

현재 컨테이너가 EGL/WebGL을 제공하지 않으면 셸·캐시 검사는 통과시키고, 실제 WebGL 게임 부팅은 환경 제한으로 별도 기록한다.
