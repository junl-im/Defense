# v13.0.0 덮어쓰기 패치 적용

기준 버전은 `DokkaebiLuckDefense3D_FULL_v12.0.0`이다.

1. 기존 프로젝트를 백업한다.
2. v13 덮어쓰기 ZIP을 프로젝트 루트에 푼다.
3. 같은 이름의 파일을 덮어쓴다.
4. 아래 검증을 실행한다.

```bash
npm run verify
npm run build:static
node scripts/verify-static-dist.mjs
```

크롭을 다시 생성할 때만 Python 3, Pillow, OpenCV가 필요하다. 이미 생성된 PNG를 사용하는 일반 실행과 배포에는 Python이 필요하지 않다.
