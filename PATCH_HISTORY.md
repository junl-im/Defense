# PATCH HISTORY

## v1.1.0 — 2026-07-20

테마: 첫 3초, 전투 피드백, 배포·인수인계 안정화

### 게임

- 2성 도깨비 무료 강림
- 첫 웨이브 자동 시작
- 미션 배너
- 보스 체력바
- 연속 처치 체인
- 10연속 단위 엽전 보너스
- 치명타와 전투 숫자
- 무결점 웨이브 보너스
- 모바일 진동 피드백
- 적응형 렌더 해상도

### 배포

- 기존 Firebase `web-game2` 설정 반영
- `dokkaebiScores` 컬렉션 분리
- 기존 Defense 규칙과 신규 규칙 병합
- GitHub Pages `/Defense/` 자동 배포 워크플로 추가
- Vite base path 환경 변수 지원

### 개발 운영

- `PROJECT_HANDOFF.md` 신설
- `PATCH_HISTORY.md` 신설
- `DEPLOYMENT_TARGETS.md` 신설
- `scripts/verify-project.mjs` 신설
- 전체 ZIP + 패치 ZIP 분리 방식 확립

## v1.0.0 — 2026-07-20

테마: 새 3D 도깨비 운빨 디펜스 세로 슬라이스

- Three.js 기반 달빛 야시장
- 플레이어 직접 이동과 골드 수집
- 도깨비 6종
- 1~5성 자동 합성
- 대박 기운
- 인연 6종
- 축복 8종
- 적 4종, 보스 2종
- 10웨이브
- 로컬·Firebase 랭킹
- PWA
