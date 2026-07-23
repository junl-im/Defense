# 기존 도깨비 전사 골든 샘플 — 마이그레이션 판정

- 기존 에셋: `player-dokkaebi-warrior-golden-v1`
- 기존 기술 잠금: `DD-AAA-CASUAL-SD-PBR-3.0`
- 신규 절대 잠금: `DD-ABSOLUTE-ART-BIBLE-2.0`
- 현재 판정: **레거시 기술 후보 / 신규 아트 바이블 불합격 / 최종 승인 금지**

## 기존 기술 상태

- 9,572 triangles
- Skin 1개
- 기존 7개 클립
- WeaponSocket / AccessorySocket
- BaseColor / Normal / ORM / Emissive

## 신규 승인에 필요한 재제작

1. 42/18/15/25 비율과 머리 40~44%
2. 눈 크기 얼굴 폭 28%, 눈 위치 중앙보다 약간 아래
3. Helmet / Shoulder / Weapon / Accessory / Back Item 교체 파츠
4. Attack1 / Attack2 / Skill1 / Skill2 / Victory / Spawn을 포함한 11개 클립
5. 최대 4색, 60/25/10/5, 무지개 금지
6. Rounded + Bevel, Warm Key + Blue Rim + Soft AO + Small Highlight
7. 64px 실루엣과 320px 실제 전투 화면 검수

기존 파일은 런타임과 기술 파이프라인 검증용으로만 유지한다. 새 골든 샘플이 승인되기 전에는 어떤 현재 GLB도 `production-approved`로 표시하지 않는다.
