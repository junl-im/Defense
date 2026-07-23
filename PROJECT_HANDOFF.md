# PROJECT HANDOFF — CURRENT v18.0.0

- Project: `DokkaebiLuckDefense3D_FULL_v18.0.0`
- Game: `18.0.0`
- Engine: `15.0.0`
- Save schema: `16`
- Patch: `Ten-Wave Reliability`
- Art lock: `DD-ABSOLUTE-ART-BIBLE-2.0`

## Current runtime

- Three.js 0.185.1
- Vite 8.1.5
- 전투 GLB 19종
- v13 개별 스프라이트 415개
- v15 런타임 아틀라스 154프레임
- 런타임 수직 슬라이스 6/6
- 최종 제작 아트 0/6
- 1,130개 생산 잠금 유지

## v18 reliability layer

- `src/runtime/wave-reliability-director.js`
- `src/runtime/ten-wave-reliability-simulation.js`
- 웨이브별 시간·상태 전환·복구 이력
- 적 체력·거리 서명 기반 정지 탐지
- 비정상 적 위치·HP·행동 복구
- 보상 큐와 첫 진군 타이머 복구
- 탭 숨김 시 자동 정지, 복귀 시 자동 재개
- 경량 체크포인트 `dokkaebi-wave-checkpoint-v18`
- F6 통합 진단 JSON

## Verification commands

```bash
npm run verify
npm run build:static
node scripts/verify-static-dist.mjs
npm run simulate:v1800
```

## Known limitations

- 결정론적 10웨이브 시뮬레이션은 통과한다.
- 현재 검증은 코드·데이터·정적 배포 계약 중심이다.
- 실제 모바일 OS의 메모리 회수, 장시간 발열, 네트워크 단절, BFCache 복구는 실기기 검증이 필요하다.
- 최종 신규 3D 영웅·몬스터·보스·환경은 아직 production-approved가 아니다.
