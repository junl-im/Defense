# v2.19.0 Storybook Massive Art QA Patch

## 목적

v2.16~v2.18의 말랑/귀여운 UI 방향을 유지하면서, 로그인·로비·월드맵·전투 화면에 더 두꺼운 "스토리북 왕국" 장식 레이어를 추가하는 대량 패치입니다. 텍스트는 계속 코드가 소유하고, 신규 에셋은 투명 PNG/WebP 장식으로만 구성했습니다.

## 신규 에셋

- `public/assets/ui/v2_19/` 신규 PNG 61개
- 동일 파일명 WebP 61개
- 총 122개 신규 이미지 파일
- 주요군:
  - 스토리북 패널/토스트/상단 레이스/월드맵 프레임
  - 새싹 수호자, 쿠키 골렘, 양 마법사, 다람쥐 궁수, 푸딩 슬라임 마스코트
  - 로비 재화 쉘, 상점/우편/이벤트 배지
  - 월드맵 노드 블룸, 루트 리본, 보스 게이트, 컴퍼스
  - 전투 스킬 카드, 스킬 배지, 콤보 쿠키, 안전 코너, 마나 덩굴

## 코드 변경

- `src/game/CuteFantasyArtV219.ts` 추가
  - `addV219LoginArt`
  - `addV219LobbyArt`
  - `addV219WorldMapArt`
  - `addV219BattleArt`
  - `addV219ToastFrame`
- `BootScene`에 v2.19 에셋 로딩 추가
- WebP 최적화 로더 대상에 `assets/ui/v2_19` 추가
- `MenuScene`, `MainMenuScene`, `WorldMapScene`, `GameScene`에 v2.19 장식 레이어 적용
- 버전 칩과 scene-ready 이벤트를 `2.19.0`으로 갱신

## QA 수정

- 로비 최초 환영 토스트가 자동 표시될 때 클릭 SFX가 울리지 않도록 분리했습니다.
- 로비 토스트 지연 호출이 씬 전환 후 실행될 가능성을 가드했습니다.
- 로비/월드맵 토스트 hide timer가 종료 후 핸들을 비우도록 정리했습니다.
- 전투 메시지 hide timer가 텍스트 오브젝트 활성 상태를 확인한 뒤 숨기도록 정리했습니다.

## 검증

```bash
npx tsc --noEmit --pretty false
npm run build
```

둘 다 통과했습니다. Vite 빌드에서는 기존과 동일하게 큰 번들 경고가 표시됩니다.

## 적용

프로젝트 루트에 압축을 풀어 그대로 덮어씁니다. `.git`, `node_modules`, `dist`는 패치 zip에 포함하지 않습니다.
