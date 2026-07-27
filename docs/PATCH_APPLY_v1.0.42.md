# Patch Apply v1.0.42

1. 패치 ZIP을 압축 해제한다.
2. 압축 루트의 파일과 폴더를 기존 v1.0.41 프로젝트 최상위에 그대로 붙여넣는다.
3. 동일 파일을 덮어쓴다.
4. 기존 `dist/`를 삭제한다.
5. `npm ci`, `npm run verify:release:v142`, `npm run build`, `npm run verify:dist:all`을 실행한다.
