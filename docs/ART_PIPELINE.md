# Kingdom Seed Art Pipeline v1.0

이 문서는 실제 아트 에셋을 계속 교체/확장하기 위한 기준입니다.

## 1. 전투맵 배경

위치:

```txt
public/assets/maps/battle_stage_001.png
public/assets/maps/battle_stage_002.png
public/assets/maps/battle_stage_003.png
public/assets/maps/battle_stage_004.png
```

규격:

```txt
960 x 540 PNG
좌표계: Phaser GameScene 기준과 동일
상단 64px, 하단 60px은 HUD가 덮음
주 이동 경로는 코드에서 한 번 더 그려지므로 배경에는 장식/지형 위주 권장
```

권장 레이어 구성:

```txt
1_bg_sky_or_far.png
2_ground_paint.png
3_props_trees_rocks.png
4_path_underpaint.png
5_light_shadow_overlay.png
```

최종 납품은 flatten된 `battle_stage_XXX.png` 한 장으로 넣으면 됩니다.

## 2. 전투 이펙트 spritesheet

위치:

```txt
public/assets/effects/fx_build_dust.png
public/assets/effects/fx_upgrade_burst.png
public/assets/effects/fx_death_poof.png
public/assets/effects/fx_explosion_burst.png
```

규격:

```txt
프레임 크기: 64 x 64
가로 한 줄 spritesheet
투명 PNG
```

현재 프레임 수:

```txt
fx_build_dust.png      6 frames
fx_upgrade_burst.png   8 frames
fx_death_poof.png      6 frames
fx_explosion_burst.png 7 frames
```

프레임 수를 변경하면 `src/scenes/BootScene.ts`의 animation 생성 범위도 같이 수정해야 합니다.

## 3. 타워 외형

위치:

```txt
public/assets/sprites/tower_archer_lv1.png
public/assets/sprites/tower_archer_lv2.png
public/assets/sprites/tower_archer_lv3.png
public/assets/sprites/tower_mage_lv1.png
...
```

규격:

```txt
권장 48 x 48 PNG
투명 배경
피벗 기준: 이미지 중앙 하단이 타워 중심처럼 보이도록 구성
```

## 4. 유닛/적 spritesheet

위치:

```txt
public/assets/sprites/hero_knight.png
public/assets/sprites/soldier_blue.png
public/assets/sprites/enemy_goblin.png
...
```

규격:

```txt
프레임 크기: 32 x 32
가로 4프레임
0~3: 걷기/대기 loop
```

v1.1부터는 공격/사망 모션을 별도 spritesheet로 분리할 수 있습니다.

## 5. asset-manifest.json

새 에셋을 추가하면 `public/assets/asset-manifest.json`에 경로를 기록합니다. 현재 게임 코드는 직접 key를 로드하지만, 문서/검수/자동화 기준으로 manifest를 유지합니다.

## 6. 아트 방향

목표는 오리지널 중세 판타지 디펜스입니다.

```txt
두꺼운 외곽선
따뜻한 골드/양피지 UI
약간 과장된 비율의 타워와 적
모바일에서 식별 가능한 큰 실루엣
```

기존 게임의 상표/로고/캐릭터를 직접 복제하지 않고, 장르적 감성만 참고합니다.
