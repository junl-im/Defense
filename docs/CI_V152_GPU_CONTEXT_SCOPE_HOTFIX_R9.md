# v1.0.52 CI Hotfix R9 — GPU Scope & Context Recovery

## 문제

v1.0.52의 WebGL2 timer-query는 전체 `renderer.render()` 시간을 측정하면서 그 값을 캐릭터 표현 전용 GPU 비용으로 전달했다. 따라서 배경, 전장 이펙트, 그림자, 후처리 등 다른 렌더링 부하가 높은 경우에도 캐릭터 표현 품질이 잘못 강등될 수 있었다.

또한 WebGL context loss 뒤 timer 객체가 이전 context의 query와 extension 참조를 보유할 수 있었다. `poll()` 단계의 stale query 예외에는 보호 경계가 없어 context 복원 직후 반복 오류로 이어질 가능성이 있었다.

## 수정

- GPU 표본에 `whole-frame-gpu` scope를 명시한다.
- 캐릭터 표현 budget에서 `presentationGpuP95Ms`와 `wholeFrameGpuP95Ms`를 분리한다.
- 전체 프레임 GPU 표본은 진단에만 남기고 캐릭터 전용 GPU 강등 근거로 사용하지 않는다.
- 캐릭터 표현 CPU 표본과 향후 명시적인 `character-presentation-gpu` 표본만 캐릭터 품질 강등에 사용한다.
- `webglcontextlost`에서 active/pending query를 폐기하고 timer를 suspend한다.
- `webglcontextrestored`에서 renderer context와 extension을 다시 획득한다.
- begin/end/poll query 예외를 밖으로 전파하지 않고 fail-closed 상태와 진단 카운터로 기록한다.
- disjoint 발생 시 같은 context generation의 남은 pending query를 모두 폐기한다.
- dispose에서 context event listener와 query 자원을 정리한다.

## 검증

```bash
npm run verify:gpu-timer:v152
npm run verify:presentation-budget:v152
npm run verify:hardening:v152
npm run verify:release:v152
```

결정론 fixture는 다음 행렬을 검사한다.

- extension 미지원
- 정상 query 결과
- pending queue overflow
- GPU disjoint
- poll stale-query 예외
- WebGL context loss
- context restore 및 extension 재획득
- dispose 후 listener 비활성
- 전체 프레임 GPU 과부하의 캐릭터 전용 오인 방지
- 명시적 캐릭터 GPU/CPU 과부하의 1회 강등

## 남은 범위

R9는 측정 scope의 오인을 제거하고 context lifecycle을 안전하게 만든다. 캐릭터 레이어만의 실제 GPU 비용을 얻으려면 별도 render pass 또는 비중 추정이 아닌 검증 가능한 scoped GPU 측정 설계가 필요하다. 실제 WebGL2 timer-query, context loss/restore, 모바일 GPU 예산 승인은 Vite 빌드와 실기기/CI 브라우저에서 확인해야 한다.
