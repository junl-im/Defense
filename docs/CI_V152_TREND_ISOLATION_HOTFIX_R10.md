# v1.0.52 CI Hotfix R10 — Historical Trend Isolation Compatibility

## 문제

R9에서 전체 프레임 GPU 표본의 전달 API를 `observePresentationCostV152`에서 `observeWholeFrameCostV152`로 변경했지만, v1.0.45 역사 성능 추세 검증기 `verify-performance-trend-v145.mjs`의 forward-isolation 문자열은 R8 형태만 제거하도록 고정되어 있었다.

그 결과 제품 코드와 v1.0.52 전용 검증은 통과했지만, 전체 CI가 `verify:trend:v145`에서 다음 오류로 중단됐다.

```text
v145 main isolation missing v152 segment: GPU timer query observation
```

## 수정

- v145 forward-isolation은 R8의 `observePresentationCostV152` 블록과 R9의 `observeWholeFrameCostV152` 블록을 명시적 허용 변형으로 관리한다.
- 두 변형 중 정확히 하나가 존재해야만 제거한다.
- 0개면 forward 변경을 놓친 것으로 실패하고, 2개면 중복 계측으로 실패한다.
- v1.0.44 기준값과 5% 상한은 변경하지 않는다.
- v1.0.52 release gate가 두 허용 변형과 exact-one helper의 존재를 고정한다.

## 검증

```bash
npm run verify:trend:v145
npm run verify:release:v145
npm run verify:release:v152
npm run verify:ci-source:v152
```

R10은 런타임 동작이나 에셋, 게임 버전, 빌드 ID를 변경하지 않는 CI 검증 호환성 패치다.
