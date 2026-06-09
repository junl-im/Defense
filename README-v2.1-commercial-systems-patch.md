# Kingdom Seed v2.1 Commercial Systems Patch

## 핵심

- PC에서는 더 이상 캔버스를 90도 회전하지 않습니다.
- 모바일 세로 화면에서만 CSS 회전 fallback을 적용합니다.
- PC/모바일 모두 첫 터치 후 전체화면 진입을 시도합니다.
- 유물 장착, 일일 도전, 업적 보상, 보스 고유 패턴을 추가합니다.
- 업로드한 무료 에셋 일부를 `public/assets/imported/`로 정리했습니다.

## 적용 파일

```txt
src/platform/WebShell.ts
src/style.css
src/main.ts
src/game/MegaSystems.ts
src/game/Tower.ts
src/game/Enemy.ts
src/scenes/BootScene.ts
src/scenes/WorldMapScene.ts
src/scenes/MetaScene.ts
src/scenes/GameScene.ts
public/assets/imported/*
docs/COMMERCIAL_SYSTEMS_V21.md
docs/ASSET_IMPORT_REPORT.md
```

## 적용 방법

기존 프로젝트 루트에 이 패치 폴더의 내용을 덮어쓰기 후:

```bash
npm run build
```

성공하면 GitHub Desktop에서 commit/push:

```txt
Summary: Add v2.1 commercial meta systems and desktop shell fix
```

배포 확인:

```txt
https://junl-im.github.io/Defense/?v=210
```

## 사용법

월드맵 하단의 `유물/도전` 버튼으로 전술 본부에 들어갑니다.

- 유물 장착: 최대 3개 장착
- 일일 도전: 매일 고정 스테이지와 modifier 제공
- 업적 보상: 클리어 기록 기반으로 유물/명예 수령
- 보스 패턴: 보스가 전투 중 보호막/회복/포효/속도 증가 발동
