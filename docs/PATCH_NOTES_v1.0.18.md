# v1.0.18 패치 노트 — CI Approval Deployment Gate

## 해결된 오류

GitHub Actions에서 `npm run verify`가 Vite 빌드보다 먼저 실행되는데도 v1.0.17 검증기가 `dist`의 승인 자산을 요구하여 발생하던 6개 실패를 수정했습니다.

- 소스 검증에서는 `public`, `src`, 승인 레지스트리와 런타임 연결만 확인합니다.
- 실제 `dist` 파일은 빌드가 끝난 뒤 `verify:dist:v117`, `verify:dist:v118`에서 확인합니다.
- GitHub Pages 작업 순서를 `소스 검증 → Build → 승인 자산 배포 검증 → 번들 검증`으로 고정했습니다.
- 정적 폴백 빌더의 버전 하드코딩을 제거하고 `package.json`을 기준으로 동작하게 했습니다.

## 아트 승인 상태

- v1.0.17에서 승인된 푸푸도깨비 11방향과 수호성 4상태는 그대로 유지합니다.
- 이번 패치는 새로운 캐릭터를 억지로 최종 승인하지 않습니다.
- 다음 장난 요괴 11방향 후보는 품질 검수 전까지 교체 대기이며 런타임 미적용입니다.

## 검증 명령

```bash
npm run verify
npm run build
npm run verify:dist:v117
npm run verify:dist:v118
node scripts/verify-production-bundle-v101.mjs
```
