# DOKKAEBI DEFENSE — AI ASSET PRODUCTION PROMPTS

- 절대 잠금: `DD-ABSOLUTE-ART-BIBLE-2.0`
- 단일 진실 공급원: `src/art-style-tokens.js`
- 사람이 읽는 원문: `docs/ABSOLUTE_ART_BIBLE_v2.0.md`
- 기계 검수 규격: `docs/ART_BIBLE_MACHINE_SPEC_v2.0.json`

## 절대 마스터 프롬프트

```text
MASTER STYLE LOCK — Dokkaebi Defense

AAA Korean Mobile Defense Game Asset, Premium Stylized 3D, Cute Chibi Character (2.3 heads proportion), Korean Folklore Fantasy, Highly Readable Silhouette, Large Expressive Eyes, Rounded Face, Tiny Body, Oversized Weapon, Hand-Painted Stylized PBR, Smooth Materials, Soft Ambient Occlusion, Warm Key Light, Cool Blue Rim Light, High Color Saturation, Bright Value Range, Rounded Beveled Shapes, Mobile Game Ready, Low Poly (6000–10000 triangles), Clean Topology, Orthographic Character Turnaround, White Background, Consistent Art Direction, Cute 70% + Cool 30%, No Photorealism, No Anime Illustration, No Realistic Skin, No Dark Mood, No Gore, No Horror, No Thin Limbs, No Long Neck, No Sharp Edges, No Overly Complex Details.
```

이 원문은 삭제·치환·순서 변경 없이 모든 생성 프롬프트 앞에 붙인다. 카테고리 프롬프트는 뒤에만 추가한다.

## 절대 네거티브

```text
realistic skin texture, skin pores, wrinkles, excessive muscles, long legs, long neck, small eyes, photorealism, excessive ornament, complex armor, low saturation, dark lighting, pure black shadow, excessive texture noise, gore, blood, dismemberment, organs, horror mood, thin limbs, sharp edges, anime illustration
```

## 생성 후 필수 검수

- 42/18/15/25 비율과 머리 40~44%
- 눈은 얼굴 폭 28%, 중앙보다 약간 아래
- 0.3초 실루엣, 대표 요소 3개
- 최대 4색, 60/25/10/5, 무지개 금지
- Rounded + Bevel, Warm Key + Blue Rim + Soft AO
- 6k~10k, 1024/2048, Humanoid, 11개 클립

750개 초기 프롬프트 카탈로그는 다음 명령으로 재생성한다.

```bash
npm run generate:prompt-catalog
```
