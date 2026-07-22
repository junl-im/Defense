# v3.7.2 → v3.7.3 적용

패치 파일을 프로젝트 루트에 덮어쓴 뒤 실행합니다.

```bash
npm run verify
npm run build
```

`preverify`와 `prebuild`가 남아 있는 SVG 파일을 재귀적으로 제거합니다. Git에서 삭제로 표시되는 SVG 파일이 있다면 삭제 상태도 함께 커밋해야 합니다.

패치본에는 `dist/`가 포함되지 않습니다.
