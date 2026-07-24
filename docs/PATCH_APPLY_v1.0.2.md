# v1.0.2 적용

기준 버전은 `1.0.1`이다. 프로젝트 루트에 패치 ZIP을 덮어쓴 뒤 실행한다.

```bash
npm run clean:obsolete
npm run hygiene:check
npm run audit:code:v102
npm run verify
npm run build:static
node scripts/verify-static-dist.mjs
```

`clean:obsolete`는 과거 패치 관리 파일을 삭제하지 않고 `logs/legacy-root-output/`으로 이동한다. 중복 문서 `docs/ASSET_BIBLE.md`는 정본과 내용이 완전히 같으므로 제거한다.
