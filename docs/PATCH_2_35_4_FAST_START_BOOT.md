# KingdomSeed v2.35.4 Fast Start Boot Patch

## 목표
첫 접속/첫 탭 이후 화면 진입이 느린 문제를 줄이기 위한 부팅 경량화 패치입니다.

## 변경 사항
- `index.html`에 정적 시작 게이트를 인라인으로 추가했습니다.
  - JS 번들 및 Phaser 초기화 전에 즉시 `KINGDOM SEED` 시작 화면이 보입니다.
- `src/platform/WebShell.ts`가 기존 정적 `#start-gate`를 재사용하도록 변경했습니다.
  - 중복 시작 게이트가 생기지 않습니다.
- `src/scenes/BootScene.ts`에 v2.35.4 초고속 부팅 모드를 추가했습니다.
  - 기본 주소에서는 로그인 화면에 필요한 최소 에셋만 프리로드합니다.
  - 월드맵, 전투, 유물, FX, 오디오 에셋은 기본 부팅에서 제외됩니다.
  - 기존 전체 프리로드가 필요하면 `?fullpreload`를 사용합니다.
  - 이전 fast boot 동작을 비교하고 싶으면 `?legacyboot`를 사용합니다.
- 기본 부팅 오디오는 생략하고, `AudioManager`의 기존 lazy audio 정책으로 필요 시 로드합니다.
  - 모든 오디오를 부팅에 포함하려면 `?preloadAudio`를 사용할 수 있습니다.

## 테스트 권장 주소
- 실기기 기본 테스트: `/`
- 약한 기기 테스트: `/?quality=low` 또는 `/?fast`
- 이전 부팅 비교: `/?legacyboot`
- 전체 프리로드 비교: `/?fullpreload`

## 주의
기본 부팅에서는 첫 로그인 화면 안정성과 속도를 최우선으로 합니다. 일부 로비/전투 장식 에셋은 해당 씬 진입 시 폴백 도형으로 먼저 보일 수 있으며, 고급 아트 검수는 `?fullart`, `?ultraart`, `?fullpreload` 조합으로 확인하세요.
