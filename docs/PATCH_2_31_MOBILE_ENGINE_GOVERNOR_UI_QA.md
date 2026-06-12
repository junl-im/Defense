# Kingdom Seed v2.31.0 Mobile Engine Governor + UI QA

## 목표

v2.30의 모바일 엔진 안정화 위에 런타임 가버너를 추가해, 약한 네트워크/저사양 기기/모바일 WebView에서 프레임 멈춤이 감지되면 자동으로 더 안전한 실행 모드로 내려가도록 정리했다. 이번 버전은 대용량 원화 에셋 추가보다 첫 접속, 첫 전투, 장시간 전투 안정성을 우선한다.

## 핵심 변경

- RuntimeFrameGovernor 추가
  - requestAnimationFrame 기반 프레임 멈춤 감시
  - 큰 프레임 스파이크/낮은 평균 FPS 감지
  - 반복 멈춤 발생 시 `ksRuntimeLockdown` 저장
  - 런타임 quality를 즉시 low로 낮춤
  - memory-pressure 이벤트 발행으로 선택형 텍스처 정리 유도

- MobileRuntimeEngine 보강
  - LOCKDOWN_MOBILE_ENGINE 단계 추가
  - lockdown 상태에서 UI 스케일 확대
  - progressive art / battle art / scene prewarm 차단
  - boot quiet window 확장

- ProgressiveAssetLoader 보강
  - lockdown 상태에서 progressive art 중단
  - 로딩 실패/지연 타임아웃 fail-soft 처리
  - 로딩 큐가 멈춰 다음 씬까지 끌고 가지 않도록 완화

- BootScene 최적화
  - 안전 엔진/lockdown 상태에서 enemy spritesheet, 일부 고비용 FX spritesheet 선로드 스킵
  - `?combatSprites`를 붙이면 비교용으로 전투 스프라이트 선로드 가능
  - fast boot 병렬 다운로드 1개로 제한

- 전투 모바일 UI 확대
  - 건설 지점/타워 터치 히트존 확대
  - 건설 메뉴/카드/패널 크기 확대
  - 전투 내 작은 글자 7~10px 계열을 9~12px 계열로 확대

- PWA/캐시 정책 보강
  - PWA 등록을 더 뒤로 미룸
  - v2.16~v2.27 선택형 UI 아트와 고비용 FX는 런타임 캐시 제외

## 테스트 플래그

- 기본 실행: 안정형 모바일 엔진
- `?quality=low`: 강제 저사양 모드
- `?resetperf`: 자동 lockdown 저장 해제
- `?combatSprites`: 안전 모드에서도 enemy spritesheet 선로드 비교
- `?ultraart`: 고성능 기기용 강제 원화 스트리밍

## 검증

- `npx tsc --noEmit --pretty false` 통과
- 현재 제공된 원본 `node_modules`에서는 Vite/Rolldown optional native binding 누락 및 `.bin/vite` 실행 권한 문제로 `npm run build`가 막힘. 코드 문제는 아니며 `npm install` 후 재시도 필요.
