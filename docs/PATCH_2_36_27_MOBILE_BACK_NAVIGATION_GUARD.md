# v2.36.27 MOBILE BACK NAVIGATION GUARD

## 목표

모바일 웹에서 Android/브라우저 뒤로가기 버튼이 곧바로 웹페이지 이탈로 이어지는 문제를 게임 UX에 맞게 교정한다.

- 게임 중 뒤로가기 1회: 웹페이지 뒤로가기가 아니라 게임 첫 화면으로 이동
- 첫 화면에서 뒤로가기 1회: 게임 종료 확인 팝업 표시
- 종료 확인 팝업이 떠 있는 상태에서 뒤로가기 1회 추가: 브라우저 이탈 허용
- 종료 버튼 탭: 보호 저장 이벤트 후 브라우저 이탈 시도
- 계속하기 탭: 팝업 닫고 게임 유지

## 주요 변경

- WebShell history guard를 씬 인식형 back command로 변경
- Phaser 런타임에 `__KINGDOM_SEED_BACK_NAVIGATOR__` 브리지 추가
- 활성 씬이 `MenuScene` 또는 `MainMenuScene`이면 종료 확인 팝업을 표시
- 그 외 씬에서는 `MainMenuScene`으로 안전 이동
- `MainMenuScene` 로드 실패 시 `MenuScene` 폴백
- 뒤로가기로 홈 이동할 때 `kingdom-seed:emergency-save` 이벤트를 먼저 발행
- 홈 이동 토스트 추가
- 모바일 기본 UI 밀도를 `clean`에서 `focus`로 낮춰 전장/핵심 액션을 더 잘 보이게 조정

## UI 정리 방향

이번 패치는 장식 추가가 아니라 정리 중심이다.

- 모바일 기본값에서 보조 UI 밀도를 더 낮춤
- 기존 `?cleanui`, `?focusui`, `?essentialui`, `?legacyclutter`, `?fullhud` 비교 옵션 유지
- 뒤로가기 UX를 게임 네비게이션으로 통일
- 첫 화면 종료 확인은 WebShell DOM 팝업으로 제공해 Phaser 씬 로딩 실패 상태에서도 동작

## 안전 정책

- 새 대용량 이미지 없음
- 새 atlas 없음
- 새 사운드 없음
- BootScene 프리로드 증가 없음
- Firebase/PWA/오디오 지연 처리 유지
- 전투 중 heavy art streaming 금지 유지
- 뒤로가기 홈 이동 중 scene chunk 실패 시 현재 씬 유지 및 navigation-error 안내

## 검수 권장

- Android Chrome: 전투 중 뒤로가기 → 로비로 이동
- Android Chrome: 로비에서 뒤로가기 → 종료 확인 팝업
- 팝업 표시 중 뒤로가기 → 페이지 이탈 시도
- 팝업 표시 중 계속하기 → 게임 유지
- `?legacyclutter`, `?focusui`, `?essentialui` 비교
