# Dokkaebi Luck Defense 3D

## v23.0.0 Quiet Screen

- 게임 버전: **23.0.0**
- 엔진 버전: **20.0.0**
- 세이브 스키마: **21**
- 기준 패치: **v22.0.0 Autonomous Moonfront**

### 핵심 업데이트

- 화면 `+ / −` 카메라 줌 버튼을 DOM과 이벤트 코드에서 완전히 제거했습니다.
- 카메라 줌은 마우스 휠과 모바일 두 손가락 핀치만 유지합니다.
- 모바일 HUD를 상단 정보, 하단 조작, 중앙 컨텍스트의 세 개 예약 영역으로 분리했습니다.
- 진행 복구, 다음 웨이브, 상호작용, 위험 경고는 하나의 컨텍스트 슬롯을 우선순위로 공유합니다.
- 320·360·390·430px, 와이드 모바일, 가로 화면 전용 프로필을 추가했습니다.
- 실제 DOM 겹침 검사와 비상 축소 레이아웃을 강화했습니다.
- 전투 중 임무·인연·유물·보조 정보는 모바일에서 자동으로 접습니다.
- 보스 HUD는 모바일에서 핵심 체력·BREAK 정보만 우선 표시합니다.

### 검증

```bash
npm run verify
npm run simulate:v2300
npm run simulate:v2200
npm run simulate:v1800
npm run build:static
node scripts/verify-static-dist.mjs
```

### 운영 문서

- `docs/QUIET_SCREEN_v23.0.0.md`
- `docs/MOBILE_UI_SIMULATION_v23.0.0.json`
- `docs/PATCH_NOTES_v23.0.0.md`
- `docs/PATCH_APPLY_v23.0.0.md`
- `docs/NEXT_PATCH_LINEUP_v23.x.md`

## 제작 상태

- 런타임 수직 슬라이스: **6/6**
- 전투 GLB: **19종**
- v13 개별 스프라이트: **415개**
- v15 런타임 아틀라스: **154프레임**
- 최종 제작 아트: **0/6**
- 1,130개 대량 생산: **잠금 유지**

Absolute Art Bible v2.0과 Character DNA v3.0은 최상위 제작 계약입니다. 기존 후보 GLB와 자동 처리 2D 자산은 최종 제작 아트로 승인하지 않습니다.
