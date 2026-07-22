# Dokkaebi Defense IP Production Hub

이 폴더는 브라우저 런타임과 분리된 IP 제작 운영 레이어다. 실제 게임 소스는 `src/`, 배포 자산은 `public/`에 유지하며, 이곳은 기획·아트·UI·애니메이션·에셋 납품·Unity 이관·라이브 운영 기준을 관리한다.

## 13개 제작 영역

1. `01_ArtBible` — 스타일 잠금, 색·재질·비율·금지 규칙
2. `02_Characters` — 캐릭터 50종과 무기 100종
3. `03_Monsters` — 일반·엘리트 몬스터 60종
4. `04_Boss` — 보스 20종
5. `05_UI` — 화면 설계와 UI 자산 250종
6. `06_Icons` — 스킬 아이콘 120종
7. `07_VFX` — 전투·성장·소환 VFX 180종
8. `08_Map` — 타일 70, 배경 30, 오브젝트 250
9. `09_Sound` — 96개 초기 사운드 큐 계획
10. `10_Animation` — 11개 시작 직업 × 9개 핵심 동작
11. `11_Unity` — 미래 Unity 이관용 폴더·프리팹 계약
12. `12_Monetization` — 상점·패스·소환의 공정성 원칙
13. `13_LiveOps` — 시즌·이벤트·보스 로테이션 운영 규칙

## 5대 기준 문서

- `GAME_DESIGN_DOCUMENT_v3.8.0.md`
- `01_ArtBible/ART_BIBLE_v3.8.0.md`
- `05_UI/UI_UX_SPEC_v3.8.0.md`
- `10_Animation/ANIMATION_BIBLE_v3.8.0.md`
- `ASSET_MASTERLIST_v3.8.0.json`

사용자가 제시한 수량의 정확한 합계는 1,130개다. 모든 항목은 `planned → concept → production → artReview → technicalReview → approved` 순서로 이동한다. 기존 14개 런타임 GLB는 별도 기술 샘플이며 이 마스터리스트의 제작 승인을 자동으로 획득하지 않는다.
