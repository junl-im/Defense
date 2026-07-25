# v1.0.19 Bundle Marker Hotfix

## 수정
- Vite minification 이후 사라지는 함수명을 검증 기준에서 제거했습니다.
- `DD-ASSET-APPROVAL-RUNTIME-V117` 고정 런타임 마커를 추가했습니다.
- `dist/assets/chunks`를 포함한 JavaScript 파일 재귀 검사를 적용했습니다.
- v1.0.17, v1.0.18, 프로덕션 번들 검증기가 같은 탐지 규칙을 사용합니다.
- GitHub Actions Build 이후 `verify:dist:v119`를 추가했습니다.

## 승인 경계
이번 패치는 CI 차단 오류 해결이 우선이며 신규 캐릭터 최종 승인은 추가하지 않습니다.
