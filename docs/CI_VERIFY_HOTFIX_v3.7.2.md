# v3.7.2 CI Verify Reporting Hotfix

## 증상

GitHub Actions의 `npm run verify`가 종료 코드 1로 끝났지만 로그 마지막에는 PASS 항목만 보여 실제 초기 FAIL 원인을 찾기 어려웠다.

## 원인

- `verify-project.mjs`가 세 구간에서 중간 종료했다.
- FAIL은 로그 앞쪽에 출력되고 뒤쪽 PASS가 마지막 화면을 채울 수 있었다.
- 루트의 추가 Markdown처럼 런타임과 무관한 파일도 배포 차단 조건이었다.
- SVG 검사가 문서와 제작 자료까지 포함한 프로젝트 전체를 순회했다.

## 수정

- 모든 프로젝트 검사를 끝까지 실행하고 마지막 한 번만 종료한다.
- 마지막에 `VERIFY FAILURE DIGEST`로 실패 목록을 번호 순서대로 재출력한다.
- 각 실패를 GitHub Actions `::error` 주석으로 표시한다.
- 워크플로가 전체 로그를 `verify.log`에 보존하고 실패 요약을 스텝 마지막에 다시 출력한다.
- `README.md`, `PROJECT_HANDOFF.md` 이외의 루트 Markdown은 INFO 처리한다.
- SVG 금지 검사는 런타임 디렉터리인 `public/`, `src/`로 한정한다.
- 구형 Vite 해시 번들은 특정 파일명 목록이 아니라 동적 패턴으로 검사한다.
- 게임 버전은 `package.json`을 단일 기준으로 비교한다.

## 검증

- 정상 프로젝트 `npm run verify`: exit 0
- 의도적으로 타이틀 버전 불일치 생성: exit 1
- 실패 로그 마지막에 원인 1건과 `::error` 출력 확인
- CI 보고 계약 회귀 검사 추가
- 정적 ESM 배포본 생성 및 자산 경로 검사 통과
