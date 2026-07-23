# PATCH APPLY v17.0.0

기준 버전은 `DokkaebiLuckDefense3D_FULL_v16.0.0`이다.

1. 실행 중인 개발 서버를 종료한다.
2. 패치 ZIP을 프로젝트 루트에 풀어 동일 파일을 덮어쓴다.
3. 다음 명령을 실행한다.

```bash
npm run verify
npm run build:static
node scripts/verify-static-dist.mjs
```

이전 첫 화면이 남아 있으면 서비스 워커 또는 사이트 캐시를 삭제하고 강력 새로고침한다.
