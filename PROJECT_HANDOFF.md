> 현재 개선 패치: **v1.0.33 / b24.33** — BOSS IDENTITY ASSURANCE

# PROJECT HANDOFF — RELEASE 1.0.33

- Project: `DokkaebiLuckDefense3D_FULL_v1.0.33_BOSS_IDENTITY_ASSURANCE`
- Public game version: `1.0.33`
- Build ID: `b24.33`
- Base: `v1.0.32 / b24.32`

## 현재 승인 상태

- 푸푸도깨비 11방향 원본: 최종 승인 유지
- v1.0.29 파생 아틀라스: 런타임 파생 승인 유지
- 독립 공격·기술·피격 원화: 파생 임시 승인
- 보스 식별 프로필 3종: 런타임 승인
- 이무기/왕 실루엣 유사 쌍: 사람 검토 유지, 런타임 구분 승인
- 장난 요괴 폭탄병 후보: 교체 대기, 런타임 격리
- 신규 최종 캐릭터 원화 승인: 0종

## 검증 명령

```bash
npm run verify
npm run build:static
npm run verify:dist:v133
```

## PERMANENT ROOT HYGIENE CONTRACT

- 생성 로그·검증 결과·패치 메타데이터는 프로젝트 루트에 두지 않는다.
- 패치 산출물 메타데이터는 `logs/patch/<version>/` 아래에 기록한다.
- 작성 문서는 `docs/`, 실행 로그는 `logs/`, 배포 결과는 `dist/`에만 둔다.
- 컴팩트 패키지 안내는 `docs/`, dist 재생성 도구는 `scripts/`에 둔다.
- 루트에 `COMPACT_PACKAGE_NOTE.txt` 또는 `REBUILD_DIST_WINDOWS.bat`를 다시 만들지 않는다.

## PERMANENT NATIVE KEY CONTRACT

- 브라우저 F1~F12, 새로고침, 개발자 도구 등 기본 단축키를 게임이 가로채지 않는다.
- 전역 키보드 입력은 이동키만 처리한다.
- 공격·기술·일시정지·제작 콘솔은 화면 버튼과 명시적 UI를 사용한다.

## 보존된 릴리스 기반

v1.0.12 크로스 플랫폼 기반, v1.0.17 승인 경계, v1.0.20 주인공 11방향 적용, v1.0.29 파생 아틀라스, v1.0.31 에셋 계보 감사, v1.0.32 실루엣 검증을 유지한다.

## v1.0.33 Boss Identity Assurance

- `DD-BOSS-IDENTITY-ASSURANCE-V133` 런타임 마커를 추가한다.
- 청월 이무기와 백귀 야행왕의 색상·문양·장판 언어를 분리한다.
- 90웨이브 자원 수명주기 진단을 추가한다.
- 다음 예정 문서는 `docs/NEXT_UPDATE_v1.0.34.md`이다.
