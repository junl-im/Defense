# v1.0.12 패치 적용 가이드

## 전체 프로젝트 ZIP 사용

전체 프로젝트 ZIP을 새 폴더에 해제한 뒤 다음 명령을 실행합니다.

```bash
npm ci
npm run verify:release:v112
npm run build:static
node scripts/verify-static-dist.mjs
```

개발 서버:

```bash
npm run dev
```

## v1.0.11에 증분 패치 적용

1. 기존 v1.0.11 프로젝트를 별도 폴더에 백업합니다.
2. 패치 ZIP 안의 `APPLY_TO_PROJECT_ROOT/` 내용을 v1.0.11 프로젝트 루트에 덮어씁니다.
3. 패치 루트의 `DELETE_LIST.txt`에 경로가 있을 때만 해당 파일을 삭제합니다.
4. `PATCH_CONTENT_SHA256.txt`로 패치 파일 해시를 확인합니다.
5. 다음 명령을 실행합니다.

```bash
npm ci
npm run verify:patch:v112
npm run verify:release:v112
npm run build:static
node scripts/verify-static-dist.mjs
```

## 아트 자산 재생성

타이틀 색보정 및 커버 재생성:

```bash
npm run generate:visual-polish:v112
```

P0 11방향 전투 아틀라스 재생성:

```bash
npm run generate:p0-directional:v112
```

재생성 후 반드시 다음 검증을 수행합니다.

```bash
npm run verify:release:v112
```

## 브라우저 검토

정적 서버에서 다음 경로를 엽니다.

```text
/p0-directional-library-v112.html
/ip-mega-library-v4.html
```

HTML 파일을 파일 탐색기에서 직접 열면 브라우저의 로컬 파일 보안 정책으로 JSON 로드가 차단될 수 있습니다. `npm run dev`, `npm run preview`, 또는 일반 HTTP 정적 서버를 사용합니다.

## 캐시 갱신

서비스 워커 캐시 이름은 `dokkaebi-shell-b24.12`입니다. 이전 화면이 남으면 게임의 복구/새로고침 기능을 사용하거나 사이트 데이터를 한 번 제거합니다.

## 롤백

v1.0.11 백업으로 복구하는 방법이 가장 안전합니다. 수동 롤백이 필요하면 패치 매니페스트의 `added` 파일을 제거하고 `modified` 파일을 백업본으로 되돌립니다.
