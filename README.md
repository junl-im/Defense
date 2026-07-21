# 도깨비 운빨 수호대 3D

달빛 조선 야시장을 배경으로 한 모바일 3D 운빨 디펜스 게임입니다.

- 게임 버전: **3.1.0**
- 엔진 버전: **2.1.0**
- 아트 바이블: **SD 모바일 카툰 v2.0 — Locked**
- 런타임: Three.js + Vite

## 이번 버전의 핵심

v3.1.0은 에셋 수를 늘리는 패치가 아니라, 이후 수백 개의 캐릭터·몬스터·무기·UI·VFX가 같은 게임처럼 보이도록 제작 기준을 다시 잠그는 패치입니다.

- 2~2.5등신, 목표 2.25등신
- 큰 머리·작은 몸통·큰 손발
- 4단 모바일 Toon Shading
- 청록 월광 Rim Light
- 부드러운 접지 그림자
- 높은 채도와 큰 실루엣
- 5방향 원본 + 좌우 미러링 → 11방향 런타임
- 주인공 1종 → 적 3종 → 맵 → UI → VFX → 대량 제작 순서

상세 기준은 [`docs/ASSET_BIBLE.md`](docs/ASSET_BIBLE.md)에 있습니다.

## 대표 SD Toon GLB

- `public/assets/models/guardian-ember-sd-toon.glb` — 불씨 깨비
- `public/assets/models/monster-imp-sd-toon.glb` — 장난 요괴
- `public/assets/models/boss-tiger-sd-toon.glb` — 저승 호랑이

세 모델은 새 비율과 팔레트를 검증하기 위한 골든 샘플입니다. 아직 스켈레탈 리깅·내장 애니메이션 클립 단계는 아니며, 파츠 기반 런타임 애니메이션과 실패 시 절차형 폴백을 사용합니다.

## 제작 문서

- `docs/ASSET_BIBLE.md` — 캐릭터, 몬스터, 맵, UI, VFX 전체 기준
- `docs/AI_ASSET_PROMPTS.md` — 컨셉 시트용 AI 프롬프트
- `docs/BLENDER_EXPORT_GUIDE.md` — Blender → Three.js/Unity 공용 납품 규칙
- `docs/PRODUCTION_ROADMAP.md` — 골든 샘플 승인 순서
- `docs/ASSET_MANIFEST.json` — 기계 판독용 에셋 매니페스트

## 개발 실행

```bash
npm ci
npm run dev
```

기본 개발 서버는 Vite가 표시하는 로컬 주소에서 열립니다.

## 검증

```bash
npm run verify
```

검증 항목에는 다음이 포함됩니다.

- DOM 및 기존 게임 시스템 연결
- 모바일 레이아웃과 카메라 조작
- 폴리곤·텍스처·파티클 예산
- SD 비율과 대표 GLB 노드·bounds
- 4단 Toon 재질과 Neutral Tone Mapping
- 5방향 원본·미러링 계산
- 아트 바이블 필수 문서와 제작 게이트

## SD 대표 모델 재생성

```bash
npm run generate:sd-assets
```

Python 환경에 `numpy`와 `trimesh`가 필요합니다.

## 프로덕션 빌드

```bash
npm run build
```

GitHub Pages 배포 기준 base path는 `/Defense/`입니다. 최신 `dist/`는 전체 배포 ZIP에만 포함합니다.

## 에셋 제작 원칙

대량 캐릭터 제작은 불씨 깨비 골든 샘플의 다음 항목이 실기기에서 승인된 뒤 시작합니다.

1. 공용 얼굴·손·발 규격
2. LOD0/LOD1
3. Idle/Walk/Run/Attack/Skill/Hit/Death
4. 전투와 도감의 동일 외형
5. 5방향 원본 캡처와 미러링

현재 프로젝트는 Three.js 기반입니다. 문서의 Unity Prefab·Animator 규칙은 향후 이관을 위한 호환 부록이며 현재 런타임에 직접 사용되지는 않습니다.
