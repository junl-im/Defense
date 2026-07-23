# PROJECT HANDOFF — CURRENT v23.0.0

- Project: `DokkaebiLuckDefense3D_FULL_v23.0.0`
- Game: `23.0.0`
- Engine: `20.0.0`
- Save schema: `21`
- Patch: `Quiet Screen`
- Base: `v22.0.0 Autonomous Moonfront`
- Art lock: `DD-ABSOLUTE-ART-BIBLE-2.0`

## Current runtime

- Three.js 0.185.1
- Vite 8.1.5
- 전투 GLB 19종
- v13 개별 스프라이트 415개
- v15 런타임 아틀라스 154프레임
- 런타임 수직 슬라이스 6/6
- 10웨이브 상태 시뮬레이션 10/10
- 최종 제작 아트 0/6
- 1,130개 생산 잠금 유지

## v23 runtime modules

- `src/runtime/mobile-hud-director-v23.js`
- `scripts/simulate-mobile-hud-v23.mjs`
- `scripts/verify-v2300.mjs`

## v23 behavior contracts

- 카메라 `+ / −` 버튼은 존재하지 않는다.
- 휠과 두 손가락 핀치 줌은 유지한다.
- 모바일 화면은 상단 정보, 하단 조작, 중앙 컨텍스트의 예약 영역을 사용한다.
- 컨텍스트 우선순위는 진행 복구 > 다음 웨이브 > 상호작용 > 위험 경고다.
- 한 번에 하나의 모바일 컨텍스트 안내만 표시한다.
- 320·360·390·430px 및 가로 화면에서 조작부와 컨텍스트가 겹치지 않아야 한다.
- 실제 DOM 겹침이 감지되면 비상 레이아웃을 적용한다.
- 모바일 전투 중 비필수 정보 패널은 접힌다.

## Verification commands

```bash
npm run verify
npm run simulate:v2300
npm run simulate:v2200
npm run simulate:v1800
npm run build:static
node scripts/verify-static-dist.mjs
```

## Known limitations

- 모바일 레이아웃 시뮬레이션은 예약 영역의 기하 계약을 검사하며 실제 OS 글꼴 배율까지 재현하지는 않는다.
- 컨테이너 Chromium의 GPU 제한으로 실제 WebGL 장시간 터치 플레이는 수행하지 못했다.
- 실기기에서 접근성 글꼴 확대, 브라우저 주소창 변화, 가상 키보드 표시 상황은 추가 QA가 필요하다.
