# Kingdom Seed v1.2 Patch

## 핵심 변경

- 카카오톡 인앱 브라우저 대응 문구 제거
- 창모드 선택 버튼 제거
- 첫 터치 즉시 전체화면/가로모드 진입 시도
- 전체화면 이탈 시 재진입 시도
- 뒤로가기 게임 종료 팝업 유지
- 적 종류별 walk / attack / death 애니메이션 추가
- 적 이동 방향에 따른 down / side / up 모션 전환 추가
- 타워 Lv.3 특수 스킬 컷인 연출 추가

## 적용 파일

```txt
src/platform/WebShell.ts
src/style.css
src/main.ts
src/scenes/BootScene.ts
src/game/Enemy.ts
src/game/Tower.ts
src/game/Effects.ts
public/assets/sprites/enemy_*.png
docs/ANIMATION_PIPELINE.md
```

## 적용 후 확인

```bash
npm run build
```

성공하면 GitHub Desktop에서 커밋/푸시합니다.

```txt
Summary: Add v1.2 immersive shell enemy animations and tower cutins
```

배포 확인:

```txt
https://junl-im.github.io/Defense/?v=120
```
