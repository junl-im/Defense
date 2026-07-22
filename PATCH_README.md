# v3.7.0 패치 적용 안내

기준 버전: **v3.6.0**  
대상 버전: **v3.7.0 / Engine 2.7.0**

## 중요 빌드 수정

GitHub Actions의 `BOSS_ASSET_IDS` MISSING_EXPORT 오류를 제거했습니다.

- `main.js`는 에셋 ID를 `src/engine/asset-catalog.js`에서 직접 가져옵니다.
- `src/engine/index.js`에도 호환 재수출을 명시적으로 포함합니다.
- `npm run verify`가 named import/export 계약을 빌드 전에 검사합니다.
- GitHub Pages 워크플로는 verify 통과 후 build를 실행합니다.

## 적용

이 폴더의 내용을 v3.6.0 프로젝트 루트에 덮어쓴 뒤 실행합니다.

```bash
npm ci
npm run verify
npm run build
```

패치 ZIP에는 `dist/`가 없습니다. 새 `dist/`를 배포해야 합니다.

## 범위

- 추가 9개
- 수정 34개
- 삭제 0개
- 공용 리그 적 2종 GLB 교체
- UI 스트레스 계약과 텍스트 overflow 방어
- 원거리 아틀라스 6개 768×576 최적화
- 텍스처 예산 53.19MB / 64MB
