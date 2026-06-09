# Asset Placement Guide

Phaser에서 바로 쓰려면 브라우저가 읽을 수 있는 이미지 파일로 넣는 것이 좋습니다.

권장 구조:

```txt
public/assets/ui/
public/assets/maps/
public/assets/towers/
public/assets/enemies/
public/assets/heroes/
public/assets/effects/
public/assets/audio/
```

권장 포맷:

- 이미지: png, webp, jpg, svg
- 사운드: mp3, ogg, wav

RPG Maker 프로젝트 파일인 `.rvdata2`, `Game.exe`, `RGSS300.dll`은 Phaser 웹게임에서 직접 로드할 수 없습니다.
캐릭터/타일셋을 png 또는 webp로 추출해서 위 폴더에 배치해야 합니다.
