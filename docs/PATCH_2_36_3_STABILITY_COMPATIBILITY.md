# KingdomSeed v2.36.3 Stability / Connection / Compatibility Patch

## 목표

v2.36.0~v2.36.2에서 전장 스케일과 프리미엄 구도를 복구한 뒤, 이번 패치는 기능 추가보다 다음 안정성 축을 정리한다.

- 실행 호환성: WebGL, Canvas, WebAudio, localStorage, visualViewport 상태를 부팅 중 점검한다.
- 연결성: 동적 씬 import / scene.start 실패가 앱 전체 멈춤으로 이어지지 않게 오류를 Shell에 전달한다.
- 저장 호환성: 로컬 저장 데이터가 깨졌거나 예전 스키마여도 숫자/업그레이드/클리어 정보를 안전하게 정규화한다.
- 전투 데이터 무결성: 스테이지 path/spots/waves 값이 잘못 들어와도 최소 플레이 가능한 fallback으로 복구한다.
- 배포 재현성: `latest` 의존성을 제거하고 현재 빌드에서 검증된 버전으로 고정한다.

## 주요 변경 파일

- `package.json`, `package-lock.json`
  - 앱 버전 `2.36.3` 반영
  - Vite / TypeScript / Phaser / Firebase / basic-ssl 버전 고정

- `src/runtime/Version.ts`
  - UI/부팅 표시용 버전 상수 추가

- `src/runtime/CompatibilityGuard.ts`
  - Canvas/WebGL/WebAudio/localStorage/visualViewport/serviceWorker 호환성 점검
  - WebGL이 막힌 브라우저는 Canvas 호환 모드로 Phaser 생성
  - 루트 CSS 클래스와 `kingdom-seed:compat-report` 이벤트 발행

- `src/runtime/GameBootstrap.ts`
  - 호환성 가드 결과에 따라 Phaser renderer/audio/render 옵션 조정

- `src/platform/WebShell.ts`
  - 부팅 게이트 버전 표시 갱신
  - 씬 이동/동적 import 오류를 사용자에게 표시
  - Canvas 호환 모드/호환성 점검 상태를 시작 게이트에 반영

- `src/scenes/SceneRegistry.ts`
  - 동적 씬 등록/전환 실패 시 `kingdom-seed:navigation-error` 발행
  - 현재 씬을 유지해 전체 앱 멈춤을 방지

- `src/services/localSave.ts`
  - 저장 데이터 정규화 강화
  - 업그레이드 레벨/별/클리어 횟수 clamp
  - storage 차단 환경에서도 게스트 세션이 즉시 시작되도록 보호

- `src/game/RuntimeIntegrity.ts`
  - 스테이지 path/spots/waves/startGold/maxLives 안전화

- `src/scenes/GameScene.ts`
  - GameScene 진입 시 스테이지 무결성 검사 적용

- `src/scenes/MenuScene.ts`
  - 시작 화면 버전 배지 갱신

## 검증

```bash
npm run build
```

결과: TypeScript + Vite production build 통과.
Phaser 청크 500kB 경고는 기존 구조상 남아 있는 경고이며 빌드 실패가 아니다.

## 적용 방식

기존 프로젝트 루트에 zip 내용을 덮어쓴다.
`node_modules`, `dist`, `.git`은 포함하지 않는다.
