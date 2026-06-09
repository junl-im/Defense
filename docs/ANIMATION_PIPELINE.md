# Kingdom Seed Animation Pipeline v1.2

## Enemy sprite sheet

v1.2부터 적 스프라이트는 32x32 프레임 36장을 가로로 배치합니다.

```txt
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

파일 위치:

```txt
public/assets/sprites/enemy_goblin.png
public/assets/sprites/enemy_wolf.png
...
```

규칙:

- 이동 방향이 좌우면 side 모션을 사용하고, 왼쪽 이동은 `flipX`로 처리합니다.
- 위/아래 이동은 각각 up/down 모션으로 분리합니다.
- 병영/영웅에게 막힌 적은 attack 모션으로 전환합니다.
- HP가 0이 되면 death 모션을 1회 재생한 뒤 제거됩니다.

## Tower skill cut-in

타워가 Lv.3이 되거나 Lv.3 특수 효과가 전투 중 발동될 때 컷인 연출이 나옵니다.

컷인은 별도 이미지 없이 Phaser 도형 + 타워 Lv.3 스프라이트를 조합합니다.
나중에 전용 컷인 이미지를 붙일 경우 아래 키를 추가하는 방식으로 확장하면 됩니다.

```txt
public/assets/ui/cutin_archer.png
public/assets/ui/cutin_mage.png
public/assets/ui/cutin_barracks.png
public/assets/ui/cutin_artillery.png
```

## Web shell

v1.2에서는 카카오톡 인앱 브라우저 감지 문구를 표시하지 않습니다.
첫 터치 시 즉시 전체화면과 가로 고정을 시도하고, 실패 시 CSS 회전 fallback으로 가로 전투 화면을 유지합니다.
