# Dokkaebi Luck Defense 3D

## v14.0.0 Atlas Dominion

- 게임 버전: **14.0.0**
- 엔진 버전: **11.0.0**
- 세이브 스키마: **12**
- 기준 버전: **v13.0.0 Transparent Arsenal**
- Absolute Art Bible: **DD-ABSOLUTE-ART-BIBLE-2.0**

## 이번 업데이트

v13에서 사용 가능 판정을 받은 스프라이트와 장비 필수 아이콘을 다시 가장자리 정리한 뒤, 하나의 런타임 아틀라스로 통합했습니다.

- 런타임 아틀라스 프레임: **128개**
- 아틀라스 페이지: **1개**
- 페이지 크기: **1024×512**
- 타일 크기: **64×64**
- PNG/WebP 동시 생성
- 개별 마스터 PNG: **128개**
- 선별 별칭 프레임: **42개**
- 최종 3D 제작 승인: **0개**

직업 카드, 장비 아이콘, 도감 이미지는 아틀라스 프레임을 사용합니다. 전장에는 환경·VFX 빌보드가 배치되며, 저사양 기기에서는 개수를 자동 제한합니다.

## 카메라 디렉터 v14

Scenic 기본 카메라를 유지하면서 적의 분산도, 활성 개체 수, 보스 유무를 분석해 시야를 최대 `+2.4`까지 추가 확장합니다. 전투 초점은 플레이어와 위협 중심 사이를 제한된 범위에서 보간합니다.

## 실행

```bash
npm run verify
npm run build:static
node scripts/verify-static-dist.mjs
```

개발 서버:

```bash
npm install
npm run dev
```

## 에셋 재생성

```bash
python scripts/generate-asset-sheets-v13.py --check
python scripts/generate-runtime-atlases-v14.py
python scripts/generate-runtime-atlases-v14.py --check
```

## 주요 문서

- `docs/ATLAS_DOMINION_v14.0.0.md`
- `docs/ATLAS_FORGE_PREVIEW_v14.0.0.jpg`
- `docs/PATCH_NOTES_v14.0.0.md`
- `docs/PATCH_APPLY_v14.0.0.md`
- `docs/NEXT_PATCH_LINEUP_v14.x.md`

## 승인 상태

- 런타임 수직 슬라이스: **6/6**
- 2D 런타임 아틀라스: **128 프레임**
- 최종 제작 아트: **0/6**
- 1,130개 대량 생산: **잠금 유지**

자동 크롭·가장자리 정리·아틀라스 패킹은 최종 3D 제작 승인을 부여하지 않습니다.
