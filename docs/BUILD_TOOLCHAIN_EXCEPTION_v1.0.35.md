# 빌드 툴체인 예외 — v1.0.35

## 확인 결과

- `package.json`과 `package-lock.json`은 Vite `8.1.5`를 정상적으로 고정한다.
- 배포 패키지에 포함된 `node_modules/vite` 디렉터리는 존재하지만 `package.json`, `dist/node/cli.js`, `dist/node/index.js`가 없다.
- 따라서 현재 패키지 그대로는 로컬 `vite build`를 실행할 수 없다.
- 이 문제는 게임 소스나 v1.0.35 런타임 수정의 결함이 아니라, 전달된 개발 의존성 디렉터리가 불완전한 패키징 예외다.

## 이번 릴리스에서 보장한 대체 게이트

1. `npm run build:static`으로 원본 모듈과 전체 public 에셋을 정적 배포본으로 생성한다.
2. `npm run verify:dist:v135`가 110개 런타임 모듈의 바이트·SHA-256, 버전, 런타임 마커, 에셋 누락을 검사한다.
3. GitHub Actions는 `npm ci`로 의존성을 다시 설치한 뒤 실제 `npm run build`를 수행한다.
4. CI의 `verify-production-bundle-v101.mjs`가 생성된 Vite 번들의 진입점과 릴리스 마커를 검사한다.

## 복구 방법

```bash
rm -rf node_modules
npm ci
npm run build
node scripts/verify-production-bundle-v101.mjs
```

Windows에서는 기존 `node_modules` 폴더를 삭제한 뒤 `npm ci`를 실행한다.

## 자동 감사

```bash
npm run audit:toolchain:v135
```

결과는 `logs/verify/BUILD_TOOLCHAIN_AUDIT_v135.json`에 기록된다. `ready`이면 로컬 Vite 실행 준비 완료, `exception-documented`이면 의존성 재설치가 필요하다.
