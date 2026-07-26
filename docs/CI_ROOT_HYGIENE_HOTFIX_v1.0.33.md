# v1.0.33 Root Hygiene Hotfix

기존 프로젝트 루트에 남은 아래 파일을 `npm run clean:obsolete` 단계에서 자동 제거한다.

- `COMPACT_PACKAGE_NOTE.txt`
- `REBUILD_DIST_WINDOWS.bat`

이 패치는 압축 해제 후 프로젝트 최상위 폴더에 그대로 덮어쓴다.
