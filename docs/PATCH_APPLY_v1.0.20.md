# v1.0.20 패치 적용

기준 버전은 `v1.0.19 / b24.19`입니다.

1. 실행 중인 개발 서버와 브라우저를 종료합니다.
2. v1.0.20 직접 붙여넣기 ZIP의 모든 항목을 프로젝트 최상위 폴더에 덮어씁니다.
3. `.github`, `src`, `public`, `scripts`, `docs`, `index.html`, `package.json`, `package-lock.json`을 모두 포함해야 합니다.
4. GitHub Pages 사용 시 변경 파일을 커밋·푸시하고 Actions를 다시 실행합니다.
5. 이전 마스코트가 남아 있으면 서비스 워커가 갱신된 뒤 한 번 새로고침합니다.

Windows 원클릭 패치는 대상 폴더를 `APPLY_PATCH_WINDOWS.bat` 위로 끌어다 놓으면 자동 백업 후 적용됩니다.
