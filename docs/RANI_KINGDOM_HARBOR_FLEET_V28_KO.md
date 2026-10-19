# 라니킹덤 v2.8 — 원래 항구·낚시 부두의 실제 3D 선박·부두 품질 강화

## 목표 및 불변
사용자 확정 가이드 이미지의 왕실 청색·금장·깊은 목재·실제 부두/선박 디테일을 향해, **이미 게임에 존재하고 건설할 수 있는 항구와 낚시 부두**를 고도화한다. 기존 건물·3D 모델·UI·투명 PNG 원본·10개 WebP를 삭제하거나 일괄 교체하지 않는다. **SVG 전면 금지, 시안 화면에서 물체를 잘라 자산으로 사용하지 않음**.

## 실제 적용
- 새 `src/rendering/RoyalHarborFleetArt.js`: port/pier 전용 3D 시각 부품을 각각 `merge(parts)`로 병합한다. 기존 `CivicFactory.js`의 `makePort` 및 `makeFishingPier`에 **기존 장식 유지 + 신규 완공 4단계 장식**으로 부착.
- 항구: 기존 위치에 있는 무역선의 갑판/뱃머리/선체 목재 띠, 왕실 청색·금장 돛, 돛대 가로대와 밧줄, 부두 데크·계류 말뚝·크레이트·통에 입체 디테일 추가. 기존 항만청·크레인·원래 배는 삭제하지 않음.
- 낚시 부두: 기존 소형 어선에 노/목재 외장/그물 다발, 독립 낚시용 바구니·건조대와 부두 말뚝 추가. 무역선의 대형 돛을 어선에 가짜로 씌우지 않음.
- 각 실제 건물 완공 시 하나의 vertex-color 3D 메시만 추가. 선택 방해 금지를 위해 새 장식 `raycast=()=>{}` 설정. `raniVisualOnly` 표기, 그림자 추가 렌더링 부담 최소화. 기존 건설 4단계/세이브/건물 비용·생산·연구·군사/지도·사용 UI/건물 클릭 전부 그대로.

## 이전 사용자 자산 검증
- GitHub `assets/rani/asset-integrity-lock-v25.json`: 최초 사용자 독립 WebP 원본 10종 + 로고 + 지형 아틀라스 + GLTF 4종 **16개 Git blob SHA-1 무결성 검사 계속 실행**.
- 이전 `assets/rani/manifest-v23.json`·`manifest-v27.json` 변경 없음. 원본 투명 PNG+WebP [Google Drive ZIP](https://drive.google.com/file/d/17z3CxG084H009VspkNGYBaQMQDt9aXRf/view) 변경 없음.
- 왕실 HUD 배너·주택/시장·마을/필드·강/호수/구역·물 애니메이션 및 일반 모바일 UX는 기존 기능 유지.

## 자동화된 검증
- `scripts/check-harbor-fleet-v28.mjs`: 2가지 기존 건물 maker의 완공 단계에만 새 메시 추가/이전 장식 보존/기존 16개 자산 지문 확인.
- `scripts/qa_harbor_fleet_v28.py`: 실제 Chromium PC1440×900, 모바일390×844, 소형320×700에서 2개 건물의 4단계/기존 새 메시/vertex 수/재질 공유/화면 클릭 미차단/지형·저장 상태 불변·SVG 0 및 JS 오류 점검.
- 기존 v0.1~v2.7 전체 소스·정적·PC/모바일 경제/건축/외교/저장/3D/자산 보호 테스트는 한 개도 삭제하지 않음.

## 완료 범위와 미완료
이번 버전은 실제 건설 가능한 **항구·낚시 부두 완공 모델**에 덧붙인 정밀 시각장식. 전체 세계에 거대한 항만/대양을 생성한 것이 아님. 게임 참고 스크린샷 수준 도시 밀도·해안 파도·실제 NPC·물리 스마트폰 GPU FPS는 미완료. 앞으로 새 2D 왕실 아이콘은 이미지 생성 도구로 **서로 독립된 투명 PNG 원본**을 만들고 Drive 백업 후 WebP 게임 연결해야 하며, 현재 참조용으로 생성된 대형 시안을 잘라 쓰지 않는다.

[이전 v2.7 MASTER](RANI_KINGDOM_ROYAL_HUD_V27_KO.md) · [승인 자산 잠금](../assets/rani/asset-integrity-lock-v25.json)
