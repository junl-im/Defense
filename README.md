# Dokkaebi Luck Defense 3D

## v18.0.0 Ten-Wave Reliability

- 게임 버전: **18.0.0**
- 엔진 버전: **15.0.0**
- 세이브 스키마: **16**
- 기준 패치: v17.0.0 Moon Gate Reborn

### 핵심 업데이트

- 10웨이브 전체 상태 전환 감시
- 적 체력·거리 기반 정지 탐지와 경로 복구
- 보상 큐·첫 웨이브 타이머 자동 복구
- 백그라운드 자동 일시정지·자동 재개
- 웨이브 체크포인트와 진단 타임라인
- F6 통합 신뢰성 JSON 내보내기
- 결정론적 10웨이브 장애 주입 시뮬레이션

### 검증

```bash
npm run verify
npm run build:static
node scripts/verify-static-dist.mjs
npm run simulate:v1800
```

### 운영 문서

- `docs/TEN_WAVE_RELIABILITY_v18.0.0.md`
- `docs/TEN_WAVE_RELIABILITY_SIMULATION_v18.0.0.json`
- `docs/PATCH_NOTES_v18.0.0.md`
- `docs/PATCH_APPLY_v18.0.0.md`
- `docs/NEXT_PATCH_LINEUP_v18.x.md`

Absolute Art Bible v2.0과 Character DNA v3.0은 계속 최상위 제작 계약이다. 런타임 안정성 통과와 최종 제작 아트 승인은 별도로 관리한다.
