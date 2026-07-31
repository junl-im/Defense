# Release Assurance v1.0.52

## 통과한 로컬 검증

- 전체 JavaScript/MJS 구문 검사
- 클래스별 액션 이벤트 프로필 순서·완료 마커·절대 시간 검증
- 정상 부하 유지와 지속 과부하 1회 강등 모델 검증
- 잔상 고정 버퍼, 상태·비가시화·순간이동 초기화 정적 계약
- authored emissive 보존 계약
- 결과 화면 HTML 이스케이프·비정상 점수 정규화 회귀
- v1.0.50 원자 저장·보상·오류 복구 기반 보존
- v1.0.51 캐릭터 표현·재질·장기 세션 핫픽스 보존
- 런타임 import shell 재생성 및 동일성 검사
- 루트 위생, 정리 패키지, direct-overlay 패치 해시 검증

## 실행하지 못한 검증

전달 환경의 `node_modules`에는 Vite 실행 본문과 `.bin`이 없고 내부 패키지 저장소는 고정된 `vite@8.1.5`를 제공하지 않는다. 따라서 실제 Vite 번들 생성, WebGL 셰이더 컴파일, GPU timer-query 실측, 실제 화면 캡처는 로컬 통과로 기록하지 않는다.

CI에서는 다음을 필수로 유지한다.

```bash
npm ci
VITE_BASE_PATH=/Defense/ npm run build
npm run verify:dist:all
```

실브라우저에서는 WebGL2 timer-query 지원/미지원 양쪽, disjoint 발생, cinematic→balanced 강등, 모바일 장기 세션을 확인해야 한다.
