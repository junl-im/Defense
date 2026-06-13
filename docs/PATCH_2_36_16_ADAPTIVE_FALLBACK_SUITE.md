# v2.36.16 Adaptive Fallback Suite

## 목표

v2.36.14~v2.36.15에서 가독성/그래픽 폴백을 확장했지만, 실제 약한 모바일 환경에서는 사용자가 즉시 선택할 수 있는 대안책과 자동 폴백 상태가 더 명확해야 한다. v2.36.16은 UI/그래픽/모션/네트워크/프레임 저하를 한 번에 묶는 적응형 대안책 레이어를 추가한다.

## 핵심 변경

- `AdaptiveFallbackDirector.ts` 추가
  - 모바일, 작은 뷰포트, 저메모리/저코어, 느린 네트워크, 오프라인, 런타임 watch/lockdown을 감지한다.
  - root class를 통해 WebShell/CSS/Canvas 쪽에도 즉시 fallback 상태를 전파한다.
  - 필요 시 씬 안에 `보기` 패널을 제공해 사용자가 직접 `큰 UI`, `고대비`, `저사양`, `비상`, `기본`을 바꿀 수 있다.
- `MobileReadableUi.ts`와 연결
  - 가독성 패스가 설치되는 모든 씬에서 adaptive fallback director도 함께 설치된다.
  - 기존 `installSceneReadabilityPass` 흐름을 유지해 개별 씬 수정량을 줄였다.
- `PrestigeGraphicFallback.ts`와 연결
  - `ksSafeGfx`, `ksEmergencyFallback`, `ksContrastUi` 저장값을 그래픽 fallback 프로필에 반영한다.
  - `저사양`/`비상` 선택 후 다음 씬부터 그래픽 fallback이 안전 모드로 더 강하게 적용된다.
- WebShell 보강
  - 엔진이 뜨기 전 시작 게이트에서도 저장된 fallback 설정을 읽어 shell class를 적용한다.
  - 첫 화면에서 이미 큰 글자/고대비/저사양 정책이 반영된다.
- CSS 보강
  - `ks-adaptive-*` class 추가.
  - emergency/reduce-motion 상태에서는 transition/animation을 억제한다.
  - safe graphics 상태에서는 canvas filter를 비활성화해 저사양 기기 부담을 줄인다.

## 사용자 대안책

게임 중 `보기` 패널에서 다음을 즉시 선택할 수 있다.

- `큰 UI`: 큰 UI/초대형 UI/기본 순환
- `고대비`: 배경이 복잡할 때 텍스트 대비 강화
- `저사양`: safe graphics 저장값 적용
- `비상`: 큰 UI + 고대비 + 저사양 그래픽 + 모션 감소 + 낮은 품질 티어 저장
- `기본`: fallback 저장값 초기화

## 새 검수 옵션

- `?fallbacksuite`: adaptive fallback suite 강제
- `?adaptivefallback`: adaptive fallback suite 강제
- `?emergencyui`: 비상 대안 UI 강제
- `?safemodeui`: 비상 UI 계열 강제
- `?fallbackpanel`: 데스크톱/비활성 상태에서도 `보기` 패널 강제
- `?nofallbackpanel`: 씬 내부 `보기` 패널 비활성화
- `?nofallbacksuite`: adaptive fallback suite 비활성화
- `?legacyfallback`: 이전 fallback 비교
- 기존 `?largeui`, `?hugeui`, `?highcontrast`, `?contrastui`, `?safegfx`, `?fallbackgfx`, `?reducemotion`, `?battery`와 연동

## 성능 정책

- 새 이미지/atlas/sound를 추가하지 않는다.
- 기본 부팅 에셋을 늘리지 않는다.
- 전투 중 무거운 아트 스트리밍 정책을 바꾸지 않는다.
- 저사양/비상 모드는 CSS filter와 불필요한 모션을 억제한다.
- 기존 Firebase/PWA/오디오 지연 처리 유지.

## 검증

- `npm ci` 성공
- `npm run build` 성공
- 정적 dist HTTP 200 smoke check 성공

## 참고

실제 모바일 기기에서는 다음 순서로 비교한다.

1. 기본 주소
2. `?fallbacksuite`
3. `?emergencyui`
4. `?nofallbackpanel`
5. `?legacyfallback`
