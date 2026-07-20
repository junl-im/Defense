# 도깨비 운빨 수호대 3D

모바일 브라우저에서 바로 플레이하는 Three.js 기반 3D 액션 운빨 디펜스입니다.

현재 버전: **1.2.0 — 요괴 패턴 & 삼지선다 소환 패치**

## 게임 핵심

플레이어가 달빛 야시장을 직접 뛰어다니며 적이 떨어뜨린 엽전을 줍고, 랜덤 도깨비를 소환해 같은 종류·같은 별 3개를 자동 합성합니다.

`이동 → 자동 공격 → 엽전 수집 → 랜덤 소환 → 자동 합성 → 인연 완성 → 축복 선택 → 보스 격파`

### v1.2 신규 기능

- 두억 질주꾼: 붉은 경고선 후 신목으로 돌진하며 플레이어와 충돌 가능
- 저주 무당: 플레이어 위치에 보랏빛 장판을 예고하고, 장판 안 도깨비 공격 속도 감소
- 돌갑옷 귀수: 전방 방패로 투사체 피해 65% 감소, 측후방 공격 유도
- 보스 충격파: 즉발 공격을 피할 수 있는 바닥 예고 링으로 변경
- 삼지선다 부적: 웨이브 3 축복 후보에 반드시 등장
- 선택 소환: 같은 등급의 서로 다른 도깨비 3종 중 하나 선택, 2회 사용
- 프로젝트 루트 문서 정리: `README.md`, `PROJECT_HANDOFF.md`만 유지

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

## 배포

### GitHub Pages

기존 Defense 프로젝트에서 확인된 배포 경로를 유지합니다.

- 예상 저장소: `junl-im/Defense`
- Pages 주소: `https://junl-im.github.io/Defense/`
- 빌드 base path: `/Defense/`
- 자동 배포: `.github/workflows/deploy.yml`

GitHub Desktop에서 이 프로젝트를 저장소에 덮어쓰고 `main` 브랜치에 push하면 Pages 워크플로가 실행됩니다. 실제 GitHub Desktop의 origin 주소가 다르면 그 주소를 우선합니다.

### Firebase

기존 Defense 프로젝트의 Firebase 설정을 유지합니다.

- 프로젝트 ID: `web-game2`
- Auth Domain: `web-game2.firebaseapp.com`
- 랭킹 컬렉션: `dokkaebiScores`

Firebase 설정이 없거나 연결에 실패해도 로컬 저장으로 플레이할 수 있습니다.

```bash
npm run deploy:rules
npm run deploy
```

주의: 같은 Firebase Hosting에 배포하면 기존 Hosting 콘텐츠를 교체할 수 있습니다. 정적 게임은 GitHub Pages, 인증·랭킹은 Firebase 사용을 권장합니다.

## 주요 파일

```text
src/main.js                 게임 전투, 소환, 합성, 적 패턴, 3D 월드
src/style.css               모바일 HUD와 모달 스타일
src/firebase.js             익명 로그인과 온라인 랭킹
public/sw.js                 PWA 캐시
firestore.rules             기존 Defense + 새 랭킹 병합 규칙
PROJECT_HANDOFF.md          전체 작업 기록과 다음 패치 인수인계
```

루트 문서는 두 개만 유지합니다. 패치별 임시 안내 파일은 패치 ZIP 안에만 넣고 프로젝트에는 누적하지 않습니다.

## 검증

```bash
npm run verify
npm run build
```

검증 항목:

- HTML과 JavaScript DOM ID 연결
- package/runtime 버전 일치
- 루트 Markdown 파일 2개 유지
- GitHub/Firebase 설정 파일 존재
- v1.2 적 패턴 및 선택 소환 코드 존재
- JavaScript 문법 검사
- Vite 프로덕션 빌드

현재 제작 환경에서는 Chromium의 WebGL EGL 초기화가 되지 않아 자동 화면 캡처 테스트가 불가능했습니다. Android Chrome과 iPhone Safari에서 터치 감도, 장판 가시성, 프레임을 실제 확인해야 합니다.

## 라이선스

프로젝트 코드는 `LICENSE`를 따릅니다. 3D 모델, UI 장식, 파티클, 효과음은 외부 유료 에셋 없이 코드에서 절차적으로 생성합니다.
