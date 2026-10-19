# 라니킹덤 v3.1 — 실제 왕실 도로·마을 진입로 연결 3D 디테일

## 적용 목표
- 별도의 가짜 지도나 자원/교통 시스템을 새로 만들지 않고, **기존 실제 게임 AutoMesh 도로 연결 네트워크**에 조약돌 도로 연석과 청색/금장 표지 기둥을 연결해 마을과 도로의 자연스러운 연속성을 강화한다.
- 이전 사용자 승인 독립 PNG·WebP 10종, 로고·지형 아틀라스·Quaternius GLTF 4종 총 16종 자산의 SHA-1 체크섬 검사 유지. SVG 금지, 합성 이미지 자르기 금지.

## 변경 내역
1. `src/rendering/RoyalStreetConnectionArt.js` 신규: `makeRoyalConnectedRoadside(cell,connectedMask)`는 이전 `RoadSystem`을 복제하지 않고 **AutoMesh의 실제 `variant.mask`**, `cell.roadEdges`만 참조한다. 실제 연결된 길은 육각 경계까지 연석/길드 청색·금장 표지, 연결 안 된 길 끝은 기존 0.6 길이의 정지 표시 구조를 따른다. 실제 강·호수 위로 길가 가로등을 세우지 않는다.
2. 동일 모듈 `makeRoyalConnectedVillageGate(cell,connections)`: 도로가 실제로 마을/성에 연결돼 `village/castle` AutoMesh가 반환한 진입구만 작업. 이전 입구의 석재 기둥 위에 왕실 청색·금장 상단을 더하고, 진입로에 석판 2개를 배치한다. 연결 안 된 면에는 진입문을 그리지 않는다.
3. 기존 `src/automesh/MeshVariants.js`의 **원래** `roadBuilder` 와 `villageBuilder` 내부에 **이전 왕실 조약돌/옛 길/표시 전체 유지**한 채, 경로별 신규 메시 1개만 덧붙인다. 네트워크 연결이나 원래 오버레이 회전 마스크가 바뀌면 기존 `AutoMeshSystem`이 자동으로 이전 메시를 dispose하고 새 모양을 갱신. 추가 저장 포맷·로드 규칙·건축 자원·도로 보너스에 영향 없음.
4. 새로운 장식은 기존 `Materials.js` 팔레트/재질을 사용한 vertex-color 병합 단일 메시, 셀 클릭 우선권 보호 `raycast=()=>{}`, GPU geometry는 AutoMesh 기존 `disposeOverlay`가 관리. 원래 왕실 도로 포장 `makeRoyalRoadPaving`과 기존 모든 성·건물·항구·필드·왕실 UI를 보존.

## 검사 기준
- 신규 `scripts/check-royal-street-v31.mjs`: 16개 원본 잠금, v3.0 회귀 보존, 별도 RoadSystem 복제 없음, 실제 도로·마을 AutoMesh callback 경로 및 SVG 부재.
- 신규 `scripts/qa_royal_street_v31.py`: 실제 Chromium **PC1440×900, 노트북1024×768, 모바일390×844, 소형320×700**에서 별도 메모리 테스트 그리드로 실제 `AutoMeshSystem` + `AutoMeshAdapters`를 등록해 실제 길→마을/연결된 양방향 길을 렌더링, 연결을 해제했을 때 기존 시스템의 마스크/마을 진입로가 즉각 바뀌는 것 검증. 원래 게임 본판의 그리드/자원은 **절대 변경하지 않음**, 기존 v2.9 3D 광장·자원 HUD·SVG DOM 0·JS 예외 0 확인.
- 기존 v0.1~v3.0 전체 JS·브라우저·군사·경제·건축·저장 및 원본 16종 자산 보호 회귀 검증 보존. GitHub PR 2개 검사 **전부 성공**한 뒤 main 병합, GitHub Pages 배포와 main 자체 브라우저 검사 별도 확인.

## 남아 있는 목표
- 현재 실제 건설된 도로/마을에만 새 왕실 진입로가 보이며, 임의의 빈 들판이나 아직 건설하지 않은 도로를 가짜로 그리지 않는다. 수백 건물이 밀집된 왕실 도시나 레퍼런스 전체 바다·NPC·선박 크기를 한 번에 구현한 것은 아니다.
- 신규 **각개 투명 PNG 아이콘**은 이번 패치에서 새로 만들지 않았다. 사용자가 이전에 반대한 대형 시안 그림을 잘라 에셋으로 쓰지 않는다.
- 물리 Android/iOS GPU/FPS·발열 실측은 아직 별도 필요.
