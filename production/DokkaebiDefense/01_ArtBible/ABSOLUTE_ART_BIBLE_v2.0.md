# DOKKAEBI DEFENSE — ABSOLUTE ART BIBLE v2.0

- 상태: **ABSOLUTE LOCKED — 절대 변경 금지**
- 스타일 잠금 ID: `DD-ABSOLUTE-ART-BIBLE-2.0`
- 적용 시작: `2026-07-23`
- 우선순위: 이 문서는 기존 `ASSET_BIBLE`, 프롬프트 카탈로그, 개별 콘셉트, 에셋 제작 지시보다 항상 우선한다.
- 변경 정책: 오탈자 수정도 아트 디렉터의 명시적 승인 없이는 금지한다. 확장 규칙은 별도 문서로 추가할 수 있지만 본 규칙을 완화·대체할 수 없다.

## CHAPTER 01 — ART PHILOSOPHY

유저가 이미지를 보는 순간 **“이거 도깨비 디펜스네.”**라고 바로 알아볼 수 있는 IP를 만든다.

캐릭터마다 화풍, 비율, 질감, 재질, 조명, 색감이 달라지는 것을 절대 허용하지 않는다.

## CHAPTER 02 — STYLE LOCK

아래 장르 조합은 100% 고정한다.

```text
Cute Stylized Fantasy
3D Mobile Game
AAA Casual
Korean Fantasy
Stylized PBR
Hand Painted
```

## CHAPTER 03 — PROPORTION LOCK

모든 캐릭터의 전체 높이를 100%로 본다.

| 구간 | 비율 |
|---|---:|
| Head | 42% |
| Chest | 18% |
| Waist | 15% |
| Leg | 25% |

- 머리 비율 허용 범위: **40~44%**
- 목표 체형: **2.3등신**
- 긴 다리와 긴 목은 금지한다.

## CHAPTER 04 — FACE LOCK

- 눈 위치: 얼굴 중앙보다 조금 아래
- 눈 크기: 얼굴 폭의 **28%**
- 눈동자: 동그랗고 큰 광택
- 속눈썹: 거의 없음
- 코: 점 하나 수준
- 입: 작고 살짝 웃는 입이 기본

## CHAPTER 05 — SILHOUETTE LOCK

실루엣만 보고 **0.3초 안에** 캐릭터를 식별할 수 있어야 한다.

- 도깨비: 큰 곤봉, 큰 뿔, 큰 머리
- 호랑이: 큰 꼬리, 큰 얼굴, 둥근 귀
- 도사: 긴 모자, 부적, 긴 소매

모든 신규 캐릭터는 동일한 방식으로 대표 실루엣 요소 3개를 정의한다.

## CHAPTER 06 — COLOR RULE

한 캐릭터의 메인 컬러는 최대 4개다.

| 역할 | 비율 |
|---|---:|
| Primary | 60% |
| Secondary | 25% |
| Accent | 10% |
| FX | 5% |

- 무지개 조합 금지
- 저채도 지배색 금지

## CHAPTER 07 — MATERIAL RULE

### Skin

- Smooth
- No pores
- No wrinkles
- No realism

### Metal

- Painted Metal
- Stylized
- Gold Edge
- Soft Reflection

### Cloth

- Fabric Pattern Almost None
- Simple Gradient

## CHAPTER 08 — EDGE RULE

- 모든 모서리는 Rounded + Bevel
- 날카로운 90도 모서리 금지

## CHAPTER 09 — WEAPON RULE

- 무기 크기는 캐릭터 전체 높이의 **18% 이상**
- 무기는 항상 몸보다 크게 읽혀야 한다.

## CHAPTER 10 — LIGHT RULE

항상 아래 순서를 유지한다.

1. Warm Sun / Warm Key Light
2. Blue Rim Light
3. Soft AO
4. Small Highlight

어두운 게임 라이팅은 금지한다.

## CHAPTER 11 — SHADOW RULE

- Soft Shadow
- 기본 Opacity: **40%**
- 순수 검정 그림자 금지

## CHAPTER 12 — OUTLINE RULE

아웃라인은 거의 사용하지 않는다. 대신 아래로 형태를 분리한다.

- AO
- Contrast
- Color Separation

## CHAPTER 13 — FACE EXPRESSION

- 기본: 살짝 웃음
- 분노: 눈썹만 변경
- 슬픔: 입만 변경
- 눈 크기는 어떤 표정에서도 절대 변하지 않는다.

## CHAPTER 14 — EQUIPMENT RULE

