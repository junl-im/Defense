# v1.0.52 CI HOTFIX R1 패치 적용

이 패치는 최초 v1.0.52 전달본과 v1.0.51 기준본 모두에 적용할 수 있다.

1. 기존 프로젝트를 백업한다.
2. 패치 ZIP을 별도 폴더에 압축 해제한다.
3. `DELETE_PATHS.txt`에 적힌 경로가 있으면 먼저 삭제한다. 특히 오래된 `dist/`는 남기지 않는다.
4. `overlay/` 폴더 안의 내용만 기존 프로젝트 루트에 덮어쓴다.
5. ZIP 루트의 안내문·매니페스트는 프로젝트 루트에 복사하지 않는다.
6. 의존성이 정상 설치된 환경에서 아래 검증을 실행한다.

```bash
npm run prepare:repo-root:v152
npm run sync:generated:ci
npm run verify:release:v152
npm run verify:ci
VITE_BASE_PATH=/Defense/ npm run build
npm run verify:dist:all
```
