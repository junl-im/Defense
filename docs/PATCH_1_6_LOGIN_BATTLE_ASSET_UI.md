# Patch v1.6.0 - Login Refinement + Battle Asset UI Pass

## 목적

v1.3 로그인 화면이 전체 원화 스크린샷에 너무 의존하면서 생긴 문제를 정리했습니다.

- 좌측 상단에 박혀 있던 구버전 텍스트가 이미지에 고정 노출되던 문제 정리
- 하단/패널 영역이 실제 버튼 기능과 어긋나던 문제 정리
- 우측 상단 공지사항/고객센터/설정 버튼의 클릭 영역 재정렬
- 전투 화면 HUD와 타워 선택/건설 패널을 코드 도형 중심에서 이미지 에셋 중심으로 전환

## 로그인 화면

신규 에셋:

- `public/assets/backgrounds/login_screen_v1_6.png`

구성 방식:

- 배경/로고/패널/버튼 비주얼은 정리된 고퀄 합성 이미지 사용
- 로그인 상태 문구는 코드 텍스트로 관리
- 클릭 영역은 이미지 기준 좌표에 맞춰 재정렬
- 버전 표기는 더 이상 이미지에 고정된 텍스트에 의존하지 않음

## 전투 HUD

신규 에셋:

- `public/assets/ui/v1_6/combat_top_hud_v1_6.png`
- `public/assets/ui/v1_6/combat_bottom_dock_v1_6.png`

적용 내용:

- 상단 생명/골드/웨이브/스테이지/진행 버튼 영역을 에셋 배경 중심으로 변경
- 하단 스킬/공세 정보 독을 에셋 배경 중심으로 변경
- 수치와 쿨타임은 기존처럼 코드로 실시간 갱신

## 타워 선택 / 타워 커맨드

신규 에셋:

- `public/assets/ui/v1_6/tower_build_menu_v1_6.png`
- `public/assets/ui/v1_6/tower_build_card_v1_6.png`
- `public/assets/ui/v1_6/tower_command_panel_v1_6.png`
- `public/assets/ui/v1_6/button_blue_v1_6.png`
- `public/assets/ui/v1_6/button_gold_v1_6.png`
- `public/assets/ui/v1_6/button_red_v1_6.png`
- `public/assets/ui/v1_6/button_green_v1_6.png`
- `public/assets/ui/v1_6/button_dark_v1_6.png`

적용 내용:

- 건설 메뉴 프레임/카드를 이미지 에셋으로 교체
- 기존 타워 역할 아이콘 에셋을 건설 카드에 배치
- 타워 선택 패널을 이미지 에셋 기반 커맨드 패널로 교체
- 패널 버튼도 이미지 에셋 기반으로 변경

## 검증

- `npx tsc --noEmit` 통과
- 로컬에서는 패치 적용 후 `npm install && npm run build`로 확인 권장
