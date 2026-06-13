# Kingdom Seed v2.36.4 Audit Guard Patch

## 목적

v2.36.3 안정화 패치 이후 실제 실행 경로를 다시 점검하면서, 모바일 웹뷰/시크릿 브라우저/저장소 차단 환경에서 시작 셸이 멈출 수 있는 연결부를 보강했다.

## 핵심 수정

- `WebShell.ts`의 `localStorage.getItem()` 직접 호출을 안전 래퍼로 변경
  - iOS private mode, 일부 인앱 웹뷰, 저장소 차단 환경에서 시작 화면 자체가 깨지는 위험을 줄인다.
- 시작 오류 메시지에 안전 모드 재시도 버튼 추가
  - `quality=low&compat=1&tapboot=1&noprewarm=1&safe=1` 조합으로 재시도한다.
- 시작 셸 설치를 idempotent 처리
  - HMR/재진입/중복 설치 상황에서 이벤트 리스너와 종료 모달이 중복 생성되는 위험을 줄인다.
- `LaunchDiagnostics.ts` 신규 추가
  - `window.__KINGDOM_SEED_DIAGNOSTICS__`
  - `window.__KINGDOM_SEED_GET_DIAGNOSTICS__()`
  - 부팅/엔진 청크/Phaser 생성/씬 준비/호환성 이벤트를 타임라인으로 기록한다.
- `CompatibilityGuard.ts`의 버전 문자열을 `Version.ts`와 연결
  - 이후 버전 표기가 파일마다 어긋나는 문제를 방지한다.

## 검증

- `npm ci` 성공
- `npm run build` 성공
- Vite 대형 청크 경고는 기존 Phaser/Firebase 청크 구조에서 발생하는 경고이며 빌드 실패는 아니다.

## 실기기 디버그 방법

브라우저 콘솔에서 아래를 실행하면 시작 흐름을 확인할 수 있다.

```js
window.__KINGDOM_SEED_GET_DIAGNOSTICS__()
```

실행이 멈춘 기기에서는 시작 화면의 “안전 모드로 다시 시도”를 먼저 사용한다.
