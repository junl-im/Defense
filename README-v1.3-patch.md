# Kingdom Seed v1.3 Patch

## 핵심 변경

- 월드맵을 기존 고정 노드 방식에서 좌우 슬라이드형 스테이지 셀렉터로 변경
- 터치/드래그/스와이프 조작 지원
- PC에서는 좌우 화살표와 하단 스테이지 도트로 이동 가능
- 스테이지 카드 중심형 레이아웃으로 UI 개편
- 잠금 스테이지 카드, 별 진행도, 최고 점수 표시 강화
- 오른쪽 상세 패널과 오늘의 명예의 전당 유지
- 모바일 가로 화면 기준으로 월드맵 가독성 개선

## 적용 파일

아래 파일을 기존 프로젝트에 덮어쓰기 합니다.

```txt
src/scenes/WorldMapScene.ts
docs/WORLDMAP_SLIDER_PIPELINE.md
```

## 적용 후 확인

```bash
npm run build
```

성공하면 GitHub Desktop에서 커밋/푸시합니다.

```txt
Summary: Add v1.3 sliding world map redesign
Commit to main
Push origin
```

배포 확인:

```txt
https://junl-im.github.io/Defense/?v=130
```
