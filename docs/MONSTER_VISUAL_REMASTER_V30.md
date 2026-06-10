# Monster Visual Remaster v3.0

## Sprite sheet 규격

모든 enemy_*.png는 기존과 동일하게 1152x32입니다.

```txt
프레임 크기: 32x32
총 프레임: 36
0-3    walk_down
4-7    walk_side
8-11   walk_up
12-15  attack_down
16-19  attack_side
20-23  attack_up
24-27  death_down
28-31  death_side
32-35  death_up
```

## 디자인 원칙

1. 실루엣 우선
   - 멀리서 봐도 비행 / 탱커 / 마법 / 보스 구분이 되게 만들었습니다.

2. 2.5D 느낌
   - 픽셀 단색이 아니라 고해상도에서 형태를 만든 뒤 축소해 부드러운 하이라이트와 그림자를 남겼습니다.

3. 전투 가독성
   - 보스는 붉은/보라 오라, 비행몹은 날개 실루엣, 장갑몹은 금속/석재 광택을 강조했습니다.

4. 파일명 호환
   - 코드 수정 없이 기존 BootScene이 그대로 로드합니다.

## 추가 에셋

```txt
public/assets/ui/monster_preview_sheet_v30.png
public/assets/ui/monster_trait_armor.png
public/assets/ui/monster_trait_magic.png
public/assets/ui/monster_trait_flying.png
public/assets/ui/monster_trait_swift.png
public/assets/ui/monster_trait_boss.png
public/assets/ui/monster_trait_tank.png
public/assets/ui/boss_nameplate_*.png
public/assets/effects/fx_enemy_hit_premium.png
public/assets/effects/fx_elite_aura_v30.png
```

이 추가 에셋은 v3.1에서 전투 HUD/도감/보스컷인에 연결할 수 있습니다.
