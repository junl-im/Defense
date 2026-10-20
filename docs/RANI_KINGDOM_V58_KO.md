# 라니킹덤 v5.8 — 건물 설치 바닥 경계선 및 실자원 중심의 쉽게 쓰는 건설 (2026-10-20)

## 실제 변경
- 기존 Fiefdom `Placement.check()` 및 `BUILDINGS[name].footprint`와 게임 `iso.worldToScreen()`을 단일 기준으로 2D 투명 Canvas에 현재 건물의 **정확한 가로·세로 타일 바닥 외곽선**을 그린다. 실제 설치 가능=연두색, 불가능=빨강. 카메라 회전·이동·줌·DPR 대응. SVG 추가 없음. 실제 건설 판정, 소유권·충돌·자원 규칙은 변경하지 않음.
- 육각 건물 메뉴 강화/수리 버튼은 기존 체크의 '단계·손상'뿐 아니라 **실제 현재 목재·석재 보유량**도 포함하여 보이거나 숨는다. 부족하면 어떤 자원이 얼마나 필요한지를 상단 이유 안내로 표시. 기존 강화·수리 비용 및 저장 호환 유지.
- 실건물 상태 기반 첫걸음 4단계(주택, 벌목장, 밀 농장, 시장)의 `목표 건물 선택` 버튼은 원본 `#buildmenu button[data-name]`을 클릭하여 게임의 실제 배치/하이라이트 시스템으로 직결. 건설 메뉴 열기 별도, 가이드 완료·닫기 후 도움말로 다시 열기, 접힘 상태 로컬 저장.
- 기존 v5.7 로고, 영주→지역 선택, 저장 불러오기, 육각 건축 메뉴 정상 유지. 2.5D 600초 게임·PC/모바일·브라우저 검사에 v5.8 검증 추가.

## 외부 기술 검토
- 화면 위치 정합은 Three.js 카메라 3D→2D 투영 패턴을 따르되 기존 게임 `iso.worldToScreen`을 재사용하여 게임 월드 좌표와 CSS 화면 좌표를 2벌로 만들지 않는다. 확대·DPR 대응 가이드 참고: https://salivity.github.io/three.js/article/convert-3d-coordinates-to-2d-screen-space-in-three-js , https://threejs.org/manual/pages/responsive.html .
- 배치가 안 될 때 거절만 하는 것이 아니라 원인을 보여주는 도시 건설 게임 UX 원칙 참고: https://darkbeast.co/journal/city-building-game-development . 외부 소스 코드를 재사용하거나 라이선스 전환하지 않음.

## 상태
- 별도 브랜치 `feat/rani-v58-builder-precision-guide`에서 CI 검사 후 main 통합 예정. 검증 전 공개판 적용 주장은 금지.
