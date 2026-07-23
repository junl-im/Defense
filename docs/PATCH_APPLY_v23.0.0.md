# v23.0.0 덮어쓰기 패치 적용

기준 프로젝트는 `DokkaebiLuckDefense3D_FULL_v22.0.0`입니다.

1. 프로젝트 루트에 패치 ZIP을 풉니다.
2. 같은 이름의 파일을 모두 덮어씁니다.
3. 삭제 목록이 있으면 해당 파일을 삭제합니다.
4. 아래 명령으로 검증합니다.

```bash
npm ci
npm run verify
npm run simulate:v2300
npm run build:static
node scripts/verify-static-dist.mjs
```
