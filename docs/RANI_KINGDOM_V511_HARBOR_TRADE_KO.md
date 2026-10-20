# 라니킹덤 v5.11 — 비용이 있는 진짜 항구 건설 및 저장되는 교역선 수출/수입 (2026-10-20)

## 개발 사실
- 신규 건물 `BUILDINGS.harbor`, 분류 농장/해안 시설. **필요 자원 목재 50, 석재 20**, 2×2 바닥, needsWater=true, 기존 Fiefdom 원본 Placement.check(영토·지형·평탄도·충돌·보유 자원) 적용. 기존 건설창 `fishery` 옆 `harbor` 카드에서 건설. 새 건물은 가격이 실제 지불되고 저장/불러오기에서도 이름 `harbor` 유지.
- 오리지널 승인/라이선스 보유 Fiefdom `fishery_0..3.png`의 알파·앵커·방향별 스프라이트를 각각 재가공해 `harbor_0..3.png` 생성, `buildings.json`에 같은 방향 메타 4개를 추가. 원본 수정 없음, SVG 없음. 기존 v5.9 무손실 이미지 아틀라스에 4개 추가. `v5.10` 부두 월드 THREE.Group이 실제 harbor 건물에 생성되며 fishery 부두보다 1.45배 큼.
- 실제 경제: harbor 건축 후 항구 UI에서 중지/수출/수입과 화물 목재·석재·생선 선택. **왕복 60 게임 초, 거래 단위 6**, Fiefdom 원본 `PRICES` 의 수출 판매가/수입 구매가 그대로 적용. 수출은 재고 14개 이상(거래 후 8개 보전)인 경우만. 수입은 기존 창고 유무/공간 및 금액을 확인하고 실제 `stock`, `gold`, `ledger`, `tradeIncome`/`tradeSpend` 계정 수정. 불가능 거래는 사유를 게임 알림으로 표시하며 금·자원을 차감하지 않음.
- `GameState.harbor` mode/resource/clock/voyages 저장은 `SaveGame.harbor?` 선택 필드와 snapshot/applySave에 추가; 기존 저장파일(v4) 호환을 유지하며 신규 저장 버전 번호는 변경하지 않음. 게임 시뮬레이션 tickEconomy에서 기존 시장 tickTrade와 함께 tickHarbor 호출.
- 항구 건물에 실제 해안 목재 부두+전용 선박 `rk-harbor-cargo-ship` 생성, 해안 수면 타일 경로와 같은 persisted harbor.clock으로 선박이 출항/귀항; 건물이 철거되면 배·부두 제거. 기존 배 3척의 해안 이동 유지. 해상 경로는 수면 tiles 검증; 독립 적군 전투·선박 충돌·항해 컨트롤은 아직 없음.
- CSS/DOM 항구 UI에서 버튼 클릭시 항구 미건축이면 원래 건설 카드(원본 placement.select) 실행, 건축 이후 거래 방식을 선택. 기본 mode='off'라 사용자의 동의 없는 자원 소비 없음. 모바일 작은 UI.

## 출처/호환성/검증
- 엔진 halvar20000/fiefdom 원본 고정 8bb66ceeb5a8ec1f77ec899130090061c25078b3, 오리지널 Fiefdom/0AD AGPL+CC BY-SA 표기 유지. 기존 PNG/승인 WebP 보존, SVG 0, save v4 기존 호환. GitHub Pages `/Defense/` 및 `/legacy/` 유지.
- Chromium `qa-v511-harbor.mjs`: 실제 왕국 부팅, 원본 항구 건설 카드/실배치 사유, 해안 부두+항구 선박, 수출·수입 금/재고 및 귀항 수 기록, 스냅샷 저장·복원, 항구 건물 철거시 부두/배 제거 확인.
- 기존 v5.4~v5.10 회귀, 원본 600초 게임, Android 네트워크 6728→4 이미지 요청, 독립 한국어·모바일 QA + GitHub Pages 빌드 성공 이후에만 공개.
