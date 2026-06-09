# Kingdom Seed v1.4 Patch

월드맵을 더 상용 모바일 디펜스 게임처럼 보이게 만드는 월드맵 연출 패치입니다.

## 포함 내용

- 스테이지 카드 보스 배지
- 클리어 등급별 카드 테두리
  - UNCLEARED
  - CLEAR
  - HEROIC
  - LEGEND
- 챕터별 제목/서브 카피 표시
- 챕터별 색상/안개 연출
- 카드 슬라이드 시 구름 스윕 전환
- 카드 슬라이드 시 카메라 pan/zoom 피드백
- 스테이지 상세 패널에 챕터/등급/보스 정보 추가

## 적용 파일

- src/scenes/WorldMapScene.ts
- docs/WORLDMAP_V14_DESIGN.md

## 적용 방법

압축을 풀고 기존 프로젝트 루트에 덮어쓰기 후:

```bash
npm run build
```

성공하면 GitHub Desktop에서 commit / push 하세요.
