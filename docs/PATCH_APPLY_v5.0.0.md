# v5.0.0 덮어쓰기 패치 적용

기준 프로젝트: `DokkaebiLuckDefense3D_FULL_v4.2.0`

1. 기존 프로젝트를 별도 폴더에 백업한다.
2. `DokkaebiLuckDefense3D_PATCH_v5.0.0_OVERWRITE.zip`을 기존 프로젝트 루트에 압축 해제한다.
3. 같은 이름의 파일은 모두 덮어쓴다.
4. 아래 검증을 실행한다.

```bash
npm run verify
npm run build:static
node scripts/verify-static-dist.mjs
```

`dist`는 패치 ZIP에 포함하지 않는다. 정적 배포본은 적용 후 `npm run build:static`으로 다시 생성한다.
