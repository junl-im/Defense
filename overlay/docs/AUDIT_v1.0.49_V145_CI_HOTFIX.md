# v1.0.49 v145 CI 장기 세션 핫픽스 종합 점검

점검일: 2026-07-29  
대상: `Defense_v1.0.49_V145_LONG_SESSION_MEASUREMENT_FULL.zip`  
실패 지점: `scripts/run-long-session-v145.mjs` → `scripts/verify-dist-v145.mjs`

## 1. 시스템

- 릴리스 본체는 v1.0.49 / b24.49이며 v1.0.45 장기 세션 게이트를 누적 검증한다.
- 런타임 오류 0건, WebGL context loss/restore 1:1로 시스템 생명주기와 복구 균형은 정상이다.
- 프로젝트 상단 인수인계 문서의 오래된 v1.0.45/v1.0.48 현재 버전 표기를 v1.0.49 핫픽스 기준으로 정리했다.

## 2. 성능

실패 로그의 주요 값은 frame p95 216.6ms, frame slope -5.497ms/10 waves, measured long-task 증가 556건이었다. 반면 heap 증가 9.772MB, texture -2, geometry -220으로 누수성 증가는 없었다.

절대 p95와 Long Task 개수만 보면 실패지만, SwiftShader가 약 200ms 주기로 프레임을 공급하는 CI에서는 각 측정 프레임이 Long Task가 된다. 이 값을 실제 기기 FPS와 동일한 축으로 판정한 것이 오탐의 핵심이었다.

수정 후 판정:

- 하드웨어/불명 렌더러: 기존 절대 기준 유지
- 명시적 소프트웨어 렌더러: 초기 기준 대비 p95 비율·증가량·기울기 및 long-task/frame 비율 악화 판정
- 측정 표본 미달/timeout: 항상 실패
- 기존 힙·텍스처·지오메트리·런타임·context 기준: 유지

## 3. 기술

- `WEBGL_debug_renderer_info`와 renderer/vendor 문자열로 SwiftShader, llvmpipe, software rasterizer, softpipe를 식별한다.
- 브라우저 하네스가 요청 프레임 수, 실제 측정 프레임 수, timeout, elapsed time을 보고한다.
- Chromium의 background timer/renderer throttling을 비활성화하고 device scale factor를 환경변수로 고정 가능하게 했다.
- 실패 보고서에 환경, 판정 모드, 표본 완전성, 정규화 Long Task 비율을 포함한다.

## 4. 기능

- 100-wave 진행, 5-wave 표본, 강제 GC 외부 격리, context 복구 시험은 유지된다.
- 소프트웨어 CI가 느리더라도 안정적인 기준선이면 통과하고, 시간 경과에 따라 악화되면 실패한다.
- 통과 보고서에는 거짓 `firstRegression`을 생성하지 않는다.

## 5. 엔진

- 게임 엔진의 실제 렌더링·전투 로직 임계값은 변경하지 않았다.
- 장기 세션 계측 계층만 렌더러 환경 인지형으로 보완했다.
- v1.0.48 런타임 소스 예산을 올리지 않고 중복 계산과 진단 코드를 압축해 기존 한도 안에 유지했다.

## 6. 문제점

- 1차 패치는 GC 직후 오염만 격리했고, 소프트웨어 렌더러의 절대 속도 차이는 분리하지 못했다.
- `frameP95 <= 34ms`와 Long Task 절대 개수는 실제 기기에는 적합하지만 SwiftShader 성능 평가에는 부적합했다.
- README/인수인계 문서 일부의 현재 릴리스 표기가 혼재했다.

## 7. 개선점

- 환경 감지와 기준선 상대 판정을 추가했다.
- 표본 완전성 검사를 별도 실패 조건으로 추가했다.
- 실제 실패 수치를 고정 회귀 픽스처로 추가했다.
- 문서의 1차 결론에 2차 재현 결과와 우선 적용 규칙을 명시했다.

## 8. 에러

기존 에러는 `v145 long-session checks failed`이며 하위 실패 체크는 `frameP95`, `longTasks`였다. 이로 인해 `verify-dist-v145.mjs`가 상태 1을 반환하고 전체 dist 검증 체인이 중단됐다.

## 9. 버그

계측 버그는 소프트웨어 렌더러의 안정적인 느린 프레임을 실제 게임의 프레임 회귀로 오인하고, Long Task 절대 누적량을 측정 프레임 수로 정규화하지 않은 것이다.

## 10. 예외사항과 남은 제한

- 소프트웨어 렌더러 판정은 명시적으로 식별된 경우에만 적용한다. 식별 실패 시 보수적으로 하드웨어 절대 기준을 적용한다.
- 기준선 자체가 불안정하거나 표본이 누락되면 보정 통과하지 않는다.
- 로컬 패키지 레지스트리에서 `vite@8.1.5`를 찾지 못해 `npm ci`와 실제 Vite/Chromium dist 실행은 이 작업 환경에서 재실행하지 못했다. 대신 소스 모델, 하네스 계약, 릴리스 v145/v146/v148/v149, 성능 예산, 생성물 신선도 검증을 수행한다.
