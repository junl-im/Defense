# v1.2.0 High Quality Art Pass

## 목표
- 로그인/메인 메뉴/월드맵의 배경은 이미지 에셋으로 유지한다.
- 로고, 버튼, 패널, 스테이지 UI는 Phaser 코드 UI로 유지한다.
- 제공된 레퍼런스처럼 더 밝고 아기자기한 프리미엄 판타지 톤으로 보정한다.

## 변경 사항
- `package.json` 버전 `1.2.0`으로 갱신
- 신규 고화질 배경 에셋 추가
  - `public/assets/backgrounds/login_background_v1_2.png`
  - `public/assets/backgrounds/main_menu_background_v1_2.png`
  - `public/assets/backgrounds/worldmap_background_v1_2.png`
- 신규 프리미엄 데코 컷아웃 추가
  - `public/assets/v1_2/decor/*_v1_2.png`
  - 기존 v1.0 컷아웃 대비 색감, 명암, 선명도, 림라이트, 그림자, 글로우 보강
- `BootScene`의 v1 시각 에셋 로딩을 v1.2 경로로 교체
- `CodeUiKit` 리마스터
  - 패널: 입체 그림자, 외곽 글로우, 이중 테두리, 보석 코너, 타이틀 리본 추가
  - 버튼: 베벨 하이라이트, 엔드캡 보석, 호버 글로우, 클릭 스파크 개선
  - 로고: 왕관/날개/리본/이중 타이틀 구조로 고급화
  - 배경 커버 이미지에 LINEAR 필터 적용
  - 플로팅 스파클을 보석빛/금빛 파티클로 보강

## 적용 방식
패치 zip을 프로젝트 루트에 덮어쓴 뒤 아래 명령으로 확인한다.

```bash
npm install
npm run build
npm run dev
```
