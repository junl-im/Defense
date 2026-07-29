# v1.0.46 v144 Package Hardening Hotfix

## 원인

부분 패치 적용으로 `scripts/verify-release-v144.mjs`는 `verify:matrix-contract:v144` npm 별칭을 요구했지만, 실제 브랜치의 `package.json`에는 해당 별칭이 반영되지 않았다.

## 수정

- 교정된 `package.json`을 핫픽스에 직접 포함한다.
- v144 릴리스 검증기는 npm 별칭에 의존하지 않고 `scripts/test-v144-mobile-matrix-contract.mjs`를 직접 실행한다.
- 별칭이 존재하는 경우에는 정확한 명령인지 검사한다.
- 따라서 `package.json` 또는 검증기 중 한 파일만 먼저 반영되는 부분 적용 상태에서도 동일 오류가 반복되지 않는다.
