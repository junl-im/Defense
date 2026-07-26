# v1.0.32 compact package note

세션 만료를 피하기 위한 단일 ZIP 통파일은 자동 생성물인 `dist/`를 제외하고 배포했습니다.
소스, 현재 런타임 에셋, production 데이터, 문서, 검증 스크립트는 모두 포함됩니다.

Windows에서 `dist/`를 다시 만들려면 프로젝트 폴더의 다음 파일을 실행합니다.

```text
scripts/REBUILD_DIST_WINDOWS.bat
```

동일한 명령은 `npm run build:static`입니다.
