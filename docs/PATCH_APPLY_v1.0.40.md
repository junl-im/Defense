# Patch Apply v1.0.40

1. 패치 ZIP을 압축 해제한다.
2. 나온 파일과 폴더를 프로젝트 최상위에 그대로 붙여넣고 덮어쓴다.
3. `npm ci` 후 `npm run verify` 또는 `npm run build`를 실행한다.
4. `preverify`/`prebuild`가 기존 `public/assets/ip-v13/sheets`와 오래된 `dist` 산출물을 정리한다.
5. 빌드 후 `npm run verify:dist:all`을 실행한다.
