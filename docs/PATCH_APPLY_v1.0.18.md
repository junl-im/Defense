# v1.0.18 패치 적용 방법

기준 버전은 v1.0.17입니다.

1. 기존 프로젝트를 백업합니다.
2. 직접 붙여넣기 ZIP을 프로젝트 최상위 폴더에 덮어씁니다.
3. `.github`, `scripts`, `src`, `public`, `docs`, `package.json`, `package-lock.json`, `index.html`을 모두 반영합니다.
4. Git에 커밋하고 푸시합니다.
5. GitHub Actions를 다시 실행합니다.

CI에서는 소스 검증 후 빌드가 수행되며, 빌드 후 승인 자산 배포 검증이 실행됩니다.
