> 현재 개선 패치: **v1.0.22 / b24.22** — BATTLEFIELD CLARITY

# PROJECT HANDOFF — RELEASE 1.0.22

- Project: `DokkaebiLuckDefense3D_FULL_v1.0.22_BATTLEFIELD_CLARITY`
- Public game version: `1.0.22`
- Build ID: `b24.22`
- Base: `v1.0.21 / b24.21`

## 승인 경계

푸푸도깨비 11방향 원화 승인은 유지합니다. 이번 패치는 신규 원화 승인보다 방향 전환 안정화, HP 바 겹침 분산, HUD 안전영역, 장시간 성능 보호를 강화합니다.

## PERMANENT ROOT HYGIENE CONTRACT

- 패치 생성물과 임시 비교 파일은 프로젝트 루트에 두지 않는다.
- 패치 로그와 검증 결과는 `logs/patch/<version>/` 아래에 저장한다.
- 배포 ZIP, 체크섬, 적용 안내서는 프로젝트 외부 산출물 폴더에서 생성한다.
- `npm run hygiene:check`를 패치 전후에 모두 통과해야 한다.

## PERMANENT NATIVE KEY CONTRACT

- 브라우저 기본 기능키와 시스템 단축키를 전역으로 가로채지 않는다.
- 게임 전역 키 입력은 이동 입력만 허용하며, 액션 기능은 화면 버튼과 터치 UI를 사용한다.
- 개발 콘솔과 진단 화면은 사용자에게 보이는 버튼을 통해 연다.

## PRESERVED RELEASE LINEAGE

v1.0.12 비주얼 폴리시 기반과 이후 승인 자산을 보존한다. v1.0.17 방향 승인, v1.0.20 주인공 적용, v1.0.21 실전 전투 계약 위에 v1.0.22를 적용한다.
