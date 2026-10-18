# 라니킹덤 v0.9 — 빈 땅 한 번 터치 건설과 컴팩트 모바일 UX

## 실제 구현 (코어 보존)
- 기존 MIT Hexkingdom 기반 Three.js 3D 뷰 그대로. 별도 DOM 마을 전환 없음.
- 비어 있는 3D 건설 허용 영역 선택 시 바로 건설 목록 오픈. 같은 위치를 한 번 더 누르면 닫기.
- 건설 제안은 현재 연구·왕국 등급·자원, 땅 인접 여부·마을 건설 범위를 참조. 잠긴 지형이나 비용이 안 되는 선택은 결제 불가.
- 빠른 추천 예: 숲+벌목장 / 농지+농장 / 산지+광산. 추천이 노출되려면 관련 연구가 끝나야 하고 설치 비용+건축 비용을 합산해 사전 확인. 선택 시 기존 selectTileType → placeTile → BuildingSystem.build 실행. 별도 가짜 보상/가짜 건물 없음.
- 신규 지역을 지형만 설치할 수 있는 기존 선택지도 함께 노출. 설치 완료 후 기존 RadialMenu를 열어 해당 땅의 추가 건물 건설을 바로 지원.
- 이미 건설된 땅의 기존 RadialMenu·전투·강화·시설 관리 기능 보존.
- 모바일 하단 지도/건설/연구/세력/왕국 탭은 같은 버튼 두 번 누르면 지도 복귀, Esc도 지도 복귀. 초보자 전용 별도 메뉴 겹침 제한.
- 모바일 메뉴 높이 64→58px로 줄이고, 버튼의 최소 터치 영역 44px 보장. 태블릿/PC는 기존 UI 그대로. 모바일 마을 승격 메뉴는 원터치로 열리고 다시 터치하면 닫히도록 접음.
- 모바일 3D 타일 건축 RadialMenu는 둥근 화면 중앙 링 대신 하단 3열 콤팩트 메뉴로 변경. 큰 건설 탭을 열지 않아도 상황별 조작 가능.
- PC·모바일 1440×900, 390×844, 320×700 브라우저 QA 및 Node 정적 검사. 기존 세이브/연구/전투/농장 CC0 3D 교체 검사 유지.

## 참고한 인터랙션 연구
- NNGroup 터치 영역: https://www.nngroup.com/articles/touch-target-size/ — 실제 터치 대상은 외형만 작게 하고 최소 충분한 클릭 영역 보장.
- Godot 컨테이너/앵커 레이아웃: https://docs.godotengine.org/en/3.0/getting_started/step_by_step/ui_introduction_to_the_ui_system.html — 높이·화면비 반응형 구성 개념.
- 모바일 도시 건설 게임에서 contextual menu + 최소 탭 이동: https://www.designthegame.com/learning/tutorial/critical-design-elements-mobile-city-builders
- 해당 사이트 코드를 복사하지 않았으며 UX 원칙만 자율 구현.

## 후속 경계
- 빈땅은 실제 그리드의 미배치 프런티어, 건물은 기존 구축된 헥스 지형에서 생성. 빠른 건설은 2단계 경제를 한 화면에서 제어하는 편의 기능이며 새 독립 세이브를 만들지 않는다.
- 모델 로드 실패 시 원본 건물로 복구. 기존 3D/지형 자동 진화/경제/군사 API 수정 금지.
- 사용자 Windows 원본 D:\K-city-webgame\Defense는 GitHub main 병합 후 로컬 fetch/pull 필요.