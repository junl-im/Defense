# v2.34.0 Runtime Stability / Network QA Patch

## 목표
- 약한 네트워크와 모바일 실기기에서 첫 탭, 씬 전환, 전투 진입 순간의 멈춤을 더 줄인다.
- 대용량 원화풍 에셋은 기본 실행에서 계속 분리하고, 선택형 로딩도 전역 런타임 가버너 아래에서만 동작하게 한다.
- 첫 접속 화면 정체성은 v2.29 복구 계열을 유지한다.

## 변경
- RuntimeLoadGovernor에 critical input settle window 추가.
- pointer/touch/key/user activation 직후 optional art/PWA/Firebase 작업을 잠시 차단.
- runtime watch/lockdown 이벤트 발생 시 optional work pause 강화.
- ProgressiveAssetLoader가 Phaser loader 사용 중이면 새 로딩을 얹지 않고 fail-soft backoff.
- idle 시간이 너무 부족한 경우 progressive task를 재시도하여 프레임 충돌 감소.
- MobileRuntimeEngine이 네트워크 connection change를 감지해 caps/class를 갱신.
- AudioManager가 안전/느린 네트워크에서 배경음악과 고빈도 효과음의 lazy download를 차단.
- PWA 등록 재시도 타이머 중복 방지.
- Service Worker 캐시 버전 갱신 및 선택형 UI/오디오/스프라이트 캐시 제외 강화.
- 안전 모드/느린 네트워크용 CSS 가독성 및 애니메이션 억제 보강.

## 검증
- `node node_modules/typescript/bin/tsc --noEmit --pretty false` 통과.