모든 장비는 교체 가능 파츠로 제작한다.

```text
Helmet
Shoulder
Weapon
Accessory
Back Item
```

## CHAPTER 15 — MODEL RULE

- Polygon: **6,000~10,000 triangles**
- Texture: **1024 또는 2048**
- Rig: **Humanoid**
- Clean Topology 필수

## CHAPTER 16 — ANIMATION RULE

모든 캐릭터는 아래 11개 클립을 가진다.

```text
Idle
Walk
Run
Attack1
Attack2
Skill1
Skill2
Hit
Death
Victory
Spawn
```

제작 방향:

```text
Front
45°
Side
135°
Back
```

좌우 반전을 사용한다.

## CHAPTER 17 — MONSTER RULE

- Cute 70%
- Cool 30%
- 징그러움 0%

## CHAPTER 18 — BOSS RULE

- 보스 크기: Player × 2
- 보스 무기: Player × 3
- 보스 FX: Player × 4

## CHAPTER 19 — UI RULE

모든 버튼:

```text
Gold Border
Blue Glow
Rounded
Depth
Drop Shadow
```

- Hover: Scale 105%
- Pressed: Scale 95%

## CHAPTER 20 — ICON RULE

```text
45° Perspective
Soft Shadow
Bright
One Object
No Background
```

## CHAPTER 21 — MAP RULE

모든 오브젝트:

```text
Large Shape
Simple Detail
Soft Edge
Hand Painted
```

## CHAPTER 22 — VFX RULE

```text
Outer Glow
Inner Glow
Gradient
Noise Minimal
Blur 10%
Round Cute Particle
```

## CHAPTER 23 — ABSOLUTE NEGATIVE RULE

- ❌ 현실적인 피부 질감
- ❌ 과도한 근육
- ❌ 긴 다리
- ❌ 긴 목
- ❌ 작은 눈
- ❌ 포토리얼 스타일
- ❌ 과도한 장식
- ❌ 복잡한 갑옷
- ❌ 저채도 색감
- ❌ 어두운 라이팅
- ❌ 검은 그림자
- ❌ 과도한 텍스처 노이즈
- ❌ 고어(피, 절단, 내장)
- ❌ 공포 분위기

## CHAPTER 24 — MASTER STYLE LOCK PROMPT

아래 원문은 절대 변경하지 않는다.

```text
MASTER STYLE LOCK — Dokkaebi Defense

AAA Korean Mobile Defense Game Asset, Premium Stylized 3D, Cute Chibi Character (2.3 heads proportion), Korean Folklore Fantasy, Highly Readable Silhouette, Large Expressive Eyes, Rounded Face, Tiny Body, Oversized Weapon, Hand-Painted Stylized PBR, Smooth Materials, Soft Ambient Occlusion, Warm Key Light, Cool Blue Rim Light, High Color Saturation, Bright Value Range, Rounded Beveled Shapes, Mobile Game Ready, Low Poly (6000–10000 triangles), Clean Topology, Orthographic Character Turnaround, White Background, Consistent Art Direction, Cute 70% + Cool 30%, No Photorealism, No Anime Illustration, No Realistic Skin, No Dark Mood, No Gore, No Horror, No Thin Limbs, No Long Neck, No Sharp Edges, No Overly Complex Details.
```

## APPROVAL GATE

아래 항목 중 하나라도 실패하면 `production-approved`를 부여하지 않는다.

1. 잠금 ID와 마스터 프롬프트 일치
2. 42/18/15/25 비율 및 머리 40~44% 준수
3. 얼굴 눈 크기 28%, 위치·표정 규칙 준수
4. 0.3초 실루엣 테스트 통과
5. 60/25/10/5 팔레트, 최대 4색, 무지개 금지
6. Rounded + Bevel 및 스타일라이즈드 재질 준수
7. Warm Key + Blue Rim + Soft AO + Highlight 준수
8. 6k~10k triangles, 1024/2048 텍스처, Humanoid Rig
9. 11개 필수 애니메이션 클립
10. 장비 5종 교체 파츠
11. 모바일 실제 화면 가독성 검수
12. 아트 리뷰와 기술 리뷰 모두 승인

## CHARACTER DNA v3.0 확장 원칙

`CHARACTER_DNA_v3.0`은 얼굴, 헤어, 직업, 희귀도, 애니메이션의 생성 규격을 확장하는 후속 시스템이다. 단, 어떤 DNA 규칙도 본 v2.0 절대 규칙을 변경·완화·우회할 수 없다.
