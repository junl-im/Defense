# Patch Apply v23.0.2

기준 버전은 v23.0.1이다. 프로젝트 루트에 덮어쓴 뒤 실행한다.

```bash
npm ci
npm run hygiene:organize
npm run verify
npm run build:static
node scripts/verify-static-dist.mjs
```

패치 관리 파일은 `logs/patch/v23.0.2/` 아래에만 존재한다.
