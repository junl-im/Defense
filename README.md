# 도깨비 운빨 수호대 3D

- 게임 버전: **3.5.0**
- 엔진 버전: **2.5.0**
- 아트 잠금: **DD-AAA-CASUAL-SD-PBR-3.0**

## v3.5.0 핵심

이번 버전은 대량 에셋 생산 전에 사용할 **도깨비 전사 골든 샘플의 기술 제작 규격**을 실제 GLB와 런타임으로 구현한 패치입니다.

- 도깨비 전사 GLB: 9,572 triangles
- Skin 1개와 공용 휴머노이드 리그
- 내장 AnimationClip 7개: Idle, Walk, Run, Attack, Skill, Hit, Death
- WeaponSocket, AccessorySocket
- BaseColor, Normal, ORM, Emissive 임베디드 맵
- 전투·도감 공용 모델
- AnimationMixer 우선 재생, 절차형 모션은 폴백 전용
- 기술 검수 자동화와 에셋 진단 UI
- 에셋 진단·골든 규격을 별도 모듈로 분리

## 승인 상태

도깨비 전사는 **기술 검수 통과 / 아트 리뷰 대기** 상태입니다. 실제 실기기 실루엣, 표정, 손그림 질감과 애니메이션 타이밍을 승인하기 전에는 `production-approved`로 표시하지 않습니다.

나머지 전투 GLB 13종은 계속 **개발용 프로토타입**으로 격리됩니다. 파일 로딩 성공과 최종 아트 승인은 게임 설정의 에셋 진단에서 별도로 표시됩니다.

## 검증

```bash
npm ci
npm run verify
npm run build
```

패키지 저장소를 사용할 수 없는 환경에서는 고정 버전 Three.js import map을 사용하는 정적 ESM 배포본을 만들 수 있습니다.

```bash
npm run build:static
node scripts/verify-static-dist.mjs
```

## 제작 명령

```bash
npm run generate:golden-hero       # 기술 골든 샘플 재생성
npm run generate:prompt-catalog    # 750종 프롬프트 카탈로그 재생성
npm run generate:prototype-assets  # 기술 검증용 프로토타입만 생성
npm run audit:art
```

## 주요 문서

- `docs/ASSET_BIBLE.md`
- `docs/GOLDEN_SAMPLE_PRODUCTION_SPEC.md`
- `docs/GOLDEN_SAMPLE_CAPTURE_MANIFEST.json`
- `docs/CODE_ARCHITECTURE_v3.5.md`
- `docs/CURRENT_ASSET_AUDIT.md`
- `docs/AAA_ASSET_PROMPT_CATALOG.json`
- `PROJECT_HANDOFF.md`
