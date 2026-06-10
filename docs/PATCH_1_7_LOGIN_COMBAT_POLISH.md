# Kingdom Seed v1.7.0 패치

## 목적

v1.6에서 발견된 로그인 첫 화면의 베이크 이미지 의존 문제를 줄이고, 전투 HUD/타워 선택 UI를 한 단계 더 고퀄 에셋 중심으로 정리한다.

## 적용 내용

- 버전 `1.7.0` 갱신
- 로그인 첫 화면 신규 에셋 추가
  - `public/assets/backgrounds/login_screen_v1_7.png`
- 로그인 화면 정리
  - 좌측 상단 구버전 베이크 텍스트 영역을 코드 버전 칩으로 분리
  - 하단 `STATUS` 베이크 버튼 노출 제거
  - 중앙 로그인 패널을 새로 베이크해 prototype 글자/버튼 잔상 노출을 줄임
  - 빠른 시작 / Google / 이메일 / 회원가입 클릭 영역을 v1.7 버튼 위치에 재정렬
  - 우측 상단 공지사항 / 고객센터 / 설정 클릭 영역 재정렬
- 전투 화면 에셋 추가
  - `public/assets/ui/v1_7/combat_top_hud_v1_7.png`
  - `public/assets/ui/v1_7/combat_bottom_dock_v1_7.png`
  - `public/assets/ui/v1_7/tower_build_menu_v1_7.png`
  - `public/assets/ui/v1_7/tower_build_card_v1_7.png`
  - `public/assets/ui/v1_7/tower_command_panel_v1_7.png`
  - `public/assets/ui/v1_7/build_spot_v1_7.png`
  - `public/assets/ui/v1_7/button_*_v1_7.png`
- 전투 화면 정리
  - 상단 HUD를 v1.7 에셋으로 교체
  - 하단 스킬 독을 v1.7 에셋으로 교체
  - 건설 가능 지점을 수정/보석 베이스 에셋으로 표시
  - 타워 건설 메뉴/카드/선택 패널을 v1.7 에셋으로 교체
  - 타워 선택 패널의 스탯 텍스트 대비를 개선

## 검증

- `npx tsc --noEmit` 통과
- `npm run build`는 컨테이너의 Vite/Rolldown optional native binding 누락으로 실패했다. 로컬에서는 `npm install` 후 빌드 확인 필요.
