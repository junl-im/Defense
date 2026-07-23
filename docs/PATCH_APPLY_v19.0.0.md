# PATCH APPLY v19.0.0

기준 버전은 `DokkaebiLuckDefense3D_FULL_v18.0.0`이다.

1. 패치 ZIP을 프로젝트 루트에 푼다.
2. 동일 파일을 덮어쓴다.
3. 아래 검증을 실행한다.

```bash
npm run verify
npm run simulate:v1800
npm run build:static
node scripts/verify-static-dist.mjs
npm run browserlab:v1900
```

v19부터 서비스 워커는 버전형 캐시를 사용하므로 정상 접속마다 사이트 데이터를 삭제할 필요가 없다. 매우 오래된 배포가 남은 경우에만 부팅 오류 화면의 `캐시 정리 후 다시 시작`을 한 번 사용한다.
