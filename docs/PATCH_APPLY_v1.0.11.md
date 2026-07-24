# v1.0.11 패치 적용 가이드

## 전체 프로젝트 사용

전체 프로젝트 ZIP을 새 폴더에 해제한 뒤 다음 명령을 실행합니다.

```bash
npm ci
npm run verify:ip-mega:v4
npm run verify:release:v111
npm run build:static
node scripts/verify-static-dist.mjs
```

개발 서버:

```bash
npm run dev
```

정적 빌드 확인:

```bash
npm run build:static
npm run preview
```

## v1.0.10에 패치만 적용

1. v1.0.10 프로젝트를 별도로 백업합니다.
2. v1.0.11 패치 ZIP의 파일을 프로젝트 루트에 덮어씁니다.
3. `DELETE_LIST.txt`에 경로가 있을 때만 해당 파일을 삭제합니다.
4. 패치의 `PATCH_CONTENT_SHA256.txt`를 확인합니다.
5. 다음 명령을 실행합니다.

```bash
npm ci
npm run verify:patch:v111
npm run verify:ip-mega:v4
npm run verify:release:v111
npm run build:static
node scripts/verify-static-dist.mjs
```

## 메가베이스 재생성

생성 데이터가 누락되었거나 규격을 변경한 경우:

```bash
npm run generate:ip-mega:v4
npm run verify:ip-mega:v4
```

생성 대상:

```text
production/DokkaebiDefense/14_IP_Knowledge_Megabase/
public/assets/ip-mega-v4/data/
```

참고 이미지는 생성 스크립트가 덮어쓰지 않습니다.

## 브라우저 검토

정적 서버에서 다음 경로를 엽니다.

```text
/ip-mega-library-v4.html
```

파일 탐색기에서 HTML을 직접 더블클릭하면 브라우저의 로컬 파일 보안 정책 때문에 JSON 로드가 차단될 수 있습니다. `npm run dev`, `npm run preview`, 또는 일반 HTTP 정적 서버를 사용합니다.

## 롤백

v1.0.10 백업으로 복구하거나 패치 매니페스트의 `added` 항목을 제거하고 `modified` 항목을 백업본으로 되돌립니다. 최종 아트 원본과 기존 `src/assets/`, 기존 `public/assets/` 바이트는 이 패치에서 변경하지 않습니다. 새 아트 참고 이미지는 `ip-mega-v4` 전용 경로에만 추가됩니다.
