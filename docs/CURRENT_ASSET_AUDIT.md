# 현재 전투 에셋 AAA 품질 감사 — v3.4.0

- 스타일 잠금: `DD-AAA-CASUAL-SD-PBR-3.0`
- 검사 모델: 14
- 제작 승인 통과: **0**
- 개발용 프로토타입: **14**

현재 모델은 런타임 연결 기술을 검증하는 프로토타입이다. GLB 로딩 성공과 AAA 아트 제작 승인을 혼동하지 않는다.

| Asset | Triangles | Skins | Clips | Textures | Declared | AAA |
|---|---:|---:|---:|---:|---|---|
| player-moon-captain-sd-toon | 4496 | 0 | 0 | 0 | prototype-placeholder | FAIL |
| guardian-ember-sd-toon | 4142 | 0 | 0 | 0 | prototype-placeholder | FAIL |
| guardian-frost-sd-toon | 4164 | 0 | 0 | 0 | prototype-placeholder | FAIL |
| guardian-wind-sd-toon | 4144 | 0 | 0 | 0 | prototype-placeholder | FAIL |
| guardian-stone-sd-toon | 3964 | 0 | 0 | 0 | prototype-placeholder | FAIL |
| guardian-bell-sd-toon | 4156 | 0 | 0 | 0 | prototype-placeholder | FAIL |
| guardian-thunder-sd-toon | 4052 | 0 | 0 | 0 | prototype-placeholder | FAIL |
| monster-imp-sd-toon | 2652 | 0 | 0 | 0 | prototype-placeholder | FAIL |
| monster-runner-sd-toon | 2634 | 0 | 0 | 0 | prototype-placeholder | FAIL |
| monster-brute-sd-toon | 2824 | 0 | 0 | 0 | prototype-placeholder | FAIL |
| monster-shaman-sd-toon | 2792 | 0 | 0 | 0 | prototype-placeholder | FAIL |
| boss-tiger-sd-toon | 5346 | 0 | 0 | 0 | prototype-placeholder | FAIL |
| boss-serpent-sd-toon | 5116 | 0 | 0 | 0 | prototype-placeholder | FAIL |
| boss-king-sd-toon | 4484 | 0 | 0 | 0 | prototype-placeholder | FAIL |

## 자동 승인 필수 조건

- GLB extras의 `styleLockId` 일치
- 일반 캐릭터 6k~10k, 일반 몬스터 5k~9k, 보스 10k~18k triangles
- BaseColor·Normal·ORM에 해당하는 텍스처/이미지 3개 이상
- Skin 1개 이상
- 카테고리별 필수 AnimationClip
- 승인 레지스트리의 `productionReady: true`
