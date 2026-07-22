# AAA 도깨비 디펜스 생성 프롬프트

이 파일은 `DD-AAA-CASUAL-SD-PBR-3.0` 스타일 잠금의 사람이 읽는 요약이다. 단일 진실 공급원은 `src/art-style-tokens.js`와 `docs/AAA_ASSET_PROMPT_CATALOG.json`이다.

## 절대 공통 프롬프트

```text
AAA Mobile Game Asset,
Premium Korean Mobile RPG Defense Game Style,
Cute Stylized 3D Character,
Chibi 2.3 Heads Proportion,
Large Expressive Eyes,
Rounded Face,
Tiny Body,
Soft Rounded Hands,
Simple Fingers,
Short Legs,
High Quality Hand Painted Texture,
Smooth Color Gradient,
No Realistic Skin,
Soft Ambient Occlusion,
Subtle Rim Light,
Clean Topology,
Game Ready,
Low Poly 6k~10k Triangles,
PBR Stylized,
Bright Saturated Colors,
Fantasy Korean Folklore Theme,
Mobile Game Quality,
Consistent Art Style,
Highly Readable Silhouette,
No Noise,
No Photorealism,
No Anime Illustration,
3D Model Concept,
Orthographic View,
Character Turnaround,
White Background
```

## 절대 네거티브 프롬프트

```text
photorealistic, realistic skin pores, anime illustration, 2D painting, long realistic body, thin limbs, tiny hands, tiny feet, western medieval realism, dark horror, muddy colors, noisy micro details, excessive ornaments, sharp realistic fingers, cinematic depth of field, dramatic perspective, cropped turnaround, inconsistent face, inconsistent proportions, text, watermark, logo
```

## 도깨비 전사

```text
Cute Korean Goblin Warrior, Blue Skin, Small Rounded Horns, Traditional Korean Hat, Oversized Wooden Club, Confident Friendly Smile, Simple Leather Armor, Korean Folklore Guardian, Front 45 Side 135 Back Turnaround, separated Head HairOrHat Body Weapon Accessory parts
```

## 도사

```text
Cute Taoist Master, Young Korean Exorcist, Traditional Robe, Paper Talismans, Magic Scroll, Long Rounded Sleeves, White Hair, Front 45 Side 135 Back Turnaround
```

## 호랑이 수호수

```text
Cute Tiger Guardian, Chibi Beast, Golden Orange Fur, Large Rounded Paws, Tiny Powerful Body, Friendly Expressive Face, Fantasy Korean Guardian, Front 45 Side 135 Back Turnaround
```

## 구미호

```text
Cute Nine-tailed Fox, Elegant Korean Fantasy, White Fur, Nine Large Grouped Tails, Blue Magic Aura, Front 45 Side 135 Back Turnaround
```

## 저승사자

```text
Cute Korean Grim Reaper, Oversized Traditional Gat, Rounded Black Robe, Blue Ghost Flame, Expressive Eyes Visible Under Hat, Front 45 Side 135 Back Turnaround
```

## 카탈로그

다음 명령으로 750종 프롬프트 카탈로그를 재생성한다.

```bash
npm run generate:prompt-catalog
```
