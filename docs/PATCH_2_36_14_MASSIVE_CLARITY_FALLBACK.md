# KingdomSeed v2.36.14 Massive Clarity Fallback

## 목적

v2.36.13에서 모바일 가독성 패스를 전 씬에 적용했지만, 실제 모바일 화면에서는 여전히 일부 텍스트와 버튼이 작게 보일 수 있었다. v2.36.14는 단순 확대가 아니라, 상용 모바일 웹 게임 기준의 **가독성/터치성/대안 모드**를 대규모로 보강한다.

## 핵심 변경

- `MobileReadableUi.ts`를 모바일 시안성 가버너로 확장
  - 디바이스/뷰포트/런타임 안전 모드 기반 UI 스케일 자동 산정
  - `?largeui`, `?hugeui`, `?clarityui`, `?readableui` 지원
  - `?contrastui`, `?highcontrast`, `?fallbackui` 고대비 모드 지원
  - `localStorage.ksReadableUi`, `localStorage.ksContrastUi`로 설정 유지
- 전 씬 자동 가독성 보정 강화
  - 최초 1회가 아니라 0ms/120ms/360ms/760ms 다단계 보정
  - 씬 전환/뷰포트 변경 시 `kingdom-seed:readability-refresh`로 재보정
  - 텍스트 원래 크기를 WeakMap으로 기억해 중복 호출 시 무한 확대 방지
- 터치 히트 영역 확대
  - 기본 최소 터치 영역을 모바일에서 더 크게 보정
  - `hugeui`/고대비/런타임 락다운에서는 더 큰 터치 안전 영역 사용
- 씬별 legibility scaffold 추가
  - 전투: 상단 HUD, 하단 스킬 독, 전장 외곽에 저비용 어두운 가독성 매트 추가
  - 로그인: 로그인 버튼 주변 카드 대비 보강
  - 로비: 하단 커맨드 독 시안성 보강
  - 월드맵: 우측 작전 정보 패널과 하단 네비게이션 대비 보강
  - 서브 화면: 상하단 안전 가독성 매트 보강
- 전투 일시정지 메뉴에 즉시 대안책 추가
  - `큰 UI` 버튼: normal → large → huge → normal 순환
  - `고대비` 버튼: 고대비 모드 ON/OFF
  - 적용 즉시 현재 씬 가독성 재보정
- WebShell 보강
  - 시작 게이트에도 모바일 readable/large/high-contrast shell class 적용
  - 작은 뷰포트/강제 옵션에 따라 첫 탭 화면도 더 크게 표시
- CSS 보강
  - `ks-shell-readable`, `ks-shell-large-ui`, `ks-shell-huge-ui`, `ks-shell-contrast-ui` 추가
  - 고대비 모드에서 시작 게이트 카드/문구 대비 강화
  - 저사양/안전 모드에서는 canvas filter를 계속 억제해 성능 우선 유지

## 유지한 원칙

- 새 대용량 이미지 없음
- 새 atlas 없음
- 새 오디오 없음
- Firebase/PWA/오디오 지연 처리 유지
- 전투 중 무거운 아트 스트리밍 금지 유지
- 첫 접속/첫 탭 성능 정책 유지
- 기존 `?tinyui`, `?compactui`, `?legacyreadability`, `?toydebug` escape hatch 유지

## 새 검수 옵션

- `?largeui`: 큰 UI 강제
- `?hugeui`: 초대형 UI 강제
- `?clarityui` 또는 `?readableui`: 모바일 시안성 모드 강제
- `?contrastui` 또는 `?highcontrast`: 고대비 모드 강제
- `?fallbackui`: 고대비 대안 UI 강제
- `?noscaffold`: 씬별 가독성 매트 비활성화

## 수정 파일

- `src/game/MobileReadableUi.ts`
- `src/scenes/GameScene.ts`
- `src/platform/WebShell.ts`
- `src/style.css`
- `src/runtime/Version.ts`
- `package.json`
- `package-lock.json`
- `index.html`
