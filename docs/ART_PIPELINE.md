# Kingdom Seed Art Pipeline v0.9

이 문서는 실제 아트를 붙일 때 파일명과 프레임 규격을 흔들리지 않게 유지하기 위한 기준입니다.

## 1. 월드맵 UI

```txt
public/assets/ui/world_map_painted.png      960x540 월드맵 배경
public/assets/ui/stage_card_frame.png       300x170 투명 카드 프레임
public/assets/ui/stage_card_locked.png      300x170 잠금 카드 프레임
public/assets/ui/panel_detail_large.png     330x360 스테이지 상세 패널
public/assets/ui/banner_worldmap.png        440x84 월드맵 상단 배너
public/assets/ui/icon_star_large.png        36x36 별 아이콘
public/assets/ui/icon_lock.png              48x48 잠금 아이콘
```

스테이지 카드 썸네일은 아래 규격을 사용합니다.

```txt
public/assets/maps/stage_card_001.png       300x170
public/assets/maps/stage_card_002.png       300x170
public/assets/maps/stage_card_003.png       300x170
public/assets/maps/stage_card_004.png       300x170
```

새 스테이지가 추가되면 `stage_card_005.png` 형식으로 추가하고 `BootScene.ts`에 로드 키를 추가합니다.

## 2. 타워 레벨 외형

v0.9부터 타워는 레벨별 이미지를 사용합니다.

```txt
public/assets/sprites/tower_archer_lv1.png      64x64
public/assets/sprites/tower_archer_lv2.png      64x64
public/assets/sprites/tower_archer_lv3.png      64x64
public/assets/sprites/tower_mage_lv1.png        64x64
public/assets/sprites/tower_mage_lv2.png        64x64
public/assets/sprites/tower_mage_lv3.png        64x64
public/assets/sprites/tower_barracks_lv1.png    64x64
public/assets/sprites/tower_barracks_lv2.png    64x64
public/assets/sprites/tower_barracks_lv3.png    64x64
public/assets/sprites/tower_artillery_lv1.png   64x64
public/assets/sprites/tower_artillery_lv2.png   64x64
public/assets/sprites/tower_artillery_lv3.png   64x64
```

코드는 `tower-{kind}-lv{level}` 키를 우선 사용하고, 파일이 없으면 기존 `tower-{kind}` 이미지로 fallback합니다.

## 3. 캐릭터/적 스프라이트

현재 기준:

```txt
영웅/병사/적: 32x32, 가로 4프레임
프레임 0~3: idle/walk loop
```

다음 확장 후보:

```txt
32x32 x 8프레임
0~3: walk
4~5: attack
6: hit
7: death
```

## 4. 사운드

```txt
public/assets/audio/click.wav
public/assets/audio/build.wav
public/assets/audio/upgrade.wav
public/assets/audio/shoot.wav
public/assets/audio/hit.wav
public/assets/audio/magic.wav
public/assets/audio/explosion.wav
public/assets/audio/wave.wav
public/assets/audio/win.wav
public/assets/audio/lose.wav
public/assets/audio/music_loop.wav
```

모바일 인앱 브라우저 대응을 위해 사운드는 첫 터치 이후 unlock 처리됩니다.
