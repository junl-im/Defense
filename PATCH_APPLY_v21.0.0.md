# v21.0.0 덮어쓰기 패치 적용

기준 프로젝트는 `DokkaebiLuckDefense3D_FULL_v20.0.0`이다.

1. 서버와 개발 프로세스를 종료한다.
2. v21 패치 ZIP을 프로젝트 루트에 풀어 같은 파일을 덮어쓴다.
3. 다음 검증을 실행한다.

```bash
npm ci
npm run verify
npm run build:static
node scripts/verify-static-dist.mjs
```

오래된 접속 화면이 남을 경우 한 번만 강력 새로고침한다. v21 서비스 워커가 이전 도깨비 셸 캐시를 자동 정리한다.
