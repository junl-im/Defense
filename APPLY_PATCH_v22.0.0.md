# v22.0.0 Autonomous Moonfront 덮어쓰기 패치

기준 프로젝트: `DokkaebiLuckDefense3D_FULL_v21.0.0`

프로젝트 루트에 ZIP을 풀어 같은 경로의 파일을 덮어씁니다.

- 신규 파일: 11
- 덮어쓰기 파일: 29
- 삭제 파일: 0
- 실제 변경 파일: 40

```bash
npm ci
npm run verify
npm run simulate:v2200
npm run simulate:v1800
npm run build:static
node scripts/verify-static-dist.mjs
```
