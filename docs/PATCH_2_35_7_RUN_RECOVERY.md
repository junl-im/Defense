# KingdomSeed v2.35.7 Run Recovery Patch

목표: v2.35.5~v2.35.6의 초고속 시작 구조 이후 일부 배포/모바일 WebView에서 게임이 시작되지 않는 상황을 우선 복구한다.

## 핵심 수정

1. Vite 기본 `base`를 `/`에서 `./`로 변경
   - GitHub Pages 하위 경로, Firebase Hosting, 로컬 정적 미리보기 등에서 빌드 산출물의 JS/CSS 동적 청크가 404가 나는 문제를 줄인다.
   - 절대 루트 배포가 필요한 경우 `VITE_BASE_PATH=/ npm run build`로 덮어쓸 수 있다.

2. HTML 시작 게이트에 모듈 로딩 watchdog 추가
   - `index` 모듈 또는 동적 엔진 청크가 로드되지 않으면 시작 게이트에 원인을 표시한다.
   - 흰 화면/무응답 대신 “배포 경로/캐시 문제”를 확인할 수 있다.

3. 시작 게이트 제거 안전화
   - 엔진은 준비됐지만 첫 모바일 탭이 늦게 들어오는 경우, 게이트 문구를 “준비 완료: 탭하면 바로 입장합니다”로 바꾼다.
   - 이후 탭/클릭 시 게이트를 즉시 제거한다.

4. Phaser 생성 디버그 안전장치
   - `window.__KINGDOM_SEED_GAME__`에 Game 인스턴스를 노출해 실기기 콘솔 확인이 쉬워졌다.
   - Phaser 생성 실패 시 `window.__KINGDOM_SEED_BOOT_ERROR__`에 원인을 남긴다.

## 검증

- `npm run build` 통과
- Chromium 모바일 에뮬레이션에서 첫 탭 후 `canvas=true`, `startGate=false`, `bootError=''` 확인
- 빌드된 `dist/index.html`의 JS/CSS 경로가 `./assets/...` 상대 경로로 출력되는 것 확인

## 적용 방법

프로젝트 루트에 압축을 덮어씌운 뒤:

```bash
npm run build
npm run preview
```

캐시가 강하게 남은 모바일 브라우저에서는 새로고침 또는 브라우저 사이트 데이터 삭제 후 확인한다.
