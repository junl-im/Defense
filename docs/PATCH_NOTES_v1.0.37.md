# Patch Notes v1.0.37

- GitHub Actions `verify:dist:v123`의 Vite 경로 변환 오탐 수정
- `verify:dist:v124`의 동일 마스코트 경로 오탐 수정
- v1.0.35/v1.0.36 dist 검증을 정적 fallback과 Vite 번들 이중 호환으로 변경
- 활성 배포 파일만 검사하여 과거 문서·격리 자료 오탐 방지
- 원본/배포 에셋 SHA-256 동일성 검사 추가
- CI에 `verify:dist:v137` 추가
