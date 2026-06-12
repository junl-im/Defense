# v2.32.0 Clean Full Source Notes

이 통파일은 GitHub Desktop으로 다시 기준점을 잡기 쉽도록 정리한 전체 소스 패키지입니다.

## 포함
- `src/` 전체 게임 코드
- `public/` 전체 런타임 에셋
- `docs/` 문서
- `scripts/`, 설정 파일, Firebase/PWA 관련 파일
- `package.json`, `package-lock.json`

## 제외
- `.git/`
- `node_modules/`
- `dist/`
- 임시 로그/캐시/OS 파일

## 적용 후 권장
```bash
npm install
npm run dev
```

빌드 확인:
```bash
npm run build
```

기본 모바일 테스트는 URL 옵션 없이 진행하고, 무거운 원화 감상 모드는 고성능 기기에서만 `?ultraart`로 테스트하세요.
