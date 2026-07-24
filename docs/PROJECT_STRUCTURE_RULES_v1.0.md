# Project Structure Rules v1.0 — Permanent Contract

## 루트 허용 원칙

프로젝트 루트에는 실행, 패키지 관리, 배포 설정, 필수 인수인계 문서만 둔다. 새 Markdown, JSON, 이미지, ZIP, 로그, 임시 백업은 루트에 만들지 않는다.

## 생성 위치

- 실행 로그: `logs/verify/`, `logs/build/`
- 시뮬레이션: `logs/simulations/`
- 자동 감사: `logs/audits/`
- 패치 관리 파일: `logs/patch/<version>/`
- 정식 기술 문서와 승인된 기준선: `docs/`
- 소스: `src/`
- 공개 런타임 에셋: `public/`
- 생성 스크립트: `scripts/`
- 정적 배포: `dist/`

## 금지 규칙

1. 루트에 `*.log`, 감사·시뮬레이션 JSON, 미리보기 이미지, ZIP을 만들지 않는다.
2. 패치 ZIP의 관리 파일을 프로젝트 루트에 풀지 않는다.
3. 일반 검증 명령이 `docs/` 기준선을 덮어쓰지 않는다.
4. 기준선 갱신은 리뷰 후 `--refresh-baseline`으로만 수행한다.
5. 신규 루트 파일 또는 디렉터리는 구조 계약 갱신과 리뷰 없이는 추가하지 않는다.

## 강제 검증

- `npm run hygiene:check`: 허용 목록 밖 루트 항목이 있으면 실패
- `npm run hygiene:organize`: 과거 생성 산출물을 `logs/legacy-root-output/`으로 이동
- `npm run verify:logged`: 검증 출력을 `logs/verify/`에 저장
- `npm run build:logged`: 빌드 출력을 `logs/build/`에 저장

이 계약은 모든 후속 패치와 인수인계에 상속된다.
