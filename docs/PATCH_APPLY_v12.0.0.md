# v12.0.0 덮어쓰기 패치 적용

기준 버전: `DokkaebiLuckDefense3D_FULL_v11.0.0`

1. 프로젝트 루트에 패치 ZIP을 푼다.
2. 같은 경로의 파일을 모두 덮어쓴다.
3. 아래 명령을 실행한다.

```bash
npm run verify
npm run build:static
node scripts/verify-static-dist.mjs
```

카메라 기본값은 전장 조망이다. 게임 중 F5로 시야 프리셋을 전환할 수 있다.
