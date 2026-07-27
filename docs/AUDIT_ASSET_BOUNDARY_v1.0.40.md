# Audit Asset Boundary v1.0.40

## 목적

Vite가 `public/` 전체를 `dist/`에 복사하면서 제작·감사용 원본 시트가 배포되는 문제를 차단한다.

## 계약

- 런타임 공개 경로: `public/assets/ip-v13/crops/**`
- 제작 원본 보관 경로: `production/DokkaebiDefense/15_Source_Archives/ip-v13/sheets/**`
- 금지 배포 경로: `dist/assets/ip-v13/sheets/**`
- 패치 덮어쓰기 후 남은 구 경로는 `npm run clean:obsolete`가 제거한다.
- 원본 10개는 매니페스트 SHA-256과 일치해야 한다.
