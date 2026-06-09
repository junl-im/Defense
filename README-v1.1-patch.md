# Kingdom Seed v1.1 Patch

## 핵심 변경

- 영웅 레온 모션 분리: idle / move / attack
- 병영 병사 모션 분리: idle / move / attack
- 용병 소환 유닛 모션 분리: idle / move / attack
- 적 피격 반응 강화: 히트 틴트, 흔들림, 넉백 느낌
- 타워 공격 모션 추가: 궁수/마법/포탑 발사 시 건물 반동과 틴트
- 월드맵 BGM, 일반 전투 BGM, 보스 웨이브 BGM 분리
- v1.0 Tower.ts setAlpha 타입 에러 수정 포함

## 덮어쓰기 파일

프로젝트 루트에 아래 폴더 구조 그대로 덮어쓰기하세요.

```txt
src/game/AudioManager.ts
src/game/Hero.ts
src/game/Soldier.ts
src/game/Enemy.ts
src/game/Tower.ts
src/scenes/BootScene.ts
src/scenes/MenuScene.ts
src/scenes/WorldMapScene.ts
src/scenes/GameScene.ts
public/assets/sprites/hero_knight.png
public/assets/sprites/soldier_blue.png
public/assets/sprites/mercenary_green.png
public/assets/audio/bgm_world.wav
public/assets/audio/bgm_battle.wav
public/assets/audio/bgm_boss.wav
docs/ANIMATION_PIPELINE.md
```

## 빌드 확인

```bash
npm run build
```

성공 후 GitHub Desktop에서:

```txt
Summary: Add v1.1 unit motion and split BGM
Commit to main
Push origin
```

배포 확인:

```txt
https://junl-im.github.io/Defense/?v=110
```

## 스프라이트 프레임 규격

이번 v1.1부터 유닛 스프라이트는 32x32 프레임 12장 가로 strip입니다.

```txt
0-3   idle
4-7   move
8-11  attack
```

파일 크기:

```txt
hero_knight.png      384x32
soldier_blue.png     384x32
mercenary_green.png  384x32
```
