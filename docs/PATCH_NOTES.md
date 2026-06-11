# Patch Notes

## v1.0 - Login/Main Menu Clean UI Reset

- 버전 네이밍을 새 기준 `v1.0`으로 초기화했습니다.
- 로그인 화면을 `배경 이미지 + 코드 UI` 구조로 재정리했습니다.
  - 배경: `public/assets/backgrounds/login_background_v1_0.png`
  - 로고/상단칩/로그인 패널/버튼/푸터: Phaser 코드 UI
- 신규 `MainMenuScene`을 추가했습니다.
  - 로그인 성공 후 바로 월드맵으로 가지 않고 메인 메뉴로 진입합니다.
  - 메인 메뉴 배경: `public/assets/backgrounds/main_menu_background_v1_0.png`
  - 메뉴 카드/하단 독/능력치 칩/토스트는 모두 코드 UI로 렌더링합니다.
- 제공된 참고 에셋 시트에서 v1.0 장식용 영웅/타워/몬스터 PNG를 분리해 적용했습니다.
- 공통 코드 UI 헬퍼 `src/game/CodeUiKit.ts`를 추가해 이후 화면도 같은 방식으로 확장할 수 있게 했습니다.

## 적용 원칙

- 배경 이미지에는 로고/버튼/로그인창/메뉴 패널 텍스트를 굽지 않습니다.
- 로고, 버튼, 패널, 칩, 토스트는 코드로 그립니다.
- 캐릭터/타워/몬스터는 장식 에셋으로 분리해 씬에서 배치합니다.

## v1.1.0 - World Map Code UI Art Pass
- 월드맵을 배경 이미지 + 코드 UI 구조로 리마스터했습니다.
- 신규 월드맵 배경 `assets/backgrounds/worldmap_background_v1_1.png`를 추가했습니다.
- 스테이지 카드, 경로 노드, 상세 패널, 하단 독을 코드 기반 UI로 정리했습니다.
- 로그인 버전 칩을 `v1.1.0 WORLD MAP ART PASS`로 갱신했습니다.

## v1.9.0 - Viewport QA + Art Sync
- 모바일 세로 화면에서 게임이 작게 보이던 문제를 중앙 회전/전체 채움 방식으로 보정.
- 방향 전환과 전체화면 이후 Phaser ScaleManager 재계산 이벤트 추가.
- 로그인/메인/월드맵/전투 배경, HUD, 타워, 유닛을 v1.9 에셋으로 동기화.
- 타워 건설 메뉴 중첩 방지와 클릭존 점검 모드(`?hit=1`) 추가.


## v2.16.0 - Cute Fantasy Art Foundation + Mobile QA
- `public/assets/ui/v2_16/`에 말랑한 패널, 리본, 별, 하트, 구름, 보석, 스테이지 핀, 타워/몬스터 배지 에셋을 추가했습니다.
- `CuteFantasyPolishV216.ts`를 추가해 로그인/로비/월드맵/전투 장식 레이어를 공통화했습니다.
- WebP 로더 대상에 v2.16 UI 경로를 포함해 모바일 로딩 부담을 줄였습니다.
- 로비 시작 토스트 중복 호출을 1회로 정리했습니다.
- QA: `npx tsc --noEmit` 및 `npm run build` 통과.

