# Kingdom Seed v0.4 Patch

## 핵심 변경

- 월드맵 Stage 002 추가: 붉은 협곡
- Stage 002 잠금/해금 구조 추가
  - Stage 001을 1회 이상 클리어하면 Stage 002 입장 가능
- 적 종류 확장
  - 오크 돌격병
  - 방패병
  - 주술사
  - 독침 말벌
  - 오우거
- 웨이브 밸런스 조정
  - Stage 001: 10웨이브 입문용 유지, 골드 흐름 완화
  - Stage 002: 12웨이브, 방패병/비행/보스 조합 중심
- 인터페이스 그래픽 개선
  - 월드맵 노드 그래픽
  - Stage 001/002 테마 배경
  - 길/지형/장식 그래픽
  - HUD, 타워 스팟, 방사형 메뉴 개선
  - 적 외형 구분 강화
  - 연구소 UI 개선

## 적용 방법

압축을 풀고 프로젝트 루트에 그대로 덮어쓰기 하세요.

덮어쓰기 대상:

```txt
src/main.ts
src/game/types.ts
src/game/balance.ts
src/game/Enemy.ts
src/game/Tower.ts
src/scenes/MenuScene.ts
src/scenes/WorldMapScene.ts
src/scenes/LabScene.ts
src/scenes/GameScene.ts
src/services/firebase.ts
```

## 적용 후 확인

```bash
npm run build
```

성공하면 GitHub Desktop에서:

```txt
Summary: Add stage 2 and improved defense UI
Commit to main
Push origin
```

배포 후 캐시 방지 주소:

```txt
https://junl-im.github.io/Defense/?v=040
```

## 업로드된 에셋에 대한 메모

`Defense_Peuple.zip`를 확인했지만 현재 압축 안에는 브라우저에서 바로 쓸 수 있는 PNG/JPG/WebP/SVG 같은 그래픽 리소스가 들어있지 않습니다. RPG Maker VX Ace 계열 프로젝트 데이터(`.rvdata2`, `Game.exe`, `RGSS300.dll`) 중심이라 Phaser 웹게임에 직접 로드할 수 없습니다.

그래서 v0.4에서는 일단 Phaser 도형 기반의 임시 그래픽을 킹덤러쉬풍 UI 방향으로 강화했습니다. 다음에 아래 형식의 에셋을 주면 실제 스프라이트로 바로 교체할 수 있습니다.

```txt
public/assets/ui/*.png
public/assets/maps/*.png
public/assets/towers/*.png
public/assets/enemies/*.png
public/assets/heroes/*.png
```
