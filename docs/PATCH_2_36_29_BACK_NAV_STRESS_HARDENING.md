# KingdomSeed v2.36.29 Back Nav Stress Hardening

## 목적

v2.36.27~v2.36.28에서 도입한 모바일 뒤로가기 가드와 UI QA 레이어를 실제 모바일 웹뷰/브라우저 상황에 더 안전하게 맞춘 안정화 패치입니다.

## 핵심 변경

- Android WebView/일부 모바일 브라우저에서 한 번의 뒤로가기 제스처가 중복 `popstate`로 들어오는 경우를 보호합니다.
- 종료 확인 팝업이 뜬 직후 420ms 안의 중복 back echo는 두 번째 종료 입력으로 계산하지 않습니다.
- popstate 처리 시 history guard를 즉시 재무장하고, 짧은 지연 재무장을 한 번 더 걸어 이탈 창을 줄였습니다.
- 첫 화면 이동 요청 시 종료 팝업 상태를 명확히 초기화합니다.
- 종료/계속하기 버튼 처리 후 팝업 타이밍 상태를 초기화합니다.
- UI audit이 숨겨진 컨테이너/투명 부모의 텍스트와 버튼을 실제 위험으로 오판하지 않도록 effective visibility 판정을 추가했습니다.
- UI audit badge 위치를 캔버스 폭에 맞게 보정하여 작은 화면에서 오른쪽 밖으로 밀리는 문제를 줄였습니다.

## 유지 정책

- 뒤로가기의 의미는 계속 “게임 첫 화면으로 이동”입니다.
- 첫 화면에서 뒤로가기 1회는 종료 확인 팝업입니다.
- 종료 팝업이 안정적으로 보인 뒤 뒤로가기 1회 또는 종료 버튼은 emergency save 후 이탈 시도입니다.
- 새 대용량 이미지/atlas/sound는 추가하지 않았습니다.
- BootScene 프리로드 증가 없음.
- Firebase/PWA/오디오 지연 정책 유지.

## 점검 권장

- 기본 주소에서 전투 진입 후 Android 뒤로가기 → 첫 화면 이동.
- 첫 화면에서 뒤로가기 → 종료 확인 팝업.
- 팝업이 뜨자마자 중복 popstate가 와도 즉시 종료되지 않는지 확인.
- 팝업 표시 후 다시 뒤로가기 → 종료 시도.
- `?uiaudit&navqa`로 audit badge가 화면 안에 머무는지 확인.

## 수정 파일

- `src/platform/WebShell.ts`
- `src/game/MobileUiAudit.ts`
- `src/runtime/Version.ts`
- `package.json`
- `package-lock.json`
- `index.html`
