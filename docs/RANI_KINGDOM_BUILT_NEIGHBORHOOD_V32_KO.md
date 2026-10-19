# 라니킹덤 v3.2 — 실제 건물 완공에 반응하는 왕실 거리 생활 장식

## 목표
- 건물 주변이 텅 빈 느낌을 줄이되, **실제로 플레이어가 지은 건물만** 거리 장식의 근거로 사용. 마을 이름만 가진 빈 칸이나 적 소유 지역에 가짜 집/상점 생성 금지.
- 이전 승인 **개별 원본 PNG 10종 + 게임 WebP 10종 + 원래 로고/지형 아틀라스/GLTF 4종** 지문 보호 유지. SVG·대형 시안 이미지 잘라쓰기·임시 복제 지도 금지.
- 화면만 꾸미는 코드가 건설비, 생산, 시간, 연구·세력·교역·저장 데이터를 바꾸지 않도록 별도 렌더링 시스템 유지.

## 실제 게임 코드 구현
1. `src/rendering/RoyalBuiltNeighborhoodArt.js`: `BuildingSystem`의 완료 기록 `rec.id,rec.slot,rec.pos,rec.done,rec.visual.done`만 사용해 완공 건물 바로 바깥쪽에 **실제 3D 조약돌 진입로, 낮은 석재 화단, 금장·청색 거리 표식** 배치. 추가 주택/시장/건물을 그리거나 건축 슬롯을 늘리지 않음.
2. 동일 타일에 실제 완공 건물 1~2개가 있더라도 **그 타일에 추가 메시 1개만** 만들도록 여러 소품을 `merge(parts)`로 버텍스 색상 배치. 기존 왕궁·길·주택의 선택을 가로채지 않도록 `raycast=()=>{}`; 그림자 캐스팅 제외.
3. `src/rendering/RoyalBuiltNeighborhoodSystem.js`: 기존 `BuildingSystem.buildingsOn(cell)` 읽기만 수행. **건설 명령과 건물 완공 애니메이션 모두 끝난 후** `building:complete` 이벤트에 맞춰 거리 장식 추가. 건물 변경 `buildings:changed` 이벤트에서 중복·취소를 체크하고, 적이 점령하거나 새 게임 시작 시 장식 제거. **동일 건물·좌표 서명 비교**로 쓸데없는 GPU 재생성을 피함. 삭제·갱신 때 해당 비공유 지오메트리만 정리.
4. `src/core/Game.js`: `_restoreOrStart()` 이후, 기존 `VillageBuildingArt` 바로 다음에 새 렌더러를 설치하여 기존 저장에서 즉시 완료된 건물 주변 장식도 동일하게 복원. `SaveSystem` JSON과 `BuildingSystem` 데이터 구조 변경 **0**.
5. 기존 v3.1 진짜 도로·마을 출입구, v3.0 7종 시설 완공 3D, v2.9 왕실 명령 UI와 광장, v2.8 항만 3D, 원본 10종 래스터 UI 모두 보존.

## 자동 검증
- `scripts/check-built-neighborhood-v32.mjs`: 기존 16개 원본 지문 계약 및 PNG 10/10, 실제 게임 생성/저장·건축 완료 단계 정보 연결, 새 렌더러에 세이브/경제 변경 없음 검사.
- `scripts/qa_built_neighborhood_v32.py`: **실제 Chromium PC 1440×900·노트북 1024×768·모바일 390×844·소형 320×700**. 본판 게임 초기화 후 독립적인 메모리 테스트 마을에 실제 Three.js와 EventBus를 사용하여 착공/건설 완료 직전/완공/같은 이벤트 중복/건물 2개/적군 점유/플레이어 회복/건물 취소·완료된 장식 지오메트리 해제/원본 게임 저장값·본판 HUD 보존/리로드/JS·SVG 오류 검사 및 캡처.
- 이전 v0.1~v3.1 회귀 검사·모바일 조작·자산 16종 Git SHA1 잠금 전부 유지. 두 CI 성공 전 `main` 병합 금지, 병합 후 Pages·별도 main 브라우저 QA 확인.

## 보존·남은 단계
- 새 기능은 기존 저장에서 **실제 완공한 건물**에만 나타남. 첫 게임 시작 마을의 아무것도 짓지 않은 빈 지역에는 생기지 않는 것이 정상.
- 신규 독립 투명 PNG 아이콘을 새로 제작하거나 적용하지 않음. 기존 웹/원본 이미지 재압축/바이너리 덮어쓰기 없음.
- 목표 시안 수준의 수백 채 도시·NPC 군중·대형 해양, 실제 스마트폰 물리 GPU·FPS 실측은 별도 미완료.
- [기존 원본 PNG+WebP ZIP](https://drive.google.com/file/d/17z3CxG084H009VspkNGYBaQMQDt9aXRf/view), [원본 SHA-1 잠금](../assets/rani/asset-integrity-lock-v25.json) 보존.
