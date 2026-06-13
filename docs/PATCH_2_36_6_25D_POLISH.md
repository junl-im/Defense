# KingdomSeed v2.36.6 - 2.5D Polish Harmonization Patch

## 목표
v2.36.5에서 복구한 2.5D 에셋을 본 게임 기본 비주얼로 안정화한다. 배경 원화, 코드맵 보정, 프리미엄 그래픽 레이어가 서로 싸우지 않도록 투명도와 라벨 정책을 정리했다.

## 변경 사항
- `BattleDepthPolish.ts` 추가
  - 2.5D 기본 모드 판단과 레이어 알파 프로필을 중앙 관리한다.
  - `?raw25d`, `?soft25d`, `?bold25d`, `?battlecrest`, `?gatelabels` 검수 옵션을 제공한다.
- `BattleDepthArtBridge.ts`
  - 2.5D 배경/오버레이 알파와 페이드 시간을 폴리시 프로필로 조정한다.
  - 파일 하나가 실패해도 바로 완료 처리하지 않고, 전체 로더 COMPLETE까지 기다리도록 수정했다.
- `PremiumBattlePresentation.ts`
  - 2.5D 모드에서는 코드 지형/경로/글로우/커튼을 더 은은하게 처리한다.
  - 상단 스테이지 크레스트는 기본 숨김으로 바꿔 HUD와 중복되는 산만함을 줄였다.
  - 중복 `title.add()` 호출을 제거했다.
- `PremiumBattleComposition.ts`
  - 2.5D 모드에서는 진입/수호핵 텍스트 라벨을 기본 숨김 처리한다.
  - 프레임/게이트/건설 패드 알파를 2.5D 배경에 맞춰 조정한다.
- `GameScene.ts`
  - `drawCanyonDetails()`의 중복 `this.add` 잔여 코드를 정리했다.

## QA 옵션
- 기본: 2.5D 폴리시 모드
- `?raw25d`: 배경 원화 확인용, 코드 보정 레이어 최소화
- `?soft25d`: 더 차분한 레이어 합성
- `?bold25d`: 2.5D와 프리미엄 그래픽을 더 강하게 표시
- `?battlecrest`: 상단 스테이지 크레스트 다시 표시
- `?gatelabels`: 진입/수호핵 라벨 다시 표시
- `?no25d` 또는 `?flatbattle`: 2.5D 비활성화
