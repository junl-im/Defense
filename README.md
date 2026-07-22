# 도깨비 운빨 수호대 3D

달빛 조선 야시장을 배경으로 한 모바일 3D 운빨 디펜스 게임입니다.

- 게임 버전: **3.2.0**
- 엔진 버전: **2.2.0**
- 아트 바이블: **SD 모바일 카툰 v2.0 — Locked**
- 런타임: Three.js + Vite

## 이번 버전의 핵심

v3.2.0은 신규 콘텐츠를 무리하게 늘리기보다, 다음 대규모 에셋·애니메이션 작업을 안전하게 받을 수 있도록 **코드 수명 관리와 자동 검증을 강화한 안정성 패치**입니다.

- 영구 UI 이벤트를 `EventRegistry` 한 곳에서 관리
- 동일 키 이벤트의 중복 등록 즉시 차단
- 런·UI·효과·시스템 지연 작업을 `RuntimeLifecycle`로 분리
- 새 판 시작, 타이틀 복귀, 결과 진입 시 이전 판 예약 작업 일괄 취소
- 유물·계약·축복·선택 소환 버튼을 이벤트 위임 방식으로 단일화
- 도감 뷰어의 이벤트, RAF, WebGLRenderer 명시적 dispose 경로 추가
- 과거 Vite 해시 번들 3세대 제거 및 빌드 전 자동 정리
- import 순환, 미해결 import, DOM ID, 클래스 메서드 중복 자동 검사
- 골든 샘플 모션을 `Idle/Walk/Run/Attack/Skill/Hit/Death` 7상태로 확장
- Attack/Skill 중 이동 상태가 바뀌어도 최신 Walk/Run 상태로 정확히 복귀

아트 방향과 제작 기준은 [`docs/ASSET_BIBLE.md`](docs/ASSET_BIBLE.md)에 있습니다.

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

## 전체 검증

```bash
npm run verify
```

검증 항목에는 다음이 포함됩니다.

- 기존 게임 시스템과 178개 DOM 연결
- ES module 상대 import 해석 및 순환 의존성
- 클래스 메서드와 DOM ID 중복
- 이벤트 등록과 지연 작업 수명 관리
- 런 재시작 후 이전 작업 무효화
- 도감 뷰어 dispose
- 모바일 레이아웃과 카메라 조작
- 폴리곤·텍스처·파티클 예산
- SD 비율과 대표 GLB 노드·bounds
- 4단 Toon 재질과 Neutral Tone Mapping
- 5방향 원본·미러링 계산
- 골든 샘플 7개 모션 상태 전환
- 아트 바이블 필수 문서와 제작 게이트

## SD 대표 모델 재생성

```bash
npm run generate:sd-assets
```

Python 환경에 `numpy`와 `trimesh`가 필요합니다.

## 프로덕션 빌드

```bash
VITE_BASE_PATH=/Defense/ npm run build
```

빌드 전 `scripts/clean-obsolete-assets.mjs`가 과거 해시 번들과 obsolete 아이콘을 자동 정리합니다. 최신 `dist/`는 전체 배포 ZIP에만 포함합니다.

## 에셋 제작 원칙

대량 캐릭터 제작은 불씨 깨비 골든 샘플의 다음 항목이 실기기에서 승인된 뒤 시작합니다.

1. 공용 얼굴·손·발 규격
2. LOD0/LOD1
3. Idle/Walk/Run/Attack/Skill/Hit/Death
4. 전투와 도감의 동일 외형
5. 5방향 원본 캡처와 미러링

현재 프로젝트는 Three.js 기반입니다. 문서의 Unity Prefab·Animator 규칙은 향후 이관을 위한 호환 부록이며 현재 런타임에 직접 사용되지는 않습니다.
