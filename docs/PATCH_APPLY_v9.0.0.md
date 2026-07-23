# PATCH APPLY v9.0.0

기준 원본은 사용자가 제공한 `Defense.zip`의 v8.0.0 프로젝트다.

1. 프로젝트 루트에 덮어쓰기 패치 ZIP을 해제한다.
2. 같은 이름의 파일을 덮어쓴다.
3. `npm run verify`를 실행한다.
4. `npm run build:static` 후 `node scripts/verify-static-dist.mjs`를 실행한다.

`npm run verify`와 `npm run build:static`의 사전 정리 단계가 기존 SVG와 오래된 번들 잔여물을 제거한다.
