# 라니킹덤 v2.6 — 실물 3D 강·호숫가 수변 조경

## 고정 목표
- 기존 사용자 승인 2.5D 중세 왕국 컨셉 유지: 돌이 깔린 강둑, 갈대와 녹지, 따뜻한 석재, 푸른 물결.
- **사용자 승인 개별 PNG 원본 10종, WebP 10종, 로고, 지형 아틀라스, GLTF 4종 전부 그대로 유지**. v2.5의 [16개 파일 Git blob 체크섬 보호](../assets/rani/asset-integrity-lock-v25.json) 및 모든 회귀검사 적용.
- SVG 및 임시 2D 가짜 지도 없음. 실제 게임의 Three.js 지형을 직접 개선. 새 경제/건물 건설/적대 AI/저장 포맷은 만들지 않음.

## 구현 내용
1. `src/rendering/RoyalWaterfrontArt.js`: 기존 강(river)·호수(lake) 셀의 실물 입체 장식. **강둑 석재·갈대**, 호숫가 돌·갈대·수련잎/꽃을 기존 애니메이션 물과 함께 보이도록 배치.
2. 강의 시각 장식은 `cell.riverEdges`에 있는 **회전 후 실제 강 연결 방향**만 사용. 새로운 도로나 지형 연결을 임의 생성하지 않으며, 원래 중앙 강줄기와 물 표면을 시각적으로 막지 않는다.
3. 셀의 `seed`에서 결정론적 배치를 계산하고 하나의 `merge(parts)` 버텍스 색상 메시로 합쳐 **물 타일당 새 드로콜 1개**로 제한. 자원 데이터·마을 건물 선택·영토 소유권·세이브 스키마 불변.
4. `TileFactory.placeCell`에서 실타일, `setGhostTile`에서 반투명 배치 미리보기 모두 동일 수변 아트 사용. 장식 선택 방지 `raycast=()=>{}`, `raniVisualOnly` 표기. 기존 타일 제거/재시작 시 그 셀의 지오메트리만 해제.
5. 마을·농경지 `makeRoyalTileDressing(cell)`, 왕궁·성벽·성문·시장·주택·항구/3D 필드 모델과 기존 리소스 아이콘 모두 무변경.

## QA·검증
- `scripts/check-royal-water-v26.mjs`: 소스·2타일 종류/버텍스 병합/ghost 포함/구 자산 보호·SVG 차단.
- `scripts/qa_royal_water_v26.py`: 실제 Chromium PC 1440×900, 모바일 390×844, 소형 320×700에서 일반 강, 회전한 강, 호수 2변종, 원본 저장 데이터 불변·고스트 55% 반투명·시드 재현·실타일 설치/삭제·클릭 우선순위·JS 예외를 검사하고 스크린샷 저장.
- 이전의 **원본 전 게임 소스/건설/경제/저장/연구/전투/UI/안전 자산 16개 SHA-1 검사**를 하나도 삭제하지 않음. PR 두 CI 전체 성공 후에만 main 병합, Pages 배포와 main 브라우저 QA 후속 확인.

## 완료하지 않은 범위
- 게임 전체를 참고 이미지와 완벽하게 일치시키지는 못함. 실제 바다/대형 무역선/애니메이션 NPC·강 전체 물리 연결 새 설계는 후속.
- 기존 독립 이미지를 새 PNG로 만든 것이 아닌 **실제 3D 수변 경관 개선**. 필요 아이콘 신규 독립 PNG는 별도 생성·백업·승인 후 적용.
- 실제 Android/iOS GPU 발열과 FPS 실측은 별도 실기기 검증이 필요.

## 기준본
- [v2.5 원본 잠금](../assets/rani/asset-integrity-lock-v25.json)
- [v2.5 MASTER](RANI_KINGDOM_ASSET_GUARD_V25_KO.md)
- [기존 원본 PNG+WebP Google Drive 백업](https://drive.google.com/file/d/17z3CxG084H009VspkNGYBaQMQDt9aXRf/view)
