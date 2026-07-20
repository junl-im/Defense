# 도깨비 운빨 수호대 3D

모바일 브라우저에서 직접 전장을 뛰어다니며 엽전을 줍고, 랜덤 도깨비를 소환·합성하는 Three.js 기반 3D 액션 운빨 디펜스입니다.

현재 버전: **1.3.0 — 5성 궁극 진화 & 초행 임무 패치**

## 핵심 플레이

`이동 → 자동 공격 → 엽전 직접 수집 → 랜덤 소환 → 3개 자동 합성 → 5성 궁극 진화 → 보스 격파`

### v1.3 주요 변경

- 5성 도깨비 6종에 서로 다른 자동 궁극기 추가
- 첫 5성 탄생 시 카메라 집중, 전용 배너, 광주·파티클·진동 연출
- 보유 도깨비 목록에 합성 진행 `1/3`, `2/3` 표시
- 첫 플레이 전용 3단계 임무와 엽전·삼지선다 선택권 보상
- 유닛·적·축복 데이터를 `src/game-data.js`로 분리
- 효과음 엔진을 `src/sound-engine.js`로 분리
- 프로젝트 루트 문서는 `README.md`, `PROJECT_HANDOFF.md` 두 개만 유지

## 5성 궁극기

- 불씨 깨비 — **적련 백화**: 목표 주변 광역 화염 폭발
- 달서리 깨비 — **월빙 결계**: 넓은 범위 피해와 강력한 빙결
- 바람 갓깨비 — **천풍 만발**: 최대 12개 목표 다중 관통
- 바위 몽둥깨비 — **태산 붕괴**: 대형 범위 피해와 일반 적 밀쳐내기
- 방울 무당깨비 — **백귀 방울춤**: 최대 10개 목표 연쇄 혼령 공격
- 번개 장군깨비 — **천뢰 심판**: 보스를 우선 노리는 고위력 낙뢰와 처형

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

## 조작

### 모바일

- 왼쪽 조이스틱: 이동
- 화면 오른쪽 드래그: 카메라 회전
- 질주: 짧은 고속 이동
- 도깨비불: 주변 광역 공격
- 랜덤 소환: 엽전으로 도깨비 소환

### PC

- 이동: `WASD` 또는 방향키
- 질주: `Space`
- 도깨비불: `Q`
- 소환: `E`
- 다음 웨이브: `Enter`
- 일시정지: `Esc`

## GitHub Pages 배포

기존 Defense 프로젝트에서 확인된 경로를 유지합니다.

- 예상 저장소: `junl-im/Defense`
- Pages 주소: `https://junl-im.github.io/Defense/`
- 빌드 base path: `/Defense/`
- 자동 배포: `.github/workflows/deploy.yml`

GitHub Desktop에서 프로젝트를 저장소에 반영하고 `main` 브랜치에 push하면 Pages 워크플로가 실행됩니다. 실제 GitHub Desktop의 origin 주소가 다르면 실제 주소를 우선합니다.

## Firebase

기존 Defense 프로젝트 설정을 유지합니다.

- 프로젝트 ID: `web-game2`
- Auth Domain: `web-game2.firebaseapp.com`
- 새 랭킹 컬렉션: `dokkaebiScores`

Firebase 연결에 실패해도 로컬 저장으로 플레이할 수 있습니다.

```bash
npm run deploy:rules
npm run deploy
```

같은 Firebase Hosting에 배포하면 기존 Hosting 콘텐츠를 교체할 수 있습니다. 정적 게임은 GitHub Pages, 인증·랭킹은 Firebase 사용을 권장합니다.

## 주요 파일

```text
src/main.js                 Three.js 월드, 전투, 소환, 합성, 궁극기, 웨이브
src/game-data.js            도깨비, 적, 시너지, 축복 데이터
src/sound-engine.js         Web Audio 절차형 효과음
src/style.css               모바일 HUD와 연출 스타일
src/firebase.js             익명 로그인과 온라인 랭킹
public/sw.js                 PWA 캐시
firestore.rules             기존 Defense + 새 랭킹 병합 규칙
PROJECT_HANDOFF.md          전체 기록과 다음 작업 인수인계
```

## 검증

```bash
npm run verify
VITE_BASE_PATH=/Defense/ npm run build
```

검증 항목:

- HTML과 JavaScript DOM ID 연결
- package/runtime 버전 일치
- 루트 Markdown 파일 2개 유지
- GitHub/Firebase 설정 파일 존재
- v1.3 궁극기·진화·초행 임무 코드 존재
- 분리 모듈 존재 및 JavaScript 문법 검사
- Vite 프로덕션 빌드

제작 환경의 Chromium에서는 EGL/ANGLE WebGL 초기화가 되지 않아 자동 3D 화면 캡처가 불가능했습니다. Android Chrome과 iPhone Safari에서 궁극기 프레임, 카메라 연출, 안전 영역을 실제 확인해야 합니다.

## 라이선스

프로젝트 코드는 `LICENSE`를 따릅니다. 3D 모델, UI 장식, 파티클, 효과음은 외부 유료 에셋 없이 코드에서 절차적으로 생성합니다.
