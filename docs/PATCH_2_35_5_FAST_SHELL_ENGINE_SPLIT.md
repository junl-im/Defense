# PATCH 2.35.5 - Fast Shell Engine Split

## 핵심 개선

v2.35.4에서 BootScene 프리로드를 줄였지만, `main.ts`가 여전히 Phaser를 정적 import하고 있어 첫 접속 시 초기 JS 번들이 약 1.4MB로 유지되었습니다. v2.35.5는 이를 `src/runtime/GameBootstrap.ts`로 분리하고, `src/main.ts`를 HTML 셸 제어 전용 초소형 엔트리로 바꿉니다.

## 구조

- `src/main.ts`
  - CSS와 `WebShell`만 정적 import
  - 첫 페인트 이후 유휴 시간에 엔진 청크 동적 import
  - 사용자 탭이 더 빠르면 즉시 엔진 청크 로드/시작

- `src/runtime/GameBootstrap.ts`
  - 기존 Phaser 게임 생성 로직 이동
  - BootScene, Runtime Governor, PWA, 오디오 unlock, 모바일 런타임 엔진 설치 담당

- `src/platform/WebShell.ts`
  - 사용자 탭 후 씬이 아직 준비되지 않았으면 시작 게이트를 강제로 제거하지 않도록 변경
  - 동적 엔진 로드 중 검은 화면이 보이지 않도록 시작 게이트 유지

## 빌드 결과

`npm run build` 통과.

초기 JS 크기 변화:

- v2.35.4 `index-*.js`: 약 1.46MB
- v2.35.5 `index-*.js`: 약 16.46KB

Phaser는 별도 `phaser.esm-*.js` 청크로 분리됩니다. Vite의 대형 청크 경고는 Phaser 벤더 청크에 대한 경고이며, 초기 HTML 셸 표시를 막는 기존 문제와는 분리되었습니다.

## 검수 옵션

- 기본 주소: 첫 페인트 이후 엔진 유휴 프리부팅
- `?tapboot`: 사용자가 탭하기 전까지 엔진 로드 금지
- `?coldboot`: `?tapboot`와 같은 초저속 검수 모드
- `?autostart`: 자동 시작 검수
