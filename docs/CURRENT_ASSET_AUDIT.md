# 현재 전투 에셋 제작 품질 감사 — v4.0.0

- 스타일 잠금: `DD-AAA-CASUAL-SD-PBR-3.0`
- 검사 모델: 19
- 기술 골든 샘플 통과: **8**
- 아트 리뷰 대기: **8**
- 최종 제작 승인: **0**
- 개발용 프로토타입: **11**

도깨비 전사 골든 샘플은 Skin·7개 AnimationClip·PBR 텍스처·소켓 기술 조건을 통과했지만, 실기기 아트 디렉터 승인이 끝나기 전에는 production-approved로 승격하지 않는다.

| Asset | Triangles | Skins | Clips | Textures | Declared | Technical | Production |
|---|---:|---:|---:|---:|---|---|---|
| guardian-ember-sd-toon | 4142 | 0 | 0 | 0 | prototype-placeholder | FAIL | WAIT |
| guardian-frost-sd-toon | 4164 | 0 | 0 | 0 | prototype-placeholder | FAIL | WAIT |
| guardian-wind-sd-toon | 4144 | 0 | 0 | 0 | prototype-placeholder | FAIL | WAIT |
| guardian-stone-sd-toon | 3964 | 0 | 0 | 0 | prototype-placeholder | FAIL | WAIT |
| guardian-bell-sd-toon | 4156 | 0 | 0 | 0 | prototype-placeholder | FAIL | WAIT |
| guardian-thunder-sd-toon | 4052 | 0 | 0 | 0 | prototype-placeholder | FAIL | WAIT |
| monster-imp-sd-toon | 2652 | 0 | 0 | 0 | prototype-placeholder | FAIL | WAIT |
| monster-runner-sd-toon | 2634 | 0 | 0 | 0 | prototype-placeholder | FAIL | WAIT |
| boss-tiger-sd-toon | 5346 | 0 | 0 | 0 | prototype-placeholder | FAIL | WAIT |
| boss-serpent-sd-toon | 5116 | 0 | 0 | 0 | prototype-placeholder | FAIL | WAIT |
| boss-king-sd-toon | 4484 | 0 | 0 | 0 | prototype-placeholder | FAIL | WAIT |
| player-dokkaebi-warrior-golden-v1 | 9572 | 1 | 7 | 4 | art-review | PASS | WAIT |
| player-dokkaebi-archer-candidate-v1 | 9572 | 1 | 7 | 4 | art-review | PASS | WAIT |
| player-dokkaebi-mage-candidate-v1 | 9572 | 1 | 7 | 4 | art-review | PASS | WAIT |
| monster-brute-sd-toon | 8396 | 1 | 7 | 4 | art-review | PASS | WAIT |
| monster-shaman-sd-toon | 7712 | 1 | 7 | 4 | art-review | PASS | WAIT |
| monster-ghost-candidate-v1 | 7712 | 1 | 7 | 4 | art-review | PASS | WAIT |
| monster-skeleton-candidate-v1 | 8396 | 1 | 7 | 4 | art-review | PASS | WAIT |
| monster-crow-candidate-v1 | 7712 | 1 | 7 | 4 | art-review | PASS | WAIT |

## 자동 승인 필수 조건

- GLB extras의 `styleLockId` 일치
- 일반 캐릭터 6k~10k, 일반 몬스터 5k~9k, 보스 10k~18k triangles
- BaseColor·Normal·ORM에 해당하는 텍스처/이미지 3개 이상
- Skin 1개 이상
- 카테고리별 필수 AnimationClip
- 승인 레지스트리의 `productionReady: true`
