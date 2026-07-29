# Patch Notes v1.0.48

## Comprehensive Runtime Integrity & Resilience

- localStorage 접근 거부·용량 초과 환경을 위한 제한형 메모리 fallback 저장 계층 추가
- 점수, 조작 설정, 메타 진행, HUD 배치, 렌더 통계 설정을 안전 저장 계층으로 통합
- 런타임 오류 메시지의 URL·로컬 경로·이메일·장기 토큰 비식별화
- 오류 기록 40개, 오류 지문 96개 상한으로 장시간 메모리 증가 방지
- 백그라운드 탭에서 전투·렌더 무거운 프레임 경로 조기 중단
- FrameBudgetScheduler의 10Hz 채널이 경계 오차로 약 2배 실행되던 엔진 버그 수정
- 소스 import, npm 스크립트 대상, 엔진/런타임 크기, 예외·성능 계약을 한 번에 검사하는 종합 감사 추가
- 결과 전달 순서를 작업 내역 → 전체 ZIP/패치 ZIP → 다음 예정 내역으로 프로젝트 규칙화
- 누적 검증 체인에서 빠져 있던 v1.0.35·v1.0.36 게이트 복원
- v1.0.35·v1.0.36 고정 버전 검증기를 현재 릴리스 전진 호환 방식으로 교체
## v1.0.48 Identity Synchronization Hotfix

- 부분 적용으로 package/runtime 버전이 갈라지는 문제를 차단합니다.
- `npm run verify:identity:v148`가 package, lock, main, policy, HTML, service worker, public version을 비교합니다.
- `preverify`와 `prebuild`에서 본 검증보다 먼저 실행됩니다.
