# v1.0.48 패치 적용

기준 버전은 **v1.0.47 / b24.47** 전체본이다.

1. 패치 ZIP을 푼다.
2. `1.0.48/overlay/` 내부만 프로젝트 루트에 덮어쓴다.
3. `APPLY_KO.txt`, `PATCH_MANIFEST.json`은 저장소 루트에 복사하지 않는다.
4. 기존 `dist`를 삭제하고 의존성을 다시 설치한다.

```bash
rm -rf dist
npm ci
npm run verify:ci
VITE_BASE_PATH=/Defense/ npm run build
npm run verify:dist:all
```
