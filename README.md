# Dokkaebi Luck Defense 3D

## v19.0.0 Browser Reliability Lab

- 게임 버전: **19.0.0**
- 엔진 버전: **16.0.0**
- 세이브 스키마: **17**
- 기준 패치: v18.0.0 Ten-Wave Reliability

### 핵심 업데이트

- 브라우저 부팅·캐시·WebGL·페이지 수명주기 감시
- Long Task와 지원 브라우저 Heap 표본
- 버전형 서비스 워커와 자동 캐시 복구
- 매 접속 전체 캐시 삭제 및 강제 재이동 제거
- F7 브라우저 안정성 스냅샷
- F6 통합 진단에 브라우저 보고서 병합
- 실제 브라우저 자동화를 위한 공개 테스트 API
- Chromium 기반 Browser Lab 실행 스크립트

### 검증

```bash
npm run verify
npm run simulate:v1800
npm run build:static
node scripts/verify-static-dist.mjs
npm run browserlab:v1900
```

### 운영 문서

- `docs/BROWSER_RELIABILITY_LAB_v19.0.0.md`
- `docs/BROWSER_RELIABILITY_LAB_v19.0.0.json`
- `docs/PATCH_NOTES_v19.0.0.md`
- `docs/PATCH_APPLY_v19.0.0.md`
- `docs/NEXT_PATCH_LINEUP_v19.x.md`

Absolute Art Bible v2.0과 Character DNA v3.0은 최상위 제작 계약이다. 브라우저 안정성 통과와 최종 제작 아트 승인은 별도로 관리한다.
