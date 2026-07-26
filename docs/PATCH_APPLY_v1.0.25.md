# v1.0.25 패치 적용

기준 버전은 v1.0.24입니다.

## 직접 붙여넣기
1. 직접 붙여넣기 ZIP을 압축 해제합니다.
2. 기존 프로젝트 최상위 폴더에 모든 파일과 폴더를 복사합니다.
3. 같은 이름의 파일은 모두 덮어씁니다.
4. 숨김 폴더 `.github`도 반드시 적용합니다.

## Windows 원클릭
1. 원클릭 ZIP을 압축 해제합니다.
2. 기존 v1.0.24 프로젝트 폴더를 `APPLY_PATCH_WINDOWS.bat` 위로 드래그합니다.
3. 기존 파일은 `logs/backups/v1.0.25_날짜_시간`에 백업됩니다.

## 확인
```bash
npm run verify
npm run build
npm run verify:dist:v125
```
