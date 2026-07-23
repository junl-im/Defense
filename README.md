# Dokkaebi Luck Defense 3D

## v21.0.0 Asset Presence Enforcement

- 게임 버전: **21.0.0**
- 엔진 버전: **18.0.0**
- 세이브 스키마: **19**
- 기준 패치: v20.0.0 Visible Combat Rebuild

### 핵심 업데이트

- 타이틀·영웅·몬스터·스킬·전장 아틀라스의 실제 화면 노출 추적
- 질주·기술·수호신·소환·웨이브·상호작용 버튼에 실제 에셋 연결
- 모바일 전용 HUD 재배치와 겹침 자동 완화
- 적 실루엣 링, 주술 위협선, 돌진·장판 예고 강화
- 정적 화면의 고립 한자 제거와 한국어 UI 가드 유지

### 검증

```bash
npm run verify
npm run build:static
node scripts/verify-static-dist.mjs
```

### 운영 문서

- `docs/ASSET_PRESENCE_ENFORCEMENT_v21.0.0.md`
- `docs/ASSET_PRESENCE_AUDIT_v21.0.0.json`
- `docs/PATCH_NOTES_v21.0.0.md`
- `docs/PATCH_APPLY_v21.0.0.md`
- `docs/NEXT_PATCH_LINEUP_v21.x.md`

최종 제작 아트는 0/6이며 1,130개 생산 잠금은 유지한다.

## v19.0.0 Browser Reliability Lab

- 게임 버전: **19.0.0**
- 엔진 버전: **16.0.0**
- 세이브 스키마: **17**
- 기준 패치: v18.0.0 Ten-Wave Reliability

### 핵심 업데이트

- 브라우저 부팅·캐시·WebGL·페이지 수명주기 감시
- Long Task와 지원 브라우저 Heap 표본
- 버전형 서비스 워커와 자동 캐시 복구
- 매 접속 전체 캐시 삭제 및 강제 재이동 제거
- F7 브라우저 안정성 스냅샷
- F6 통합 진단에 브라우저 보고서 병합
- 실제 브라우저 자동화를 위한 공개 테스트 API
- Chromium 기반 Browser Lab 실행 스크립트

### 검증

```bash
npm run verify
npm run simulate:v1800
npm run build:static
node scripts/verify-static-dist.mjs
npm run browserlab:v1900
```

### 운영 문서

- `docs/BROWSER_RELIABILITY_LAB_v19.0.0.md`
- `docs/BROWSER_RELIABILITY_LAB_v19.0.0.json`
- `docs/PATCH_NOTES_v19.0.0.md`
- `docs/PATCH_APPLY_v19.0.0.md`
- `docs/NEXT_PATCH_LINEUP_v19.x.md`

Absolute Art Bible v2.0과 Character DNA v3.0은 최상위 제작 계약이다. 브라우저 안정성 통과와 최종 제작 아트 승인은 별도로 관리한다.
## CI atlas verification hotfix

GitHub Actions verification no longer requires Pillow, OpenCV or NumPy when running the committed v14/v15 atlas `--check` contracts. Atlas regeneration remains available through `npm run setup:atlas-python` and the `generate:runtime-atlas:*` commands.


## v20.0.0 Visible Combat Rebuild

- 접속 마스코트와 PC/모바일 배경 캐시를 v20으로 갱신했습니다.
- 고립된 한자 아이콘을 한국어 UI용 기호로 바꾸는 런타임 가드를 추가했습니다.
- 모바일 HUD를 전투 필수 정보 중심으로 축소했습니다.
- 중앙 신목 크기를 줄이고 Scenic 카메라 각도를 높였습니다.
- 투사체 크기·링·트레일 가시성을 강화했습니다.
