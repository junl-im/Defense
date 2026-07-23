# v6.0.0 패치 적용

기준 버전은 `DokkaebiLuckDefense3D_FULL_v5.0.0`이다.

1. 실행 중인 개발 서버를 종료한다.
2. v6.0.0 덮어쓰기 ZIP을 기존 프로젝트 루트에 푼다.
3. 동일 파일 덮어쓰기를 허용한다.
4. `npm run verify`를 실행한다.
5. `npm run build:static` 또는 `npm run build`를 실행한다.

패치 ZIP에는 `dist`가 포함되지 않는다.
