# Dokkaebi Luck Defense 3D

## v17.0.0 Moon Gate Reborn

- 게임 버전: **17.0.0**
- 엔진 버전: **14.0.0**
- 세이브 스키마: **15**
- Three.js: **0.185.1**

### 핵심 업데이트

- 사용자 제공 PC·모바일 첫 화면 배경 최적화 적용
- 신규 도깨비 마스코트 알파 WebP 적용
- Wave Flow Guard로 웨이브 3~4 전환 정지 복구
- 축복·유물 선택 화면 가시성 복구 및 추천 계속 버튼
- 적 모델 생성 실패 시 대체 소환
- 프레임 서브시스템 오류 격리 및 F4 진단

### 검증

```bash
npm run verify
npm run build:static
node scripts/verify-static-dist.mjs
```

### 주요 문서

- `docs/MOON_GATE_REBORN_v17.0.0.md`
- `docs/STAGE_STALL_AUDIT_v17.0.0.json`
- `docs/TITLE_ASSET_OPTIMIZATION_v17.0.0.json`
- `docs/PATCH_NOTES_v17.0.0.md`
- `docs/PATCH_APPLY_v17.0.0.md`
