# Generated Logs

이 디렉터리는 검증, 빌드, 시뮬레이션, 브라우저 감사와 패치 적용 기록의 유일한 생성 위치다.

- `logs/verify/` — 검증 출력
- `logs/build/` — 빌드 출력
- `logs/simulations/` — 실행 시뮬레이션 JSON
- `logs/audits/` — 브라우저·에셋 감사 JSON
- `logs/patch/` — 패치 ZIP 내부 관리 파일
- `logs/legacy-root-output/` — `npm run hygiene:organize`로 이동된 과거 루트 산출물

생성 파일은 Git에 커밋하지 않는다. 기준선으로 보존해야 하는 결과만 명시적 `--refresh-baseline`을 사용해 `docs/`에 갱신한다.
