# Dokkaebi Defense IP Production Index v3.8.0

`production/DokkaebiDefense`는 런타임과 분리된 IP 제작 운영 레이어다.

## 5대 기준 문서

- 게임 기획서: `production/DokkaebiDefense/GAME_DESIGN_DOCUMENT_v3.8.0.md`
- 아트 바이블: `production/DokkaebiDefense/01_ArtBible/ART_BIBLE_v3.8.0.md`
- UI/UX 설계서: `production/DokkaebiDefense/05_UI/UI_UX_SPEC_v3.8.0.md`
- 애니메이션 바이블: `production/DokkaebiDefense/10_Animation/ANIMATION_BIBLE_v3.8.0.md`
- 에셋 마스터리스트: `production/DokkaebiDefense/ASSET_MASTERLIST_v3.8.0.json`

## 정확한 계획 수량

캐릭터 50, 몬스터 60, 보스 20, 무기 100, 스킬 아이콘 120, UI 250, VFX 180, 타일 70, 배경 30, 오브젝트 250으로 총 1,130개다. 사운드 96개와 시작 직업 핵심 애니메이션 행 99개는 별도 제작 카탈로그로 관리한다.

## 자동화

- `npm run generate:ip-masterlist`: 1,130개 마스터리스트와 카테고리 카탈로그 재생성
- `npm run verify:ip`: 생성물 최신 상태, 폴더, 수량, ID, 파일명, 포맷, 승인 상태 검증
- `npm run verify`: 기존 게임·GLB·UI·SVG 금지 계약과 IP 제작 계약을 함께 검증

## 추가 제작 계약

- 카테고리 프롬프트: `production/DokkaebiDefense/01_ArtBible/PROMPT_TEMPLATES_v3.8.0.json`
- 파일명 규칙: `production/DokkaebiDefense/ASSET_NAMING_CONVENTION_v3.8.0.md`
- 기존 750개 프롬프트 자료는 연구용이며 1,130개 마스터리스트가 제작 일정의 단일 기준이다.
