# 업로드 에셋 반영 리포트

다음 업로드 파일에서 웹에서 바로 쓸 수 있는 PNG 에셋 일부를 선별해 `public/assets/imported/`에 배치했습니다.

- `public/assets/imported/ui/ui_wenrexa_button.png` ← `Wenrexa Interface UI KIT #4.zip` / `Wenrexa Interface UI KIT #4/PNG/Btn01.png` / (357, 57)
- `public/assets/imported/ui/ui_wenrexa_panel.png` ← `Wenrexa Interface UI KIT #4.zip` / `Wenrexa Interface UI KIT #4/PNG/Panel04.png` / (443, 49)
- `public/assets/imported/ui/ui_wenrexa_arrow_left.png` ← `Wenrexa Interface UI KIT #4.zip` / `Wenrexa Interface UI KIT #4/PNG/Icons/ArrowsLeft.png` / (48, 84)
- `public/assets/imported/ui/ui_wenrexa_arrow_right.png` ← `Wenrexa Interface UI KIT #4.zip` / `Wenrexa Interface UI KIT #4/PNG/Icons/ArrowsRight.png` / (48, 84)
- `public/assets/imported/ui/ui_wenrexa_circle.png` ← `Wenrexa Interface UI KIT #4.zip` / `Wenrexa Interface UI KIT #4/PNG/Icons/Circle01.png` / (130, 130)
- `public/assets/imported/ui/ui_medieval_sheet.png` ← `UIBundleFree.zip` / `UIBundleFree/MediavelFree.png` / (256, 128)
- `public/assets/imported/characters/tiny_soldier_walk.png` ← `Tiny RPG Character Asset Pack v1.03b -Free Soldier&Orc.zip` / `Tiny RPG Character Asset Pack v1.03 -Free Soldier&Orc/Characters(100x100)/Soldier/Soldier/Soldier-Walk.png` / (800, 100)
- `public/assets/imported/characters/tiny_orc_walk.png` ← `Tiny RPG Character Asset Pack v1.03b -Free Soldier&Orc.zip` / `Tiny RPG Character Asset Pack v1.03 -Free Soldier&Orc/Characters(100x100)/Orc/Orc/Orc-Walk.png` / (800, 100)
- `public/assets/imported/characters/loot_adventurer_32_sheet.png` ← `LOOT PIXELS - Adventure Pack_v1.1_.zip` / `adventurer_001/adventurer_001_32_spritesheet.png` / (384, 320)
- `public/assets/imported/tiles/infernus_altar.png` ← `PVGames_Infernus_Free.zip` / `Infernus_Tiles/Infernus_Altar1_1.png` / (128, 128)
- `public/assets/imported/tiles/infernus_lightsources.png` ← `PVGames_Infernus_Free.zip` / `Infernus_Tiles/Anim_Infernus_Lightsources_1.png` / (192, 384)

## 확인한 에셋 유형

```txt
Wenrexa UI KIT
- 버튼, 패널, 화살표, 원형 장식 UI

UIBundleFree
- 중세풍 UI atlas 샘플

Tiny RPG Character Asset Pack
- Soldier / Orc walk spritesheet

LOOT PIXELS Adventure Pack
- 32px adventurer spritesheet

PVGames Infernus
- 지옥/화산 테마 타일, 오브젝트, 광원
```

## 다음 실제 적용 추천

1. `tiny_soldier_walk.png`, `tiny_orc_walk.png`를 32x32 또는 48x48 전투 규격으로 재패킹
2. Wenrexa 버튼/패널을 로그인/월드맵/메타 UI에 우선 적용
3. PVGames Infernus 타일은 Stage 006 용의 화산과 Stage 008 결전맵 장식으로 적용
4. LOOT PIXELS는 영웅/유물 상점 NPC용으로 활용
