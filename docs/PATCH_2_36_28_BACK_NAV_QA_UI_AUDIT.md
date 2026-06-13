# KingdomSeed v2.36.28 BACK NAV QA AND UI AUDIT

## 목적

v2.36.27의 모바일 뒤로가기 가드를 실제 운용 관점에서 다시 점검하고, 시작 게이트/첫 화면/전투/서브 화면의 이탈 방지 흐름을 더 단단하게 보강한다. 동시에 이후 UI 정리 작업을 감으로 하지 않도록, 모바일 시안성/터치성 QA 계측 레이어를 추가한다.

## 뒤로가기 보강

- 모바일에서는 시작 게이트 단계에서도 history guard를 조기에 arm 한다.
- 첫 탭 전이라도 뒤로가기로 즉시 웹페이지를 이탈하지 않도록 종료 팝업을 띄울 수 있게 보완했다.
- 이미 guard state 위에 있을 때 중복 pushState를 반복하지 않도록 방지해 history stack 오염을 줄였다.
- 전투/월드맵/서브 씬에서는 기존처럼 첫 화면 이동을 우선한다.
- 첫 화면 또는 시작 게이트에서 뒤로가기를 누르면 종료 확인 팝업을 띄운다.
- 종료 팝업이 떠 있는 상태에서 뒤로가기를 한 번 더 누르거나 종료 버튼을 누르면 emergency-save 이벤트 후 브라우저 이탈을 시도한다.

## UI 점검 레이어

- `MobileUiAudit.ts` 추가.
- 각 씬의 Text / interactive target / 텍스트 겹침 상태를 지연 점검한다.
- 기본 모드에서는 조용히 `kingdom-seed:ui-audit` 이벤트만 발행한다.
- `?uiaudit`, `?readabilityaudit`, `?touchaudit`, `?navqa`에서는 작은 QA badge를 화면에 표시한다.
- 이 레이어는 새 이미지/atlas/sound를 추가하지 않고 Phaser Graphics/Text만 사용한다.

## 새 검수 옵션

- `?uiaudit`
- `?readabilityaudit`
- `?touchaudit`
- `?navqa`
- `?nouiaudit`
- `?legacyuiaudit`

## 안전 정책

- BootScene 프리로드 증가 없음.
- Firebase / PWA / 오디오 지연 정책 유지.
- reference art / reward pipeline / fallback system 유지.
- 전투 중 heavy art streaming 금지 유지.
- 모바일 뒤로가기 처리는 실제 Android/iOS 브라우저에서 최종 체감 검수가 필요하다.

## 검증

- `npm ci` 성공.
- `npm run build` 성공.
- Vite preview `/` HTTP 200 확인.
- Vite preview `/?uiaudit&navqa` HTTP 200 확인.
