# 도깨비 운빨 수호대 3D

모바일 브라우저에서 직접 전장을 뛰어다니며 엽전을 줍고, 랜덤 도깨비를 소환·합성하는 Three.js 기반 3D 액션 운빨 디펜스입니다.

현재 버전: **1.4.0 — 배포 복구, 보스 다단계 전투, 위험 계약 패치**

## 핵심 플레이

`이동 → 자동 공격 → 엽전 직접 수집 → 랜덤 소환 → 3개 자동 합성 → 5성 궁극 진화 → 보스 격파`

## v1.4 주요 변경

- GitHub Pages에서 구버전 서비스워커 캐시 때문에 로딩 화면이 멈추는 문제 복구
- v1.1~v1.3의 이전 HTML이 요청하는 구버전 번들 파일을 한 번 더 제공해 자동 복구
- 메인 빌드 파일명을 `assets/game.js`, `assets/game.css`로 고정
- 8초 이상 초기화되지 않으면 캐시 정리 버튼이 있는 오류 화면 표시
- 저승 호랑이 50% 체력 광폭 2페이즈
- 백귀 야행왕 68%, 32% 체력에서 2·3페이즈 전환
- 보스 다음 공격명과 남은 시간을 보여주는 의도 HUD
- 도약, 광폭 충격파, 백귀 소환, 백귀 야행진 패턴
- 웨이브 4·8 종료 후 다음 웨이브에 적용할 위험 계약 선택

## 위험 계약

- **혈월의 사냥**: 적 체력과 속도가 증가하지만 엽전 보상과 선택권이 증가
- **신목의 맹세**: 신목 피해가 커지지만 무피해 성공 시 엽전 120개와 대량 점수
- **강림 봉인**: 다음 웨이브 전투 중 소환 불가, 성공 시 무료 3성과 선택권 획득

## 실행

Node.js `20.19+` 또는 `22.12+` 권장입니다.

```bash
npm install
npm run verify
npm run dev
```

프로덕션 빌드:

```bash
npm run build
npm run preview
```

미리 빌드된 실행본은 `dist/`에 포함됩니다.

## GitHub Pages 배포

- 저장소: `junl-im/Defense`
- Pages: `https://junl-im.github.io/Defense/`
- base path: `/Defense/`
- 자동 배포: `.github/workflows/deploy.yml`

GitHub Desktop에서 변경 파일을 저장소 루트에 덮어쓴 뒤 `main` 브랜치에 push하면 Actions가 빌드·배포합니다.

배포 후 최초 확인 주소:

```text
https://junl-im.github.io/Defense/?fresh=1.4.0
```

v1.4는 오래된 서비스워커를 제거하므로 첫 접속에서 한 번 자동 새로고침될 수 있습니다. 이후에는 일반 주소로 접속하면 됩니다.

## Firebase

- 프로젝트 ID: `web-game2`
- Auth Domain: `web-game2.firebaseapp.com`
- 랭킹 컬렉션: `dokkaebiScores`

Firebase 연결 실패 시에도 로컬 저장으로 플레이할 수 있습니다.

```bash
npm run deploy:rules
npm run deploy
```

## 주요 파일

```text
src/main.js                 Three.js 월드, 전투, 소환, 합성, 보스, 계약
src/game-data.js            도깨비, 적, 시너지, 축복, 계약 데이터
src/sound-engine.js         Web Audio 절차형 효과음
src/style.css               모바일 HUD와 연출 스타일
src/firebase.js             익명 로그인과 온라인 랭킹
public/sw.js                구버전 서비스워커 캐시 제거용 일회성 스크립트
public/assets/              v1.1~v1.3 캐시 복구용 구버전 진입 번들
PROJECT_HANDOFF.md          전체 기록과 다음 작업 인수인계
```

## 검증

```bash
npm run verify
VITE_BASE_PATH=/Defense/ npm run build
```

검증 항목:

- 92개 HTML·JavaScript DOM ID 연결
- package/runtime 버전 일치
- 루트 Markdown `README.md`, `PROJECT_HANDOFF.md` 두 개 유지
- 구버전 캐시 복구 파일 존재
- 안정적인 `game.js`, `game.css` 빌드 설정
- 보스 페이즈·의도 HUD·위험 계약 코드 존재
- 기본 빌드와 `/Defense/` Pages 빌드

제작 환경의 Chromium에서는 EGL/ANGLE WebGL 초기화가 되지 않아 자동 3D 화면 캡처가 불가능했습니다. Android Chrome과 iPhone Safari에서 보스 패턴 범위와 프레임을 실제 확인해야 합니다.

## 패치 ZIP 적용

v1.4부터 패치 ZIP 안에는 **프로젝트 상대 경로의 변경 파일만 바로 들어 있습니다.** 중간 `PATCH_FILES/` 폴더나 패치 안내 문서는 포함하지 않습니다.

1. 패치 ZIP을 엽니다.
2. 내부 파일 전체를 GitHub 저장소 루트에 덮어씁니다.
3. `npm install`, `npm run verify`를 실행합니다.
4. GitHub Desktop으로 commit 후 push합니다.

패치 ZIP에는 `dist/`가 없습니다. GitHub Actions가 새 `dist/`를 자동 생성하며, 정적 실행본이 필요하면 전체 ZIP을 사용합니다.
