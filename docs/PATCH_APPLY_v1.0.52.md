# v1.0.52 패치 적용

1. 기존 프로젝트를 백업한다.
2. 패치 ZIP을 별도 폴더에 압축 해제한다.
3. `overlay/` 폴더 안의 내용만 기존 프로젝트 루트에 덮어쓴다.
4. ZIP 루트의 안내문·매니페스트는 프로젝트 루트에 복사하지 않는다.
5. 의존성이 정상 설치된 환경에서 아래 검증을 실행한다.

```bash
npm run verify:release:v152
VITE_BASE_PATH=/Defense/ npm run build
npm run verify:dist:all
```
