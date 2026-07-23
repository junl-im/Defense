# PATCH APPLY v18.0.0

기준 프로젝트:

`DokkaebiLuckDefense3D_FULL_v17.0.0`

프로젝트 루트에 덮어쓰기 ZIP을 풀고 다음 명령을 실행한다.

```bash
npm run verify
npm run build:static
node scripts/verify-static-dist.mjs
```

선택적으로 10웨이브 시뮬레이션 보고서를 다시 생성한다.

```bash
npm run simulate:v1800
```

브라우저에 v17 자산이 남으면 사이트 데이터와 서비스 워커 캐시를 삭제하거나 `?fresh=18.0.0`으로 접속한다.
