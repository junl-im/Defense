# v1.0.34 → v1.0.35 패치 적용

1. 패치 ZIP의 `APPLY_TO_PROJECT_ROOT` 내부 파일을 기존 프로젝트 루트에 덮어쓴다.
2. 삭제 목록이 있으면 `DELETE_LIST.txt` 기준으로 제거한다. 이번 패치는 삭제 파일이 없다.
3. 다음 명령을 실행한다.

```bash
npm run verify:release:v135
npm run build:static
npm run verify:dist:v135
```

패치 매니페스트의 SHA-256과 실제 파일이 일치해야 한다.
