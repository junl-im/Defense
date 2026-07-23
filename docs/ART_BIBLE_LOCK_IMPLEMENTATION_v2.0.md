# DOKKAEBI DEFENSE — ABSOLUTE ART BIBLE v2.0 적용 보고서

- 적용일: 2026-07-23
- 스타일 잠금: `DD-ABSOLUTE-ART-BIBLE-2.0`
- 상태: **적용 완료 / 전체 자동 검증 통과**

## 1. 절대 규칙 고정

- 원문 문서: `docs/ABSOLUTE_ART_BIBLE_v2.0.md`
- SHA-256 잠금: `docs/ABSOLUTE_ART_BIBLE_v2.0.sha256`
- 기계 규격: `docs/ART_BIBLE_MACHINE_SPEC_v2.0.json`
- 검수표: `docs/ART_REVIEW_CHECKLIST_v2.0.md`
- 코드 단일 기준: `src/art-style-tokens.js`

## 2. 폐기된 기존 규칙

- 42/35/23 비율
- 9개 제작 애니메이션
- Immortal 등급 Rainbow 표현
- Subtle Rim 중심의 모호한 조명 계약
- 장비 파츠 Head/HairOrHat/Body/Weapon/Accessory 계약

## 3. 신규 제작 계약

- 비율: Head 42 / Chest 18 / Waist 15 / Leg 25
- 머리 허용: 40~44%
- 얼굴: 눈 28%, 중앙보다 약간 아래, 눈 크기 표정 간 고정
- 실루엣: 0.3초 식별, 대표 요소 3개
- 색: 최대 4개, 60/25/10/5, 무지개 금지
- 장비: Helmet / Shoulder / Weapon / Accessory / Back Item
- 모델: 6k~10k, 1024/2048, Humanoid
- 애니메이션: 11개 공통 클립
- 조명: Warm Key → Cool Blue Rim → Soft AO → Small Highlight
- 그림자: Soft, 40%, 순수 검정 금지

## 4. 제작 시스템 반영

- 750개 AI 프롬프트 카탈로그 재생성
- 1,130개 IP 제작 마스터리스트 스타일 잠금 교체
- 시작 직업 애니메이션 매트릭스 99행에서 121행으로 변경
- 카테고리별 캐릭터·몬스터·보스·무기·UI·아이콘·VFX·환경 프롬프트 갱신
- `CHARACTER_DNA_v3.0_DRAFT.md` 확장 초안 추가

## 5. 기존 에셋 판정

현재 런타임 GLB 19종은 게임 기능과 로딩 파이프라인 검증용으로 유지한다.

- 기존 기술 리뷰: 8종
- 프로토타입: 11종
- Absolute Art Bible v2.0 합격: **0종**
- 최종 제작 승인: **0종**

기존 에셋의 메타데이터를 신규 잠금으로 위장하지 않았다. 새 골든 수직 슬라이스가 완성될 때까지 모두 레거시 후보로 격리한다.

## 6. 검증 결과

- `npm run verify`: PASS
- PASS 항목: 696개
- 스타일 잠금, SHA-256, 기계 규격, 프롬프트 상속, 마스터리스트, 런타임 격리 검증 통과
- `npm run build:static`: PASS
- `node scripts/verify-static-dist.mjs`: PASS

## 7. 다음 제작 순서

1. Face DNA 수치 템플릿
2. 도깨비 전사 신규 골든 모델
3. 일반 적 1종
4. 보스 1종
5. 맵 키트 1세트
6. 전투 HUD 및 아이콘 1세트
7. VFX 1세트
8. 골든 수직 슬라이스 실기기 승인
9. 승인 DNA를 이용한 대량 제작
