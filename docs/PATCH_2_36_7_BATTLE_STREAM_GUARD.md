# KingdomSeed v2.36.7 - Battle Stream Guard Patch

## 목표

v2.36.6의 2.5D 전장 톤은 유지하면서, 모바일 기본 플레이에서 전투 중 네트워크/GPU 아트 스트리밍이 끼어드는 위험을 줄인다.

## 변경 사항

- `BattleDepthArtBridge.ts`
  - 2.5D 스테이지 배경 + depth overlay는 기존처럼 GameScene 진입 후 가볍게 지연 로드한다.
  - 타워/몬스터/영웅 actor art 묶음은 웨이브가 돌지 않는 안전 구간에서만 로드한다.
  - 사용자가 전투 시작을 즉시 눌렀다면 actor art 로드를 다음 휴식 구간까지 미룬다.
  - 모바일/저메모리/저코어/느린 네트워크/데이터 절약 모드 기본값에서는 actor art 묶음 스트리밍을 생략하고, 배경 2.5D만 살린다.
  - `?combatart`, `?restore25d`, `?fullart`, `?ultraart` 검수 옵션은 유지하되 normal network + saveData off 조건에서만 actor art 로드 후보가 된다.

- `GameScene.ts`
  - 웨이브 시작 시 `battle-wave-active` 이벤트와 optional work pause를 발생시킨다.
  - 웨이브가 끝나고 적/스폰이 사라진 구간에 `battle-idle-safe` 이벤트를 발생시켜 지연된 actor art가 안전하게 재시도될 수 있게 했다.

- `Version.ts`, `package.json`, `package-lock.json`
  - 버전을 `2.36.7`로 갱신했다.

## 유지한 원칙

- 첫 접속/첫 탭 경로는 변경하지 않았다.
- BootScene 최소 프리로드 구조는 그대로 유지했다.
- isolated white background 아이콘은 기본 전투에 연결하지 않았다.
- 2.5D 배경 복구는 유지하되, 배우 아트 스트리밍은 안전 구간으로 제한했다.
- TypeScript 빌드 통과 상태를 유지한다.

## 검수 포인트

- 기본 주소 / `?quality=low` / `?safe=1`에서 첫 화면과 전투 진입이 정상인지 확인한다.
- 전투 시작 버튼을 즉시 눌러도 actor art 로드가 웨이브 중 끼어들지 않는지 확인한다.
- `?restore25d` 또는 `?combatart`에서 웨이브 휴식 구간에 배우 아트가 자연스럽게 갱신되는지 확인한다.
- 느린 네트워크/Save-Data 환경에서는 배경 2.5D만 적용되고 actor art 묶음은 생략되는지 확인한다.
