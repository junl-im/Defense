# v1.0.46 v144 package script hotfix

CI 로그에서 `verify-release-v144.mjs`가 `package script verify:matrix-contract:v144`를 실패로 보고했지만, 실행된 `verify:release:v144` 명령 자체에는 matrix contract가 포함되지 않았다. 이는 런타임/CSS 핫픽스는 반영되고 package.json 변경만 누락된 부분 적용 상태다.

적용:

```bash
node scripts/apply-v144-matrix-package-hotfix.mjs
npm run verify:matrix-contract:v144
npm run verify:release:v144
```

`package-lock.json` 변경은 필요하지 않다. npm script metadata는 lock file에 저장되지 않는다.
