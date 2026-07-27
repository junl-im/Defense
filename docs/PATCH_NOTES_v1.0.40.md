# Patch Notes v1.0.40

- GitHub Actions `verify:dist:v135`의 실제 원인인 감사 전용 IP 시트 배포 누출을 수정했다.
- 원본 시트 10개 약 29MB를 `public/`에서 제작 보관 영역으로 이동했다.
- 크롭 415개와 런타임 매니페스트는 그대로 유지한다.
- 구 패치 위에 덮어쓴 경우 `preverify`와 `prebuild`가 남은 공개 시트 폴더를 자동 삭제한다.
- 모든 dist 검증을 `npm run verify:dist:all` 한 명령으로 실행한다.
