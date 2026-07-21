# v3.1.0 SD 모바일 카툰 아트 바이블 패치

1. 프로젝트 루트에 이 패치의 파일을 덮어씁니다.
2. `PATCH_DELETE.txt`에 적힌 구형 모델 3개를 삭제합니다.
3. `npm ci`
4. `npm run verify`
5. `VITE_BASE_PATH=/Defense/ npm run build`

`dist/`와 `node_modules/`는 패치에 포함되지 않습니다.
