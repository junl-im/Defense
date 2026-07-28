# CI v1.0.44 Mobile Matrix Hotfix — v1.0.46

## 증상

완성 Vite 배포 검증에서 landscape는 통과했지만 portrait, left-handed, zoom-150 프로필이 실패했다.

## 직접 원인

1. 과거 모바일 규칙의 `#summon-btn { width: 78px; }`가 v23 HUD의 63px 그리드 트랙보다 우선하여 세로 화면에서 소환 버튼 오른쪽이 viewport를 약 10px 초과했다.
2. cross-platform shell의 `right: ... !important`가 왼손 모드의 일반 선택자를 덮어 action dock이 오른쪽에 남았다.
3. Chromium mobile emulation과 `maximum-scale=1` 조합에서는 `Emulation.setPageScaleFactor`가 무시되어 zoom-150 검사가 실제 확대를 만들지 못했다.

## 수정

- v23 action dock의 모든 버튼을 `width: 100% !important`로 그리드 트랙 안에 제한했다.
- mobile shell의 왼손 action dock과 joystick에 명시적인 좌우 반전 `!important` 계약을 추가했다.
- zoom-150은 좁은 desktop page-scale emulation과 touch emulation을 결합하고, QA 페이지에서만 viewport 확대를 임시 허용한 뒤 1.5배를 적용한다.
- 실패 시 `failedChecks`와 viewport/summon/dock geometry를 CI 로그에 즉시 출력한다.
- `verify:matrix-contract:v144` 소스 회귀 검사를 추가했다.

## 검증

- Chromium inline geometry: portrait, landscape, left-handed, zoom-150 모두 통과
- portrait summon rect: right 424.96 / viewport 430
- left-handed dock: left 9px
- zoom-150 visualViewport scale: 1.5
- zoom-150 summon target: 45.36 × 69.12px
- 전체 `npm run verify:ci` 통과
