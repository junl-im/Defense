# v10.0.0 덮어쓰기 패치 적용

## 기준 버전

`DokkaebiLuckDefense3D_FULL_v9.0.0`

## 적용

1. 기존 프로젝트를 백업한다.
2. `DokkaebiLuckDefense3D_PATCH_v10.0.0_OVERWRITE.zip`을 프로젝트 루트에 푼다.
3. 같은 이름의 파일을 모두 덮어쓴다.
4. 다음 검증을 실행한다.

```bash
npm run verify
npm run build:static
node scripts/verify-static-dist.mjs
```

## 주의

- 패치 ZIP에는 `dist`와 `node_modules`가 포함되지 않는다.
- `public/assets/ip-v10`은 신규 파일이므로 폴더 구조를 유지해야 한다.
- 자동 생성된 투명본은 리뷰 후보이며 최종 원본을 대체하지 않는다.
- Production-approved 수는 계속 0이다.
