> 현재 개선 패치: **v1.0.29 / b24.29** — ASSET REFINEMENT ASSURANCE

# PROJECT HANDOFF — RELEASE 1.0.29

- Project: `DokkaebiLuckDefense3D_FULL_v1.0.29_ASSET_REFINEMENT_ASSURANCE`
- Public game version: `1.0.29`
- Build ID: `b24.29`
- Base: `v1.0.28 / b24.28`

## 현재 승인 상태

- 푸푸도깨비 11방향 원본: 최종 승인 유지
- v1.0.29 파생 아틀라스: 런타임 파생 승인
- 독립 공격·기술·피격 원화: 파생 임시 승인
- 장난 요괴 폭탄병 후보: 교체 대기, 런타임 격리
- 신규 최종 캐릭터 원화 승인: 0종

## 검증 명령

```bash
npm run verify
npm run build:static
npm run verify:dist:v129
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

v1.0.12 크로스 플랫폼 기반, v1.0.17 승인 경계, v1.0.20 주인공 11방향 적용, v1.0.28 전장 가시성 계약을 유지한다.


## v1.0.31 Asset Lineage Assurance
- Cumulative from v1.0.29, including missing v1.0.30 audit scope.
- 10 runtime characters / 30 texture files audited.
- 70-wave lifecycle diagnostics.

## v1.0.32 Silhouette Assurance

- `DD-SILHOUETTE-ASSURANCE-V132` 런타임 마커를 유지한다.
- 실루엣 근접 중복은 0쌍이며 이무기/왕 유사 쌍은 사람 검토 대상으로 남긴다.
- 독립 액션은 `derived-provisional`, 폭탄병은 `quarantined` 상태를 유지한다.
- 다음 예정 문서는 `docs/NEXT_UPDATE_v1.0.33.md`이다.
