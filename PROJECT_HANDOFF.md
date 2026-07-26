> 현재 개선 패치: **v1.0.27 / b24.27** — BOSS TACTICAL ASSURANCE

# PROJECT HANDOFF — RELEASE 1.0.27

- Project: `DokkaebiLuckDefense3D_FULL_v1.0.27_BOSS_TACTICAL_ASSURANCE`
- Public game version: `1.0.27`
- Build ID: `b24.27`
- Base: `v1.0.26 / b24.26`

## 현재 승인 상태

- 푸푸도깨비 11방향: 최종 승인 유지
- 독립 공격·기술·피격 원화: 파생 임시 승인
- 장난 요괴 폭탄병 후보: 교체 대기, 런타임 격리
- 화면 밖 위험 레이더·보스 카메라 보조·모바일 가로 HUD: 런타임 승인

## 검증 명령

```bash
npm run verify
npm run build:static
npm run verify:dist:v127
```

## PERMANENT ROOT HYGIENE CONTRACT

- 생성 로그·검증 결과·패치 메타데이터는 프로젝트 루트에 두지 않는다.
- 패치 산출물 메타데이터는 `logs/patch/<version>/` 아래에 기록한다.
- 작성 문서는 `docs/`, 실행 로그는 `logs/`, 배포 결과는 `dist/`에만 둔다.

## PERMANENT NATIVE KEY CONTRACT

- 브라우저 F1~F12, 새로고침, 개발자 도구 등 기본 단축키를 게임이 가로채지 않는다.
- 전역 키보드 입력은 이동키만 처리한다.
- 공격·기술·일시정지·제작 콘솔은 화면 버튼과 명시적 UI를 사용한다.

## 보존된 릴리스 기반

v1.0.12 크로스 플랫폼 비주얼 기반, v1.0.17 승인 자산 경계, v1.0.20 주인공 11방향 적용, v1.0.26 보스전 검증을 유지한다.
