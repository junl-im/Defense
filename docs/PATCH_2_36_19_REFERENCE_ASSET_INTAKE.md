# v2.36.19 REFERENCE ASSET INTAKE

## 목표

사용자가 제공한 KingdomSeed 고퀄 UI/전투 시안 콜라주를 그대로 통째로 쓰지 않고, 글씨가 섞이지 않는 오브젝트 중심 자산으로 분해해 런타임에 안전하게 연결한다.

## 핵심 원칙

- 원본 이미지는 UI 시안 콜라주이므로 버튼/라벨/한글/영문 텍스트가 포함된 영역은 런타임 자산에서 제외한다.
- 타워, 몬스터, 영웅, 스킬 아이콘만 수동 no-text crop으로 추출한다.
- 새 자산은 기본 BootScene/첫 탭에 싣지 않는다.
- 전투 중에는 새 자산을 스트리밍하지 않는다.
- 메뉴/월드맵에서 먼저 로드되면 전투 입장 시 즉시 사용하고, 직접 전투로 들어온 경우에는 전투 유휴 구간에서만 로드한다.
- Save-Data, 느린 네트워크, 오프라인, 런타임 락다운에서는 자동 생략한다.

## 추가 자산

경로:

- `public/assets/reference/v2_36_19/no_text/`
- `public/assets/reference/v2_36_19/reference_asset_manifest_v2_36_19.json`
- `public/assets/reference/v2_36_19/reference_pack_contact_sheet_no_text.png`

구성:

- 타워 6종
- 몬스터 8종
- 영웅 5종
- 스킬 아이콘 6종

총 런타임 PNG 크기 약 440KB, WebP 약 134KB다. Phaser 로더는 WebP 지원 브라우저에서는 WebP를 우선 사용하고, 지원하지 않으면 PNG를 사용한다.

## 코드 변경

- `ReferenceAssetPack.ts` 추가
  - no-text reference asset key/path 중앙 관리
  - WebP/PNG 자동 선택
  - 네트워크/Save-Data/lockdown 정책 반영
  - 전투 유휴 구간 게이트 제공
- `AssetMap.ts`
  - 타워/몬스터/영웅 텍스처 우선순위에 reference asset pack 추가
  - isolated white-background icon mock은 기본 전투에 여전히 쓰지 않음
- `Tower.ts`
  - reference asset pack 로드 후 기존 타워를 새 텍스처로 refresh 가능
- `Enemy.ts`
  - reference asset pack 로드 후 기존 몬스터를 새 no-text 텍스처로 refresh 가능
- `Hero.ts`
  - 선택 영웅에 맞는 reference hero art refresh 가능
- `GameScene.ts`
  - reference asset pack은 전투 유휴 구간에서만 로드
  - 로드 완료 시 현재 타워/몬스터/영웅/스킬 버튼 아이콘 refresh
- `MainMenuScene.ts`, `WorldMapScene.ts`
  - 전투 전 메뉴/월드맵 체류 중 reference pack 조용히 선로드

## 새 검수 옵션

- `?refart`
- `?referenceart`
- `?userassets`
- `?conceptassets`
- `?assetintake`
- `?norefart`
- `?noreferenceart`
- `?legacyreferenceart`
- `?textsheet`
- `?pngart`

## 안전 장치

- 첫 접속/첫 탭 로드에 미포함
- BootScene 미변경
- Firebase/PWA/오디오 지연 정책 유지
- Save-Data/느린 네트워크/오프라인/lockdown 자동 생략
- 전투 중 waveRunning 상태에서는 로드 지연
- `kingdom-seed:battle-idle-safe` 이벤트 이후 재시도
- 로드 실패해도 기존 2.5D/코드 기반 fallback 유지

## 결과

본 게임 기본 전투에서 isolated icon/sticker art를 쓰지 않으면서, 사용자가 제공한 고퀄 시안의 타워/몬스터/영웅/스킬 오브젝트를 텍스트 없는 runtime asset으로 활용할 수 있게 되었다.
