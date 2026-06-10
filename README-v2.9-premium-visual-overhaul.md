# v2.9 Premium Visual Overhaul Patch

## 핵심
- 타이틀/로그인 화면 대규모 리디자인
- 월드맵/스테이지 카드/전투 배경 2.5D 리마스터
- 31종 몬스터 스프라이트 재생성
- 타워 Lv.1~3 및 최종 진화 스프라이트 재생성
- HUD/패널/버튼/카드 UI 통일
- 기존 게임 로직을 최대한 건드리지 않는 안전형 대규모 디자인 패치

## 적용
`kingdom-seed-v2.9-patch` 내부 파일을 프로젝트 루트에 덮어쓰기 후:

```bash
npm run build
```

성공하면 GitHub Desktop에서 Commit/Push 하세요.

## 참고
이 패치는 대부분 기존 파일명에 맞춘 에셋 교체 방식입니다. 따라서 BootScene/GameScene 코드 변경 없이 기존 로딩 키로 새 디자인이 적용됩니다. `MenuScene.ts`는 타이틀 화면 문구만 v2.9 톤으로 정리한 저위험 수정입니다.
