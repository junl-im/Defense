# v14.0.0 덮어쓰기 패치 적용

기준 버전은 `DokkaebiLuckDefense3D_FULL_v13.0.0`입니다.

1. 기존 프로젝트를 백업합니다.
2. v14 덮어쓰기 ZIP을 프로젝트 루트에 풉니다.
3. 동일 파일을 덮어씁니다.
4. 아래 명령을 실행합니다.

```bash
npm run verify
npm run build:static
node scripts/verify-static-dist.mjs
```

`dist`와 `node_modules`는 패치 ZIP에 포함되지 않습니다.

v14는 삭제 대상 파일이 없습니다. v13 소스 시트와 개별 크롭은 재생성과 감사 목적 때문에 유지합니다.
