# CI Version Identity Sync Hotfix v1.0.48

## 원인

부분 패치 적용으로 `package.json`이 1.0.46에 남고 런타임·서비스워커·공개 버전 파일은 최신 상태가 되어 기본 정적 검증이 중단됐다.

## 수정

- `package.json`, `package-lock.json`, `src/main.js`, `src/version-policy.js`, `index.html`, `public/version.json`, `public/sw.js`를 v1.0.48 / b24.48로 동기화한다.
- `verify:identity:v148` 사전 게이트를 추가한다.
- `preverify`, `prebuild`에서 전체 검증이나 빌드보다 먼저 식별자 일치를 확인한다.
- 실패 시 package/main/policy/HTML/SW/public/lock의 실제 값과 기대값을 모두 출력한다.
- `verify-project.mjs`의 오류 메시지에도 package/main/policy 실제 값을 포함한다.

## 적용 계약

핫픽스 ZIP은 상위 폴더와 `overlay/` 래퍼 없이 프로젝트 루트 기준 경로를 담는다. 압축을 프로젝트 루트에 직접 덮어쓴 뒤 모든 변경 파일을 커밋해야 한다.
