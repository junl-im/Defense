# Kingdom Seed v4.1 Premium Polish Pass

## 목적
v4.0 이후 발견될 수 있는 UX/비주얼 문제를 계속 추적하고, 상용 모바일 디펜스 게임처럼 보이는 마감 요소를 추가한다.

## 주요 개선점
- PC는 절대 회전하지 않는 CSS 기준 재확인
- 모바일 safe-area 보강
- 로딩/토스트/경고/전술 패널용 프리미엄 UI 에셋 추가
- 클릭/버튼/보상 마이크로 인터랙션 FX 추가
- QA 점검용 `PolishAuditV41` 추가
- 향후 UI 적용용 `PremiumMicroInteractions` 유틸 추가

## 적용 기준
이번 패치는 저위험 패치다. 기존 GameScene 로직을 직접 바꾸지 않고, 프리미엄 UI/UX 다듬기에 필요한 공통 에셋과 유틸을 추가한다.

## 다음 연결 후보
- 전투 시작 로딩 화면에 `premium_loading_frame_v41` 연결
- 타워 패널 버튼 클릭 시 `PremiumMicroInteractions.press()` 연결
- 보상 상자 개봉 시 `fx_reward_glimmer_v41` 연결
- `?qa` 모드에서 `PolishAuditV41.inspect()` 결과 표시
