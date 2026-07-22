# 도깨비 운빨 수호대 3D

- 게임 버전: **3.4.0**
- 엔진 버전: **2.4.0**
- 아트 잠금: **DD-AAA-CASUAL-SD-PBR-3.0**

## v3.4.0 핵심

이번 버전은 새 모델을 완성품처럼 추가하는 패치가 아니라, 앞으로 500~1000개 에셋을 다시 갈아엎지 않도록 **AAA 캐주얼 SD 3D 제작 기준을 절대 잠금**하는 패치입니다.

- 2.3등신, 큰 표정 눈, 둥근 얼굴, 작은 몸, 큰 손발
- 고품질 손그림 텍스처와 부드러운 그라데이션
- Soft AO, Subtle Rim, Stylized PBR
- 밝고 포화도 높은 한국 민담 판타지
- 5방향 원본 + 좌우 미러링
- 일반 캐릭터 6k~10k triangles 제작 기준
- 캐릭터 50 / 몬스터 50 / 보스 20 / 무기 100 / UI 300 / VFX 150 / 환경 80 프롬프트 카탈로그

## 중요한 현재 상태

v3.3까지의 전투 GLB 14종은 **개발용 프로토타입**입니다. 로딩과 게임 연결은 정상이나 Skin, AnimationClip, 손그림 PBR 텍스처가 없어 AAA 완성 에셋으로 승인되지 않았습니다. 설정의 에셋 진단에서 `GLB 로드`와 `AAA 승인`이 분리되어 표시됩니다.

## 명령

```bash
npm ci
npm run generate:prompt-catalog
npm run generate:prototype-assets  # 기술 검증용, 완성 에셋 금지
npm run audit:art
npm run verify
npm run build
```

## 문서

- `docs/ASSET_BIBLE.md`
- `docs/AI_ASSET_PROMPTS.md`
- `docs/AAA_ASSET_PROMPT_CATALOG.json`
- `docs/CURRENT_ASSET_AUDIT.md`
- `docs/BLENDER_EXPORT_GUIDE.md`
- `docs/PRODUCTION_ROADMAP.md`
