# Next Update v1.0.49

- `src/main.js`에서 저장, 오류 진단, 결과 화면, 런 상태 책임을 독립 모듈로 단계적 추출한다.
- 브라우저 종료·BFCache·서비스워커 갱신 중 저장 큐를 통합하는 transactional persistence 계층을 검토한다.
- 실제 Vite 번들 기준 CPU long-task, 메모리, draw-call 추세를 GitHub Actions 승인 기준선으로 고정한다.
- 사용자 표시용 복구 상태와 개발자 진단 상태를 분리해 오류 UI 과다 노출을 줄인다.
- 기능 플래그와 QA 전용 API가 프로덕션 번들에서 의도한 범위만 노출되는지 검사한다.
