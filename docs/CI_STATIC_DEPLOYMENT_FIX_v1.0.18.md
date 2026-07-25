# v1.0.18 CI 정적 배포 검증 수정

## 기존 실패 구조

1. `npm run verify` 실행
2. v1.0.17 검증기가 `dist/asset-approval-v117.html` 등 6개 파일 요구
3. Vite Build는 다음 단계이므로 아직 `dist`가 없음
4. 검증 실패로 Build 단계에 도달하지 못함

## 변경 구조

1. `npm run verify`: 소스·승인 경계·레지스트리 검사
2. `npm run build`: Vite가 `public`을 `dist`로 복사하고 번들을 생성
3. `npm run verify:dist:v117`: v1.0.17 승인 자산 8개 핵심 파일과 승인 합계 검사
4. `npm run verify:dist:v118`: 현재 버전·서비스 워커·배포 게이트 검사
5. 프로덕션 번들 자체 포함 검사

이 구조는 깨끗한 Git 체크아웃처럼 `dist`가 없는 환경에서도 정상적으로 동작합니다.
