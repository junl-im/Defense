# v3.7.1 Build Hygiene Hotfix

GitHub Actions에서 `npm run verify`가 `prebuild`보다 먼저 실행되면서, 이전 패치에서 남은 루트 `PATCH_README.md`, 구형 Vite 해시 번들, SVG 아이콘이 검증을 막던 문제를 수정했습니다.

- `preverify`와 `prebuild` 모두 동일한 멱등 청소 스크립트 실행
- 루트 패치 문서 자동 제거 (`docs/` 문서는 보존)
- `public/assets/index-*.js|css|map` 동적 제거
- `public/icon.svg`, `public/cover.svg` 및 이전 배포 복사본 제거
- GitHub Pages 워크플로에 명시적 청소 단계 추가
- 청소 후에도 검증기가 잔여물을 다시 검사하므로 누락 시 빌드 차단

패치 적용 후 `npm run verify` 또는 `npm run build`만 실행해도 이전 잔여물이 자동으로 제거됩니다. 실제 저장소에서도 삭제 변경을 커밋하는 것을 권장합니다.
