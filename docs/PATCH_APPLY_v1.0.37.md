# v1.0.37 패치 적용

1. `APPLY_TO_PROJECT_ROOT` 내용을 프로젝트 루트에 덮어쓴다.
2. 기존 `dist` 폴더를 삭제한다.
3. `npm ci`를 실행한다.
4. `npm run verify:release:v137`을 실행한다.
5. `npm run build` 후 `npm run verify:dist:v123`, `v124`, `v135`, `v136`, `v137`을 실행한다.
