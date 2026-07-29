# Release Assurance v1.0.48

## 검사 범위

- 시스템 및 버전 식별자 동기화
- 소스 import 그래프와 package script 대상 파일 완전성
- 저장소 접근 실패 및 JSON 손상 예외
- 런타임 오류 중복·개인정보·메모리 상한
- 백그라운드 프레임 비용과 엔진 프레임 스케줄러
- 기능 저장 지속성, 서비스워커 계보, 배포 증거 계약
- v1.0.35·v1.0.36 역사적 릴리스 게이트의 전진 호환성과 누적 체인 포함
- 전체 프로젝트 ZIP 및 direct-overlay 패치 무결성

## 승인 조건

- `npm run verify:release:v148`
- `npm run verify:ci`
- 정식 Vite 번들에서 `npm run verify:dist:all`
- 패치 매니페스트의 모든 파일 SHA-256 일치
- 루트 hygiene 통과

## 정직성 경계

실제 Vite 번들 또는 브라우저 실행이 불가능한 환경에서는 소스·모델·패키지 검증만 통과로 기록하고, 완성 번들 승인 여부는 GitHub Actions 결과로 확정한다.
## v1.0.48 Identity Synchronization Hotfix

- 부분 적용으로 package/runtime 버전이 갈라지는 문제를 차단합니다.
- `npm run verify:identity:v148`가 package, lock, main, policy, HTML, service worker, public version을 비교합니다.
- `preverify`와 `prebuild`에서 본 검증보다 먼저 실행됩니다.
