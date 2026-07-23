# v11.0.0 덮어쓰기 패치 적용

기준 버전은 `DokkaebiLuckDefense3D_FULL_v10.0.0`이다.

1. 기존 프로젝트를 별도 폴더에 백업한다.
2. `DokkaebiLuckDefense3D_PATCH_v11.0.0_OVERWRITE.zip`을 프로젝트 루트에 푼다.
3. 동일한 파일을 모두 덮어쓴다.
4. 아래 명령으로 검증하고 정적 배포본을 재생성한다.

```bash
npm run verify
npm run build:static
node scripts/verify-static-dist.mjs
```

`dist`와 `node_modules`는 덮어쓰기 패치에 포함하지 않는다.
