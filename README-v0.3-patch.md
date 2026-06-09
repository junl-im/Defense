# Kingdom Seed v0.3 Patch

이번 패치는 기존 프로젝트에 아래 기능을 추가합니다.

- 월드맵 씬 추가
- 연구소 씬 추가
- 별을 소비하는 영구 업그레이드 추가
- 영구 업그레이드가 실제 전투 능력치에 반영
- 스테이지 클리어/실패 후 월드맵 복귀 버튼 추가
- Firebase 서비스에 purchasePermanentUpgrade, UpgradeKey, UPGRADE_META 추가

## 적용 방법

압축을 풀면 `src` 폴더가 있습니다. 기존 프로젝트 루트에 그대로 덮어쓰세요.

교체/추가되는 파일:

```txt
src/main.ts
src/services/firebase.ts
src/scenes/MenuScene.ts
src/scenes/WorldMapScene.ts
src/scenes/LabScene.ts
src/scenes/GameScene.ts
src/game/Tower.ts
```

## 적용 후 확인

```bash
npm run build
```

성공하면 GitHub Desktop에서 commit & push 합니다.

```txt
Summary: Add world map and laboratory upgrades
Commit to main
Push origin
```

배포 후 캐시 방지 주소:

```txt
https://junl-im.github.io/Defense/?v=030
```
