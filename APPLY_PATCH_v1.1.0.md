# v1.1.0 패치 적용 방법

대상: `DokkaebiLuckDefense3D_v1.zip` 또는 동일한 v1.0.0 프로젝트

## 적용

1. 기존 프로젝트를 복사해 백업합니다.
2. `DokkaebiLuckDefense3D_PATCH_v1.1.0.zip`의 내용을 기존 프로젝트 루트에 덮어씁니다.
3. 패치 ZIP의 폴더 구조를 그대로 유지합니다.
4. `DELETE_FILES_v1.1.0.txt`에 적힌 구버전 `dist/assets` 파일 2개를 삭제합니다. 남겨도 실행에는 영향이 없지만 정리를 권장합니다.
5. 아래 명령을 실행합니다.

```bash
npm install
npm run verify
npm run build
```

## 추가·변경 파일

- `.env.production`
- `.firebaserc`
- `.firebaserc.example`
- `.env.example`
- `.github/workflows/deploy.yml`
- `index.html`
- `src/main.js`
- `src/style.css`
- `src/firebase.js`
- `vite.config.js`
- `package.json`
- `package-lock.json`
- `public/sw.js`
- `firestore.rules`
- `README.md`
- `GAME_DESIGN.md`
- `QA_CHECKLIST.md`
- `PROJECT_HANDOFF.md`
- `PATCH_HISTORY.md`
- `PATCH_NOTES_v1.1.0.md`
- `DEPLOYMENT_TARGETS.md`
- `scripts/verify-project.mjs`

정리 대상 구버전 빌드 파일:

- `dist/assets/index-BONxBKc2.js`
- `dist/assets/index-BkxWqqn4.css`

## GitHub Desktop

덮어쓴 뒤 GitHub Desktop의 Changes에서 변경 파일을 확인하고 커밋합니다.

권장 커밋 메시지:

```text
feat: upgrade dokkaebi defense to v1.1 combat feedback
```

## Firebase 주의

`npm run deploy:rules`는 기존 Defense 데이터 경로를 보존하는 병합 규칙을 배포합니다.

`npm run deploy`는 Firebase Hosting 콘텐츠까지 교체하므로 기존 Hosting을 계속 써야 한다면 실행하지 마세요.
