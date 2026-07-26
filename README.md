> 현재 개선 패치: **v1.0.29 / b24.29** — 승인 원본 보존형 아틀라스 정제, 모바일 위험 방향 그룹, 50웨이브 검증

# 도깨비 럭 디펜스 3D

## v1.0.29 핵심 변경

- 푸푸도깨비 승인 원본의 보이는 픽셀·알파를 그대로 보존한 런타임 파생 아틀라스
- 셀 내부 3px 투명 RGB 확장과 0.75px UV 안전 여백
- 11방향 × 6개 액션, 66셀 중심점·접지점 프로필
- 모바일 위험 표시 방향 그룹화
- 50웨이브 FPS·메모리·파티클·투사체·비주얼 수명주기 검사
- 독립 액션 원화와 폭탄병 후보는 검증 전 임시·격리 상태 유지

## 검증

```bash
npm run verify
npm run build:static
npm run verify:dist:v129
```

상세 내용은 `docs/ASSET_REFINEMENT_ASSURANCE_v1.0.29.md`를 확인한다.

## 보존된 기반

- v1.0.12 크로스 플랫폼 비주얼·방향성 자산 기반을 유지한다.
- v1.0.17 승인 자산 경계와 수호성 상태 자산을 유지한다.
- v1.0.20 주인공 11방향 런타임 연결을 유지한다.
- v1.0.28 전장 가시성 및 40웨이브 검증을 유지한다.


## v1.0.31 Asset Lineage Assurance
- Cumulative from v1.0.29, including missing v1.0.30 audit scope.
- 10 runtime characters / 30 texture files audited.
- 70-wave lifecycle diagnostics.

## v1.0.32 Silhouette Assurance

- 10종 실루엣 지문·45쌍 유사도 감사
- 푸푸 66셀 액션 구분 증거와 승인 경계 고정
- 모바일 위험 구역 압축 및 80웨이브 안정성 검사
- 진단: `window.__DOKKAEBI_SILHOUETTE_ASSURANCE_V132__`
