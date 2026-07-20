# 도깨비 운빨 수호대 3D

모바일 브라우저에서 직접 전장을 뛰어다니며 엽전을 줍고, 랜덤 도깨비를 소환·합성하는 Three.js 기반 3D 액션 운빨 디펜스입니다.

현재 버전: **1.5.0 — 부팅 안정화, 전투 가독성, 혼불 성장**

## 핵심 플레이

`이동 → 자동 공격 → 엽전 수집 → 랜덤 소환 → 3개 자동 합성 → 5성 궁극 진화 → 보스 격파 → 혼불 성장`

## v1.5 주요 변경

- 제목 화면 전시 도깨비가 전투 보정값보다 먼저 갱신되어 `unitCooldown` 오류가 발생하던 초기화 순서 수정
- 전투 보정값을 생성하는 `createDefaultMods()`를 추가하고 제목 화면 생성 전에 초기화
- `unitCooldown` 접근에 방어 기본값을 추가하고 정적 검증에 재발 방지 검사 포함
- 겹치는 경고 중 가장 위험한 하나만 골라 회피 방향, 공격 종류, 발동 시간을 표시
- 돌진선, 저주 장판, 보스 도약, 충격파, 백귀 야행진에 회피 안내 제공
- 결과 화면에서 플레이 진행도에 따라 혼불 조각 지급
- 영구 성장 3종 추가: 시작 엽전, 신목 체력, 도깨비 공격력
- 각 영구 특성은 5단계이며 로컬 저장 데이터가 없거나 손상돼도 기본값으로 복구

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

전체 ZIP에는 미리 빌드된 `dist/`가 포함됩니다.

## GitHub Pages 배포

- 저장소: `junl-im/Defense`
- Pages: `https://junl-im.github.io/Defense/`
- base path: `/Defense/`
- 자동 배포: `.github/workflows/deploy.yml`

패치 ZIP 내부 파일을 저장소 루트에 그대로 덮어쓴 뒤 GitHub Desktop에서 commit·push하면 Actions가 빌드하고 배포합니다.

배포 후 최초 확인 주소:

```text
https://junl-im.github.io/Defense/?fresh=1.5.0
```

## Firebase

- 프로젝트 ID: `web-game2`
- Auth Domain: `web-game2.firebaseapp.com`
- 랭킹 컬렉션: `dokkaebiScores`

Firebase 연결이 실패해도 로컬 저장으로 플레이할 수 있습니다.

```bash
npm run deploy:rules
npm run deploy
```

## 주요 파일

```text
src/main.js                 Three.js 월드, 전투, 보스, 위험 안내, 영구 성장
src/game-data.js            도깨비, 적, 시너지, 축복, 계약 데이터
src/sound-engine.js         Web Audio 절차형 효과음
src/style.css               모바일 HUD, 위험 안내, 성장 화면
src/firebase.js             익명 로그인과 온라인 랭킹
public/sw.js                구버전 서비스워커 캐시 제거 스크립트
PROJECT_HANDOFF.md          전체 개발 기록과 다음 작업 인수인계
```

## 검증

```bash
npm run verify
VITE_BASE_PATH=/Defense/ npm run build
```

검증에는 다음이 포함됩니다.

- 105개 HTML·JavaScript DOM 연결
- 제목 화면 생성 전에 `this.mods`가 초기화되는지 확인
- `unitCooldown` 방어 기본값 확인
- package/runtime 버전 일치
- 루트 Markdown 두 개 유지
- 고정 진입 파일 `game.js`, `game.css`
- v1.1~v1.3 구버전 캐시 복구 파일 존재
- 전투 가독성·혼불 성장 코드와 UI 존재

## 패치 ZIP 적용

패치 ZIP에는 변경된 프로젝트 파일만 상대 경로 그대로 들어 있습니다.

1. 패치 ZIP 안의 파일 전체를 GitHub 저장소 루트에 덮어씁니다.
2. `npm install`과 `npm run verify`를 실행합니다.
3. GitHub Desktop으로 commit 후 push합니다.

패치 ZIP에는 `dist/`, `node_modules`, 별도 안내 문서가 없습니다. GitHub Actions가 새 `dist/`를 생성합니다.