## v2.18.0 - Massive Plush Kingdom Art Pass + Runtime QA Sweep
- `public/assets/ui/v2_18/`에 44종 PNG + WebP 세트, 합계 88개 신규 말랑 판타지 에셋을 추가했습니다.
- 로그인/로비/월드맵/전투 화면에 `CuteFantasyArtV218.ts` 기반 장식 레이어를 추가했습니다.
- WebP 최적화 로더 대상에 `v2_18` UI 경로를 포함했습니다.
- 전투 콤보 토스트 타이머를 단일 관리로 정리해 연속 처치 표시가 조기 종료되는 문제를 완화했습니다.
- 보스 패턴 이벤트 리스너를 씬 종료 시 해제하도록 정리했습니다.
- QA: `npx tsc --noEmit --pretty false` 및 `npm run build` 통과.
## v2.19.0 - Storybook Massive Art QA
- `public/assets/ui/v2_19/`에 신규 PNG 61개 + WebP 61개, 총 122개 스토리북 판타지 에셋을 추가했습니다.
- `CuteFantasyArtV219.ts`를 추가해 로그인/로비/월드맵/전투 장식 레이어를 v2.19로 확장했습니다.
- WebP 최적화 로더 대상에 `v2_19` UI 경로를 포함했습니다.
- 로비 자동 환영 토스트의 클릭 SFX 중복감을 제거하고, 씬 전환 후 지연 토스트 실행을 가드했습니다.
- 전투 메시지 hide timer가 오브젝트 활성 상태를 확인하도록 정리했습니다.
- QA: `npx tsc --noEmit --pretty false` 및 `npm run build` 통과.
## v2.21.0 - Candy Kingdom Massive Art QA
- `public/assets/ui/v2_21/`에 신규 PNG 71개 + WebP 71개, 총 142개 캔디 왕국 판타지 에셋을 추가했습니다.
- `CuteFantasyArtV221.ts`를 추가해 로그인/로비/월드맵/전투 장식 레이어를 v2.21로 확장했습니다.
- `SceneSafety.ts`를 추가해 씬 종료 후 지연 콜백/토스트 타이머가 실행되는 경로를 더 안전하게 정리했습니다.
- WebP 최적화 로더 대상에 `v2_21` UI 경로를 포함했습니다.
- 전투 자동 웨이브 정리 시 spawn timer 제거를 보강하고, 메시지/콤보/전술 힌트/보상 연출 지연 호출을 안전 호출로 교체했습니다.
- QA: `npx tsc --noEmit --pretty false` 및 `npm run build` 통과.

## v2.20.0 - Toy Garden Massive Art QA
- `public/assets/ui/v2_20/`에 신규 PNG 64개 + WebP 64개, 총 128개 토이 가든 판타지 에셋을 추가했습니다.
- `CuteFantasyArtV220.ts`를 추가해 로그인/로비/월드맵/전투 장식 레이어를 v2.20로 확장했습니다.
- WebP 최적화 로더 대상에 `v2_20` UI 경로를 포함했습니다.
- 로그인 비동기 상태 갱신, 로비/월드맵 토스트, 전투 지연 호출/스폰 스트림/메시지 타이머에 씬 생존 가드를 추가했습니다.
- QA: `npx tsc --noEmit --pretty false` 및 `npm run build` 통과.

## v2.22.0 - Moonberry Nursery Massive Art QA
- `public/assets/ui/v2_22/`에 신규 PNG 91개 + WebP 91개, 총 182개 문베리 보육실 판타지 에셋을 추가했습니다.
- `CuteFantasyArtV222.ts`를 추가해 로그인/로비/월드맵/전투 장식 레이어를 v2.22로 확장했습니다.
- BootScene WebP 최적화 로더 대상에 `v2_22` UI 경로를 포함하고 중복 로드 1건을 정리했습니다.
- `SceneSafety.ts` 헬퍼를 보강하고 전투/보상/프리미엄 토스트/전술 HUD 일부 지연 호출을 안전 호출로 교체했습니다.
- QA: `npx tsc --noEmit --pretty false` 및 `npm run build` 통과.

## v2.26.0 - Atelier Ultra Polish + Performance QA
- `public/assets/ui/v2_26/`에 PNG 138개 + WebP 138개, 총 276개 원화풍 아틀리에 에셋을 추가했습니다.
- `PremiumIllustrationArtV226.ts`를 추가해 로그인/로비/월드맵/전투 화면의 고퀄 레이어를 확장했습니다.
- `ProgressiveAssetLoader.ts`에 로딩 큐와 씬별 코어 에셋 예산을 추가해 첫 탭/첫 전환 중 로더가 몰리지 않도록 정리했습니다.
- 로그인 화면의 고퀄 아트 스트리밍과 Firebase 확인을 지연시켜 첫 시작 직후 CPU/네트워크 경쟁을 줄였습니다.
- v2.26 핵심 아트는 기본 모드에서 제한 로드, 대량 갤러리 아트는 `?fullart`/`?galleryart`에서만 로드합니다.
- QA: `npx tsc --noEmit --pretty false` 통과. `npm run build`는 원본 zip의 기존 `node_modules` 권한/optional binding 문제로 의존성 재설치가 필요합니다.

