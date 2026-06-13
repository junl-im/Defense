# KingdomSeed v2.36.8 - Local Result First Patch

## 목표

v2.36.7의 전투 중 아트 스트리밍 차단 원칙을 유지하면서, 전투 클리어 순간에 Firebase 청크/네트워크가 결과 화면 표시를 늦추지 않도록 한다.

## 변경 사항

- `src/services/localSave.ts`
  - `calcStageClearStars()`를 추가해 로컬/클라우드 저장의 별 계산 기준을 공유한다.
  - `completeLocalStageClear()`를 추가해 스테이지 클리어 기록을 네트워크 없이 즉시 확정한다.
  - `purchaseLocalPermanentUpgrade()`를 추가해 로컬 게스트의 연구소 업그레이드가 Firebase 청크 없이 저장되게 했다.

- `src/scenes/GameScene.ts`
  - 빠른 시작 local guest는 스테이지 클리어 시 Firebase 모듈을 불러오지 않고 로컬 저장 후 바로 결과 화면을 표시한다.
  - 런타임 가버너가 Firebase optional work를 막고 있는 환경에서도 로컬 저장/결과 화면을 우선한다.
  - 클라우드 저장이 실패해도 결과 화면이 멈추지 않고 로컬 기록으로 폴백한다.

- `src/scenes/LabScene.ts`
  - local guest 연구소 업그레이드는 Firebase import 없이 로컬 저장으로 처리한다.

- `src/services/firebase.ts`
  - 별 계산을 `localSave.ts`의 공통 함수로 통일했다.

- `Version.ts`, `package.json`, `package-lock.json`, `index.html`
  - 버전을 `2.36.8 LOCAL RESULT FIRST`로 갱신했다.

## 유지한 원칙

- 첫 접속/첫 탭 경로는 변경하지 않았다.
- BootScene 최소 프리로드 구조는 유지했다.
- 전투 중 무거운 아트 스트리밍 차단 정책은 유지했다.
- Firebase는 계정 연결/클라우드 저장이 필요할 때만 뒤에서 열린다.
- isolated white background 아이콘은 기본 전투에 연결하지 않았다.

## 검수 포인트

- 빠른 시작 -> 스테이지 클리어 시 결과 화면이 Firebase 대기 없이 바로 표시되는지 확인한다.
- `?safe=1` 또는 느린 네트워크 환경에서도 클리어 기록이 로컬에 저장되는지 확인한다.
- local guest로 연구소 업그레이드를 눌렀을 때 Firebase import 없이 별 차감/레벨 반영이 되는지 확인한다.
- Google/이메일 로그인 계정은 기존처럼 클라우드 저장과 리더보드가 동작하는지 확인한다.

## 검증

- `npm ci` 성공
- `npm run build` 성공
- Vite 대형 청크 경고는 기존 Phaser/Firebase 청크 경고이며 빌드 실패가 아니다.
