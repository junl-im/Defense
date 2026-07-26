# v1.0.29 패치 적용

## 직접 적용

1. v1.0.28 프로젝트를 백업한다.
2. 직접 붙여넣기 패치의 모든 파일과 폴더를 프로젝트 최상위에 복사한다.
3. 숨김 폴더 `.github`도 덮어쓴다.
4. `npm run verify`를 실행한다.
5. 배포 전 `npm run build`와 `npm run verify:dist:v129`를 실행한다.

## 원클릭 적용

Windows에서는 기존 프로젝트 폴더를 `APPLY_PATCH_WINDOWS.bat` 위로 드래그한다. macOS/Linux에서는 `APPLY_PATCH_MAC_LINUX.command`를 실행하고 프로젝트 경로를 전달한다.
