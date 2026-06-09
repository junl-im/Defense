# Kingdom Seed v0.9 Patch

## 핵심 변경

- 월드맵을 도형 기반 화면에서 그래픽 카드형 UI로 교체
- 스테이지 선택 카드, 상세 패널, 명예의 전당 패널 개선
- 스테이지 노드 선택/잠금/별 표시 연출 강화
- 타워 Lv.1 / Lv.2 / Lv.3 외형 이미지 분리
- 타워 업그레이드 시 실제 스프라이트 교체
- 아트 파이프라인 문서 갱신

## 적용 방법

압축을 풀고 `kingdom-seed-v0.9-patch` 폴더 안의 내용을 기존 프로젝트 루트에 덮어쓰기 합니다.

수정/추가 파일:

```txt
src/scenes/BootScene.ts
src/scenes/WorldMapScene.ts
src/game/Tower.ts
public/assets/ui/*
public/assets/maps/stage_card_*.png
public/assets/sprites/tower_*_lv*.png
docs/ART_PIPELINE.md
```

## 적용 후 확인

```bash
npm run build
```

성공하면 GitHub Desktop에서 커밋 후 Push합니다.

```txt
Summary: Add world map art cards and tower level sprites
```

배포 후 확인:

```txt
https://junl-im.github.io/Defense/?v=090
```
