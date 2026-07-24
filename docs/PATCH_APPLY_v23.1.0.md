# Patch Apply v23.1.0

기준 버전: v23.0.2

프로젝트 루트에 덮어쓴 뒤 실행한다.

```bash
npm run hygiene:check
npm run verify
npm run build:static
node scripts/verify-static-dist.mjs
```

패치 관리 파일은 `logs/patch/v23.1.0/` 아래에만 둔다.
