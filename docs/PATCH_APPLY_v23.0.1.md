# v23.0.1 적용

기준 버전은 v23.0.0이다. 패치 ZIP을 프로젝트 루트에 풀어 같은 파일을 덮어쓴다.

```bash
npm ci
npm run verify
npm run build
```

GitHub Pages는 `dist`를 배포한다. 로컬 확인은 파일을 직접 더블클릭하지 말고 HTTP 서버를 사용한다.

```bash
python -m http.server 8080 --directory dist
```

브라우저에서 `http://localhost:8080`을 연다.
