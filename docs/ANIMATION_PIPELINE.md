# Animation Pipeline v1.1

## 목표

Kingdom Seed의 전투 손맛을 올리기 위해 모든 전투 유닛을 단일 idle strip에서 상태별 애니메이션 strip으로 확장합니다.

## 유닛 스프라이트 규격

- 파일 형식: PNG, 투명 배경
- 프레임 크기: 32x32
- 배치 방식: 가로 strip
- 총 프레임: 12프레임
- 총 이미지 크기: 384x32

```txt
프레임 0-3   idle
프레임 4-7   move
프레임 8-11  attack
```

## 파일명 규칙

```txt
public/assets/sprites/hero_knight.png
public/assets/sprites/soldier_blue.png
public/assets/sprites/mercenary_green.png
```

## 차후 확장 규격

v1.2 이후에는 적도 12프레임 규격으로 확장할 수 있습니다.

```txt
enemy_goblin.png
0-3    walk
4-7    attack 또는 cast
8-11   death
```

현재 적은 기존 4프레임 walk를 유지하고, 코드에서 피격 틴트/흔들림/사망 poof로 보강합니다.

## BGM 규격

```txt
public/assets/audio/bgm_world.wav   월드맵/로그인
public/assets/audio/bgm_battle.wav  일반 전투
public/assets/audio/bgm_boss.wav    보스 웨이브
```

웹 배포 용량을 고려해 짧고 반복 가능한 loop 파일을 권장합니다.
