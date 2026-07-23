# 현재 전투 에셋 제작 품질 감사 — Absolute Art Bible v2.0 Migration

- 스타일 잠금: `DD-ABSOLUTE-ART-BIBLE-2.0`
- 검사 모델: 19
- 기존 기술 골든 샘플 통과: **8**
- Absolute Art Bible v2.0 통과: **0**
- 아트 리뷰 대기: **8**
- 최종 제작 승인: **0**
- 개발용 프로토타입: **11**

기존 기술 후보는 로딩·리그·텍스처·기존 클립 계약만 통과한 상태다. 새 `DD-ABSOLUTE-ART-BIBLE-2.0`의 42/18/15/25 비율, 눈 28%, 11개 클립, 교체 장비 5파츠, 조명·재질 규칙을 모두 통과하기 전에는 production-approved로 승격하지 않는다.

| Asset | Triangles | Skins | Clips | Textures | Declared | Legacy Technical | Absolute v2.0 | Production |
|---|---:|---:|---:|---:|---|---|---|---|
| guardian-ember-sd-toon | 4142 | 0 | 0 | 0 | prototype-placeholder | FAIL | FAIL | WAIT |
| guardian-frost-sd-toon | 4164 | 0 | 0 | 0 | prototype-placeholder | FAIL | FAIL | WAIT |
| guardian-wind-sd-toon | 4144 | 0 | 0 | 0 | prototype-placeholder | FAIL | FAIL | WAIT |
| guardian-stone-sd-toon | 3964 | 0 | 0 | 0 | prototype-placeholder | FAIL | FAIL | WAIT |
| guardian-bell-sd-toon | 4156 | 0 | 0 | 0 | prototype-placeholder | FAIL | FAIL | WAIT |
| guardian-thunder-sd-toon | 4052 | 0 | 0 | 0 | prototype-placeholder | FAIL | FAIL | WAIT |
| monster-imp-sd-toon | 2652 | 0 | 0 | 0 | prototype-placeholder | FAIL | FAIL | WAIT |
| monster-runner-sd-toon | 2634 | 0 | 0 | 0 | prototype-placeholder | FAIL | FAIL | WAIT |
| boss-tiger-sd-toon | 5346 | 0 | 0 | 0 | prototype-placeholder | FAIL | FAIL | WAIT |
| boss-serpent-sd-toon | 5116 | 0 | 0 | 0 | prototype-placeholder | FAIL | FAIL | WAIT |
| boss-king-sd-toon | 4484 | 0 | 0 | 0 | prototype-placeholder | FAIL | FAIL | WAIT |
| player-dokkaebi-warrior-golden-v1 | 9572 | 1 | 11 | 4 | art-review | PASS | FAIL | WAIT |
| player-dokkaebi-archer-candidate-v1 | 9572 | 1 | 11 | 4 | art-review | PASS | FAIL | WAIT |
| player-dokkaebi-mage-candidate-v1 | 9572 | 1 | 11 | 4 | art-review | PASS | FAIL | WAIT |
| monster-brute-sd-toon | 8396 | 1 | 11 | 4 | art-review | PASS | FAIL | WAIT |
| monster-shaman-sd-toon | 7712 | 1 | 11 | 4 | art-review | PASS | FAIL | WAIT |
| monster-ghost-candidate-v1 | 7712 | 1 | 11 | 4 | art-review | PASS | FAIL | WAIT |
| monster-skeleton-candidate-v1 | 8396 | 1 | 11 | 4 | art-review | PASS | FAIL | WAIT |
| monster-crow-candidate-v1 | 7712 | 1 | 11 | 4 | art-review | PASS | FAIL | WAIT |

## 자동 승인 필수 조건

- 기존 기술 후보: GLB extras의 `DD-AAA-CASUAL-SD-PBR-3.0` 일치
- 최종 승인: GLB extras의 `DD-ABSOLUTE-ART-BIBLE-2.0` 일치
- 일반 캐릭터 6k~10k, 일반 몬스터 5k~9k, 보스 10k~18k triangles
- BaseColor·Normal·ORM에 해당하는 텍스처/이미지 3개 이상
- Skin 1개 이상
- 기존 기술 검수용 카테고리별 AnimationClip
- 최종 승인용 11개 필수 AnimationClip
- 승인 레지스트리의 `productionReady: true`
