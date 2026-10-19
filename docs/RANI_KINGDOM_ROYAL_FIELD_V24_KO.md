# 라니킹덤 v2.4 — 원본 3D 필드 조경·왕실 거점 강화

## 기존 게임 유지
- 기준: 사용자 확정 2.5D 중세 판타지 왕국, 파란 지붕과 금장 장식, 녹지·성벽·항구. SVG 전면 금지.
- v2.2 원본 독립 PNG 10종 / 게임 WebP 10종, v2.3 9종 UI 실제 적용, 기존 v1.9~v2.1 3D 건물/도로/항구 모델 전부 유지.
- Three.js 실제 플레이 마을과 필드, 세력·전투·연구·경제·건설·저장 포맷을 그대로 사용한다. 새 가짜 지도를 만들거나 영토를 임의 생성하지 않는다.

## 이번 변경 — 실제 소스
1. `src/rendering/RoyalFieldScenery.js` 신설: 필드 3D 외곽에 실제 나무 몸통·두 종류의 수관·바위의 **4개 공용 InstancedMesh**로 조경. 128개 정적 상한, 고정 해시 배치, 새로고침 때 중복 생성 없음. 중앙 주요 마을 진입로를 비워 놓음.
2. 각 실존 세력 거점에 `makeRoyalFieldTownDressing`: 한 번에 병합한 3D 석재 마당과 푸른 왕실 깃발(내 마을)/적대·중립 구분 색상. 중심건물 단계에 따라 깃발 수와 문장 차이. 실제 세력 단계는 변경하지 않음.
3. `src/rendering/RaniFieldScene.js`가 기존 장면에 조경을 1회 부착하고, 실제 거점 모델의 누락된 왕실 파란 지붕색을 복원. 원본 Quaternius CC0 마을 건물 로딩·클릭/드래그/휠·핀치/선택을 그대로 보존.
4. 모든 장식은 `raycast`를 무효화하여 육각형/거점 타겟을 가로채지 않음. 거점 새로고침 때 **새로 만든 병합 지오메트리만 GPU 해제**, 원래 GLTF/공용 재료는 해제하지 않음.
5. 추가 로고/아이콘 PNG를 만들어 넣은 것이 아님. **이번은 실제 3D 필드 조경 패치**이며 기존 개별 이미지 백업에는 변경 사항 없음.

## QA와 제한
- `scripts/check-royal-field-v24.mjs`: 공용 인스턴스 4종, 배치·타겟 격리·GPU 해제·이전 자산 보존·SVG 배제 검사.
- `scripts/qa_royal_field_v24.py`: 실제 Chromium PC 1440×900, 모바일 390×844, 소형 320×700. 마을→필드→마을, 세력 실모델 조경, 중복 방지·해제, SVG DOM 0, JS 콘솔 예외 검사와 스크린샷.
- `npm test`/GitHub Actions PR 검사가 통과한 뒤에만 main 병합. 실제 Android/iOS 물리 기기 FPS, 최종 CDN 반영은 별도 확인.
- **아직 미완료**: 독립 그림 신규 영향력/안정도/연구/퀘스트 등 UI 아이콘, 원본 비율 HUD 프레임, 완성형 강/바다·선박·NPC 애니메이션과 레퍼런스 수준 전체 도심 밀도. 외곽 조경을 실제 필드 소유 영토/자원 시스템으로 오인하지 않는다.

## 자산 기준본
- v2.3: `assets/rani/manifest-v23.json`
- 기존 원본 PNG + WebP Google Drive ZIP: https://drive.google.com/file/d/17z3CxG084H009VspkNGYBaQMQDt9aXRf/view
- 과거 v2.3 문서: `docs/RANI_KINGDOM_REAL_UI_ASSETS_V23_KO.md`
