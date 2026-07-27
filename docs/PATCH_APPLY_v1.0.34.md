# v1.0.34 패치 적용

## 붙여넣기 방식

1. 패치 ZIP을 압축 해제한다.
2. `APPLY_TO_PROJECT_ROOT/` 폴더 안의 모든 파일과 폴더를 기존 v1.0.33 프로젝트 루트에 복사한다.
3. 같은 이름의 파일은 덮어쓴다.
4. 이번 패치의 삭제 대상은 없다.
5. 아래 검증을 실행한다.

```bash
npm run verify
npm run build:static
npm run verify:dist:v134
```

패치 파일 무결성은 `npm run verify:patch:v134`로 확인한다.
