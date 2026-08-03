# v1.0.52 CI Hotfix R11 — Minification-Stable Dist Marker

## 보고된 실패

실제 GitHub Actions Vite build는 완료됐지만 `verify-dist-v152.mjs`가 다음 오류로 중단됐다.

```text
v152 bundled runtime marker missing: authoredDurationV152
```

## 근본 원인

`authoredDurationV152`는 `AnimationStateSystem.setState()` 내부의 로컬 변수명이다. Vite의 production minification은 로컬 식별자를 축약하거나 제거할 수 있으므로, 해당 문자열이 번들에 남는다는 보장은 없다. 런타임 동작은 유지됐지만 dist 검증이 소스 식별자 보존을 잘못 요구했다.

## 수정

- 액션 타이밍 계약에 `durationGuardId: 'DD-AUTHORED-DURATION-GUARD-V152'`를 추가했다.
- 이 값은 이미 번들에 유지되는 `CHARACTER_ACTION_TIMING_V152`의 동결 계약 객체에 포함되어 minification 후에도 안정적으로 남는다.
- dist 검증은 로컬 변수명 대신 위 계약 마커를 확인한다.
- 소스 검증은 계속 `Math.max(0.01, duration, authoredDurationV152)`를 검사하므로 authored timeline 마지막 이벤트가 one-shot 지속시간의 하한이 되는 실제 동작은 완화되지 않는다.
- 번들 순회 fixture에 minified 형태의 계약 객체를 추가하고 안정 마커의 도달 가능한 chunk 위치를 확인한다.

## 영향 범위

게임 버전과 빌드 ID는 `1.0.52 / b24.52`로 유지된다. 전투, 애니메이션 시간값, 에셋, 저장 데이터는 변경하지 않는다. repair revision만 R11이다.

## 검증

```bash
npm run verify:timing:v152
npm run verify:hardening:v152
npm run verify:bundle-markers:v152
npm run verify:release:v152
VITE_BASE_PATH=/Defense/ npm run build
npm run verify:dist:v152
npm run verify:dist:all
```
