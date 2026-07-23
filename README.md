# Dokkaebi Luck Defense 3D

## v9.0.0 Asset Renaissance

사용자가 제공한 `Defense.zip` v8.0.0을 새 기준 원본으로 삼아, 신규 래스터 자료를 실제 제작 후보와 참고 자료로 재분류한 업데이트입니다.

- 게임 버전: **9.0.0**
- 엔진 버전: **7.0.0**
- 세이브 스키마: **7**
- 아트 잠금: **DD-ABSOLUTE-ART-BIBLE-2.0**
- Character DNA: **3.0.0**
- 런타임 GLB: **19종**
- 소스 래스터 파일: **970개**
- 고해상도 리뷰 후보: **40개**
- 참고 크롭: **101개**
- 격리된 자동 추출 조각: **823개**
- 원본 아틀라스: **6개**
- 최종 제작 승인: **0개**

`970개 파일`은 `970개 완성 에셋`을 뜻하지 않습니다. 고해상도 후보도 단일 시점 콘셉트 이미지이며, GLB·Rig·11개 모션·PBR·장비 소켓·실기기 검토를 통과하기 전에는 production-approved가 될 수 없습니다.

## v9 주요 기능

- 전체 970개 파일의 결정적 품질 레지스트리
- 40 High-Resolution Candidate 자동 분리
- 101 Reference Crop과 823 Quarantine Fragment 강제 분리
- 불투명 배경·저해상도·자동 크롭 부채 자동 기록
- 전사·궁수·법사 신규 고해상도 후보를 직업 선택 UI에 연결
- `asset-library-v9.html` 스튜디오 리뷰 브라우저
- F4 Production Console의 실제 후보·격리·승인 수 진단
- Raw Fragment 런타임 금지와 Reference Crop 최종 사용 금지

## 실행

```bash
npm ci
npm run verify
npm run build
```

패키지 저장소를 사용할 수 없는 환경에서는 정적 ESM 배포본을 생성합니다.

```bash
npm run build:static
node scripts/verify-static-dist.mjs
```

## 개발 진단

- `F3`: 렌더 통계 HUD
- `F4`: Production Console
- `?stats=1`: 렌더 통계 HUD 활성화
- `?director=1`: 제작 콘솔 활성화
- 타이틀의 `스튜디오 에셋 리뷰`: Asset Review OS v9

## 주요 문서

- `docs/ABSOLUTE_ART_BIBLE_v2.0.md`
- `docs/ASSET_QUALITY_AUDIT_v9.0.0.md`
- `docs/ASSET_RENAISSANCE_v9.0.0.md`
- `docs/ASSET_REVIEW_BOARD_v9.0.0.jpg`
- `docs/ART_ASSET_APPROVAL_REGISTRY_v9.0.0.json`
- `docs/PATCH_NOTES_v9.0.0.md`
- `docs/NEXT_PATCH_LINEUP_v9.x.md`
- `PROJECT_HANDOFF.md`
